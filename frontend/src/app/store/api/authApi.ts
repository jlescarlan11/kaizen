import { baseApi } from './baseApi'
import { setCredentials, logout, setLoading } from '../authSlice'

interface User {
  id: string
  name: string
  email: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch {
          dispatch(logout())
        } finally {
          dispatch(setLoading(false))
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logout())
        } catch (error) {
          console.error('Logout failed', error)
        }
      },
    }),
  }),
})

export const { useGetMeQuery, useLogoutMutation } = authApi
