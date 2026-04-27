import * as Sentry from '@sentry/react'
import type { ReactElement } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './providers/AppProviders'
import { router } from './router/router'
import { AppErrorPage } from '../shared/components/AppErrorPage'

export function App(): ReactElement {
  return (
    <AppProviders>
      <Sentry.ErrorBoundary fallback={<AppErrorPage />}>
        <RouterProvider router={router} />
      </Sentry.ErrorBoundary>
    </AppProviders>
  )
}
