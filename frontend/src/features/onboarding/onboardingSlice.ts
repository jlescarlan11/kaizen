import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { type RootState } from '../../app/store/store'
import { ONBOARDING_STEP_ORDER, type OnboardingStep } from './onboardingStep'

export interface OnboardingState {
  currentStep: OnboardingStep
  balanceValue: number | null
  budgetChoice: string | null
  categoriesSeeded: boolean
}

const initialState: OnboardingState = {
  currentStep: 'BALANCE',
  balanceValue: null,
  budgetChoice: null,
  categoriesSeeded: false,
}

const slice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setBalanceValue(state, action: PayloadAction<number | null>) {
      state.balanceValue = action.payload
    },
    setBudgetChoice(state, action: PayloadAction<string | null>) {
      state.budgetChoice = action.payload
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
    resetOnboardingState(state) {
      state.currentStep = initialState.currentStep
      state.balanceValue = initialState.balanceValue
      state.budgetChoice = initialState.budgetChoice
      state.categoriesSeeded = initialState.categoriesSeeded
    },
  },
})

export const {
  setBalanceValue,
  setBudgetChoice,
  setCurrentStep,
  advanceToNextStep,
  goToPreviousStep,
  markCategoriesSeeded,
  resetOnboardingState,
} = slice.actions

export const selectOnboardingState = (state: RootState) => state.onboarding
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep
export const selectBalanceValue = (state: RootState) => state.onboarding.balanceValue
export const selectBudgetChoice = (state: RootState) => state.onboarding.budgetChoice
export const selectCategoriesSeeded = (state: RootState) => state.onboarding.categoriesSeeded

export default slice.reducer
