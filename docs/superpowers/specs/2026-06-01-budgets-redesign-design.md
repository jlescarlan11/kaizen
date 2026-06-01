# Budget List Page — Compact Card Redesign

**Date:** 2026-06-01
**File:** `frontend/src/features/budgets/BudgetsPage.tsx` (BudgetRow inline component)
**Status:** Approved by user

---

## Summary

The Budget list page currently renders each budget in `BudgetRow` with inconsistent container styles, all-caps micro-typography, and a progress bar that floats visually disconnected from its card. This redesign standardises every `BudgetRow` into a self-contained white card (`bg-surface rounded-2xl shadow-sm`), converts all all-caps labels to sentence case, anchors the progress bar between the header and footer rows, applies a red error track when a budget is over, and converts the icon container from a circle to a rounded square — all within the single inline component in `BudgetsPage.tsx`. No navigation, data, API, or routing changes are made.

---

## Stories

### Story 1: Consistent card wrapper for every BudgetRow

**As a** logged-in user viewing the Budget list page, **I want** each budget displayed inside a visually distinct card, **so that** I can scan and distinguish individual budgets at a glance without relying on whitespace alone.

**Acceptance criteria**

- Given the Budget list page loads with at least one active budget, When I view the list, Then each `BudgetRow` is wrapped in a container with `bg-surface`, `rounded-2xl`, and `shadow-sm` applied — visible as a white card with a subtle shadow against the `bg-background` page.
- Given a budget row is in its default (collapsed) state, When I view it, Then the card boundary is clearly defined and no budget row bleeds into or merges with adjacent rows.
- Given the Budget list page is viewed in dark mode, When I view the list, Then each card uses the dark-mode surface token (`--color-surface` dark override `#1c1c1e`) rather than hardcoded white.
- Given any number of budgets (1 to N), When the list renders, Then every row — not just the first or hovered one — has the same card container styling applied.
- Given the list is empty, When the empty state renders, Then the `EmptyStateCard` is unaffected by this change.

**Out of scope**

- Changes to the `EmptyStateCard`, `PageTabs`, `DataList`, `+ New Budget` button, or any element outside `BudgetRow`.

---

### Story 2: Rounded-square icon container

**As a** logged-in user, **I want** the category icon container in each budget row to use a rounded square shape, **so that** the visual design is consistent with the approved compact-card style.

**Acceptance criteria**

- Given a budget row renders with a resolved category, When I view the icon container, Then it uses `rounded-[10px]` (not `rounded-full`) and measures `w-11 h-11` (44 × 44 px).
- Given a budget row renders with a resolved category, When I view the icon container background, Then it is the category color at 10% opacity (`withOpacity(category.color, 0.10)`).
- Given a budget row renders with a resolved category, When I view the icon stroke color, Then it is the category color directly (unchanged).
- Given the icon container renders, When I inspect it, Then no `rounded-full` class is present.

**Out of scope**

- Icon size, icon name resolution logic, or `SharedIcon` internals.

---

### Story 3: Sentence-case typography — main row labels

**As a** logged-in user, **I want** all budget row labels to use sentence case instead of all-caps, **so that** the text is easier to scan and conforms to the approved typographic style.

**Acceptance criteria**

- Given a monthly budget row renders, When I view the period subtitle, Then it reads "Monthly budget" (not "MONTHLY BUDGET"), styled `text-xs text-text-secondary` with no `uppercase` class.
- Given a weekly budget row renders, When I view the period subtitle, Then it reads "Weekly budget".
- Given any budget row renders, When I view the allocated label, Then it reads "allocated" (not "ALLOCATED"), styled `text-xs text-text-secondary`.
- Given any budget row renders, When I view the spent label in the footer, Then it reads "Spent $X.XX" (not "SPENT: $X.XX" — colon removed, sentence case), styled `text-sm text-text-secondary`.
- Given a budget is within its limit, When I view the usage label, Then it reads "X% used" (not "X% USED"), styled `text-sm font-semibold` in the primary green color.
- Given a budget is over its limit, When I view the usage label, Then it reads "X% used" styled `text-sm font-semibold text-error`.

**Out of scope**

- The "Over" badge label text.
- Labels inside the expandable Disclosure panel (covered in Story 5).
- Category name and allocated amount typography (unchanged).

---

### Story 4: Progress bar anchored between header and footer rows

**As a** logged-in user, **I want** the progress bar to sit directly between the header and footer rows within the same card, **so that** the spending progress is visually connected to its context.

**Acceptance criteria**

- Given any budget row renders in collapsed state, When I view the card, Then the DOM order is: (1) header row (icon + name + allocated), (2) progress bar, (3) footer row (spent + % used).
- Given a budget is within its limit, When I view the progress bar, Then the track uses a neutral background (`inactiveClassName="bg-background"` or equivalent) and the fill uses `bg-primary`.
- Given a budget is over its limit, When I view the progress bar track, Then it uses `bg-error/10`.
- Given a budget is over its limit, When I view the progress bar fill, Then it uses `bg-error`.
- Given the `ProgressBar` shared component is used, When it renders, Then `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, and `aria-valuemax=100` are present (these come from the shared component and must not be removed).

**Out of scope**

- Changes to `ProgressBar.tsx` itself.
- The progress bar inside `BudgetDetailPage` or `AllocationTotalDisplay`.

---

### Story 5: Sentence-case typography — expandable Disclosure panel labels

**As a** logged-in user who expands a budget row to see insights, **I want** the panel labels to use sentence case, **so that** the panel typography is consistent with the main card.

**Acceptance criteria**

- Given a budget row is expanded, When I view the three insight columns, Then headers read "Burn rate", "Allowance", and "Projection" — no `uppercase` class on these three labels.
- Given `hasInsufficientData` is true, When I view any insight column value, Then it displays "—" (unchanged).
- Given data is available, When I view the Burn Rate sub-label, Then it reads "per day" (not "PER DAY").
- Given data is available, When I view the Allowance sub-label, Then it reads "remaining" (not "REMAINING").
- Given data is available, When I view the Projection sub-label, Then it reads "est. total" (not "EST. TOTAL").
- Given the panel is expanded then collapsed, When the animation completes, Then the panel is fully hidden (expand/collapse behavior unchanged).

**Out of scope**

- Disclosure trigger button styling, chevron rotation, or animation timings.
- Value color logic (Projection uses `text-warning` when projected over — unchanged).

---

### Story 6: Over-budget error state — full visual treatment

**As a** logged-in user with an exceeded budget, **I want** a cohesive red error treatment across the progress bar, usage label, and badge, **so that** I can immediately identify which budgets need attention.

**Acceptance criteria**

- Given `budget.expense > budget.amount`, When the row renders, Then the progress bar track uses `bg-error/10`, the fill uses `bg-error`, and the "X% used" label uses `text-error font-semibold`.
- Given `budget.expense > budget.amount`, When the "Over" badge renders, Then it uses `bg-error/10 text-error`.
- Given `budget.expense <= budget.amount`, When the row renders, Then none of the error classes appear on the progress bar or usage label.
- Given `budget.expense > budget.amount`, When I view the allocated amount in the header, Then it still displays in `text-text-primary` (not colored red).

**Out of scope**

- Changing the over-budget logic threshold.
- Over-budget visual changes to `BudgetDetailPage`.
- New error states (toast, modal) not in the approved design.
