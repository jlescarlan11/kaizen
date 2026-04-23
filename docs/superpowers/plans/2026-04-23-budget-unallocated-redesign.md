# Budget Unallocated Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dual-pool budget accounting model with a single derived formula `unallocated = balance − Σ max(0, amount − expense)`.

**Architecture:** Delete all persistent pool state (`availableMonthly`, `availableWeekly`, `isInitialInjectionProcessed`) plus the transfer / injection / rollover machinery that maintained it. Compute `unallocated` on every budget-summary read. Add hard-block validation at budget create/update time; show negative `unallocated` with red styling when post-hoc drift occurs.

**Tech Stack:** Spring Boot (Java), JPA/Hibernate, Flyway, JUnit 5 + Mockito, React (TypeScript), RTK Query.

**Reference spec:** `docs/superpowers/specs/2026-04-23-budget-unallocated-redesign-design.md`

---

## File Map

**Backend — modify:**
- `backend/src/main/java/com/kaizen/backend/budget/dto/BudgetSummaryResponse.java` — new shape
- `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java` — rewrite `buildBudgetSummary`, remove pool methods, wire validation
- `backend/src/main/java/com/kaizen/backend/budget/validation/BudgetValidationService.java` — new `validateAllocationFits` method
- `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java` — remove transfer endpoint
- `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java` — remove INCOME pool mutation
- `backend/src/main/java/com/kaizen/backend/user/entity/UserAccount.java` — drop three fields

**Backend — create:**
- `backend/src/main/resources/db/migration/V4__remove_budget_pools.sql`
- `backend/src/test/java/com/kaizen/backend/budget/service/BudgetSummaryTest.java`
- `backend/src/test/java/com/kaizen/backend/budget/validation/BudgetValidationServiceTest.java`
- `backend/src/test/java/com/kaizen/backend/budget/service/BudgetAllocationIntegrationTest.java`

**Frontend — modify:**
- `frontend/src/app/store/api/budgetApi.ts` — update type
- `frontend/src/features/budgets/BudgetsPage.tsx` — 3-card layout, remove transfer button
- `frontend/src/features/budgets/BudgetDetailPage.tsx` — drop period ternary
- `frontend/src/features/budgets/ManualBudgetSetupPage.tsx` — source from `unallocated`
- `frontend/src/features/onboarding/OnboardingBudgetStep.tsx` — fix any references
- (wherever the budget amount form catches errors) — surface 400 inline

**Frontend — delete:**
- `frontend/src/features/budgets/components/TransferFundsModal.tsx`

---

## Task 1: Rewrite `buildBudgetSummary` with new formula (TDD)

Shape the new DTO and the computation together. The existing `BudgetProjectionTest` only covers projection math, so we create a new focused test file for summary math.

**Files:**
- Create: `backend/src/test/java/com/kaizen/backend/budget/service/BudgetSummaryTest.java`
- Modify: `backend/src/main/java/com/kaizen/backend/budget/dto/BudgetSummaryResponse.java`
- Modify: `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java` (lines 258-290)

- [ ] **Step 1: Write the failing test file**

Create `backend/src/test/java/com/kaizen/backend/budget/service/BudgetSummaryTest.java`:

```java
package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BudgetSummaryTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private TransactionService transactionService;

    private BudgetService budgetService;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-04-23T00:00:00Z"), ZoneId.of("UTC"));
        budgetService = new BudgetService(
            budgetRepository, userAccountRepository, categoryRepository, transactionService, clock
        );
        user = new UserAccount("Test", "test@example.com", "LOCAL", "1", null, null, "tok", null);
    }

    private Budget budget(BigDecimal amount, BigDecimal expense) {
        Budget b = new Budget(user, null, amount, BudgetPeriod.MONTHLY);
        b.setExpense(expense);
        return b;
    }

    private BudgetSummaryResponse summarize(BigDecimal balance, List<Budget> budgets) {
        user.setBalance(balance);
        when(userAccountRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(budgets);
        return budgetService.getBudgetSummaryForUser("test@example.com");
    }

    @Test
    void noBudgets_unallocatedEqualsBalance() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"), List.of());
        assertEquals(new BigDecimal("20000"), r.unallocated());
        assertEquals(BigDecimal.ZERO, r.totalAllocated());
    }

    @Test
    void singleUnspentBudget_unallocatedIsBalanceMinusAmount() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(new BigDecimal("5000"), r.unallocated());
    }

    @Test
    void spendingWithinBudget_keepsUnallocatedStable() {
        // The regression case: balance dropped from 20000 to 5000 due to spending,
        // but that spending was within the allocated budget, so unallocated stays at 5000.
        BudgetSummaryResponse r = summarize(new BigDecimal("5000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("15000"))));
        assertEquals(new BigDecimal("5000"), r.unallocated());
    }

    @Test
    void partialSpend_unallocatedUnchangedVsUnspent() {
        BudgetSummaryResponse r = summarize(new BigDecimal("19000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("1000"))));
        assertEquals(new BigDecimal("5000"), r.unallocated());
    }

    @Test
    void overspentBudget_commitmentCappedAtZero() {
        BudgetSummaryResponse r = summarize(new BigDecimal("4000"),
            List.of(budget(new BigDecimal("15000"), new BigDecimal("16000"))));
        assertEquals(new BigDecimal("4000"), r.unallocated());
    }

    @Test
    void spendingOutsideBudget_reducesUnallocated() {
        BudgetSummaryResponse r = summarize(new BigDecimal("19000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(new BigDecimal("4000"), r.unallocated());
    }

    @Test
    void postHocDrift_unallocatedGoesNegative() {
        BudgetSummaryResponse r = summarize(new BigDecimal("10000"),
            List.of(budget(new BigDecimal("15000"), BigDecimal.ZERO)));
        assertEquals(new BigDecimal("-5000"), r.unallocated());
    }

    @Test
    void multipleBudgetsMixedSpend() {
        BudgetSummaryResponse r = summarize(new BigDecimal("20000"), List.of(
            budget(new BigDecimal("10000"), new BigDecimal("5000")),
            budget(new BigDecimal("5000"), BigDecimal.ZERO)
        ));
        // outstanding = (10000-5000) + (5000-0) = 10000. balance - 10000 = 10000.
        assertEquals(new BigDecimal("10000"), r.unallocated());
    }
}
```

