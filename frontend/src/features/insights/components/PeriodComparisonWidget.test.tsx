import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { PeriodComparisonWidget } from './PeriodComparisonWidget'

describe('PeriodComparisonWidget', () => {
  it('renders loading state', () => {
    const { container } = render(
      <PeriodComparisonWidget currentBalance={0} previousBalance={0} isLoading={true} />,
    )
    expect(container.querySelector('.animate-pulse')).toBeDefined()
  })

  it('renders increase correctly', () => {
    render(
      <PeriodComparisonWidget currentBalance={15000} previousBalance={10000} isLoading={false} />,
    )
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    expect(screen.getByText('5,000.00')).toBeInTheDocument()
    expect(screen.getByText(/increase from last month/i)).toBeInTheDocument()
  })

  it('renders decrease correctly', () => {
    render(
      <PeriodComparisonWidget currentBalance={8000} previousBalance={10000} isLoading={false} />,
    )
    expect(screen.getByText('20.0%')).toBeInTheDocument()
    expect(screen.getByText('2,000.00')).toBeInTheDocument()
    expect(screen.getByText(/decrease from last month/i)).toBeInTheDocument()
  })
})
