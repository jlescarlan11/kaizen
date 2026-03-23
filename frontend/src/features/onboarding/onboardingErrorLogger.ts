import * as Sentry from '@sentry/react'
import type { OnboardingStep } from './onboardingStep'

/**
 * Shared constants used by Instructions 1 and 2; Instruction 2 wires this to Sentry.
 * The values map directly to the onboarding steps and error classes that are rendered to the user.
 */
export const OnboardingErrorType = {
  Network: 'NETWORK',
  Validation: 'VALIDATION',
  Server: 'SERVER',
} as const

export type OnboardingErrorType = (typeof OnboardingErrorType)[keyof typeof OnboardingErrorType]

// Populate `VITE_SENTRY_DSN` in release environments so instrumentation is enabled; leave blank locally to keep the helper opt-in.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN?.trim()
const sentryEnvironment = import.meta.env.VITE_SENTRY_ENV?.trim() ?? import.meta.env.MODE

let sentryInitialized = false

function initSentry(): void {
  if (sentryInitialized || !sentryDsn) {
    return
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
  })

  sentryInitialized = true
}

export function logOnboardingError(
  type: OnboardingErrorType,
  step: OnboardingStep,
  timestamp: Date,
): void {
  if (type === OnboardingErrorType.Validation) {
    // PRD Open Question 3: validation (`400`) errors are excluded from Sentry logging by default.
    return
  }

  initSentry()

  // Guard in case initialization skipped because the DSN was not configured.
  if (!sentryInitialized) {
    return
  }

  Sentry.captureEvent({
    level: 'error',
    message: 'Onboarding error captured',
    extra: {
      errorType: type,
      onboardingStep: step,
      timestamp: timestamp.toISOString(),
    },
    // Only metadata is serialized — no balance, budget, or category identifiers are ever logged.
  })
}
