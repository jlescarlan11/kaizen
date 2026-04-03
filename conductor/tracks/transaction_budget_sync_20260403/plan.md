# Implementation Plan: Transaction and Budget Update Fix

## Phase 1: Research & Reproduction [checkpoint: 680a92d]
- [x] Task: Investigate backend persistence of 'spending' transactions in `TransactionRepository` and `TransactionService`. [7f785b9]
- [x] Task: Verify the API endpoint for transaction listing (`GET /api/v1/transactions`) returns 'spending' transactions. [7f785b9]
- [x] Task: Audit the frontend `TransactionList` component and Redux `transactions` slice to see if 'spending' transactions are filtered out. [7f785b9]
- [x] Task: Examine the budget update logic (trigger/hook) on transaction creation. [7f785b9]
- [x] Task: Conductor - User Manual Verification 'Research & Reproduction' (Protocol in workflow.md) [7f785b9]

## Phase 2: Backend Implementation (Fixing Persistence & Budget Sync) [checkpoint: 8b303ca]
- [x] Task: **(Red Phase)** Write failing backend integration tests for creating a 'spending' transaction and its associated budget expense update. [50cd77c]
- [x] Task: **(Green Phase)** Fix the transaction saving logic if it's not correctly persisting 'spending' types. [7f785b9]
- [x] Task: **(Green Phase)** Implement/Fix the budget expense update logic (e.g., a `@Transactional` service method or JPA hook). [7f785b9]
- [x] Task: **(Refactor Phase)** Clean up logic and ensure code quality. [7f785b9]
- [x] Task: Verify backend code coverage > 80% for the changed modules. [7f785b9]
- [x] Task: Conductor - User Manual Verification 'Backend Implementation' (Protocol in workflow.md) [7f785b9]

## Phase 3: Frontend Implementation (Fixing Transaction Visibility) [checkpoint: f38ff6c]
- [x] Task: **(Red Phase)** Write failing frontend unit tests (Vitest) for the `transactions` slice and list component filtering. [01a7c54]
- [x] Task: **(Green Phase)** Fix the Redux slice or component logic to correctly include and render 'spending' transactions. [01a7c54]
- [x] Task: **(Refactor Phase)** Ensure UI consistency with the 'Flat UI' design system. [01a7c54]
- [x] Task: Verify frontend code coverage > 80% for the changed modules. [01a7c54]
- [x] Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md) [01a7c54]

## Phase 4: Integration & Final Verification
- [x] Task: Run full end-to-end flow manually (Create spending transaction -> check list -> check budget). [7f785b9]
- [x] Task: Ensure all tests pass in the CI pipeline (Backend & Frontend). [7f785b9]
- [x] Task: Final code review and cleanup. [7f785b9]
- [x] Task: Conductor - User Manual Verification 'Integration & Final Verification' (Protocol in workflow.md) [7f785b9]