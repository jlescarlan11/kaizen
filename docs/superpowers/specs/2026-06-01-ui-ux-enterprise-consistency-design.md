# Kaizen UI/UX Enterprise Consistency Redesign

**Date:** 2026-06-01
**Status:** Approved
**Scope:** All 20 authenticated + public pages

---

## 1. Goal

Unify all 20 pages of the Kaizen personal finance app under a consistent, standard business/enterprise UI/UX system. The current app has a strong token-driven design foundation and custom component library, but pages vary in layout density, navigation patterns, and visual hierarchy. This spec defines the target system that every page must conform to.

---

## 2. Design Direction

**Style:** Enterprise Dashboard — structured, data-forward, professional. Reference: QuickBooks, Xero, Google Analytics.
**Tone:** Clean and minimal within that structure — not cold or cramped. Medium density. Breathing room preserved.
**Mode:** Light-mode primary, dark mode fully supported (existing token system maintained).
**Typography:** DM Sans (existing). Uppercase micro-labels for KPI stat names; large bold values. Tighter hierarchy than current.

---

## 3. Navigation Shell

### 3.1 Sidebar (replaces bottom nav)

All authenticated pages render inside a layout shell with a **persistent left sidebar**:

| Breakpoint | Sidebar behavior |
|---|---|
| `≥ 1024px` (desktop) | Full sidebar: 220px wide, icon + label, always visible |
| `768–1023px` (tablet) | Icon rail: 56px wide, icon only, labels on hover tooltip |
| `< 768px` (mobile) | Hidden by default; hamburger button in top header opens a full-height slide-out drawer |

**Sidebar nav items (in order):**
1. Home
2. Transactions
3. Budgets
4. Insights
5. Goals
6. Categories
7. Payment Methods
8. *(divider)*
9. Account / Settings

**Sidebar structure:**
- Top: Logo mark + "Kaizen" wordmark (desktop), logo mark only (icon rail)
- Middle: Nav items with active state (filled background, green label + icon)
- Bottom: Account avatar + name (desktop) or avatar only (icon rail), links to YourAccountPage

### 3.2 Top Header Bar

A slim `48px` top bar sits above all page content (not above the sidebar):
- Left: Page title (current route)
- Right: Privacy mode toggle, notification bell (future), user avatar
- Mobile only: hamburger menu icon on the far left

### 3.3 Authenticated Layout Changes

`AuthenticatedLayout.tsx` is refactored to render:
```
<div class="flex h-screen">
  <Sidebar />                        // fixed left
  <div class="flex-1 flex flex-col overflow-hidden">
    <TopBar />                       // fixed top within content area
    <main class="flex-1 overflow-y-auto p-4 md:p-6">
      <Outlet />
    </main>
  </div>
</div>
```

The existing bottom nav (`SiteFooter` / tab bar) is removed from the authenticated layout.

---

## 4. Page Layout Pattern

Every content page follows this top-to-bottom structure:

```
┌─────────────────────────────────────────────┐
│ Page Header                                 │
│  Title (h1) + optional subtitle             │
│  Action buttons (right-aligned)             │
├─────────────────────────────────────────────┤
│ Sub-Tabs (optional — only if page has       │
│ multiple views, e.g. All / Income / Expense)│
├─────────────────────────────────────────────┤
│ KPI Strip (optional — 2–4 stat chips)       │
│  LABEL / value pairs, inline                │
├─────────────────────────────────────────────┤
│ Primary Content                             │
│  Table, card grid, form, or chart           │
└─────────────────────────────────────────────┘
```

### 4.1 Page Header
- `h1`: `text-xl font-semibold text-foreground` (not `font-bold`, not `text-2xl` — enterprise uses tighter sizing)
- Subtitle: `text-sm text-muted-foreground`
- Action buttons: right-aligned, primary action uses `Button variant="default"` (green fill), secondary uses `variant="outline"`

### 4.2 Sub-Tabs
- Underline-style tabs (`border-b border-border` on the container, `border-b-2 border-primary` on active tab)
- Text: `text-sm font-medium`
- Only used where genuinely multiple views exist; not decorative

