import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from '../features/home/HomePage'
import type { RootState } from '../app/store/store'
import { setupStore } from '../app/store/store'
import * as budgetApi from '../app/store/api/budgetApi'
import { DashboardTourAnchorsProvider } from '../features/home/DashboardTourAnchorsContext'

const mockUser: RootState['auth']['user'] = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  onboardingCompleted: true,
  balance: 0,
  budgetSetupSkipped: false,
  tourCompleted: false,
  firstTransactionAdded: false,
}

const mockOnboardingState: RootState['onboarding'] = {
  currentStep: 'BALANCE',
  startingFunds: null,
  startingFundsInput: '',
  fundingSourceType: null,
  categoriesSeeded: false,
  pendingBudgets: [],
  budgetEditorDraft: {
    isOpen: false,
    editingCategoryId: null,
    selectedCategoryId: null,
    amountInput: '',
    selectedPeriod: 'MONTHLY',
  },
}

const createStore = (): ReturnType<typeof setupStore> =>
  setupStore({
    auth: {
      user: { ...mockUser },
      isAuthenticated: true,
      isLoading: false,
    },
    onboarding: mockOnboardingState,
  })

const budgetSummarySpy = vi.spyOn(budgetApi, 'useGetBudgetSummaryQuery')

const renderHomePage = ({
  transactionsCount = 0,
  budgetCount = 0,
  totalAllocated = 0,
  remainingToAllocate = 0,
} = {}) => {
  budgetSummarySpy.mockReturnValue({
    data: {
      balance: mockUser.balance,
      totalAllocated,
      remainingToAllocate,
      allocationPercentage:
        mockUser.balance > 0 ? Math.round((totalAllocated / mockUser.balance) * 100) : 0,
      budgetCount,
    },
    isFetching: false,
    refetch: vi.fn(),
  })
  const store = createStore()

  return render(
    <Provider store={store}>
      <DashboardTourAnchorsProvider>
        <MemoryRouter>
          <HomePage transactionsCount={transactionsCount} />
        </MemoryRouter>
      </DashboardTourAnchorsProvider>
    </Provider>,
  )
}

describe('HomePage', () => {
  afterEach(() => {
    mockUser.balance = 0
    budgetSummarySpy.mockClear()
  })

  afterAll(() => {
    budgetSummarySpy.mockRestore()
  })

  it('shows both empty states when there is no data', () => {
    renderHomePage({ transactionsCount: 0, budgetCount: 0 })

    expect(screen.getByText(/add your first transaction/i)).toBeInTheDocument()
    expect(screen.getByText(/set up budgets to organize spending/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit balance/i })).not.toBeInTheDocument()
  })

  it('shows allocation details without reducing the displayed balance', () => {
    mockUser.balance = 1000
    renderHomePage({
      transactionsCount: 2,
      budgetCount: 3,
      totalAllocated: 400,
      remainingToAllocate: 600,
    })

    expect(screen.queryByText(/add your first transaction/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/set up budgets to organize spending/i)).not.toBeInTheDocument()
    expect(screen.getByText(/transactions will appear here/i)).toBeInTheDocument()
    expect(screen.getByText(/you currently have 3 budgets configured/i)).toBeInTheDocument()
    expect(screen.getByText(/allocated/i)).toBeInTheDocument()
    expect(screen.getByText(/remaining to budget/i)).toBeInTheDocument()
    expect(screen.getByText(/available balance/i)).toBeInTheDocument()
    expect(screen.getByText(/400\.00/)).toBeInTheDocument()
    expect(screen.getByText(/600\.00/)).toBeInTheDocument()
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument()
  })
})
