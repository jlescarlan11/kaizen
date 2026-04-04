# Track Specification: Remove Duplicates & Income Safeguards

## 1. Overview
Streamline the transaction management system by removing the "Duplicate" feature (backend/frontend), consolidating database migrations, and introducing a payment-method-aware income tracking system with strict spending limits.

## 2. Functional Requirements
- **Remove Duplication Logic:**
  - **Frontend:** Remove the "Duplicate" button/action from the Transaction List and Detail views.
  - **Backend:** Delete any backend duplication logic (if found) and all associated unit/integration tests.
- **Migration Consolidation:**
  - Merge existing Flyway migration files (`V1` to `V5`) into a single baseline migration (`V1__Initial_Schema.sql`).
- **Income Breakdown & Spending Safeguard:**
  - Add a mandatory `paymentMethod` field to all transactions.
  - Supported Methods: `CASH`, `BANK_DEBIT_CARD`, `CREDIT_CARD`, `DIGITAL_WALLET`.
  - **Income Assignment:** All incoming funds must specify a destination payment method.
  - **Strict Safeguard:** Prevent saving any expense transaction if the amount exceeds the available balance (Total Income - Total Expenses) for the selected payment method.
  - **UI Feedback:** Display real-time "Available Balance" for the selected payment method on the transaction creation form.

## 3. Technical Requirements
- Update `Transaction` entity/schema to include `payment_method` as NOT NULL.
- Implement a validation service to check balances before persisting expenses.
- Refactor existing tests to reflect the removal of duplication and the addition of balance checks.

## 4. Acceptance Criteria
- [ ] No "Duplicate" button exists in the UI.
- [ ] Backend duplication tests are removed; new validation tests pass.
- [ ] Flyway migrations are merged and the system boots from a single file.
- [ ] Transactions cannot be saved if they exceed the specific payment method's balance.

## 5. Out of Scope
- Inter-method transfers (e.g., ATM withdrawals moving Bank -> Cash).
- Retroactive balance correction for legacy data (assume new/reset state).
