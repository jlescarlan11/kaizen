# Budget Unallocated Redesign

**Date:** 2026-04-23
**Status:** Design — pending user review
**Scope:** Backend budget allocation accounting + frontend budget page

## Problem

The budget page is not intuitive. There is no stable, correct indicator of "how much of my balance is still free to allocate." The current system uses a dual-accounting model that diverges from user intuition in ordinary cases:

- `UserAccount.balance` is computed live from transactions: `Σ INCOME − Σ EXPENSE`.
- `UserAccount.availableMonthly` / `availableWeekly` are persistent mutable "pools," initialized by a one-time injection of balance and mutated by income events, budget creates/updates, transfers, and period rollovers — but **not** by spending.
- The UI displays `availableMonthly + availableWeekly` under the label "Unallocated."

This produces numbers that don't match what users are thinking. The naive formula `balance − totalAllocated` also fails, because it goes negative whenever spending within a budget reduces balance — double-counting money that has already left the account.

### Example of the intended behavior

| Event | balance | Food budget (amount / expense) | expected Unallocated |
|---|---|---|---|
| Start, income of 20,000 | 20,000 | — | 20,000 |
| Allocate 15,000 to Food | 20,000 | 15,000 / 0 | 5,000 |
| Spend 15,000 on food | 5,000 | 15,000 / 15,000 | **5,000 (unchanged)** |

Spending within an allocation should not reduce "Unallocated." Only untracked spending, income deletion, or new allocations should move it.

## Design

### Core formula

```
balance        = Σ INCOME − Σ EXPENSE                (unchanged, already in UserAccount)
committed(b)   = max(0, b.amount − b.expense)          (per budget, derived)
unallocated    = balance − Σ committed(b)              (derived on every read)
```

`unallocated` is never stored. It is computed on every call to `GET /api/v1/budgets/summary`. The `max(0, …)` clamp ensures that overspending a single budget does not inflate the "committed" number; once a budget is fully spent, its commitment is 0 because the money has already left `balance`.

### What this replaces

The dual-pool model is deleted entirely:
- No `availableMonthly` / `availableWeekly` columns on `user_account`.
- No `isInitialInjectionProcessed` flag or injection logic.
- No transfer-between-pools feature.
- No period rollover logic (period resets for `budget.expense` already happen automatically via date-range filtering in `TransactionService.recalculateBudgetExpenses`).
- No separate "Monthly Pool" / "Weekly Pool" cards in the UI.

Each budget still has its own `period` (MONTHLY / WEEKLY) as a label for period-based expense tracking, but there is no separation of balance or allocation pool by period.

### Over-allocation policy

- **At create/update time:** hard block. If the new allocation would push `unallocated` below 0, return HTTP 400 with a message like `"Allocation exceeds available balance by $X."`.
- **Post-hoc drift** (e.g. user deletes an income transaction after allocating): allowed. `unallocated` goes negative. The frontend renders the number in red with a subtitle like "Over-committed by $X" and a tooltip explaining the cause. The system does not silently fix it.

Edge cases that always pass validation:
- Reducing an existing budget's amount.
- Editing a budget where `expense ≥ amount` (new commitment is 0 regardless of new amount).

## Data Model Changes

### Flyway migration

`V4__remove_budget_pools.sql` (current highest version is V3):

```sql
ALTER TABLE user_account
    DROP COLUMN available_monthly,
    DROP COLUMN available_weekly,
    DROP COLUMN is_initial_injection_processed;
```

### Entity changes — `UserAccount.java`

Delete fields and accessors (current lines 72–79):
- `availableMonthly`
- `availableWeekly`
- `isInitialInjectionProcessed`

`balance`, `version`, and all other fields remain unchanged.

## Backend Changes

### `BudgetService.java` — deletions

| Method | Lines (current) | Action |
|---|---|---|
| `refundToPool` | 122–128 | Delete |
| `deductFromPool` | 130–136 | Delete |
| `transferFunds` | 292–322 | Delete |
| `processRollover` | 325–356 | Delete |
| `processInitialInjection` | 358–366 | Delete |

Remove all call sites of `deductFromPool` / `refundToPool` inside `saveBudget`, `saveBudgetsForUser`, and `deleteAllBudgetsForUser`. The budget CRUD itself is preserved.

### `BudgetService.buildBudgetSummary` — rewrite

Replace the existing method (lines 258–290) with:

