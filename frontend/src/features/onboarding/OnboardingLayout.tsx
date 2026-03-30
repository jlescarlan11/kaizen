import { type PropsWithChildren, type ReactElement } from 'react'
import { useAppSelector } from '../../app/store/hooks'
import { fluidLayout } from '../../shared/styles/layout'
import { typography } from '../../shared/styles/typography'
import { selectCurrentStep } from './onboardingSlice'
import { ONBOARDING_STEP_METADATA } from './onboardingStep'
import { StepProgress } from './StepProgress'
import { cn } from '../../shared/lib/cn'

type ActiveStep = 'BALANCE' | 'BUDGET'

export function OnboardingLayout({ children }: PropsWithChildren): ReactElement {
  const currentStep = useAppSelector(selectCurrentStep)

  const activeStep: ActiveStep =
    currentStep === 'COMPLETE' ? 'BALANCE' : (currentStep as ActiveStep)

  const metadata = ONBOARDING_STEP_METADATA[activeStep]

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-5xl flex-1 flex-col',
        fluidLayout.shellX,
        fluidLayout.shellY,
      )}
    >
      <div className={fluidLayout.sectionGap}>
        <div className="space-y-6">
          <StepProgress />
          <div className="space-y-2">
            <h1 className={typography.h1}>{metadata.title}</h1>
            <p className={typography['body-sm']}>{metadata.description}</p>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