### 4.3 KPI Strip
- Inline row of 2–4 chips
- Each chip: `UPPERCASE LABEL` in `text-xs text-muted-foreground`, value in `text-base font-semibold text-foreground`
- Separated by dividers (`|`) or border-right on each chip
- No card background — sits flush between tabs and content

### 4.4 Primary Content
- **Data lists (< 8 rows):** Existing rich-list pattern with category icon chip, title, subtitle, amount — keep this, standardize row padding to `py-3 px-4`
- **Data tables (≥ 8 rows or sortable):** Full-width `<table>` with `thead` using `text-xs uppercase text-muted-foreground`, rows with `border-b border-border/50`, hover `bg-muted/30`
- **Card grids:** Only on Dashboard and summary/overview pages. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with consistent `Card` component
- **Forms:** Single-column on mobile, max-w-lg centered on desktop, `space-y-5` between field groups

---

## 5. Component Standards

### 5.1 Cards
- All cards use the existing `Card` component
- Border: `border border-border` (no shadow-only cards)
- Padding: `p-4 md:p-5` (no `p-3`, no `p-6` unless explicitly a large dashboard card)
- No `bento-card` utility class on non-dashboard pages — reserve for homepage only

### 5.2 Buttons
- Primary CTA: `variant="default"` (green fill) — one per page header max
- Secondary actions: `variant="outline"`
- Destructive: `variant="destructive"`
- No bare `<button>` tags in page-level components — always use `Button`

### 5.3 Badges / Status chips
- Use existing `Badge` component with semantic variants: `success`, `error`, `warning`, `info`
- Spending over budget: `error`; on track: `success`; near limit: `warning`

### 5.4 Empty States
- Use `EmptyStateCard` component (existing)
- All empty states must have: icon, title, body copy, primary action button
- No custom ad-hoc empty state markup in pages

### 5.5 Typography
- **Page title:** `text-xl font-semibold`
- **Section heading:** `text-sm font-semibold uppercase tracking-wide text-muted-foreground`
- **KPI value:** `text-2xl font-bold` (dashboard) or `text-base font-semibold` (inline KPI strip)
- **KPI label:** `text-xs uppercase tracking-wide text-muted-foreground`
- **Table header:** `text-xs font-semibold uppercase tracking-wide text-muted-foreground`
- **Body/list item:** `text-sm text-foreground`
- **Meta/caption:** `text-xs text-muted-foreground`
- No `text-[10px]`, no arbitrary font sizes

---

## 6. Page-by-Page Specification

### 6.1 HomePage (Dashboard)
- KPI strip: Net Worth, Monthly Income, Monthly Expenses, Savings Rate
- Row 1: WealthProfileCard (existing, keep as hero)
- Row 2: Budget health table (top 5 budgets: name, allocated, spent, % bar, status badge)
- Row 3: Recent activity (last 5 transactions, rich list) + Quick actions card
- Remove / consolidate redundant bento cards that duplicate data

### 6.2 TransactionListPage
- Sub-tabs: All · Income · Expenses
- KPI strip: Total In, Total Out, Net, Count
- Content: rich list grouped by date (date as section header `text-xs uppercase text-muted-foreground`)
- Filter button in page header opens a slide-over filter panel (not inline)

### 6.3 TransactionEntryPage (Add/Edit)
- Page title: "Add Transaction" or "Edit Transaction"
- Single-column form, max-w-lg, centered on desktop
- Fields: Amount (large input, top), Type toggle (Income/Expense), Category selector, Date, Payment method, Notes
- Footer: Cancel (outline) + Save (primary)

### 6.4 TransactionDetailPage
- Page header with back button + "Edit" action
- Detail panel: two-column label/value list (`DataList` component)
- Bottom: "Delete transaction" destructive button, separated visually

### 6.5 BalanceHistoryPage
- Sub-tabs: Chart · Table
- Chart tab: existing LineChart
- Table tab: full-width table, Date / Balance / Change / % columns

