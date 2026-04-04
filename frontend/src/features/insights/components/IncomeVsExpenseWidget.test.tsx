import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { IncomeVsExpenseWidget } from './IncomeVsExpenseWidget'

const mockSummary = {
  totalIncome: 50000,
  totalExpenses: 35000,
  netBalance: 15000,
}

describe('IncomeVsExpenseWidget', () => {
  it('renders loading state', () => {
    const { container } = render(<IncomeVsExpenseWidget summary={undefined} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeDefined()
  })

  it('renders income and expense data correctly', () => {
    render(<IncomeVsExpenseWidget summary={mockSummary} isLoading={false} />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('+50,000.00')).toBeInTheDocument()
    expect(screen.getByText('-35,000.00')).toBeInTheDocument()
    expect(screen.getByText('+15,000.00')).toBeInTheDocument() // Net Flow
  })
})
