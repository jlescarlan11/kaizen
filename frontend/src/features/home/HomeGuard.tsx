import { type ReactElement, Suspense, lazy } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { UnauthenticatedHome } from './UnauthenticatedHome'

const HomePage = lazy(() => import('./HomePage').then((m) => ({ default: m.HomePage })))

/**
 * HomeGuard: A root route guard that conditionally mounts the authenticated
 * or unauthenticated home screen based on the current auth state.
 */
export function HomeGuard(): ReactElement | null {
  const { isAuthenticated, isLoading } = useAuthState()

  // 1. Loading Guard: Show nothing while auth state is resolving
  if (isLoading) {
    return null
  }

  // 2. Auth Conditional Branch: Render UnauthenticatedHome directly for speed,
  // or the lazy-loaded HomePage if authenticated.
  if (isAuthenticated) {
    return (
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    )
  }

  return <UnauthenticatedHome />
}
