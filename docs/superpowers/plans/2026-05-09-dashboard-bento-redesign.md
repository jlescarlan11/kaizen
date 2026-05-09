# Dashboard Bento Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the home dashboard from 4 uniform horizontal bands into a 5-row variable-split bento grid, integrating all 4 previously unused card components.

**Architecture:** Modify 7 existing files only — no new files, no new data fetching. All hooks and Redux slices already exist. Changes are cosmetic restyling (Tasks 1–3), one component refactor (Task 4), and one grid restructure (Task 5).

**Tech Stack:** React 19, TypeScript, Tailwind 4, Redux Toolkit, React Router v7, Recharts

---

## File Map

| File | Change |
|------|--------|
| `frontend/src/features/home/components/HomeDashboardHeader.tsx` | Remove Transfer button (lines 79–85) |
| `frontend/src/features/home/components/ActionCenterCard.tsx` | Restyle dark → light card |
| `frontend/src/features/home/components/WealthHealthCard.tsx` | Update border radius + border token |
| `frontend/src/features/home/components/SubscriptionWatchdogCard.tsx` | Update border radius + border token |
| `frontend/src/features/home/components/WealthPersonaCard.tsx` | Update border radius + border token |
| `frontend/src/features/home/components/TimelineActivity.tsx` | Refactor: two twin columns → single unified activity feed |
| `frontend/src/features/home/HomePage.tsx` | Full grid restructure, integrate 4 new cards, retire SevenDayInsights |

---

## Task 1: Remove Transfer button from hero

**Files:**
- Modify: `frontend/src/features/home/components/HomeDashboardHeader.tsx:79-85`

- [ ] **Step 1: Delete the Transfer button block**

In `HomeDashboardHeader.tsx`, find and remove lines 79–85 — the entire Transfer `<button>` element:

```tsx
// DELETE this entire block:
<button
  onClick={() => navigate('/transactions/add')}
  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-secondary border border-border-subtle text-text-secondary text-xs font-medium hover:bg-surface-secondary/80 transition-all"
>
  <SharedIcon type="ui" name="refresh" size={14} strokeWidth={3} />
  Transfer
</button>
```

After deletion the Quick Action block (lines 71–93) should contain exactly 2 buttons: Add Transaction and New Budget.

- [ ] **Step 2: Start the dev server and verify**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run dev
```

Open http://localhost:5173. Confirm the hero shows only two buttons: green `Add Transaction` and grey `New Budget`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/home/components/HomeDashboardHeader.tsx
git commit -m "feat(home): remove redundant Transfer button from hero CTA row"
```

---

## Task 2: Restyle ActionCenterCard to light theme

The card currently uses `bg-text-primary` (dark background) with `text-surface` for all text. Flip it to the standard white card palette with colored action-type pills.

**Files:**
- Modify: `frontend/src/features/home/components/ActionCenterCard.tsx`

- [ ] **Step 1: Replace the wrapper div**

Find the opening wrapper div (line 13):
```tsx
// BEFORE:
<div className="p-8 rounded-[2.5rem] bg-text-primary border border-text-primary shadow-xl flex flex-col h-full group relative overflow-hidden">
```

Replace with:
```tsx
// AFTER:
<div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group relative overflow-hidden">
```

- [ ] **Step 2: Remove the dark decorative background icon**

Delete lines 14–16 entirely (the decorative `check-circle` icon positioned top-right — it was designed for the dark background):
```tsx
// DELETE:
<div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
  <SharedIcon type="ui" name="check-circle" size={80} className="text-surface rotate-12" />
</div>
```

- [ ] **Step 3: Update the header label and Live badge**

