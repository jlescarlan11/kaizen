import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionEntryForm } from './TransactionEntryForm'

// Mock the APIs
vi.mock('../../../app/store/api/transactionApi', () => ({
  useCreateTransactionMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateTransactionMutation: () => [vi.fn(), { isLoading: false }],
  useUploadAttachmentMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteAttachmentMutation: () => [vi.fn(), { isLoading: false }],
  useGetTransactionQuery: () => ({ data: null, isLoading: false }),
}))

vi.mock('../../categories', () => ({
  CategorySelector: ({ label, error }: { label: string; error?: string }) => (
    <div data-testid="category-selector">
      <span>{label}</span>
      {error && <span>{error}</span>}
    </div>
  ),
}))

vi.mock('../../payment-methods/PaymentMethodSelector', () => ({
  PaymentMethodSelector: ({ label, error }: { label: string; error?: string }) => (
    <div data-testid="payment-method-selector">
      <span>{label}</span>
      {error && <span>{error}</span>}
    </div>
  ),
}))

describe('TransactionEntryForm', () => {
  it('shows category selector for EXPENSE and hides it for INCOME', async () => {
    render(<TransactionEntryForm />)

    // Default is EXPENSE
    expect(screen.getByTestId('category-selector')).toBeInTheDocument()

    // Switch to INCOME
    const incomeButton = screen.getByText('Income')
    fireEvent.click(incomeButton)

    expect(screen.queryByTestId('category-selector')).not.toBeInTheDocument()
  })

  it('shows payment method selector for both', () => {
    render(<TransactionEntryForm />)

    expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument()

    const incomeButton = screen.getByText('Income')
    fireEvent.click(incomeButton)

    expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument()
  })
})
