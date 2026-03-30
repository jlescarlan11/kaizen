import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { render } from './test-utils'
import { OnboardingLayout } from '../features/onboarding/OnboardingLayout'
import { createInitialOnboardingState } from '../features/onboarding/onboardingSlice'

describe('OnboardingProgress', () => {
  it('renders Step 1 of 2 when on BALANCE step', () => {
    const preloadedState = {
      onboarding: { ...createInitialOnboardingState(), currentStep: 'BALANCE' },
    }
    render(<OnboardingLayout>Content</OnboardingLayout>, { preloadedState })
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    expect(screen.getByTestId('step-indicator-0')).toHaveClass('bg-primary')
    expect(screen.getByTestId('step-indicator-1')).toHaveClass('bg-ui-surface-muted')
  })

  it('renders Step 2 of 2 when on BUDGET step', () => {
    const preloadedState = {
      onboarding: { ...createInitialOnboardingState(), currentStep: 'BUDGET' },
    }
    render(<OnboardingLayout>Content</OnboardingLayout>, { preloadedState })
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    expect(screen.getByTestId('step-indicator-0')).toHaveClass('bg-primary')
    expect(screen.getByTestId('step-indicator-1')).toHaveClass('bg-primary')
  })

  it('does not render progress on COMPLETE step', () => {
    const preloadedState = {
      onboarding: { ...createInitialOnboardingState(), currentStep: 'COMPLETE' },
    }
    render(<OnboardingLayout>Content</OnboardingLayout>, { preloadedState })
    expect(screen.queryByText(/Step \d of \d/)).not.toBeInTheDocument()
  })
})
