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

export interface CategoryCreatePayload {
  name: string
  icon: string
  color: string
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
    createCategory: builder.mutation<CategoryResponse, CategoryCreatePayload>({
      query: (payload) => ({
        url: '/categories',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<
      CategoryResponse,
      { categoryId: number; payload: CategoryCreatePayload }
    >({
      query: ({ categoryId, payload }) => ({
        url: `/categories/${categoryId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryTransactionCountQuery,
  useMergeCategoriesMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} = categoryApi
