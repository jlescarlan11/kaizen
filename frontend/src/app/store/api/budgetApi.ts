import { baseApi } from './baseApi'
import type { BudgetPeriod } from '../../../features/budgets/constants'

export interface BudgetCreatePayload {
  categoryId: number
  amount: number
  period: BudgetPeriod
}

export interface SmartBudgetPayload {
  budgets: BudgetCreatePayload[]
}

export interface BudgetResponse {
  id: number
  userId: number
  categoryId: number
  categoryName: string
  amount: number
  expense: number
  burnRate: number | null
  dailyAllowance: number | null
  projectedTotal: number | null
  daysElapsed: number | null
  daysLeft: number | null
  period: BudgetPeriod
  createdAt: string
  updatedAt: string
}

export interface BudgetCountResponse {
  count: number
}

export interface BudgetSummaryResponse {
  balance: number
  totalAllocated: number
  totalSpent: number
  unallocated: number
  allocationPercentage: number
  budgetCount: number
}

export const budgetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveSmartBudgets: builder.mutation<BudgetResponse[], SmartBudgetPayload>({
      query: (payload) => ({
        url: '/budgets/batch',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Budgets', 'User'],
    }),
    createBudget: builder.mutation<BudgetResponse, BudgetCreatePayload>({
      query: (payload) => ({
        url: '/budgets',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Budgets', 'User'],
    }),
    getBudgetCount: builder.query<BudgetCountResponse, void>({
      query: () => '/budgets/count',
      keepUnusedDataFor: 60,
      providesTags: ['Budgets'],
    }),
    getBudgetSummary: builder.query<BudgetSummaryResponse, void>({
      query: () => '/budgets/summary',
      keepUnusedDataFor: 60,
      providesTags: ['Budgets', 'User'],
    }),
    getBudgets: builder.query<BudgetResponse[], void>({
      query: () => '/budgets',
      providesTags: ['Budgets'],
    }),
    processInitialInjection: builder.mutation<void, void>({
      query: () => ({
        url: '/budgets/initial-injection',
        method: 'POST',
      }),
      invalidatesTags: ['Budgets', 'User'],
    }),
  }),
})

export const {
  useSaveSmartBudgetsMutation,
  useCreateBudgetMutation,
  useGetBudgetCountQuery,
  useGetBudgetSummaryQuery,
  useGetBudgetsQuery,
  useProcessInitialInjectionMutation,
} = budgetApi
