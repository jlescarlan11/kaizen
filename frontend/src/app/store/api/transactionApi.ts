import { baseApi } from './baseApi'
import type { CategoryResponse } from './categoryApi'
import type { PaymentMethod } from '../../../features/payment-methods/types'

export type TransactionType = 'INCOME' | 'EXPENSE' | 'RECONCILIATION'

export interface TransactionRequest {
  amount: number
  type: TransactionType
  transactionDate?: string
  description?: string
  categoryId?: number
  paymentMethodId?: number
  notes?: string
}

export interface TransactionResponse {
  id: number
  amount: number
  type: TransactionType
  transactionDate: string
  description: string
  category?: CategoryResponse
  paymentMethod?: PaymentMethod
  reconciliationIncrease?: boolean
  notes?: string
  attachments?: AttachmentResponse[]
}

export interface AttachmentResponse {
  id: number
  filename: string
  fileSize: number
  mimeType: string
  storageReference: string
}

export interface ReconciliationRequest {
  realWorldBalance: number
  description?: string
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

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<TransactionResponse, TransactionRequest>({
      query: (payload) => ({
        url: '/transactions',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'User', { type: 'PaymentMethods', id: 'SUMMARY' }],
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
      invalidatesTags: ['Transactions', 'User', { type: 'PaymentMethods', id: 'SUMMARY' }],
    }),
    deleteTransaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transactions', 'User', { type: 'PaymentMethods', id: 'SUMMARY' }],
    }),
    bulkDeleteTransactions: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: '/transactions/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Transactions', 'User', { type: 'PaymentMethods', id: 'SUMMARY' }],
    }),
    reconcileBalance: builder.mutation<TransactionResponse, ReconciliationRequest>({
      query: (payload) => ({
        url: '/transactions/reconcile',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Transactions', 'User', { type: 'PaymentMethods', id: 'SUMMARY' }],
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
      ],
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
  useReconcileBalanceMutation,
  useGetBalanceHistoryQuery,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} = transactionApi
