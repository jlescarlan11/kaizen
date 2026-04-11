import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryFilterBar } from './SummaryFilterBar'

// Headless UI / Recharts uses ResizeObserver internally; jsdom doesn't have it.
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

afterEach(() => {
  cleanup()
})

const mockAccounts = [
  { id: 1, name: 'Cash' },
  { id: 2, name: 'Bank' },
  { id: 3, name: 'Credit Card' },
]

describe('SummaryFilterBar', () => {
  it('renders account selection label', () => {
    render(
      <SummaryFilterBar
        selectedAccountIds={[]}
        onAccountSelectionChange={vi.fn()}
        accounts={mockAccounts}
      />,
    )
    expect(screen.getByText(/account filter/i)).toBeInTheDocument()
    expect(screen.getByText('All Accounts')).toBeInTheDocument()
  })

  it('calls onAccountSelectionChange when an account is selected', async () => {
    const onAccountSelectionChange = vi.fn()
    render(
      <SummaryFilterBar
        selectedAccountIds={[]}
        onAccountSelectionChange={onAccountSelectionChange}
        accounts={mockAccounts}
      />,
    )

    const trigger = screen.getByText('All Accounts')
    await userEvent.click(trigger)

    const checkbox = screen.getByLabelText('Cash')
    await userEvent.click(checkbox)

    expect(onAccountSelectionChange).toHaveBeenCalledWith([1])
  })
})
