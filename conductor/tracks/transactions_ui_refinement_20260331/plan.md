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

- [ ] Task: Create `MoneyFlowDisplay` component in `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx`
    - [ ] Display "Incoming" and "Outgoing" totals using `formatCurrency`.
    - [ ] Implement a horizontal progress bar showing the ratio of incoming vs. outgoing.
    - [ ] Style it to match the "flat" design system (neutral colors, clean lines).
    - [ ] Ensure mobile responsiveness.
- [ ] Task: Create `MoneyFlowDisplay.test.tsx` to verify rendering and ratio calculation.

## Phase 3: Transaction List Page Refactoring
Update the main `/transactions` page to adopt the new UI and features.

- [ ] Task: Modify `frontend/src/features/transactions/TransactionListPage.tsx`
    - [ ] Remove the current "Total Balance" card and associated logic.
    - [ ] Update the header to mirror the `HomePage.tsx` style (vertical stack, large typography).
    - [ ] Integrate the `MoneyFlowDisplay` component, passing it the `processedTransactions` from the pipeline.
    - [ ] Refine the layout spacing (using `space-y-7` or similar as seen in `HomePage.tsx`).
    - [ ] Ensure the "Reconcile", "Export", and "View History" buttons are repositioned/styled appropriately for the new header.
- [ ] Task: Refine Search/Filter/Sort UI
    - [ ] Adjust the positioning and styling of `TransactionSearch`, `TransactionFilter`, and `TransactionSort` to be more integrated and less cluttered.
    - [ ] Match the "flat" card style for the controls if applicable.

## Phase 4: Verification & Polish
Finalize the implementation and ensure high quality.

- [ ] Task: Verify TDD workflow
    - [ ] Ensure all new tests pass.
    - [ ] Run linting and type checks.
- [ ] Task: Conductor - User Manual Verification 'UI/UX Refinement' (Protocol in workflow.md)
    - [ ] Manual verification on desktop.
    - [ ] Manual verification on mobile (responsive layout).
    - [ ] Verify search/filter correctly updates the money flow metrics.

[checkpoint: <sha>]
