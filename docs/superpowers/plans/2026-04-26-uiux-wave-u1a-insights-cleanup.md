# Wave U-1a — InsightsPage Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `InsightsPage` and its three sub-components into compliance with `CODING_STANDARDS.md` §1.7.1, surface the section titles that are silently dropped today, restore the `<header>` landmark, and adopt the `pageLayout` helper — all in one reviewable PR.

**Architecture:** Five mechanical refactors gated by TypeScript / ESLint / build / manual smoke-test. Closes BLOCKERS U-VIS-1, U-VIS-2 (TransactionList is in U-1b — not this plan; renumbered on read), U-LAY-7, plus QUALITY items U-VIS-7, U-LAY-1, U-LAY-8. The chart hex literals are replaced with CSS-variable references inline (`fill="var(--color-primary)"`) — the broader chart-theming refactor (U-VIS-6) is a separate plan.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (CSS-first config), Recharts 3, Headless UI, Vite 7. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` (findings U-VIS-1, U-VIS-7, U-LAY-1, U-LAY-7, U-LAY-8)

**Branch:** Create `fix/uiux-u1a-insights-cleanup` off `main` *before* Task 1 (the audit-spec branch `audit/uiux-consistency-phase1` will land separately).

**Verification gate (every task ends with):**
1. `cd frontend && npm run typecheck` — must report no errors.
2. `cd frontend && npm run lint` — must pass with `--max-warnings=0`.
3. `cd frontend && npm run build` — must produce a clean dist (catches things typecheck and lint don't).
4. Manual: `cd frontend && npm run dev`, visit `http://localhost:5173/insights`, smoke-test the page in **light mode AND dark mode** (toggle via your system theme or the in-app appearance control). Confirm: section titles render, period selector works, charts render, no console errors.

The frontend has no automated test runner today; introducing one is out of scope for U-1a.

---

## File Structure

| File | Responsibility | Touched in |
|------|----------------|------------|
| `frontend/src/shared/components/Card.tsx` | Add `title?: ReactNode` prop, render as `<h3>` inside the card. | Task 1 |
| `frontend/src/features/insights/InsightsPage.tsx` | Replace page shell with `<section>` + `<header>`, swap forbidden tokens, adopt `pageLayout`. | Task 2 |
| `frontend/src/features/insights/components/SpendingSummary.tsx` | Replace `text-green-600`/`text-red-600`/`font-bold` with semantic income/expense tokens. | Task 3 |
| `frontend/src/features/insights/components/CategoryBreakdown.tsx` | Replace `text-gray-500`/hex chart colors/`hover:text-indigo-600` with semantic tokens / CSS var references. | Task 4 |
| `frontend/src/features/insights/components/SpendingTrends.tsx` | Use `<Button>` primitive for granularity selector; replace bar fill with CSS var; replace text tokens. | Task 5 |
| Final manual smoke + commit verification | Task 6 |

No new files created. No deletions.

---

## Task 1: Add `title?` prop to `Card` component

**Files:**
- Modify: `frontend/src/shared/components/Card.tsx`

**Why first:** every InsightsPage sub-component already passes `<Card title="…">`; Card silently drops the prop today. Once `Card` renders `title`, the visual output of Tasks 3–5 becomes verifiable.

- [ ] **Step 1: Read the current `Card.tsx`**

Confirm current state matches expectations:

```tsx
type CardTone = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone
}
```

The `CardProps` interface adds only `tone` to `HTMLAttributes<HTMLDivElement>`. There is no `title` prop, so `<Card title="X">` lands `title="X"` on the wrapper `<div>` as the HTML `title` attribute (a hover tooltip), not a heading.

- [ ] **Step 2: Replace `Card.tsx` with the title-aware version**

Replace the entire file with:

