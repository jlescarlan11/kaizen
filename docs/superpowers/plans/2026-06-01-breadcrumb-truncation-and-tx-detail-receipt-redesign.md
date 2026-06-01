# Breadcrumb Truncation + Transaction Detail Receipt Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Truncate long breadcrumb labels with ellipsis and redesign the transaction detail page into a receipt-style card layout.

**Architecture:** Four surgical file edits — `Breadcrumb.tsx` gets a `max-w` truncate on the last segment; `TransactionDetailHeader.tsx` gains a centered hero with type pill; `TransactionDetailInfo.tsx` is rewritten to key-value rows (Category, Account, Description); `TransactionDetailPage.tsx` wraps both in a single receipt card.

**Tech Stack:** React 19, Tailwind v4, TypeScript, React Router v6. No new dependencies.

---

## File Map

| File | Change |
|------|--------|
| `frontend/src/shared/components/Breadcrumb.tsx` | Add `max-w-[200px] truncate title` to last segment span |
| `frontend/src/features/transactions/components/TransactionDetailHeader.tsx` | Add type pill, center layout, fix expense color |
| `frontend/src/features/transactions/components/TransactionDetailInfo.tsx` | Full rewrite — grid → key-value rows + description prop |
| `frontend/src/features/transactions/TransactionDetailPage.tsx` | Wrap header + info in receipt card, update sections |

---

## Task 1: Breadcrumb — truncate last segment

**Files:**
- Modify: `frontend/src/shared/components/Breadcrumb.tsx`

- [ ] **Step 1: Open the file and locate the last-segment span (line ~89)**

The relevant block is the `isLast` branch inside the `resolvedCrumbs.map`:

```tsx
{isLast ? (
  <span className="text-text-primary font-medium">{crumb.label}</span>
) : (
  <Link to={crumb.to} className="hover:text-text-primary transition-colors">
    {crumb.label}
  </Link>
)}
```

- [ ] **Step 2: Replace the last-segment span with truncation + title**

```tsx
{isLast ? (
  <span
    className="text-text-primary font-medium max-w-[200px] truncate"
    title={crumb.label}
  >
    {crumb.label}
  </span>
) : (
  <Link to={crumb.to} className="hover:text-text-primary transition-colors">
    {crumb.label}
  </Link>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors mentioning `Breadcrumb.tsx`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add frontend/src/shared/components/Breadcrumb.tsx
git commit -m "fix(breadcrumb): truncate long last segment with ellipsis and title tooltip"
```

---

## Task 2: TransactionDetailHeader — receipt hero

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionDetailHeader.tsx`

- [ ] **Step 1: Replace the entire file content**

The new version: centered layout, type pill, expense color fix. The card shell lives in `TransactionDetailPage` — this component only renders the hero section.

```tsx
import { type ReactElement } from 'react'
import { formatCurrency } from '../../../shared/lib/formatCurrency'
import { cn } from '../../../shared/lib/cn'

interface TransactionDetailHeaderProps {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export function TransactionDetailHeader({
  amount,
  type,
  date,
  className,
}: TransactionDetailHeaderProps): ReactElement {
  const isIncome = type === 'INCOME'
  const isExpense = type === 'EXPENSE'

  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-8 text-center', className)}>
      {/* Type pill */}
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
          isIncome ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error',
        )}
      >
        {isIncome ? '↑ Income' : '↓ Expense'}
      </span>

      {/* Amount */}
      <div
        role="status"
        aria-label={`${isIncome ? 'Income' : 'Expense'}: ${formatCurrency(amount)}`}
        className="flex items-baseline gap-2"
      >
        <h2
          aria-hidden="true"
          className={cn(
            'text-4xl md:text-5xl font-semibold tracking-tight tabular-nums',
            isIncome ? 'text-success' : 'text-error',
          )}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(amount).replace('PHP', '').trim()}
        </h2>
        <span
          aria-hidden="true"
          className="text-sm font-semibold text-text-secondary tracking-wide uppercase"
        >
          PHP
        </span>
      </div>

      {/* Date */}
      <p className="text-sm text-text-secondary">
        {dateFormatter.format(new Date(date))}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add frontend/src/features/transactions/components/TransactionDetailHeader.tsx
git commit -m "feat(tx-detail): receipt hero — type pill, centered layout, expense color fix"
```

---

## Task 3: TransactionDetailInfo — key-value rows

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionDetailInfo.tsx`

- [ ] **Step 1: Replace the entire file content**

Removes the 3-column grid and `InfoBlock`. Adds `description` prop. Adds `InfoRow` helper. The `type` prop is dropped — type is now shown only in the hero pill.

