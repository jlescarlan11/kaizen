import { useState, type ReactElement, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useMediaQuery } from '../../shared/hooks/useMediaQuery'
import {
  useLogoutMutation,
  useResetTourFlagMutation,
  useResetOnboardingMutation,
  useToggleRemindersMutation,
} from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { Button } from '../../shared/components/Button'
import { Badge } from '../../shared/components/Badge'
import { Checkbox } from '../../shared/components/Checkbox'
import { cn } from '../../shared/lib/cn'
import { clearStoredOnboardingDraft } from '../onboarding/onboardingDraftStorage'
const IS_DEV = import.meta.env.DEV

type AccountItem = {
  label: string
  description?: string
  badge?: string
  to?: string
  onClick?: () => void
  destructive?: boolean
  icon: ReactElement
  toggle?: {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
  }
}

interface AccountSection {
  title: string
  items: ReadonlyArray<AccountItem>
}

function AccountRow({ item }: { item: AccountItem }): ReactElement {
  const isInteractive = !!(item.to || item.onClick || item.toggle)

  const baseClassName = cn(
    'flex w-full items-center gap-5 px-5 py-4 text-left transition-all',
    isInteractive ? 'cursor-pointer hover:bg-surface-secondary' : 'opacity-50 cursor-not-allowed',
  )

  const iconWrapClassName = cn(
    'flex h-11 w-11 shrink-0 items-center justify-center transition-all',
    item.destructive
      ? 'rounded-xl border shadow-sm bg-error/10 border-error/20 text-error'
      : 'rounded-md bg-primary/5 text-primary',
  )

  const labelClassName = cn(
    'text-base font-semibold tracking-tight',
    item.destructive ? 'text-error' : 'text-text-primary',
  )

  const descriptionClassName = cn(
    'text-xs mt-0.5',
    item.destructive ? 'text-error/80' : 'text-text-secondary',
  )

  const content = (
    <>
      <div className={iconWrapClassName}>{item.icon}</div>

      <div className="flex-1 min-w-0">
        <p className={labelClassName}>{item.label}</p>
        {item.description && <p className={descriptionClassName}>{item.description}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {item.badge && (
          <Badge variant="info" emphasis="soft">
            {item.badge}
          </Badge>
        )}
        {item.toggle && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={item.toggle.checked}
              onCheckedChange={item.toggle.onChange}
              disabled={item.toggle.disabled}
              className="mr-1"
            />
          </div>
        )}
        {isInteractive && !item.toggle && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-secondary/30"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </div>
    </>
  )

  if (item.to) {
    return (
      <Link to={item.to} className={cn(baseClassName, 'group')}>
        {content}
      </Link>
    )
  }

  if (item.onClick || item.toggle) {
    return (
      <button
        type="button"
        onClick={item.onClick || (() => item.toggle?.onChange(!item.toggle.checked))}
        className={cn(baseClassName, 'group')}
        disabled={item.toggle?.disabled}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={baseClassName} aria-disabled="true">
      {content}
    </div>
  )
}

export function YourAccountPage(): ReactElement {
  const { user } = useAuthState()
  const isMobile = useMediaQuery('(max-width: 640px)')
  const navigate = useNavigate()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [tourReminder, setTourReminder] = useState(
    'Replay the Dashboard tour the next time you open it.',
  )
  const [resetTourFlag, { isLoading: isResettingTour }] = useResetTourFlagMutation()
  const [resetOnboarding, { isLoading: isResettingOnboarding }] = useResetOnboardingMutation()
  const [toggleReminders, { isLoading: isTogglingReminders }] = useToggleRemindersMutation()
  const guidanceDescription = isResettingTour ? 'Resetting tour state…' : tourReminder

  const handleToggleReminders = async (enabled: boolean) => {
    try {
      await toggleReminders({ enabled }).unwrap()
    } catch (error) {
      console.error('Failed to toggle reminders:', error)
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

  const handleResetOnboarding = useCallback(async () => {
    if (!window.confirm('DEV ONLY: Reset all setup, budgets and progress?')) return
    try {
      await resetOnboarding().unwrap()
      if (user) {
        clearStoredOnboardingDraft(user.id)
      }
      navigate('/onboarding')
    } catch (error) {
      console.error('Failed to reset onboarding:', error)
    }
  }, [navigate, resetOnboarding, user])

  const handleShowTourAgain = useCallback(async () => {
    try {
      await resetTourFlag().unwrap()
      setTourReminder('The tour will launch the next time you open the Dashboard.')
    } catch (error) {
      console.error('Failed to reset tour flag:', error)
    }
    // PRD Open Question 5: if the author confirms the tour must launch immediately from Settings,
    // this handler should also trigger the Dashboard navigation or global event.
  }, [resetTourFlag])

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '??'

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  // On mobile, logout is the last row inside the Actions section (Wise pattern).
  // On desktop, it lives in the sticky profile card.
  const accountSections: AccountSection[] = [
    {
      title: 'Identity',
      items: [
        {
          label: 'Personal Details',
          description: 'Name, email, and profile photo',
          icon: <ProfileIcon />,
          to: '/your-account/profile',
        },
        {
          label: 'Active Sessions',
          description: 'Devices signed into your account',
          icon: <SessionsIcon />,
          to: '/your-account/sessions',
        },
        {
          label: 'Appearance',
          description: 'Theme, color mode, and display',
          icon: <AppearanceIcon />,
          to: '/your-account/appearance',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Categories',
          description: 'Manage your custom categories',
          icon: <CategoryIcon />,
          to: '/your-account/categories',
        },
        {
          label: 'Payment Methods',
          description: 'Cards, cash, and accounts',
          icon: <PaymentMethodIcon />,
          to: '/your-account/payment-methods',
        },
      ],
    },
    {
      title: 'Engagement',
      items: [
        {
          label: 'Show Tour Again',
          description: guidanceDescription,
          icon: <TourIcon />,
          onClick: handleShowTourAgain,
        },
        {
          label: 'Recurring Reminders',
          description: 'Get notified for due transactions',
          icon: <ReminderIcon />,
          toggle: {
            checked: user?.remindersEnabled ?? true,
            onChange: handleToggleReminders,
            disabled: isTogglingReminders,
          },
        },
      ],
    },
    {
      title: 'Reports & Help',
      items: [
        {
          label: 'Statements',
          description: 'Monthly summaries and exports',
          icon: <StatementIcon />,
        },
        {
          label: 'Help Center',
          description: 'FAQs, guides, and support',
          icon: <HelpIcon />,
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        ...(IS_DEV
          ? [
              {
                label: 'Reset Onboarding (DEV)',
                description: isResettingOnboarding
                  ? 'Resetting…'
                  : 'Delete all setup and start over',
                icon: <TourIcon />,
                onClick: handleResetOnboarding,
                destructive: true,
              } satisfies AccountItem,
            ]
          : []),
        {
          label: 'Close Account',
          description: 'Delete your account and data',
          icon: <CloseAccountIcon />,
          destructive: true,
        },
        // Mobile only: logout lives here
        ...(isMobile
          ? [
              {
                label: 'Log Out',
                icon: <LogoutIcon />,
                onClick: () => setIsLogoutModalOpen(true),
              } satisfies AccountItem,
            ]
          : []),
      ],
    },
  ]

  // ─── Desktop: sticky profile card ─────────────────────────────────────────

  const desktopProfileCard = (
    <div className="flex flex-col items-center text-center gap-5 bg-surface rounded-2xl p-6 border border-border-subtle w-full shadow-sm">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-surface-secondary overflow-hidden ring-2 ring-primary/20 flex items-center justify-center text-2xl font-semibold text-text-primary shadow-inner">
          {user?.picture && !imageError ? (
            <img
              src={user.picture}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="tracking-tighter">{userInitials}</span>
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary border border-white flex items-center justify-center text-white shadow-sm hover:brightness-105 transition-all"
          aria-label="Change photo"
        >
          <CameraIcon />
        </button>
      </div>

      <div className="w-full space-y-1">
        <h3 className="text-xl font-semibold tracking-tight text-text-primary leading-none">
          {user?.name || 'User Name'}
        </h3>
        {user?.email && <p className="text-xs text-text-secondary truncate">{user.email}</p>}
      </div>

      <div className="w-full border-t border-border-subtle/20" />

      <div className="w-full space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-text-secondary">Member since</span>
          <span className="text-xs font-semibold text-text-primary">{memberSince}</span>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-text-secondary">Status</span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Active
          </span>
        </div>
      </div>

      <div className="w-full border-t border-border-subtle/20" />

      <Button
        variant="ghost"
        onClick={() => setIsLogoutModalOpen(true)}
        className="w-full bg-error/5 border border-error/30 text-error hover:bg-error/10 h-10 text-xs"
      >
        Log Out
      </Button>
    </div>
  )

  // ─── Mobile: open hero block ──────────────────────────────────────────────

  const mobileProfileHero = (
    <div className="flex flex-col items-center text-center gap-4 pt-2 pb-6">
      <div className="h-20 w-20 rounded-full bg-surface-secondary overflow-hidden border-2 border-white flex items-center justify-center text-2xl font-bold text-text-primary shadow-lg">
        {user?.picture && !imageError ? (
          <img
            src={user.picture}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="tracking-tighter">{userInitials}</span>
        )}
      </div>

      <div className="space-y-0.5">
        <h1 className="text-3xl font-bold tracking-tighter text-text-primary uppercase leading-tight">
          {user?.name || 'User Name'}
        </h1>
        <p className="text-base font-medium text-text-secondary tracking-tight opacity-60">
          Your personal account
        </p>
      </div>

      {user?.email && (
        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-border-subtle text-3xs font-bold uppercase tracking-widest text-text-secondary shadow-sm">
          {user.email}
        </span>
      )}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="animate-entrance-slide-up pb-24">
      <div className="w-full">
        <div>
          <LogoutConfirmationModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={handleLogout}
            isLoading={isLoggingOut}
          />

          <div
            className={cn(
              'flex flex-col gap-8',
              !isMobile && 'md:flex-row md:items-start md:gap-10',
            )}
          >
            {/* Left — sticky profile card */}
            <div
              className={cn('w-full', !isMobile && 'md:w-64 lg:w-72 shrink-0 md:sticky md:top-24')}
            >
              {isMobile ? mobileProfileHero : desktopProfileCard}
            </div>

            {/* Right — menu sections */}
            <div className="flex-1 min-w-0 space-y-10">
              {accountSections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-xs font-semibold text-text-secondary tracking-wide mb-3 px-2">
                    {section.title}
                  </h3>
                  <div className="bg-surface rounded-2xl shadow-sm overflow-hidden divide-y divide-border">
                    {section.items.map((item) => (
                      <AccountRow key={item.label} item={item} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Member footer — mobile only */}
              {isMobile && (
                <p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-30 text-center pb-6">
                  Member since {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── ICONS ───────── */

function ProfileIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function SessionsIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

function AppearanceIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 11-8-8" />
      <path d="M14.5 9.5 4.8 19.2a2 2 0 0 0 0 2.8v0a2 2 0 0 0 2.8 0L17.3 12.3" />
      <circle cx="19" cy="5" r="2" />
    </svg>
  )
}

function CategoryIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function PaymentMethodIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
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

function StatementIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function HelpIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function TourIcon(): ReactElement {
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
    >
      <path d="M12 5v14" />
      <path d="M5 9h14" />
      <path d="M8 17l4-4 4 4" />
    </svg>
  )
}

function ReminderIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function CloseAccountIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

function LogoutIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function CameraIcon(): ReactElement {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
