import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { OnboardingErrorType, logOnboardingError } from './onboardingErrorLogger'
import {
  NETWORK_ERROR_ACTION,
  NETWORK_ERROR_DESCRIPTION,
  NETWORK_ERROR_TITLE,
  SERVER_ERROR_ACTION,
  SERVER_ERROR_DESCRIPTION,
  SERVER_ERROR_TITLE,
  VALIDATION_ERROR_ACTION,
  VALIDATION_ERROR_DESCRIPTION,
  VALIDATION_ERROR_TITLE,
  UNKNOWN_ERROR_ACTION,
  UNKNOWN_ERROR_DESCRIPTION,
  UNKNOWN_ERROR_TITLE,
} from './onboardingErrorConstants'
import type { OnboardingStep } from './onboardingStep'

export type OnboardingErrorKind = 'network' | 'validation' | 'server' | 'unknown'

export interface UserFacingOnboardingError {
  kind: OnboardingErrorKind
  title: string
  description: string
  actionText: string
}

export const MAX_RETRY_ATTEMPTS = 3 // Placeholder per PRD Open Question 7; update after confirmation.

export function mapOnboardingError(
  error: unknown,
  step: OnboardingStep,
): UserFacingOnboardingError {
  const kind = determineErrorKind(error)
  const payload = buildPayloadForKind(kind)

  if (kind === 'network') {
    logOnboardingError(OnboardingErrorType.Network, step, new Date())
  } else if (kind === 'server') {
    logOnboardingError(OnboardingErrorType.Server, step, new Date())
  }

  return payload
}

function buildPayloadForKind(kind: OnboardingErrorKind): UserFacingOnboardingError {
  switch (kind) {
    case 'network':
      return {
        kind,
        title: NETWORK_ERROR_TITLE,
        description: NETWORK_ERROR_DESCRIPTION,
        actionText: NETWORK_ERROR_ACTION,
      }
    case 'validation':
      return {
        kind,
        title: VALIDATION_ERROR_TITLE,
        description: VALIDATION_ERROR_DESCRIPTION,
        actionText: VALIDATION_ERROR_ACTION,
      }
    case 'server':
      return {
        kind,
        title: SERVER_ERROR_TITLE,
        description: SERVER_ERROR_DESCRIPTION,
        actionText: SERVER_ERROR_ACTION,
      }
    case 'unknown':
    default:
      return {
        kind: 'unknown',
        title: UNKNOWN_ERROR_TITLE,
        description: UNKNOWN_ERROR_DESCRIPTION,
        actionText: UNKNOWN_ERROR_ACTION,
      }
  }
}

function determineErrorKind(error: unknown): OnboardingErrorKind {
  if (isFetchBaseQueryError(error)) {
    const status = error.status
    if (status === 400) {
      return 'validation'
    }
    if (typeof status === 'number' && status >= 500) {
      return 'server'
    }
    if (status === 'FETCH_ERROR' || status === 'PARSING_ERROR' || status === 'TIMEOUT_ERROR') {
      return 'network'
    }
    return 'server'
  }

  return 'unknown'
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (typeof (error as FetchBaseQueryError).status === 'number' ||
      typeof (error as FetchBaseQueryError).status === 'string')
  )
}
