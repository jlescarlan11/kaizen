import { useState, type ReactElement, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { useMediaQuery } from '../../shared/hooks/useMediaQuery'
import { useLogoutMutation, useResetTourFlagMutation } from '../../app/store/api/authApi'
import { LogoutConfirmationModal } from '../../shared/components/LogoutConfirmationModal'
import { cn } from '../../shared/lib/cn'

type AccountItem = {
  label: string
  description?: string
  badge?: string
  to?: string
  onClick?: () => void
  destructive?: boolean
  icon: ReactElement
}

interface AccountSection {
  title: string
  items: ReadonlyArray<AccountItem>
}

function AccountRow({ item }: { item: AccountItem }): ReactElement {
  const isInteractive = !!(item.to || item.onClick)

  const baseClassName = cn(
    'flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors',
    isInteractive
      ? 'cursor-pointer hover:bg-ui-surface-muted active:bg-ui-surface-subtle'
      : 'opacity-50 cursor-not-allowed',
  )

  const iconWrapClassName = cn(
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ui-border-subtle',
    item.destructive ? 'bg-ui-danger-subtle' : 'bg-ui-surface-muted',
  )

  const labelClassName = cn(
    'text-sm font-medium leading-6',
    item.destructive ? 'text-ui-danger-text-soft' : 'text-foreground',
  )

  const descriptionClassName = cn(
    'text-xs leading-5 mt-0.5',
    item.destructive ? 'text-ui-danger-text-soft opacity-75' : 'text-subtle-foreground',
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
          <span className="text-xs leading-5 font-medium px-2 py-0.5 rounded-full bg-ui-accent-subtle text-ui-accent-text">
            {item.badge}
          </span>
        )}
        {isInteractive && (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-subtle-foreground"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </div>
    </>
  )

  if (item.to) {
    return (
      <Link to={item.to} className={baseClassName}>
        {content}
      </Link>
    )
  }

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={baseClassName}>
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
  const guidanceDescription = isResettingTour ? 'Resetting tour state…' : tourReminder

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap()
      setIsLogoutModalOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

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
      title: 'Your account',
      items: [
        {
          label: 'Personal details',
          description: 'Name, email, and profile photo',
          icon: <ProfileIcon />,
          to: '/your-account/profile',
        },
        {
          label: 'Active sessions',
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
        {
          label: 'Categories',
          description: 'Create and manage your custom categories',
          icon: <CategoryIcon />,
          to: '/your-account/categories',
        },
      ],
    },
    {
      title: 'Guidance',
      items: [
        {
          label: 'Show tour again',
          description: guidanceDescription,
          icon: <TourIcon />,
          onClick: handleShowTourAgain,
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          label: 'Statements and reports',
          description: 'Monthly summaries and exports',
          icon: <StatementIcon />,
        },
        {
          label: 'Help center',
          description: 'FAQs, guides, and support',
          icon: <HelpIcon />,
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        {
          label: 'Close account',
          description: 'Permanently delete your account and data',
          icon: <CloseAccountIcon />,
          destructive: true,
        },
        // Mobile only: logout lives here as the very last row (Wise pattern)
        ...(isMobile
          ? [
              {
                label: 'Log out',
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
    <div className="flex flex-col items-center text-center gap-5 bg-ui-surface-muted rounded-2xl p-6 border border-ui-border-subtle w-full">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-ui-surface overflow-hidden border border-ui-border-subtle flex items-center justify-center text-3xl font-semibold text-foreground">
          {user?.picture && !imageError ? (
            <img
              src={user.picture}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="tracking-tight">{userInitials}</span>
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-0.5 right-0.5 h-7 w-7 rounded-full bg-ui-surface border border-ui-border-subtle flex items-center justify-center text-subtle-foreground hover:text-foreground transition-colors"
          aria-label="Change photo"
        >
          <CameraIcon />
        </button>
      </div>

      <div className="w-full space-y-1">
        <h3 className="text-xl font-semibold tracking-tight leading-snug text-foreground">
          {user?.name || 'User Name'}
        </h3>
        {user?.email && (
          <p className="text-xs leading-5 text-subtle-foreground truncate">{user.email}</p>
        )}
      </div>

      <div className="w-full border-t border-ui-border-subtle" />

      <div className="w-full space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs leading-5 text-subtle-foreground">Member since</span>
          <span className="text-xs leading-5 font-medium text-foreground">{memberSince}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs leading-5 text-subtle-foreground">Status</span>
          <span className="flex items-center gap-1.5 text-xs leading-5 font-medium text-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ui-success-bg" />
            Active
          </span>
        </div>
      </div>

      <div className="w-full border-t border-ui-border-subtle" />

      <button
        type="button"
        onClick={() => setIsLogoutModalOpen(true)}
        className="w-full py-2 rounded-lg border border-ui-border-subtle text-xs leading-5 font-medium text-ui-danger-text-soft hover:bg-ui-danger-subtle transition-colors"
      >
        Log out
      </button>
    </div>
  )

  // ─── Mobile: open hero block (no card bg — like Wise) ─────────────────────

  const mobileProfileHero = (
    <div className="flex flex-col items-center text-center gap-3 pt-2 pb-6">
      <div className="h-16 w-16 rounded-full bg-ui-surface-muted overflow-hidden border border-ui-border-subtle flex items-center justify-center text-xl font-semibold text-foreground">
        {user?.picture && !imageError ? (
          <img
            src={user.picture}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="tracking-tight">{userInitials}</span>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
          {user?.name || 'User Name'}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">Your personal account</p>
      </div>

      {user?.email && (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-ui-surface-muted border border-ui-border-subtle text-xs leading-5 text-subtle-foreground">
          {user.email}
        </span>
      )}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />

      <div
        className={cn('flex flex-col gap-8', !isMobile && 'md:flex-row md:items-start md:gap-10')}
      >
        {/* Left — sticky profile card (desktop) or open hero (mobile) */}
        <div className={cn('w-full', !isMobile && 'md:w-64 lg:w-72 shrink-0 md:sticky md:top-24')}>
          {isMobile ? mobileProfileHero : desktopProfileCard}
        </div>

        {/* Right — menu sections */}
        <div className="flex-1 min-w-0 space-y-7">
          {accountSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-lg font-medium leading-snug text-foreground mb-3">
                {section.title}
              </h4>
              <div className="divide-y divide-ui-border-subtle">
                {section.items.map((item) => (
                  <AccountRow key={item.label} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* Member footer — mobile only; desktop profile card already shows this */}
          {isMobile && (
            <p className="text-xs leading-5 text-subtle-foreground text-center pb-4">
              Member since {memberSince}
            </p>
          )}
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
