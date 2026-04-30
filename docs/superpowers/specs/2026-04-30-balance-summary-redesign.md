# Balance Summary Redesign

**Date:** 2026-04-30  
**Branch:** audit/uiux-best-in-class-sweep  
**Status:** Approved — ready for implementation

---

## Overview

Redesign the Balance Summary page layout to be more impactful and scannable. The current layout splits the hero (balance + badge) on the left and stacks controls in a right column, with a full "Intelligent Observations" section between the header and charts. The redesign consolidates everything into a clearer visual hierarchy: one bold hero card at the top, a single controls row below it, then charts.

---

## Design Decisions

| Question | Decision |
|---|---|
| Overall layout direction | B — Bold Hero Card (full-width gradient card dominates the top) |
| Hero card contents | 3-stat grid inside the card, with period-labeled Income/Spent |
| Intelligent Observations | Removed entirely |

---

## Page Structure

### 1. Hero Card (full width)

A full-width gradient card (`bg-gradient` from `ui-surface` to a slightly lighter tone) containing:

- **Label row**: `"Balance Summary"` in small uppercase muted text
- **Balance**: Large bold number (₱22,710) — primary visual anchor
- **Growth badge**: Pill showing `↑ X%` + `"from prior period"` in muted text
- **3-stat mini grid** (3 equal columns inside the card):
  - `Income for [period label]` — value in success/green color
  - `Spent for [period label]` — value in error/red color
  - `Accounts` — count in foreground color

The period label in the stat grid (e.g., "One Year", "Current Month") must dynamically reflect the selected `PeriodOption`. Map each option to a human label:

| PeriodOption | Stat label suffix |
|---|---|
| `CURRENT_MONTH` | `"Current Month"` |
| `LAST_MONTH` | `"Last Month"` |
| `LAST_3_MONTHS` | `"Last 3 Months"` |
| `ALL_TIME` | `"One Year"` |

### 2. Controls Row (below hero)

A single horizontal row containing all three controls — no stacked column layout:

- **Period selector** (`PeriodSelector`) — flex-grow, full options
- **Account filter** (`SummaryFilterBar`) — flex-grow, dropdown popover
- **Export CSV button** — fixed width, icon + label

On mobile (`< md`), these stack vertically. On `md+`, they sit in one row.

The `PeriodSelector` should drop its outer `max-w-xs` wrapper when rendered inside this row — the row itself constrains width.

### 3. Financial Trajectory (full width)

No change to the chart itself. Add a section label `"Financial Trajectory"` as a small uppercase muted heading above the `Card` component (outside it, not inside — consistent with how other sections will be labelled).

Granularity toggle (Daily / Weekly / Monthly) remains inside the card header area.

### 4. Spending Breakdown + Spending Trends (2-column grid)

No change to the charts. No extra section label needed — the `Card` component already renders its own title ("Spending Breakdown", "Spending Trends").

### 5. Account List (bottom, with separator)

No structural change. Keep the existing `border-t` separator and `CompactAccountList`. Add a small section label `"Accounts"` above it matching the style of the Financial Trajectory label.

---

## Removals

- **`TrendInsights` component** — no longer rendered on the page. The component file can stay (don't delete); just remove it from `BalanceSummaryPage`.
- **Right-column controls layout** — the `md:flex-row` split with `md:min-w-[260px]` right column is replaced by the single controls row.

---

## Component Changes

### `BalanceSummaryHero`

- Accept a new `periodLabel: string` prop
- Render the full-width gradient hero card instead of the current bare text layout
- Stat grid inside the card uses `periodLabel` in the Income/Spent labels

### `BalanceSummaryPage`

- Derive `periodLabel` from the current `period` value using the mapping table above
- Pass `periodLabel` to `BalanceSummaryHero`
- Remove `TrendInsights` import and usage
- Replace the `flex-col md:flex-row` header + right-column layout with:
  1. `BalanceSummaryHero` (full width)
  2. Controls row (`flex` with `gap`, wrapping on mobile)
- Remove the `mb-12` wrapper around `TrendInsights`
- Add section label above `BalanceTrendChart`
- Add section label above the account list section

### `PeriodSelector`

- Remove the `max-w-xs` wrapper — let the parent control width

---

## Visual Tokens

All styling must use existing design tokens. No new tokens needed:

- Hero card background: `bg-ui-surface` with a subtle gradient via inline style or a new utility class
- Stat sub-cards inside hero: `bg-ui-surface-muted` (existing token, semi-transparent on dark background)
- Growth badge: `bg-success/10` border `border-success/20` text `text-success` (positive) or error equivalents
- Section labels: `text-xs font-semibold uppercase tracking-wide text-muted-foreground`

---

## Success Criteria

- [ ] Hero card is full width and visually dominant
- [ ] Stat grid shows period-aware labels that update when period selector changes
- [ ] Controls are in a single horizontal row on desktop, stacked on mobile
- [ ] No Intelligent Observations section anywhere on the page
- [ ] Section labels present above Financial Trajectory and Accounts list
- [ ] No layout regressions on mobile
- [ ] TypeScript compiles clean, lint passes
