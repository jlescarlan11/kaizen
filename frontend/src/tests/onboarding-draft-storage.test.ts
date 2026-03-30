import { describe, expect, it, beforeEach } from 'vitest'
import {
  clearStoredOnboardingDraft,
  getStoredOnboardingDraft,
  persistOnboardingDraft,
} from '../features/onboarding/onboardingDraftStorage'

describe('onboardingDraftStorage', () => {
  const userId = 'user-1'

  beforeEach(() => {
    localStorage.clear()
  })

  it('reads back a persisted onboarding draft', () => {
    persistOnboardingDraft(userId, {
      currentStep: 'BUDGET',
      startingFunds: 1250.5,
      startingFundsInput: '1250.50',
      fundingSourceType: 'BANK_ACCOUNT',
      categoriesSeeded: true,
      pendingBudgets: [
        {
          categoryId: 1,
          categoryName: 'Housing',
          amount: 500,
          period: 'MONTHLY',
        },
      ],
      budgetEditorDraft: {
        isOpen: true,
        editingCategoryId: 1,
        selectedCategoryId: 1,
        amountInput: '500',
        selectedPeriod: 'WEEKLY',
      },
      initialBalances: [],
    })

    expect(getStoredOnboardingDraft(userId)).toEqual(
      expect.objectContaining({
        version: 1,
        currentStep: 'BUDGET',
        startingFunds: 1250.5,
        startingFundsInput: '1250.50',
        fundingSourceType: 'BANK_ACCOUNT',
        categoriesSeeded: true,
      }),
    )
  })

  it('drops malformed drafts instead of returning invalid data', () => {
    localStorage.setItem('kaizen-onboarding-draft:user-1', '{"version":1,"broken":true}')

    expect(getStoredOnboardingDraft(userId)).toBeNull()
    expect(localStorage.getItem('kaizen-onboarding-draft:user-1')).toBeNull()
  })

  it('clears a stored draft', () => {
    persistOnboardingDraft(userId, {
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
      initialBalances: [],
    })

    clearStoredOnboardingDraft(userId)

    expect(getStoredOnboardingDraft(userId)).toBeNull()
  })
})
