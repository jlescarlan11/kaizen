# Balance Summary UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Declutter the `/balance-summary` page by surfacing the most important metric (total balance) as a hero, removing a redundant widget, adding a missing granularity option to the chart, and replacing hardcoded hex colors with design-system CSS variables.

**Architecture:** A new `BalanceSummaryHero` component absorbs the title and the period-comparison data, eliminating the `PeriodComparisonWidget`. The chart gains a third toggle (Weekly) and uses CSS variables for its line colors so it adapts correctly in light/dark mode. The widget grid shrinks from three to two cards.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Recharts v3, Vitest + Testing Library, RTK Query

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `frontend/src/tests/setup.ts` | Vitest test setup (jest-dom matchers) |
| Create | `frontend/src/features/insights/components/BalanceSummaryHero.tsx` | Hero section: title + balance number + period change badge |
| Create | `frontend/src/features/insights/components/BalanceSummaryHero.test.tsx` | Unit tests for BalanceSummaryHero |
| Modify | `frontend/src/features/insights/BalanceSummaryPage.tsx` | Use hero, drop PeriodComparisonWidget, 2-col grid |
| Delete | `frontend/src/features/insights/components/PeriodComparisonWidget.tsx` | Absorbed into hero |
| Modify | `frontend/src/features/insights/components/BalanceTrendChart.tsx` | Add Weekly toggle, swap hardcoded hex to CSS vars |
| Create | `frontend/src/features/insights/components/BalanceTrendChart.test.tsx` | Tests for granularity toggle |

---

## Task 1: Create Vitest setup file

The `vite.config.ts` points to `./src/tests/setup.ts` but the file doesn't exist yet. Without it `pnpm test` will error before any test runs.

**Files:**
- Create: `frontend/src/tests/setup.ts`

- [ ] **Step 1.1: Create the setup file**

```typescript
// frontend/src/tests/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 1.2: Run tests to confirm setup works (no tests yet, just that vitest starts)**

```bash
cd frontend && pnpm test 2>&1 | head -20
```

Expected: vitest starts and exits with `No test files found` — no crash about missing setup.

- [ ] **Step 1.3: Commit**

```bash
git add frontend/src/tests/setup.ts
git commit -m "test: bootstrap vitest setup with jest-dom"
```

---

## Task 2: Create `BalanceSummaryHero` component with tests

This component replaces both the plain page header (`<h1>` + subtitle) and the `PeriodComparisonWidget` card. It shows the current total balance as the primary focal point, with a period-change badge and context label inline.

**Files:**
- Create: `frontend/src/features/insights/components/BalanceSummaryHero.tsx`
- Create: `frontend/src/features/insights/components/BalanceSummaryHero.test.tsx`

- [ ] **Step 2.1: Write the failing tests**

```typescript
// frontend/src/features/insights/components/BalanceSummaryHero.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceSummaryHero } from './BalanceSummaryHero'

