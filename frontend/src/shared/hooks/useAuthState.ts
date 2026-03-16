import { useState } from 'react'

/**
 * // PRECONDITION: replace useAuthState stub with real session logic.
 * The real implementation will need to handle session tokens, cookies,
 * and likely make a call to an endpoint like /api/me or /api/probe/auth.
 *
 * Real session state might be managed via a client-side store (e.g., Redux,
 * React context), an API-first approach (RTK Query), or by reading
 * session-only cookies directly.
 */

type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Stubbed hook for tracking authentication state.
 * Architected to be replaced with real session logic later.
 */
export function useAuthState(): AuthState {
  // TODO: replace with real session logic
  const [authState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  })

  // Synchronous stub for now: returns { isAuthenticated: false, isLoading: false }
  return authState
}
