import { type ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import { KaizenLogo } from './KaizenLogo'
import { cn } from '../lib/cn'
import { type DashboardTourAnchorKey } from '../../features/home/DashboardTourAnchorsContext'
import { useRegisterDashboardTourAnchor } from '../../features/home/DashboardTourAnchorsHooks'

export type SidebarNavItem = {
  label: string
  to: string
  icon: ReactElement
  end?: boolean
  anchorKey?: DashboardTourAnchorKey
}

interface AppSidebarProps {
  navItems: ReadonlyArray<SidebarNavItem>
  isOpen: boolean
  onClose: () => void
  onLogout?: () => void
  userInitials: string
  userPicture?: string
  userName?: string
}

interface SidebarContentProps {
  navItems: ReadonlyArray<SidebarNavItem>
  onClose: () => void
  onLogout?: () => void
  registerBudgetsTab: (el: HTMLElement | null) => void
  registerGoalsTab: (el: HTMLElement | null) => void
  userPicture?: string
  userInitials: string
  userName?: string
}

function SidebarContent({
  navItems,
  onClose,
  onLogout,
  registerBudgetsTab,
  registerGoalsTab,
  userPicture,
  userInitials,
  userName,
}: SidebarContentProps): ReactElement {
  return (
    <>
      {/* Logo */}
      <div className="h-12 flex items-center px-3 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden" onClick={onClose}>
          <KaizenLogo className="h-7 w-7 shrink-0" />
          <span className="text-base font-semibold tracking-tight text-text-primary whitespace-nowrap hidden lg:block">
            Kaizen
          </span>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const anchorRef =
            item.anchorKey === 'budgetsTab'
              ? registerBudgetsTab
              : item.anchorKey === 'goalsTab'
                ? registerGoalsTab
                : undefined

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              onClick={onClose}
              ref={anchorRef}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors duration-150 relative',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary font-medium',
                )
              }
              title={item.label}
            >
              <span className="shrink-0 w-5 flex items-center justify-center">{item.icon}</span>
              <span className="truncate hidden lg:block">{item.label}</span>
              {/* Tooltip for icon-rail mode (md only) */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: account + logout */}
      <div className="px-2 pb-3 shrink-0">
        <div className="border-t border-border-subtle pt-3 flex items-center gap-1">
          <NavLink
            to="/your-account"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group flex flex-1 items-center gap-3 px-2 py-2.5 rounded-lg transition-colors relative',
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface-secondary',
              )
            }
          >
            <div className="h-7 w-7 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-3xs font-semibold text-text-secondary overflow-hidden shrink-0">
              {userPicture ? (
                <img
                  src={userPicture}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                userInitials
              )}
            </div>
            <span className="text-sm font-medium text-text-secondary truncate hidden lg:block">
              {userName || 'Account'}
            </span>
            {/* Tooltip for icon-rail */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden">
              Account
            </span>
          </NavLink>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors text-text-secondary hover:text-error shrink-0"
              aria-label="Log out"
              title="Log out"
            >
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
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export function AppSidebar({
  navItems,
  isOpen,
  onClose,
  onLogout,
  userInitials,
  userPicture,
  userName,
}: AppSidebarProps): ReactElement {
  const registerBudgetsTab = useRegisterDashboardTourAnchor('budgetsTab')
  const registerGoalsTab = useRegisterDashboardTourAnchor('goalsTab')

  return (
    <>
      {/* Static sidebar — md+ (hidden on mobile) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 flex-col bg-background border-r border-border-subtle z-30 w-14 lg:w-56">
        <SidebarContent
          navItems={navItems}
          onClose={onClose}
          onLogout={onLogout}
          registerBudgetsTab={registerBudgetsTab}
          registerGoalsTab={registerGoalsTab}
          userPicture={userPicture}
          userInitials={userInitials}
          userName={userName}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex flex-col w-64 bg-background border-r border-border-subtle shadow-xl">
            <SidebarContent
              navItems={navItems}
              onClose={onClose}
              onLogout={onLogout}
              registerBudgetsTab={registerBudgetsTab}
              registerGoalsTab={registerGoalsTab}
              userPicture={userPicture}
              userInitials={userInitials}
              userName={userName}
            />
          </aside>
        </div>
      )}
    </>
  )
}
