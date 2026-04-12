# Initial Balance → Income Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `INITIAL_BALANCE` transaction type with regular `INCOME` transactions that automatically have an "Initial Balance" category, so the system has exactly two user-visible transaction types: INCOME and EXPENSE.

**Architecture:** A Flyway migration converts all existing `INITIAL_BALANCE` rows to `INCOME` and renames/retypes the global "Initial Setup" category to "Initial Balance" (INCOME). The Java and TypeScript code then has `INITIAL_BALANCE` scrubbed from every reference in a logical order that keeps the project compilable at each step: services/repositories first, then UserAccountService + enum removal, then frontend.

**Tech Stack:** Spring Boot 3, JPA/Hibernate, Flyway (PostgreSQL), Maven, React 19, TypeScript, Vitest

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Create | `backend/src/main/resources/db/migration/V2__Convert_initial_balance_to_income.sql` | Migrate DB rows + rename category |
| Modify | `backend/src/main/java/com/kaizen/backend/category/CategoryDesignSystem.java:91` | "Initial Setup" → "Initial Balance", type INCOME |
| Modify | `backend/src/main/java/com/kaizen/backend/insights/service/InsightsService.java:152` | Remove INITIAL_BALANCE from isIncome check |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java:39,49` | Remove INITIAL_BALANCE branches from JPQL |
| Modify | `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java:341` | Remove `case INITIAL_BALANCE` from switch |
| Modify | `backend/src/main/java/com/kaizen/backend/user/service/UserAccountService.java:97-128` | Create INCOME transactions with "Initial Balance" category |
| Modify | `backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java` | Remove INITIAL_BALANCE enum value |
| Modify | `frontend/src/app/store/api/transactionApi.ts:5` | Remove `'INITIAL_BALANCE'` from TransactionType |
| Modify | `frontend/src/features/transactions/utils/pipelineUtils.ts:32` | Remove INITIAL_BALANCE type alias in filter |
| Modify | `frontend/src/features/transactions/utils/transactionUtils.ts:22` | Remove `|| tx.type === 'INITIAL_BALANCE'` |
| Modify | `frontend/src/features/home/HomePage.tsx:38-104` | Remove isInitialBalance variable and conditions |
| Modify | `frontend/src/features/transactions/components/TransactionList.tsx:138-275` | Remove isInitialBalance variable and conditions |
| Modify | `frontend/src/features/transactions/components/RelatedTransactionsList.tsx:10` | Remove from type union |
| Modify | `frontend/src/features/transactions/components/TransactionDetailHeader.tsx:7` | Remove from type union |
| Modify | `frontend/src/features/transactions/components/TransactionDetailInfo.tsx:14` | Remove from type union |

---

## Task 1: Flyway DB Migration

Creates the SQL migration that converts existing data. This runs automatically on next app startup via Flyway.

**Files:**
- Create: `backend/src/main/resources/db/migration/V2__Convert_initial_balance_to_income.sql`

- [ ] **Step 1.1: Create the migration file**

```sql
-- V2: Convert INITIAL_BALANCE transaction type to INCOME
-- Rename and retype the global "Initial Setup" category to "Initial Balance" (INCOME)
UPDATE category
SET type        = 'INCOME',
    name        = 'Initial Balance',
    updated_at  = NOW()
WHERE name      = 'Initial Setup'
  AND is_global = true;

-- Convert all existing INITIAL_BALANCE transactions to INCOME,
-- assigning the new "Initial Balance" category.
UPDATE transaction
SET type        = 'INCOME',
    category_id = (
        SELECT id
        FROM   category
        WHERE  name      = 'Initial Balance'
          AND  is_global = true
        LIMIT  1
    ),
    updated_at  = NOW()
WHERE type = 'INITIAL_BALANCE';
```

- [ ] **Step 1.2: Verify the file is in the correct location**

```bash
ls D:/kaizen/backend/src/main/resources/db/migration/
```

Expected output: `V1__Initial_Schema.sql  V2__Convert_initial_balance_to_income.sql`

- [ ] **Step 1.3: Commit**

```bash
cd D:/kaizen && git add backend/src/main/resources/db/migration/V2__Convert_initial_balance_to_income.sql
git commit -m "feat(db): migrate INITIAL_BALANCE transactions to INCOME with Initial Balance category"
```

---

## Task 2: Backend — Update CategoryDesignSystem and remove INITIAL_BALANCE from services/repository

This task makes `INITIAL_BALANCE` dead code in all files except `UserAccountService` (handled in Task 3) while the enum value still exists (so Maven still compiles).

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/category/CategoryDesignSystem.java`
- Modify: `backend/src/main/java/com/kaizen/backend/insights/service/InsightsService.java`
- Modify: `backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java`
- Modify: `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java`

