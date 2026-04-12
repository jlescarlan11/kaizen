# Design Document: Remove Reconcile Feature

**Status**: Draft
**Date**: 2026-04-12
**Design Depth**: Standard
**Task Complexity**: Medium

## 1. Problem Statement

The "reconcile" feature is being removed to simplify the user experience and reduce technical debt. Currently, it allows users to adjust their account balance by creating a special `RECONCILIATION` transaction type. However, this has led to complex SQL queries, special handling in the frontend, and potential balance inconsistencies if users misuse the feature. 

Removing the feature's entire footprint (database, backend, and frontend) will lead to a cleaner, more maintainable codebase and a more straightforward user experience.

*Rationale*: The user prefers a complete cleanup of historical data and code for long-term health.

---

## 2. Requirements

### Functional Requirements
- **FR1**: Users can no longer access the "Reconcile" modal or trigger a reconciliation.
- **FR2**: The account balance must be correctly calculated based only on income and expense transactions.
- **FR3**: All existing reconciliation records in the database must be deleted.

### Non-Functional Requirements
- **NFR1**: Database performance should be maintained or improved by simplifying complex queries.
- **NFR2**: The frontend bundle size should be reduced by removing the reconciliation modal and its dependencies.

### Constraints
- **C1**: Must handle potential balance shifts for users who have used reconciliation in the past.
- **C2**: Must ensure no broken references in the UI (e.g., in the transaction list or export).

---

## 3. Approach (Selected Approach: Complete Removal)

### Selected Approach: Comprehensive Cleanup
- **Backend**: Delete all reconciliation transactions, remove the `reconciliation_increase` flag, and refactor queries.
- **Frontend**: Remove the "Reconcile" button, modal, and related state.
- **Migration**: A Flyway migration will handle the database changes.

*Rationale*: This approach eliminates all technical debt and simplifies the application's core logic. It was chosen over "Gradual Deprecation" to ensure a cleaner codebase.

### Decision Matrix

| Criterion | Weight | Complete Removal | Gradual Deprecation |
|-----------|--------|------------------|---------------------|
| Code Cleanliness | 40% | 5: Total removal of dead code | 2: Leaves legacy debt |
| Performance | 20% | 5: Faster queries/smaller bundle | 3: No change |
| Data Integrity | 20% | 3: Potential balance shifts | 5: Preserves all history |
| Implementation Effort | 20% | 3: Requires migration & refactoring | 5: Simple UI removal |
| **Weighted Total** | | **4.2** | **3.2** |

---

## 4. Architecture

### Backend Refactoring
- **TransactionRepository**: Refactor `calculateNetTransactionAmount` and other queries to remove `RECONCILIATION` logic.
- **TransactionService**: Delete `reconcileBalance` and simplify `recalculateUserBalance`.
- **TransactionController**: Remove the `POST /reconcile` endpoint.
- **Entity**: Remove `reconciliationIncrease` from `Transaction.java` and `RECONCILIATION` from `TransactionType.java`.

### Frontend Refactoring
- **transactionApi**: Remove `reconcileBalance` mutation and `ReconciliationRequest` interface.
- **UI Components**: Delete `ReconciliationModal.tsx` and remove its usage from `TransactionListPage.tsx`.
- **Utilities**: Update `transactionUtils.ts` to remove reconciliation-specific logic in `calculateBalance`.
- **Export**: Remove the reconciliation filter from `exportAssembly.ts`.

---

## 5. Risk Assessment

- **R1: Data Loss** (High Impact, Low Likelihood): Users may have relied on reconciliation to "fix" their balance. Deleting these transactions will cause a one-time balance shift.
- **R2: Query Regression** (Medium Impact, Low Likelihood): Refactoring complex SQL queries could introduce bugs or performance regressions if not properly tested.
- **R3: Broken References** (Low Impact, Low Likelihood): There might be undiscovered dependencies on the `RECONCILIATION` transaction type in other parts of the app.

---

## 6. Success Criteria

- [ ] All "Reconcile" UI elements are removed from the frontend.
- [ ] The `RECONCILIATION` transaction type is deleted from the database and enums.
- [ ] Existing reconciliation records are removed, and the balance reflects this.
- [ ] No compilation or runtime errors in both frontend and backend.
- [ ] SQL queries in `TransactionRepository` are simplified and verified.
