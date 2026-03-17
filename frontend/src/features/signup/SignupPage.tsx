import { type ReactElement } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KaizenLogo, typography, GoogleLoginButton } from '../../shared/components'

const ERROR_MESSAGES: Record<string, string> = {
  ACCOUNT_EXISTS: 'An account with this email already exists. Please log in instead.',
  PROVIDER_UNAVAILABLE: 'Google service is temporarily unavailable. Please try again later.',
  INVALID_REQUEST: 'Something went wrong with the sign-up request. Please try again.',
}

export function SignupPage(): ReactElement {
  const currentYear = new Date().getFullYear()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  const errorMessage = error
    ? ERROR_MESSAGES[error] || 'An unexpected error occurred. Please try again.'
    : null

  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-5xl items-center lg:grid lg:grid-cols-2 lg:gap-24">
        {/* LEFT SIDE / TOP SECTION */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md space-y-6 text-center lg:max-w-xl lg:text-left">
            <header className="flex flex-col items-center space-y-6 lg:items-start lg:space-y-4">
              <KaizenLogo className="h-20 w-20 lg:h-12 lg:w-12" />
              <div className="space-y-3 lg:space-y-4">
                <h1 className={typography.h1}>Welcome to Kaizen</h1>
                <p className={typography['body-lg']}>
                  The Finance Manager for Every Filipino Student
                </p>
              </div>
            </header>

            <div className="hidden space-y-8 lg:block">
              <p className={`max-w-lg ${typography['body-sm']}`}>
                Track every peso, pause impulse buys, and save for what actually matters.
              </p>
              <p className={typography.caption}>
                © {currentYear} Kaizen Finance, Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE / BOTTOM SECTION */}
        <div className="mt-12 flex items-center justify-center lg:mt-0 lg:justify-start">
          <div className="w-full max-w-md space-y-12 text-center lg:max-w-xl lg:space-y-8 lg:text-left">
            <header className="hidden space-y-2 text-left lg:block">
              <h2 className={typography.h2}>Sign up to continue</h2>
              <p className={typography['body-lg']}>
                Choose your preferred method to create your Kaizen account
              </p>
            </header>

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

              <p className={`px-4 ${typography['body-sm']} lg:max-w-lg lg:px-0`}>
                By signing up, you agree to our{' '}
                <Link to="/terms" className="font-medium text-foreground hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-foreground hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <footer className="lg:hidden">
              <p className={typography.caption}>
                © {currentYear} Kaizen Finance, Inc. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
