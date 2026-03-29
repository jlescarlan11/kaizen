import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddEntryFAB } from './AddEntryFAB'
import { render } from '../../tests/test-utils'

describe('AddEntryFAB', () => {
  const mockActions = {
    onAddTransaction: vi.fn(),
    onCreateBudget: vi.fn(),
    onCreateGoal: vi.fn(),
    onHoldPurchase: vi.fn(),
  }

  it('should render the FAB with an Add icon', () => {
    render(<AddEntryFAB {...mockActions} />)

    const fab = screen.getByRole('button', { name: /open quick actions/i })
    expect(fab).toBeInTheDocument()
  })

  it('should show all 4 actions when clicked', () => {
    render(<AddEntryFAB {...mockActions} />)

    const fab = screen.getByRole('button', { name: /open quick actions/i })
    fireEvent.click(fab)

    expect(screen.getByText(/add transaction/i)).toBeInTheDocument()
    expect(screen.getByText(/create budget/i)).toBeInTheDocument()
    expect(screen.getByText(/create goal/i)).toBeInTheDocument()
    expect(screen.getByText(/hold purchase/i)).toBeInTheDocument()
  })

  it('should trigger the correct handler when an action is clicked', () => {
    render(<AddEntryFAB {...mockActions} />)

    const fab = screen.getByRole('button', { name: /open quick actions/i })
    fireEvent.click(fab)

    const addTransactionBtn = screen.getByRole('button', { name: /add transaction/i })
    fireEvent.click(addTransactionBtn)

    expect(mockActions.onAddTransaction).toHaveBeenCalledTimes(1)
  })
})
