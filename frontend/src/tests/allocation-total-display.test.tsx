import { render, screen } from './test-utils'
import { describe, expect, it } from 'vitest'
import { AllocationTotalDisplay } from '../features/budgets/components/AllocationTotalDisplay'

describe('AllocationTotalDisplay', () => {
  it('uses the safe solid fill below the warning threshold', () => {
    render(<AllocationTotalDisplay totalAllocated={899} balance={1000} />)

    const progressBar = screen.getByRole('progressbar', { name: /budget allocation/i })
    const fill = progressBar.firstElementChild as HTMLDivElement

    expect(fill.className).toContain('bg-primary')
    expect(fill.style.backgroundImage).toBe('')
  })

  it('uses a gradient fill and avoids a 100 percent label when there is still remainder', () => {
    render(<AllocationTotalDisplay totalAllocated={999} balance={1000} />)

    const progressBar = screen.getByRole('progressbar', { name: /budget allocation/i })
    const fill = progressBar.firstElementChild as HTMLDivElement

    expect(fill.style.backgroundImage).toContain('linear-gradient')
    expect(screen.getByText(/\(99\.9%\)/i)).toBeInTheDocument()
    expect(screen.getByText(/1 left/i)).toBeInTheDocument()
  })

  it('uses the danger fill and warning copy when allocations exceed balance', () => {
    render(<AllocationTotalDisplay totalAllocated={1100} balance={1000} />)

    const progressBar = screen.getByRole('progressbar', { name: /budget allocation/i })
    const fill = progressBar.firstElementChild as HTMLDivElement

    expect(fill.className).toContain('bg-ui-danger-bg')
    expect(screen.getByText(/over by/i)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot exceed your balance/i)
  })
})