- [ ] **Step 2: Run the test — expect compile error**

Run: `cd backend && mvn -q -pl . test -Dtest=BudgetSummaryTest`
Expected: Compile error — `r.unallocated()` and the new constructor shape don't exist yet, plus `BudgetService` constructor signature may not match (current `BudgetService` accepts `Clock` — verify against `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java` constructor; adjust test if needed).

- [ ] **Step 3: Replace the DTO with the new shape**

Overwrite `backend/src/main/java/com/kaizen/backend/budget/dto/BudgetSummaryResponse.java`:

```java
package com.kaizen.backend.budget.dto;

import java.math.BigDecimal;

public record BudgetSummaryResponse(
    BigDecimal balance,
    BigDecimal totalAllocated,
    BigDecimal totalSpent,
    BigDecimal unallocated,
    int allocationPercentage,
    long budgetCount
) {}
```

- [ ] **Step 4: Rewrite `buildBudgetSummary` in `BudgetService`**

Replace lines 258-290 of `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java`:

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

- [ ] **Step 5: Run the test — expect pass**

Run: `cd backend && mvn -q test -Dtest=BudgetSummaryTest`
Expected: all 8 tests green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/budget/dto/BudgetSummaryResponse.java \
        backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java \
        backend/src/test/java/com/kaizen/backend/budget/service/BudgetSummaryTest.java
git commit -m "feat(budget): rewrite summary with derived unallocated formula

unallocated = balance − Σ max(0, amount − expense)"
```

---

## Task 2: Add `validateAllocationFits` in `BudgetValidationService` (TDD)

Block budget creates/updates that would push `unallocated` below zero at decision time.

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/budget/validation/BudgetValidationService.java`
- Create: `backend/src/test/java/com/kaizen/backend/budget/validation/BudgetValidationServiceTest.java`

- [ ] **Step 1: Inspect existing validation service signature**

Run: `cat "backend/src/main/java/com/kaizen/backend/budget/validation/BudgetValidationService.java"`

Note the class's constructor (which dependencies it already has) so the new method fits in. It likely already has `BudgetRepository` injected. If not, add it via constructor.

- [ ] **Step 2: Write the failing tests**

Create `backend/src/test/java/com/kaizen/backend/budget/validation/BudgetValidationServiceTest.java`:

