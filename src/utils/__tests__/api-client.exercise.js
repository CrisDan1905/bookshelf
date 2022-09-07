import {server, rest} from 'test/server'
import {client} from '../api-client'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
const apiURL = process.env.REACT_APP_API_URL

jest.mock('react-query')
jest.mock('auth-provider')

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)
  expect(result).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const token = 'fake token'
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  let request

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, {token})
  expect(request.headers.get('Authorization')).toContain(token)
})

test('allows for config overrides', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  let request

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )
  const customConfig = {
    mode: 'cors',
    headers: {
      Expires: 'Wed, 21 Oct 2015 07:28:00 GMT',
      'Content-Type': 'text/xml',
      Age: '24',
    },
  }

  await client(endpoint, customConfig)

  expect(request.mode).toEqual(customConfig.mode)
  expect(request.headers.get('Expires')).toEqual(customConfig.headers.Expires)
  expect(request.headers.get('Content-Type')).toEqual(
    customConfig.headers['Content-Type'],
  )
  expect(request.headers.get('Age')).toEqual(customConfig.headers.Age)
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const data = {value: 'test body data'}
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  let request

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, {data})

  expect(request.body).toEqual(data)
})

test('the promise is rejected from the server and the client promise is rejected', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(400), ctx.json(mockResult))
    }),
  )

  await expect(client(endpoint)).rejects.toEqual(mockResult)
})

test('the server response with an 401 (Unauthorized) response and the cache is cleared', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json(mockResult))
    }),
  )

  try {
    await client(endpoint)
  } catch (error) {
    expect(error.message).toMatchInlineSnapshot(`"Please re-authenticate."`)
    expect(queryCache.clear).toHaveBeenCalled()
    expect(auth.logout).toHaveBeenCalled()
  }
})