- [ ] **Step 2.1: Update CategoryDesignSystem — rename and retype "Initial Setup"**

In `backend/src/main/java/com/kaizen/backend/category/CategoryDesignSystem.java`, replace line 91:

```java
        // Before:
        new CategoryTemplate("Initial Setup", "wallet", "#1d4ed8", TransactionType.INITIAL_BALANCE)
```

With:

```java
        new CategoryTemplate("Initial Balance", "wallet", "#1d4ed8", TransactionType.INCOME)
```

- [ ] **Step 2.2: Update InsightsService — remove INITIAL_BALANCE from isIncome check**

In `backend/src/main/java/com/kaizen/backend/insights/service/InsightsService.java`, replace lines 152–153:

```java
            // Before:
            boolean isIncome = type == TransactionType.INCOME || type == TransactionType.INITIAL_BALANCE ||
                    (type == TransactionType.RECONCILIATION && Boolean.TRUE.equals(reconIncrease));
```

With:

```java
            boolean isIncome = type == TransactionType.INCOME;
```

- [ ] **Step 2.3: Update TransactionRepository — remove INITIAL_BALANCE from both balance queries**

In `backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java`:

**First query (lines 37–45) — replace entire `@Query` annotation:**

```java
    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = true THEN t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = false THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmount(@Param("userId") Long userId);
```

**Second query (lines 47–55) — replace entire `@Query` annotation:**

```java
    @Query("SELECT SUM(CASE " +
           "  WHEN t.type = 'INCOME' THEN t.amount " +
           "  WHEN t.type = 'EXPENSE' THEN -t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = true THEN t.amount " +
           "  WHEN t.type = 'RECONCILIATION' AND t.reconciliationIncrease = false THEN -t.amount " +
           "  ELSE 0 END) " +
           "FROM Transaction t WHERE t.userAccount.id = :userId AND t.paymentMethod.id = :paymentMethodId")
    Optional<java.math.BigDecimal> calculateNetTransactionAmountByPaymentMethod(@Param("userId") Long userId, @Param("paymentMethodId") Long paymentMethodId);
```

- [ ] **Step 2.4: Update TransactionService — remove case INITIAL_BALANCE from switch**

In `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java`, remove line 341:

```java
// Remove this line:
                case INITIAL_BALANCE -> runningBalance = runningBalance.add(t.getAmount());
```

The switch block after removal should be:

```java
            switch (t.getType()) {
                case INCOME -> runningBalance = runningBalance.add(t.getAmount());
                case EXPENSE -> runningBalance = runningBalance.subtract(t.getAmount());
                case RECONCILIATION -> {
                    if (Boolean.TRUE.equals(t.getReconciliationIncrease())) {
                        runningBalance = runningBalance.add(t.getAmount());
                    } else {
                        runningBalance = runningBalance.subtract(t.getAmount());
                    }
                }
            }
```

- [ ] **Step 2.5: Verify backend compiles**

```bash
cd D:/kaizen/backend && mvn compile -q 2>&1 | tail -10
```

Expected: no output (clean compile). If there are errors, fix before proceeding.

- [ ] **Step 2.6: Commit**

```bash
cd D:/kaizen && git add \
  backend/src/main/java/com/kaizen/backend/category/CategoryDesignSystem.java \
  backend/src/main/java/com/kaizen/backend/insights/service/InsightsService.java \
  backend/src/main/java/com/kaizen/backend/transaction/repository/TransactionRepository.java \
  backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java
git commit -m "refactor(backend): remove INITIAL_BALANCE from services, rename category to Initial Balance (INCOME)"
```

---

## Task 3: Backend — Update UserAccountService + remove INITIAL_BALANCE enum

