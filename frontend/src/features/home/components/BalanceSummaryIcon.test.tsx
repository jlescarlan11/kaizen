import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '../../../tests/test-utils'
import { BalanceSummaryIcon } from './BalanceSummaryIcon'
import * as router from 'react-router-dom'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('BalanceSummaryIcon', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(mockNavigate)
  })

  it('renders correctly with chart icon', () => {
    render(<BalanceSummaryIcon />)
    const icon = screen.getByLabelText('View Balance Summary')
    expect(icon).toBeDefined()
  })

  it('navigates to /balance-summary when clicked', () => {
    render(<BalanceSummaryIcon />)
    const icon = screen.getByLabelText('View Balance Summary')
    fireEvent.click(icon)

    expect(mockNavigate).toHaveBeenCalledWith('/balance-summary')
  })
})
