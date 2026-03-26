import { baseApi } from './baseApi'
import { setCredentials, logout, setLoading } from '../authSlice'
import { type OnboardingStep } from '../../../features/onboarding/onboardingStep'
import { type FundingSourceType } from '../../../features/onboarding/fundingSource'

interface User {
  id: string
  name: string
  email: string
  picture?: string
  createdAt: string
  onboardingCompleted: boolean
  balance: number
  budgetSetupSkipped: boolean
  tourCompleted: boolean
  firstTransactionAdded: boolean
  remindersEnabled: boolean
}

export interface OnboardingProgressResponse {
  currentStep: string
  startingFunds: number | null
  fundingSourceType: FundingSourceType | null
  lastUpdatedAt: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          await queryFulfilled
          dispatch(logout())
        } catch (error) {
          console.error('Logout failed', error)
        } finally {
          dispatch(setLoading(false))
        }
      },
    }),
    completeOnboarding: builder.mutation<
      User,
      {
        startingFunds: number
        fundingSourceType: FundingSourceType
        budgets?: { categoryId: number; amount: number; period: string }[]
      }
    >({
      query: (body) => ({
        url: '/users/onboarding',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Budgets'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch (error) {
          console.error('Onboarding completion failed', error)
        } finally {
          dispatch(setLoading(false))
        }
      },
    }),
    skipBudgetSetup: builder.mutation<User, { skip: boolean }>({
      query: (body) => ({
        url: '/users/skip',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch (error) {
          console.error('Skip budget preference update failed', error)
        }
      },
    }),
    markTourCompleted: builder.mutation<User, void>({
      query: () => ({
        url: '/users/flags/tour/completed',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
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
      invalidatesTags: ['User'],
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
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch (error) {
          console.error('Failed to mark first transaction added', error)
        }
      },
    }),
    resetOnboarding: builder.mutation<User, void>({
      query: () => ({
        url: '/users/onboarding/reset',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Budgets'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch (error) {
          console.error('Failed to reset onboarding', error)
        }
      },
    }),
    toggleReminders: builder.mutation<User, { enabled: boolean }>({
      query: (body) => ({
        url: '/users/reminders',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch (error) {
          console.error('Failed to toggle reminders:', error)
        }
      },
    }),
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled
          dispatch(setCredentials({ user }))
        } catch {
          // Silent catch for unauthenticated initial load
          dispatch(setLoading(false))
        }
      },
    }),
    getOnboardingProgress: builder.query<OnboardingProgressResponse | null, void>({
      query: () => '/users/onboarding/progress',
      providesTags: ['User'],
    }),
    updateOnboardingProgress: builder.mutation<
      OnboardingProgressResponse,
      {
        currentStep: OnboardingStep
        startingFunds?: number
        fundingSourceType?: FundingSourceType
      }
    >({
      query: (body) => ({
        url: '/users/onboarding/progress',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteOnboardingProgress: builder.mutation<void, void>({
      query: () => ({
        url: '/users/onboarding/progress',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useLogoutMutation,
  useGetMeQuery,
  useCompleteOnboardingMutation,
  useSkipBudgetSetupMutation,
  useGetOnboardingProgressQuery,
  useUpdateOnboardingProgressMutation,
  useDeleteOnboardingProgressMutation,
  useMarkTourCompletedMutation,
  useResetTourFlagMutation,
  useMarkFirstTransactionAddedMutation,
  useResetOnboardingMutation,
  useToggleRemindersMutation,
} = authApi
