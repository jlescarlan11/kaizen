# Transactions Page Redesign

**Date:** 2026-06-01
**Status:** Approved
**Direction:** Option A2 — Compact Stats Strip + Single List Container

---

## Goal

Replace the heavy `MoneyFlowDisplay` hero card and visually noisy layout with a minimal, business-standard transactions page. Inspired by Stripe / Linear ledger patterns: compact data, clear hierarchy, no decorative chrome.

---

## Layout Overview

```
[ Income  |  Expenses  |  Net ]   ← TransactionSummaryStrip
[ 🔍 Search …  ] [ Filter ] [ Export ]   ← toolbar (unchanged)
┌─────────────────────────────────────────┐
│ MAY 6, 2026                             │  ← date group row (inline divider)
│  💻  GitHub Merge   Digital Wallet  +3,133.00  Income  │
│ APR 30, 2026                            │
│  🍽️  Food           Cash            −121.00   Expense │
│  🛒  Groceries      GCash           −313.00   Expense │
│  [ Load more ]  ← only shown when hasMore=true       │
└─────────────────────────────────────────┘
```

---

## Components

### 1. `TransactionSummaryStrip` (new)

Replaces `MoneyFlowDisplay` entirely.

**Props:**
```ts
interface TransactionSummaryStripProps {
  incoming: number
  outgoing: number
  net: number        // incoming - outgoing, computed at call site
}
```

**Layout:** Three equal columns separated by `border-border-subtle` vertical dividers, all inside one `bg-surface border border-border-subtle rounded-card` container.

Each column:
- Label row: colored dot + uppercase tracking label (`text-3xs font-bold text-text-secondary`)
- Value row: currency abbreviation (from locale/config token, no hardcoded "PHP") + amount (`text-xl font-extrabold`)
- Colors: income → `text-success`, expenses → `text-error`, net → `text-text-primary`
- Dot colors: income → `bg-success`, expenses → `bg-error`, net → omitted

**Visibility:** Only rendered when `incoming > 0 || outgoing > 0` (same condition as current MoneyFlowDisplay). Hidden during loading.

**Currency:** Use the existing `formatCurrency` split pattern — `formatCurrency(value).replace('PHP', '').trim()` for the number, with a separate dim "PHP" label rendered via `text-text-secondary opacity-40`. This matches the pattern in `TransactionDetailHeader` and `TransactionList`.

---

### 2. `TransactionList` — date group header style update

The date group `header` item rendered by `renderItem` currently uses:

```tsx
<div className="pt-10 pb-4 bg-background sticky top-0 z-10 ...">
```

Replace with a compact inline divider row:

```tsx
<div className="px-4 py-2 bg-surface-secondary border-b border-border-subtle text-3xs font-bold text-text-tertiary uppercase tracking-widest flex items-center justify-between">
```

- Remove `sticky`, `top-0`, `z-10`, large `pt-10 pb-4` padding
- Keep "Select group" button on the right when `isSelectionMode` is active
- This makes the date header look like a table section divider row (same as A2 mockup)

---

### 3. `TransactionList` — transaction row style update

Current row wrapper:

```
px-6 py-3.5
```

Update to:

```
px-4 py-2.5
```

Current icon size: `h-12 w-12` (48px). Update to `h-9 w-9` (36px) with `rounded-lg`.

Type badge: The existing `Badge` component is not rendered in `TransactionList` row currently (amount only). Add a compact type badge below the amount:
- Income → `Badge variant="success" emphasis="soft"` with text "Income"
- Expense → `Badge variant="neutral" emphasis="soft"` with text "Expense"
- Size: `text-3xs`

---

### 4. `TransactionListPage` — replace MoneyFlowDisplay

Remove `MoneyFlowDisplay` import and usage. Replace with `TransactionSummaryStrip`:

```tsx
const moneyFlow = useMemo(() => calculateMoneyFlow(processedTransactions), [processedTransactions])

// In JSX:
{!isLoading && (moneyFlow.incoming > 0 || moneyFlow.outgoing > 0) && (
  <TransactionSummaryStrip
    incoming={moneyFlow.incoming}
    outgoing={moneyFlow.outgoing}
    net={moneyFlow.incoming - moneyFlow.outgoing}
  />
)}
```

---

### 5. Load More — visibility rule

Already gated by `{hasMore && ...}` in `TransactionList`. No code change needed. Design spec confirms: **Load More is only shown when `hasMore === true`**. When all transactions are loaded, no footer is rendered.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/features/transactions/components/TransactionSummaryStrip.tsx` | New component |
| `frontend/src/features/transactions/components/TransactionList.tsx` | Date header style, row padding/icon size, type badge |
| `frontend/src/features/transactions/TransactionListPage.tsx` | Swap MoneyFlowDisplay → TransactionSummaryStrip |
| `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx` | No longer used — can be deleted |

---

## Out of Scope

- No changes to TransactionFilter, TransactionSearch, SelectionActionBar, ExportModal
- No changes to transaction detail page
- No changes to sort or pagination logic
- `ActivityRow` component (used on home dashboard) is separate — not touched
