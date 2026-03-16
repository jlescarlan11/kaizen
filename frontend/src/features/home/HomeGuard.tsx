import type { ReactElement } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { HomePage } from './HomePage'
import { UnauthenticatedHome } from './UnauthenticatedHome'

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

  // 2. Auth Conditional Branch: Mount the appropriate screen
  // If unauthenticated, show the UnauthenticatedHome screen (stub for now)
  if (!isAuthenticated) {
    return <UnauthenticatedHome />
  }

  // 3. Authenticated Branch: Mount the existing HomePage screen
  return <HomePage />
}
