# Page Shell Consistency Pass

**Date:** 2026-04-26
**Status:** Approved, ready for implementation plan

## Problem

Page-level layout has drifted. Most pages let the authenticated shell own outer chrome (horizontal padding, vertical padding, max width, mobile bottom clearance) and only declare internal vertical rhythm. A few detail pages re-declare all of that themselves, producing visibly doubled padding and inconsistent max widths between e.g. `/transactions` (list) and `/transactions/:id` (detail).

Additionally, the sidebar nav labels the `/` route "Transactions" even though the route renders the home dashboard.

## Principle

`frontend/src/app/router/AuthenticatedLayout.tsx:314-316` is the single source of truth for outer page chrome:

- horizontal padding: `pageLayout.shellX` (`px-5 md:px-8`)
- vertical padding: `py-6 md:py-8`
- max width: `mx-auto max-w-5xl`
- mobile bottom clearance: `pb-28`

Pages must not redeclare any of those. Pages provide internal vertical rhythm via `pageLayout.sectionGap` and nothing else at the root.

## Concrete changes

### 1. Rename nav label

`frontend/src/app/router/AuthenticatedLayout.tsx:141` — change label only, route stays `/`:

```diff
- { label: 'Transactions', to: '/', icon: <HomeIcon /> },
+ { label: 'Home', to: '/', icon: <HomeIcon /> },
```

### 2. Strip outer wrapper from `TransactionDetailPage`

`frontend/src/features/transactions/TransactionDetailPage.tsx:72`:

```diff
- <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
+ <div className={pageLayout.sectionGap}>
```

Add `import { pageLayout } from '../../shared/styles/layout'`. Inner staggered `animate-in` sections stay untouched.

### 3. Strip outer wrapper from `BudgetDetailPage`

`frontend/src/features/budgets/BudgetDetailPage.tsx:54`:

```diff
- <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
+ <div className={pageLayout.sectionGap}>
```

### 4. Strip outer wrapper from `BalanceSummaryPage`

`frontend/src/features/insights/BalanceSummaryPage.tsx:104`:

```diff
- <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
+ <div className={pageLayout.sectionGap}>
```

## Verification

- Visit `/`, `/transactions/:id`, `/budget/:id`, `/insights/balance`. Confirm horizontal padding matches list pages — no double inset.
- Confirm the mobile FAB does not overlap the last content row on the three detail pages.
- Confirm sidebar nav now reads "Home". Active-state highlight still works (route unchanged).
- Type-check and lint pass.

## Out of scope

- Internal component spacing (cards, list rows, button heights).
- Custom-shaped page headers on `HomePage` and `YourAccountPage` — intentionally bespoke.
- Any change to the `/` route path or router config.
- `GoalDetailPage` — already conforms.
