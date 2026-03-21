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
  budgetSetupSkipped: boolean
  tourCompleted: boolean
  firstTransactionAdded: boolean
}

export interface SkipBudgetSetupPayload {
  skip: boolean
}

export type OnboardingStep = 'BALANCE' | 'BUDGET' | 'COMPLETE'

export interface OnboardingProgressResponse {
  currentStep: OnboardingStep
  balanceValue: number | null
  budgetChoice: string | null
  lastUpdatedAt: string
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
    completeOnboarding: builder.mutation<User, { openingBalance: number }>({
      query: (body) => ({
        url: '/users/onboarding',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to complete onboarding:', error)
        }
      },
    }),
    updateBalance: builder.mutation<User, { openingBalance: number }>({
      query: (body) => ({
        url: '/users/balance',
        method: 'PUT',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to update balance:', error)
        }
      },
    }),
    skipBudgetSetup: builder.mutation<User, SkipBudgetSetupPayload>({
      query: (body) => ({
        url: '/users/skip',
        method: 'PUT',
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to record skip preference:', error)
        }
      },
    }),
    markTourCompleted: builder.mutation<User, void>({
      query: () => ({
        url: '/users/flags/tour/completed',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to mark tour completed:', error)
        }
      },
    }),
    resetTourFlag: builder.mutation<User, void>({
      query: () => ({
        url: '/users/flags/tour/reset',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to reset tour flag:', error)
        }
      },
    }),
    markFirstTransactionAdded: builder.mutation<User, void>({
      query: () => ({
        url: '/users/flags/first-transaction',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials({ user: data }))
        } catch (error) {
          console.error('Failed to mark first transaction added:', error)
        }
      },
    }),
    getOnboardingProgress: builder.query<OnboardingProgressResponse | null, void>({
      query: () => '/users/onboarding/progress',
    }),
    updateOnboardingProgress: builder.mutation<
      OnboardingProgressResponse,
      {
        currentStep: OnboardingStep
        balanceValue?: number
        budgetChoice?: string
      }
    >({
      query: (body) => ({
        url: '/users/onboarding/progress',
        method: 'PUT',
        body,
      }),
    }),
    deleteOnboardingProgress: builder.mutation<void, void>({
      query: () => ({
        url: '/users/onboarding/progress',
        method: 'DELETE',
      }),
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

export const {
  useGetMeQuery,
  useLogoutMutation,
  useCompleteOnboardingMutation,
  useUpdateBalanceMutation,
  useSkipBudgetSetupMutation,
  useGetOnboardingProgressQuery,
  useUpdateOnboardingProgressMutation,
  useDeleteOnboardingProgressMutation,
  useMarkTourCompletedMutation,
  useResetTourFlagMutation,
  useMarkFirstTransactionAddedMutation,
} = authApi
