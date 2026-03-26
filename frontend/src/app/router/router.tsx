import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ShellLayout } from './ShellLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Critical/small pages are imported directly to avoid unnecessary network overhead
import { HomeGuard } from '../../features/home/HomeGuard'
import { SigninPage } from '../../features/signin/SigninPage'
import { NotFoundPage } from '../../features/not-found/NotFoundPage'
import { AppErrorPage } from '../../shared/components/AppErrorPage'

import { OnboardingGuard } from '../../features/onboarding/OnboardingGuard'
import { OnboardingLayout } from '../../features/onboarding/OnboardingLayout'
import { BalanceSetupStep } from '../../features/onboarding/BalanceSetupStep'
import { OnboardingBudgetStep } from '../../features/onboarding/OnboardingBudgetStep'
import { ONBOARDING_STEP_ROUTE_MAP } from '../../features/onboarding/onboardingStep'

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
const CategoryManagementPage = lazy(() =>
  import('../../features/categories/CategoryManagementPage').then((m) => ({
    default: m.CategoryManagementPage,
  })),
)
const ManualBudgetSetupPage = lazy(() =>
  import('../../features/budgets/ManualBudgetSetupPage').then((m) => ({
    default: m.ManualBudgetSetupPage,
  })),
)
const TransactionEntryPage = lazy(() =>
  import('../../features/transactions/TransactionEntryPage').then((m) => ({
    default: m.TransactionEntryPage,
  })),
)
const TransactionListPage = lazy(() =>
  import('../../features/transactions/TransactionListPage').then((m) => ({
    default: m.TransactionListPage,
  })),
)
const BudgetsPage = lazy(() =>
  import('../../features/budgets/BudgetsPage').then((m) => ({
    default: m.BudgetsPage,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <AppErrorPage />,
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
                element: <Navigate to={ONBOARDING_STEP_ROUTE_MAP['BALANCE']} replace />,
              },
              {
                path: 'balance',
                element: (
                  <OnboardingLayout>
                    <BalanceSetupStep />
                  </OnboardingLayout>
                ),
                handle: {
                  backButton: {
                    label: 'Logout',
                    fallbackPath: '/signin',
                  },
                },
              },
              {
                path: 'budget',
                element: (
                  <OnboardingLayout>
                    <OnboardingBudgetStep />
                  </OnboardingLayout>
                ),
                handle: {
                  backButton: {
                    label: 'Back',
                    fallbackPath: '/onboarding/balance',
                  },
                },
              },
              // Placeholder for future steps (PRD Open Question 3).
            ],
          },
          {
            path: 'playground',
            element: <PlaygroundPage />,
          },
          {
            path: 'transactions/add',
            element: <TransactionEntryPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'transactions/edit/:id',
            element: <TransactionEntryPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/transactions',
              },
            },
          },
          {
            path: 'transactions',
            element: <TransactionListPage />,
            handle: {
              backButton: {
                label: 'Back',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'budget',
            element: <BudgetsPage />,
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