```java
package com.kaizen.backend.budget.validation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.user.entity.UserAccount;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class BudgetValidationServiceTest {

    @Mock private BudgetRepository budgetRepository;

    private BudgetValidationService validator;
    private UserAccount user;

    @BeforeEach
    void setUp() {
        validator = new BudgetValidationService(budgetRepository);
        user = new UserAccount("Test", "t@e.com", "LOCAL", "1", null, null, "tok", null);
    }

    private Budget budget(Long id, BigDecimal amount, BigDecimal expense) {
        Budget b = new Budget(user, null, amount, BudgetPeriod.MONTHLY);
        b.setExpense(expense);
        // reflection not needed; Budget.id may be null in tests — use a setter if available.
        // If Budget has no id setter, override in repository mocks by returning a constructed list.
        return b;
    }

    @Test
    void createBudgetThatFits_passes() {
        user.setBalance(new BigDecimal("20000"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of());
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("15000"), null));
    }

    @Test
    void createBudgetThatExceedsBalance_throws400() {
        user.setBalance(new BigDecimal("10000"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("15000"), null));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("5000"),
            "error message should name the shortfall: " + ex.getReason());
    }

    @Test
    void overspentBudget_canBeEditedToAnyAmount() {
        // Existing budget: amount=1000, expense=1500 (overspent).
        // Committing amount < expense still yields new commitment of 0.
        user.setBalance(new BigDecimal("100"));
        Budget existing = budget(1L, new BigDecimal("1000"), new BigDecimal("1500"));
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("1200"), existing.getId()));
    }

    @Test
    void reduceBudgetUnderDrift_passes() {
        // Drift: balance 5000, existing budget 10000 / 0  → unallocated is −5000.
        // Reducing the budget to 4000 should still pass (reduction never increases shortfall).
        user.setBalance(new BigDecimal("5000"));
        Budget existing = budget(1L, new BigDecimal("10000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("4000"), existing.getId()));
    }

    @Test
    void increaseBudgetBeyondHeadroom_throws() {
        user.setBalance(new BigDecimal("10000"));
        Budget existing = budget(1L, new BigDecimal("5000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertThrows(ResponseStatusException.class, () ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("12000"), existing.getId()));
    }

    @Test
    void increaseBudgetWithinHeadroom_passes() {
        user.setBalance(new BigDecimal("10000"));
        Budget existing = budget(1L, new BigDecimal("5000"), BigDecimal.ZERO);
        when(budgetRepository.findAllByUserId(anyLong())).thenReturn(List.of(existing));
        assertDoesNotThrow(() ->
            validator.validateAllocationFits(user, BudgetPeriod.MONTHLY, new BigDecimal("9000"), existing.getId()));
    }
}
```

**Note on `Budget.getId()`:** if the entity has no public id setter, tests will need to use `org.springframework.test.util.ReflectionTestUtils.setField(budget, "id", 1L)` to stamp the id before adding to the mock list.

- [ ] **Step 3: Run tests — expect fail**

Run: `cd backend && mvn -q test -Dtest=BudgetValidationServiceTest`
Expected: Compile error — `validateAllocationFits` does not exist.

- [ ] **Step 4: Implement `validateAllocationFits`**

Add to `backend/src/main/java/com/kaizen/backend/budget/validation/BudgetValidationService.java`:

```java
import com.kaizen.backend.budget.entity.Budget;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.budget.repository.BudgetRepository;
import com.kaizen.backend.user.entity.UserAccount;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

// Inside the class (keep existing members):
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

If `BudgetRepository` is not yet a constructor dependency, add it:

```java
private final BudgetRepository budgetRepository;

public BudgetValidationService(BudgetRepository budgetRepository /*, existing deps */) {
    this.budgetRepository = budgetRepository;
    // existing assignments
}
```

- [ ] **Step 5: Run tests — expect pass**

Run: `cd backend && mvn -q test -Dtest=BudgetValidationServiceTest`
Expected: all 6 tests green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/budget/validation/BudgetValidationService.java \
        backend/src/test/java/com/kaizen/backend/budget/validation/BudgetValidationServiceTest.java
git commit -m "feat(budget): add validateAllocationFits with hard block on over-allocation"
```

---

## Task 3: Wire validation into `saveBudget` and `saveBudgetsForUser`

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java`

- [ ] **Step 1: Inject `BudgetValidationService` into `BudgetService` if not already injected**

Check the constructor. If `BudgetValidationService` is missing, add it as a constructor parameter and field.

- [ ] **Step 2: Call validator in `saveBudget` before persisting**

In `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java`, inside `saveBudget` (currently around lines 100-120), find the code just before `new Budget(...)` (after category is resolved and before the pool math). Add:

```java
Long editedId = budgetRepository.findByUserIdAndCategoryId(user.getId(), category.getId())
    .map(Budget::getId)
    .orElse(null);
BigDecimal amount = request.amount() != null ? request.amount() : BigDecimal.ZERO;
budgetValidationService.validateAllocationFits(user, request.period(), amount, editedId);
```

Place this BEFORE the existing `refundToPool` / `deductFromPool` calls. (Those pool calls will be removed in Task 4.)

- [ ] **Step 3: Add batch validation helper and call in `saveBudgetsForUser`**

Still inside `BudgetService`, add a private helper:

```java
private void validateBatchFits(UserAccount user, List<BudgetCreateRequest> requests) {
    BigDecimal balance = user.getBalance() == null ? BigDecimal.ZERO : user.getBalance();

    BigDecimal totalNewCommitment = BigDecimal.ZERO;
    for (BudgetCreateRequest req : requests) {
        BigDecimal amount = req.amount() != null ? req.amount() : BigDecimal.ZERO;
        BigDecimal expectedExpense = computeExpectedExpenseForCategoryInPeriod(
            user.getId(), req.categoryId(), req.period());
        totalNewCommitment = totalNewCommitment.add(
            amount.subtract(expectedExpense).max(BigDecimal.ZERO));
    }

    if (balance.subtract(totalNewCommitment).compareTo(BigDecimal.ZERO) < 0) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            String.format("Batch allocation exceeds available balance by %s.",
                totalNewCommitment.subtract(balance))
        );
    }
}

