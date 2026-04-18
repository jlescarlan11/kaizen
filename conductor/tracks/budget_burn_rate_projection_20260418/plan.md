# Implementation Plan: Budget Burn Rate and Projection

## Phase 1: Backend Calculations and Endpoint Updates [checkpoint: a11a498]
- [x] Task: Extend Budget Summary DTOs [a11a498]
    - [x] Add `burnRate` (BigDecimal) to response DTO.
    - [x] Add `dailyAllowance` (BigDecimal) to response DTO.
    - [x] Add `projectedTotal` (BigDecimal) to response DTO.
    - [x] Add `daysElapsed` (Integer) to response DTO.
    - [x] Add `daysLeft` (Integer) to response DTO.
- [x] Task: Write Unit Tests for Budget Projections (TDD - Red Phase) [a11a498]
    - [x] Create/Update tests in `BudgetServiceTest.java` (or equivalent).
    - [x] Test calculation for `daysElapsed` < 3 (should return null/indicator values).
    - [x] Test calculation for normal mid-month (e.g. 15th day).
    - [x] Test calculation when user is overbudget (daily allowance can be zero or negative).
    - [x] Verify UTC time logic is used for day boundaries.
- [x] Task: Implement Budget Projections Logic (TDD - Green Phase) [a11a498]
    - [x] Update `BudgetService` to calculate `daysElapsed`, `daysLeft`, `burnRate`, `dailyAllowance`, `projectedTotal`.
    - [x] Ensure UTC `LocalDate` is used for day calculations against the current month.
    - [x] Ensure the calculated fields map to the updated endpoint response.
- [x] Task: Conductor - User Manual Verification 'Backend Calculations and Endpoint Updates' (Protocol in workflow.md) [a11a498]

## Phase 2: Frontend Types and State Management
- [ ] Task: Update Frontend Budget Types
    - [ ] Add `burnRate`, `dailyAllowance`, `projectedTotal`, `daysElapsed`, `daysLeft` to the frontend `Budget` interface/type.
- [ ] Task: Write Tests for Frontend Budget State (TDD - Red Phase)
    - [ ] Create tests to verify the API response is correctly parsed into state.
- [ ] Task: Implement Frontend Logic Updates (TDD - Green Phase)
    - [ ] Ensure API client/store slice is fully aware of the new fields.
- [ ] Task: Conductor - User Manual Verification 'Frontend Types and State Management' (Protocol in workflow.md)

## Phase 3: Frontend UI Implementation
- [ ] Task: Update Budget Card Component (TDD - Red Phase)
    - [ ] Write component tests verifying the appearance of the "Overbudget" badge.
    - [ ] Write tests verifying the "Insights" collapsible section.
    - [ ] Write tests verifying the metrics display "—" when insufficient data.
- [ ] Task: Implement Budget Card UI (TDD - Green Phase)
    - [ ] Add an "Overbudget" badge on the card when `spent > limit`.
    - [ ] Add a collapsible "Insights" section to `BudgetCard`.
    - [ ] Display "Burn Rate", "Daily Allowance", and "Projected Total" inside the section.
    - [ ] Apply amber styling to `projectedTotal` if `projectedTotal > limit`.
    - [ ] Apply red styling to `projectedTotal` if `spent > limit`.
    - [ ] Show "—" when data is missing or `daysElapsed < 3`.
- [ ] Task: Conductor - User Manual Verification 'Frontend UI Implementation' (Protocol in workflow.md)