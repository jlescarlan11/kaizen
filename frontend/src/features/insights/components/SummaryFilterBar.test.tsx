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
  it('renders period preset selector', () => {
    render(
      <SummaryFilterBar
        periodPreset="CURRENT_MONTH"
        onPeriodPresetChange={vi.fn()}
        selectedAccountIds={[]}
        onAccountSelectionChange={vi.fn()}
        accounts={mockAccounts}
      />,
    )
    expect(screen.getByLabelText(/period/i)).toBeInTheDocument()
  })

  it('renders account selection label', () => {
    render(
      <SummaryFilterBar
        periodPreset="CURRENT_MONTH"
        onPeriodPresetChange={vi.fn()}
        selectedAccountIds={[]}
        onAccountSelectionChange={vi.fn()}
        accounts={mockAccounts}
      />,
    )
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('All Accounts')).toBeInTheDocument()
  })

  it('calls onAccountSelectionChange when an account is selected', async () => {
    const onAccountSelectionChange = vi.fn()
    render(
      <SummaryFilterBar
        periodPreset="CURRENT_MONTH"
        onPeriodPresetChange={vi.fn()}
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

  it('calls onPeriodPresetChange when a new preset is selected', async () => {
    const onPeriodPresetChange = vi.fn()
    render(
      <SummaryFilterBar
        periodPreset="CURRENT_MONTH"
        onPeriodPresetChange={onPeriodPresetChange}
        selectedAccountIds={[]}
        onAccountSelectionChange={vi.fn()}
        accounts={mockAccounts}
      />,
    )

    const select = screen.getByLabelText(/period/i)
    await userEvent.click(select)
    const option = screen.getByText(/last month/i)
    await userEvent.click(option)

    expect(onPeriodPresetChange).toHaveBeenCalledWith('LAST_MONTH')
  })
})
