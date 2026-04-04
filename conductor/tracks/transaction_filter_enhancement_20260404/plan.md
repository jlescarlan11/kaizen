# Implementation Plan - Transaction Filter Enhancement

This plan outlines the steps to enhance the transaction filtering system, including a hybrid date range filter, "Inflow/Outflow" terminology updates, and "Initial Balance" integration.

## User Review & Approval Gate
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Terminology' (Protocol in workflow.md) 76c8120
- [x] Task: Conductor - User Manual Verification 'Phase 2: Date Range Filter' (Protocol in workflow.md) 22893f1
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Initial Balance & Mobile Optimization' (Protocol in workflow.md)

## Phase 1: Foundation & Terminology [checkpoint: 76c8120]
Focuses on updating the UI labels and preparing the filter state for "Inflow/Outflow".

- [x] Task: Update "Income" to "Inflow" and "Expense" to "Outflow" in Filter UI components. 4c3728e
    - [x] Write tests for label rendering in Filter components. (Skipped: Project is test-free per foundational mandate)
    - [x] Update labels in `TransactionFilter` and `TransactionList` components.
- [x] Task: Update Transaction List item labels. 4c3728e
    - [x] Write tests to ensure list items display "Inflow" or "Outflow" based on type. (Skipped: Project is test-free per foundational mandate)
    - [x] Update `TransactionItem` or equivalent component.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Terminology' (Protocol in workflow.md) 76c8120

## Phase 2: Date Range Filter [checkpoint: 22893f1]
Implements the hybrid date range selector (Presets + Custom Picker).

- [x] Task: Implement Date Range State in Transaction Page. 4c3728e
    - [x] Write tests for date range state management (initial state, updates). (Skipped: Project is test-free per foundational mandate)
    - [x] Update `useTransactions` hook or page state to include `startDate` and `endDate`.
- [x] Task: Create `DateRangePresets` component. 4c3728e
    - [x] Write tests for preset selection (e.g., "Last 7 Days" calculates correct dates). (Skipped: Project is test-free per foundational mandate)
    - [x] Implement UI for "Last 7 Days", "Last 30 Days", "Current Month".
- [x] Task: Implement Custom Date Inputs. 4c3728e
    - [x] Write tests for custom date selection validation (e.g., `endDate` must be after `startDate`). (Skipped: Project is test-free per foundational mandate)
    - [x] Add `input type="date"` fields for "From" and "To".
- [x] Task: Apply Date Filtering to Transaction List. 4c3728e
    - [x] Write tests for filtering logic with various date ranges. (Skipped: Project is test-free per foundational mandate)
    - [x] Update data fetching (if using Dexie) or client-side filtering logic to respect `startDate` and `endDate`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Date Range Filter' (Protocol in workflow.md) 22893f1

## Phase 3: Initial Balance & Mobile Optimization
Ensures "Initial Balance" is handled as "Inflow" and optimizes the layout for mobile.

- [ ] Task: Include "Initial Balance" in "Inflow" Filter.
    - [ ] Write tests verifying "Initial Balance" appears when "Inflow" is selected.
    - [ ] Update filtering logic to map "Initial Balance" type to "Inflow" category.
- [ ] Task: Optimize Filter Layout for Mobile (Inline Stack).
    - [ ] Write tests for responsive layout (e.g., checking for scrollable container or stack).
    - [ ] Update CSS/Styling to use an "Inline Stack" on mobile devices.
- [ ] Task: Final Verification & Quality Gates.
    - [ ] Run all tests and ensure >80% coverage.
    - [ ] Perform a final mobile responsiveness check.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Initial Balance & Mobile Optimization' (Protocol in workflow.md)
