import { type ReactElement } from 'react'
import { useAppSelector } from '../../app/store/hooks'
import { selectCurrentStep } from './onboardingSlice'
import { ONBOARDING_STEP_ORDER, type OnboardingStep } from './onboardingStep'
import { typography } from '../../shared/styles/typography'
import { cn } from '../../shared/lib/cn'

export function StepProgress(): ReactElement | null {
  const currentStep = useAppSelector(selectCurrentStep)

  // Interactive steps are BALANCE and BUDGET, excluding 'COMPLETE'
  const interactiveSteps = ONBOARDING_STEP_ORDER.filter((step) => step !== 'COMPLETE')
  const totalSteps = interactiveSteps.length
  const currentStepIndex = interactiveSteps.indexOf(
    currentStep as Exclude<OnboardingStep, 'COMPLETE'>,
  )

  // If we're on a step that isn't in our interactive list (like 'COMPLETE'), don't show progress
  if (currentStepIndex === -1) {
    return null
  }

  const stepNumber = currentStepIndex + 1

  return (
    <div
      className="space-y-4"
      aria-label={`Onboarding progress: Step ${stepNumber} of ${totalSteps}`}
    >
      <div className="flex items-center justify-between">
        <span className={cn(typography.label, 'text-foreground')}>
          Step {stepNumber} of {totalSteps}
        </span>
      </div>
      <div className="flex gap-2">
        {interactiveSteps.map((_, index) => (
          <div
            key={index}
            data-testid={`step-indicator-${index}`}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-500',
              index <= currentStepIndex ? 'bg-primary' : 'bg-ui-surface-muted',
            )}
          />
        ))}
      </div>
    </div>
  )
}
