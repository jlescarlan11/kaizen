import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionEntryForm } from './TransactionEntryForm'
import { useCreateTransactionMutation } from '../../../app/store/api/transactionApi'

// Mock the APIs
vi.mock('../../../app/store/api/transactionApi', () => ({
  useCreateTransactionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateTransactionMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUploadAttachmentMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteAttachmentMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetTransactionQuery: vi.fn(() => ({ data: null, isLoading: false })),
}))

vi.mock('../../categories', () => ({
  CategorySelector: ({
    label,
    error,
    onChange,
  }: {
    label: string
    error?: string
    onChange: (id: string) => void
  }) => (
    <div data-testid="category-selector">
      <span>{label}</span>
      {error && <span>{error}</span>}
      <button type="button" onClick={() => onChange('1')}>
        Select Category
      </button>
    </div>
  ),
}))

vi.mock('../../payment-methods/PaymentMethodSelector', () => ({
  PaymentMethodSelector: ({
    label,
    error,
    onChange,
  }: {
    label: string
    error?: string
    onChange: (id: string) => void
  }) => (
    <div data-testid="payment-method-selector">
      <span>{label}</span>
      {error && <span>{error}</span>}
      <button type="button" onClick={() => onChange('1')}>
        Select Payment Method
      </button>
    </div>
  ),
}))

describe('TransactionEntryForm', () => {
  it('shows category selector for both EXPENSE and INCOME', async () => {
    render(<TransactionEntryForm />)

    // Default is EXPENSE
    expect(screen.getByTestId('category-selector')).toBeInTheDocument()

    // Switch to INCOME
    const incomeButton = screen.getByText('Income')
    fireEvent.click(incomeButton)

    expect(screen.getByTestId('category-selector')).toBeInTheDocument()
  })

  it('shows payment method selector for both', () => {
    render(<TransactionEntryForm />)

    expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument()

    const incomeButton = screen.getByText('Income')
    fireEvent.click(incomeButton)

    expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument()
  })

  it('defaults to the provided initialType', () => {
    render(<TransactionEntryForm initialType="INCOME" />)

    // Now shows category selector for INCOME too
    expect(screen.getByTestId('category-selector')).toBeInTheDocument()
  })

  it('hides transaction type toggle when lockType is true', () => {
    render(<TransactionEntryForm lockType={true} />)

    // Expense and Income buttons should be hidden (or the entire toggle)
    // We check for the buttons
    expect(screen.queryByText('Expense')).not.toBeInTheDocument()
    expect(screen.queryByText('Income')).not.toBeInTheDocument()
  })

  it('hides advanced fields when hideAdvancedFields is true', () => {
    render(<TransactionEntryForm hideAdvancedFields={true} />)

    // Recurring Transaction checkbox should be hidden
    expect(screen.queryByText('Recurring Transaction')).not.toBeInTheDocument()
    // Receipt Picker should be hidden
    // ReceiptPicker doesn't have a label in the mock, but it has a title "Receipt (Optional)"
    expect(screen.queryByText('Receipt (Optional)')).not.toBeInTheDocument()
  })

  it('calls onSuccess callback after successful submit', async () => {
    const onSuccess = vi.fn()
    const createTransaction = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) })

    vi.mocked(useCreateTransactionMutation).mockReturnValue([
      createTransaction,
      { isLoading: false },
    ] as unknown as [typeof createTransaction, { isLoading: boolean }])

    render(<TransactionEntryForm onSuccess={onSuccess} initialType="INCOME" />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })

    // Category and Payment Method are required
    fireEvent.click(screen.getByText('Select Category'))
    fireEvent.click(screen.getByText('Select Payment Method'))

    const saveButton = screen.getByText('Save Transaction')
    fireEvent.click(saveButton)

    // Wait for the mock to be called
    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100, categoryId: 1 }),
      )
    })
  })

  it('calls onSuccess without API call when skipSubmit is true', async () => {
    const onSuccess = vi.fn()
    const createTransaction = vi.fn()

    vi.mocked(useCreateTransactionMutation).mockReturnValue([
      createTransaction,
      { isLoading: false },
    ] as unknown as [typeof createTransaction, { isLoading: boolean }])

    render(<TransactionEntryForm onSuccess={onSuccess} initialType="INCOME" skipSubmit={true} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })
    fireEvent.click(screen.getByText('Select Category'))
    fireEvent.click(screen.getByText('Select Payment Method'))

    const saveButton = screen.getByText('Save Transaction')
    fireEvent.click(saveButton)

    // Wait for the mock to be called
    await waitFor(() => {
      expect(createTransaction).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 100, categoryId: 1 }),
      )
    })
  })

  it('uses custom submit label and hides cancel button', () => {
    render(<TransactionEntryForm submitLabel="Set up budget" hideCancel={true} />)

    expect(screen.getByText('Set up budget')).toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('hides description and notes when hideDescription is true', () => {
    render(<TransactionEntryForm hideDescription={true} />)

    expect(screen.queryByLabelText('Description (Optional)')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Notes (Optional)')).not.toBeInTheDocument()
  })
})
