# Implementation Plan: Balance Summary Line Graph

This plan outlines the steps to implement an interactive line graph in the Balance Summary page, visualizing Income, Expenses, and Net Balance trends.

## User Review Required

> [!IMPORTANT]
> The current `getSpendingTrends` backend service only supports `WEEKLY` and `MONTHLY` aggregations and only returns a single total. We will implement a new `getBalanceTrends` service to support `DAILY` and `MONTHLY` granularity with a full breakdown (Income, Expenses, Net Balance).

## Proposed Phases

### Phase 1: Backend - Balance Trend API
- [ ] Task: TDD - Balance Trend DTOs and Logic
    - [ ] Write unit tests for `InsightsService.getBalanceTrends` in `InsightsServiceTest.java`.
    - [ ] Create `BalanceTrendResponse` record in `com.kaizen.backend.insights.dto`.
    - [ ] Implement `InsightsService.getBalanceTrends` to handle `DAILY` and `MONTHLY` aggregation of both Inflows and Outflows.
- [ ] Task: TDD - Balance Trend Controller
    - [ ] Write integration tests for `GET /api/v1/insights/balance-trends` in `InsightsControllerTest.java`.
    - [ ] Implement the endpoint in `InsightsController`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend - Balance Trend API' (Protocol in workflow.md)

### Phase 2: Frontend - API and Types
- [ ] Task: Define Frontend Types
    - [ ] Add `BalanceTrendEntry` and `BalanceTrendSeries` types to `frontend/src/features/insights/types.ts`.
- [ ] Task: Update insightsApi
    - [ ] Add `getBalanceTrends` query to `frontend/src/app/store/api/insightsApi.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend - API and Types' (Protocol in workflow.md)

### Phase 3: Frontend - UI Components
- [ ] Task: TDD - BalanceTrendChart Component
    - [ ] Create `frontend/src/features/insights/components/BalanceTrendChart.tsx`.
    - [ ] Implement the chart using **Recharts** with three lines (Income, Expenses, Net Balance).
    - [ ] Add Granularity Toggle (Daily/Monthly) to the chart container.
    - [ ] Implement interactive tooltips with detailed formatting.
- [ ] Task: Integration - Balance Summary Page
    - [ ] Integrate `BalanceTrendChart` into `frontend/src/features/insights/BalanceSummaryPage.tsx`.
    - [ ] Ensure the chart uses the "Current Year" as the default range.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend - UI Components' (Protocol in workflow.md)

### Phase 4: Refinement and Polish
- [ ] Task: Responsive Design & Style
    - [ ] Verify chart responsiveness on mobile.
    - [ ] Align colors and typography with the **Flat UI** design system.
- [ ] Task: Final Quality Gate
    - [ ] Run `npm run lint` and `npm run check`.
    - [ ] Verify test coverage for new components.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Refinement and Polish' (Protocol in workflow.md)
