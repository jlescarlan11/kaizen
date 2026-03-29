import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

import { BudgetsPage } from '../features/budgets/BudgetsPage'
import type { RootState } from '../app/store/store'
import { setupStore } from '../app/store/store'
import * as budgetApi from '../app/store/api/budgetApi'
import * as categoryApi from '../app/store/api/categoryApi'

const mockUser: RootState['auth']['user'] = {
  id: 'user-1',
  name: 'Budget User',
  email: 'budget@example.com',
  onboardingCompleted: true,
  balance: 1000,
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
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    },
    onboarding: mockOnboardingState,
  })

const getBudgetsSpy = vi.spyOn(budgetApi, 'useGetBudgetsQuery')
const getBudgetSummarySpy = vi.spyOn(budgetApi, 'useGetBudgetSummaryQuery')
const getCategoriesSpy = vi.spyOn(categoryApi, 'useGetCategoriesQuery')

describe('BudgetsPage', () => {
  afterEach(() => {
    getBudgetsSpy.mockClear()
    getBudgetSummarySpy.mockClear()
    getCategoriesSpy.mockClear()
  })

  afterAll(() => {
    getBudgetsSpy.mockRestore()
    getBudgetSummarySpy.mockRestore()
    getCategoriesSpy.mockRestore()
  })

  it('renders budget cards with their associated category icons', () => {
    getBudgetsSpy.mockReturnValue({
      data: [
        {
          id: 1,
          userId: 1,
          categoryId: 10,
          categoryName: 'Food',
          amount: 250,
          period: 'MONTHLY',
          createdAt: '2026-03-23T00:00:00Z',
          updatedAt: '2026-03-23T00:00:00Z',
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    })
    getBudgetSummarySpy.mockReturnValue({
      data: {
        balance: 1000,
        totalAllocated: 250,
        remainingToAllocate: 750,
        allocationPercentage: 25,
        budgetCount: 1,
      },
      isFetching: false,
      refetch: vi.fn(),
    })
    getCategoriesSpy.mockReturnValue({
      data: [
        {
          id: 10,
          name: 'Food',
          isGlobal: true,
          icon: '🍕',
          color: '#FF5733',
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    })

    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <BudgetsPage />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText(/Food/i)).toBeInTheDocument()
    expect(screen.getByText('🍕')).toBeInTheDocument()
  })

  it('shows actual balance separately from allocated and remaining amounts', () => {
    getBudgetsSpy.mockReturnValue({
      data: [
        {
          id: 1,
          userId: 1,
          categoryId: 10,
          categoryName: 'Food',
          amount: 250,
          period: 'MONTHLY',
          createdAt: '2026-03-23T00:00:00Z',
          updatedAt: '2026-03-23T00:00:00Z',
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    })
    getBudgetSummarySpy.mockReturnValue({
      data: {
        balance: 1000,
        totalAllocated: 250,
        remainingToAllocate: 750,
        allocationPercentage: 25,
        budgetCount: 1,
      },
      isFetching: false,
      refetch: vi.fn(),
    })

    render(
      <Provider store={createStore()}>
        <MemoryRouter>
          <BudgetsPage />
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText(/actual balance/i)).toBeInTheDocument()
    expect(screen.getAllByText(/allocated/i)).toHaveLength(2)
    expect(screen.getByText(/remaining to budget/i)).toBeInTheDocument()
    expect(screen.getByText(/1,000\.00/)).toBeInTheDocument()
    expect(screen.getAllByText(/250\.00/)).toHaveLength(2)
    expect(screen.getByText(/750\.00/)).toBeInTheDocument()
    expect(screen.getByText(/25% of balance allocated/i)).toBeInTheDocument()
  })
})
