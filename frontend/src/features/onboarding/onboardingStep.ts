export type OnboardingStep = 'BALANCE' | 'BUDGET' | 'COMPLETE'

// TODO: Additional steps (PRD Open Question 3) should be inserted into this array in order.
export const ONBOARDING_STEP_ORDER: OnboardingStep[] = ['BALANCE', 'BUDGET', 'COMPLETE']

export interface OnboardingStepMetadata {
  title: string
  description: string
}

export const ONBOARDING_STEP_METADATA: Record<
  Exclude<OnboardingStep, 'COMPLETE'>,
  OnboardingStepMetadata
> = {
  BALANCE: {
    title: 'Set your starting funds',
    description: 'Enter the money you currently have available and choose where it is held.',
  },
  BUDGET: {
    title: 'Set your first budgets',
    description:
      'Start with suggested amounts, adjust what you need, and finish onboarding from one screen.',
  },
}

export const ONBOARDING_STEP_ROUTE_MAP: Record<OnboardingStep, string> = {
  BALANCE: '/onboarding/balance',
  BUDGET: '/onboarding/budget',
  COMPLETE: '/',
}

export const ROUTE_TO_ONBOARDING_STEP: Record<string, OnboardingStep | undefined> = {
  '/onboarding/balance': 'BALANCE',
  '/onboarding/budget': 'BUDGET',
}

export function getNextStep(current: OnboardingStep): OnboardingStep {
  const index = ONBOARDING_STEP_ORDER.indexOf(current)
  if (index === -1 || index === ONBOARDING_STEP_ORDER.length - 1) {
    return current
  }
  return ONBOARDING_STEP_ORDER[index + 1]
}

export function getPreviousStep(current: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEP_ORDER.indexOf(current)
  if (index <= 0) {
    return null
  }
  return ONBOARDING_STEP_ORDER[index - 1]
}
