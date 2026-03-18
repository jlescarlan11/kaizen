import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'

// Critical/small pages are imported directly to avoid unnecessary network overhead
import { HomeGuard } from '../../features/home/HomeGuard'
import { SigninPage } from '../../features/signin/SigninPage'
import { NotFoundPage } from '../../features/not-found/NotFoundPage'

// Lazy load larger or secondary feature pages
const PlaygroundPage = lazy(() =>
  import('../../features/playground/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage })),
)
const AppearancePage = lazy(() =>
  import('../../features/your-account/AppearancePage').then((m) => ({ default: m.AppearancePage })),
)
const SessionsPage = lazy(() =>
  import('../../features/your-account/SessionsPage').then((m) => ({ default: m.SessionsPage })),
)
const YourAccountPage = lazy(() =>
  import('../../features/your-account/YourAccountPage').then((m) => ({
    default: m.YourAccountPage,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <RootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <HomeGuard />,
      },
      {
        path: 'playground',
        element: <PlaygroundPage />,
      },
      {
        path: 'signin',
        element: <SigninPage />,
      },
      {
        path: 'your-account',
        element: <YourAccountPage />,
      },
      {
        path: 'your-account/appearance',
        element: <AppearancePage />,
      },
      {
        path: 'your-account/sessions',
        element: <SessionsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
