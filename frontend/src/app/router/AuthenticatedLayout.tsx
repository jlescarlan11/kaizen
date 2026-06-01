import { useState, type ReactElement } from 'react'
import { Outlet, NavLink, useMatches, useNavigate } from 'react-router-dom'
import { AppErrorPage } from '../../shared/components/AppErrorPage'
import { ErrorBoundary } from '../../shared/components/ErrorBoundary'
import { Breadcrumb } from '../../shared/components/Breadcrumb'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useLogoutMutation } from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { AddEntryFAB } from '../../shared/components/AddEntryFAB'
import { clearStoredOnboardingDraft } from '../../features/onboarding/onboardingDraftStorage'
import { UndoSnackbar } from '../../shared/components/UndoSnackbar'
import { ConnectivityIndicator } from '../../shared/components/ConnectivityIndicator'
import { showAlert } from '../../app/store/notificationSlice'
import { useAppDispatch } from '../../app/store/hooks'
import {
  DashboardTourAnchorsProvider,
  type DashboardTourAnchorKey,
} from '../../features/home/DashboardTourAnchorsContext'
import { AppSidebar } from '../../shared/components/AppSidebar'
import { BreadcrumbLabelProvider } from '../../shared/components/BreadcrumbLabelContext'

interface RouteHandle {
  actions?: ReactElement
  hideHeader?: boolean
}

/**
 * AuthenticatedLayout: The app shell for authenticated users.
 * Implements a sidebar-first layout:
 * - Desktop: Permanent sidebar (icon rail at md, full at lg) via AppSidebar.
 * - Mobile: Drawer via AppSidebar + hamburger button in top bar.
 */
export function AuthenticatedLayout(): ReactElement {
  return (
    <DashboardTourAnchorsProvider>
      <AuthenticatedLayoutContent />
    </DashboardTourAnchorsProvider>
  )
}

function AuthenticatedLayoutContent(): ReactElement {
  const { user } = useAuthState()
  const dispatch = useAppDispatch()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const matches = useMatches()
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Extract navigation metadata from the current route match
  const lastMatch = matches[matches.length - 1]
  const handle = lastMatch?.handle as RouteHandle | undefined
  const hideHeader = !!handle?.hideHeader

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap()
      if (user) {
        clearStoredOnboardingDraft(user.id)
      }
      setIsLogoutModalOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  type NavItem = {
    label: string
    to: string
    icon: ReactElement
    end?: boolean
    anchorKey?: DashboardTourAnchorKey
  }

  const navItems: ReadonlyArray<NavItem> = [
    { label: 'Home', to: '/', icon: <HomeIcon />, end: true },
    { label: 'Transactions', to: '/transactions', icon: <TransactionsIcon /> },
    { label: 'Budgets', to: '/budgets', icon: <BudgetIcon />, anchorKey: 'budgetsTab' },
    { label: 'Insights', to: '/insights', icon: <InsightsIcon /> },
    { label: 'Goals', to: '/goals', icon: <GoalIcon />, anchorKey: 'goalsTab' },
    { label: 'Categories', to: '/categories', icon: <CategoriesIcon /> },
    { label: 'Payments', to: '/payment-summary', icon: <PaymentsIcon /> },
  ]

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '??'

  return (
    <BreadcrumbLabelProvider>
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* Sidebar */}
      <AppSidebar
        navItems={navItems}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
        userInitials={userInitials}
        userPicture={user?.picture}
        userName={user?.name}
      />

      {/* Main content — offset by sidebar width */}
      <div className="flex flex-col min-h-screen md:ml-14 lg:ml-56">
        {/* Top bar */}
        {!hideHeader && (
          <header className="sticky top-0 z-20 h-12 bg-background/90 backdrop-blur-md border-b border-border/10 flex items-center px-4 md:px-6 gap-3">
            {/* Mobile: hamburger to open drawer */}
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-secondary transition-colors text-text-secondary"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </button>

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {handle?.actions}
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors relative text-text-secondary"
                aria-label="Notifications"
              >
                <NotificationIcon />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error rounded-full border border-background" />
              </button>
              <NavLink
                to="/your-account"
                className="h-7 w-7 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-3xs font-semibold text-text-secondary overflow-hidden hover:border-primary/50 transition-all shrink-0"
              >
                {user?.picture && !imageError ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  userInitials
                )}
              </NavLink>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl animate-entrance-slide-up">
            <Breadcrumb />
            <ErrorBoundary fallback={<AppErrorPage />}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <UndoSnackbar />
      <ConnectivityIndicator />
      <AddEntryFAB
        onAddTransaction={() => navigate('/transactions/add')}
        onCreateBudget={() => navigate('/budgets/add')}
        onCreateGoal={() => navigate('/goals')}
        onHoldPurchase={() =>
          void dispatch(
            showAlert({
              title: 'Hold Purchase',
              message: 'This feature is coming soon!',
              type: 'info',
            }),
          )
        }
      />
    </BreadcrumbLabelProvider>
  )
}

/* ───────── ICON COMPONENTS (Internal SVGs) ───────── */

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function GoalIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 13V2" />
      <path d="M12 13l-4 4" />
      <path d="M12 13l4 4" />
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function NotificationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function TransactionsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l4-4 4 4" />
      <path d="M7 5v14" />
      <path d="M21 15l-4 4-4-4" />
      <path d="M17 19V5" />
    </svg>
  )
}

function InsightsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20V14" />
    </svg>
  )
}

function CategoriesIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function PaymentsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  )
}
