import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ShellLayout } from './ShellLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Critical/small pages are imported directly to avoid unnecessary network overhead
import { HomeGuard } from '../../features/home/HomeGuard'
import { SigninPage } from '../../features/signin/SigninPage'
import { NotFoundPage } from '../../features/not-found/NotFoundPage'

import { OnboardingGuard } from '../../features/onboarding/OnboardingGuard'

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
const CategoryManagementPage = lazy(() =>
  import('../../features/categories/CategoryManagementPage').then((m) => ({
    default: m.CategoryManagementPage,
  })),
)
const BalanceEditPage = lazy(() =>
  import('../../features/balance/BalanceEditPage').then((m) => ({
    default: m.BalanceEditPage,
  })),
)
const SmartBudgetPage = lazy(() =>
  import('../../features/budgets/SmartBudgetPage').then((m) => ({
    default: m.SmartBudgetPage,
  })),
)
const ManualBudgetSetupPage = lazy(() =>
  import('../../features/budgets/ManualBudgetSetupPage').then((m) => ({
    default: m.ManualBudgetSetupPage,
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
            element: <OnboardingGuard />,
            children: [
              {
                index: true,
                element: <OnboardingPage />,
              },
            ],
          },
          {
            path: 'playground',
            element: <PlaygroundPage />,
          },
          {
            path: 'budget',
            element: <SmartBudgetPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'budget/manual',
            element: <ManualBudgetSetupPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/budget',
              },
            },
          },
          {
            path: 'balance/edit',
            // Placement-agnostic stub: instructs future nav shells where to render the balance editor once
            // PRD Open Question 9 (dashboard vs. settings) is answered.
            element: <BalanceEditPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/',
              },
            },
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
          {
            path: 'your-account/categories',
            element: <CategoryManagementPage />,
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
