# Budget List Page — Compact Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign every `BudgetRow` on the budgets list page into a self-contained white card with sentence-case labels, an anchored progress bar, and a cohesive over-budget error state.

**Architecture:** All changes are confined to the inline `BudgetRow` component inside `BudgetsPage.tsx`. The custom progress bar div is migrated to the shared `ProgressBar` component to gain ARIA accessibility attributes. No routing, data, API, or other file changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Headless UI (`Disclosure`), design tokens via CSS custom properties

---

## File Map

| File | Change |
|---|---|
| `frontend/src/features/budgets/BudgetsPage.tsx` | Only file modified — card wrapper, icon, typography, progress bar, panel labels |
| `frontend/src/shared/components/ProgressBar.tsx` | Read-only reference — migrating to this component in Task 4 |

---

### Task 1: Card wrapper for every BudgetRow (Story 1)

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx` (line 32)

- [ ] **Step 1: Replace the BudgetRow inner card div className**

Find (line 32):
```
"relative flex flex-col px-5 py-4 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group rounded-2xl"
```

Replace with:
```
"relative flex flex-col px-5 py-4 bg-surface rounded-2xl shadow-sm hover:bg-surface-secondary transition-all group"
```

Changes: add `bg-surface shadow-sm` as resting state, replace `hover:bg-white hover:shadow-xl hover:shadow-primary/5` with `hover:bg-surface-secondary` (dark-mode safe).

- [ ] **Step 2: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0 (pre-existing DataTable.tsx error is fine).

- [ ] **Step 3: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/budgets/BudgetsPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(budgets): consistent bg-surface rounded card on every BudgetRow

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Rounded-square icon container (Story 2)

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx` (lines 41–50)

- [ ] **Step 1: Change icon container border-radius**

Find in the icon container `div` className (line 42):
```
"h-11 w-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shrink-0 shadow-sm"
```

Replace with:
```
"h-11 w-11 rounded-[10px] flex items-center justify-center transition-all group-hover:scale-105 shrink-0"
```

Changes: `rounded-xl` → `rounded-[10px]`, remove `shadow-sm` from the icon (the card has its own shadow now).

- [ ] **Step 2: Update icon container background opacity**

Find (line 46):
```
backgroundColor: withOpacity(
  category?.color || 'var(--color-category-fallback)',
  0.08,
),
```

Replace with:
```
backgroundColor: withOpacity(
  category?.color || 'var(--color-category-fallback)',
  0.10,
),
```

Change: `0.08` → `0.10`.

- [ ] **Step 3: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/budgets/BudgetsPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(budgets): rounded-[10px] icon square, bump opacity to 10%

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Sentence-case typography — main row labels (Story 3)

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx` (lines 65–114)

Four changes in this task.

- [ ] **Step 1: Fix period subtitle**

Find (lines 65–67):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary mt-0.5 opacity-60">
  {budget.period} Budget
</p>
```

Replace with:
```tsx
<p className="text-xs text-text-secondary mt-0.5">
  {budget.period === 'MONTHLY' ? 'Monthly' : 'Weekly'} budget
</p>
```

- [ ] **Step 2: Fix allocated label**

Find (lines 76–78):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-40">
  Allocated
</p>
```

Replace with:
```tsx
<p className="text-xs text-text-secondary">
  allocated
</p>
```

- [ ] **Step 3: Fix spent label**

Find (lines 104–106):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-60">
  Spent: ${budget.expense.toFixed(2)}
</p>
```

Replace with:
```tsx
<p className="text-sm text-text-secondary">
  Spent ${budget.expense.toFixed(2)}
</p>
```

Change: class replacement + remove colon from "Spent:".

- [ ] **Step 4: Fix % used label**

Find (lines 107–114):
```tsx
<p
  className={cn(
    'text-3xs font-bold uppercase tracking-widest',
    isOverBudget ? 'text-error' : 'text-primary',
  )}
>
  {usagePercent}% used
</p>
```

Replace with:
```tsx
<p
  className={cn(
    'text-sm font-semibold',
    isOverBudget ? 'text-error' : 'text-primary',
  )}
>
  {usagePercent}% used
</p>
```

- [ ] **Step 5: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 6: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/budgets/BudgetsPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(budgets): sentence-case main row labels, remove uppercase tracking

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Migrate progress bar to shared ProgressBar component (Story 4)

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx` (lines 1–10 for import, lines 93–101 for the bar)
- Read: `frontend/src/shared/components/ProgressBar.tsx`

- [ ] **Step 1: Read the ProgressBar component interface**

Open `frontend/src/shared/components/ProgressBar.tsx` and note:
- The component's prop names (expect: `value`, `activeClassName`, `inactiveClassName` — but confirm)
- The import path relative to `BudgetsPage.tsx`

- [ ] **Step 2: Add the import**

At the top of `BudgetsPage.tsx`, add this import alongside the existing shared component imports:

```tsx
import { ProgressBar } from '../../shared/components/ProgressBar'
```

(Adjust the relative path if the file is in a different location — confirm from Step 1.)

- [ ] **Step 3: Replace the custom progress bar div**

Find (lines 93–101):
```tsx
<div className="relative w-full h-2 bg-background rounded-full overflow-hidden p-px">
  <div
    className={cn(
      'h-full rounded-full transition-all duration-700 ease-out',
      isOverBudget ? 'bg-error' : 'bg-primary',
    )}
    style={{ width: `${usagePercent}%` }}
  />