```tsx
import type { HTMLAttributes, ReactElement, ReactNode, ForwardedRef } from 'react'
import { forwardRef } from 'react'
import { cn } from '../lib/cn'

type CardTone = 'neutral' | 'accent' | 'success' | 'error' | 'warning' | 'info'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: CardTone
  title?: ReactNode
}

const toneStyles: Record<CardTone, string> = {
  neutral: 'border-ui-border-subtle bg-transparent text-foreground shadow-none',
  accent: 'border-ui-border bg-ui-accent-subtle text-foreground',
  success: 'border-ui-border bg-ui-success-subtle text-foreground',
  error: 'border-ui-border bg-ui-danger-subtle text-foreground',
  warning: 'border-ui-border bg-ui-warning-subtle text-foreground',
  info: 'border-ui-border bg-ui-info-subtle text-foreground',
}

export const Card = forwardRef(function Card(
  { children, className, tone = 'neutral', title, ...props }: CardProps,
  ref: ForwardedRef<HTMLDivElement>,
): ReactElement {
  return (
    <div ref={ref} className={cn('rounded-xl border p-6', toneStyles[tone], className)} {...props}>
      {title ? (
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground mb-4">
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  )
})
```

Key changes:
- `Omit<HTMLAttributes<HTMLDivElement>, 'title'>` removes the native HTML `title` attribute from the spread surface so a string `title` prop never leaks onto the `<div>` as a tooltip.
- Added `title?: ReactNode` to `CardProps`.
- Render the title as an `<h3>` using the canonical h3 typography role from CODING_STANDARDS §1.7.1.
- `mb-4` separates the heading from `{children}`; matches the previous visual gap that sub-components used (their `<Card>` content typically begins with a value/chart directly).

- [ ] **Step 3: Verify typecheck**

Run: `cd frontend && npm run typecheck`
Expected: no errors. If any consumer was relying on `title` reaching the DOM as a tooltip, the build will surface it. Search for `<Card[^>]*title=` and verify each consumer is one of the InsightsPage sub-components — they want the new behavior.

- [ ] **Step 4: Verify lint**

Run: `cd frontend && npm run lint`
Expected: no errors, no warnings (project uses `--max-warnings=0`).

- [ ] **Step 5: Verify build**

Run: `cd frontend && npm run build`
Expected: clean dist; no TypeScript errors; no Vite errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/shared/components/Card.tsx
git commit -m "$(cat <<'EOF'
fix(card): render title prop as <h3> instead of dropping it

CardProps now declares title?: ReactNode and renders it inside the card
using the canonical h3 typography role. Without this, every InsightsPage
section title was landing on the wrapper <div> as the HTML title
attribute (a hover tooltip) and was invisible.

Closes U-LAY-7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Refactor `InsightsPage.tsx` shell

**Files:**
- Modify: `frontend/src/features/insights/InsightsPage.tsx`

**Closes:** U-VIS-7 (canonical h1 pattern), U-LAY-1 (`<header>` landmark), U-LAY-8 (`pageLayout`), and the InsightsPage portion of U-VIS-1 (forbidden tokens on h1 / subtitle / error banner).

- [ ] **Step 1: Read the current `InsightsPage.tsx`** (lines 38–74 are what we replace; imports stay).

Note today's offending bits, for context:
- line 39: `<div className="p-6 max-w-7xl mx-auto">` — hardcoded layout
- line 40: `<div className="flex flex-col md:flex-row …">` — should be `<header>`
- line 42: `<h1 className="text-3xl font-bold text-gray-900">` — `font-bold` and `text-gray-900` both forbidden
- line 43: `<p className="text-gray-500 mt-1">` — `text-gray-500` forbidden
- line 49: `<div className="bg-red-50 border border-red-200 text-red-700 …">` — hardcoded danger colors

- [ ] **Step 2: Add the `pageLayout` import and update the imports block**

The current top of the file imports React state, hooks, RTK Query hooks, types, and the four sub-components. Add one new import line after the existing imports:

```tsx
import { pageLayout } from '../../shared/styles/layout'
```

Keep all existing imports unchanged.

- [ ] **Step 3: Replace the JSX return block (currently lines 38–74) with the canonical shell**

Replace:

```tsx
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spending Insights</h1>
          <p className="text-gray-500 mt-1">Analyze your income and expenses over time.</p>
        </div>
        <PeriodSelector value={period} onChange={updatePeriod} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
          {error instanceof Error ? error.message : 'Failed to load insights. Please try again.'}
        </div>
      )}

      <div className="space-y-8">
        <SpendingSummary
          summary={summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 }}
          isLoading={isSummaryLoading && !summary}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryBreakdown
            breakdown={breakdown || { categories: [] }}
            isLoading={isBreakdownLoading && !breakdown}
          />
          <SpendingTrends
            trends={trends || { series: [] }}
            granularity={granularity}
            onGranularityChange={setGranularity}
            isLoading={isTrendsLoading && !trends}
          />
        </div>
      </div>
    </div>
  )
}
```

