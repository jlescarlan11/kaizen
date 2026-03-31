import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionDetailInfo } from './TransactionDetailInfo'

describe('TransactionDetailInfo', () => {
  const mockTransaction = {
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
    type: 'EXPENSE' as const,
  }

  it('renders category and payment method correctly', () => {
    render(
      <TransactionDetailInfo
        category={mockTransaction.category}
        paymentMethod={mockTransaction.paymentMethod}
        type={mockTransaction.type}
      />,
    )

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
  })

  it('renders flow indicator correctly for expense', () => {
    render(
      <TransactionDetailInfo
        category={mockTransaction.category}
        paymentMethod={mockTransaction.paymentMethod}
        type="EXPENSE"
      />,
    )

    expect(screen.getByText(/Expense/i)).toBeInTheDocument()
    expect(screen.getByText(/Outgoing/i)).toBeInTheDocument()
  })

  it('renders flow indicator correctly for income', () => {
    render(
      <TransactionDetailInfo
        category={mockTransaction.category}
        paymentMethod={mockTransaction.paymentMethod}
        type="INCOME"
      />,
    )

    expect(screen.getByText(/Income/i)).toBeInTheDocument()
    expect(screen.getByText(/Incoming/i)).toBeInTheDocument()
  })
})