Find the header block (lines 18–28). Replace:
```tsx
// BEFORE:
<div className="relative z-10 flex items-center justify-between mb-8">
  <div className="flex items-center gap-2">
    <SharedIcon type="ui" name="check-square" size={14} className="text-primary" />
    <p className="text-[10px] font-black uppercase tracking-widest text-surface">
      Action Center
    </p>
  </div>
  <div className="px-2 py-0.5 rounded-full bg-surface/10 border border-surface/10">
    <span className="text-[8px] font-black text-surface uppercase">Live</span>
  </div>
</div>
```

With:
```tsx
// AFTER:
<div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-2">
    <SharedIcon type="ui" name="check-square" size={14} className="text-primary" />
    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
      Action Center
    </p>
  </div>
  <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
    <span className="text-[8px] font-black text-primary uppercase">Live</span>
  </div>
</div>
```

- [ ] **Step 4: Restyle action item pills by type**

Replace the `allItems.slice(0, 3).map(...)` block with light-themed colored pills. Find lines 32–65 and replace:

```tsx
// BEFORE:
{allItems.length > 0 ? (
  allItems.slice(0, 3).map((item) => (
    <div 
      key={item.id}
      onClick={() => navigate('/transactions')}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95",
        item.type === 'TASK' ? "bg-surface/5 border-surface/10" : "bg-primary/10 border-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-6 w-6 rounded-lg flex items-center justify-center",
          item.type === 'TASK' ? "bg-surface/10" : "bg-primary"
        )}>
          <SharedIcon 
            type="ui" 
            name={item.type === 'WIN' ? 'trending-up' : item.type === 'ALERT' ? 'alert-circle' : 'plus'} 
            size={12} 
            className={item.type === 'TASK' ? "text-surface" : "text-text-primary"}
          />
        </div>
        <div>
          <p className={cn("text-[11px] font-black uppercase tracking-wide", item.type === 'TASK' ? "text-surface" : "text-primary")}>
            {item.title}
          </p>
          {item.description && (
            <p className="text-[9px] font-bold text-surface/50 mt-0.5 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  ))
) : (
  <div className="flex flex-col items-center justify-center py-10 opacity-30">
    <SharedIcon type="ui" name="check" size={32} className="text-surface mb-2" />
    <p className="text-[10px] font-black uppercase tracking-widest text-surface">All Clear</p>
  </div>
)}
```

With:
```tsx
// AFTER:
{allItems.length > 0 ? (
  allItems.slice(0, 3).map((item) => (
    <div
      key={item.id}
      onClick={() => navigate('/transactions')}
      className={cn(
        "px-3 py-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center gap-2.5",
        item.type === 'ALERT' && "bg-amber-50 border-amber-200",
        item.type === 'WIN'   && "bg-green-50 border-green-200",
        item.type === 'TASK'  && "bg-blue-50 border-blue-200",
      )}
    >
      <SharedIcon
        type="ui"
        name={item.type === 'WIN' ? 'trending-up' : item.type === 'ALERT' ? 'alert-circle' : 'plus'}
        size={12}
        className={cn(
          item.type === 'ALERT' && "text-amber-600",
          item.type === 'WIN'   && "text-green-600",
          item.type === 'TASK'  && "text-blue-600",
        )}
      />
      <div className="min-w-0">
        <p className={cn(
          "text-[11px] font-semibold truncate",
          item.type === 'ALERT' && "text-amber-800",
          item.type === 'WIN'   && "text-green-800",
          item.type === 'TASK'  && "text-blue-800",
        )}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-[9px] text-text-tertiary mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
    </div>
  ))
) : (
  <div className="flex flex-col items-center justify-center py-8 opacity-40">
    <SharedIcon type="ui" name="check" size={28} className="text-primary mb-2" />
    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">All Clear</p>
  </div>
)}
```

- [ ] **Step 5: Update the footer button**

Find the footer (last button before closing div). Replace:
```tsx
// BEFORE:
className="text-[9px] font-black uppercase tracking-[0.2em] text-surface/40 hover:text-primary transition-all"
```

With:
```tsx
// AFTER:
className="text-[9px] font-semibold uppercase tracking-[0.2em] text-text-tertiary hover:text-primary transition-all"
```

