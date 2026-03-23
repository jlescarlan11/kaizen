import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBaseUrl) {
  throw new Error('Missing required VITE_API_BASE_URL environment variable.')
}

if (!/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error(`VITE_API_BASE_URL must be an absolute http(s) URL. Received: "${apiBaseUrl}"`)
}

export const baseApi = createApi({
  reducerPath: 'baseApi',
  tagTypes: ['Sessions', 'Budgets', 'User'],
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      // Ensure we send cookies for session support
      return headers
    },
    credentials: 'include',
  }),
  endpoints: () => ({}),
})
