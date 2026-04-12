# Specification: Transaction and Budget Update Fix

## Overview
This track addresses two critical bugs in the money flow analysis system:
1. **Missing Transactions:** "Spending" transactions are not appearing in the transaction list, despite correctly deducting from the account balance.
2. **Budget Sync Failure:** Expense transactions are not updating the 'expense' total in their associated budgets.

## Functional Requirements
- **Transaction Visibility:** Ensure "spending" transactions are persisted correctly and retrieved by the frontend list view.
- **Budget Synchronization:** Implement or fix the trigger/logic that increments a budget's `expense` field when a relevant transaction is created.
- **Data Integrity:** Maintain consistency between Transaction records, Account balances, and Budget expense totals.

## Non-Functional Requirements
- **Test-Driven Development:** Follow the project's Red/Green/Refactor workflow.
- **Code Coverage:** Maintain >80% coverage for the fix.

## Acceptance Criteria
- [ ] A new "spending" transaction successfully reduces the account balance.
- [ ] The "spending" transaction is visible in the frontend transaction list.
- [ ] The associated budget's `expense` total increases by the exact amount of the transaction.
- [ ] Existing "spending" transactions (if any) are correctly listed.
- [ ] Automated tests for these flows pass in both backend (JUnit/Spring) and frontend (Vitest).

## Out of Scope
- UI/UX redesign of the transaction list or budget views.
- Performance optimization of the budget calculation (unless necessary for the fix).