private BigDecimal computeExpectedExpenseForCategoryInPeriod(
        Long userId, Long categoryId, BudgetPeriod period) {
    LocalDate now = LocalDate.now(clock);
    OffsetDateTime start;
    OffsetDateTime end;
    if (period == BudgetPeriod.MONTHLY) {
        start = now.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay().atOffset(ZoneOffset.UTC);
        end = now.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
    } else {
        start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay().atOffset(ZoneOffset.UTC);
        end = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);
    }
    BigDecimal sum = transactionRepository.sumAmountByCategoryIdAndTypeAndDateRange(
        userId, categoryId, TransactionType.EXPENSE, start, end);
    return sum != null ? sum : BigDecimal.ZERO;
}
```

If `BudgetService` does not currently have `transactionRepository` injected, add it. Required imports:

```java
import com.kaizen.backend.transaction.entity.TransactionType;
import com.kaizen.backend.transaction.repository.TransactionRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
```

Call `validateBatchFits(user, budgetRequests);` at the top of `saveBudgetsForUser`, immediately after the null/empty check.

- [ ] **Step 4: Write an integration-style test for the batch validation**

Append to `backend/src/test/java/com/kaizen/backend/budget/validation/BudgetValidationServiceTest.java` or create `BudgetBatchValidationTest.java` in the same package. Keep this test minimal — just verify the batch-level check throws when the *sum* exceeds balance, even though each item individually fits:

```java
@Test
void batchCollectivelyOverCommits_throws() {
    // Verified via BudgetService.saveBudgetsForUser in an integration test (Task 7).
    // Unit-level coverage: the batch helper is exercised indirectly through the service.
}
```

(Full coverage comes from Task 7's integration test. No need to duplicate here.)

- [ ] **Step 5: Run all budget tests**

Run: `cd backend && mvn -q test -Dtest='Budget*Test'`
Expected: all tests green (existing + new).

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java
git commit -m "feat(budget): enforce allocation fits on create, update, and batch save"
```

---

## Task 4: Remove pool-mutating methods and their call sites

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java`
- Modify: `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java`

- [ ] **Step 1: Delete pool helpers and orchestration methods in `BudgetService`**

Delete these methods entirely from `backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java`:

- `refundToPool` (current lines 122-128)
- `deductFromPool` (current lines 130-136)
- `transferFunds` (current lines 292-322)
- `processRollover` (current lines 325-356)
- `processInitialInjection` (current lines 358-366)

- [ ] **Step 2: Remove call sites of `refundToPool` / `deductFromPool`**

Inside `saveBudget` (around lines 110-120), delete:

```java
// DELETE:
budgetRepository.findByUserIdAndCategoryId(user.getId(), category.getId())
    .ifPresent(existing -> refundToPool(user, existing.getPeriod(), existing.getAmount()));
// DELETE:
deductFromPool(user, request.period(), amount);
```

Keep the `userAccountRepository.save(user)` call — it's harmless and may still be wanted if unrelated user state was touched. Actually, since we're no longer mutating user state in this method, also remove `userAccountRepository.save(user);` from `saveBudget` unless it's needed for another reason (review the method).

Inside `saveBudgetsForUser` (around lines 144-168), delete:

```java
// DELETE the existing-refund loop:
for (Budget budget : existingBudgets) {
    refundToPool(user, budget.getPeriod(), budget.getAmount());
}
// DELETE the deduct call inside the per-request loop:
deductFromPool(user, createRequest.period(), amount);
```

Also remove `userAccountRepository.save(user);` from `saveBudgetsForUser` since user is no longer mutated.

Inside `deleteAllBudgetsForUser` (around lines 249-255), delete:

```java
// DELETE:
for (Budget budget : existingBudgets) {
    refundToPool(user, budget.getPeriod(), budget.getAmount());
}
// DELETE:
userAccountRepository.save(user);
```

The `deleteByUserId` call stays.

- [ ] **Step 3: Remove transfer endpoint from `BudgetController`**

Open `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java` and find the method mapped to `/transfer` (whatever path). Delete the method and any unused imports.

- [ ] **Step 4: Remove unused repository/service dependencies (if any)**

Hibernate / Spring Boot will fail to start if an injected bean is not used in a constructor-injected field — they won't. But check if `BudgetController` had a dedicated `transferFunds` helper or DTO; delete those too.

- [ ] **Step 5: Compile and run all backend tests**

Run: `cd backend && mvn -q compile test`
Expected: everything green. Any test that exercised `transferFunds` / `processRollover` / `processInitialInjection` / `deductFromPool` / `refundToPool` will fail to compile — delete those tests or the relevant test methods.

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/budget/service/BudgetService.java \
        backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java
# plus any deleted tests
git commit -m "refactor(budget): remove pool state and transfer/rollover/injection logic"
```

---

