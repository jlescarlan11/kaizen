# Implementation Plan: Transaction and Budget Update Fix

## Phase 1: Research & Reproduction [checkpoint: 680a92d]
- [x] Task: Investigate backend persistence of 'spending' transactions in `TransactionRepository` and `TransactionService`. [7f785b9]
- [x] Task: Verify the API endpoint for transaction listing (`GET /api/v1/transactions`) returns 'spending' transactions. [7f785b9]
- [x] Task: Audit the frontend `TransactionList` component and Redux `transactions` slice to see if 'spending' transactions are filtered out. [7f785b9]
- [x] Task: Examine the budget update logic (trigger/hook) on transaction creation. [7f785b9]
- [x] Task: Conductor - User Manual Verification 'Research & Reproduction' (Protocol in workflow.md) [7f785b9]

## Phase 2: Backend Implementation (Fixing Persistence & Budget Sync)
- [ ] Task: **(Red Phase)** Write failing backend integration tests for creating a 'spending' transaction and its associated budget expense update.
- [ ] Task: **(Green Phase)** Fix the transaction saving logic if it's not correctly persisting 'spending' types.
- [ ] Task: **(Green Phase)** Implement/Fix the budget expense update logic (e.g., a `@Transactional` service method or JPA hook).
- [ ] Task: **(Refactor Phase)** Clean up logic and ensure code quality.
- [ ] Task: Verify backend code coverage > 80% for the changed modules.
- [ ] Task: Conductor - User Manual Verification 'Backend Implementation' (Protocol in workflow.md)

## Phase 3: Frontend Implementation (Fixing Transaction Visibility)
- [ ] Task: **(Red Phase)** Write failing frontend unit tests (Vitest) for the `transactions` slice and list component filtering.
- [ ] Task: **(Green Phase)** Fix the Redux slice or component logic to correctly include and render 'spending' transactions.
- [ ] Task: **(Refactor Phase)** Ensure UI consistency with the 'Flat UI' design system.
- [ ] Task: Verify frontend code coverage > 80% for the changed modules.
- [ ] Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md)

## Phase 4: Integration & Final Verification
- [ ] Task: Run full end-to-end flow manually (Create spending transaction -> check list -> check budget).
- [ ] Task: Ensure all tests pass in the CI pipeline (Backend & Frontend).
- [ ] Task: Final code review and cleanup.
- [ ] Task: Conductor - User Manual Verification 'Integration & Final Verification' (Protocol in workflow.md)