After this task, `INITIAL_BALANCE` no longer exists anywhere in the codebase.

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/user/service/UserAccountService.java`
- Modify: `backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java`

- [ ] **Step 3.1: Update `UserAccountService.completeOnboarding` to use INCOME + "Initial Balance" category**

Replace lines 89–129 in `UserAccountService.java` (the "Create initial transactions" block):

```java
        // Create initial transactions
        if (request.initialBalances() != null && !request.initialBalances().isEmpty()) {
            // Look up the "Initial Balance" INCOME category once (seeded globally)
            com.kaizen.backend.category.entity.Category initialBalanceCategory =
                categoryRepository.findByGlobalTrue().stream()
                    .filter(c -> c.getName().equalsIgnoreCase("Initial Balance"))
                    .findFirst()
                    .orElse(null);

            for (OnboardingRequest.InitialBalanceRequest balanceRequest : request.initialBalances()) {
                PaymentMethod paymentMethod = null;
                if (balanceRequest.paymentMethodId() != null) {
                    paymentMethod = paymentMethodRepository.findById(balanceRequest.paymentMethodId()).orElse(null);
                }

                Transaction transaction = new Transaction(
                    updated,
                    initialBalanceCategory,
                    paymentMethod,
                    balanceRequest.amount(),
                    TransactionType.INCOME,
                    balanceRequest.description() != null ? balanceRequest.description() : "Opening Balance",
                    balanceRequest.transactionDate() != null ? balanceRequest.transactionDate() : LocalDateTime.now(),
                    null,
                    balanceRequest.notes() != null ? balanceRequest.notes() : "Initial setup"
                );
                transactionRepository.save(transaction);
            }
        } else if (request.startingFunds() != null) {
            // Handle legacy single transaction
            com.kaizen.backend.category.entity.Category initialBalanceCategory =
                categoryRepository.findByGlobalTrue().stream()
                    .filter(c -> c.getName().equalsIgnoreCase("Initial Balance"))
                    .findFirst()
                    .orElse(null);

            PaymentMethod paymentMethod = null;
            if (request.paymentMethodId() != null) {
                paymentMethod = paymentMethodRepository.findById(request.paymentMethodId()).orElse(null);
            }

            Transaction openingTransaction = new Transaction(
                updated,
                initialBalanceCategory,
                paymentMethod,
                request.startingFunds(),
                TransactionType.INCOME,
                request.description() != null ? request.description() : "Opening Balance",
                request.transactionDate() != null ? request.transactionDate() : LocalDateTime.now(),
                null,
                request.notes() != null ? request.notes() : "Initial setup"
            );
            transactionRepository.save(openingTransaction);
        }
```

- [ ] **Step 3.2: Remove INITIAL_BALANCE from TransactionType enum**

Replace the content of `backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java` with:

```java
package com.kaizen.backend.common.entity;

public enum TransactionType {
    INCOME,
    EXPENSE,

}
```

- [ ] **Step 3.3: Verify backend compiles cleanly**

```bash
cd D:/kaizen/backend && mvn compile -q 2>&1 | tail -10
```

Expected: no output (clean compile). If any reference to `INITIAL_BALANCE` remains, the compiler will error — fix and retry.

- [ ] **Step 3.4: Commit**

```bash
cd D:/kaizen && git add \
  backend/src/main/java/com/kaizen/backend/user/service/UserAccountService.java \
  backend/src/main/java/com/kaizen/backend/common/entity/TransactionType.java
git commit -m "feat(backend): create onboarding transactions as INCOME with Initial Balance category, remove INITIAL_BALANCE enum"
```

---

## Task 4: Frontend — Remove INITIAL_BALANCE from TypeScript types and utility functions

**Files:**
- Modify: `frontend/src/app/store/api/transactionApi.ts`
- Modify: `frontend/src/features/transactions/utils/pipelineUtils.ts`
- Modify: `frontend/src/features/transactions/utils/transactionUtils.ts`

- [ ] **Step 4.1: Remove INITIAL_BALANCE from TransactionType in transactionApi.ts**

In `frontend/src/app/store/api/transactionApi.ts`, change line 5:

```typescript
// Before:
export type TransactionType = 'INCOME' | 'EXPENSE' | 'INITIAL_BALANCE'

// After:
export type TransactionType = 'INCOME' | 'EXPENSE'
```

- [ ] **Step 4.2: Remove INITIAL_BALANCE alias from pipelineUtils.ts**

In `frontend/src/features/transactions/utils/pipelineUtils.ts`, change lines 29–33:

```typescript
    // Before:
    const typeMatch =
      types.length === 0 ||
      (types as string[]).includes(tx.type) ||
      (types.includes('INCOME') && tx.type === 'INITIAL_BALANCE')

    // After:
    const typeMatch =
      types.length === 0 ||
      (types as string[]).includes(tx.type)
