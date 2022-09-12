// 🐨 We'll use renderHook rather than render here
import {renderHook, act} from '@testing-library/react'
import {useAsync} from '../hooks'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

function getAsyncState(overrides = {}) {
  return {
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
    ...overrides
  }
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(getAsyncState())

  act(() => {
    result.current.run(promise)
  })
  expect(result.current).toEqual(
    getAsyncState({
      isLoading: true,
      isIdle: false,
      status: 'pending',
    }))

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    await resolve(resolvedValue)
  })
  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isSuccess: true,
      status: 'resolved',
      data: resolvedValue,
    })
  )

  act(() => {
    result.current.reset()
  })
  expect(result.current).toEqual(
    getAsyncState()
  )
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  const errorMessage = 'test error'

  let p
  act(() => {
    p = result.current.run(promise)
  })

  p.catch(() => {
    expect(result.current).toEqual(
      getAsyncState({
        isIdle: false,
        isLoading: false,
        isError: true,
        error: errorMessage,
        status: 'rejected',
      })
    )
  })

  await act(async () => {
    await reject(errorMessage)
  })
})

test('can specify an initial state', () => {
  const mockData = Symbol('mocked initial data')
  const customInitialState = {
    status: 'resolved',
    data: mockData,
  }
  const {result} = renderHook(() => useAsync(customInitialState))
  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: false,
      isSuccess: true,
      status: 'resolved',
      data: mockData,
    })
  )
})

test('can set the data', () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    getAsyncState()
  )

  const mockData = Symbol('mocked data')
  act(() => {
    result.current.setData(mockData)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isSuccess: true,
      status: 'resolved',
      data: mockData,
    })
  )
})

test('can set the error', () => {
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(
    getAsyncState()
  )

  const mockError = Symbol('mocked error')
  act(() => {
    result.current.setError(mockError)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isError: true,
      error: mockError,
      status: 'rejected',
    })
  )
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  jest.spyOn(console, 'error')

  act(() => {
    result.current.run(promise)
  })
  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    })
  )

  unmount()

  const mockData = Symbol('mocked data')
  await act(async () => {
    await resolve(mockData)
  })

  expect(console.error).not.toHaveBeenCalled()
  console.error.mockRestore()
})

test('calling "run" without a promise results in an early error', () => {
  const {result} = renderHook(() => useAsync())

  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