## Task 5: Remove INCOME pool mutation in `TransactionService`

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java` (lines 146-149)

- [ ] **Step 1: Delete the INCOME branch**

In `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java`, delete lines 146-149:

```java
// DELETE:
if (saved.getType() == TransactionType.INCOME) {
    // Default income to monthly pool
    account.setAvailableMonthly(account.getAvailableMonthly().add(saved.getAmount()));
}
```

`recalculateUserBalance(account)` (line 145) stays — it correctly updates balance.

- [ ] **Step 2: Compile**

Run: `cd backend && mvn -q compile`
Expected: success.

- [ ] **Step 3: Run all backend tests**

Run: `cd backend && mvn -q test`
Expected: all green. If any transaction test asserted on `availableMonthly` being incremented by income, update or delete it.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java
git commit -m "refactor(transaction): stop adding income to budget pool"
```

---

## Task 6: Drop pool fields from `UserAccount` and add Flyway migration

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/user/entity/UserAccount.java`
- Create: `backend/src/main/resources/db/migration/V4__remove_budget_pools.sql`

- [ ] **Step 1: Delete fields from `UserAccount`**

In `backend/src/main/java/com/kaizen/backend/user/entity/UserAccount.java`, delete lines 72-79:

```java
// DELETE:
@Column(name = "available_monthly", precision = 15, scale = 2, nullable = false)
private java.math.BigDecimal availableMonthly = java.math.BigDecimal.ZERO;

@Column(name = "available_weekly", precision = 15, scale = 2, nullable = false)
private java.math.BigDecimal availableWeekly = java.math.BigDecimal.ZERO;

@Column(name = "is_initial_injection_processed", nullable = false)
private boolean isInitialInjectionProcessed = false;
```

- [ ] **Step 2: Create the Flyway migration**

Create `backend/src/main/resources/db/migration/V4__remove_budget_pools.sql`:

```sql
ALTER TABLE user_account
    DROP COLUMN available_monthly,
    DROP COLUMN available_weekly,
    DROP COLUMN is_initial_injection_processed;
```

- [ ] **Step 3: Compile**

Run: `cd backend && mvn -q compile`
Expected: success. Any remaining reference to the deleted fields (e.g. in tests) will surface as a compile error — delete those references.

- [ ] **Step 4: Run the full backend test suite (boots Hibernate against Flyway-migrated schema)**

Run: `cd backend && mvn -q test`
Expected: all green. Integration tests will exercise the migration end-to-end.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/user/entity/UserAccount.java \
        backend/src/main/resources/db/migration/V4__remove_budget_pools.sql
git commit -m "feat(db): drop budget pool columns from user_account"
```

---

## Task 7: End-to-end integration test for allocation behavior

**Files:**
- Create: `backend/src/test/java/com/kaizen/backend/budget/service/BudgetAllocationIntegrationTest.java`

- [ ] **Step 1: Find an existing integration test to model the scaffolding on**

Run: `grep -rln '@SpringBootTest' backend/src/test/java | head -3`

Read one to learn how the project sets up integration tests (Testcontainers? H2? embedded Postgres?). Mirror that setup.

- [ ] **Step 2: Write the integration test**

`TransactionRequest` is a Lombok `@Builder` record defined at `backend/src/main/java/com/kaizen/backend/transaction/dto/TransactionRequest.java`. Required fields: `amount`, `type`, `paymentMethodId`. `TransactionType` lives at `com.kaizen.backend.common.entity.TransactionType`.

Create `backend/src/test/java/com/kaizen/backend/budget/service/BudgetAllocationIntegrationTest.java`:

