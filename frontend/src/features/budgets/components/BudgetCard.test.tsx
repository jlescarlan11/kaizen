import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../../tests/test-utils'
import { BudgetCard } from './BudgetCard'

describe('BudgetCard', () => {
  const mockBudget = {
    categoryId: 1,
    categoryName: 'Food',
    amount: 500,
    period: 'MONTHLY' as const,
    categoryIcon: 'utensils',
    categoryColor: '#ff0000',
  }

  const mockOnEdit = vi.fn()
  const mockOnRemove = vi.fn()

  it('renders budget information correctly', () => {
    render(
      <BudgetCard
        budget={mockBudget}
        isInvalid={false}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />,
    )

    expect(screen.getByText('Food')).toBeInTheDocument()
    // The amount format might vary, but it should contain 500 and Monthly
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/Monthly/)).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <BudgetCard
        budget={mockBudget}
        isInvalid={false}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />,
    )

    fireEvent.click(screen.getByLabelText(/edit food budget/i))
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onRemove when remove button is clicked', () => {
    render(
      <BudgetCard
        budget={mockBudget}
        isInvalid={false}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />,
    )

    fireEvent.click(screen.getByLabelText(/remove food budget/i))
    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('applies error styles when isInvalid is true', () => {
    const { container } = render(
      <BudgetCard
        budget={mockBudget}
        isInvalid={true}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />,
    )

    expect(container.firstChild).toHaveClass('border-ui-danger-bg')
  })
})
