import { screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from '../../tests/test-utils'
import { BalanceSummaryPage } from './BalanceSummaryPage'
import * as paymentMethodApi from '../../app/store/api/paymentMethodApi'
import * as insightsApi from '../../app/store/api/insightsApi'

vi.mock('../../app/store/api/paymentMethodApi', async () => {
  const actual = await vi.importActual('../../app/store/api/paymentMethodApi')
  return { ...actual, useGetPaymentMethodSummaryQuery: vi.fn() }
})

vi.mock('../../app/store/api/insightsApi', async () => {
  const actual = await vi.importActual('../../app/store/api/insightsApi')
  return { ...actual, useGetSpendingSummaryQuery: vi.fn() }
})

describe('BalanceSummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(paymentMethodApi.useGetPaymentMethodSummaryQuery).mockReturnValue({
      data: [],
      isLoading: true,
    } as any)
    vi.mocked(insightsApi.useGetSpendingSummaryQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)

    render(<BalanceSummaryPage />)
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('renders widgets when data is loaded', () => {
    vi.mocked(paymentMethodApi.useGetPaymentMethodSummaryQuery).mockReturnValue({
      data: [{ paymentMethod: { id: 1, name: 'Cash' }, totalAmount: 1000 }],
      isLoading: false,
    } as any)
    vi.mocked(insightsApi.useGetSpendingSummaryQuery).mockReturnValue({
      data: { totalIncome: 500, totalExpenses: 200, netBalance: 300 },
      isLoading: false,
    } as any)

    render(<BalanceSummaryPage />)
    expect(screen.getByText('Account Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Income vs Expenses')).toBeInTheDocument()
    expect(screen.getByText('Period Comparison')).toBeInTheDocument()
    expect(screen.getAllByText('1,000.00').length).toBeGreaterThan(0)
  })
})
