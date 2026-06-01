# Transactions Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the heavy MoneyFlowDisplay hero card with a compact 3-stat strip and tighten the transaction list into a single ledger-style container with inline date dividers.

**Architecture:** Four focused changes — one new component (`TransactionSummaryStrip`), two style updates inside `TransactionList` (date header row + transaction row), one swap in `TransactionListPage`, and deletion of the now-unused `MoneyFlowDisplay`. No new state, no new hooks.

**Tech Stack:** React, TypeScript, Tailwind v4 (design tokens via CSS vars), existing `formatCurrency` utility, existing `Badge` shared component.

---

## File Map

| Action | File |
|--------|------|
| **Create** | `frontend/src/features/transactions/components/TransactionSummaryStrip.tsx` |
| **Modify** | `frontend/src/features/transactions/components/TransactionList.tsx` |
| **Modify** | `frontend/src/features/transactions/TransactionListPage.tsx` |
| **Delete** | `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx` |

---

## Task 1: Create `TransactionSummaryStrip`

**Files:**
- Create: `frontend/src/features/transactions/components/TransactionSummaryStrip.tsx`

This replaces the full `MoneyFlowDisplay` card. Three inline stat columns — Income, Expenses, Net — separated by vertical dividers inside one `bg-surface` bordered card. Uses `formatCurrency` split pattern (number separate from "PHP" label) matching the existing pattern in `TransactionDetailHeader`.

- [ ] **Step 1: Create the component file**

```tsx
// frontend/src/features/transactions/components/TransactionSummaryStrip.tsx
import type { ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'
import { phpCurrencyFormatter } from '../../../shared/lib/formatCurrency'

interface TransactionSummaryStripProps {
  incoming: number
  outgoing: number
  net: number
}

interface StatColProps {
  label: string
  value: number
  colorClass: string
  dotColor?: string
  showSign?: boolean
}

function StatCol({ label, value, colorClass, dotColor, showSign = false }: StatColProps) {
  const formatted = phpCurrencyFormatter.format(Math.abs(value)).replace('PHP', '').trim()
  const sign = showSign ? (value >= 0 ? '+' : '−') : ''

  return (
    <div className="flex-1 px-5 py-4 border-r border-border-subtle last:border-r-0">
      <div className="flex items-center gap-1.5 mb-2">
        {dotColor && (
          <span className={cn('h-1.5 w-1.5 rounded-full inline-block', dotColor)} />
        )}
        <span className="text-3xs font-bold uppercase tracking-widest text-text-secondary">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-semibold text-text-secondary opacity-50">PHP</span>
        <span className={cn('text-xl font-extrabold tracking-tight leading-none', colorClass)}>
          {sign}{formatted}
        </span>
      </div>
    </div>
  )
}

export function TransactionSummaryStrip({
  incoming,
  outgoing,
  net,
}: TransactionSummaryStripProps): ReactElement {
  return (
    <div className="flex bg-surface border border-border-subtle rounded-card overflow-hidden">
      <StatCol label="Income" value={incoming} colorClass="text-success" dotColor="bg-success" />
      <StatCol label="Expenses" value={outgoing} colorClass="text-error" dotColor="bg-error" />
      <StatCol label="Net" value={net} colorClass="text-text-primary" showSign />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionSummaryStrip.tsx
git commit -m "feat(transactions): add TransactionSummaryStrip component"
```

---

## Task 2: Update `TransactionList` — date group header

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionList.tsx:97-125`

Remove the `sticky top-0 z-10 pt-10 pb-4 bg-background` treatment. Replace with a compact inline divider row that looks like a table section header — same as the A2 mockup.

- [ ] **Step 1: Replace the date group header `div`**

Find this block in `renderItem` (around line 97):

```tsx
<div className="pt-10 pb-4 bg-background sticky top-0 z-10 flex items-center justify-between pr-6">
  <h2 className="px-6 text-3xs font-black text-text-secondary uppercase tracking-widest flex items-center gap-3">
    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
    {formatGroupDate(item.date)}
  </h2>
  {isSelectionMode && (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 text-3xs font-black text-primary hover:bg-transparent uppercase tracking-widest"
      onClick={() => {
        const groupItems: number[] = []
        for (let i = index + 1; i < flattenedItems.length; i++) {
          const subItem = flattenedItems[i]
          if (subItem.type === 'header') break
          groupItems.push(subItem.transaction.id)
        }
        const allSelected = groupItems.every((id) => selectedIds.includes(id))
        if (allSelected) {
          dispatch(setSelectedIds(selectedIds.filter((id) => !groupItems.includes(id))))
        } else {
          dispatch(setSelectedIds(Array.from(new Set([...selectedIds, ...groupItems]))))
        }
      }}
    >
      Select group
    </Button>
  )}
