import { baseApi } from './baseApi'
import type { CategoryResponse } from './categoryApi'
import type { PaymentMethod } from '../../../features/payment-methods/types'

export type TransactionType = 'INCOME' | 'EXPENSE'
export type FrequencyUnit = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface TransactionRequest {
  amount: number
  type: TransactionType
  transactionDate?: string
  description?: string
  categoryId?: number
  paymentMethodId?: number
  notes?: string
  isRecurring?: boolean
  frequencyUnit?: FrequencyUnit
  frequencyMultiplier?: number
  clientGeneratedId?: string
  remindersEnabled?: boolean
  parentRecurringTransactionId?: number
}

export interface TransactionResponse {
  id: number
  amount: number
  type: TransactionType
  transactionDate: string
  description: string
  category?: CategoryResponse
  paymentMethod?: PaymentMethod
  notes?: string
  isRecurring?: boolean
  frequencyUnit?: FrequencyUnit
  frequencyMultiplier?: number
  remindersEnabled?: boolean
  attachments?: AttachmentResponse[]
}

export interface AttachmentResponse {
  id: number
  filename: string
  fileSize: number
  mimeType: string
  storageReference: string
}

export interface BalanceHistoryEntry {
  date: string
  balance: number
  eventDescription: string
  transactionId: number
  transactionType: TransactionType
}

export interface BalanceHistoryResponse {
  history: BalanceHistoryEntry[]
}

export interface TransactionFilters {
  search?: string
  categoryIds?: number[]
  paymentMethodIds?: number[]
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  types?: TransactionType[]
  category?: number[] // New API param
  account?: number[] // New API param
  type?: TransactionType[] // New API param
  from?: string // New API param
  to?: string // New API param
  lastDate?: string
  lastId?: number
  pageSize?: number
}

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<TransactionResponse, TransactionRequest>({
      query: (payload) => ({
        url: '/transactions',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        'Transactions',
        'User',
        'Insights',
        { type: 'PaymentMethods', id: 'SUMMARY' },
      ],
    }),
    getTransactions: builder.query<TransactionResponse[], TransactionFilters | void>({
      query: (params) => {
        const queryParams: Record<string, unknown> = { ...(params as Record<string, unknown>) }

        // Map old params to new names for backend compatibility
        if (params) {
          if (params.categoryIds) queryParams.category = params.categoryIds
          if (params.paymentMethodIds) queryParams.account = params.paymentMethodIds
          if (params.types) queryParams.type = params.types
          if (params.startDate) queryParams.from = params.startDate
          if (params.endDate) queryParams.to = params.endDate

          // Remove old names to clean up the request
          delete queryParams.categoryIds
          delete queryParams.paymentMethodIds
          delete queryParams.types
          delete queryParams.startDate
          delete queryParams.endDate
        }

        return {
          url: '/transactions',
          params: queryParams,
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Transactions' as const, id })), 'Transactions']
          : ['Transactions'],
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
      invalidatesTags: [
        'Transactions',
        'User',
        'Insights',
        { type: 'PaymentMethods', id: 'SUMMARY' },
      ],
    }),
    deleteTransaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'Transactions',
        'User',
        'Insights',
        { type: 'PaymentMethods', id: 'SUMMARY' },
      ],
    }),
    bulkDeleteTransactions: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/transactions/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [
        'Transactions',
        'User',
        'Insights',
        { type: 'PaymentMethods', id: 'SUMMARY' },
      ],
    }),
    getBalanceHistory: builder.query<BalanceHistoryResponse, void>({
      query: () => '/transactions/history',
      providesTags: ['Transactions'],
    }),
    uploadAttachment: builder.mutation<AttachmentResponse, { transactionId: number; file: File }>({
      query: ({ transactionId, file }) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: `/transactions/${transactionId}/attachments`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { transactionId }) => [
        { type: 'Transactions', id: transactionId },
        'Transactions',
        'Insights',
      ],
    }),
    deleteAttachment: builder.mutation<void, { transactionId: number; attachmentId: number }>({
      query: ({ attachmentId }) => ({
        url: `/transactions/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { transactionId }) => [
        { type: 'Transactions', id: transactionId },
        'Transactions',
        'Insights',
      ],
    }),
  }),
})

export const {
  useCreateTransactionMutation,
  useGetTransactionsQuery,
  useLazyGetTransactionsQuery,
  useGetTransactionQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useBulkDeleteTransactionsMutation,
  useGetBalanceHistoryQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = transactionApi
