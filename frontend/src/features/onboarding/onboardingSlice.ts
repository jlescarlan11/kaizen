import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { type RootState } from '../../app/store/store'
import { ONBOARDING_STEP_ORDER, type OnboardingStep } from './onboardingStep'
import { type BudgetPeriod } from '../budgets/constants'
import { CUSTOM_CATEGORY_OPTION_VALUE } from '../budgets/ManualBudgetCategoryPicker'
import { type FundingSourceType } from './fundingSource'

export interface PendingBudget {
  categoryId: number
  categoryName: string
  categoryIcon?: string
  categoryColor?: string
  amount: number
  period: BudgetPeriod
}

export interface BudgetEditorDraft {
  isOpen: boolean
  editingCategoryId: number | null
  selectedCategoryId: number | typeof CUSTOM_CATEGORY_OPTION_VALUE | null
  amountInput: string
  selectedPeriod: BudgetPeriod
}

export interface OnboardingState {
  currentStep: OnboardingStep
  startingFunds: number | null
  startingFundsInput: string
  fundingSourceType: FundingSourceType | null
  categoriesSeeded: boolean
  pendingBudgets: PendingBudget[]
  budgetEditorDraft: BudgetEditorDraft
}

export const createInitialBudgetEditorDraft = (): BudgetEditorDraft => ({
  isOpen: false,
  editingCategoryId: null,
  selectedCategoryId: null,
  amountInput: '',
  selectedPeriod: 'MONTHLY',
})

export const createInitialOnboardingState = (): OnboardingState => ({
  currentStep: 'BALANCE',
  startingFunds: null,
  startingFundsInput: '',
  fundingSourceType: null,
  categoriesSeeded: false,
  pendingBudgets: [],
  budgetEditorDraft: createInitialBudgetEditorDraft(),
})

const initialState: OnboardingState = createInitialOnboardingState()

const slice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStartingFunds(state, action: PayloadAction<number | null>) {
      state.startingFunds = action.payload
    },
    setStartingFundsInput(state, action: PayloadAction<string>) {
      state.startingFundsInput = action.payload
    },
    setFundingSourceType(state, action: PayloadAction<FundingSourceType | null>) {
      state.fundingSourceType = action.payload
    },
    setPendingBudgets(state, action: PayloadAction<PendingBudget[]>) {
      state.pendingBudgets = action.payload
    },
    addPendingBudget(state, action: PayloadAction<PendingBudget>) {
      state.pendingBudgets.push(action.payload)
    },
    removePendingBudget(state, action: PayloadAction<number>) {
      state.pendingBudgets = state.pendingBudgets.filter((b) => b.categoryId !== action.payload)
    },
    updatePendingBudget(state, action: PayloadAction<PendingBudget>) {
      const index = state.pendingBudgets.findIndex(
        (b) => b.categoryId === action.payload.categoryId,
      )
      if (index !== -1) {
        state.pendingBudgets[index] = action.payload
      }
    },
    setCurrentStep(state, action: PayloadAction<OnboardingStep>) {
      state.currentStep = action.payload
    },
    advanceToNextStep(state) {
      const currentIndex = ONBOARDING_STEP_ORDER.indexOf(state.currentStep)
      if (currentIndex === -1 || currentIndex >= ONBOARDING_STEP_ORDER.length - 1) {
        return
      }
      state.currentStep = ONBOARDING_STEP_ORDER[currentIndex + 1]
    },
    goToPreviousStep(state) {
      const currentIndex = ONBOARDING_STEP_ORDER.indexOf(state.currentStep)
      if (currentIndex <= 0) {
        return
      }
      state.currentStep = ONBOARDING_STEP_ORDER[currentIndex - 1]
    },
    markCategoriesSeeded(state) {
      state.categoriesSeeded = true
    },
    setBudgetEditorDraft(state, action: PayloadAction<Partial<BudgetEditorDraft>>) {
      state.budgetEditorDraft = {
        ...state.budgetEditorDraft,
        ...action.payload,
      }
    },
    resetBudgetEditorDraft(state) {
      state.budgetEditorDraft = createInitialBudgetEditorDraft()
    },
    hydrateOnboardingState(state, action: PayloadAction<Partial<OnboardingState>>) {
      if (action.payload.currentStep !== undefined) {
        state.currentStep = action.payload.currentStep
      }
      if (action.payload.startingFunds !== undefined) {
        state.startingFunds = action.payload.startingFunds
      }
      if (action.payload.startingFundsInput !== undefined) {
        state.startingFundsInput = action.payload.startingFundsInput
      }
      if (action.payload.fundingSourceType !== undefined) {
        state.fundingSourceType = action.payload.fundingSourceType
      }
      if (action.payload.categoriesSeeded !== undefined) {
        state.categoriesSeeded = action.payload.categoriesSeeded
      }
      if (action.payload.pendingBudgets !== undefined) {
        state.pendingBudgets = action.payload.pendingBudgets
      }
      if (action.payload.budgetEditorDraft !== undefined) {
        state.budgetEditorDraft = {
          ...createInitialBudgetEditorDraft(),
          ...action.payload.budgetEditorDraft,
        }
      }
    },
    resetOnboardingState(state) {
      const nextState = createInitialOnboardingState()
      state.currentStep = nextState.currentStep
      state.startingFunds = nextState.startingFunds
      state.startingFundsInput = nextState.startingFundsInput
      state.fundingSourceType = nextState.fundingSourceType
      state.categoriesSeeded = nextState.categoriesSeeded
      state.pendingBudgets = nextState.pendingBudgets
      state.budgetEditorDraft = nextState.budgetEditorDraft
    },
  },
})

export const {
  setStartingFunds,
  setStartingFundsInput,
  setFundingSourceType,
  setPendingBudgets,
  addPendingBudget,
  removePendingBudget,
  updatePendingBudget,
  setCurrentStep,
  advanceToNextStep,
  goToPreviousStep,
  markCategoriesSeeded,
  setBudgetEditorDraft,
  resetBudgetEditorDraft,
  hydrateOnboardingState,
  resetOnboardingState,
} = slice.actions

export const selectOnboardingState = (state: RootState) => state.onboarding
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep
export const selectStartingFunds = (state: RootState) => state.onboarding.startingFunds
export const selectBalanceValue = (state: RootState) => state.onboarding.startingFunds
export const selectStartingFundsInput = (state: RootState) => state.onboarding.startingFundsInput
export const selectFundingSourceType = (state: RootState) => state.onboarding.fundingSourceType
export const selectCategoriesSeeded = (state: RootState) => state.onboarding.categoriesSeeded
export const selectPendingBudgets = (state: RootState) => state.onboarding.pendingBudgets
export const selectBudgetEditorDraft = (state: RootState) => state.onboarding.budgetEditorDraft

export default slice.reducer