</div>
```

Replace with:

```tsx
<div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-border-subtle">
  <span className="text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-60">
    {formatGroupDate(item.date)}
  </span>
  {isSelectionMode && (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 text-3xs font-bold text-primary hover:bg-transparent uppercase tracking-widest"
      onClick={() => {
        const groupItems: number[] = []
        for (let i = index + 1; i < flattenedItems.length; i++) {
          const subItem = flattenedItems[i]
          if (subItem.type === 'header') break
          groupItems.push(subItem.transaction.id)
        }
        const allSelected = groupItems.every((id) => selectedIds.includes(id))
        if (allSelected) {
          dispatch(setSelectedIds(selectedIds.filter((id) => !groupItems.includes(id))))
        } else {
          dispatch(setSelectedIds(Array.from(new Set([...selectedIds, ...groupItems]))))
        }
      }}
    >
      Select group
    </Button>
  )}
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionList.tsx
git commit -m "refactor(transactions): compact date group header — remove sticky, use inline divider row"
```

---

## Task 3: Update `TransactionList` — transaction row padding and icon

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionList.tsx:132-260`

Tighten the row: reduce padding, shrink the category icon from 48 → 36px, reduce icon render size from 24 → 20.

- [ ] **Step 1: Update the row wrapper `div` (line ~132)**

Find:
```tsx
<div className={cn('relative flex items-center gap-4 transition-all px-2')}>
```

Replace with:
```tsx
<div className={cn('relative flex items-center gap-3 transition-all')}>
```

- [ ] **Step 2: Update the row inner clickable `div` (line ~152)**

Find:
```tsx
className={cn(
  'flex-1 flex items-center justify-between px-6 py-3.5 transition-all cursor-pointer group active:scale-[0.98] border-b border-border-subtle/10',
```

Replace with:
```tsx
className={cn(
  'flex-1 flex items-center justify-between px-4 py-2.5 transition-all cursor-pointer group active:scale-[0.98] border-b border-border-subtle',
```

- [ ] **Step 3: Update the category icon container (line ~161)**

Find:
```tsx
className="flex h-12 w-12 items-center justify-center rounded-xl transition-all group-hover:scale-105 shadow-sm"
```

Replace with:
```tsx
className="flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:scale-105 shadow-sm flex-shrink-0"
```

- [ ] **Step 4: Update the icon render size inside the category icon (line ~171)**

Find:
```tsx
<SharedIcon type="category" name={tx.category.icon} size={24} strokeWidth={2.5} />
```

Replace with:
```tsx
<SharedIcon type="category" name={tx.category.icon} size={20} strokeWidth={2.5} />
```

- [ ] **Step 5: Update the fallback icon size (line ~181)**

Find:
```tsx
{tx.type === 'INCOME' ? (
  <SharedIcon type="ui" name="income" size={24} strokeWidth={2.5} />
```

Replace with:
```tsx
{tx.type === 'INCOME' ? (
  <SharedIcon type="ui" name="income" size={20} strokeWidth={2.5} />
```

- [ ] **Step 6: Update the left content gap (line ~159)**

Find:
```tsx
<div className="flex items-center gap-6">
```

Replace with:
```tsx
<div className="flex items-center gap-4">
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionList.tsx
git commit -m "refactor(transactions): tighter row padding and smaller category icon"
```

---

## Task 4: Update `TransactionListPage` — swap MoneyFlowDisplay for TransactionSummaryStrip

**Files:**
- Modify: `frontend/src/features/transactions/TransactionListPage.tsx`

Remove the `MoneyFlowDisplay` import and usage. Add `TransactionSummaryStrip` import. Compute `net` from the existing `moneyFlow` values.

- [ ] **Step 1: Replace the import**

Find:
```tsx
import { MoneyFlowDisplay } from './components/MoneyFlowDisplay'
```

Replace with:
```tsx
import { TransactionSummaryStrip } from './components/TransactionSummaryStrip'
```

- [ ] **Step 2: Replace the JSX usage**

Find:
```tsx
{!isLoading && processedTransactions.length > 0 && (
  <div className="animate-in fade-in slide-in-from-bottom-3 duration-600">
    <MoneyFlowDisplay {...moneyFlow} />
  </div>
)}
```

Replace with:
```tsx
{!isLoading && (moneyFlow.incoming > 0 || moneyFlow.outgoing > 0) && (
  <div className="animate-in fade-in slide-in-from-bottom-3 duration-600">
    <TransactionSummaryStrip
      incoming={moneyFlow.incoming}
      outgoing={moneyFlow.outgoing}
      net={moneyFlow.incoming - moneyFlow.outgoing}
    />
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/transactions/TransactionListPage.tsx
git commit -m "feat(transactions): swap MoneyFlowDisplay → TransactionSummaryStrip"
```

---

## Task 5: Delete `MoneyFlowDisplay`

**Files:**
- Delete: `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx`

`MoneyFlowDisplay` is now unused. Verify nothing else imports it before deleting.

- [ ] **Step 1: Confirm no remaining imports**

```bash
grep -r "MoneyFlowDisplay" frontend/src --include="*.ts" --include="*.tsx"
```

Expected: no output (zero matches).

- [ ] **Step 2: Delete the file**

```bash
rm "frontend/src/features/transactions/components/MoneyFlowDisplay.tsx"
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -u frontend/src/features/transactions/components/MoneyFlowDisplay.tsx
git commit -m "chore(transactions): delete unused MoneyFlowDisplay component"
```

---

## Task 6: Push

- [ ] **Step 1: Push to remote**

```bash
git push origin main
```
