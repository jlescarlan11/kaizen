import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import { HomePage } from '../features/home/HomePage'
import type { RootState } from '../app/store/store'
import { setupStore } from '../app/store/store'
import * as budgetApi from '../app/store/api/budgetApi'

const mockUser: RootState['auth']['user'] = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  onboardingCompleted: true,
  openingBalance: 0,
  budgetSetupSkipped: false,
  tourCompleted: false,
  firstTransactionAdded: false,
}

const mockOnboardingState: RootState['onboarding'] = {
  currentStep: 'BALANCE',
  balanceValue: null,
  budgetChoice: null,
  categoriesSeeded: false,
}

const createStore = (): ReturnType<typeof setupStore> =>
  setupStore({
    auth: {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    },
    onboarding: mockOnboardingState,
  })

const budgetCountSpy = vi.spyOn(budgetApi, 'useGetBudgetCountQuery')

const renderHomePage = ({ transactionsCount = 0, budgetCount = 0 } = {}) => {
  budgetCountSpy.mockReturnValue({
    data: { count: budgetCount },
    isFetching: false,
    refetch: vi.fn(),
  })
  const store = createStore()

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage transactionsCount={transactionsCount} />
      </MemoryRouter>
    </Provider>,
  )
}

describe('HomePage', () => {
  afterEach(() => {
    budgetCountSpy.mockClear()
  })

  afterAll(() => {
    budgetCountSpy.mockRestore()
  })

  it('shows both empty states when there is no data', () => {
    renderHomePage({ transactionsCount: 0, budgetCount: 0 })

    expect(screen.getByText(/add your first transaction/i)).toBeInTheDocument()
    expect(screen.getByText(/set up budgets to organize spending/i)).toBeInTheDocument()
  })

  it('hides the empty states when data exists', () => {
    renderHomePage({ transactionsCount: 2, budgetCount: 3 })

    expect(screen.queryByText(/add your first transaction/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/set up budgets to organize spending/i)).not.toBeInTheDocument()
    expect(screen.getByText(/transactions will appear here/i)).toBeInTheDocument()
    expect(screen.getByText(/you currently have 3 budgets configured/i)).toBeInTheDocument()
  })
})
