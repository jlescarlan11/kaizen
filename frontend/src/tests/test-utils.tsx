/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren, ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '../providers/theme'
import { setupStore, type AppStore, type RootState } from '../app/store/store'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
  initialEntries?: string[]
}

function customRender(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    initialEntries = ['/'],
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren): ReactElement {
    const router = createMemoryRouter([{ path: '*', element: children }], { initialEntries })
    return (
      <Provider store={store}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    )
  }
  return { store, ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { customRender as render }
