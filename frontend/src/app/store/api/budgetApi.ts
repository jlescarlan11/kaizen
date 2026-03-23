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
  remainingToAllocate: number
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
      invalidatesTags: ['Budgets'],
    }),
    createBudget: builder.mutation<BudgetResponse, BudgetCreatePayload>({
      query: (payload) => ({
        url: '/budgets',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Budgets'],
    }),
    getBudgetCount: builder.query<BudgetCountResponse, void>({
      query: () => '/budgets/count',
      keepUnusedDataFor: 60,
      providesTags: ['Budgets'],
    }),
    getBudgetSummary: builder.query<BudgetSummaryResponse, void>({
      query: () => '/budgets/summary',
      keepUnusedDataFor: 60,
      providesTags: ['Budgets'],
    }),
    getBudgets: builder.query<BudgetResponse[], void>({
      query: () => '/budgets',
      providesTags: ['Budgets'],
    }),
  }),
})

export const {
  useSaveSmartBudgetsMutation,
  useCreateBudgetMutation,
  useGetBudgetCountQuery,
  useGetBudgetSummaryQuery,
  useGetBudgetsQuery,
} = budgetApi
