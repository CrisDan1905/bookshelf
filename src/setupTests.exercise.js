import '@testing-library/jest-dom'
import {server} from 'test/server'
import {queryCache} from 'react-query'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import * as auth from 'auth-provider'
import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

// we don't need the profiler in tests
jest.mock('components/profiler')

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterAll(() => server.close())

afterEach(async () => {
    server.resetHandlers()
    queryCache.clear()

    await Promise.all([
        await auth.logout(),
        await usersDB.reset(),
        await booksDB.reset(),
        await listItemsDB.reset()
    ])
})

// real times is a good default to start, individual tests can
// enable fake timers if they need, and if they have, then we should
// run all the pending timers (in `act` because this can trigger state updates)
// then we'll switch back to realTimers.
// it's important this comes last here because jest runs afterEach callbacks
// in reverse order and we want this to be run first so we get back to real timers
// before any other cleanup
afterEach(async () => {
    // waitFor is important here. If there are queries that are being fetched at
    // the end of the test and we continue on to the next test before waiting for
    // them to finalize, the tests can impact each other in strange ways.
    await waitFor(() => expect(queryCache.isFetching).toBe(0))
    if (jest.isMockFunction(setTimeout)) {
        act(() => jest.runOnlyPendingTimers())
        jest.useRealTimers()
    }
})
