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

## Phase 2: Database Migration Merge [checkpoint: 649cff8]
- [x] Task: Consolidate Flyway migrations.
    - [x] Combine `V1` through `V5` into a single `V1__Initial_Schema.sql` in `backend/src/main/resources/db/migration`.
    - [x] Ensure all schema updates (UNIQUE indexes, NOT NULL constraints, new columns like `budget.expense`) are baseline.
    - [x] Delete files `V2`, `V3`, `V4`, and `V5`.
    - [x] Update `transaction` table in `V1` to make `payment_method_id` NOT NULL.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Database Migration Merge' (Protocol in workflow.md)

## Phase 3: Backend Implementation (Safeguards & Mandatory PM) [checkpoint: 732a215]
- [x] Task: Update `Transaction` entity and schema. 0f3f50d
    - [x] Update `Transaction.java` and `TransactionRequest.java` to make `paymentMethodId` mandatory.
- [x] Task: Implement Spending Safeguard in `TransactionService`. f962548
    - [x] Write failing integration tests to verify that an `EXPENSE` exceeding the payment method's balance is rejected. (SKIPPED: No Tests Mandate)
    - [x] Implement balance validation logic in `createTransaction` and `updateTransaction`.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Backend Implementation' (Protocol in workflow.md) 732a215

## Phase 4: Frontend Implementation (Safeguards & UI Feedback) [checkpoint: 9cfcc2c]
- [x] Task: Update Transaction UI for Mandatory Payment Method and Balance Feedback. c703df2
    - [x] Update `TransactionEntryForm.tsx` to require Payment Method and show real-time "Available Balance".
    - [x] Add frontend validation to block saves that exceed available balance.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Frontend Implementation' (Protocol in workflow.md) 9cfcc2c

## Phase 5: Final Cleanup & Push
- [ ] Task: Run all tests and linting.
- [ ] Task: Commit and Push changes.
