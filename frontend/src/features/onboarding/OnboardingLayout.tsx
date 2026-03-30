import { type PropsWithChildren, type ReactElement } from 'react'
import { useAppSelector } from '../../app/store/hooks'
import { pageLayout } from '../../shared/styles/layout'
import { typography } from '../../shared/styles/typography'
import { selectCurrentStep } from './onboardingSlice'
import { ONBOARDING_STEP_METADATA } from './onboardingStep'

type ActiveStep = 'BALANCE' | 'BUDGET'

export function OnboardingLayout({ children }: PropsWithChildren): ReactElement {
  const currentStep = useAppSelector(selectCurrentStep)

  const activeStep: ActiveStep =
    currentStep === 'COMPLETE' ? 'BALANCE' : (currentStep as ActiveStep)

  const metadata = ONBOARDING_STEP_METADATA[activeStep]

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
      <div className={pageLayout.sectionCompactGap}>
        <h1 className={typography.h1}>{metadata.title}</h1>
        <p className={typography['body-sm']}>{metadata.description}</p>
      </div>

      <div className="mt-6 flex-1 md:mt-7">{children}</div>
    </div>
  )
}
