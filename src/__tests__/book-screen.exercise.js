// 🐨 here are the things you're going to need for this test:
import * as React from 'react'
import {buildBook, buildListItem} from 'test/generate'
import {App} from 'app'
import * as booksDB from 'test/data/books'
import {formatDate} from 'utils/misc'
import {
  loginAsUser,
  render,
  screen,
  userEvent,
  waitForLoadingToFinish,
} from 'test/app-test-utils'
import * as listItemsDB from 'test/data/list-items'
import faker from 'faker'
import {server, rest} from 'test/server'

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})
const apiURL = process.env.REACT_APP_API_URL

async function renderBookScreen({user, book, listItem} = {}) {
  user = user === undefined ? await loginAsUser() : user
  book = book === undefined ? await booksDB.create(buildBook()) : book
  listItem =
    listItem === undefined
      ? await listItemsDB.create(buildListItem({owner: user, book}))
      : listItem
  const route = `/book/${book.id}`

  const returningRenderValue = await render(<App />, {user, route})

  return {book, listItem, ...returningRenderValue}
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

  expect(screen.getByText(book.title)).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textarea', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  await userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.queryByRole('textbox', {name: /notes/i})).toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(Date.now()))

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  jest.useFakeTimers()

  await renderBookScreen()

  const removeFromListButton = screen.getByRole('button', {
    name: /remove from list/i,
  })
  await fakeTimerUserEvent.click(removeFromListButton)
  expect(removeFromListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const {listItem} = await renderBookScreen()

  const markAsReadButton = screen.getByRole('button', {name: /mark as read/i})
  await fakeTimerUserEvent.click(markAsReadButton)
  expect(markAsReadButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.queryAllByRole('radio', {name: /star/i})).toHaveLength(5)

  const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDateNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
  )

  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can edit a note', async () => {
  jest.useFakeTimers()

  const {listItem} = await renderBookScreen()

  const newNotes = faker.lorem.words()
  const notesTextarea = screen.queryByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesTextarea)
  await fakeTimerUserEvent.type(notesTextarea, newNotes)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(notesTextarea).toHaveValue(newNotes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({
    notes: newNotes,
  })
})

describe('console errors', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  test('shows an error message when the book fails to load', async () => {
    await renderBookScreen({book: {id: 'BAD_ID'}, listItem: null})

    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
      `"There was an error: Book not found"`,
    )
  })

  test('note update failures are displayed', async () => {
    jest.useFakeTimers()

    const {listItem} = await renderBookScreen()

    const testErrorMessage = '__test_error_message__'
    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({status: 400, message: testErrorMessage}),
        )
      }),
    )

    const newNotes = faker.lorem.words()
    const notesTextarea = screen.queryByRole('textbox', {name: /notes/i})

    await fakeTimerUserEvent.clear(notesTextarea)
    await fakeTimerUserEvent.type(notesTextarea, newNotes)

    await screen.findByLabelText(/loading/i)
    await waitForLoadingToFinish()

    expect(notesTextarea).toHaveValue(newNotes)

    expect(await listItemsDB.read(listItem.id)).not.toMatchObject({
      notes: newNotes,
    })

    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
      `"There was an error: __test_error_message__"`,
    )
  })
})