With:

```tsx
  return (
    <section className={pageLayout.sectionGap}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className={pageLayout.headerGap}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
            Spending Insights
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Analyze your income and expenses over time.
          </p>
        </div>
        <PeriodSelector value={period} onChange={updatePeriod} />
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-ui-border bg-ui-danger-subtle p-4 text-ui-danger-text"
        >
          {error instanceof Error ? error.message : 'Failed to load insights. Please try again.'}
        </div>
      )}

      <SpendingSummary
        summary={summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 }}
        isLoading={isSummaryLoading && !summary}
      />

      <div className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
        <CategoryBreakdown
          breakdown={breakdown || { categories: [] }}
          isLoading={isBreakdownLoading && !breakdown}
        />
        <SpendingTrends
          trends={trends || { series: [] }}
          granularity={granularity}
          onGranularityChange={setGranularity}
          isLoading={isTrendsLoading && !trends}
        />
      </div>
    </section>
  )
}
```

Notes for the engineer:
- `<section className={pageLayout.sectionGap}>` replaces the hardcoded `p-6 max-w-7xl mx-auto`. The outer `<main>` in `AuthenticatedLayout.tsx` already provides max-width and padding; the page does not need to manage them.
- The header h1 class string is verbatim from CODING_STANDARDS §1.7.1 `h1` role.
- Subtitle class is verbatim from the `body` role.
- The error banner uses `role="alert"` so screen readers announce it. The token swap is `bg-red-50 → bg-ui-danger-subtle`, `border-red-200 → border-ui-border`, `text-red-700 → text-ui-danger-text`.
- The `space-y-8` wrapper around children was removed in favor of `pageLayout.sectionGap` on the `<section>`. That gap (`space-y-6 md:space-y-7`) is slightly tighter than `space-y-8`; intentional — matches BudgetsPage.

- [ ] **Step 4: Verify typecheck, lint, build**

Run each in order:

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

Each must succeed.

- [ ] **Step 5: Manual smoke test**

```bash
cd frontend && npm run dev
```

Visit `http://localhost:5173/insights`. Confirm:
- The page renders without a console error.
- The page header is `Spending Insights` with the subtitle "Analyze your income and expenses over time." beneath it.
- The PeriodSelector sits to the right at `md+`, below the header on mobile.
- The error banner does NOT appear (no error state in the happy path).
- The page-shell margins look like sibling pages (Budgets, Transactions).
- Toggle dark mode (use the Appearance setting in Your Account, or your OS theme): text remains readable; banner colors adapt.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/insights/InsightsPage.tsx
git commit -m "$(cat <<'EOF'
fix(insights): replace InsightsPage shell with canonical pattern

- Wrap page in <section className={pageLayout.sectionGap}>; drop the
  hardcoded p-6 max-w-7xl mx-auto.
- Wrap title + subtitle + period selector in <header>.
- Replace text-gray-900/500 with text-foreground/text-muted-foreground.
- Replace text-3xl font-bold with the canonical h1 typography role
  (text-3xl md:text-4xl font-semibold tracking-tight leading-tight
  text-foreground).
- Replace bg-red-50/border-red-200/text-red-700 error banner with
  semantic ui-danger-subtle/ui-border/ui-danger-text and add role="alert".

Closes U-VIS-7, U-LAY-1, U-LAY-8 and the page-shell portion of U-VIS-1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Refactor `SpendingSummary.tsx`

**Files:**
- Modify: `frontend/src/features/insights/components/SpendingSummary.tsx`

**Closes:** SpendingSummary portion of U-VIS-1 — `text-2xl font-bold text-green-600`, `text-2xl font-bold text-red-600`, `bg-gray-100` skeleton.

- [ ] **Step 1: Read the current file** (38 lines).

- [ ] **Step 2: Replace the entire file with the token-compliant version**

