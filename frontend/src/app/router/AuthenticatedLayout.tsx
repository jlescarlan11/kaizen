import { useState, type ReactElement } from 'react'
import { Outlet, NavLink, useMatches, useNavigate } from 'react-router-dom'
import { AppErrorPage } from '../../shared/components/AppErrorPage'
import { ErrorBoundary } from '../../shared/components/ErrorBoundary'
import { KaizenLogo } from '../../shared/components/KaizenLogo'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useMediaQuery } from '../../shared/hooks/useMediaQuery'
import { useLogoutMutation } from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { cn } from '../../shared/lib/cn'
import { pageLayout } from '../../shared/styles/layout'
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
import { useRegisterDashboardTourAnchor } from '../../features/home/DashboardTourAnchorsHooks'

interface RouteHandle {
  backButton?: {
    label: string
    fallbackPath: string
  }
  actions?: ReactElement
  hideHeader?: boolean
}

/**
 * AuthenticatedLayout: The app shell for authenticated users.
 * Implements a "Wise-inspired" layout:
 * - Desktop: Permanent sidebar with Logo and Navigation.
 * - Mobile: Top header, Bottom navigation.
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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const matches = useMatches()
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const registerBudgetsTab = useRegisterDashboardTourAnchor('budgetsTab')
  const registerGoalsTab = useRegisterDashboardTourAnchor('goalsTab')

  // Extract navigation metadata from the current route match
  const lastMatch = matches[matches.length - 1]
  const handle = lastMatch?.handle as RouteHandle | undefined
  const backButtonConfig = handle?.backButton
  const isSecondDegree = !!backButtonConfig
  const hideHeader = !!handle?.hideHeader

  const handleBack = (): void => {
    if (backButtonConfig?.fallbackPath) {
      navigate(backButtonConfig.fallbackPath)
    } else {
      navigate(-1)
    }
  }

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
    isAction?: boolean
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
    <div className="flex min-h-screen bg-background text-text-primary font-body">
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* ───────── SIDEBAR (Desktop Only) ───────── */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-background flex flex-col z-30 border-r border-border-subtle">
          <div className="h-16 flex items-center px-8">
            <NavLink to="/" className="flex items-center gap-3">
              <KaizenLogo className="h-8 w-8" />
              <span className="text-xl font-semibold tracking-tight text-text-primary">Kaizen</span>
            </NavLink>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const anchorRef = item.anchorKey
                ? item.anchorKey === 'budgetsTab'
                  ? registerBudgetsTab
                  : registerGoalsTab
                : undefined

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary font-medium',
                    )
                  }
                  ref={anchorRef}
                >
                  <span className={cn('shrink-0 transition-transform duration-200')}>
                    {item.icon}
                  </span>
                  <span className="tracking-tight">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>
      )}

      {/* ───────── MAIN CONTENT AREA ───────── */}
      <div className={cn('flex-1 flex flex-col min-w-0', !isMobile && 'md:ml-64')}>
        {/* ───────── HEADER SPACER ───────── */}
        {!hideHeader && <div className="h-16 w-full shrink-0" />}

        {/* ───────── HEADER ───────── */}
        {!hideHeader && (
          <header
            className={cn(
              'fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md z-20 px-6 md:px-10 border-b border-border/5',
              !isMobile && 'md:left-64',
            )}
          >
            <div className="mx-auto h-full w-full max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isSecondDegree ? (
                  <button
                    type="button"
                    className="group flex items-center gap-2 text-text-primary transition-colors hover:opacity-70"
                    onClick={handleBack}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:-translate-x-0.5"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span className="text-base font-semibold tracking-tight">
                      {backButtonConfig.label}
                    </span>
                  </button>
                ) : (
                  isMobile && (
                    <NavLink to="/" className="flex items-center gap-2">
                      <KaizenLogo className="h-8 w-8" />
                    </NavLink>
                  )
                )}
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                {handle?.actions}
                {!isSecondDegree && (
                  <>
                    <button
                      className="p-2 rounded-lg hover:bg-surface-secondary transition-colors relative text-text-secondary"
                      aria-label="Notifications"
                    >
                      <span aria-hidden="true">
                        <NotificationIcon />
                      </span>
                      <span className="absolute top-2.5 right-2.5 w-2 w-2 bg-error rounded-full border-2 border-background" />
                    </button>

                    <NavLink
                      to="/your-account"
                      className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-surface-secondary transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-3xs font-semibold text-text-secondary overflow-hidden group-hover:border-primary/50 transition-all shrink-0">
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
                      </div>
                      {!isMobile && (
                        <div className="flex items-center gap-1 hidden sm:flex">
                          <span className="text-sm font-bold tracking-tight text-text-primary">
                            {user?.name || 'User'}
                          </span>
                          <ChevronRightIcon />
                        </div>
                      )}
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        {/* ───────── PAGE CONTENT ───────── */}
        <main className={cn('flex-1 py-6 md:py-8', pageLayout.shellX, isMobile && 'pb-24')}>
          <div className="mx-auto w-full max-w-7xl animate-entrance-slide-up">
            <ErrorBoundary fallback={<AppErrorPage />}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* ───────── BOTTOM NAVIGATION (Mobile Only) ───────── */}
      {isMobile && (
        <nav className="fixed bottom-4 left-4 right-4 h-16 bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-2xl flex items-center justify-around px-4 shadow-lg z-30">
          {navItems.map((item) => {
            const anchorRef = item.anchorKey
              ? item.anchorKey === 'budgetsTab'
                ? registerBudgetsTab
                : registerGoalsTab
              : undefined

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 transition-all duration-300',
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary opacity-60',
                  )
                }
                ref={anchorRef}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'transition-all duration-300 flex items-center justify-center p-2.5 rounded-xl',
                        isActive ? 'bg-primary/10' : '',
                      )}
                    >
                      {item.icon}
                    </div>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      )}

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
    </div>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function VaultIcon() {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-secondary group-hover:text-text-primary transition-colors"
    >
      <path d="m9 18 6-6-6-6" />
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
