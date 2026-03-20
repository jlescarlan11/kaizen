import { type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { AuthenticatedLayout } from './AuthenticatedLayout'
import { RootLayout } from './RootLayout'

/**
 * ShellLayout: A top-level layout switcher that decides which app shell to use.
 * - Authenticated: Uses AuthenticatedLayout (Sidebar + App Header)
 * - Unauthenticated: Uses RootLayout (Top Navigation + Footer)
 * - Sign-in: Always uses RootLayout (for consistent landing/auth experience)
 */
export function ShellLayout(): ReactElement {
  const { isAuthenticated, isLoading } = useAuthState()
  const location = useLocation()

  // 1. Loading state: Show a simple loader while resolving auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const isSigninPage = location.pathname === '/signin'

  // 2. Decision logic:
  // If the user is authenticated and NOT on the sign-in page, use the Sidebar-based shell.
  // Otherwise, use the standard top-navigation shell.
  if (isAuthenticated && !isSigninPage) {
    return <AuthenticatedLayout />
  }

  return <RootLayout />
}
