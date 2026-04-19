import { useAppSelector } from '../../app/store/hooks'
import type { User } from '../../app/store/authSlice'
import { authApi } from '../../app/store/api/authApi'

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

  // Use the query hook to benefit from tag invalidation and automatic re-fetching
  const { data: apiUser, isLoading: isApiLoading } = authApi.useGetMeQuery(undefined, {
    skip: !auth.isAuthenticated,
  })

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || isApiLoading,
    user: apiUser || auth.user,
  }
}
