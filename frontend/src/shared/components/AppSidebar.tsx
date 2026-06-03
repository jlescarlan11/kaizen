import { type ReactElement, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { KaizenLogo } from './KaizenLogo'
import { Badge } from './Badge'
import { cn } from '../lib/cn'
import { type DashboardTourAnchorKey } from '../../features/home/DashboardTourAnchorsContext'
import { useRegisterDashboardTourAnchor } from '../../features/home/DashboardTourAnchorsHooks'

export type SidebarNavItem = {
  label: string
  to: string
  icon: ReactElement
  end?: boolean
  anchorKey?: DashboardTourAnchorKey
  badge?: string
}

interface AppSidebarProps {
  navItems: ReadonlyArray<SidebarNavItem>
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface SidebarContentProps {
  navItems: ReadonlyArray<SidebarNavItem>
  onClose: () => void
  registerBudgetsTab: (el: HTMLElement | null) => void
  registerGoalsTab: (el: HTMLElement | null) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface TooltipState {
  label: string
  top: number
  left: number
}

function SidebarContent({
  navItems,
  onClose,
  registerBudgetsTab,
  registerGoalsTab,
  collapsed,
  onToggleCollapse,
}: SidebarContentProps): ReactElement {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const showTooltip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (!collapsed) return
    const r = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, top: r.top + r.height / 2, left: r.right + 8 })
  }

  const hideTooltip = () => setTooltip(null)

  return (
    <>
      {/* Logo */}
      <div className="h-12 flex items-center px-3 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden" onClick={onClose}>
          <KaizenLogo className="h-7 w-7 shrink-0" />
          <span
            className={cn(
              'text-base font-semibold tracking-tight text-text-primary whitespace-nowrap',
              collapsed ? 'hidden' : 'hidden lg:block',
            )}
          >
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

          const isDisabled = !!item.badge

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              onClick={isDisabled ? (e) => e.preventDefault() : onClose}
              ref={anchorRef}
              onMouseEnter={(e) => showTooltip(e, item.label)}
              onMouseLeave={hideTooltip}
              tabIndex={isDisabled ? -1 : undefined}
              aria-disabled={isDisabled ? true : undefined}
              aria-label={isDisabled ? `${item.label}, coming soon` : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors duration-150',
                  isDisabled
                    ? 'text-text-secondary font-medium pointer-events-none cursor-not-allowed opacity-60'
                    : isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary font-medium',
                )
              }
            >
              <span className="shrink-0 w-5 flex items-center justify-center">{item.icon}</span>
              <span className={cn('truncate', collapsed ? 'hidden' : 'hidden lg:block')}>
                {item.label}
              </span>
              {!collapsed && item.badge && (
                <Badge
                  variant="neutral"
                  emphasis="soft"
                  className="ml-auto shrink-0 hidden lg:inline-flex"
                >
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: collapse toggle */}
      <div className="px-2 pb-3 shrink-0">
        <div className="border-t border-border-subtle pt-3">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              onMouseEnter={(e) => showTooltip(e, collapsed ? 'Expand' : '')}
              onMouseLeave={hideTooltip}
              className="flex w-full items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors text-text-secondary"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
                className={cn(
                  'shrink-0 transition-transform duration-200',
                  collapsed ? 'rotate-180' : '',
                )}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              {!collapsed && <span className="text-sm font-medium truncate">Collapse</span>}
            </button>
          )}
        </div>
      </div>

      {/* Shared portal tooltip — renders at document.body, escapes all overflow */}
      {collapsed &&
        tooltip &&
        tooltip.label &&
        createPortal(
          <div
            className="fixed z-[9999] px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap -translate-y-1/2"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            {tooltip.label}
          </div>,
          document.body,
        )}
    </>
  )
}

export function AppSidebar({
  navItems,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps): ReactElement {
  const registerBudgetsTab = useRegisterDashboardTourAnchor('budgetsTab')
  const registerGoalsTab = useRegisterDashboardTourAnchor('goalsTab')

  return (
    <>
      {/* Static sidebar — md+ (hidden on mobile) */}
      <aside
        className={cn(
          'hidden md:flex fixed inset-y-0 left-0 flex-col bg-background border-r border-border-subtle z-30 transition-[width] duration-200',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <SidebarContent
          navItems={navItems}
          onClose={onClose}
          registerBudgetsTab={registerBudgetsTab}
          registerGoalsTab={registerGoalsTab}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
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
              registerBudgetsTab={registerBudgetsTab}
              registerGoalsTab={registerGoalsTab}
              collapsed={false}
              onToggleCollapse={onToggleCollapse}
            />
          </aside>
        </div>
      )}
    </>
  )
}
