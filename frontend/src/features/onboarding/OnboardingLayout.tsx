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
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-8 pt-3 md:pb-10 md:pt-4">
        <div className={pageLayout.sectionCompactGap}>
          <h1 className={typography.h1}>{metadata.title}</h1>
          <p className={typography['body-sm']}>{metadata.description}</p>
        </div>

        <div className="mt-6 flex-1 md:mt-7">{children}</div>
      </main>
    </div>
  )
}