```java
private BudgetSummaryResponse buildBudgetSummary(UserAccount user, List<Budget> budgets) {
    BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();

    BigDecimal totalAllocated = BigDecimal.ZERO;
    BigDecimal totalSpent = BigDecimal.ZERO;
    BigDecimal outstandingCommitments = BigDecimal.ZERO;

    for (Budget b : budgets) {
        BigDecimal amount = b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO;
        BigDecimal expense = b.getExpense() != null ? b.getExpense() : BigDecimal.ZERO;
        totalAllocated = totalAllocated.add(amount);
        totalSpent = totalSpent.add(expense);
        outstandingCommitments = outstandingCommitments
            .add(amount.subtract(expense).max(BigDecimal.ZERO));
    }

    BigDecimal unallocated = balance.subtract(outstandingCommitments);

    int allocationPercentage = balance.compareTo(BigDecimal.ZERO) > 0
        ? totalAllocated.multiply(BigDecimal.valueOf(100))
            .divide(balance, 0, RoundingMode.HALF_UP).intValue()
        : 0;

    return new BudgetSummaryResponse(
        balance, totalAllocated, totalSpent, unallocated, allocationPercentage, budgets.size()
    );
}
```

### `TransactionService.java` — deletion

Remove the INCOME branch that mutates `availableMonthly` (current lines 146–149):

```java
// DELETE:
if (saved.getType() == TransactionType.INCOME) {
    account.setAvailableMonthly(account.getAvailableMonthly().add(saved.getAmount()));
}
```

Income now affects only `balance` via `recalculateUserBalance`, which already runs.

### `BudgetSummaryResponse.java` — new shape

```java
public record BudgetSummaryResponse(
    BigDecimal balance,
    BigDecimal totalAllocated,
    BigDecimal totalSpent,
    BigDecimal unallocated,
    int allocationPercentage,
    long budgetCount
) {}
```

Dropped fields: `availableMonthly`, `availableWeekly`, `remainingToAllocate`, and the legacy secondary constructor.

### `BudgetController.java` — deletion

Remove the transfer endpoint (`POST /api/v1/budgets/transfer` or equivalent) and its controller method.

### `BudgetValidationService.java` — new method

```java
public void validateAllocationFits(UserAccount user, BudgetPeriod period,
                                    BigDecimal newAmount, Long budgetIdBeingEdited) {
    BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();
    List<Budget> budgets = budgetRepository.findAllByUserId(user.getId());

    BigDecimal outstandingExcludingThis = BigDecimal.ZERO;
    BigDecimal thisExpense = BigDecimal.ZERO;

    for (Budget b : budgets) {
        BigDecimal amount = b.getAmount() != null ? b.getAmount() : BigDecimal.ZERO;
        BigDecimal expense = b.getExpense() != null ? b.getExpense() : BigDecimal.ZERO;
        if (budgetIdBeingEdited != null && b.getId().equals(budgetIdBeingEdited)) {
            thisExpense = expense;
            continue;
        }
        outstandingExcludingThis = outstandingExcludingThis
            .add(amount.subtract(expense).max(BigDecimal.ZERO));
    }

    BigDecimal newCommitment = newAmount.subtract(thisExpense).max(BigDecimal.ZERO);
    BigDecimal projectedUnallocated = balance
        .subtract(outstandingExcludingThis)
        .subtract(newCommitment);

    if (projectedUnallocated.compareTo(BigDecimal.ZERO) < 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            String.format("Allocation exceeds available balance by %s.",
                projectedUnallocated.abs())
        );
    }
}
```

Call from:
- `BudgetService.saveBudget` — before persist, for create and update.
- `BudgetService.saveBudgetsForUser` — validate the full batch as a set. Before the loop, precompute per-category expected `expense` for the target period (same date-range query used by `recalculateBudgetExpenses`). Then verify `Σ max(0, new_amount − expected_expense) ≤ balance`. If not, throw 400 identifying the offending batch rather than any single item.

## Frontend Changes

All paths under `frontend/src/features/budgets/`.

### `BudgetsPage.tsx`

Replace the "Monthly Pool" / "Weekly Pool" / "Plan Capacity" cards (current lines ~263–301) with three cards:

1. **Balance** — `summary.balance`.
2. **Allocated** — `summary.totalAllocated`, secondary line: `"{allocationPercentage}% of balance"`.
3. **Unallocated** — `summary.unallocated`.
   - Positive: neutral styling, subtitle `"available"`.
   - Negative: red styling, subtitle `"Over-committed by ${|unallocated|}"`, tooltip: *"Your allocations exceed available balance. Reduce a budget or add income to resolve."*

