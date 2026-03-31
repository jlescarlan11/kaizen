import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../tests/test-utils'
import { TransactionDetailPage } from './TransactionDetailPage'
import { useGetTransactionQuery } from '../../app/store/api/transactionApi'

// Mock the API hook
vi.mock('../../app/store/api/transactionApi', () => ({
  useGetTransactionQuery: vi.fn(),
}))

describe('TransactionDetailPage', () => {
  const mockTransaction = {
    id: 1,
    amount: 1500.5,
    type: 'EXPENSE',
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
  }

  it('renders the transaction details correctly', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: mockTransaction,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)

    // Check for core information
    expect(screen.getByText('1,500.50')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Dinner at Jollibee')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useGetTransactionQuery>)

    const { container } = render(<TransactionDetailPage />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders error state when transaction not found', () => {
    vi.mocked(useGetTransactionQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 404 },
    } as ReturnType<typeof useGetTransactionQuery>)

    render(<TransactionDetailPage />)
    expect(screen.getByText(/Transaction not found/i)).toBeInTheDocument()
  })
})
