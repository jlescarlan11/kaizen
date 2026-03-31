import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../tests/test-utils'
import { TransactionListPage } from './TransactionListPage'

// Mock dependencies
vi.mock('./hooks/useTransactionPagination', () => ({
  useTransactionPagination: vi.fn(() => ({
    transactions: [
      {
        id: 1,
        amount: 100,
        type: 'EXPENSE',
        transactionDate: '2026-03-01T10:00:00Z',
        description: 'Coffee',
      },
      {
        id: 2,
        amount: 500,
        type: 'INCOME',
        transactionDate: '2026-03-02T10:00:00Z',
        description: 'Salary',
      },
    ],
    isLoading: false,
    hasMore: false,
    loadMore: vi.fn(),
  })),
}))

vi.mock('../../shared/hooks/useAuthState', () => ({
  useAuthState: vi.fn(() => ({
    user: { balance: 1000 },
    isAuthenticated: true,
  })),
}))

describe('TransactionListPage', () => {
  it('renders the new header and removes Total Balance card', () => {
    render(<TransactionListPage />)

    // New header title
    expect(screen.getByText('Transaction History')).toBeInTheDocument()

    // Total Balance card should be GONE (we look for the specific card text or structure)
    // In the old version it was a Card with "Total Balance" text.
    // In the new version, "Total Balance" might still be in MoneyFlowDisplay but not as a main balance card.
    // Wait, MoneyFlowDisplay has "Incoming" and "Outgoing".
    expect(screen.queryByText(/^Total Balance$/i)).not.toBeInTheDocument()
  })

  it('renders MoneyFlowDisplay when transactions are present', () => {
    render(<TransactionListPage />)

    expect(screen.getByTestId('money-flow-display')).toBeInTheDocument()
    expect(screen.getByText(/Incoming/i)).toBeInTheDocument()
    expect(screen.getByText(/Outgoing/i)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<TransactionListPage />)

    expect(screen.getByText(/Reconcile/i)).toBeInTheDocument()
    expect(screen.getByText(/Export/i)).toBeInTheDocument()
    expect(screen.getByText(/View History/i)).toBeInTheDocument()
  })

  it('renders search and filter controls', () => {
    render(<TransactionListPage />)

    expect(screen.getByPlaceholderText(/Search transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/Filter/i)).toBeInTheDocument()
    expect(screen.getByText(/Sort/i)).toBeInTheDocument()
  })
})
