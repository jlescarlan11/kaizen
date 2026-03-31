import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from '../../../tests/test-utils'
import { MoneyFlowDisplay } from './MoneyFlowDisplay'

describe('MoneyFlowDisplay', () => {
  it('renders incoming and outgoing totals', () => {
    render(<MoneyFlowDisplay incoming={1500} outgoing={500} ratio={0.3333} />)

    // Elements are split into "PHP" and amount
    expect(screen.getByText('1,500.00')).toBeInTheDocument()
    expect(screen.getByText('500.00')).toBeInTheDocument()
    expect(screen.getAllByText('PHP')).toHaveLength(2)
    expect(screen.getByText(/Incoming/i)).toBeInTheDocument()
    expect(screen.getByText(/Outgoing/i)).toBeInTheDocument()
  })

  it('renders a progress bar with the correct width based on the ratio', () => {
    render(<MoneyFlowDisplay incoming={1000} outgoing={250} ratio={0.25} />)

    // We expect a progress bar. Let's assume it has a specific test id or class.
    const progressBar = screen.getByTestId('money-flow-progress')
    // If it's a spending-to-income ratio, 0.25 means outgoing is 25% of incoming.
    // If we want to show outgoing relative to incoming in a bar, we need to decide the UI.
    // Spec says: "horizontal progress bar showing the ratio of incoming vs. outgoing"
    // Usually, 100% is "Incoming".
    expect(progressBar).toHaveStyle({ width: '25%' })
  })

  it('caps the progress bar at 100% when ratio > 1', () => {
    render(<MoneyFlowDisplay incoming={500} outgoing={1000} ratio={2} />)

    const progressBar = screen.getByTestId('money-flow-progress')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('handles zero incoming correctly (ratio 1)', () => {
    render(<MoneyFlowDisplay incoming={0} outgoing={100} ratio={1} />)

    const progressBar = screen.getByTestId('money-flow-progress')
    expect(progressBar).toHaveStyle({ width: '100%' })
  })

  it('handles zero outgoing correctly (ratio 0)', () => {
    render(<MoneyFlowDisplay incoming={100} outgoing={0} ratio={0} />)

    const progressBar = screen.getByTestId('money-flow-progress')
    expect(progressBar).toHaveStyle({ width: '0%' })
  })
})
