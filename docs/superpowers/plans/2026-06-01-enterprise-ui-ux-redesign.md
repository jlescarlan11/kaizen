# Enterprise UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 20 Kaizen pages to a consistent enterprise dashboard aesthetic — persistent sidebar nav, standard page header pattern, KPI strips, and data tables — without changing any routes, business logic, or design tokens.

**Architecture:** Phase 1 extends `AuthenticatedLayout` with a responsive 3-state sidebar (full/icon-rail/drawer) and extracts shared layout components. Phase 2 creates three new shared components (`PageHeader`, `KpiStrip`, `DataTable`) that all pages import. Phase 3 applies the pattern page-by-page in parallel agent groups. Phase 4 runs a TypeScript + visual QA pass.

**Tech Stack:** React 19, React Router v7, Tailwind v4 (CSS-var tokens), custom component library (Button, Card, Badge, DataList, EmptyStateCard), @headlessui/react, Redux Toolkit / RTK Query.

---

## File Map

**New files:**
- `frontend/src/shared/components/AppSidebar.tsx` — responsive sidebar (full/icon-rail/drawer modes)
- `frontend/src/shared/components/PageHeader.tsx` — standard page title + action buttons
- `frontend/src/shared/components/KpiStrip.tsx` — inline KPI stat row
- `frontend/src/shared/components/DataTable.tsx` — styled table wrapper

**Modified files:**
- `frontend/src/app/router/AuthenticatedLayout.tsx` — use AppSidebar, remove bottom nav, slim top bar
- `frontend/src/shared/styles/layout.ts` — add `enterpriseLayout` constants
- `frontend/src/features/home/HomePage.tsx`
- `frontend/src/features/transactions/TransactionListPage.tsx`
- `frontend/src/features/transactions/TransactionDetailPage.tsx`
- `frontend/src/features/transactions/TransactionEntryPage.tsx`
- `frontend/src/features/transactions/BalanceHistoryPage.tsx`
- `frontend/src/features/budgets/BudgetsPage.tsx`
- `frontend/src/features/budgets/BudgetDetailPage.tsx`
- `frontend/src/features/budgets/ManualBudgetSetupPage.tsx`
- `frontend/src/features/insights/index.ts` (InsightsPage)
- `frontend/src/features/goals/GoalDetailPage.tsx`
- `frontend/src/features/categories/CategoryManagementPage.tsx`
- `frontend/src/features/payment-methods/PaymentMethodSummaryPage.tsx`
- `frontend/src/features/payment-methods/PaymentMethodManagementPage.tsx`
- `frontend/src/features/your-account/YourAccountPage.tsx`
- `frontend/src/features/your-account/ProfilePage.tsx`
- `frontend/src/features/your-account/AppearancePage.tsx`
- `frontend/src/features/your-account/SessionsPage.tsx`
- `frontend/src/features/signin/SigninPage.tsx`
- `frontend/src/features/onboarding/BalanceSetupStep.tsx`
- `frontend/src/features/onboarding/OnboardingBudgetStep.tsx`

---

## Phase 1 — Layout Shell

### Task 1: Add layout constants and extend nav items in AuthenticatedLayout

**Files:**
- Modify: `frontend/src/shared/styles/layout.ts`
- Modify: `frontend/src/app/router/AuthenticatedLayout.tsx`

- [ ] **Step 1: Add enterprise layout constants to layout.ts**

Open `frontend/src/shared/styles/layout.ts` and append:

```ts
export const enterpriseLayout = {
  sidebarFull: 'w-56',          // 224px — desktop
  sidebarRail: 'w-14',          // 56px  — tablet icon rail
  contentOffsetFull: 'lg:ml-56',
  contentOffsetRail: 'md:ml-14',
  topBarHeight: 'h-12',
  pageX: 'px-4 md:px-6 lg:px-8',
  pageY: 'py-6',
} as const
```

- [ ] **Step 2: Update navItems array in AuthenticatedLayout.tsx**

Find the `navItems` array (around line 95) and replace it:

