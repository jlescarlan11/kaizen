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

export interface InitialBalance {
  paymentMethodId: number
  amount: number
}

export interface OnboardingState {
  currentStep: OnboardingStep
  startingFunds: number | null
  startingFundsInput: string
  fundingSourceType: FundingSourceType | null
  categoriesSeeded: boolean
  pendingBudgets: PendingBudget[]
  budgetEditorDraft: BudgetEditorDraft
  initialTransactionDescription?: string
  initialTransactionNotes?: string
  initialTransactionPaymentMethodId?: number
  initialTransactionDate?: string
  initialBalances: InitialBalance[]
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
  initialBalances: [],
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
    setInitialTransactionData(
      state,
      action: PayloadAction<{
        description?: string
        notes?: string
        paymentMethodId?: number
        transactionDate?: string
      }>,
    ) {
      state.initialTransactionDescription = action.payload.description
      state.initialTransactionNotes = action.payload.notes
      state.initialTransactionPaymentMethodId = action.payload.paymentMethodId
      state.initialTransactionDate = action.payload.transactionDate
    },
    addInitialBalance(state, action: PayloadAction<InitialBalance>) {
      state.initialBalances.push(action.payload)
    },
    removeInitialBalance(state, action: PayloadAction<number>) {
      state.initialBalances = state.initialBalances.filter(
        (b) => b.paymentMethodId !== action.payload,
      )
    },
    updateInitialBalance(state, action: PayloadAction<InitialBalance>) {
      const index = state.initialBalances.findIndex(
        (b) => b.paymentMethodId === action.payload.paymentMethodId,
      )
      if (index !== -1) {
        state.initialBalances[index] = action.payload
      } else {
        state.initialBalances.push(action.payload)
      }
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
      if (action.payload.initialTransactionDescription !== undefined) {
        state.initialTransactionDescription = action.payload.initialTransactionDescription
      }
      if (action.payload.initialTransactionNotes !== undefined) {
        state.initialTransactionNotes = action.payload.initialTransactionNotes
      }
      if (action.payload.initialTransactionPaymentMethodId !== undefined) {
        state.initialTransactionPaymentMethodId = action.payload.initialTransactionPaymentMethodId
      }
      if (action.payload.initialTransactionDate !== undefined) {
        state.initialTransactionDate = action.payload.initialTransactionDate
      }
      if (action.payload.initialBalances !== undefined) {
        state.initialBalances = action.payload.initialBalances
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
      state.initialTransactionDescription = undefined
      state.initialTransactionNotes = undefined
      state.initialTransactionPaymentMethodId = undefined
      state.initialTransactionDate = undefined
      state.initialBalances = []
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
  setInitialTransactionData,
  addInitialBalance,
  removeInitialBalance,
  updateInitialBalance,
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
export const selectInitialTransactionDescription = (state: RootState) =>
  state.onboarding.initialTransactionDescription
export const selectInitialTransactionNotes = (state: RootState) =>
  state.onboarding.initialTransactionNotes
export const selectInitialTransactionPaymentMethodId = (state: RootState) =>
  state.onboarding.initialTransactionPaymentMethodId
export const selectInitialTransactionDate = (state: RootState) =>
  state.onboarding.initialTransactionDate
export const selectInitialBalances = (state: RootState) => state.onboarding.initialBalances

export default slice.reducer