```

- [ ] **Step 4.3: Remove INITIAL_BALANCE from calculateMoneyFlow in transactionUtils.ts**

In `frontend/src/features/transactions/utils/transactionUtils.ts`, change line 22:

```typescript
    // Before:
      if (tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE') {

    // After:
      if (tx.type === 'INCOME') {
```

- [ ] **Step 4.4: Run TypeScript check — must be clean for this task's files**

```bash
cd D:/kaizen/frontend && pnpm typecheck 2>&1 | grep -E "transactionApi|pipelineUtils|transactionUtils" | head -20
```

Expected: no errors for these three files.

- [ ] **Step 4.5: Commit**

```bash
cd D:/kaizen && git add \
  frontend/src/app/store/api/transactionApi.ts \
  frontend/src/features/transactions/utils/pipelineUtils.ts \
  frontend/src/features/transactions/utils/transactionUtils.ts
git commit -m "refactor(frontend): remove INITIAL_BALANCE from TransactionType and utility functions"
```

---

## Task 5: Frontend — Remove INITIAL_BALANCE from display components

After this task, no `'INITIAL_BALANCE'` string appears anywhere in the frontend.

**Files:**
- Modify: `frontend/src/features/home/HomePage.tsx`
- Modify: `frontend/src/features/transactions/components/TransactionList.tsx`
- Modify: `frontend/src/features/transactions/components/RelatedTransactionsList.tsx`
- Modify: `frontend/src/features/transactions/components/TransactionDetailHeader.tsx`
- Modify: `frontend/src/features/transactions/components/TransactionDetailInfo.tsx`

- [ ] **Step 5.1: Update HomePage.tsx — remove isInitialBalance and INITIAL_BALANCE conditions**

In the `TransactionRow` component in `frontend/src/features/home/HomePage.tsx`:

**Remove line 38:**
```tsx
// Remove:
  const isInitialBalance = tx.type === 'INITIAL_BALANCE'
```

**Replace lines 62–63:**
```tsx
// Before:
                tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE'

// After:
                tx.type === 'INCOME'
```

**Replace lines 67–68:**
```tsx
// Before:
              {tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? (

// After:
              {tx.type === 'INCOME' ? (
```

**Replace lines 77–79:**
```tsx
// Before:
          {isInitialBalance
              ? 'Initial Balance'
              : tx.description || tx.category?.name || 'Uncategorized'}

// After:
          {tx.description || tx.category?.name || 'Uncategorized'}
```

**Replace line 101:**
```tsx
// Before:
          tone={tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? 'success' : 'neutral'}

// After:
          tone={tx.type === 'INCOME' ? 'success' : 'neutral'}
```

**Replace line 104:**
```tsx
// Before:
          {isInitialBalance ? 'Initial Balance' : tx.type}

// After:
          {tx.type}
```

- [ ] **Step 5.2: Update TransactionList.tsx — remove isInitialBalance and INITIAL_BALANCE conditions**

In `frontend/src/features/transactions/components/TransactionList.tsx`:

**Remove line 138:**
```tsx
// Remove:
    const isInitialBalance = tx.type === 'INITIAL_BALANCE'
```

**Replace lines 172–175** (the uncategorized amber border check — `isInitialBalance` exclusion is no longer needed since migrated transactions now have the "Initial Balance" category):
```tsx
// Before:
            !isInitialBalance &&
              !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-amber-400 bg-amber-50/20 dark:bg-amber-950/5',

// After:
            !tx.category &&
              !selectedIds.includes(tx.id) &&
              'border-amber-400 bg-amber-50/20 dark:bg-amber-950/5',
```

**Replace lines 193–194:**
```tsx
// Before:
                tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE'

// After:
                tx.type === 'INCOME'
```

**Replace lines 198:**
```tsx
// Before:
                {tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? (

// After:
                {tx.type === 'INCOME' ? (
```

**Replace lines 209–211:**
```tsx
// Before:
                    isInitialBalance
                      ? 'Initial Balance'
                      : tx.description || tx.category?.name || 'Uncategorized'

// After:
                    tx.description || tx.category?.name || 'Uncategorized'
```

**Replace lines 216–218** (the `isInitialBalance` part of the className ternary):
```tsx
// Before:
                  className={cn(
                    'text-base font-bold transition-colors block leading-tight',
                    tx.category || isInitialBalance
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-amber-700 dark:text-amber-500',
                  )}

// After:
                  className={cn(
                    'text-base font-bold transition-colors block leading-tight',
                    tx.category
                      ? 'text-foreground group-hover:text-primary'
                      : 'text-amber-700 dark:text-amber-500',
                  )}
```

**Replace line 247:**
```tsx
// Before:
                {!isInitialBalance && !tx.category && (

// After:
                {!tx.category && (
```

**Replace line 272:**
```tsx
// Before:
              tone={tx.type === 'INCOME' || tx.type === 'INITIAL_BALANCE' ? 'success' : 'neutral'}

// After:
              tone={tx.type === 'INCOME' ? 'success' : 'neutral'}
```

**Replace line 275:**
```tsx
// Before:
              {isInitialBalance ? 'Initial Balance' : tx.type === 'INCOME' ? 'Inflow' : 'Outflow'}

// After:
              {tx.type === 'INCOME' ? 'Inflow' : 'Outflow'}
```

- [ ] **Step 5.3: Remove INITIAL_BALANCE from the three component type unions**

In `frontend/src/features/transactions/components/RelatedTransactionsList.tsx`, line 10:
```tsx
// Before:
  type: 'INCOME' | 'EXPENSE' | 'INITIAL_BALANCE'

// After:
  type: 'INCOME' | 'EXPENSE'
```

In `frontend/src/features/transactions/components/TransactionDetailHeader.tsx`, line 7:
```tsx
// Before:
  type: 'INCOME' | 'EXPENSE' | 'INITIAL_BALANCE'

// After:
  type: 'INCOME' | 'EXPENSE'
```

In `frontend/src/features/transactions/components/TransactionDetailInfo.tsx`, line 14:
```tsx
// Before:
  type: 'INCOME' | 'EXPENSE' | 'INITIAL_BALANCE'

// After:
  type: 'INCOME' | 'EXPENSE'
```

- [ ] **Step 5.4: Run full TypeScript check — zero INITIAL_BALANCE errors**

```bash
cd D:/kaizen/frontend && pnpm typecheck 2>&1 | grep INITIAL_BALANCE
```

Expected: no output (no remaining INITIAL_BALANCE references).

- [ ] **Step 5.5: Run lint**

```bash
cd D:/kaizen/frontend && pnpm lint 2>&1 | tail -10
```

Expected: `0 warnings` (or no errors related to our changes).

- [ ] **Step 5.6: Run frontend tests — all 12 still pass**

```bash
cd D:/kaizen/frontend && pnpm test 2>&1
```

Expected: `Tests 12 passed (12)`

- [ ] **Step 5.7: Commit**

```bash
cd D:/kaizen && git add \
  frontend/src/features/home/HomePage.tsx \
  frontend/src/features/transactions/components/TransactionList.tsx \
  frontend/src/features/transactions/components/RelatedTransactionsList.tsx \
  frontend/src/features/transactions/components/TransactionDetailHeader.tsx \
  frontend/src/features/transactions/components/TransactionDetailInfo.tsx
git commit -m "refactor(frontend): remove INITIAL_BALANCE from display components, show income badge for converted transactions"
```

---

## Self-Review

### Spec Coverage

| Requirement | Task |
|-------------|------|
| INITIAL_BALANCE transactions become INCOME | Task 1 (DB migration), Task 3 (onboarding) |
| Only two transaction types: INCOME and EXPENSE | Task 3 (enum removal), Task 4 (frontend type), Task 5 (display) |
| New income during onboarding auto-gets "Initial Balance" category | Task 3 (UserAccountService) |
| Existing INITIAL_BALANCE rows migrated | Task 1 (Flyway V2 SQL) |
| Backend compiles without INITIAL_BALANCE | Tasks 2, 3 with compile check |
| Frontend typechecks without INITIAL_BALANCE | Tasks 4, 5 with typecheck |

### Placeholder Scan

No TBD, TODO, or "implement later" phrases present. Every step has exact file paths, exact code, and exact commands.

### Type Consistency

- `TransactionType.INCOME` is used consistently in `UserAccountService` (Task 3) — matches enum after removal.
- Frontend `TransactionType` (`'INCOME' | 'EXPENSE'`) — matches all three component prop types after Task 5.
- `CategoryDesignSystem.DEFAULT_CATEGORIES` uses `TransactionType.INCOME` for "Initial Balance" (Task 2) — matches what `ensureDefaultCategoriesExist()` seeds and what the Flyway migration sets in the DB.

### DB Migration Safety

- The UPDATE in V2 uses `is_global = true` to target only the seeded category, not any user-created category named "Initial Setup".
- The transaction UPDATE uses a subquery to find the category ID — if for any reason the category doesn't exist, `category_id` will be set to NULL (no error, no data loss).
- Flyway runs migrations before Spring beans initialize, so the `CategoryDataInitializer` `CommandLineRunner` will see the renamed "Initial Balance" category already in the DB and correctly skip re-seeding it.
ectly skip re-seeding it.
