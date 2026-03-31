# Implementation Plan: UI/UX Refinement for /transactions

This track focuses on updating the UI/UX of the `/transactions` page to match the authenticated home page's "flat" design, removing the total balance, and adding money flow metrics (Incoming vs. Outgoing) with a visual ratio indicator.

## Phase 1: Data Logic & Calculations
Implement the core logic for calculating money flow metrics from transaction data.

- [x] Task: Add `calculateMoneyFlow` to `frontend/src/features/transactions/utils/transactionUtils.ts` 9b105de
    - [x] Define `MoneyFlowMetrics` interface.
    - [x] Implement calculation logic: `incoming` (INCOME, INITIAL_BALANCE, positive RECONCILIATION) vs. `outgoing` (EXPENSE, negative RECONCILIATION).
    - [x] Calculate the ratio for visualization.
- [x] Task: Create unit tests for `calculateMoneyFlow` in `frontend/src/features/transactions/utils/__tests__/transactionUtils.test.ts` 9b105de
    - [x] Test with various transaction types.
    - [x] Test with empty transaction list.
    - [x] Test with only income or only expenses.

## Phase 2: Money Flow Components
Create the visual components for displaying the money flow metrics.

- [x] Task: Create `MoneyFlowDisplay` component in `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx` ff80f77
    - [x] Display "Incoming" and "Outgoing" totals using `formatCurrency`.
    - [x] Implement a horizontal progress bar showing the ratio of incoming vs. outgoing.
    - [x] Style it to match the "flat" design system (neutral colors, clean lines).
    - [x] Ensure mobile responsiveness.
- [x] Task: Create `MoneyFlowDisplay.test.tsx` to verify rendering and ratio calculation. ff80f77

## Phase 3: Transaction List Page Refactoring
Update the main `/transactions` page to adopt the new UI and features.

- [x] Task: Modify `frontend/src/features/transactions/TransactionListPage.tsx` aff84ac
    - [x] Remove the current "Total Balance" card and associated logic.
    - [x] Update the header to mirror the `HomePage.tsx` style (vertical stack, large typography).
    - [x] Integrate the `MoneyFlowDisplay` component, passing it the `processedTransactions` from the pipeline.
    - [x] Refine the layout spacing (using `space-y-7` or similar as seen in `HomePage.tsx`).
    - [x] Ensure the "Reconcile", "Export", and "View History" buttons are repositioned/styled appropriately for the new header.
- [x] Task: Refine Search/Filter/Sort UI aff84ac
    - [x] Adjust the positioning and styling of `TransactionSearch`, `TransactionFilter`, and `TransactionSort` to be more integrated and less cluttered.
    - [x] Match the "flat" card style for the controls if applicable.

## Phase 4: Verification & Polish
Finalize the implementation and ensure high quality.

- [x] Task: Verify TDD workflow 0105d81
    - [x] Ensure all new tests pass.
    - [x] Run linting and type checks.
- [x] Task: Conductor - User Manual Verification 'UI/UX Refinement' (Protocol in workflow.md) cef2780
    - [x] Manual verification on desktop.
    - [x] Manual verification on mobile (responsive layout).
    - [x] Verify search/filter correctly updates the money flow metrics.

[checkpoint: a13e5eb] [checkpoint: a031160] [checkpoint: bc984f5]
