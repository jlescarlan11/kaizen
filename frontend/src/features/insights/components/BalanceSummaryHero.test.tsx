// frontend/src/features/insights/components/BalanceSummaryHero.test.tsx
import { afterEach, describe, it, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BalanceSummaryHero } from './BalanceSummaryHero'

afterEach(() => {
  cleanup()
})

describe('BalanceSummaryHero', () => {
  it('renders the page title', () => {
    render(<BalanceSummaryHero currentBalance={100000} previousBalance={90000} isLoading={false} />)
    expect(screen.getByRole('heading', { name: /balance summary/i })).toBeInTheDocument()
  })

  it('displays the formatted current balance', () => {
    render(
      <BalanceSummaryHero currentBalance={125000} previousBalance={100000} isLoading={false} />,
    )
    // formatCurrency(125000) → "PHP 125,000.00"
    expect(screen.getByText(/125,000\.00/)).toBeInTheDocument()
  })

  it('shows increase badge when current > previous', () => {
    render(
      <BalanceSummaryHero currentBalance={120000} previousBalance={100000} isLoading={false} />,
    )
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/increase/i)).toBeInTheDocument()
  })

  it('shows decrease badge when current < previous', () => {
    render(<BalanceSummaryHero currentBalance={80000} previousBalance={100000} isLoading={false} />)
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/decrease/i)).toBeInTheDocument()
  })

  it('renders a loading skeleton when isLoading is true', () => {
    const { container } = render(
      <BalanceSummaryHero currentBalance={0} previousBalance={0} isLoading={true} />,
    )
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
    expect(screen.queryByText(/125,000/)).toBeNull()
  })

  it('handles zero previous balance without crashing (no division by zero)', () => {
    expect(() =>
      render(<BalanceSummaryHero currentBalance={50000} previousBalance={0} isLoading={false} />),
    ).not.toThrow()
    // percentage shows 0.0% when previousBalance is 0
    expect(screen.getByText(/0\.0%/)).toBeInTheDocument()
  })
})
