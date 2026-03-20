import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ShellLayout } from './ShellLayout'
import { ProtectedRoute } from './ProtectedRoute'

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
const ProfilePage = lazy(() =>
  import('../../features/your-account/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const YourAccountPage = lazy(() =>
  import('../../features/your-account/YourAccountPage').then((m) => ({
    default: m.YourAccountPage,
  })),
)
const OnboardingPage = lazy(() =>
  import('../../features/onboarding/OnboardingPage').then((m) => ({
    default: m.OnboardingPage,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <ShellLayout />
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
        handle: {
          backButton: {
            label: 'Back',
            // Default fallback if no state.from is present
            fallbackPath: '/',
          },
        },
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'onboarding',
            element: <OnboardingPage />,
          },
          {
            path: 'playground',
            element: <PlaygroundPage />,
          },
          {
            path: 'your-account',
            element: <YourAccountPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'your-account/sessions',
            element: <SessionsPage />,
            handle: {
              backButton: {
                label: 'Account',
                fallbackPath: '/your-account',
              },
            },
          },
          {
            path: 'your-account/profile',
            element: <ProfilePage />,
            handle: {
              backButton: {
                label: 'Account',
                fallbackPath: '/your-account',
              },
            },
          },
          {
            path: 'your-account/appearance',
            element: <AppearancePage />,
            handle: {
              backButton: {
                label: 'Account',
                fallbackPath: '/your-account',
              },
            },
          },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
])
