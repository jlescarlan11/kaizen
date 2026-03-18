import { useAppSelector } from '../../app/store/hooks'

type AuthState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    id: string
    name: string
    email: string
  } | null
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
