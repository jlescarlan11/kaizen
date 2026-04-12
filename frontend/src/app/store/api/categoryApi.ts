import { baseApi } from './baseApi'
import { type TransactionType } from './transactionApi'

export interface CategoryResponse {
  id: number
  name: string
  isGlobal: boolean
  icon: string
  color: string
  type: TransactionType
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    getCategoryTransactionCount: builder.query<number, number>({
      query: (categoryId) => `/categories/${categoryId}/transactions/count`,
    }),
    mergeCategories: builder.mutation<void, { sourceId: number; targetId: number }>({
      query: (payload) => ({
        url: '/categories/merge',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Categories', 'Transactions'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryTransactionCountQuery,
  useMergeCategoriesMutation,
} = categoryApi