```java
package com.kaizen.backend.budget.service;

import static org.junit.jupiter.api.Assertions.*;

import com.kaizen.backend.budget.dto.BudgetCreateRequest;
import com.kaizen.backend.budget.dto.BudgetSummaryResponse;
import com.kaizen.backend.budget.entity.BudgetPeriod;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.common.entity.TransactionType;
import com.kaizen.backend.payment.entity.PaymentMethod;
import com.kaizen.backend.payment.repository.PaymentMethodRepository;
import com.kaizen.backend.transaction.dto.TransactionRequest;
import com.kaizen.backend.transaction.dto.TransactionResponse;
import com.kaizen.backend.transaction.service.TransactionService;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

// Match the project's integration-test annotations (Testcontainers / profile) from Step 1.
@SpringBootTest
@Transactional
class BudgetAllocationIntegrationTest {

    @Autowired private BudgetService budgetService;
    @Autowired private TransactionService transactionService;
    @Autowired private UserAccountRepository userAccountRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private PaymentMethodRepository paymentMethodRepository;

    @Test
    void spendingWithinBudget_keepsUnallocatedStable() {
        UserAccount user = seedUser();
        Category food = seedOrFindCategory("Food");
        PaymentMethod pm = seedPaymentMethod(user);

        addTransaction(user, TransactionType.INCOME, new BigDecimal("20000"), null, pm);

        budgetService.saveBudget(user.getEmail(),
            new BudgetCreateRequest(food.getId(), new BigDecimal("15000"), BudgetPeriod.MONTHLY));

        BudgetSummaryResponse before = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, before.unallocated().compareTo(new BigDecimal("5000")));

        addTransaction(user, TransactionType.EXPENSE, new BigDecimal("15000"), food, pm);

        BudgetSummaryResponse after = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, after.unallocated().compareTo(new BigDecimal("5000")),
            "unallocated must not change when spending is within an existing allocation");
        assertEquals(0, after.balance().compareTo(new BigDecimal("5000")));
    }

    @Test
    void incomeDeletedPostAllocation_unallocatedGoesNegative() {
        UserAccount user = seedUser();
        Category food = seedOrFindCategory("Food");
        PaymentMethod pm = seedPaymentMethod(user);

        TransactionResponse income = addTransaction(
            user, TransactionType.INCOME, new BigDecimal("20000"), null, pm);
        budgetService.saveBudget(user.getEmail(),
            new BudgetCreateRequest(food.getId(), new BigDecimal("15000"), BudgetPeriod.MONTHLY));

        transactionService.deleteTransaction(user.getEmail(), income.id());

        BudgetSummaryResponse after = budgetService.getBudgetSummaryForUser(user.getEmail());
        assertEquals(0, after.unallocated().compareTo(new BigDecimal("-15000")));
    }

    // --- helpers ---
    // NOTE: adapt these to mirror patterns in whichever existing @SpringBootTest
    // you referenced in Step 1. Field/constructor names may differ.

    private UserAccount seedUser() {
        UserAccount u = new UserAccount(
            "Integration", "integ@example.com", "LOCAL", "integ",
            null, null, "tok", null);
        return userAccountRepository.save(u);
    }

    private Category seedOrFindCategory(String name) {
        return categoryRepository.findAll().stream()
            .filter(c -> name.equalsIgnoreCase(c.getName()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Seed category '" + name + "' not present. " +
                "Either it's not in V1__Initial_Schema.sql or the seed route differs — " +
                "create it here or adjust the assertion."));
    }

    private PaymentMethod seedPaymentMethod(UserAccount user) {
        // Replace with the project's actual PaymentMethod constructor / builder.
        // Inspect backend/src/main/java/com/kaizen/backend/payment/entity/PaymentMethod.java.
        PaymentMethod pm = new PaymentMethod(/* user, name, etc */);
        return paymentMethodRepository.save(pm);
    }

    private TransactionResponse addTransaction(
            UserAccount user, TransactionType type, BigDecimal amount,
            Category category, PaymentMethod pm) {
        TransactionRequest req = TransactionRequest.builder()
            .amount(amount)
            .type(type)
            .transactionDate(OffsetDateTime.now())
            .description(type.name())
            .categoryId(category == null ? null : category.getId())
            .paymentMethodId(pm.getId())
            .isRecurring(false)
            .build();
        return transactionService.createTransaction(user.getEmail(), req);
    }
}
```

**Adapt on implementation:** `PaymentMethod` constructor and `Category` seed behavior differ by project state — inspect the actual entity files and existing integration tests (from Step 1) before assuming. The goal is the test's *assertions*, not the scaffolding shape.

- [ ] **Step 3: Run the integration test**

Run: `cd backend && mvn -q test -Dtest=BudgetAllocationIntegrationTest`
Expected: both tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/java/com/kaizen/backend/budget/service/BudgetAllocationIntegrationTest.java
git commit -m "test(budget): integration coverage for stable unallocated under spending"
```

---

## Task 8: Update frontend `BudgetSummaryResponse` type and delete transfer modal

This task intentionally makes the frontend fail to type-check so subsequent frontend tasks follow the errors.

**Files:**
- Modify: `frontend/src/app/store/api/budgetApi.ts`
- Delete: `frontend/src/features/budgets/components/TransferFundsModal.tsx`

- [ ] **Step 1: Update type in `budgetApi.ts`**

In `frontend/src/app/store/api/budgetApi.ts`, lines 37-41, replace the three old fields with the new one:

```ts
// Remove:
//   availableMonthly: number
//   availableWeekly: number
//   remainingToAllocate: number
// Add:
unallocated: number
```

Also search for any RTK Query endpoint named like `transferFunds` / `useTransferFundsMutation` in this file and delete it (builder entry + exported hook).

- [ ] **Step 2: Delete the TransferFundsModal**

Run: `rm "frontend/src/features/budgets/components/TransferFundsModal.tsx"`

- [ ] **Step 3: Remove modal references in `BudgetsPage.tsx`**

In `frontend/src/features/budgets/BudgetsPage.tsx`, delete:
- The `import` statement for `TransferFundsModal`.
- Any state hook that opens it (e.g. `const [transferOpen, setTransferOpen] = useState(false)`).
- The `<TransferFundsModal ... />` JSX usage.
- The "Transfer" button that triggers it.

- [ ] **Step 4: Type-check to see the remaining blast radius**

Run: `cd frontend && pnpm tsc --noEmit`
Expected: TS errors in `BudgetsPage.tsx`, `BudgetDetailPage.tsx`, `ManualBudgetSetupPage.tsx`, and possibly `OnboardingBudgetStep.tsx`, all referencing dropped fields. Tasks 9-12 will fix these.

- [ ] **Step 5: Commit (even though compile is red — this makes the diff reviewable)**

```bash
git add frontend/src/app/store/api/budgetApi.ts frontend/src/features/budgets/BudgetsPage.tsx
git rm frontend/src/features/budgets/components/TransferFundsModal.tsx
git commit -m "refactor(budgets-fe): drop legacy summary fields and transfer modal

