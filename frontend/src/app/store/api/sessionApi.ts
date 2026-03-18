import { baseApi } from './baseApi'

export interface Session {
  id: number
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSessions: builder.query<Session[], void>({
      query: () => '/auth/sessions',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sessions' as const, id })),
              { type: 'Sessions', id: 'LIST' },
            ]
          : [{ type: 'Sessions', id: 'LIST' }],
    }),
    revokeSession: builder.mutation<void, number>({
      query: (id) => ({
        url: `/auth/sessions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Sessions', id: 'LIST' }],
    }),
  }),
})

export const { useGetSessionsQuery, useRevokeSessionMutation } = sessionApi
