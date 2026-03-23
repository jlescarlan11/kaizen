import { useAppSelector } from '../../app/store/hooks'
import type { User } from '../../app/store/authSlice'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
}

/**
 * Hook for tracking authentication state from Redux.
 */
export function useAuthState(): AuthState {
  const auth = useAppSelector((state) => state.auth)

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  }
}
