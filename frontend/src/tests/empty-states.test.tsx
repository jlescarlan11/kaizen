import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TransactionsEmptyState } from '../features/home/TransactionsEmptyState'
import { BudgetsEmptyState } from '../features/home/BudgetsEmptyState'
import {
  BUDGETS_EMPTY_BUTTON,
  BUDGETS_EMPTY_MESSAGE,
  TRANSACTIONS_EMPTY_BUTTON,
  TRANSACTIONS_EMPTY_TITLE,
  TRANSACTIONS_EMPTY_SUBTEXT,
} from '../features/home/emptyStateCopy'

describe('TransactionsEmptyState', () => {
  it('renders the approved copy and forwards the ref', () => {
    const onAdd = vi.fn()
    const buttonRef = { current: null }

    render(<TransactionsEmptyState onAddTransaction={onAdd} buttonRef={buttonRef} />)

    expect(screen.getByText(TRANSACTIONS_EMPTY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(TRANSACTIONS_EMPTY_SUBTEXT)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: TRANSACTIONS_EMPTY_BUTTON }))
    expect(onAdd).toHaveBeenCalledOnce()
    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement)
  })
})

describe('BudgetsEmptyState', () => {
  it('renders the approved copy and calls the CTA handler', async () => {
    const onQuickSetup = vi.fn()

    render(<BudgetsEmptyState onQuickSetup={onQuickSetup} />)

    expect(screen.getByText(BUDGETS_EMPTY_MESSAGE)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: BUDGETS_EMPTY_BUTTON }))
    expect(onQuickSetup).toHaveBeenCalledOnce()
  })
})
