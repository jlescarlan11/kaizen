import { useState, useEffect, useRef, type ReactElement } from 'react'
import { Outlet, NavLink, useMatches, useNavigate } from 'react-router-dom'
import { KaizenLogo } from '../../shared/components/KaizenLogo'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useMediaQuery } from '../../shared/hooks/useMediaQuery'
import { useLogoutMutation } from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { cn } from '../../shared/lib/cn'
import { pageLayout } from '../../shared/styles/layout'
import { clearStoredOnboardingDraft } from '../../features/onboarding/onboardingDraftStorage'
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
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const matches = useMatches()
  const navigate = useNavigate()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [headerOffset, setHeaderOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const lastScrollY = useRef(0)

  const registerBudgetsTab = useRegisterDashboardTourAnchor('budgetsTab')
  const registerGoalsTab = useRegisterDashboardTourAnchor('goalsTab')

  // Extract navigation metadata from the current route match
  const lastMatch = matches[matches.length - 1]
  const handle = lastMatch?.handle as RouteHandle | undefined
  const backButtonConfig = handle?.backButton
  const isSecondDegree = !!backButtonConfig
  const hideHeader = !!handle?.hideHeader

  useEffect(() => {
    if (hideHeader) return

    const handleScroll = (): void => {
      const currentScrollY = Math.max(0, window.scrollY)
      const isScrollingUp = currentScrollY < lastScrollY.current

      // 1. Natural Scroll Range (0-80px):
      if (currentScrollY <= 80) {
        // If we hit the absolute top, snap instantly
        if (currentScrollY === 0) {
          setHeaderOffset(0)
          setIsAnimating(false)
        }
        // If we are scrolling up and already revealed, stay pinned at 0
        else if (isScrollingUp && headerOffset === 0) {
          setHeaderOffset(0)
          setIsAnimating(true)
        }
        // Otherwise, move naturally with the scroll
        else {
          setHeaderOffset(-currentScrollY)
          setIsAnimating(false)
        }
      }
      // 2. Smart Reveal Range (>80px):
      else {
        if (currentScrollY < lastScrollY.current - 5) {
          setHeaderOffset(0)
          setIsAnimating(true)
        } else if (currentScrollY > lastScrollY.current + 5) {
          setHeaderOffset(-80)
          setIsAnimating(true)
        }
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headerOffset, hideHeader])

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
    isAction?: boolean
    anchorKey?: DashboardTourAnchorKey
  }

  const navItems: ReadonlyArray<NavItem> = [
    { label: 'Transactions', to: '/', icon: <HomeIcon /> },
    { label: 'Budgets', to: '/budget', icon: <BudgetIcon />, anchorKey: 'budgetsTab' },
    {
      label: 'Add Entry',
      to: '/budget/manual',
      icon: <AddIcon />,
      isAction: true,
      // TODO: swap to the real add-transaction route once the flow is built.
    },
    {
      label: 'Goals',
      to: '/playground',
      icon: <GoalIcon />,
      anchorKey: 'goalsTab',
      // Placeholder route: replace with /goals when the tab is implemented.
    },
    {
      label: 'Vault',
      to: '/playground',
      icon: <VaultIcon />,
      // Additional tab per spec; currently maps to playground until the real vault exists.
    },
  ]

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '??'

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      {/* ───────── SIDEBAR (Desktop Only) ───────── */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-background flex flex-col z-30">
          <div className="h-20 flex items-center px-8">
            <NavLink to="/" className="flex items-center gap-3">
              <KaizenLogo className="h-7 w-7" />
              <span className="text-lg font-bold tracking-tight text-foreground">Kaizen</span>
            </NavLink>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-ui-accent-subtle text-foreground border border-ui-border-strong'
                        : 'text-muted-foreground hover:bg-black/5 hover:text-foreground',
                    )
                  }
                  ref={anchorRef}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
      )}

      {/* ───────── MAIN CONTENT AREA ───────── */}
      <div className={cn('flex-1 flex flex-col min-w-0', !isMobile && 'md:ml-64')}>
        {/* ───────── HEADER SPACER (Preserves space in document flow) ───────── */}
        {!hideHeader && <div className="h-20 w-full shrink-0" />}

        {/* ───────── HEADER ───────── */}
        {!hideHeader && (
          <header
            className={cn(
              'fixed top-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-md z-20 px-5 md:px-10',
              !isMobile && 'md:left-64',
              isAnimating && 'transition-transform duration-200 ease-in-out',
            )}
            style={{ transform: `translateY(${headerOffset}px)` }}
          >
            <div className="mx-auto h-full w-full max-w-5xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isSecondDegree ? (
                  <button
                    type="button"
                    className="group flex items-center gap-2.5 text-foreground transition-colors hover:opacity-70"
                    onClick={handleBack}
                  >
                    <svg
                      width="20"
                      height="20"
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
                    <span className="text-[15px] font-medium leading-none">
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

                {!isMobile && !isSecondDegree && (
                  <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
                )}
              </div>

              <div className="flex items-center gap-3 md:gap-5">
                {!isSecondDegree && (
                  <>
                    <button
                      className="p-2 rounded-full hover:bg-black/5 transition-colors relative"
                      aria-label="Notifications"
                    >
                      <NotificationIcon />
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                    </button>

                    <NavLink
                      to="/your-account"
                      className="flex items-center gap-2 group p-1 pr-2 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-ui-accent-subtle border border-ui-border flex items-center justify-center text-[12px] font-bold text-foreground overflow-hidden group-hover:border-ui-border-strong transition-colors ring-2 ring-transparent group-hover:ring-ui-accent-subtle/50 shrink-0">
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
                          <span className="text-[13px] font-semibold text-foreground">
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
        <main className={cn('flex-1 py-6 md:py-8', pageLayout.shellX, isMobile && 'pb-28')}>
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ───────── BOTTOM NAVIGATION (Mobile Only) ───────── */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-background/95 backdrop-blur-md border-t border-ui-border-subtle flex items-end justify-around px-4 pb-6 z-30">
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
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1.5 transition-all duration-200',
                    item.isAction ? 'mb-4' : 'mb-0',
                    isActive
                      ? 'text-foreground scale-110'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
                ref={anchorRef}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'transition-all duration-200 flex items-center justify-center',
                        item.isAction
                          ? 'h-16 w-16 rounded-full bg-black text-white shadow-xl border-4 border-background -translate-y-2 hover:scale-110 active:scale-95'
                          : cn(
                              'p-2 rounded-xl',
                              isActive ? 'bg-ui-accent-subtle border border-ui-border-strong' : '',
                            ),
                      )}
                    >
                      {item.icon}
                    </div>
                    {!item.isAction && (
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      )}
    </div>
  )
}

/* ───────── ICON COMPONENTS (Internal SVGs) ───────── */

function HomeIcon() {
  return (
    <svg
      width="22"
      height="22"
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
      width="22"
      height="22"
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

function AddIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function GoalIcon() {
  return (
    <svg
      width="22"
      height="22"
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

function VaultIcon() {
  return (
    <svg
      width="22"
      height="22"
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground group-hover:text-foreground transition-colors"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