```tsx
const navItems: ReadonlyArray<NavItem> = [
  { label: 'Home',            to: '/',                icon: <HomeIcon />,            end: true  },
  { label: 'Transactions',    to: '/transactions',    icon: <TransactionsIcon />              },
  { label: 'Budgets',         to: '/budgets',         icon: <BudgetIcon />,          anchorKey: 'budgetsTab' },
  { label: 'Insights',        to: '/insights',        icon: <InsightsIcon />                  },
  { label: 'Goals',           to: '/goals',           icon: <GoalIcon />,            anchorKey: 'goalsTab'  },
  { label: 'Categories',      to: '/categories',      icon: <CategoriesIcon />                },
  { label: 'Payments',        to: '/payment-summary', icon: <PaymentsIcon />                  },
]
```

Also update the `NavItem` type to add `end?: boolean`:

```tsx
type NavItem = {
  label: string
  to: string
  icon: ReactElement
  end?: boolean
  isAction?: boolean
  anchorKey?: DashboardTourAnchorKey
}
```

And update the NavLink `end` prop in the sidebar render to use `item.end ?? false`:
```tsx
end={item.end ?? false}
```

- [ ] **Step 3: Add missing icon components at the bottom of AuthenticatedLayout.tsx**

After the existing icon components, add:

```tsx
function TransactionsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l4-4 4 4" /><path d="M7 5v14" />
      <path d="M21 15l-4 4-4-4" /><path d="M17 19V5" />
    </svg>
  )
}

function InsightsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  )
}

function CategoriesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function PaymentsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
```

