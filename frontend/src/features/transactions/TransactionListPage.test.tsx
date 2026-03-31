import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '../../tests/test-utils'
import { TransactionListPage } from './TransactionListPage'
import { useTransactionPagination } from './hooks/useTransactionPagination'

// Mock dependencies
const mockLoadMore = vi.fn()
vi.mock('./hooks/useTransactionPagination', () => ({
  useTransactionPagination: vi.fn(() => ({
    transactions: [
      { id: 1, amount: 100, type: 'EXPENSE', transactionDate: '2026-03-01T10:00:00Z', description: 'Coffee' },
      { id: 2, amount: 500, type: 'INCOME', transactionDate: '2026-03-02T10:00:00Z', description: 'Salary' },
    ],
    isLoading: false,
    hasMore: true,
    loadMore: mockLoadMore,
  })),
}))

vi.mock('../../shared/hooks/useAuthState', () => ({
  useAuthState: vi.fn(() => ({
    user: { balance: 1000 },
    isAuthenticated: true,
  })),
}))

describe('TransactionListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the new header and removes Total Balance card', () => {
    render(<TransactionListPage />)
    expect(screen.getByText('Transaction History')).toBeInTheDocument()
    expect(screen.queryByText(/^Total Balance$/i)).not.toBeInTheDocument()
  })

  it('renders MoneyFlowDisplay when transactions are present', () => {
    render(<TransactionListPage />)
    expect(screen.getByTestId('money-flow-display')).toBeInTheDocument()
  })

  it('opens Reconcile modal on click', () => {
    render(<TransactionListPage />)
    fireEvent.click(screen.getByText(/Reconcile/i))
    // ReconciliationModal has "Reconcile Balance" title
    expect(screen.getByText(/Reconcile Balance/i)).toBeInTheDocument()
  })

  it('opens Export modal on click', () => {
    render(<TransactionListPage />)
    fireEvent.click(screen.getByText(/Export/i))
    // ExportModal has "Export Transactions" title
    expect(screen.getByText(/Export Transactions/i)).toBeInTheDocument()
  })

  it('updates search query', async () => {
    render(<TransactionListPage />)
    const searchInput = screen.getByPlaceholderText(/Search transactions/i)
    fireEvent.change(searchInput, { target: { value: 'Salary' } })
    expect(searchInput).toHaveValue('Salary')
  })

  it('calls loadMore when Load more button is clicked', () => {
    render(<TransactionListPage />)
    fireEvent.click(screen.getByText(/Load more transactions/i))
    expect(mockLoadMore).toHaveBeenCalled()
  })

  it('renders empty state when no transactions', () => {
    vi.mocked(useTransactionPagination).mockReturnValue({
      transactions: [],
      isLoading: false,
      hasMore: false,
      loadMore: vi.fn(),
    })
    
    render(<TransactionListPage />)
    expect(screen.getByText(/No transactions recorded yet/i)).toBeInTheDocument()
  })
})
