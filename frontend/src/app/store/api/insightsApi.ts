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
    getSpendingSummary: builder.query<
      SpendingSummary,
      { start: string; end: string; paymentMethodIds?: number[] }
    >({
      query: ({ paymentMethodIds, ...params }) => ({
        url: '/insights/summary',
        params: {
          ...params,
          paymentMethodIds: paymentMethodIds?.join(','),
        },
      }),
      providesTags: ['Insights'],
    }),
    getCategoryBreakdown: builder.query<
      CategoryBreakdown,
      { start: string; end: string; paymentMethodIds?: number[] }
    >({
      query: ({ paymentMethodIds, ...params }) => ({
        url: '/insights/category-breakdown',
        params: {
          ...params,
          paymentMethodIds: paymentMethodIds?.join(','),
        },
      }),
      providesTags: ['Insights'],
    }),
    getSpendingTrends: builder.query<
      TrendSeries,
      { start: string; end: string; granularity: Granularity; paymentMethodIds?: number[] }
    >({
      query: ({ paymentMethodIds, ...params }) => ({
        url: '/insights/trends',
        params: {
          ...params,
          paymentMethodIds: paymentMethodIds?.join(','),
        },
      }),
      providesTags: ['Insights'],
    }),
    getBalanceTrends: builder.query<
      BalanceTrendSeries,
      { start: string; end: string; granularity: Granularity; paymentMethodIds?: number[] }
    >({
      query: ({ paymentMethodIds, ...params }) => ({
        url: '/insights/balance-trends',
        params: {
          ...params,
          paymentMethodIds: paymentMethodIds?.join(','),
        },
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