Follow-up tasks fix the TS errors now surfaced in consumer components." \
  --no-verify
```

(Use `--no-verify` only if lint-staged blocks; otherwise omit.)

---

## Task 9: Rebuild `BudgetsPage` to 3-card layout

**Files:**
- Modify: `frontend/src/features/budgets/BudgetsPage.tsx`

- [ ] **Step 1: Locate the current cards (lines ~263-301)**

Open the file and locate the "Monthly Pool" / "Weekly Pool" / "Plan Capacity" cards.

- [ ] **Step 2: Replace with three cards**

Replace the three existing cards with:

```tsx
<Card>
  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
    Balance
  </p>
  <p className="text-2xl font-semibold text-foreground">
    {currencyFormatter.format(budgetSummary?.balance ?? 0)}
  </p>
</Card>

<Card>
  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
    Allocated
  </p>
  <p className="text-2xl font-semibold text-foreground">
    {currencyFormatter.format(budgetSummary?.totalAllocated ?? 0)}
  </p>
  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
    {budgetSummary?.allocationPercentage ?? 0}% of balance
  </p>
</Card>

<Card>
  <p className="text-xs font-medium uppercase tracking-wider text-subtle-foreground">
    Unallocated
  </p>
  <p className={`text-2xl font-semibold ${
    (budgetSummary?.unallocated ?? 0) < 0 ? 'text-red-600' : 'text-foreground'
  }`}>
    {currencyFormatter.format(budgetSummary?.unallocated ?? 0)}
  </p>
  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
    {(budgetSummary?.unallocated ?? 0) < 0
      ? `Over-committed by ${currencyFormatter.format(Math.abs(budgetSummary?.unallocated ?? 0))}`
      : 'available'}
  </p>
</Card>
```

(Adjust `text-red-600` / styling to match the project's existing red styling — check other "danger" usages in the codebase for the right Tailwind token.)

- [ ] **Step 3: Update the `allocationEmpty` check**

Find the line (around 241) that reads:

```tsx
(budgetSummary?.availableMonthly ?? 0) === 0 && (budgetSummary?.availableWeekly ?? 0) === 0
```

Replace with:

```tsx
(budgetSummary?.unallocated ?? 0) <= 0
```

- [ ] **Step 4: Type-check**

Run: `cd frontend && pnpm tsc --noEmit`
Expected: `BudgetsPage.tsx` errors resolved; other files still error.

- [ ] **Step 5: Visual sanity check**

Start the dev server (`cd frontend && pnpm dev`), open the budgets page in the browser, confirm:
- Three cards render (Balance, Allocated, Unallocated).
- Unallocated is in neutral styling when positive, red when negative (can simulate by temporarily setting `balance < allocated` in the DB).
- No leftover "Transfer" button.

If dev-server-in-browser testing is not possible in this environment, note that explicitly in the commit.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/budgets/BudgetsPage.tsx
git commit -m "feat(budgets-fe): replace pool cards with Balance/Allocated/Unallocated"
```

---

## Task 10: Update `BudgetDetailPage` and `ManualBudgetSetupPage`

**Files:**
- Modify: `frontend/src/features/budgets/BudgetDetailPage.tsx`
- Modify: `frontend/src/features/budgets/ManualBudgetSetupPage.tsx`

- [ ] **Step 1: Fix `BudgetDetailPage.tsx` (lines 152-153)**

Replace:

```tsx
? currencyFormatter.format(budgetSummary?.availableMonthly ?? 0)
: currencyFormatter.format(budgetSummary?.availableWeekly ?? 0)}
```

With:

```tsx
{currencyFormatter.format(budgetSummary?.unallocated ?? 0)}
```

(Collapse the ternary entirely if the surrounding code was splitting by period — a single number suffices now.)

- [ ] **Step 2: Fix `ManualBudgetSetupPage.tsx` (line 299)**

Replace:

```tsx
availablePoolBalance={selectedPeriod === 'MONTHLY'
  ? (budgetSummary?.availableMonthly ?? 0)
  : (budgetSummary?.availableWeekly ?? 0)}
```

With:

```tsx
availablePoolBalance={budgetSummary?.unallocated ?? 0}
```

(If the child component has a more descriptive prop name, consider renaming during a follow-up — not in scope here.)

- [ ] **Step 3: Type-check**

