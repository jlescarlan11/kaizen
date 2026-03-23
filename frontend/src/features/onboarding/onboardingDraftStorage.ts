import type { FundingSourceType } from './fundingSource'
import type { BudgetPeriod } from '../budgets/constants'
import { CUSTOM_CATEGORY_OPTION_VALUE } from '../budgets/ManualBudgetCategoryPicker'
import type { OnboardingStep } from './onboardingStep'
import type { PendingBudget } from './onboardingSlice'

const ONBOARDING_DRAFT_STORAGE_VERSION = 1
const ONBOARDING_DRAFT_STORAGE_KEY_PREFIX = 'kaizen-onboarding-draft'

interface StoredBudgetEditorDraft {
  isOpen: boolean
  editingCategoryId: number | null
  selectedCategoryId: number | typeof CUSTOM_CATEGORY_OPTION_VALUE | null
  amountInput: string
  selectedPeriod: BudgetPeriod
}

export interface OnboardingDraft {
  version: number
  currentStep: OnboardingStep
  startingFunds: number | null
  startingFundsInput: string
  fundingSourceType: FundingSourceType | null
  categoriesSeeded: boolean
  pendingBudgets: PendingBudget[]
  budgetEditorDraft: StoredBudgetEditorDraft
  updatedAt: string
}

function getOnboardingDraftStorageKey(userId: string): string {
  return `${ONBOARDING_DRAFT_STORAGE_KEY_PREFIX}:${userId}`
}

function isPendingBudget(value: unknown): value is PendingBudget {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.categoryId === 'number' &&
    typeof candidate.categoryName === 'string' &&
    (typeof candidate.categoryIcon === 'string' || candidate.categoryIcon == null) &&
    (typeof candidate.categoryColor === 'string' || candidate.categoryColor == null) &&
    typeof candidate.amount === 'number' &&
    (candidate.period === 'MONTHLY' || candidate.period === 'WEEKLY')
  )
}

function isBudgetEditorDraft(value: unknown): value is StoredBudgetEditorDraft {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.isOpen === 'boolean' &&
    (typeof candidate.editingCategoryId === 'number' || candidate.editingCategoryId == null) &&
    (typeof candidate.selectedCategoryId === 'number' ||
      candidate.selectedCategoryId === CUSTOM_CATEGORY_OPTION_VALUE ||
      candidate.selectedCategoryId == null) &&
    typeof candidate.amountInput === 'string' &&
    (candidate.selectedPeriod === 'MONTHLY' || candidate.selectedPeriod === 'WEEKLY')
  )
}

function isOnboardingDraft(value: unknown): value is OnboardingDraft {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    candidate.version === ONBOARDING_DRAFT_STORAGE_VERSION &&
    (candidate.currentStep === 'BALANCE' ||
      candidate.currentStep === 'BUDGET' ||
      candidate.currentStep === 'COMPLETE') &&
    (typeof candidate.startingFunds === 'number' || candidate.startingFunds == null) &&
    typeof candidate.startingFundsInput === 'string' &&
    (candidate.fundingSourceType === 'CASH_ON_HAND' ||
      candidate.fundingSourceType === 'BANK_ACCOUNT' ||
      candidate.fundingSourceType === 'E_WALLET' ||
      candidate.fundingSourceType == null) &&
    typeof candidate.categoriesSeeded === 'boolean' &&
    Array.isArray(candidate.pendingBudgets) &&
    candidate.pendingBudgets.every(isPendingBudget) &&
    isBudgetEditorDraft(candidate.budgetEditorDraft) &&
    typeof candidate.updatedAt === 'string'
  )
}

export function getStoredOnboardingDraft(userId: string): OnboardingDraft | null {
  const storageKey = getOnboardingDraftStorageKey(userId)

  try {
    const storedValue = localStorage.getItem(storageKey)
    if (!storedValue) {
      return null
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (isOnboardingDraft(parsedValue)) {
      return parsedValue
    }

    localStorage.removeItem(storageKey)
  } catch {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // Fall back to in-memory state when storage writes are unavailable.
    }
  }

  return null
}

export function persistOnboardingDraft(
  userId: string,
  draft: Omit<OnboardingDraft, 'version' | 'updatedAt'>,
): void {
  const storageKey = getOnboardingDraftStorageKey(userId)

  try {
    const persistedDraft: OnboardingDraft = {
      ...draft,
      version: ONBOARDING_DRAFT_STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(storageKey, JSON.stringify(persistedDraft))
  } catch {
    // Fall back to in-memory state when storage writes are unavailable.
  }
}

export function clearStoredOnboardingDraft(userId: string): void {
  try {
    localStorage.removeItem(getOnboardingDraftStorageKey(userId))
  } catch {
    // Fall back to in-memory state when storage writes are unavailable.
  }
}