describe('BalanceSummaryHero', () => {
  it('renders the page title', () => {
    render(
      <BalanceSummaryHero currentBalance={100000} previousBalance={90000} isLoading={false} />,
    )
    expect(screen.getByRole('heading', { name: /balance summary/i })).toBeInTheDocument()
  })

  it('displays the formatted current balance', () => {
    render(
      <BalanceSummaryHero currentBalance={125000} previousBalance={100000} isLoading={false} />,
    )
    // formatCurrency(125000) → "PHP 125,000.00"
    expect(screen.getByText(/125,000\.00/)).toBeInTheDocument()
  })

  it('shows increase badge when current > previous', () => {
    render(
      <BalanceSummaryHero currentBalance={120000} previousBalance={100000} isLoading={false} />,
    )
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/increase/i)).toBeInTheDocument()
  })

  it('shows decrease badge when current < previous', () => {
    render(
      <BalanceSummaryHero currentBalance={80000} previousBalance={100000} isLoading={false} />,
    )
    expect(screen.getByText(/20\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/decrease/i)).toBeInTheDocument()
  })

  it('renders a loading skeleton when isLoading is true', () => {
    const { container } = render(
      <BalanceSummaryHero currentBalance={0} previousBalance={0} isLoading={true} />,
    )
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
    expect(screen.queryByText(/125,000/)).toBeNull()
  })

  it('handles zero previous balance without crashing (no division by zero)', () => {
    expect(() =>
      render(<BalanceSummaryHero currentBalance={50000} previousBalance={0} isLoading={false} />),
    ).not.toThrow()
    // percentage shows 0.0% when previousBalance is 0
    expect(screen.getByText(/0\.0%/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2.2: Run tests to confirm they fail**

```bash
cd frontend && pnpm test src/features/insights/components/BalanceSummaryHero.test.tsx 2>&1
```

Expected: `Cannot find module './BalanceSummaryHero'`

- [ ] **Step 2.3: Create the component**

```tsx
// frontend/src/features/insights/components/BalanceSummaryHero.tsx
import type { ReactElement } from 'react'
import { Badge } from '../../../shared/components/Badge'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface BalanceSummaryHeroProps {
  currentBalance: number
  previousBalance: number
  isLoading: boolean
}

export function BalanceSummaryHero({
  currentBalance,
  previousBalance,
  isLoading,
}: BalanceSummaryHeroProps): ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-lg bg-black/5 animate-pulse" />
        <div className="h-12 w-72 rounded-lg bg-black/5 animate-pulse" />
        <div className="h-6 w-32 rounded-full bg-black/5 animate-pulse" />
      </div>
    )
  }

  const diff = currentBalance - previousBalance
  const percentage = previousBalance !== 0 ? (diff / Math.abs(previousBalance)) * 100 : 0
  const isPositive = diff >= 0

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight text-foreground">Balance Summary</h1>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="text-4xl font-black tracking-tighter text-foreground leading-none">
          {formatCurrency(currentBalance).replace('PHP', '').trim()}
          <span className="ml-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            PHP
          </span>
        </p>

        <Badge
          tone={isPositive ? 'success' : 'error'}
          emphasis="soft"
          className="px-3 py-1 gap-1.5 self-end mb-0.5"
        >
          <SharedIcon type="ui" name={isPositive ? 'income' : 'expense'} size={14} />
          <span className="font-bold text-xs">{Math.abs(percentage).toFixed(1)}%</span>
          <span className="text-xs font-medium text-muted-foreground">
            {isPositive ? 'increase' : 'decrease'} from last month
          </span>
        </Badge>
      </div>
    </div>
  )
}
```

- [ ] **Step 2.4: Run tests to confirm they pass**

```bash
cd frontend && pnpm test src/features/insights/components/BalanceSummaryHero.test.tsx 2>&1
```

Expected: all 6 tests PASS

- [ ] **Step 2.5: Commit**

```bash
git add frontend/src/features/insights/components/BalanceSummaryHero.tsx \
        frontend/src/features/insights/components/BalanceSummaryHero.test.tsx
git commit -m "feat(insights): add BalanceSummaryHero component with balance and period change"
```

---

## Task 3: Update `BalanceSummaryPage` — use hero, drop `PeriodComparisonWidget`, 2-col grid

**Files:**
- Modify: `frontend/src/features/insights/BalanceSummaryPage.tsx`
- Delete: `frontend/src/features/insights/components/PeriodComparisonWidget.tsx`

- [ ] **Step 3.1: Rewrite `BalanceSummaryPage.tsx`**

Replace the entire file content with:

```tsx
// frontend/src/features/insights/BalanceSummaryPage.tsx
import { useMemo, useState, type ReactElement } from 'react'
import { useGetPaymentMethodSummaryQuery } from '../../app/store/api/paymentMethodApi'
import {
  useGetSpendingSummaryQuery,
  useGetBalanceTrendsQuery,
} from '../../app/store/api/insightsApi'
import { AccountBreakdownWidget } from './components/AccountBreakdownWidget'
import { IncomeVsExpenseWidget } from './components/IncomeVsExpenseWidget'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { BalanceSummaryHero } from './components/BalanceSummaryHero'
import type { Granularity } from './types'

export function BalanceSummaryPage(): ReactElement {
  const [granularity, setGranularity] = useState<Granularity>('MONTHLY')

  const { data: accountSummaries = [], isLoading: isAccountsLoading } =
    useGetPaymentMethodSummaryQuery()

  const { currentRange, yearRange } = useMemo(() => {
    const now = new Date()
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentEnd = new Date()

    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    return {
      currentRange: { start: currentStart.toISOString(), end: currentEnd.toISOString() },
      yearRange: { start: yearStart.toISOString(), end: yearEnd.toISOString() },
    }
  }, [])

  const { data: currentSummary, isLoading: isCurrentSummaryLoading } =
    useGetSpendingSummaryQuery(currentRange)

  const { data: balanceTrends = { series: [] }, isLoading: isTrendsLoading } =
    useGetBalanceTrendsQuery({
      ...yearRange,
      granularity,
    })

  const currentBalance = accountSummaries.reduce((acc, s) => acc + s.totalAmount, 0)
  const currentNetFlow = currentSummary?.netBalance ?? 0
  const previousBalance = currentBalance - currentNetFlow

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <BalanceSummaryHero
        currentBalance={currentBalance}
        previousBalance={previousBalance}
        isLoading={isAccountsLoading || isCurrentSummaryLoading}
      />

      <BalanceTrendChart
        trends={balanceTrends}
        granularity={granularity}
        onGranularityChange={setGranularity}
        isLoading={isTrendsLoading}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <AccountBreakdownWidget summaries={accountSummaries} isLoading={isAccountsLoading} />
        <IncomeVsExpenseWidget summary={currentSummary} isLoading={isCurrentSummaryLoading} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: Delete `PeriodComparisonWidget.tsx`**

```bash
rm frontend/src/features/insights/components/PeriodComparisonWidget.tsx
```

- [ ] **Step 3.3: Verify TypeScript compiles with no errors**

```bash
cd frontend && pnpm typecheck 2>&1
```

Expected: no errors referencing `PeriodComparisonWidget` or `BalanceSummaryHero`

- [ ] **Step 3.4: Commit**

```bash
git add frontend/src/features/insights/BalanceSummaryPage.tsx
git rm frontend/src/features/insights/components/PeriodComparisonWidget.tsx
git commit -m "refactor(insights): replace page header + PeriodComparisonWidget with BalanceSummaryHero, simplify to 2-col grid"
```

---

## Task 4: Add Weekly granularity to `BalanceTrendChart` with tests

The `Granularity` type already supports `'WEEKLY'` but the chart UI only shows Daily/Monthly. This task adds the middle toggle and the correct date label formatting for weekly periods.

**Files:**
- Modify: `frontend/src/features/insights/components/BalanceTrendChart.tsx`
- Create: `frontend/src/features/insights/components/BalanceTrendChart.test.tsx`

- [ ] **Step 4.1: Write failing tests for the granularity toggle**

```typescript
// frontend/src/features/insights/components/BalanceTrendChart.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalanceTrendChart } from './BalanceTrendChart'
import type { BalanceTrendSeries } from '../types'

// Recharts uses ResizeObserver internally; jsdom doesn't have it.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const emptyTrends: BalanceTrendSeries = { series: [] }

describe('BalanceTrendChart granularity toggle', () => {
  it('renders Daily, Weekly, and Monthly toggle buttons', () => {
    render(
      <BalanceTrendChart
        trends={emptyTrends}
        granularity="MONTHLY"
        onGranularityChange={vi.fn()}
        isLoading={false}
      />,
    )
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument()
  })

  it('calls onGranularityChange with WEEKLY when Weekly is clicked', async () => {
    const onGranularityChange = vi.fn()
    render(
      <BalanceTrendChart
        trends={emptyTrends}
        granularity="MONTHLY"
        onGranularityChange={onGranularityChange}
        isLoading={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /weekly/i }))
    expect(onGranularityChange).toHaveBeenCalledWith('WEEKLY')
  })

  it('calls onGranularityChange with DAILY when Daily is clicked', async () => {
    const onGranularityChange = vi.fn()
    render(
      <BalanceTrendChart
        trends={emptyTrends}
        granularity="MONTHLY"
        onGranularityChange={onGranularityChange}
        isLoading={false}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /daily/i }))
    expect(onGranularityChange).toHaveBeenCalledWith('DAILY')
  })

  it('shows loading spinner when isLoading is true', () => {
    const { container } = render(
      <BalanceTrendChart
        trends={emptyTrends}
        granularity="MONTHLY"
        onGranularityChange={vi.fn()}
        isLoading={true}
      />,
    )
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })
})
```

- [ ] **Step 4.2: Install `@testing-library/user-event` (needed for click interactions)**

```bash
cd frontend && pnpm add -D @testing-library/user-event
```

- [ ] **Step 4.3: Run tests to confirm they fail (Weekly button missing)**

```bash
cd frontend && pnpm test src/features/insights/components/BalanceTrendChart.test.tsx 2>&1
```

Expected: `Unable to find an accessible element with role "button" and name /weekly/i`

- [ ] **Step 4.4: Update `BalanceTrendChart.tsx` — add Weekly toggle and date label**

Replace the granularity toggle section and the `chartData` date-label logic:

```tsx
// frontend/src/features/insights/components/BalanceTrendChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '../../../shared/components/Card'
import type { BalanceTrendSeries, Granularity } from '../types'
import { formatCurrency } from '../../../shared/lib/formatCurrency'

interface BalanceTrendChartProps {
  trends: BalanceTrendSeries
  granularity: Granularity
  onGranularityChange: (g: Granularity) => void
  isLoading: boolean
}

const GRANULARITY_OPTIONS: { label: string; value: Granularity }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
]