```tsx
import { Card } from '../../../shared/components/Card'
import type { SpendingSummary as SpendingSummaryType } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface SpendingSummaryProps {
  summary: SpendingSummaryType
  isLoading: boolean
}

export function SpendingSummary({ summary, isLoading }: SpendingSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-ui-surface-muted" />
        ))}
      </div>
    )
  }

  const netBalanceColor = summary.netBalance >= 0 ? 'text-income' : 'text-expense'

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card title="Total Income">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-income">
          {formatCurrency(summary.totalIncome)}
        </p>
      </Card>
      <Card title="Total Expenses">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-expense">
          {formatCurrency(summary.totalExpenses)}
        </p>
      </Card>
      <Card title="Net Balance">
        <p
          className={`text-2xl md:text-3xl font-semibold tracking-tight leading-snug ${netBalanceColor}`}
        >
          {formatCurrency(summary.netBalance)}
        </p>
      </Card>
    </div>
  )
}
```

Notes:
- `text-income` and `text-expense` come from the `--color-income` / `--color-expense` Tailwind v4 tokens defined at `frontend/src/shared/styles/index.css:104-105`. They are the semantic, theme-aware replacements for `text-green-600` / `text-red-600`.
- The amount classes match the canonical `h2` typography role (`text-2xl md:text-3xl font-semibold tracking-tight leading-snug`) but with the income/expense color override — the role allows color-token overrides for semantic surfaces per CODING_STANDARDS §1.7.1.
- Skeleton background swapped from `bg-gray-100` to `bg-ui-surface-muted`.
- `netBalanceColor` is extracted above the JSX (closes U-FRM-12-style polish in the same file as a free fold).

- [ ] **Step 3: Verify typecheck, lint, build**

Run:

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

If `text-income` or `text-expense` is rejected by Tailwind, that means the v4 theme is not picking up the `--color-income` / `--color-expense` variables. Check `frontend/src/shared/styles/index.css:104-105` exists exactly as documented; if so the classes will resolve. (If not, the engineer should not invent a workaround — escalate as BLOCKED.)

- [ ] **Step 4: Manual smoke test**

Run dev server, visit `/insights`:
- Three summary cards render with `Total Income`, `Total Expenses`, and `Net Balance` titles (titles now visible thanks to Task 1).
- Income value renders in the income token color (typically green). Expense value renders in the expense token color (typically red). Net balance switches between the two depending on sign.
- Skeleton loading state (visible while RTK Query is fetching on first load) shows three rounded blocks in `bg-ui-surface-muted` instead of `bg-gray-100`.
- Dark mode: all text remains readable, contrast meets the AAA target.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/insights/components/SpendingSummary.tsx
git commit -m "$(cat <<'EOF'
fix(insights): use semantic income/expense tokens in SpendingSummary

- Replace text-green-600/text-red-600 with text-income/text-expense
  (semantic theme-aware tokens defined in shared/styles/index.css).
- Replace text-2xl font-bold with the canonical h2 role classes
  (font-semibold, tracking-tight, leading-snug) — keeps font-bold out
  of the codebase per CODING_STANDARDS §1.7.1.
- Replace skeleton bg-gray-100 with bg-ui-surface-muted.
- Extract netBalanceColor above the JSX for readability.

Part of U-VIS-1 (SpendingSummary scope).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Refactor `CategoryBreakdown.tsx`

**Files:**
- Modify: `frontend/src/features/insights/components/CategoryBreakdown.tsx`

**Closes:** CategoryBreakdown portion of U-VIS-1 — `text-gray-500`, `hover:text-indigo-600`, hex chart palette, `fill="#8884d8"`.

- [ ] **Step 1: Read the current file** (92 lines).

- [ ] **Step 2: Replace the entire file with the token-compliant version**

