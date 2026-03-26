import { baseApi } from './baseApi'
import type { CategoryResponse } from './categoryApi'

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface TransactionRequest {
  amount: number
  type: TransactionType
  transactionDate?: string
  description?: string
  categoryId?: number
}

export interface TransactionResponse {
  id: number
  amount: number
  type: TransactionType
  transactionDate: string
  description: string
  category?: CategoryResponse
}

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<TransactionResponse, TransactionRequest>({
      query: (payload) => ({
        url: '/transactions',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'User'],
    }),
    getTransactions: builder.query<TransactionResponse[], void>({
      query: () => '/transactions',
      providesTags: ['Transactions'],
    }),
    getTransaction: builder.query<TransactionResponse, number>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transactions', id }],
    }),
    updateTransaction: builder.mutation<
      TransactionResponse,
      { id: number; payload: TransactionRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'User'],
    }),
    deleteTransaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'User'],
    }),
    bulkDeleteTransactions: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/transactions/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Transactions', 'User'],
    }),
  }),
})

export const {
  useCreateTransactionMutation,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useBulkDeleteTransactionsMutation,
} = transactionApi
