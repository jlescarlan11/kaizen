import { baseApi } from './baseApi'
import type {
  PaymentMethod,
  PaymentMethodCreatePayload,
} from '../../../features/payment-methods/types'
import type { PaymentMethodSummary } from '../../../features/payment-methods/api'

export const paymentMethodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment-methods',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PaymentMethods' as const, id })),
              { type: 'PaymentMethods', id: 'LIST' },
            ]
          : [{ type: 'PaymentMethods', id: 'LIST' }],
    }),
    createPaymentMethod: builder.mutation<PaymentMethod, PaymentMethodCreatePayload>({
      query: (payload) => ({
        url: '/payment-methods',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'PaymentMethods', id: 'LIST' }],
    }),
    deletePaymentMethod: builder.mutation<void, number>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PaymentMethods', id: 'LIST' },
        { type: 'PaymentMethods', id },
        { type: 'Transactions' }, // Deleting method affects transactions
      ],
    }),
    getPaymentMethodTransactionCount: builder.query<number, number>({
      query: (id) => `/payment-methods/${id}/transaction-count`,
    }),
    getPaymentMethodSummary: builder.query<PaymentMethodSummary[], void>({
      query: () => '/payment-methods/summary',
      providesTags: (result) =>
        result
          ? [
              ...result
                .filter((s) => s.paymentMethod)
                .map((s) => ({ type: 'PaymentMethods' as const, id: s.paymentMethod!.id })),
              { type: 'PaymentMethods', id: 'SUMMARY' },
            ]
          : [{ type: 'PaymentMethods', id: 'SUMMARY' }],
    }),
  }),
})

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentMethodTransactionCountQuery,
  useGetPaymentMethodSummaryQuery,
} = paymentMethodApi
