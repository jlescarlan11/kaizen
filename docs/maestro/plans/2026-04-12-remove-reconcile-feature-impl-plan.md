# Implementation Plan: Remove Reconcile Feature

**Status**: Approved
**Date**: 2026-04-12
**Task Complexity**: Medium

## Plan Overview
This plan outlines the steps for a complete removal of the "reconcile" feature from the Kaizen application. The removal will be coordinated across the database, backend service layer, and frontend UI components.

- **Total Phases**: 4
- **Agents Involved**: `data_engineer`, `coder`, `technical_writer`, `code_reviewer`
- **Estimated Effort**: Medium

---

## Dependency Graph

```
Phase 1: Database & Entity Cleanup
    |
Phase 2: Backend Logic & Repo Refactoring
    |
Phase 3: Frontend UI & Utility Cleanup
    |
Phase 4: Docs & Final Validation
```

---

## Execution Strategy Table

| Phase | Description | Agent | Parallel | Blocked By |
|-------|-------------|-------|----------|------------|
| 1 | Database & Entity Cleanup | `data_engineer` | No | - |
| 2 | Backend Logic & Repo Refactoring | `coder` | No | 1 |
| 3 | Frontend UI & Utility Cleanup | `coder` | No | 2 |
| 4 | Docs & Final Validation | `technical_writer` | No | 3 |

---

## Phase Details

### Phase 1: Database & Entity Cleanup
**Objective**: Prepare the database schema and enums for the removal of reconciliation.

- **Agent**: `data_engineer`
- **Files to Create**:
  - `backend/src/main/resources/db/migration/V20260412001__remove_reconciliation.sql`: Script to delete reconciliation transactions and drop the `reconciliation_increase` column.
- **Files to Modify**:
  - `backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java`: Remove `RECONCILIATION` enum value.
  - `backend/src/main/java/com/kaizen/backend/transaction/entity/Transaction.java`: Remove `reconciliationIncrease` field and its JPA mapping.
  - `frontend/src/app/store/api/transactionApi.ts`: Remove `RECONCILIATION` from the `TransactionType` union/enum definition.
- **Validation**:
  - Run `./mvnw flyway:migrate` and verify no errors.
  - Compile backend to ensure no broken references to the deleted enum or field.

### Phase 2: Backend Logic & Repo Refactoring
**Objective**: Remove the business logic and refactor complex queries in the backend.

- **Agent**: `coder`
- **Files to Modify**:
  - `backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java`: Remove `CASE` statements for `reconciliationIncrease` in `calculateNetTransactionAmount` and other queries.
  - `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java`: Delete `reconcileBalance` method; update `recalculateUserBalance` to remove reconciliation handling.
  - `backend/src/main/java/com/kaizen/backend/transaction/controller/TransactionController.java`: Remove `POST /reconcile` endpoint.
- **Validation**:
  - Run `./mvnw test` to ensure all transaction tests pass without reconciliation.
  - Verify that the balance recalculation logic still works correctly for standard income/expenses.

### Phase 3: Frontend UI & Utility Cleanup
**Objective**: Remove all UI components and utility logic related to reconciliation.

- **Agent**: `coder`
- **Files to Delete**:
  - `frontend/src/features/transactions/components/ReconciliationModal.tsx`: Delete the component file.
- **Files to Modify**:
  - `frontend/src/app/store/api/transactionApi.ts`: Remove `reconcileBalance` mutation and `ReconciliationRequest` interface.
  - `frontend/src/features/transactions/TransactionListPage.tsx`: Remove "Reconcile" button, `isReconcileModalOpen` state, and the `ReconciliationModal` component usage.
  - `frontend/src/features/transactions/utils/transactionUtils.ts`: Update `calculateBalance` to remove reconciliation-specific logic.
  - `frontend/src/features/transactions/export/exportAssembly.ts`: Remove the filter that excludes `RECONCILIATION` transactions from export.
- **Validation**:
  - Run `npm run test` (Vitest) to ensure frontend logic remains sound.
  - Verify the Transaction List Page renders correctly without the "Reconcile" button.

### Phase 4: Documentation & Final Validation
**Objective**: Update project documentation and perform a final end-to-end check.

- **Agent**: `technical_writer`
- **Files to Modify**:
  - `instruction.md`: Remove mentions of the reconciliation form.
  - `docs/superpowers/plans/2026-04-11-initial-balance-as-income.md`: Update SQL query examples to remove reconciliation logic.
- **Validation**:
  - Review all updated documentation for accuracy.
  - Perform a final manual check of the application to ensure no ghost UI or broken links.

---

## File Inventory

| Action | Path | Phase | Purpose |
|--------|------|-------|---------|
| Create | `backend/src/main/resources/db/migration/V20260412001__remove_reconciliation.sql` | 1 | Schema & data cleanup |
| Modify | `backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java` | 1 | Enum cleanup |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/entity/Transaction.java` | 1 | Entity cleanup |
| Modify | `frontend/src/app/store/api/transactionApi.ts` | 1 | Type cleanup |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java` | 2 | Query simplification |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java` | 2 | Logic removal |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/controller/TransactionController.java` | 2 | Endpoint removal |
| Delete | `frontend/src/features/transactions/components/ReconciliationModal.tsx` | 3 | Component removal |
| Modify | `frontend/src/features/transactions/TransactionListPage.tsx` | 3 | UI removal |
| Modify | `frontend/src/features/transactions/utils/transactionUtils.ts` | 3 | Utility cleanup |
| Modify | `frontend/src/features/transactions/export/exportAssembly.ts` | 3 | Export cleanup |
| Modify | `instruction.md` | 4 | Documentation cleanup |

---

## Execution Profile
- Total phases: 4
- Parallelizable phases: 0 (The changes are highly sequential and dependent on each other's outputs)
- Sequential-only phases: 4
- Estimated sequential wall time: 2-3 hours

---

## Plan-Level Cost Summary

| Phase | Agent | Model | Est. Input | Est. Output | Est. Cost |
|-------|-------|-------|-----------|------------|----------|
| 1 | `data_engineer` | Flash | 5,000 | 1,000 | $0.01 |
| 2 | `coder` | Flash | 8,000 | 2,000 | $0.02 |
| 3 | `coder` | Flash | 10,000 | 2,500 | $0.03 |
| 4 | `technical_writer` | Flash | 5,000 | 1,000 | $0.01 |
| **Total** | | | **28,000** | **6,500** | **$0.07** |
