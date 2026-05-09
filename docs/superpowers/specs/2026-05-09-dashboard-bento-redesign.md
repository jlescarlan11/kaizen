# Dashboard Bento Redesign

**Date:** 2026-05-09  
**Status:** Approved  
**Scope:** `frontend/src/features/home/HomePage.tsx` and all home card components

---

## Problem

The current dashboard is a series of horizontal bands — each row uses the same column split, creating a rigid, uniform layout. Space is wasted in several zones (Wallets card has dead space, 4-column bottom row has equal-weight cards with no visual hierarchy). Four new card components (ActionCenter, SubscriptionWatchdog, WealthHealth, WealthPersona) exist in the codebase but are not integrated. The Expenses + Income twin-column layout produces mismatched heights due to varying row counts.

---

## Design Direction

**Inspiration:** WaniKani dashboard — organic bento rhythm where every row uses a different column split, creating visual variety without chaos.

**Principle:** Card sizes earn their space. Important cards are wider. Every row breaks the previous split. No two rows feel the same.

---

## Layout Structure

### Hero — Full-width centered (existing `HomeDashboardHeader`)

- White card, `border border-border-subtle`, same border radius as all other cards
- Content centered: `NET WORTH` label → large PHP balance in `text-primary` green → mini sparkline trend chart
- **Two action buttons only:**
  - `+ Add Transaction` — primary green pill (replaces the current three-button row; Transfer is redundant since the transaction form handles type selection)
  - `New Budget` — soft grey pill secondary
- Remove the `Transfer` button entirely

### Row 1 — 5/4/3 columns

| Slot | Card | Notes |
|------|------|-------|
| 5/12 | `SpendingGraphCard` | 30-day area chart, existing component |
| 4/12 | `WalletBento` | Connected wallets + liquidity split, existing |
| 3/12 | `ActionCenterCard` | **New integration** — action items as colored pills (amber warning, green ok, blue info) on white card |

### Row 2 — 7/5 columns

| Slot | Card | Notes |
|------|------|-------|
| 7/12 | Unified activity feed | Replace the split Expenses / Income twin columns with a single `RECENT ACTIVITY` card showing interleaved transactions, type-labeled with colored `Out` / `In` pills in the header. Fixes the mismatched height problem. |
| 5/12 | `WealthHealthCard` | **New integration** — savings rate gauge + 7-day net flow breakdown |

### Row 3 — 1/1/1 equal columns

| Slot | Card |
|------|------|
| 1/3 | `BudgetBurnRateCard` |
| 1/3 | `TopCategoriesCard` |
| 1/3 | `FinancialIntelligenceCard` |

### Row 4 — 7/5 columns

| Slot | Card | Notes |
|------|------|-------|
| 7/12 | `SubscriptionWatchdogCard` | **New integration** — recurring subscriptions list on white card |
| 5/12 | `WealthPersonaCard` | **New integration** — persona archetype + 7-day streak dots |

`SevenDayInsights` is retired from a standalone card — its data (7-day in/out/net) moves into `WealthHealthCard` Row 2.

---

## Activity Feed Unification

The current `TimelineActivity` component renders two separate cards (Expenses, Income) in a 2-column grid, producing unequal heights when one side has more rows.

**New behavior:** A single `RECENT ACTIVITY` card with:
- Header: `RECENT ACTIVITY` label + `Out` (red pill) / `In` (green pill) filter toggles
- Body: interleaved transactions sorted by date descending, each row showing category icon, name, date, and signed amount colored red (expense) or green (income)
- Footer: `See All Activity →` link

This can reuse the existing `ActivityRow` component from `frontend/src/features/transactions/components/ActivityRow.tsx`.

---

## Card Color Scheme

All cards use the same light palette — no dark-themed cards on the dashboard:
- Background: `bg-surface` (`#ffffff`)
- Border: `border border-border-subtle`
- Shadow: `shadow-sm`
- Border radius: `rounded-2xl`

The `WealthPersonaCard` retains its subtle gradient (`bg-gradient-to-br from-green-50 to-sky-50`) as a soft accent — not a dark card.

---

## Hero CTA Change

| Before | After |
|--------|-------|
| `+ Add Transaction` | `+ Add Transaction` (primary) |
| `Transfer` | ~~removed~~ |
| `New Budget` | `New Budget` (secondary) |

**Rationale:** Transfer is a transaction type already selectable inside `TransactionEntryForm`. Surfacing it as a top-level CTA duplicates the Add Transaction flow without adding clarity.

---

## Grid Implementation

Use CSS grid directly on `HomePage.tsx` — no new layout component needed. The existing `grid grid-cols-12 gap-4` pattern extends naturally.

```tsx
// Row 1
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-5"><SpendingGraphCard /></div>
  <div className="col-span-4"><WalletBento /></div>
  <div className="col-span-3"><ActionCenterCard /></div>
</div>

// Row 2
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-7"><UnifiedActivityCard /></div>
  <div className="col-span-5"><WealthHealthCard /></div>
</div>

// Row 3
<div className="grid grid-cols-3 gap-4">
  <BudgetBurnRateCard />
  <TopCategoriesCard />
  <FinancialIntelligenceCard />
</div>

// Row 4
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-7"><SubscriptionWatchdogCard /></div>
  <div className="col-span-5"><WealthPersonaCard /></div>
</div>
```

Mobile: all rows collapse to `grid-cols-1`. Row 1 on tablet (`md`) goes 2-col with ActionCenter below.

---

## Components Affected

| Component | Change |
|-----------|--------|
| `HomePage.tsx` | Full grid restructure |
| `HomeDashboardHeader.tsx` | Remove Transfer button |
| `TimelineActivity.tsx` | Refactor in place: change from two-column twin cards to single unified feed card |
| `ActionCenterCard.tsx` | New integration — light card styling |
| `WealthHealthCard.tsx` | New integration — absorbs 7-day summary data |
| `SubscriptionWatchdogCard.tsx` | New integration |
| `WealthPersonaCard.tsx` | New integration |
| `SevenDayInsights.tsx` | Retired as standalone card |

---

## Out of Scope

- Dark mode adjustments (existing tokens handle this automatically)
- Mobile-specific layout beyond the `grid-cols-1` collapse
- New data fetching — all cards already have their Redux slices
- Any changes to pages other than `HomePage.tsx`
