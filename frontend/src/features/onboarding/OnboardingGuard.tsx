import { type ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'

/**
 * OnboardingGuard: Protects the /onboarding route. If a user has already
 * completed onboarding, they are redirected to the dashboard (/).
 */
export function OnboardingGuard(): ReactElement | null {
  const { isAuthenticated, isLoading, user } = useAuthState()

  // 1. Loading Guard: Show nothing while auth state is resolving
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 2. Auth Guard: Redirect to signin if not authenticated (should be handled by ProtectedRoute, but for safety)
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // 3. Bypass Guard: If onboarding is already complete, redirect to dashboard.
  if (user?.onboardingCompleted) {
    return <Navigate to="/" replace />
  }

  /*
   * TODO: Partial-completion handling (PRD Open Question 2).
   * If the user is mid-onboarding, should they be forced to the beginning
   * or allowed to stay on their current step? For now, we allow access
   * to the onboarding route if not confirmed as complete.
   */

  // 4. Onboarding not complete: Render the onboarding content.
  return <Outlet />
}
