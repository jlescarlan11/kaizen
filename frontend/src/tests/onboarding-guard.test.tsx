import { Provider } from 'react-redux'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { setupStore } from '../app/store/store'
import { OnboardingGuard } from '../features/onboarding/OnboardingGuard'
import { persistOnboardingDraft } from '../features/onboarding/onboardingDraftStorage'
import { useAppSelector } from '../app/store/hooks'

vi.mock('../shared/hooks/useAuthState', () => ({
  useAuthState: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      onboardingCompleted: false,
      balance: 500,
      budgetSetupSkipped: false,
      tourCompleted: false,
      firstTransactionAdded: false,
    },
  }),
}))

vi.mock('../app/store/api/authApi', () => ({
  useGetOnboardingProgressQuery: () => ({
    data: {
      currentStep: 'BALANCE',
      startingFunds: 500,
      fundingSourceType: 'CASH_ON_HAND',
      lastUpdatedAt: '2026-03-23T00:00:00.000Z',
    },
    isLoading: false,
  }),
}))

function StateProbe() {
  const onboarding = useAppSelector((state) => state.onboarding)

  return (
    <div>
      <div>{onboarding.currentStep}</div>
      <div>{onboarding.startingFundsInput}</div>
      <div>{onboarding.pendingBudgets.length}</div>
    </div>
  )
}

describe('OnboardingGuard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('restores the local onboarding draft before falling back to backend progress', async () => {
    persistOnboardingDraft('user-1', {
      currentStep: 'BUDGET',
      startingFunds: 1234.5,
      startingFundsInput: '1234.50',
      fundingSourceType: 'E_WALLET',
      categoriesSeeded: true,
      pendingBudgets: [
        {
          categoryId: 1,
          categoryName: 'Housing',
          amount: 600,
          period: 'MONTHLY',
        },
      ],
      budgetEditorDraft: {
        isOpen: false,
        editingCategoryId: null,
        selectedCategoryId: null,
        amountInput: '',
        selectedPeriod: 'MONTHLY',
      },
    })

    const router = createMemoryRouter(
      [
        {
          path: '/onboarding',
          element: <OnboardingGuard />,
          children: [
            { path: 'balance', element: <StateProbe /> },
            { path: 'budget', element: <StateProbe /> },
          ],
        },
      ],
      {
        initialEntries: ['/onboarding'],
      },
    )

    render(
      <Provider store={setupStore()}>
        <RouterProvider router={router} />
      </Provider>,
    )

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/onboarding/budget')
    })

    expect(screen.getByText('BUDGET')).toBeInTheDocument()
    expect(screen.getByText('1234.50')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('keeps the user on the restored onboarding route after a direct refresh', async () => {
    persistOnboardingDraft('user-1', {
      currentStep: 'BUDGET',
      startingFunds: 900,
      startingFundsInput: '900',
      fundingSourceType: 'BANK_ACCOUNT',
      categoriesSeeded: false,
      pendingBudgets: [],
      budgetEditorDraft: {
        isOpen: false,
        editingCategoryId: null,
        selectedCategoryId: null,
        amountInput: '',
        selectedPeriod: 'MONTHLY',
      },
    })

    const router = createMemoryRouter(
      [
        {
          path: '/onboarding',
          element: <OnboardingGuard />,
          children: [
            { path: 'balance', element: <StateProbe /> },
            { path: 'budget', element: <StateProbe /> },
          ],
        },
      ],
      {
        initialEntries: ['/onboarding/budget'],
      },
    )

    render(
      <Provider store={setupStore()}>
        <RouterProvider router={router} />
      </Provider>,
    )

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/onboarding/budget')
    })

    expect(screen.getByText('BUDGET')).toBeInTheDocument()
    expect(screen.getByText('900')).toBeInTheDocument()
  })
})