- [ ] **Step 4: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no new errors from these changes.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/shared/styles/layout.ts frontend/src/app/router/AuthenticatedLayout.tsx
git commit -m "feat(layout): extend nav items and add enterprise layout constants"
```

---

### Task 2: Create AppSidebar component with 3-state responsive behavior

**Files:**
- Create: `frontend/src/shared/components/AppSidebar.tsx`

The sidebar has three states:
- `lg+` (≥1024px): full width (w-56), icon + label
- `md` (768–1023px): icon rail (w-14), icon only + tooltip on hover  
- `<md` (mobile): hidden; opened as a slide-over drawer by `isOpen` prop

- [ ] **Step 1: Create AppSidebar.tsx**

```tsx
import { type ReactElement } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
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
  isOpen: boolean          // mobile drawer open state
  onClose: () => void      // mobile drawer close handler
  onLogout: () => void
  userInitials: string
  userPicture?: string
  userName?: string
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

  const navContent = (
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
              {/* Tooltip for icon-rail mode */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden">
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: account */}
      <div className="px-2 pb-3 shrink-0">
        <div className="border-t border-border-subtle pt-3">
          <NavLink
            to="/your-account"
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors group"
          >
            <div className="h-7 w-7 rounded-full bg-surface-secondary border border-border-subtle flex items-center justify-center text-3xs font-semibold text-text-secondary overflow-hidden shrink-0">
              {userPicture ? (
                <img src={userPicture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                userInitials
              )}
            </div>
            <span className="text-sm font-medium text-text-secondary truncate hidden lg:block">
              {userName || 'Account'}
            </span>
          </NavLink>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Static sidebar — md+ */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 flex-col bg-background border-r border-border-subtle z-30 w-14 lg:w-56 transition-all duration-200">
        {navContent}
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
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/AppSidebar.tsx
git commit -m "feat(layout): add AppSidebar with responsive full/icon-rail/drawer modes"
```

---

### Task 3: Refactor AuthenticatedLayout to use AppSidebar, slim TopBar, remove bottom nav

**Files:**
- Modify: `frontend/src/app/router/AuthenticatedLayout.tsx`

This replaces the inline sidebar and bottom nav with `AppSidebar`, and slims the top header to a minimal `48px` bar.

- [ ] **Step 1: Replace AuthenticatedLayoutContent render with new shell**

Replace the entire `return (...)` inside `AuthenticatedLayoutContent` (from line ~120 to the closing `</div>`) with:

```tsx
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ... (keep existing state above, just add drawerOpen)

  // Note: DashboardTourAnchorsProvider is already in the outer AuthenticatedLayout wrapper —
  // do NOT add it here again. AppSidebar and this component share that context.
  return (
    <>
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

      {/* Main content offset: ml-14 on md, ml-56 on lg */}
      <div className="flex flex-col min-h-screen md:ml-14 lg:ml-56">

        {/* Top bar */}
        {!hideHeader && (
          <header className="sticky top-0 z-20 h-12 bg-background/90 backdrop-blur-md border-b border-border/10 flex items-center px-4 md:px-6 gap-3">
            {/* Mobile: hamburger */}
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-secondary transition-colors text-text-secondary"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </button>

            {/* Back button (second-degree pages) */}
            {isSecondDegree && (
              <button
                type="button"
                className="group flex items-center gap-1.5 text-text-primary transition-colors hover:opacity-70"
                onClick={handleBack}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="text-sm font-semibold tracking-tight">{backButtonConfig?.label}</span>
              </button>
            )}

            <div className="flex-1" />

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {handle?.actions}
              {!isSecondDegree && (
                <>
                  <button
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
                      <img src={user.picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={() => setImageError(true)} />
                    ) : (
                      userInitials
                    )}
                  </NavLink>
                </>
              )}
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl animate-entrance-slide-up">
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
          void dispatch(showAlert({ title: 'Hold Purchase', message: 'This feature is coming soon!', type: 'info' }))
        }
      />
    </>
  )
```

- [ ] **Step 2: Add AppSidebar import at top of file**

```tsx
import { AppSidebar } from '../../shared/components/AppSidebar'
```

Also add `drawerOpen` to the state declarations at the top of `AuthenticatedLayoutContent`:
```tsx
const [drawerOpen, setDrawerOpen] = useState(false)
```

- [ ] **Step 3: Remove the now-unused isMobile variable and the old sidebar/bottom-nav JSX**

Delete:
```tsx
const isMobile = useMediaQuery('(max-width: 768px)')
```
(The `useMediaQuery` import can be removed too if no longer used.)

- [ ] **Step 4: Run typecheck and verify app loads**

```bash
cd frontend && npx tsc --noEmit
```

Then start dev server and confirm sidebar renders correctly at desktop, tablet, and mobile widths:
```bash
cd frontend && npm run dev
```

Open http://localhost:5173. Resize browser:
- ≥1024px: full sidebar with labels
- 768–1023px: icon-only rail, labels on hover
- <768px: no sidebar; hamburger in top bar opens drawer

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/router/AuthenticatedLayout.tsx
git commit -m "feat(layout): refactor to AppSidebar, slim TopBar, remove bottom nav"
```

---

## Phase 2 — Shared Components

### Task 4: Create PageTabs component

**Files:**
- Create: `frontend/src/shared/components/PageTabs.tsx`

Used on TransactionListPage (All/Income/Expenses), BudgetsPage (Active/Archived), BalanceHistoryPage (Chart/Table), InsightsPage (Spending/Income/Trends).

- [ ] **Step 1: Create PageTabs.tsx**

```tsx
import { type ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface TabItem<T extends string> {
  key: T
  label: string
}

interface PageTabsProps<T extends string> {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (key: T) => void
  className?: string
}

export function PageTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: PageTabsProps<T>): ReactElement {
  return (
    <div className={cn('flex gap-0 border-b border-border-subtle mb-5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Export from shared/components/index.ts**

Add to `frontend/src/shared/components/index.ts`:
```ts
export { PageTabs, type TabItem } from './PageTabs'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/PageTabs.tsx frontend/src/shared/components/index.ts
git commit -m "feat(components): add PageTabs shared component"
```

---

### Task 5: Create PageHeader component

**Files:**
- Create: `frontend/src/shared/components/PageHeader.tsx`

Used at the top of every page. Renders title, optional subtitle, and right-aligned action buttons.

- [ ] **Step 1: Create PageHeader.tsx**

```tsx
import { type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps): ReactElement {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Export from shared/components/index.ts**

Open `frontend/src/shared/components/index.ts` and add:
```ts
export { PageHeader } from './PageHeader'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/PageHeader.tsx frontend/src/shared/components/index.ts
git commit -m "feat(components): add PageHeader shared component"
```

---

### Task 6: Create KpiStrip component

**Files:**
- Create: `frontend/src/shared/components/KpiStrip.tsx`

Renders a horizontal row of 2–4 KPI chips between the page header and main content.

- [ ] **Step 1: Create KpiStrip.tsx**

```tsx
import { type ReactElement } from 'react'
import { cn } from '../lib/cn'

export interface KpiItem {
  label: string
  value: string | ReactElement
  valueClassName?: string
}

interface KpiStripProps {
  items: KpiItem[]
  className?: string
}

export function KpiStrip({ items, className }: KpiStripProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-3 py-3 mb-5 border-b border-border-subtle',
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-0.5 min-w-[80px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {item.label}
          </span>
          <span className={cn('text-base font-semibold text-text-primary', item.valueClassName)}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Export from shared/components/index.ts**

Add to `frontend/src/shared/components/index.ts`:
```ts
export { KpiStrip, type KpiItem } from './KpiStrip'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/KpiStrip.tsx frontend/src/shared/components/index.ts
git commit -m "feat(components): add KpiStrip shared component"
```

---

### Task 7: Create DataTable component

**Files:**
- Create: `frontend/src/shared/components/DataTable.tsx`

Styled table wrapper with standardised header and row styles.

- [ ] **Step 1: Create DataTable.tsx**

```tsx
import { type ReactElement, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  cell: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>): ReactElement {
  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-border-subtle bg-background', className)}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-subtle bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border-subtle/50 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn('px-4 py-3 text-sm text-text-primary', col.className)}
                >
                  {col.cell(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Export from shared/components/index.ts**

Add:
```ts
export { DataTable, type DataTableColumn } from './DataTable'
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/DataTable.tsx frontend/src/shared/components/index.ts
git commit -m "feat(components): add DataTable shared component"
```

---

## Phase 3 — Page Content

> **Parallelisation note:** Tasks 7–14 are fully independent. In a multi-agent run, dispatch all eight simultaneously after Phase 2 is committed.

---

### Task 7: BudgetsPage + BudgetDetailPage

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx`
- Modify: `frontend/src/features/budgets/BudgetDetailPage.tsx`

#### BudgetsPage

- [ ] **Step 1: Replace the page shell in BudgetsPage.tsx**

Keep all existing data-fetching hooks (`useGetBudgetsQuery`, `useGetBudgetSummaryQuery`, `useGetCategoriesQuery`) and the `BudgetRow` sub-component logic. Replace only the top-level return JSX:

```tsx
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'
import { PageTabs } from '../../shared/components/PageTabs'

// Inside BudgetsPage component — add tab state:
const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

// Filter budgets by active tab (check if BudgetResponse has an `archived` or `isActive` field;
// if not present yet, filter by period === 'archived' or treat all as active for now):
const visibleBudgets = budgets?.filter((b) =>
  activeTab === 'archived' ? (b.archived ?? false) : !(b.archived ?? false)
)

const totalBudgeted = visibleBudgets?.reduce((s, b) => s + b.amount, 0) ?? 0
const totalSpent    = visibleBudgets?.reduce((s, b) => s + b.expense, 0) ?? 0
const remaining     = totalBudgeted - totalSpent
const overCount     = visibleBudgets?.filter((b) => b.expense > b.amount).length ?? 0

return (
  <div>
    <PageHeader
      title="Budgets"
      actions={
        <Button variant="primary" size="sm" onClick={() => navigate('/budgets/add')}>
          + New Budget
        </Button>
      }
    />

    <PageTabs
      tabs={[
        { key: 'active',   label: 'Active'   },
        { key: 'archived', label: 'Archived' },
      ]}
      activeTab={activeTab}
      onChange={setActiveTab}
    />

    {visibleBudgets && visibleBudgets.length > 0 && (
      <KpiStrip
        items={[
          { label: 'Budgeted',    value: `$${totalBudgeted.toFixed(2)}` },
          { label: 'Spent',       value: `$${totalSpent.toFixed(2)}`,   valueClassName: totalSpent > totalBudgeted ? 'text-error' : undefined },
          { label: 'Remaining',   value: `$${Math.max(remaining, 0).toFixed(2)}` },
          { label: 'Over Budget', value: String(overCount),             valueClassName: overCount > 0 ? 'text-error' : undefined },
        ]}
      />
    )}

    {/* Render BudgetRow list using visibleBudgets instead of budgets below */}
    {/* ... keep existing BudgetRow list / loading / empty state rendering, replace `budgets` with `visibleBudgets` */}
  </div>
)
```

The `BudgetRow` sub-component and all loading/empty/error states below remain unchanged — replace `budgets` with `visibleBudgets` in the list render only.

- [ ] **Step 2: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

#### BudgetDetailPage

- [ ] **Step 3: Add PageHeader and KpiStrip to BudgetDetailPage.tsx**

Read the file to find the current top-level return. Add at the top of the return:

```tsx
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'

// At the top of the return, before existing card content:
<PageHeader
  title={budget.categoryName}
  subtitle={`${budget.period} budget`}
  actions={
    <Button variant="outline" size="sm" onClick={() => navigate(`/budgets/${budget.id}/edit`)}>
      Edit
    </Button>
  }
/>
<KpiStrip
  items={[
    { label: 'Allocated', value: `$${budget.amount.toFixed(2)}` },
    { label: 'Spent',     value: `$${budget.expense.toFixed(2)}`, valueClassName: budget.expense > budget.amount ? 'text-error' : undefined },
    { label: 'Remaining', value: `$${Math.max(budget.amount - budget.expense, 0).toFixed(2)}` },
  ]}
/>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/budgets/BudgetsPage.tsx frontend/src/features/budgets/BudgetDetailPage.tsx
git commit -m "feat(budgets): apply enterprise PageHeader and KpiStrip"
```

---

### Task 8: TransactionListPage + TransactionDetailPage + TransactionEntryPage

**Files:**
- Modify: `frontend/src/features/transactions/TransactionListPage.tsx`
- Modify: `frontend/src/features/transactions/TransactionDetailPage.tsx`
- Modify: `frontend/src/features/transactions/TransactionEntryPage.tsx`

#### TransactionListPage

- [ ] **Step 1: Add PageHeader + KpiStrip to TransactionListPage.tsx**

Read the file. Find the outermost return div. Prepend:

```tsx
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'
import { PageTabs } from '../../shared/components/PageTabs'

// Add tab state at component level:
const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expenses'>('all')

// Filter transactions by active tab:
const visibleTransactions = transactions?.filter((t) => {
  if (activeTab === 'income')   return t.type === 'income'
  if (activeTab === 'expenses') return t.type === 'expense'
  return true
})

// Compute KPIs from all transactions (not filtered):
const totalIn  = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) ?? 0
const totalOut = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0
const net      = totalIn - totalOut
const count    = transactions?.length ?? 0

// At the top of return (use visibleTransactions for the list render below):
<PageHeader
  title="Transactions"
  actions={
    <Button variant="primary" size="sm" onClick={() => navigate('/transactions/add')}>
      + Add
    </Button>
  }
/>
<PageTabs
  tabs={[
    { key: 'all',      label: 'All'      },
    { key: 'income',   label: 'Income'   },
    { key: 'expenses', label: 'Expenses' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
<KpiStrip
  items={[
    { label: 'In',    value: `$${totalIn.toFixed(2)}`,  valueClassName: 'text-success' },
    { label: 'Out',   value: `$${totalOut.toFixed(2)}`, valueClassName: 'text-error'   },
    { label: 'Net',   value: `$${net.toFixed(2)}`,      valueClassName: net >= 0 ? 'text-success' : 'text-error' },
    { label: 'Count', value: String(count) },
  ]}
/>
```

Replace all downstream references to `transactions` in the list render with `visibleTransactions`. Keep all other existing logic unchanged.

#### TransactionDetailPage

- [ ] **Step 2: Add PageHeader to TransactionDetailPage.tsx**

The back button is already handled by the route `handle.backButton` in the layout. Add:

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

// At top of return, replacing any existing title markup:
<PageHeader
  title={transaction.description}
  subtitle={new Date(transaction.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
/>
```

Keep the existing `DataList` detail rows and delete button below unchanged.

#### TransactionEntryPage

- [ ] **Step 3: Add PageHeader to TransactionEntryPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

// At top of return:
<PageHeader title={isEdit ? 'Edit Transaction' : 'Add Transaction'} />
```

Keep all existing form fields unchanged. Remove any existing `<h1>` or title text that duplicates this.

- [ ] **Step 4: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/transactions/
git commit -m "feat(transactions): apply enterprise PageHeader and KpiStrip"
```

---

### Task 9: BalanceHistoryPage + InsightsPage

**Files:**
- Modify: `frontend/src/features/transactions/BalanceHistoryPage.tsx`
- Modify: `frontend/src/features/insights/InsightsPage.tsx` (or index file, check actual export path)

#### BalanceHistoryPage

- [ ] **Step 1: Add PageHeader to BalanceHistoryPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

// At top of return:
<PageHeader title="Balance History" />
```

Keep existing chart and/or table content unchanged.

#### InsightsPage

- [ ] **Step 2: Add PageHeader to InsightsPage**

Find the InsightsPage component (exported from `frontend/src/features/insights/index.ts` or `InsightsPage.tsx`):

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

// At top of return:
<PageHeader title="Insights" />
```

Keep existing chart/analytics content unchanged.

- [ ] **Step 3: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/transactions/BalanceHistoryPage.tsx frontend/src/features/insights/
git commit -m "feat(insights): apply enterprise PageHeader to BalanceHistory and Insights"
```

---

### Task 10: GoalDetailPage + CategoryManagementPage

**Files:**
- Modify: `frontend/src/features/goals/GoalDetailPage.tsx`
- Modify: `frontend/src/features/categories/CategoryManagementPage.tsx`

#### GoalDetailPage

- [ ] **Step 1: Add PageHeader + KpiStrip to GoalDetailPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'

// Compute from goal data:
const pctComplete = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
const remaining   = Math.max(goal.targetAmount - goal.currentAmount, 0)

// At top of return:
<PageHeader
  title={goal.name}
  actions={
    <Button variant="outline" size="sm" onClick={() => navigate(`/goals/${goal.id}/edit`)}>
      Edit
    </Button>
  }
/>
<KpiStrip
  items={[
    { label: 'Target',     value: `$${goal.targetAmount.toFixed(2)}` },
    { label: 'Saved',      value: `$${goal.currentAmount.toFixed(2)}`, valueClassName: 'text-success' },
    { label: 'Remaining',  value: `$${remaining.toFixed(2)}` },
    { label: '% Complete', value: `${pctComplete}%`, valueClassName: pctComplete >= 100 ? 'text-success' : undefined },
  ]}
/>
```

Keep existing progress bar and contribution history below unchanged.

#### CategoryManagementPage

- [ ] **Step 2: Add PageHeader to CategoryManagementPage.tsx**

Read the file to understand current structure, then add at the top of the return:

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

<PageHeader
  title="Categories"
  actions={
    <Button variant="primary" size="sm" onClick={/* existing new-category handler */}>
      + New Category
    </Button>
  }
/>
```

Keep existing category list/grid and modals below unchanged.

- [ ] **Step 3: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/goals/GoalDetailPage.tsx frontend/src/features/categories/CategoryManagementPage.tsx
git commit -m "feat(goals,categories): apply enterprise PageHeader and KpiStrip"
```

---

### Task 11: PaymentMethodSummaryPage + PaymentMethodManagementPage

**Files:**
- Modify: `frontend/src/features/payment-methods/PaymentMethodSummaryPage.tsx`
- Modify: `frontend/src/features/payment-methods/PaymentMethodManagementPage.tsx`

#### PaymentMethodSummaryPage

- [ ] **Step 1: Add PageHeader + KpiStrip to PaymentMethodSummaryPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'
import { KpiStrip } from '../../shared/components/KpiStrip'
import { useNavigate } from 'react-router-dom'

// Inside component:
const navigate = useNavigate()

// At top of return:
<PageHeader
  title="Payment Methods"
  actions={
    <Button variant="outline" size="sm" onClick={() => navigate('/payment-methods')}>
      Manage
    </Button>
  }
/>
<KpiStrip
  items={[
    { label: 'Total Methods', value: String(paymentMethods?.length ?? 0) },
    { label: 'Most Used',     value: mostUsedMethod?.name ?? '—' },
  ]}
/>
```

Keep existing payment method list/cards below unchanged.

#### PaymentMethodManagementPage

- [ ] **Step 2: Add PageHeader to PaymentMethodManagementPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

<PageHeader
  title="Manage Payment Methods"
  actions={
    <Button variant="primary" size="sm" onClick={/* existing add handler */}>
      + Add Method
    </Button>
  }
/>
```

Keep existing form/list below unchanged.

- [ ] **Step 3: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/payment-methods/
git commit -m "feat(payment-methods): apply enterprise PageHeader and KpiStrip"
```

---

### Task 12: YourAccountPage + AppearancePage + SessionsPage + ProfilePage

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx`
- Modify: `frontend/src/features/your-account/AppearancePage.tsx`
- Modify: `frontend/src/features/your-account/SessionsPage.tsx`
- Modify: `frontend/src/features/your-account/ProfilePage.tsx`

- [ ] **Step 1: Add PageHeader to YourAccountPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

// At top of return (replacing any existing h1/title):
<PageHeader title="Your Account" />
```

Keep all existing settings sections (profile, preferences, security) below unchanged.

- [ ] **Step 2: Add PageHeader to AppearancePage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

<PageHeader title="Appearance" />
```

- [ ] **Step 3: Add PageHeader to SessionsPage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

<PageHeader title="Active Sessions" subtitle="Devices currently signed in to your account" />
```

Keep existing session list below unchanged.

- [ ] **Step 4: Add PageHeader to ProfilePage.tsx**

```tsx
import { PageHeader } from '../../shared/components/PageHeader'

<PageHeader title="Profile & XP" />
```

Keep existing XP/gamification layout below unchanged.

- [ ] **Step 5: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/your-account/
git commit -m "feat(account): apply enterprise PageHeader to account pages"
```

---

### Task 13: ManualBudgetSetupPage + Onboarding pages

**Files:**
- Modify: `frontend/src/features/budgets/ManualBudgetSetupPage.tsx`
- Modify: `frontend/src/features/onboarding/BalanceSetupStep.tsx`
- Modify: `frontend/src/features/onboarding/OnboardingBudgetStep.tsx`

These are wizard/step pages. They don't use `PageHeader` (they have their own step headers), but need typography standardised.

- [ ] **Step 1: Standardise ManualBudgetSetupPage.tsx step header typography**

Read the file. Find any step title `<h1>` or `<h2>` elements. Apply:
- Step title: `className="text-xl font-semibold text-text-primary tracking-tight"`
- Step subtitle/description: `className="text-sm text-text-secondary mt-1"`
- Progress indicator text: `className="text-xs font-semibold uppercase tracking-wide text-text-secondary"`

Replace only the className strings; keep all logic unchanged.

- [ ] **Step 2: Standardise BalanceSetupStep.tsx typography**

Same approach — apply step title and subtitle class strings as above. No logic changes.

- [ ] **Step 3: Standardise OnboardingBudgetStep.tsx typography**

Same approach.

- [ ] **Step 4: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/budgets/ManualBudgetSetupPage.tsx frontend/src/features/onboarding/
git commit -m "feat(onboarding): standardise step header typography to enterprise spec"
```

---

### Task 14: HomePage restructure + SigninPage

**Files:**
- Modify: `frontend/src/features/home/HomePage.tsx`
- Modify: `frontend/src/features/signin/SigninPage.tsx`

#### HomePage

The homepage keeps its bento grid for the WealthProfileCard hero but adds a KPI strip at the very top for at-a-glance numbers.

- [ ] **Step 1: Add top KPI strip to HomePage.tsx**

Read the current HomePage. Find the outermost return. Prepend before the first bento row:

```tsx
import { KpiStrip } from '../../shared/components/KpiStrip'
import { Money } from '../../shared/components/Money'

// At the very top of the return div, before bento grid:
<KpiStrip
  className="mb-4"
  items={[
    { label: 'Net Worth',    value: <Money amount={netWorth}    /> },
    { label: 'Income',       value: <Money amount={monthlyIncome}  />, valueClassName: 'text-success' },
    { label: 'Expenses',     value: <Money amount={monthlyExpenses}/>, valueClassName: 'text-error'   },
    { label: 'Savings Rate', value: `${savingsRate}%` },
  ]}
/>
```

Wire `netWorth`, `monthlyIncome`, `monthlyExpenses`, `savingsRate` from existing Redux selectors / RTK Query hooks already present in the file. Keep all bento card rows below unchanged.

#### SigninPage

- [ ] **Step 2: Standardise SigninPage.tsx**

Read the file. Ensure:
- The page card/container has `max-w-sm mx-auto` centering
- The Kaizen logo is above the form
- The title uses `text-xl font-semibold text-text-primary`

No logic changes — only className standardisation.

- [ ] **Step 3: Run typecheck**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/home/HomePage.tsx frontend/src/features/signin/SigninPage.tsx
git commit -m "feat(home,signin): add KPI strip to dashboard, standardise signin layout"
```

---

## Phase 4 — QA Pass

### Task 15: TypeScript audit + visual consistency check

**Files:** Read-only audit — no edits unless typecheck reports errors.

- [ ] **Step 1: Full TypeScript check**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tee /tmp/tsc-out.txt
cat /tmp/tsc-out.txt
```

Expected: 0 errors. If errors exist, fix the reported lines before proceeding.

- [ ] **Step 2: Lint check**

```bash
cd frontend && npm run lint
```

Expected: 0 errors, 0 warnings (or only pre-existing warnings).

- [ ] **Step 3: Start dev server and manually verify each section**

```bash
cd frontend && npm run dev
```

Open http://localhost:5173. Check:

**Layout shell:**
- [ ] Desktop (≥1024px): sidebar shows icons + labels at w-56, content offset correct
- [ ] Tablet (768–1023px): icon rail at w-14, tooltips appear on hover, content offset correct
- [ ] Mobile (<768px): no sidebar; hamburger opens drawer; drawer closes on nav click and backdrop click

**Pages — verify each has PageHeader:**
- [ ] Home: KPI strip visible above bento grid
- [ ] Transactions: PageHeader + KpiStrip (In/Out/Net/Count)
- [ ] Budgets: PageHeader + KpiStrip (Budgeted/Spent/Remaining/Over)
- [ ] Budget detail: PageHeader with budget name + KpiStrip
- [ ] Insights: PageHeader
- [ ] Goals: PageHeader + KpiStrip (Target/Saved/Remaining/%)
- [ ] Categories: PageHeader with "New Category" button
- [ ] Payment Methods: PageHeader + KpiStrip
- [ ] Account pages (×4): each has PageHeader
- [ ] SigninPage: centered, logo above form

**Dark mode:** Toggle dark mode in Appearance page. Confirm sidebar, top bar, and all new components respect `bg-background`, `text-text-primary`, `border-border-subtle` tokens.

- [ ] **Step 4: Final commit**

```bash
git add -p   # review any remaining unstaged changes
git commit -m "chore(qa): enterprise UI/UX redesign — all pages verified"
```

---

## Appendix: Component APIs Reference

### PageHeader
```tsx
<PageHeader
  title="Page Title"
  subtitle="Optional subtitle"      // optional
  actions={<Button>Action</Button>}  // optional, right-aligned
/>
```

### KpiStrip
```tsx
<KpiStrip
  items={[
    { label: 'LABEL', value: '$1,234' },
    { label: 'LABEL', value: '$567', valueClassName: 'text-error' },
  ]}
/>
```

### DataTable
```tsx
<DataTable
  columns={[
    { key: 'name',   header: 'Name',   cell: (row) => row.name   },
    { key: 'amount', header: 'Amount', cell: (row) => `$${row.amount}`, className: 'text-right', headerClassName: 'text-right' },
  ]}
  rows={data}
  getRowKey={(row) => row.id}
  onRowClick={(row) => navigate(`/detail/${row.id}`)}
  emptyState={<EmptyStateCard title="No data" />}
/>
```

### Button variants (existing)
- `variant="primary"` — green fill (primary CTA)
- `variant="outline"` — bordered (secondary action)
- `variant="destructive"` — red fill (delete/danger)
- `variant="ghost"` — no border (tertiary)
- `size="sm" | "md" | "lg"`
