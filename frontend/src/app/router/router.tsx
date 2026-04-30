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
const PaymentMethodManagementPage = lazy(() =>
  import('../../features/payment-methods/PaymentMethodManagementPage').then((m) => ({
    default: m.PaymentMethodManagementPage,
  })),
)
const PaymentMethodSummaryPage = lazy(() =>
  import('../../features/payment-methods/PaymentMethodSummaryPage').then((m) => ({
    default: m.PaymentMethodSummaryPage,
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
const ReminderRedirectHandler = lazy(() =>
  import('../../features/transactions/components/ReminderRedirectHandler').then((m) => ({
    default: m.ReminderRedirectHandler,
  })),
)
const BalanceHistoryPage = lazy(() =>
  import('../../features/transactions/BalanceHistoryPage').then((m) => ({
    default: m.BalanceHistoryPage,
  })),
)
const BudgetsPage = lazy(() =>
  import('../../features/budgets/BudgetsPage').then((m) => ({
    default: m.BudgetsPage,
  })),
)
const InsightsPage = lazy(() =>
  import('../../features/insights').then((m) => ({
    default: m.InsightsPage,
  })),
)
const BalanceSummaryPage = lazy(() =>
  import('../../features/insights/BalanceSummaryPage').then((m) => ({
    default: m.BalanceSummaryPage,
  })),
)
const TransactionDetailPage = lazy(() =>
  import('../../features/transactions/TransactionDetailPage').then((m) => ({
    default: m.TransactionDetailPage,
  })),
)
const BudgetDetailPage = lazy(() =>
  import('../../features/budgets/BudgetDetailPage').then((m) => ({
    default: m.BudgetDetailPage,
  })),
)
const GoalDetailPage = lazy(() =>
  import('../../features/goals/GoalDetailPage').then((m) => ({
    default: m.GoalDetailPage,
  })),
)

import { TransactionDetailActions } from '../../features/transactions/components/TransactionDetailActions'
import { BudgetIdRedirect } from './BudgetIdRedirect'

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
            label: 'Home',
            // Default fallback if no state.from is present
            fallbackPath: '/',
          },
        },
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        errorElement: <AppErrorPage />,
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
                    label: 'Balance setup',
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
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'transactions/:id',
            element: <TransactionDetailPage />,
            handle: {
              backButton: {
                label: 'Transactions',
                fallbackPath: '/transactions',
              },
              actions: <TransactionDetailActions />,
            },
          },
          {
            path: 'transactions/reminder/:id',
            element: <ReminderRedirectHandler />,
          },
          {
            path: 'transactions/edit/:id',
            element: <TransactionEntryPage />,
            handle: {
              backButton: {
                label: 'Transactions',
                fallbackPath: '/transactions',
              },
            },
          },
          {
            path: 'transactions/history',
            element: <BalanceHistoryPage />,
            handle: {
              backButton: {
                label: 'Transactions',
                fallbackPath: '/transactions',
              },
            },
          },
          {
            path: 'transactions',
            element: <TransactionListPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'payment-summary',
            element: <PaymentMethodSummaryPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'budgets/:id',
            element: <BudgetDetailPage />,
            handle: {
              backButton: {
                label: 'Budgets',
                fallbackPath: '/budgets',
              },
            },
          },
          {
            path: 'budgets',
            element: <BudgetsPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'budgets/add',
            element: <ManualBudgetSetupPage />,
            handle: {
              backButton: {
                label: 'Budgets',
                fallbackPath: '/budgets',
              },
            },
          },
          // Redirects from old singular paths (U-COPY-6) — preserves bookmarks
          { path: 'budget', element: <Navigate to="/budgets" replace /> },
          { path: 'budget/add', element: <Navigate to="/budgets/add" replace /> },
          { path: 'budget/:id', element: <BudgetIdRedirect /> },
          {
            path: 'goals/:id',
            element: <GoalDetailPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'insights',
            element: <InsightsPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'balance-summary',
            element: <BalanceSummaryPage />,
            handle: {
              backButton: {
                label: 'Home',
                fallbackPath: '/',
              },
            },
          },
          {
            path: 'your-account',
            element: <YourAccountPage />,
            handle: {
              backButton: {
                label: 'Home',
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
          {
            path: 'your-account/payment-methods',
            element: <PaymentMethodManagementPage />,
            handle: {
              backButton: {
                label: 'Account',
                fallbackPath: '/your-account',
              },
            },
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