The `allocationEmpty` check (current line 241) changes from
`availableMonthly === 0 && availableWeekly === 0` → `unallocated <= 0`.

### `BudgetDetailPage.tsx`

Remove the ternary at lines 152–153 that picks between `availableMonthly` and `availableWeekly` by period. If the page surfaces a "remaining to allocate" figure, use `summary.unallocated`.

### `ManualBudgetSetupPage.tsx`

Line 299: `availablePoolBalance` now derives from `summary.unallocated`, not the per-period pool. Rename the prop to `unallocated` in the setup page component and any component that receives it.

### `components/TransferFundsModal.tsx`

Delete the file. Delete the Transfer button and its click handler in `BudgetsPage.tsx`. Delete the corresponding RTK Query / API client mutation.

### Type updates

In `frontend/src/app/store/api/budgetApi.ts` (lines 37, 38, 41), update the `BudgetSummaryResponse` type:
- Remove: `availableMonthly`, `availableWeekly`, `remainingToAllocate`.
- Add: `unallocated: number`.

TypeScript will flag all consumers. Expect hits in at least: `BudgetsPage.tsx`, `BudgetDetailPage.tsx`, `ManualBudgetSetupPage.tsx`, `OnboardingBudgetStep.tsx`, and `components/TransferFundsModal.tsx` (the latter being deleted).

### Error surfacing on budget form

Wherever the budget create/edit form lives, catch HTTP 400 from the save mutation and render the returned message inline beneath the amount field. The backend message is already user-friendly.

## Testing

### Backend unit tests

`BudgetServiceTest.buildBudgetSummary`:

| Scenario | balance | budgets (amount / expense) | expected unallocated |
|---|---|---|---|
| No budgets | 20,000 | — | 20,000 |
| Single unspent budget | 20,000 | 15,000 / 0 | 5,000 |
| Spending within budget (regression guard) | 5,000 | 15,000 / 15,000 | 5,000 |
| Partial spend | 19,000 | 15,000 / 1,000 | 5,000 |
| Overspent budget | 4,000 | 15,000 / 16,000 | 4,000 |
| Spending outside any budget | 19,000 | 15,000 / 0 | 4,000 |
| Post-hoc drift | 10,000 | 15,000 / 0 | −5,000 |
| Multiple budgets, mixed spend | 20,000 | [10k/5k, 5k/0] | 10,000 |

`BudgetValidationServiceTest.validateAllocationFits`:

- Create budget that fits → passes.
- Create budget that exceeds balance → throws 400 with correct shortfall value.
- Update budget downward → passes even if unallocated is currently negative.
- Update budget upward within headroom → passes.
- Update budget upward beyond headroom → throws 400.
- `saveBudgetsForUser` with a batch collectively over-committing (each item individually fine) → throws on offending item.
- Edit a budget where `expense > amount` → new commitment is 0, always fits.

### Backend integration test

End-to-end: create account → add income transaction → create budget → add expense within budget → verify `GET /api/v1/budgets/summary` returns stable `unallocated`. Then delete the income transaction and verify `unallocated` goes negative with the correct magnitude.

### Migration test

Verify the Flyway migration runs cleanly against a database snapshot that contains the old columns. Rollback is manual (recreate columns if needed); acceptable because column data is derived.

### Frontend tests

- `BudgetsPage` renders Balance, Allocated, Unallocated cards with values from the new DTO.
- Unallocated card applies red styling and "Over-committed" subtitle when `unallocated < 0`.
- Budget create/edit form surfaces a 400 error message inline under the amount field.
- No tests for `TransferFundsModal` — file is deleted.

### Tests to remove or rewrite

- Any test asserting on `availableMonthly`, `availableWeekly`, or `remainingToAllocate` — rewrite against `unallocated`.
- Tests for `processInitialInjection`, `processRollover`, `transferFunds`, `deductFromPool`, `refundToPool` — delete.

## Out of Scope

- Multi-currency support.
- Historical "what was my unallocated on date X" queries.
- Budget categories without a period (all budgets remain either MONTHLY or WEEKLY).
- Savings goals as a separate concept from budgets.
- Any changes to how `budget.expense` is computed (already correct via date-range filtering).
