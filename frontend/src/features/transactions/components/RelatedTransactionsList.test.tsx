import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { RelatedTransactionsList } from './RelatedTransactionsList'

describe('RelatedTransactionsList', () => {
  const mockTransactions = [
    {
      id: 2,
      amount: 100,
      type: 'EXPENSE' as const,
      transactionDate: '2026-03-30T10:00:00Z',
      description: 'Coffee',
      category: { id: 1, name: 'Food', icon: 'food', color: '#FF0000' },
    },
    {
      id: 3,
      amount: 200,
      type: 'EXPENSE' as const,
      transactionDate: '2026-03-29T10:00:00Z',
      description: 'Lunch',
      category: { id: 1, name: 'Food', icon: 'food', color: '#FF0000' },
    },
  ]

  it('renders the list of related transactions', () => {
    render(<RelatedTransactionsList transactions={mockTransactions} isLoading={false} />)

    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
    // Using a more flexible matcher for broken up text
    expect(screen.getByText(/100\.00/)).toBeInTheDocument()
    expect(screen.getByText(/200\.00/)).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<RelatedTransactionsList transactions={[]} isLoading={true} />)

    expect(screen.getByTestId('related-loading')).toBeInTheDocument()
  })

  it('renders empty state when no transactions', () => {
    render(<RelatedTransactionsList transactions={[]} isLoading={false} />)

    expect(screen.getByText(/No related transactions found/i)).toBeInTheDocument()
  })
})
