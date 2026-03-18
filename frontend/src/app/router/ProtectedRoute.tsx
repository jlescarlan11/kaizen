import { type ReactElement } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'

/**
 * ProtectedRoute: A route guard component that prevents unauthenticated access
 * to child routes. Redirects to /signin if not authenticated.
 */
export function ProtectedRoute(): ReactElement | null {
  const { isAuthenticated, isLoading } = useAuthState()
  const location = useLocation()

  // 1. Loading Guard: Show nothing while auth state is resolving
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 2. Auth Guard: Redirect to signin if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  // 3. Authenticated: Render the matched child route
  return <Outlet />
}
