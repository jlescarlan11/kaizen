import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../tests/test-utils'
import { BalanceSummaryPage } from './BalanceSummaryPage'

describe('BalanceSummaryPage', () => {
  it('renders title and description', () => {
    render(<BalanceSummaryPage />)
    expect(screen.getByText('Balance Summary')).toBeInTheDocument()
    expect(screen.getByText(/detailed breakdown/i)).toBeInTheDocument()
  })

  it('renders widget placeholders', () => {
    const { container } = render(<BalanceSummaryPage />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(3)
  })
})
