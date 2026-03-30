import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render } from './test-utils'
import { OnboardingBudgetStep } from '../features/onboarding/OnboardingBudgetStep'
import { persistOnboardingDraft } from '../features/onboarding/onboardingDraftStorage'

const mockNavigate = vi.fn()
const mockUpdateProgress = vi.fn()
const mockComplete = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../features/categories/api', () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Housing', isGlobal: true, icon: 'home', color: '#111111' },
    { id: 2, name: 'Food', isGlobal: true, icon: 'food', color: '#222222' },
    { id: 3, name: 'Transport', isGlobal: true, icon: 'car', color: '#333333' },
    { id: 4, name: 'Utilities', isGlobal: true, icon: 'bolt', color: '#444444' },
  ]),
}))

vi.mock('../app/store/api/authApi', () => ({
  useUpdateOnboardingProgressMutation: () => [mockUpdateProgress],
  useCompleteOnboardingMutation: () => [mockComplete, { isLoading: false }],
}))

vi.mock('../features/budgets/components/SkipBudgetTrigger', () => ({
  SkipBudgetTrigger: () => <div>Skip for now</div>,
}))

describe('OnboardingBudgetStep', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockReset()
    mockUpdateProgress.mockReset()
    mockUpdateProgress.mockResolvedValue({})
    mockComplete.mockReset()
    mockComplete.mockImplementation((payload) => ({
      unwrap: () =>
        Promise.resolve({
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          onboardingCompleted: true,
          balance: payload.startingFunds,
          budgetSetupSkipped: false,
          tourCompleted: false,
          firstTransactionAdded: false,
        }),
    }))
  })

  it('submits the selected period for each onboarding budget', async () => {
    render(<OnboardingBudgetStep />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            onboardingCompleted: false,
            balance: 1000,
            budgetSetupSkipped: false,
            tourCompleted: false,
            firstTransactionAdded: false,
          },
        },
        onboarding: {
          currentStep: 'BUDGET',
          startingFunds: 1000,
          startingFundsInput: '1000',
          fundingSourceType: 'E_WALLET',
          categoriesSeeded: false,
          pendingBudgets: [],
          initialBalances: [],
          budgetEditorDraft: {
            isOpen: false,
            editingCategoryId: null,
            selectedCategoryId: null,
            amountInput: '',
            selectedPeriod: 'MONTHLY',
          },
        },
      },
    })

    persistOnboardingDraft('user-1', {
      currentStep: 'BUDGET',
      startingFunds: 1000,
      startingFundsInput: '1000',
      fundingSourceType: 'E_WALLET',
      categoriesSeeded: true,
      pendingBudgets: [],
      initialBalances: [],
      budgetEditorDraft: {
        isOpen: false,
        editingCategoryId: null,
        selectedCategoryId: null,
        amountInput: '',
        selectedPeriod: 'MONTHLY',
      },
    })

    await screen.findByText('Housing')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finish setup' })).toBeEnabled())

    fireEvent.click(screen.getByRole('button', { name: /edit housing budget/i }))

    const weeklyButton = screen.getByRole('button', { name: 'Weekly' })
    fireEvent.click(weeklyButton)
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }))

    await waitFor(() => expect(mockComplete).toHaveBeenCalledTimes(1), { timeout: 2000 })

    expect(mockComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        startingFunds: 1000,
        fundingSourceType: 'E_WALLET',
        budgets: expect.arrayContaining([
          expect.objectContaining({
            categoryId: 1,
            period: 'WEEKLY',
          }),
        ]),
      }),
    )
    expect(localStorage.getItem('kaizen-onboarding-draft:user-1')).toBeNull()
  })

  describe('Mobile-first Responsiveness', () => {
    it('applies fluid touch target classes to the finish setup button', async () => {
      render(<OnboardingBudgetStep />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              onboardingCompleted: false,
              balance: 1000,
              budgetSetupSkipped: false,
              tourCompleted: false,
              firstTransactionAdded: false,
            },
          },
          onboarding: {
            currentStep: 'BUDGET',
            startingFunds: 1000,
            startingFundsInput: '1000',
            fundingSourceType: 'E_WALLET',
            categoriesSeeded: false,
            pendingBudgets: [],
            initialBalances: [],
            budgetEditorDraft: {
              isOpen: false,
              editingCategoryId: null,
              selectedCategoryId: null,
              amountInput: '',
              selectedPeriod: 'MONTHLY',
            },
          },
        },
      })

      const finishButton = await screen.findByRole('button', { name: 'Finish setup' })
      expect(finishButton).toHaveClass('h-12')
      expect(finishButton).toHaveClass('min-h-[3rem]')
    })

    it('renders the balance overview with fluid spacing classes', async () => {
      render(<OnboardingBudgetStep />, {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            isLoading: false,
            user: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              onboardingCompleted: false,
              balance: 1000,
              budgetSetupSkipped: false,
              tourCompleted: false,
              firstTransactionAdded: false,
            },
          },
          onboarding: {
            currentStep: 'BUDGET',
            startingFunds: 1000,
            startingFundsInput: '1000',
            fundingSourceType: 'E_WALLET',
            categoriesSeeded: false,
            pendingBudgets: [],
            initialBalances: [],
            budgetEditorDraft: {
              isOpen: false,
              editingCategoryId: null,
              selectedCategoryId: null,
              amountInput: '',
              selectedPeriod: 'MONTHLY',
            },
          },
        },
      })

      const balanceOverview = await screen.findByText(/balance overview/i)
      const container = balanceOverview.closest('div')!.parentElement!
      expect(container).toHaveClass('space-y-[clamp(1.5rem,6vw,2.5rem)]')
    })
  })
})