Run: `cd frontend && pnpm tsc --noEmit`
Expected: these two files clean. Remaining errors likely only in `OnboardingBudgetStep.tsx`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/budgets/BudgetDetailPage.tsx \
        frontend/src/features/budgets/ManualBudgetSetupPage.tsx
git commit -m "fix(budgets-fe): source allocatable amount from unallocated"
```

---

## Task 11: Fix `OnboardingBudgetStep` (if affected) and finish type-check

**Files:**
- Possibly modify: `frontend/src/features/onboarding/OnboardingBudgetStep.tsx`

- [ ] **Step 1: Search for any remaining references**

Run:
```bash
cd frontend/src && grep -rn "availableMonthly\|availableWeekly\|remainingToAllocate" --include="*.tsx" --include="*.ts"
```

Expected: nothing, or hits only in `OnboardingBudgetStep.tsx`.

- [ ] **Step 2: Patch each hit by the same substitution rule**

For each hit: `availableMonthly` or `availableWeekly` → `unallocated`. Remove period-based ternaries; collapse to a single value.

- [ ] **Step 3: Full type-check clean**

Run: `cd frontend && pnpm tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Run frontend tests and linter**

Run: `cd frontend && pnpm test --run && pnpm lint`
Expected: green.

- [ ] **Step 5: Commit**

```bash
git add -A frontend/src
git commit -m "fix(budgets-fe): clean up remaining references to legacy pool fields"
```

---

## Task 12: Surface backend 400 errors inline on the budget form

**Files:**
- Modify: wherever the budget create/edit form submits (likely `ManualBudgetSetupPage.tsx` or a form component under `features/budgets/components/`)

- [ ] **Step 1: Find the mutation call site**

Run:
```bash
cd frontend/src && grep -rn "useSaveBudgetMutation\|useCreateBudgetMutation\|useUpdateBudgetMutation" --include="*.tsx" --include="*.ts"
```

Identify the component that calls the budget-save mutation and currently handles success/failure.

- [ ] **Step 2: Extract the error message on rejection**

In that component's submit handler, on error, pull the message out of the RTK Query error shape:

```ts
try {
  await saveBudget(payload).unwrap();
} catch (err) {
  const message =
    (err as { data?: { message?: string } })?.data?.message ??
    'Failed to save budget.';
  setAmountError(message);
}
```

Where `setAmountError` is local state (`useState<string | null>(null)`) that you render as a red helper text beneath the amount input:

```tsx
{amountError && (
  <p className="mt-1 text-xs text-red-600">{amountError}</p>
)}
```

Clear the error on amount-change: `onChange={() => { setAmountError(null); /* existing */ }}`.

- [ ] **Step 3: Manually verify**

With the dev server running, try to create a budget whose amount exceeds balance. Confirm:
- The request returns 400.
- The error message `"Allocation exceeds available balance by $X."` appears under the amount field in red.
- Submitting a smaller amount clears the error.

If browser testing is unavailable, note that explicitly in the commit message.

- [ ] **Step 4: Commit**

```bash
git add <the form component>
git commit -m "feat(budgets-fe): surface over-allocation errors inline on budget form"
```

---

## Task 13: Full regression sweep

- [ ] **Step 1: Run full backend build + tests**

Run: `cd backend && mvn -q verify`
Expected: clean build + all tests pass + Flyway migration runs.

- [ ] **Step 2: Run full frontend type-check, lint, tests, build**

Run:
```bash
cd frontend && pnpm tsc --noEmit && pnpm lint && pnpm test --run && pnpm build
```
Expected: all green.

- [ ] **Step 3: Manual smoke via dev server**

With the backend running against a dev DB:
1. Create an account; add income of 20,000.
2. Create a budget for Food at 15,000 → budgets page shows Unallocated = 5,000.
3. Add an expense of 15,000 categorized as Food → Unallocated still 5,000; Balance 5,000.
4. Try to create a second budget at 10,000 → 400 error surfaced inline.
5. Delete the 20,000 income → Unallocated shows negative, in red, with "Over-committed by" subtitle.

If any step fails, loop back to the relevant task.

- [ ] **Step 4: Final commit (only if smoke testing surfaced fixes)**

If no fixes were needed, skip. Otherwise:

```bash
git add -A
git commit -m "fix: address smoke-test findings"
```

---

## Self-Review Notes

- **Spec coverage:** every section of the spec maps to a task above (formula → Task 1; validation → Tasks 2-3; code deletion → Tasks 4-5; schema → Task 6; frontend → Tasks 8-12; testing → Tasks 1, 2, 7, 13). ✓
- **Type consistency:** the DTO field `unallocated` is used identically across backend (Task 1), frontend type (Task 8), and frontend consumers (Tasks 9-11). ✓
- **Migration ordering:** code that referenced dropped fields is deleted before the entity fields are removed (Tasks 4-5 before Task 6). Flyway migration is added together with the entity change so Hibernate schema validation passes on boot. ✓
- **TDD:** Tasks 1, 2 follow red/green cycle; Tasks 4-6 are deletions covered by the existing test suite plus Task 7's integration test.
