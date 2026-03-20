import { baseApi } from './baseApi'
import { setCredentials, logout, setLoading } from '../authSlice'

interface User {
  id: string
  name: string
  email: string
  picture?: string
  createdAt: string
  onboardingCompleted: boolean
  openingBalance: number
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
          // 1. Wait for server-side invalidation
          await queryFulfilled
        } catch (error) {
          // 2. If server fails, we still must clear the client state
          // to satisfy the requirement of not staying in a half-logged-out state.
          console.error('Server-side logout failed, forcing client-side cleanup:', error)
        } finally {
          // 3. Clear Redux auth state
          dispatch(logout())

          // 4. Clear browser storage artifacts
          try {
            localStorage.clear()
            sessionStorage.clear()
          } catch (storageError) {
            console.warn('Storage cleanup failed:', storageError)
          }
        }
      },
    }),
  }),
})

export const { useGetMeQuery, useLogoutMutation } = authApi
