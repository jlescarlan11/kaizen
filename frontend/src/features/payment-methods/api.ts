import type { PaymentMethod, PaymentMethodCreatePayload } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await fetch(`${API_BASE_URL}/payment-methods`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods')
  }
  return response.json()
}

export async function createPaymentMethod(
  payload: PaymentMethodCreatePayload,
): Promise<PaymentMethod> {
  const response = await fetch(`${API_BASE_URL}/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create payment method')
  }

  return response.json()
}

export async function deletePaymentMethod(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/payment-methods/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to delete payment method')
  }
}

export async function getPaymentMethodTransactionCount(id: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/payment-methods/${id}/transaction-count`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch transaction count')
  }
  return response.json()
}

export interface PaymentMethodSummary {
  paymentMethod: PaymentMethod | null
  totalAmount: number
}

export async function getPaymentMethodSummary(): Promise<PaymentMethodSummary[]> {
  const response = await fetch(`${API_BASE_URL}/payment-methods/summary`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to fetch payment method summary')
  }
  return response.json()
}
