import type { PropsWithChildren, ReactElement } from 'react'
import { Provider } from 'react-redux'
import { ThemeProvider } from '../../providers/theme'
import { store } from '../store/store'

type AppProvidersProps = PropsWithChildren

export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  )
}