function formatPeriodLabel(date: Date, granularity: Granularity): string {
  if (granularity === 'DAILY') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  if (granularity === 'WEEKLY') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { month: 'short' })
}

function formatFullDate(date: Date, granularity: Granularity): string {
  if (granularity === 'MONTHLY') {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BalanceTrendChart({
  trends,
  granularity,
  onGranularityChange,
  isLoading,
}: BalanceTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing trends...</p>
        </div>
      </Card>
    )
  }

  if (!trends.series || trends.series.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground italic">No trend data available for this period.</p>
      </Card>
    )
  }

  const chartData = trends.series.map((t) => {
    const date = new Date(t.periodStart)
    return {
      name: formatPeriodLabel(date, granularity),
      income: t.income,
      expenses: t.expenses,
      netBalance: t.netBalance,
      fullDate: formatFullDate(date, granularity),
    }
  })

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Balance Trends</h3>
          <p className="text-xs text-muted-foreground">Income, Expenses, and Net Flow over time</p>
        </div>
        <div className="flex bg-ui-surface-muted p-1 rounded-lg border border-ui-border-subtle">
          {GRANULARITY_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onGranularityChange(value)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                granularity === value
                  ? 'bg-ui-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border-subtle)"
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              fontWeight={700}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              dy={10}
            />
            <YAxis
              fontSize={10}
              fontWeight={700}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)' }}
              tickFormatter={(val) => `₱${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-ui-surface border border-ui-border p-3 rounded-xl shadow-xl space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-1 border-b border-ui-border-subtle">
                        {data.fullDate}
                      </p>
                      <div className="space-y-1.5">
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                {entry.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-foreground">
                              {formatCurrency(entry.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              content={({ payload }) => (
                <div className="flex gap-4 justify-end mb-4">
                  {payload?.map((entry) => (
                    <div key={entry.value} className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="var(--color-income)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="var(--color-expense)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="netBalance"
              name="Net Balance"
              stroke="var(--color-text-secondary)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
```

- [ ] **Step 4.5: Run tests to confirm they pass**

```bash
cd frontend && pnpm test src/features/insights/components/BalanceTrendChart.test.tsx 2>&1
```

Expected: all 4 tests PASS

- [ ] **Step 4.6: TypeScript check**

```bash
cd frontend && pnpm typecheck 2>&1
```

Expected: 0 errors

- [ ] **Step 4.7: Commit**

```bash
git add frontend/src/features/insights/components/BalanceTrendChart.tsx \
        frontend/src/features/insights/components/BalanceTrendChart.test.tsx \
        frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(insights): add Weekly granularity to BalanceTrendChart, use CSS variables for line colors"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| Declutter the page | Task 3 — removes PeriodComparisonWidget (3 cards → 2), moves its data into the hero |
| Surface most important metric prominently | Task 2 — BalanceSummaryHero shows total balance as large hero number |
| Long-term benefit for users | Hero provides at-a-glance balance; Weekly granularity provides more chart resolution |
| Long-term benefit for devs | CSS variable chart colors mean no code changes needed when theme tokens change; granularity toggle is data-driven array (adding a 4th option is trivial) |

### Placeholder Scan

- No "TBD" or "TODO" present.
- All steps show actual code.
- Types used in tests (`BalanceTrendSeries`, `Granularity`) are defined in `frontend/src/features/insights/types.ts` and match the component imports.

### Type Consistency

- `BalanceSummaryHero` props (`currentBalance: number`, `previousBalance: number`, `isLoading: boolean`) — consumed by `BalanceSummaryPage.tsx` in Task 3 with values already computed there.
- `Granularity` type (`'DAILY' | 'WEEKLY' | 'MONTHLY'`) from `types.ts` — used in both the component and test.
- `BalanceTrendSeries` from `types.ts` — used correctly in both test and production component.
- `GRANULARITY_OPTIONS` array in Task 4 declares `value: Granularity`, enforcing type safety on the button data.
