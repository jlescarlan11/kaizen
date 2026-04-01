import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from './test-utils'
import { OnboardingLayout } from '../features/onboarding/OnboardingLayout'
import { createInitialOnboardingState } from '../features/onboarding/onboardingSlice'

describe('OnboardingLayout Progress Indicator', () => {
  it('displays "Step 1 of 2" when current step is BALANCE', () => {
    const preloadedState = {
      onboarding: {
        ...createInitialOnboardingState(),
        currentStep: 'BALANCE' as const,
      },
    }

    render(
      <OnboardingLayout>
        <div>Step 1 Content</div>
      </OnboardingLayout>,
      { preloadedState },
    )

    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument()
  })

  it('displays "Step 2 of 2" when current step is BUDGET', () => {
    const preloadedState = {
      onboarding: {
        ...createInitialOnboardingState(),
        currentStep: 'BUDGET' as const,
      },
    }

    render(
      <OnboardingLayout>
        <div>Step 2 Content</div>
      </OnboardingLayout>,
      { preloadedState },
    )

    expect(screen.getByText(/Step 2 of 2/i)).toBeInTheDocument()
  })

  it('applies fully fluid container classes', () => {
    const { container } = render(
      <OnboardingLayout>
        <div>Content</div>
      </OnboardingLayout>,
    )

    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('mx-auto', 'flex', 'w-full', 'max-w-5xl', 'flex-1', 'flex-col')
    expect(root).toHaveClass('px-[clamp(1.25rem,5vw,2rem)]')
    expect(root).toHaveClass('py-[clamp(2rem,8vw,4rem)]')
  })
})