```tsx
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card } from '../../../shared/components/Card'
import type { CategoryBreakdown as CategoryBreakdownType } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownType
  isLoading: boolean
}

// Theme-aware categorical palette. Each entry is a CSS variable from
// shared/styles/index.css; Recharts passes the value into the SVG fill
// attribute, which accepts var() in modern browsers. The broader chart
// theming refactor (U-VIS-6) generalises this into a shared hook.
const COLORS = [
  'var(--color-primary)',
  'var(--color-ui-success)',
  'var(--color-ui-warning)',
  'var(--color-ui-info)',
  'var(--color-ui-danger)',
  'var(--color-primary-light)',
  'var(--color-primary-dark)',
] as const

export function CategoryBreakdown({ breakdown, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <Card title="Category Breakdown">
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-sm leading-6 text-muted-foreground">
            Loading breakdown...
          </p>
        </div>
      </Card>
    )
  }

  if (!breakdown.categories || breakdown.categories.length === 0) {
    return (
      <Card title="Category Breakdown">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-muted-foreground">
            No spending data for this period.
          </p>
        </div>
      </Card>
    )
  }

  const chartData = breakdown.categories.map((c) => ({
    name: c.categoryName,
    value: c.total,
  }))

  return (
    <Card title="Category Breakdown">
      <div className="flex flex-col items-center md:flex-row">
        <div className="h-64 w-full md:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 w-full md:mt-0 md:w-1/2">
          <ul className="space-y-2">
            {breakdown.categories.map((c, index) => (
              <li
                key={c.categoryId || 'uncategorized'}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  to={`/transactions?type=EXPENSE${c.categoryId ? `&category=${c.categoryId}` : ''}`}
                  className="flex items-center text-foreground transition-colors hover:text-primary"
                >
                  <span
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {c.categoryName}
                </Link>
                <span className="font-semibold text-foreground">
                  {formatCurrency(c.total)} ({c.percentage.toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
```

Notes:
- The default `fill="#8884d8"` on `<Pie>` was removed; the per-cell `<Cell fill={...}>` already supplies a color, and Recharts only uses the parent fill when no Cell is present.
- `text-gray-500` → `text-muted-foreground` for loading/empty copy.
- `hover:text-indigo-600` → `hover:text-primary` on the legend Link.
- Loading/empty paragraphs use the canonical `body-sm` role classes.
- The legend swatch `<span>` continues to use the inline `style={{ backgroundColor }}` because it pulls from the same `COLORS` array as the chart cells; converting to className would require a second mapping. The `var()` references make it theme-aware.
- The chart palette comment explicitly cross-references U-VIS-6 so the next reviewer of this code understands why a per-feature palette exists rather than a shared hook.

- [ ] **Step 3: Verify typecheck, lint, build**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

If a Tailwind variant (e.g., `hover:text-primary`) is rejected, check `frontend/src/shared/styles/index.css:43` for `--color-primary`. It is defined there and Tailwind v4 should generate the class.

- [ ] **Step 4: Manual smoke test**

