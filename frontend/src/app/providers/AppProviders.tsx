import type { PropsWithChildren, ReactElement } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from '../../providers/theme'
import { store } from '../store/store'
import { useGetMeQuery } from '../store/api/authApi'

type AppProvidersProps = PropsWithChildren

/**
 * AuthInitializer: Simple internal component to trigger the initial /api/users/me check.
 * This must be inside the Redux Provider.
 */
function AuthInitializer({ children }: PropsWithChildren): ReactElement {
  // Triggers session check and updates authSlice via onQueryStarted
  useGetMeQuery()

  return <>{children}</>
}

export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthInitializer>
    </Provider>
  )
}
