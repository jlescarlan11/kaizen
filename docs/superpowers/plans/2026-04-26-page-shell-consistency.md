# Page Shell Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip duplicated outer-shell padding/max-width/animation from three detail pages and rename the "/" sidebar nav label to "Home".

**Architecture:** `AuthenticatedLayout.tsx:314-316` already provides outer chrome (horizontal padding via `pageLayout.shellX`, vertical padding `py-6 md:py-8`, `mx-auto max-w-5xl`, mobile `pb-28`). Three detail pages currently re-declare all of that — the fix is to delete those wrappers and use `pageLayout.sectionGap` like every other page.

**Tech Stack:** React + TypeScript + Tailwind. Verification via `pnpm lint`, `pnpm typecheck`, and visual check in `pnpm dev`. (There is no unit test runner configured; class-name assertions would be brittle and add no value, so this plan does not write unit tests for these refactors.)

**Spec:** `docs/superpowers/specs/2026-04-26-page-shell-consistency-design.md`

---

### Task 1: Rename sidebar nav label "Transactions" → "Home"

**Files:**
- Modify: `frontend/src/app/router/AuthenticatedLayout.tsx:141`

- [ ] **Step 1: Edit the nav item label**

Change line 141 from:

```tsx
{ label: 'Transactions', to: '/', icon: <HomeIcon /> },
```

to:

```tsx
{ label: 'Home', to: '/', icon: <HomeIcon /> },
```

The route (`to: '/'`) and icon (`<HomeIcon />`) stay unchanged.

- [ ] **Step 2: Type-check and lint**

Run from `frontend/`:

```bash
pnpm typecheck && pnpm lint
```

Expected: both pass with no errors.

- [ ] **Step 3: Visual check**

Run `pnpm dev`, open the app while signed in, and confirm the sidebar (desktop) and the active-tab indicator both show "Home" for the `/` route. Active-state highlight should still apply when on `/`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/router/AuthenticatedLayout.tsx
git commit -m "polish(nav): rename '/' nav label from Transactions to Home"
```

---

### Task 2: Strip outer wrapper from `TransactionDetailPage`

**Files:**
- Modify: `frontend/src/features/transactions/TransactionDetailPage.tsx` (line 72 and the imports block at the top)

**Why:** The current root `<div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">` doubles the shell's padding, narrows the page below the shell's `max-w-5xl`, and adds a redundant root-level animation. Inner sections (lines 100, 109, 114) already animate themselves and stay untouched.

- [ ] **Step 1: Add the `pageLayout` import**

In the imports block at the top of `TransactionDetailPage.tsx`, add (next to the other `shared/` imports):

```tsx
import { pageLayout } from '../../shared/styles/layout'
```

- [ ] **Step 2: Replace the root wrapper at line 72**

Change:

```tsx
<div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
```

to:

```tsx
<div className={pageLayout.sectionGap}>
```

Do not touch any of the inner sections (the `<section className="animate-in fade-in slide-in-from-bottom-4 duration-500">` etc. at lines 100, 109, 114).

- [ ] **Step 3: Type-check and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: both pass.

- [ ] **Step 4: Visual check**

In the dev server, open any transaction detail page (e.g. click a row on `/`). Confirm:
- Horizontal padding matches the list page behind it (no double inset on left/right).
- The page is the same width as `/transactions` list page (max-w-5xl).
- Inner sections still fade/slide in on load.
- Mobile: scroll to the bottom — last content row is not hidden behind the FAB.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/transactions/TransactionDetailPage.tsx
git commit -m "polish(transactions): drop duplicated outer shell on detail page"
```

---

### Task 3: Strip outer wrapper from `BudgetDetailPage`

**Files:**
- Modify: `frontend/src/features/budgets/BudgetDetailPage.tsx` (line 54 and imports)

- [ ] **Step 1: Verify `pageLayout` import**

Check the top of `BudgetDetailPage.tsx`. If `import { pageLayout } from '../../shared/styles/layout'` is not already present, add it next to the other `shared/` imports.

- [ ] **Step 2: Replace the root wrapper at line 54**

Change:

```tsx
<div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
```

to:

```tsx
<div className={pageLayout.sectionGap}>
```

Do not touch any inner sections.

- [ ] **Step 3: Type-check and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: both pass.

- [ ] **Step 4: Visual check**

In the dev server, open any budget detail page from `/budget`. Confirm:
- Horizontal padding matches `/budget` list page.
- No double inset; same width as siblings.
- Mobile: last row not hidden behind the FAB.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/budgets/BudgetDetailPage.tsx
git commit -m "polish(budgets): drop duplicated outer shell on detail page"
```

---

### Task 4: Strip outer wrapper from `BalanceSummaryPage`

**Files:**
- Modify: `frontend/src/features/insights/BalanceSummaryPage.tsx` (line 104 and imports)

- [ ] **Step 1: Verify `pageLayout` import**

Check the top of `BalanceSummaryPage.tsx`. If `import { pageLayout } from '../../shared/styles/layout'` is not already present, add it next to the other `shared/` imports.

- [ ] **Step 2: Replace the root wrapper at line 104**

Change:

```tsx
<div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
```

to:

```tsx
<div className={pageLayout.sectionGap}>
```

Do not touch any inner sections.

- [ ] **Step 3: Type-check and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: both pass.

- [ ] **Step 4: Visual check**

In the dev server, navigate to `/insights/balance` (or whatever route renders `BalanceSummaryPage`). Confirm:
- Horizontal padding matches sibling pages.
- No double inset.
- Mobile: last row not hidden behind the FAB.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/insights/BalanceSummaryPage.tsx
git commit -m "polish(insights): drop duplicated outer shell on balance summary"
```

---

### Task 5: Final cross-page verification

**Files:** none modified — this is a verification-only task.

- [ ] **Step 1: Build**

```bash
cd frontend && pnpm build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Side-by-side visual sweep**

In the dev server, with the browser at desktop width, visit each of these and confirm the left edge of the main content lines up identically across all of them (no horizontal jump):

- `/` (home)
- `/transactions/:id` (any transaction detail)
- `/budget`
- `/budget/:id` (any budget detail)
- `/goals`
- `/insights/balance`

- [ ] **Step 3: Mobile visual sweep**

Resize the browser to mobile width (or use device emulation). On the same six routes, confirm:
- Horizontal padding is consistent.
- The mobile FAB does not overlap the last content row when scrolled to the bottom.

- [ ] **Step 4: Nav label confirmation**

Confirm the sidebar (desktop) reads "Home" for the `/` route, and the active-state highlight applies correctly when on `/`.

- [ ] **Step 5: No commit**

This task is verification only; nothing to commit. If any check fails, return to the relevant earlier task and fix.
