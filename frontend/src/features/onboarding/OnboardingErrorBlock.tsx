import type { ReactElement } from 'react'
import { Button } from '../../shared/components/Button'
import { typography } from '../../shared/styles/typography'
import type { UserFacingOnboardingError } from './onboardingErrorMapper'
import { RETRY_CAP_SUPPORT_TEXT } from './onboardingErrorConstants'

interface OnboardingErrorBlockProps {
  error: UserFacingOnboardingError | null
  onRetry: () => void
  isRetryDisabled: boolean
}

export function OnboardingErrorBlock({
  error,
  onRetry,
  isRetryDisabled,
}: OnboardingErrorBlockProps): ReactElement | null {
  if (!error) {
    return null
  }

  return (
    <div
      className="space-y-4 rounded-xl border border-border-subtle bg-error/10 p-4 text-left"
      role="alert"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none text-text-primary">{error.title}</p>
        <p className={typography['body-sm']}>{error.description}</p>
      </div>
      <Button variant="secondary" onClick={onRetry} isLoading={false} disabled={isRetryDisabled}>
        {error.actionText}
      </Button>
      {isRetryDisabled && (
        <p className="text-xs leading-5 text-text-secondary">{RETRY_CAP_SUPPORT_TEXT}</p>
      )}
    </div>
  )
}
