import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { AccountBreakdownWidget } from './AccountBreakdownWidget'

const mockSummaries = [
  { paymentMethod: { id: 1, name: 'Cash', isGlobal: true }, totalAmount: 5000 },
  { paymentMethod: { id: 2, name: 'Bank', isGlobal: true }, totalAmount: 15000 },
]

describe('AccountBreakdownWidget', () => {
  it('renders loading state', () => {
    const { container } = render(<AccountBreakdownWidget summaries={[]} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeDefined()
  })

  it('renders empty state', () => {
    render(<AccountBreakdownWidget summaries={[]} isLoading={false} />)
    expect(screen.getByText(/no account data available/i)).toBeInTheDocument()
  })

  it('renders account summaries correctly', () => {
    render(<AccountBreakdownWidget summaries={mockSummaries} isLoading={false} />)
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Bank')).toBeInTheDocument()
    expect(screen.getByText('5,000.00')).toBeInTheDocument()
    expect(screen.getByText('15,000.00')).toBeInTheDocument()
    expect(screen.getByText('20,000.00')).toBeInTheDocument() // Total
  })
})
