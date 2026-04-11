import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalanceTrendChart } from './BalanceTrendChart'
import type { BalanceTrendSeries } from '../types'
import type { BalanceTrendEntry } from '../types'

// Recharts uses ResizeObserver internally; jsdom doesn't have it.
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

afterEach(() => {
  cleanup()
})

const emptyTrends: BalanceTrendSeries = { series: [] }

const oneTrend: BalanceTrendSeries = {
  series: [
    {
      periodStart: '2026-01-01T00:00:00.000Z',
      income: 10000,
      expenses: 5000,
      netBalance: 5000,
    } as BalanceTrendEntry,
  ],
}

describe('BalanceTrendChart granularity toggle', () => {
  it('renders Daily, Weekly, and Monthly toggle buttons', () => {
    render(
      <BalanceTrendChart
        trends={oneTrend}
        granularity="MONTHLY"
        onGranularityChange={vi.fn()}
        isLoading={false}
      />,
    )
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument()
  })

  it('calls onGranularityChange with WEEKLY when Weekly is clicked', async () => {
    const onGranularityChange = vi.fn()
    render(
      <BalanceTrendChart
        trends={oneTrend}
        granularity="MONTHLY"
        onGranularityChange={onGranularityChange}
        isLoading={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /weekly/i }))
    expect(onGranularityChange).toHaveBeenCalledWith('WEEKLY')
  })

  it('calls onGranularityChange with DAILY when Daily is clicked', async () => {
    const onGranularityChange = vi.fn()
    render(
      <BalanceTrendChart
        trends={oneTrend}
        granularity="MONTHLY"
        onGranularityChange={onGranularityChange}
        isLoading={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /daily/i }))
    expect(onGranularityChange).toHaveBeenCalledWith('DAILY')
  })

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <BalanceTrendChart
        trends={emptyTrends}
        granularity="MONTHLY"
        onGranularityChange={vi.fn()}
        isLoading={true}
      />,
    )
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })
})

describe('BalanceTrendChart with data', () => {
  it('renders the chart heading when data is present', () => {
    render(
      <BalanceTrendChart
        trends={oneTrend}
        granularity="MONTHLY"
        onGranularityChange={vi.fn()}
        isLoading={false}
      />,
    )
    expect(screen.getByRole('heading', { name: /balance trends/i })).toBeInTheDocument()
  })

  it('renders all three granularity buttons when data is present', () => {
    render(
      <BalanceTrendChart
        trends={oneTrend}
        granularity="WEEKLY"
        onGranularityChange={vi.fn()}
        isLoading={false}
      />,
    )
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument()
  })
})
