import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { logout } from '../authSlice'
import { db } from '../../../features/transactions/lib/localStore'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBaseUrl) {
  throw new Error('Missing required VITE_API_BASE_URL environment variable.')
}

if (!/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error(`VITE_API_BASE_URL must be an absolute http(s) URL. Received: "${apiBaseUrl}"`)
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers) => headers,
  credentials: 'include',
})

// Guard so a burst of concurrent 401s doesn't trigger the redirect /
// Dexie clear repeatedly mid-tick.
let reauthInFlight = false

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && !reauthInFlight) {
    reauthInFlight = true
    try {
      api.dispatch(logout())
      await db.transactions.clear().catch((err) => {
        // Don't block redirect if Dexie clear fails — log and continue.
        console.error('Failed to clear local transaction cache on 401', err)
      })
      if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
        window.location.href = '/signin'
      }
    } finally {
      // Stays in-flight until the navigation completes; if hard navigation
      // happens, the page reloads and resets the flag implicitly.
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'baseApi',
  tagTypes: [
    'Sessions',
    'Budgets',
    'User',
    'Transactions',
    'Categories',
    'PaymentMethods',
    'Insights',
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
})
