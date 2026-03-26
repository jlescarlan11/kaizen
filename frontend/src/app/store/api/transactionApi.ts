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
  }),
})

export const { useCreateTransactionMutation, useGetTransactionsQuery } = transactionApi