Visit `/insights`. Confirm:
- The "Category Breakdown" card title appears (Task 1's fix in action).
- Pie chart renders with semantic palette colors instead of `#0088FE`/etc. (the visual change is subtle — the palette is now your theme primaries/successes/etc. rather than generic chart colors).
- Legend list items: hovering each row turns the text the primary color. Non-hovered text is `text-foreground`.
- Empty state: temporarily inspect with a date range that has no transactions; confirm the empty-state copy uses `text-muted-foreground`.
- Dark mode: chart cells and legend remain visible and contrast-correct.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/insights/components/CategoryBreakdown.tsx
git commit -m "$(cat <<'EOF'
fix(insights): swap CategoryBreakdown tokens and chart palette

- Replace text-gray-500 with text-muted-foreground.
- Replace hover:text-indigo-600 with hover:text-primary.
- Replace hex chart palette with CSS-variable references that resolve
  through the existing theme (var(--color-primary), --color-ui-success,
  etc.). Recharts SVG fills accept var() in modern browsers.
- Drop the default fill="#8884d8" on <Pie>; per-cell <Cell fill> covers
  every datapoint so the parent default is unreachable.
- Loading and empty copy use the canonical body-sm role.

Part of U-VIS-1 (CategoryBreakdown scope). Cross-refs U-VIS-6 for the
broader chart-theming refactor.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Refactor `SpendingTrends.tsx`

**Files:**
- Modify: `frontend/src/features/insights/components/SpendingTrends.tsx`

**Closes:** SpendingTrends portion of U-VIS-1 — `bg-indigo-600 text-white`, `bg-gray-100 text-gray-700`, `fill="#6366f1"`, plus the `text-gray-500` loading/empty copy.

- [ ] **Step 1: Read the current file** (82 lines).

- [ ] **Step 2: Replace the entire file with the token-compliant version**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../../shared/components/Card'
import { Button } from '../../../shared/components/Button'
import type { TrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface SpendingTrendsProps {
  trends: TrendSeries
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
  isLoading: boolean
}

export function SpendingTrends({
  trends,
  granularity,
  onGranularityChange,
  isLoading,
}: SpendingTrendsProps) {
  if (isLoading) {
    return (
      <Card title="Spending Trends">
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-sm leading-6 text-muted-foreground">
            Loading trends...
          </p>
        </div>
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card title="Spending Trends">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm leading-6 italic text-muted-foreground">
            No trend data available for this period.
          </p>
        </div>
      </Card>
    )
  }

  const chartData = trends.series.map((t) => {
    const date = new Date(t.periodStart)
    const name =
      granularity === 'WEEKLY'
        ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    return { name, value: t.total }
  })

  return (
    <Card title="Spending Trends">
      <div
        className="mb-4 flex justify-end gap-2"
        role="group"
        aria-label="Trend granularity"
      >
        <Button
          size="sm"
          variant={granularity === 'WEEKLY' ? 'primary' : 'ghost'}
          aria-pressed={granularity === 'WEEKLY'}
          onClick={() => onGranularityChange('WEEKLY')}
        >
          Weekly
        </Button>
        <Button
          size="sm"
          variant={granularity === 'MONTHLY' ? 'primary' : 'ghost'}
          aria-pressed={granularity === 'MONTHLY'}
          onClick={() => onGranularityChange('MONTHLY')}
        >
          Monthly
        </Button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} width={60} tickFormatter={(val) => `PHP ${val}`} />
            <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0))} />
            <Bar dataKey="value" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
```

Notes:
- Granularity selector now uses the `Button` primitive; `primary` for active and `ghost` for inactive. `size="sm"` matches the previous `px-3 py-1 text-xs`.
- `role="group"` + `aria-label="Trend granularity"` make the segmented control announce as a single labeled group; `aria-pressed` on each button conveys toggle state.
- Bar fill replaced with `var(--color-primary)` (theme-aware).
- Loading/empty copy uses canonical `body-sm` role.

- [ ] **Step 3: Verify typecheck, lint, build**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

- [ ] **Step 4: Manual smoke test**

Visit `/insights`. Confirm:
- The "Spending Trends" card title appears (Task 1's fix).
- Weekly / Monthly toggles render as `Button` primitives. The active variant has the primary fill; the inactive variant is ghost (transparent border, no surface).
- Click between Weekly and Monthly: chart re-renders with the corresponding granularity. The active button updates.
- Bar chart fill matches the primary token (theme green/blue/etc., not raw `#6366f1`).
- Tab into the toggle group with the keyboard: focus ring appears on each Button. Press space/enter to switch. Screen reader announces "Weekly, toggle button, pressed" / "Monthly, toggle button, not pressed".
- Dark mode: buttons and bars remain readable; primary token contrast holds.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/insights/components/SpendingTrends.tsx
git commit -m "$(cat <<'EOF'
fix(insights): use Button primitive and theme tokens in SpendingTrends

- Replace bg-indigo-600/bg-gray-100 segmented control with Button
  primitives (variant="primary" when active, "ghost" otherwise; size="sm").
- Add role="group" + aria-label and aria-pressed for accessibility.
- Replace Bar fill="#6366f1" with var(--color-primary) so the chart
  follows the theme.
- Loading and empty copy use the canonical body-sm role.

Part of U-VIS-1 (SpendingTrends scope).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Final verification + ready-for-PR

**Files:** None modified. Verification only.

- [ ] **Step 1: Re-run the full gate**

```bash
cd frontend && npm run typecheck
cd frontend && npm run lint
cd frontend && npm run build
```

All three must pass.

- [ ] **Step 2: Final manual smoke test in dev**

```bash
cd frontend && npm run dev
```

Walk the entire `/insights` page in **light mode**, then **dark mode**:

- Page header: title + subtitle render in canonical h1 / body roles. Period selector on the right at `md+`.
- Three summary cards: each has a visible h3 title; income green, expense red, net balance follows sign.
- Category Breakdown card: visible title, pie chart renders, legend rows hover to primary color.
- Spending Trends card: visible title, granularity Buttons toggle, bar chart renders.
- Switch the period selector across All / Year / Month / Week and confirm every state still renders cleanly.
- Resize the browser to mobile width (Chrome devtools, ~375px). Header collapses to column; cards stack to one column. No overflow, no horizontal scroll.
- Console: zero errors and zero warnings.

- [ ] **Step 3: Confirm git state**

```bash
git status
git log --oneline -6
```

Expected: working tree clean, six new commits from this plan (Card, InsightsPage, SpendingSummary, CategoryBreakdown, SpendingTrends — 5 commits — plus this verification step which is no-op).

- [ ] **Step 4: Push the branch and surface to the user**

The branch was created off `main` before Task 1 (`fix/uiux-u1a-insights-cleanup`). Push:

```bash
git push -u origin fix/uiux-u1a-insights-cleanup
```

Surface to the user a one-paragraph summary listing which findings closed, the verification steps run, and a suggested PR title — but do not auto-open the PR. The user opens the PR manually unless they explicitly ask for `gh pr create`.

Suggested PR title: `fix(uiux): wave U-1a — InsightsPage cleanup`

Suggested PR body skeleton:

```
Closes the U-1a wave of the UI/UX consistency audit.

## Findings closed
- U-LAY-7 (BLOCKER) — Card silently dropped `title` prop; section
  titles now render as <h3>.
- U-VIS-1 (BLOCKER, InsightsPage scope) — token compliance across
  InsightsPage and three sub-components.
- U-VIS-7, U-LAY-1, U-LAY-8 (QUALITY) — canonical h1, <header>
  landmark, pageLayout adoption.

## Verification
- npm run typecheck — pass
- npm run lint — pass
- npm run build — pass
- Manual smoke test (light + dark mode) — pass

## Audit references
- docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md
- docs/superpowers/plans/2026-04-26-uiux-wave-u1a-insights-cleanup.md
```

---

## Self-Review

**1. Spec coverage:** Walk every finding the plan claims to close.
- U-LAY-7 → Task 1 (Card.title prop). ✅
- U-VIS-1 (InsightsPage scope: page-shell colors, h1 typography, error banner) → Task 2. ✅
- U-VIS-1 (SpendingSummary scope: green/red/font-bold/skeleton bg) → Task 3. ✅
- U-VIS-1 (CategoryBreakdown scope: gray, indigo hover, hex palette, default Pie fill) → Task 4. ✅
- U-VIS-1 (SpendingTrends scope: indigo/gray button styling, bar hex fill, gray copy) → Task 5. ✅
- U-VIS-7 (canonical h1) → Task 2. ✅
- U-LAY-1 (<header> landmark) → Task 2. ✅
- U-LAY-8 (pageLayout adoption) → Task 2. ✅

No gaps for U-1a's claimed scope. U-VIS-2 (TransactionList amber) is U-1b, not in this plan — correctly excluded.

**2. Placeholder scan:** No `TBD`, `TODO` (the one acknowledged TODO is in a code comment cross-referencing U-VIS-6 for a future refactor — that is a deliberate forward reference, not a plan placeholder), no "implement later," no "similar to Task N" hand-waves. Every code block is concrete and complete.

**3. Type / name consistency:**
- `CardProps` interface name and `title?: ReactNode` field consistent across Tasks 1, 3, 4, 5.
- `pageLayout.sectionGap` and `pageLayout.headerGap` referenced in Task 2 match the actual exports in `frontend/src/shared/styles/layout.ts`.
- `text-income` / `text-expense` referenced in Task 3 match the `--color-income` / `--color-expense` defined in `frontend/src/shared/styles/index.css:104-105`.
- `Button` primitive variants (`primary`, `ghost`) and `size="sm"` in Task 5 match the actual exports in `frontend/src/shared/components/Button.tsx`.
- `var(--color-primary)`, `var(--color-ui-success)`, etc. in Tasks 4 and 5 all exist in `frontend/src/shared/styles/index.css`.

No drift detected.