### 6.6 BudgetsPage
- Sub-tabs: Active · Archived
- KPI strip: Total Budgeted, Total Spent, Remaining, # Over Budget
- Content: budget table — Name, Period, Allocated, Spent, % (progress bar inline), Status badge
- "New Budget" primary button in page header

### 6.7 BudgetDetailPage
- Page header: budget name + period selector + "Edit" action
- KPI strip: Allocated, Spent, Remaining, Days Left
- Below: transactions table (same as TransactionListPage but pre-filtered to this budget)

### 6.8 ManualBudgetSetupPage
- Step wizard (existing pattern, keep)
- Standardize step header and progress indicator to match enterprise typography

### 6.9 InsightsPage
- Sub-tabs: Spending · Income · Trends
- Each tab: chart (top 60% of viewport) + data table below (breakdown)

### 6.10 GoalDetailPage
- Page header: goal name + "Edit" action
- KPI strip: Target, Saved, Remaining, % Complete
- Progress bar (large, full-width)
- Below: contribution history table

### 6.11 CategoryManagementPage
- Page header + "New Category" primary button
- Content: management table — Color swatch, Icon, Name, # Transactions, Actions (Edit/Delete)
- No card grid — table only

### 6.12 PaymentMethodSummaryPage
- KPI strip: Total Methods, Most Used
- Content: table — Name, Type, Last Used, Total Spent
- Link to PaymentMethodManagementPage in header

### 6.13 PaymentMethodManagementPage
- Management table: Name, Type, Actions (Edit/Delete)
- "Add Payment Method" primary button in header

### 6.14 YourAccountPage
- Grouped settings sections (existing pattern, keep)
- Standardize section headers to `text-sm font-semibold uppercase tracking-wide text-muted-foreground`
- Each section in a `Card` with consistent padding

### 6.15 ProfilePage (XP)
- Keep existing XP/gamification layout (designed May 10)
- Apply standard page header pattern

### 6.16 AppearancePage
- Settings form layout — label + control pairs
- Within a single Card

### 6.17 SessionsPage
- Table: Device, Location, Last Active, Actions (Revoke)
- Current session highlighted with `success` badge

### 6.18 SigninPage
- Centered card layout (max-w-sm), no sidebar
- Kaizen logo above form
- Standard form layout

### 6.19 OnboardingBudgetStep + BalanceSetupStep
- Step wizard pattern (existing)
- Standardize header, progress bar, and button placement

---

## 7. What Does NOT Change

- Design token system (`globals.css`, CSS variables) — preserved
- Dark mode support — preserved
- Existing component API (Button, Card, Modal, etc.) — preserved, new CSS classes applied
- Route structure — no route changes
- Business logic, Redux slices, RTK Query — untouched
- The `bento-card` utility and dashboard bento grid on HomePage — preserved (it's a deliberate hero section)

---

## 8. Implementation Phases

### Phase 1 — Layout Shell (blocks everything else)
Refactor `AuthenticatedLayout.tsx` to add `Sidebar` component and `TopBar` component. Remove bottom nav from authenticated shell. All pages automatically get the new shell.

### Phase 2 — Design System Tokens
- Add `text-page-title`, `text-section-label`, `text-kpi-value`, `text-kpi-label`, `text-table-header` as Tailwind utilities mapped to the token values in Phase 5 of this spec
- Add `KpiStrip` and `PageHeader` reusable components
- Add `DataTable` component (wrapper around `<table>` with standard header/row styling)

### Phase 3 — Page Content (parallel)
Apply the page-by-page spec (Section 6) across all 20 pages. Pages are independent — can be done in parallel by multiple agents. Each agent gets a subset of pages.

### Phase 4 — QA Pass
Visual consistency check across all pages in both light and dark mode. Typography audit. Empty state audit.

---

## 9. Out of Scope

- New features (no new data, no new routes)
- Animation/motion changes (existing `--motion-standard` preserved)
- Backend changes
- PlaygroundPage (dev-only, excluded)