Also update the `border-t border-surface/10` on the footer wrapper to `border-t border-border-subtle`, and `mt-8 pt-4` to `mt-5 pt-4`.

- [ ] **Step 6: Verify in browser**

Reload http://localhost:5173 (dev server still running from Task 1). The ActionCenterCard won't be visible on the page yet — that happens in Task 5. You can temporarily add `<ActionCenterCard />` to the end of the HomePage to spot-check. Confirm: white card, colored pills, no dark background.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/home/components/ActionCenterCard.tsx
git commit -m "feat(home): restyle ActionCenterCard to light card with colored type pills"
```

---

## Task 3: Standardize border tokens on WealthHealthCard, SubscriptionWatchdogCard, WealthPersonaCard

All three cards use `rounded-[2.5rem] border border-border/10` — inconsistent with the dashboard standard of `rounded-2xl border border-border-subtle`. Update each.

**Files:**
- Modify: `frontend/src/features/home/components/WealthHealthCard.tsx`
- Modify: `frontend/src/features/home/components/SubscriptionWatchdogCard.tsx`
- Modify: `frontend/src/features/home/components/WealthPersonaCard.tsx`

- [ ] **Step 1: Update WealthHealthCard.tsx**

There are two divs to update — the loading skeleton and the main wrapper.

Loading skeleton (line 13): replace:
```tsx
// BEFORE:
<div className="h-full min-h-[300px] p-8 rounded-[2.5rem] bg-surface border border-border/10 shadow-sm animate-pulse flex flex-col justify-between">
```
With:
```tsx
// AFTER:
<div className="h-full min-h-[300px] p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col justify-between">
```

Main wrapper (line 28): replace:
```tsx
// BEFORE:
<div className="p-8 rounded-[2.5rem] bg-surface border border-border/10 shadow-sm flex flex-col h-full group">
```
With:
```tsx
// AFTER:
<div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group">
```

Also update the inner spacing from `mb-8` → `mb-5` on the header div (line 29).

- [ ] **Step 2: Update SubscriptionWatchdogCard.tsx**

Loading skeleton (line 12): replace:
```tsx
// BEFORE:
<div className="h-full min-h-[300px] p-8 rounded-[2.5rem] bg-surface border border-border/10 shadow-sm animate-pulse">
```
With:
```tsx
// AFTER:
<div className="h-full min-h-[300px] p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse">
```

Main wrapper (line 24): replace:
```tsx
// BEFORE:
<div className="p-8 rounded-[2.5rem] bg-surface border border-border/10 shadow-sm flex flex-col h-full group">
```
With:
```tsx
// AFTER:
<div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group">
```

Update `mb-8` → `mb-5` on the header div (line 25).

- [ ] **Step 3: Update WealthPersonaCard.tsx**

Main wrapper (line 15): replace:
```tsx
// BEFORE:
<div className="p-8 rounded-[2.5rem] bg-surface border border-border/10 shadow-sm flex flex-col h-full group relative overflow-hidden">
```
With:
```tsx
// AFTER:
<div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col h-full group relative overflow-hidden">
```

Update `mb-8` → `mb-5` on the header div (line 19).

- [ ] **Step 4: Commit**

```bash
git add \
  frontend/src/features/home/components/WealthHealthCard.tsx \
  frontend/src/features/home/components/SubscriptionWatchdogCard.tsx \
  frontend/src/features/home/components/WealthPersonaCard.tsx
