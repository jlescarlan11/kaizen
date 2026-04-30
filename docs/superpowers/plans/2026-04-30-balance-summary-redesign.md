# Balance Summary Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Balance Summary page to use a full-width bold hero card with a period-aware 3-stat grid, a single horizontal controls row, and remove the Intelligent Observations section entirely.

**Architecture:** Three focused file changes — `BalanceSummaryHero` gets a full rewrite to a gradient card component with new props, `BalanceSummaryPage` restructures layout and removes `TrendInsights`, and `PeriodSelector` sheds its width constraint. No new files or API changes needed.

**Tech Stack:** React 18, TypeScript, Tailwind v4, RTK Query, Recharts

**Verification:** No component test files exist. Verify each task with `npm run typecheck` (run from `frontend/`) and visual inspection in the dev server (`npm run dev`).

---

## File Map

| File | Action | What changes |
|---|---|---|
| `frontend/src/features/insights/components/BalanceSummaryHero.tsx` | **Rewrite** | New props: `periodLabel`, `accountCount`, `totalIncome`, `totalSpent`. Full-width gradient card layout with 3-stat grid. |
| `frontend/src/features/insights/BalanceSummaryPage.tsx` | **Modify** | Derive `periodLabel`, source `totalIncome`/`totalSpent`/`accountCount`, pass to hero. Remove `TrendInsights`. New layout: hero → controls row → section-labelled charts → accounts. |
| `frontend/src/features/insights/components/PeriodSelector.tsx` | **Modify** | Remove `max-w-xs` wrapper so parent controls width. |

---

## Task 1: Remove width constraint from PeriodSelector

**Files:**
- Modify: `frontend/src/features/insights/components/PeriodSelector.tsx`

- [ ] **Step 1: Remove the `max-w-xs` wrapper**

Open `frontend/src/features/insights/components/PeriodSelector.tsx`. Change:

```tsx
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="w-full max-w-xs">
      <Select
        id="period-selector"
        label="Analysis Period"
        aria-label="Analysis period"
        options={OPTIONS}
        value={value}
        onChange={(val) => onChange(val as PeriodOption)}
      />
    </div>
  )
}
```

To:

```tsx
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="w-full">
      <Select
        id="period-selector"
        label="Analysis Period"
        aria-label="Analysis period"
        options={OPTIONS}
        value={value}
        onChange={(val) => onChange(val as PeriodOption)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/insights/components/PeriodSelector.tsx
git commit -m "feat(balance-summary): remove PeriodSelector max-w-xs for flexible row layout"
```

---

## Task 2: Rewrite BalanceSummaryHero as a gradient card

**Files:**
- Modify: `frontend/src/features/insights/components/BalanceSummaryHero.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import type { ReactElement } from 'react'
import { Badge } from '../../../shared/components/Badge'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface BalanceSummaryHeroProps {
  currentBalance: number
  previousBalance: number
  periodLabel: string
  accountCount: number
  totalIncome: number
  totalSpent: number
  isLoading: boolean
}

export function BalanceSummaryHero({
  currentBalance,
  previousBalance,
  periodLabel,
  accountCount,
  totalIncome,
  totalSpent,
  isLoading,
}: BalanceSummaryHeroProps): ReactElement {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-ui-surface border border-ui-border p-6 space-y-4 animate-pulse">
        <div className="h-3 w-32 rounded bg-ui-border-subtle" />
        <div className="h-10 w-56 rounded bg-ui-border-subtle" />
        <div className="h-7 w-28 rounded-full bg-ui-border-subtle" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-ui-border-subtle" />
          ))}
        </div>
      </div>
    )
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <div className="rounded-2xl bg-ui-surface border border-ui-border p-6 space-y-4 bg-gradient-to-br from-ui-surface to-ui-surface-muted">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Balance Summary
      </p>

      <div className="space-y-3">
        <p className="text-4xl font-bold tracking-tight text-foreground leading-none">
          {formatCurrency(currentBalance).replace('PHP', '').trim()}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            PHP
          </span>
        </p>

        <Badge
          variant={isPositive ? 'success' : 'error'}
          emphasis="soft"
          className="px-3 py-1 gap-1.5"
        >
          <SharedIcon type="ui" name={isPositive ? 'income' : 'expense'} size={14} />
          <span className="font-semibold text-xs">{Math.abs(percentage).toFixed(1)}%</span>
          <span className="text-xs font-medium text-muted-foreground">
            {isPositive ? 'increase' : 'decrease'} from prior period
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <HeroStat
          label={`Income for ${periodLabel}`}
          value={formatCurrency(totalIncome)}
          colorClass="text-success"
        />
        <HeroStat
          label={`Spent for ${periodLabel}`}
          value={formatCurrency(totalSpent)}
          colorClass="text-error"
        />
        <HeroStat label="Accounts" value={String(accountCount)} colorClass="text-foreground" />
      </div>
    </div>
  )
}

function HeroStat({
  label,
  value,
  colorClass,
}: {
  label: string
  value: string
  colorClass: string
}) {
  return (
    <div className="rounded-xl bg-ui-surface-muted p-3 text-center">
      <p className="text-xs text-muted-foreground leading-snug mb-1.5">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${colorClass}`}>{value}</p>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && npm run typecheck
