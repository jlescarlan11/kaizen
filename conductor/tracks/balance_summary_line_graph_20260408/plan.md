# Implementation Plan: Balance Summary Line Graph

This plan outlines the steps to implement an interactive line graph in the Balance Summary page, visualizing Income, Expenses, and Net Balance trends.

## User Review Required

> [!IMPORTANT]
> The current `getSpendingTrends` backend service only supports `WEEKLY` and `MONTHLY` aggregations and only returns a single total. We will implement a new `getBalanceTrends` service to support `DAILY` and `MONTHLY` granularity with a full breakdown (Income, Expenses, Net Balance).

## Proposed Phases

### Phase 1: Backend - Balance Trend API [checkpoint: a530d19]
- [x] Task: Balance Trend DTOs and Logic 27ef1fb
    - [x] Create `BalanceTrendResponse` record in `com.kaizen.backend.insights.dto`.
    - [x] Update `TransactionRepository` with enhanced trend data query.
    - [x] Implement `InsightsService.getBalanceTrends` to handle `DAILY` and `MONTHLY` aggregation of Inflows, Outflows, and Net Balance.
- [x] Task: Balance Trend Controller 27ef1fb
    - [x] Implement the `GET /api/v1/insights/balance-trends` endpoint in `InsightsController`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend - Balance Trend API' (Protocol in workflow.md)

### Phase 2: Frontend - API and Types [checkpoint: b7ee13f]
- [x] Task: Define Frontend Types 4ab2a83
    - [x] Add `BalanceTrendEntry` and `BalanceTrendSeries` types to `frontend/src/features/insights/types.ts`.
- [x] Task: Update insightsApi 4ab2a83
    - [x] Add `getBalanceTrends` query to `frontend/src/app/store/api/insightsApi.ts`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend - API and Types' (Protocol in workflow.md)

### Phase 3: Frontend - UI Components [checkpoint: 6004099]
- [x] Task: TDD - BalanceTrendChart Component f5eb713
    - [x] Create `frontend/src/features/insights/components/BalanceTrendChart.tsx`.
    - [x] Implement the chart using **Recharts** with three lines (Income, Expenses, Net Balance).
    - [x] Add Granularity Toggle (Daily/Monthly) to the chart container.
    - [x] Implement interactive tooltips with detailed formatting.
- [x] Task: Integration - Balance Summary Page f5eb713
    - [x] Integrate `BalanceTrendChart` into `frontend/src/features/insights/BalanceSummaryPage.tsx`.
    - [x] Ensure the chart uses the "Current Year" as the default range.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Frontend - UI Components' (Protocol in workflow.md)

### Phase 4: Refinement and Polish [checkpoint: 6004099]
- [x] Task: Responsive Design & Style f5eb713
    - [x] Verify chart responsiveness on mobile.
    - [x] Align colors and typography with the **Flat UI** design system.
- [x] Task: Final Quality Gate f5eb713
    - [x] Run `npm run lint` and `npm run check`.
    - [x] Verify test coverage for new components. (Skipped: Project is test-free)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Refinement and Polish' (Protocol in workflow.md)