git commit -m "feat(home): standardize new card border radius and border tokens to match dashboard"
```

---

## Task 4: Refactor TimelineActivity to unified activity feed

Replace the two-column twin-card layout with a single card showing interleaved transactions sorted by date descending. Header has `Out` / `In` type filter pills. Footer links to `/transactions`.

**Files:**
- Modify: `frontend/src/features/home/components/TimelineActivity.tsx`

- [ ] **Step 1: Replace the entire file content**

The refactor is significant enough that a full replacement is cleaner than patching. Replace `TimelineActivity.tsx` with:

```tsx
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTransactionsQuery } from '../../../app/store/api/transactionApi'
import { TransactionsEmptyState } from '../TransactionsEmptyState'
import { ADD_TRANSACTION_ROUTE } from '../routes'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { Money } from '../../../shared/components/Money/Money'
import { cn } from '../../../shared/lib/cn'

export const TimelineActivity: React.FC = () => {
  const navigate = useNavigate()
  const { data: transactionsData, isLoading } = useGetTransactionsQuery()

  const transactions = useMemo(() => transactionsData?.items ?? [], [transactionsData])

  const recentActivity = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'INCOME' || tx.type === 'EXPENSE')
        .slice(0, 6),
    [transactions],
  )

  if (isLoading) {
    return (
      <div className="h-64 bg-surface border border-border-subtle rounded-2xl animate-pulse" />
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm">
        <TransactionsEmptyState onAddTransaction={() => navigate(ADD_TRANSACTION_ROUTE)} />
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
          Recent Activity
        </p>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[9px] font-semibold text-red-600">
            Out
          </span>
          <span className="px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-[9px] font-semibold text-green-600">
            In
          </span>
        </div>
      </div>

      {/* Transaction rows */}
      <div className="flex flex-col divide-y divide-border-subtle">
        {recentActivity.map((tx) => {
          const isExpense = tx.type === 'EXPENSE'
          return (
            <div
              key={tx.id}
              onClick={() => navigate('/transactions')}
              className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-surface-secondary/50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    isExpense ? 'bg-red-50' : 'bg-green-50',
                  )}
                >
                  <SharedIcon
                    type="category"
                    name={tx.category?.icon ?? 'banknote'}
                    size={14}
                    className={isExpense ? 'text-red-500' : 'text-green-600'}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-text-primary truncate">
                    {tx.description}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {new Date(tx.date).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[12px] font-semibold tabular-nums ml-3 flex-shrink-0',
                  isExpense ? 'text-red-600' : 'text-green-600',
                )}
              >
                {isExpense ? '–' : '+'}
                <Money amount={tx.amount} showCurrency={false} />
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <button
        onClick={() => navigate('/transactions')}
        className="mt-4 text-[11px] font-semibold text-primary hover:underline text-center"
      >
        See All Activity →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Check that `tx.category?.icon` matches the actual Transaction type**

Open `frontend/src/app/store/api/transactionApi.ts` (or the shared types file) and confirm that the Transaction type has a `category` field with an `icon` string. If the field name differs (e.g., `tx.category?.iconName`), update the `name={tx.category?.icon ?? 'banknote'}` prop accordingly.

- [ ] **Step 3: Verify in browser**

The TimelineActivity is still rendered in the current HomePage (Zone 3). Reload http://localhost:5173 and confirm: single card, interleaved rows, Out/In pills in header, See All Activity footer link.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/home/components/TimelineActivity.tsx
git commit -m "feat(home): refactor TimelineActivity to unified interleaved activity feed"
```

---

## Task 5: Restructure HomePage.tsx — new bento grid

Wire up the full 5-row bento layout. Add the 4 new card imports. Remove SevenDayInsights.

**Files:**
- Modify: `frontend/src/features/home/HomePage.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
import type { ReactElement } from 'react'
import { useAuthState } from '../../shared/hooks/useAuthState'
import { HomeDashboardHeader } from './components/HomeDashboardHeader'
import { SpendingGraphCard } from './components/SpendingGraphCard'
import { TopCategoriesCard } from './components/TopCategoriesCard'
import { BudgetBurnRateCard } from './components/BudgetBurnRateCard'
import { WalletBento } from './components/WalletBento'
import { TimelineActivity } from './components/TimelineActivity'
import { FinancialIntelligenceCard } from './components/FinancialIntelligenceCard'
import { ActionCenterCard } from './components/ActionCenterCard'
import { WealthHealthCard } from './components/WealthHealthCard'
import { SubscriptionWatchdogCard } from './components/SubscriptionWatchdogCard'
import { WealthPersonaCard } from './components/WealthPersonaCard'
import { CommandPalette } from './components/CommandPalette'
import { DashboardTour } from './DashboardTour'
import { useRegisterDashboardTourAnchor } from './DashboardTourAnchorsHooks'

export function HomePage(): ReactElement {
  const { user } = useAuthState()
  const balanceCardRef = useRegisterDashboardTourAnchor('balanceCard')

  return (
    <div className="animate-entrance-slide-up pb-24 space-y-4">
      <CommandPalette />

      {/* Hero — full-width centered Net Worth */}
      <section ref={balanceCardRef}>
        <HomeDashboardHeader balance={user?.balance ?? 0} />
      </section>

      {/* Row 1 — 5/4/3: Spending Chart · Wallets · Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5">
          <SpendingGraphCard />
        </div>
        <div className="lg:col-span-4">
          <WalletBento />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <ActionCenterCard />
        </div>
      </div>

      {/* Row 2 — 7/5: Unified Activity Feed · Wealth Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7">
          <TimelineActivity />
        </div>
        <div className="lg:col-span-5">
          <WealthHealthCard />
        </div>
      </div>

      {/* Row 3 — 1/1/1: Budget Burn · Top Categories · Financial Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BudgetBurnRateCard />
        <TopCategoriesCard />
        <FinancialIntelligenceCard />
      </div>

      {/* Row 4 — 7/5: Subscription Watchdog · Wealth Persona */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7">
          <SubscriptionWatchdogCard />
        </div>
        <div className="lg:col-span-5">
          <WealthPersonaCard />
        </div>
      </div>

      <DashboardTour />
    </div>
  )
}
```

- [ ] **Step 2: Verify full layout in browser**

Reload http://localhost:5173. Walk through each row:

- Hero: centered NET WORTH, 2 buttons only (Add Transaction + New Budget)
- Row 1: 3 columns — chart (widest), wallets, action center (narrowest). Action center shows light card with colored pills.
- Row 2: activity feed (left, wider) + wealth health gauge (right)
- Row 3: 3 equal cards — budgets, categories, financial intelligence
- Row 4: subscription watchdog (left, wider) + wealth persona (right)

Resize browser to mobile width (≤768px) and confirm all rows stack to single column.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/home/HomePage.tsx
git commit -m "feat(home): restructure dashboard to 5-row variable-split bento grid

- Integrate ActionCenterCard, WealthHealthCard, SubscriptionWatchdogCard, WealthPersonaCard
- Retire SevenDayInsights as standalone card
- Row splits: 5/4/3 · 7/5 · 1/1/1 · 7/5
- Mobile: all rows collapse to single column"
```

---

## Self-Review Checklist

- [x] **Hero CTA** — Transfer button removed in Task 1 ✓
- [x] **ActionCenterCard light theme** — Task 2 covers wrapper, badge, pills, footer ✓
- [x] **WealthHealthCard / SubscriptionWatchdogCard / WealthPersonaCard tokens** — Task 3 ✓
- [x] **Unified activity feed** — Task 4 replaces twin-column TimelineActivity ✓
- [x] **All 4 new cards integrated** — ActionCenter (Row 1), WealthHealth (Row 2), SubscriptionWatchdog (Row 4), WealthPersona (Row 4) ✓
- [x] **SevenDayInsights retired** — removed from imports and JSX in Task 5 ✓
- [x] **Row splits match spec** — 5/4/3 · 7/5 · 1/1/1 · 7/5 ✓
- [x] **Mobile collapse** — `grid-cols-1` default on all rows ✓
- [x] **No new files** — all changes to existing files ✓
- [x] **No new data fetching** — all hooks already exist ✓