```

Expected: zero errors. (TypeScript will flag callers that haven't been updated yet — that's expected and fixed in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/insights/components/BalanceSummaryHero.tsx
git commit -m "feat(balance-summary): rewrite hero as full-width gradient card with period-aware stat grid"
```

---

## Task 3: Restructure BalanceSummaryPage layout

**Files:**
- Modify: `frontend/src/features/insights/BalanceSummaryPage.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
  useGetCategoryBreakdownQuery,
  useGetSpendingTrendsQuery,
} from '../../app/store/api/insightsApi'
import { pageLayout } from '../../shared/styles/layout'
import { CompactAccountList } from './components/CompactAccountList'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { SpendingTrends } from './components/SpendingTrends'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import { SummaryFilterBar } from './components/SummaryFilterBar'
import { PeriodSelector } from './components/PeriodSelector'
import { useInsightsPeriod } from './hooks/useInsightsPeriod'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { setGranularity, setSelectedAccountIds } from './balanceSummarySlice'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { deliverExportFile } from '../transactions/export/exportDelivery'
import type { Granularity, PeriodOption } from './types'

const PERIOD_LABELS: Record<PeriodOption, string> = {
  CURRENT_MONTH: 'Current Month',
  LAST_MONTH: 'Last Month',
  LAST_3_MONTHS: 'Last 3 Months',
  ALL_TIME: 'One Year',
  YTD: 'Year to Date',
  LAST_12_MONTHS: 'Last 12 Months',
  CUSTOM: 'Custom Period',
}

export function BalanceSummaryPage(): ReactElement {
  const dispatch = useAppDispatch()
  const { selectedAccountIds, granularity } = useAppSelector((state) => state.balanceSummary)
  const { period, dateRange, updatePeriod } = useInsightsPeriod()
  const [spendingGranularity, setSpendingGranularity] = useState<Granularity>('MONTHLY')

  const { data: accountSummaries = [], isLoading: isAccountsLoading } =
    useGetPaymentMethodSummaryQuery()

  const accounts = useMemo(() => {
    return accountSummaries
      .map((s) => ({
        id: s.paymentMethod?.id ?? 0,
        name: s.paymentMethod?.name ?? 'Unknown',
      }))
      .filter((a) => a.id !== 0)
  }, [accountSummaries])

  const apiParams = useMemo(
    () => ({
      ...dateRange,
      paymentMethodIds: selectedAccountIds.length > 0 ? selectedAccountIds : undefined,
    }),
    [dateRange, selectedAccountIds],
  )

  const { data: currentSummary, isLoading: isCurrentSummaryLoading } =
    useGetSpendingSummaryQuery(apiParams)

  const { data: balanceTrends = { series: [] }, isLoading: isTrendsLoading } =
    useGetBalanceTrendsQuery({
      ...apiParams,
      granularity,
    })

  const { data: breakdown, isLoading: isBreakdownLoading } =
    useGetCategoryBreakdownQuery(apiParams)

  const { data: spendingTrends, isLoading: isSpendingTrendsLoading } =
    useGetSpendingTrendsQuery({ ...apiParams, granularity: spendingGranularity })

  const filteredAccountSummaries = useMemo(() => {
    if (selectedAccountIds.length === 0) return accountSummaries
    return accountSummaries.filter(
      (s) => s.paymentMethod?.id && selectedAccountIds.includes(s.paymentMethod.id),
    )
  }, [accountSummaries, selectedAccountIds])

  const currentBalance = filteredAccountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow
  const totalIncome = currentSummary?.totalIncome ?? 0
  const totalSpent = currentSummary?.totalExpenses ?? 0
  const periodLabel = PERIOD_LABELS[period]

  const handleExportCSV = () => {
    if (!balanceTrends.series.length) return

    const headers = ['Date', 'Income', 'Expenses', 'Net Balance']
    const rows = balanceTrends.series.map((t) => [
      new Date(t.periodStart).toLocaleDateString(),
      t.income.toString(),
      t.expenses.toString(),
      t.netBalance.toString(),
    ])

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const filename = `balance_summary_${granularity.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`

    deliverExportFile(csvContent, filename)
  }

  return (
    <div className={pageLayout.sectionGap}>
      {/* Hero Card */}
      <BalanceSummaryHero
        currentBalance={currentBalance}
        previousBalance={previousBalance}
        periodLabel={periodLabel}
        accountCount={filteredAccountSummaries.length}
        totalIncome={totalIncome}
        totalSpent={totalSpent}
        isLoading={isAccountsLoading || isCurrentSummaryLoading}
      />

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <PeriodSelector value={period} onChange={updatePeriod} />
        </div>
        <div className="flex-1">
          <SummaryFilterBar
            selectedAccountIds={selectedAccountIds}
            onAccountSelectionChange={(ids) => dispatch(setSelectedAccountIds(ids))}
            accounts={accounts}
          />
        </div>
        <button
          onClick={handleExportCSV}
          disabled={isTrendsLoading || !balanceTrends.series.length}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shadow-sm"
        >
          <SharedIcon type="ui" name="download" size={12} />
          Export CSV
        </button>
      </div>

      {/* Main Analysis Section */}
      <div className="space-y-12">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Financial Trajectory
          </p>
          <BalanceTrendChart
            trends={balanceTrends}
            granularity={granularity}
            onGranularityChange={(g) => dispatch(setGranularity(g))}
            isLoading={isTrendsLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
          <CategoryBreakdown
            breakdown={breakdown ?? { categories: [] }}
            isLoading={isBreakdownLoading && !breakdown}
            title="Spending Breakdown"
          />
          <SpendingTrends
            trends={spendingTrends ?? { series: [] }}
            granularity={spendingGranularity}
            onGranularityChange={setSpendingGranularity}
            isLoading={isSpendingTrendsLoading && !spendingTrends}
          />
        </section>

        <section className="pt-8 border-t border-ui-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Accounts
          </p>
          <CompactAccountList
            summaries={filteredAccountSummaries}
            isLoading={isAccountsLoading}
          />
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Lint**

```bash
cd frontend && npm run lint
```

Expected: zero warnings or errors.

- [ ] **Step 4: Visual verification — start dev server**

```bash
cd frontend && npm run dev
```

Open the Balance Summary page and verify:

- [ ] Hero card is full-width with gradient background
- [ ] Large balance amount is the primary visual anchor
- [ ] Growth % badge shows "from prior period" (not "from last month")
- [ ] Stat grid shows 3 cells: "Income for [period]", "Spent for [period]", "Accounts"
- [ ] Stat labels update when you change the period selector
- [ ] Period selector, account filter, and Export CSV are in one horizontal row on desktop
- [ ] On mobile (resize browser below 768px), controls stack vertically
- [ ] No "Intelligent Observations" section anywhere on the page
- [ ] "Financial Trajectory" section label appears above the chart card
- [ ] "Accounts" section label appears above the account list
- [ ] Account list shows "PHP" (not "PHP CURRENCY")
- [ ] Spending Trends bars are red/coral (not green)
- [ ] Loading skeleton for hero card shows pulsing placeholders

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/insights/BalanceSummaryPage.tsx
git commit -m "feat(balance-summary): restructure layout — bold hero, controls row, remove observations"
```

---

## Success Criteria Checklist

- [ ] Hero card is full width and visually dominant
- [ ] Stat grid labels update dynamically when period changes
- [ ] Controls in single horizontal row on desktop, stacked on mobile  
- [ ] No Intelligent Observations section
- [ ] Section labels above Financial Trajectory and Accounts
- [ ] No layout regressions on mobile
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