</div>
```

Replace with:
```tsx
<ProgressBar
  value={Math.min(usagePercent, 100)}
  activeClassName={isOverBudget ? 'bg-error' : 'bg-primary'}
  inactiveClassName={isOverBudget ? 'bg-error/10' : 'bg-background'}
/>
```

Key changes:
- Migrates to the shared component (gains `role="progressbar"` + ARIA attributes automatically)
- `value` is capped at 100 via `Math.min` (the fill percentage should not exceed 100% visually)
- Over-budget: `inactiveClassName="bg-error/10"` gives the red track

If the ProgressBar prop names differ from what's shown above (confirmed in Step 1), use the actual prop names.

- [ ] **Step 4: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/budgets/BudgetsPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(budgets): migrate progress bar to shared ProgressBar, add error track

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Sentence-case typography — Disclosure panel labels (Story 5)

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx` (lines ~129–173)

Six changes: 3 column headers + 3 sub-labels.

- [ ] **Step 1: Fix "Burn Rate" column header**

Find (lines 129–131):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-60">
  Burn Rate
</p>
```

Replace with:
```tsx
<p className="text-xs font-semibold text-text-secondary">
  Burn rate
</p>
```

- [ ] **Step 2: Fix "Allowance" column header**

Find (lines 140–142):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-60">
  Allowance
</p>
```

Replace with:
```tsx
<p className="text-xs font-semibold text-text-secondary">
  Allowance
</p>
```

- [ ] **Step 3: Fix "Projection" column header**

Find (lines 156–158):
```tsx
<p className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-60">
  Projection
</p>
```

Replace with:
```tsx
<p className="text-xs font-semibold text-text-secondary">
  Projection
</p>
```

- [ ] **Step 4: Fix "per day" sub-label**

Find (lines 135–137):
```tsx
<p className="text-3xs font-bold uppercase tracking-tighter text-text-secondary opacity-40">
  per day
</p>
```

Replace with:
```tsx
<p className="text-xs text-text-secondary">
  per day
</p>
```

- [ ] **Step 5: Fix "remaining" sub-label**

Find (lines 151–153):
```tsx
<p className="text-3xs font-bold uppercase tracking-tighter text-text-secondary opacity-40">
  remaining
</p>
```

Replace with:
```tsx
<p className="text-xs text-text-secondary">
  remaining
</p>
```

- [ ] **Step 6: Fix "est. total" sub-label**

Find (lines 171–173):
```tsx
<p className="text-3xs font-bold uppercase tracking-tighter text-text-secondary opacity-40">
  est. total
</p>
```

Replace with:
```tsx
<p className="text-xs text-text-secondary">
  est. total
</p>
```

- [ ] **Step 7: Run typecheck + lint**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck && npm run lint
```

Expected: both exit code 0.

- [ ] **Step 8: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/budgets/BudgetsPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(budgets): sentence-case Disclosure panel labels and sub-labels

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Final audit

**Files:**
- Read: `frontend/src/features/budgets/BudgetsPage.tsx`

- [ ] **Step 1: Audit remaining all-caps instances**

```bash
grep -n "uppercase" "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend/src/features/budgets/BudgetsPage.tsx"
```

Expected: zero results. If any remain, fix them before continuing.

- [ ] **Step 2: Confirm single file changed**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" diff --name-only 892a62a..HEAD
```

Expected: only `frontend/src/features/budgets/BudgetsPage.tsx`.

- [ ] **Step 3: Final typecheck + lint**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck && npm run lint
```

Expected: lint exits 0, typecheck exits 0 (pre-existing DataTable.tsx error acceptable).

---

## Self-Review

**Spec coverage:**

| Story | Task |
|---|---|
| Story 1 — Card wrapper | Task 1 |
| Story 2 — Rounded-square icon | Task 2 |
| Story 3 — Main row sentence-case | Task 3 |
| Story 4 — Progress bar migration + error track | Task 4 |
| Story 5 — Panel sentence-case | Task 5 |
| Story 6 — Over-budget error state | Covered in Tasks 1 (hover), 3 (% used color), 4 (track + fill) — no separate task needed as it's distributed across the others |

All 6 stories covered. No gaps.

**Placeholder scan:** No TBDs. Step 4.1 asks engineer to read ProgressBar interface — this is necessary because prop names must be confirmed before the migration can be written. All other steps have exact code.

**Type consistency:** No new types introduced. `isOverBudget`, `usagePercent`, `budget.period` are all pre-existing variables in scope.
