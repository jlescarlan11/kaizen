import { type ReactElement } from 'react'
import { Outlet, useLocation, useNavigate, useMatches } from 'react-router-dom'
import { MainContent } from '../../shared/components/MainContent'
import { SiteFooter } from '../../shared/components/SiteFooter'
import { SiteHeader } from '../../shared/components/SiteHeader'
import { Button } from '../../shared/components/Button'

interface RouteHandle {
  backButton?: {
    label: string
    fallbackPath: string
  }
}

/**
 * RootLayout: The main application shell.
 * Uses modular SiteHeader, SiteFooter, and MainContent components.
 */
export function RootLayout(): ReactElement {
  const location = useLocation()
  const navigate = useNavigate()
  const matches = useMatches()
  const isSigninPage = location.pathname === '/signin'

  // Extract navigation metadata from the current route match
  const lastMatch = matches[matches.length - 1]
  const handle = lastMatch?.handle as RouteHandle | undefined
  const backButtonConfig = handle?.backButton

  const handleBack = (): void => {
    if (backButtonConfig?.fallbackPath) {
      navigate(backButtonConfig.fallbackPath, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      {backButtonConfig ? (
        <header className="h-20 w-full flex items-center">
          <div className="mx-auto w-full max-w-5xl px-5 md:px-10">
            <Button
              variant="secondary"
              className="group flex items-center gap-2 px-0! bg-transparent! hover:bg-transparent! border-none"
              onClick={handleBack}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="transition-transform group-hover:-translate-x-1"
              >
                <path
                  d="M15.8333 10H4.16667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 15.8333L4.16667 10L10 4.16667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{backButtonConfig.label}</span>
            </Button>
          </div>
        </header>
      ) : (
        <SiteHeader />
      )}

      <MainContent>
        <Outlet />
      </MainContent>

      {!backButtonConfig && !isSigninPage && <SiteFooter />}
    </div>
  )
}
