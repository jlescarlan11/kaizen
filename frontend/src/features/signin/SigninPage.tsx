import { type ReactElement, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { typography, GoogleLoginButton, EntryLayout } from '../../shared/components'

const ERROR_MESSAGES: Record<string, string> = {
  ACCOUNT_EXISTS: 'An account with this email already exists. Please log in instead.',
  PROVIDER_UNAVAILABLE: 'Google service is temporarily unavailable. Please try again later.',
  INVALID_REQUEST: 'Something went wrong with the request. Please try again.',
}

export function SigninPage(): ReactElement {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (error) {
      // Strip error from URL without refreshing or adding a history entry
      const newUrl = window.location.origin + window.location.pathname
      window.history.replaceState({ path: newUrl }, '', newUrl)
    }
  }, [error])

  const errorMessage = error
    ? ERROR_MESSAGES[error] || 'An unexpected error occurred. Please try again.'
    : null

  const header = (
    <header className="space-y-2 text-left">
      <h2 className={typography.h2}>Sign in to continue</h2>
      <p className={typography['body-lg']}>
        Use your preferred method to access your Kaizen account
      </p>
    </header>
  )

  const footer = (
    <p className={`px-4 ${typography['body-sm']} lg:max-w-lg lg:px-0`}>
      By signing in, you agree to our{' '}
      <Link to="/terms" className="font-medium text-foreground hover:underline">
        Terms
      </Link>{' '}
      and{' '}
      <Link to="/privacy" className="font-medium text-foreground hover:underline">
        Privacy Policy
      </Link>
      .
    </p>
  )

  return (
    <EntryLayout header={header} footer={footer}>
      <div className="space-y-6 lg:space-y-4">
        {errorMessage && (
          <div
            className="rounded-lg bg-ui-danger-subtle p-4 text-sm text-ui-danger-text ring-1 ring-ui-danger-subtle"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <GoogleLoginButton />
      </div>
    </EntryLayout>
  )
}
