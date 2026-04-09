import { baseApi } from './baseApi'
import type {
  BalanceTrendSeries,
  CategoryBreakdown,
  Granularity,
  SpendingSummary,
  TrendSeries,
} from '../../../features/insights/types'

export const insightsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpendingSummary: builder.query<SpendingSummary, { start: string; end: string }>({
      query: (params) => ({
        url: '/insights/summary',
        params,
      }),
      providesTags: ['Insights'],
    }),
    getCategoryBreakdown: builder.query<CategoryBreakdown, { start: string; end: string }>({
      query: (params) => ({
        url: '/insights/category-breakdown',
        params,
      }),
      providesTags: ['Insights'],
    }),
    getSpendingTrends: builder.query<
      TrendSeries,
      { start: string; end: string; granularity: Granularity }
    >({
      query: (params) => ({
        url: '/insights/trends',
        params,
      }),
      providesTags: ['Insights'],
    }),
    getBalanceTrends: builder.query<
      BalanceTrendSeries,
      { start: string; end: string; granularity: Granularity }
    >({
      query: (params) => ({
        url: '/insights/balance-trends',
        params,
      }),
      providesTags: ['Insights'],
    }),
  }),
})

export const {
  useGetSpendingSummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetSpendingTrendsQuery,
  useGetBalanceTrendsQuery,
} = insightsApi
