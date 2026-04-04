# Track Plan: remove_duplicates_and_income_safeguards_20260404

## Phase 1: Cleanup & Removal (Duplicate Feature) [checkpoint: 3e25276]
- [x] Task: Remove "Duplicate" feature from the Backend. 23809f8
    - [x] Identify and delete any duplication-related logic in `TransactionService.java` (if any).
    - [x] Remove any tests specifically verifying duplication.
- [x] Task: Remove "Duplicate" feature from the Frontend. c3016bc
    - [x] Modify `TransactionDetailPage.tsx` to remove `handleDuplicate`.
    - [x] Update `TransactionActionGroup.tsx` and its tests to remove the `onDuplicate` prop and button.
    - [x] Update `TransactionEntryForm.tsx` to remove `duplicateFrom` logic.
    - [x] Update `ReminderRedirectHandler.tsx` to remove `duplicateFrom` usage.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Cleanup & Removal' (Protocol in workflow.md)

## Phase 2: Database Migration Merge
- [ ] Task: Consolidate Flyway migrations.
    - [ ] Combine `V1` through `V5` into a single `V1__Initial_Schema.sql` in `backend/src/main/resources/db/migration`.
    - [ ] Ensure all schema updates (UNIQUE indexes, NOT NULL constraints, new columns like `budget.expense`) are baseline.
    - [ ] Delete files `V2`, `V3`, `V4`, and `V5`.
    - [ ] Update `transaction` table in `V1` to make `payment_method_id` NOT NULL.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Database Migration Merge' (Protocol in workflow.md)

## Phase 3: Backend Implementation (Safeguards & Mandatory PM)
- [ ] Task: Update `Transaction` entity and schema.
    - [ ] Update `Transaction.java` and `TransactionRequest.java` to make `paymentMethodId` mandatory.
- [ ] Task: Implement Spending Safeguard in `TransactionService`.
    - [ ] Write failing integration tests to verify that an `EXPENSE` exceeding the payment method's balance is rejected.
    - [ ] Implement balance validation logic in `createTransaction` and `updateTransaction`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Backend Implementation' (Protocol in workflow.md)

## Phase 4: Frontend Implementation (Safeguards & UI Feedback)
- [ ] Task: Update Transaction UI for Mandatory Payment Method and Balance Feedback.
    - [ ] Update `TransactionEntryForm.tsx` to require Payment Method and show real-time "Available Balance".
    - [ ] Add frontend validation to block saves that exceed available balance.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend Implementation' (Protocol in workflow.md)

## Phase 5: Final Cleanup & Push
- [ ] Task: Run all tests and linting.
- [ ] Task: Commit and Push changes.
