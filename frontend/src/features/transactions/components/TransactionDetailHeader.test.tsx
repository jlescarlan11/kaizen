import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionDetailHeader } from './TransactionDetailHeader'

describe('TransactionDetailHeader', () => {
  const mockTransaction = {
    amount: 1500.5,
    type: 'EXPENSE' as const,
    transactionDate: '2026-03-31T10:00:00Z',
  }

  it('renders the transaction amount with PHP prefix and high-signal typography', () => {
    render(
      <TransactionDetailHeader
        amount={mockTransaction.amount}
        type={mockTransaction.type}
        date={mockTransaction.transactionDate}
      />,
    )

    // Check for amount
    expect(screen.getByText('1,500.50')).toBeInTheDocument()
    // Check for PHP prefix
    expect(screen.getByText('PHP')).toBeInTheDocument()
    // Check for expense indicator (minus sign)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders the transaction amount as positive for income', () => {
    render(
      <TransactionDetailHeader
        amount={1200}
        type="INCOME"
        date={mockTransaction.transactionDate}
      />,
    )

    expect(screen.getByText('1,200.00')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('renders the formatted date and time', () => {
    render(
      <TransactionDetailHeader
        amount={mockTransaction.amount}
        type={mockTransaction.type}
        date={mockTransaction.transactionDate}
      />,
    )

    // The date should be formatted according to en-PH
    // March 31, 2026
    expect(screen.getByText(/March 31, 2026/i)).toBeInTheDocument()
  })
})
