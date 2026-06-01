# Breadcrumb Truncation + Transaction Detail Receipt Redesign

**Date:** 2026-06-01  
**Status:** Approved  
**Stakeholder verdict:** APPROVED — no changes requested

---

## Overview

Two targeted UI improvements:

1. **Breadcrumb truncation** — long dynamic labels (e.g. transaction descriptions) overflow the header. Fix with CSS truncation + accessible `title` tooltip.
2. **Transaction detail receipt redesign** — replace the sparse 3-column grid layout with a receipt/statement card style: centered hero, dashed divider, key-value rows.

---

## Design Decisions

- **Layout choice (B2):** Clean white receipt card, no colored accent strip. Edit/Delete buttons stay top-right (existing position, no change).
- **Accent bar color:** Use `bg-primary` throughout — it is already green (`#16a34a`) in this design system. Do NOT use `bg-success` (different green, no semantic reason to distinguish here).
- **"Flow" row removed:** Type (Income/Expense) migrates to the hero pill. No separate key-value row for it.
- **Expense amount color:** Change from `text-text-primary` (neutral) to `text-error` — intentional design improvement.
- **No backend changes:** All four stories are frontend-only.

---

## Stories

### Story 1: Truncate long breadcrumb labels

**File:** `frontend/src/shared/components/Breadcrumb.tsx`

**Change:** On the last breadcrumb segment `<span>` (line ~95), add:
- `max-w-[200px] truncate` Tailwind classes
- `title={label}` attribute for full text on hover

Earlier segments (`<Link>`) must never receive truncation classes.

**Acceptance criteria:**
- Long labels (e.g. "Merge pull request #4 from jlescarlan11/phase-3a-snapshot") truncate with `…` and never cause the header row to wrap
- Full label visible via native browser tooltip on hover (`title` attribute)
- Short labels display in full with no visual change
- Works at all viewport widths ≥ 320px

---

### Story 2: Receipt card — hero area

**File:** `frontend/src/features/transactions/components/TransactionDetailHeader.tsx`

**Change:** Wrap content in a receipt card shell (`bg-surface border border-border-subtle rounded-xl`). Inside:
- Centered hero: type pill + large amount + date
- Type pill: green `bg-primary/10 text-primary` for INCOME ("↑ Income"), red `bg-error/10 text-error` for EXPENSE ("↓ Expense")
- Amount: `text-success` for income, `text-error` for expense
- Dashed horizontal divider below hero: `border-t border-dashed border-border`

**Acceptance criteria:**
- Receipt card present with correct tokens
- INCOME/EXPENSE pill colors correct
- Dashed divider separates hero from rows below
- Mobile: single column, no horizontal overflow

---

### Story 3: Receipt card — key-value rows

**Files:** `frontend/src/features/transactions/components/TransactionDetailInfo.tsx`, `frontend/src/features/transactions/TransactionDetailPage.tsx`

**Change:** Remove `TransactionDetailInfo` 3-column grid entirely. Inside the same receipt card (below the dashed divider from Story 2), add key-value rows:

| Row | Left label | Right value |
|-----|-----------|-------------|
| Category | "CATEGORY" (uppercase, muted) | colored icon circle + category name |
| Account | "ACCOUNT" | initial-avatar circle + account name |
| Description | "DESCRIPTION" | full text, `text-text-secondary`, `whitespace-pre-wrap` |

Each row separated by `border-b border-border-subtle`, last row no border.  
Fallback text in italic `text-text-secondary` for missing category / account.

**Acceptance criteria:**
- 3-column grid absent from DOM
- All three rows render with correct labels and values
- Fallbacks shown for missing data (not empty rows)
- Description wraps naturally (no truncation)

---

### Story 4: History & Related — section accent bar

**File:** `frontend/src/features/transactions/TransactionDetailPage.tsx` (line ~120)

**Change:** The accent bar `<div className="h-4 w-1 bg-primary rounded-full" />` already exists. Verify it uses `bg-primary` (it does — no change needed in most cases). Ensure heading and bar are vertically aligned (`flex items-center gap-2`).

**Acceptance criteria:**
- 3px green (`bg-primary`) left accent bar visible next to "History & Related" heading
- Bar and heading vertically centered
- `RelatedTransactionsList` and "Same Category" badge unchanged

---

## Files Touched

| File | Change |
|------|--------|
| `frontend/src/shared/components/Breadcrumb.tsx` | Add `max-w-[200px] truncate title={label}` to last segment |
| `frontend/src/features/transactions/components/TransactionDetailHeader.tsx` | Add receipt card shell, type pill, dashed divider, recolor amounts |
| `frontend/src/features/transactions/components/TransactionDetailInfo.tsx` | Remove entirely (or stub empty) |
| `frontend/src/features/transactions/TransactionDetailPage.tsx` | Remove `<TransactionDetailInfo>` render, verify accent bar at line ~120 |

No new components needed. No backend changes. No new dependencies.

---

## Out of Scope

- Custom tooltip on mobile for truncated breadcrumb (native `title` only)
- Truncation of non-final breadcrumb segments
- `AttachmentViewer` layout changes
- `TransactionNoteSection` internal markup changes
- Inline editing within receipt card rows
- Removing `TransactionDetailHeader.tsx` file after replacement (tech-debt backlog)