```tsx
import { type ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'
import { withOpacity } from '../../../shared/lib/colorUtils'

interface TransactionDetailInfoProps {
  category?: {
    name: string
    icon: string
    color: string
  }
  paymentMethod?: {
    name: string
  }
  description?: string | null
  className?: string
}

export function TransactionDetailInfo({
  category,
  paymentMethod,
  description,
  className,
}: TransactionDetailInfoProps): ReactElement {
  return (
    <div className={cn('divide-y divide-border-subtle', className)}>
      {/* Category */}
      <InfoRow label="Category">
        {category ? (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: withOpacity(category.color, 0.08),
                color: category.color,
              }}
            >
              <SharedIcon type="category" name={category.icon} size={16} />
            </div>
            <span className="text-sm font-semibold text-text-primary">{category.name}</span>
          </div>
        ) : (
          <span className="text-sm italic text-text-secondary">No Category</span>
        )}
      </InfoRow>

      {/* Account */}
      <InfoRow label="Account">
        {paymentMethod ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary text-xs font-semibold text-text-primary">
              {paymentMethod.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-text-primary">{paymentMethod.name}</span>
          </div>
        ) : (
          <span className="text-sm italic text-text-secondary">No Payment Method</span>
        )}
      </InfoRow>

      {/* Description */}
      <div className="px-6 py-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Description
        </p>
        {description ? (
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{description}</p>
        ) : (
          <p className="text-sm italic text-text-secondary">No description</p>
        )}
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  children: React.ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors. If you see TS2339 on `type` prop — that means `TransactionDetailPage` still passes `type` to this component; fix it in Task 4.

- [ ] **Step 3: Commit**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add frontend/src/features/transactions/components/TransactionDetailInfo.tsx
git commit -m "feat(tx-detail): replace 3-col grid with receipt key-value rows"
```

---

## Task 4: TransactionDetailPage — wire the receipt card

**Files:**
- Modify: `frontend/src/features/transactions/TransactionDetailPage.tsx`

- [ ] **Step 1: Locate the header + first section block (lines ~84–110)**

Current code:

```tsx
<header className="mb-16">
  <TransactionDetailHeader
    amount={transaction.amount}
    type={transaction.type}
    date={transaction.transactionDate}
  />
</header>

<div className="space-y-16">
  <section>
    <TransactionDetailInfo
      category={transaction.category}
      paymentMethod={transaction.paymentMethod}
      type={transaction.type}
    />
  </section>

  {(transaction.description || transaction.notes) && (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TransactionNoteSection
        description={transaction.description}
        notes={transaction.notes}
      />
    </section>
  )}
```

- [ ] **Step 2: Replace with the receipt card wrapper**

```tsx
{/* Receipt card */}
<div className="mb-8 overflow-hidden rounded-xl border border-border-subtle bg-surface">
  <TransactionDetailHeader
    amount={transaction.amount}
    type={transaction.type}
    date={transaction.transactionDate}
  />
  <hr className="border-dashed border-border mx-0" />
  <TransactionDetailInfo
    category={transaction.category}
    paymentMethod={transaction.paymentMethod}
    description={transaction.description}
  />
</div>

<div className="space-y-16">
  {transaction.notes && (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TransactionNoteSection
        description={null}
        notes={transaction.notes}
      />
    </section>
  )}
```

Key changes:
- `<header>` + standalone `<section>` with `TransactionDetailInfo` replaced by a single card `<div>`
- Dashed `<hr>` separates hero from rows
- `type` prop removed from `TransactionDetailInfo`
- `description` passed to `TransactionDetailInfo` (now a key-value row there)
- `TransactionNoteSection` only renders when `transaction.notes` exists; `description={null}` passed explicitly

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend"
npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors.

- [ ] **Step 4: Start dev server and visually verify**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend"
npm run dev
```

Open http://localhost:5173, navigate to any transaction detail page and confirm:
- Breadcrumb last segment truncates long descriptions with `…` and shows full text on hover
- Receipt card renders: type pill (green for income / red for expense), large amount in correct color, date centered
- Dashed divider separates hero from key-value rows
- Category row: icon circle + name (or italic fallback)
- Account row: initial avatar + name (or italic fallback)
- Description row: full text in muted color, wraps naturally
- Edit/Delete buttons remain top-right (unchanged)
- History & Related section: green accent bar + heading visible
- Notes section only appears if the transaction has internal notes
- Mobile view (resize to 375px): no horizontal overflow, single column

- [ ] **Step 5: Commit**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add frontend/src/features/transactions/TransactionDetailPage.tsx
git commit -m "feat(tx-detail): wire receipt card — single card wraps hero + key-value rows"
```
