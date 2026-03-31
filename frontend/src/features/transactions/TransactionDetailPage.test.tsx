import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '../../tests/test-utils'
import { TransactionDetailPage } from './TransactionDetailPage'
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useCreateTransactionMutation,
  useGetTransactionsQuery,
} from '../../app/store/api/transactionApi'

// Mock the API hook
vi.mock('../../app/store/api/transactionApi', () => ({
  useGetTransactionQuery: vi.fn(),
  useDeleteTransactionMutation: vi.fn(),
  useCreateTransactionMutation: vi.fn(),
  useGetTransactionsQuery: vi.fn(),
}))

describe('TransactionDetailPage', () => {
  const mockTransaction = {
    id: 1,
    amount: 1500.5,
    type: 'EXPENSE' as const,
    transactionDate: '2026-03-31T10:00:00Z',
    description: 'Dinner at Jollibee',
    notes: 'Very delicious',
    category: {
      id: 1,
      name: 'Food',
      icon: 'food',
      color: '#FF0000',
    },
    paymentMethod: {
      id: 1,
      name: 'Cash',
    },
    attachments: [],
  }

  const mockDelete = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) })
  const mockCreate = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDeleteTransactionMutation).mockReturnValue([
      mockDelete,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useDeleteTransactionMutation>)
    vi.mocked(useCreateTransactionMutation).mockReturnValue([
      mockCreate,
      { isLoading: false },
    ] as unknown as ReturnType<typeof useCreateTransactionMutation>)
    vi.mocked(useGetTransactionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useGetTransactionsQuery>)
  })

  it('renders the transaction details correctly', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)

    // Check for core information
    expect(screen.getByText('1,500.50')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Dinner at Jollibee')).toBeInTheDocument()
  })

  it('opens delete modal when delete is clicked', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    expect(
      screen.getByText(/Are you sure you want to delete this transaction/i),
    ).toBeInTheDocument()
  })

  it('calls delete mutation when confirmed', async () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))

    // Find the delete button in the modal footer
    const confirmDeleteButton = screen.getAllByRole('button', { name: /Delete/i })[1]
    fireEvent.click(confirmDeleteButton)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(mockTransaction.id)
    })
  })

  it('calls create mutation for duplication', async () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  it('renders loading state', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    const { container } = render(<TransactionDetailPage />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders error state when transaction not found', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 404 },
    } as unknown as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)
    expect(screen.getByText(/Transaction not found/i)).toBeInTheDocument()
  })
})
