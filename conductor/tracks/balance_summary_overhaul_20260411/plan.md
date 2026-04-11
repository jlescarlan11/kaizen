# Implementation Plan: Balance Summary UI/UX Overhaul

## Phase 1: Global Filter System & Layout Foundation [checkpoint: 69e64a7]
**Goal:** Implement a persistent, high-signal filter bar to control the date range and account scope for the entire summary page.

- [x] **Task: Define Filter State in Redux** (289df38)
    - [x] Create `balanceSummarySlice.ts` to manage `selectedAccountIds` and `granularity`.
- [x] **Task: Create `SummaryFilterBar` Component** (289df38)
    - [x] Implement a clean, flat-design filter bar for account selection.
    - [x] **TDD:** Write tests to ensure state updates correctly on user selection.
- [x] **Task: Integrate Filter Bar into `BalanceSummaryPage` & Backend** (26be40a)
    - [x] Update backend `InsightsController`, `InsightsService`, and `TransactionRepository` to support `paymentMethodIds`.
    - [x] Support `WEEKLY` granularity in backend `getBalanceTrends`.
    - [x] Update frontend API and Page to filter entire dashboard by account.
    - [x] Implement single-column vertical stack layout.
- [x] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)** (69e64a7)

## Phase 2: Chronological Charting Overhaul [checkpoint: f630b3f]
**Goal:** Ensure charts follow a strict L-to-R chronological flow ending with the present date/month.

- [x] **Task: Refactor `BalanceTrendChart` Chronology** (9dbc8bc)
    - [x] Modify the chart rendering logic to ensure the X-axis always ends with the most recent data point.
- [x] **Task: Implement Smart Granularity Scoping** (9dbc8bc)
    - [x] Update `Daily` mode to show last 30 days.
    - [x] Add toggleable datasets (Income, Expense, Net) to the chart legend.
- [x] **Task: Implement Interactive Tooltips** (9dbc8bc)
    - [x] Enhance tooltips to show percentage change from the previous period (PHP values + % deltas).
- [x] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)** (f630b3f)

## Phase 3: Streamlined Account Breakdowns & Insights
**Goal:** Replace bulky widgets with a data-dense, interactive list and trend insights.

- [ ] **Task: Create `CompactAccountList` Component**
    - [ ] Implement a list-based view with mini-sparklines (7-day trend) for each account.
    - [ ] Add collapsible/expandable functionality to the list to save space.
- [ ] **Task: Implement `TrendInsights` Widget**
    - [ ] Create a "Key Observations" widget that parses summary data and highlights anomalies or trend shifts.
    - [ ] **TDD:** Test the insight generator with specific data patterns (e.g., sharp expense increase).
- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**

## Phase 4: Goal Integration & Export
**Goal:** Add progress context and data portability actions.

- [ ] **Task: Integrate Goal Progress Indicators**
    - [ ] Add a small goal progress bar to the net balance visualization or insights section.
- [ ] **Task: Implement Export Actions**
    - [ ] Add "Export to CSV" and "Export to PDF" actions to the summary page.
- [ ] **Task: Final UI/UX Polish & Mobile Verification**
    - [ ] Audit the entire page against "Flat UI" guidelines and WCAG accessibility standards.
    - [ ] Verify touch targets and responsive behavior on mobile.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)**
