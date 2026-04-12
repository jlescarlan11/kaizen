# Plan: Fix SQLGrammarException in Transaction Pagination

## Background
The application is reporting a `SQLGrammarException` when fetching transactions. The error message is `ERROR: could not determine data type of parameter $2`. This is occurring in the keyset pagination query in `TransactionRepository.java` specifically when the `:lastDate` parameter is NULL.

## Objective
Fix the keyset pagination query in `TransactionRepository` to correctly handle NULL parameters in PostgreSQL.

## Proposed Changes

### 1. Modify `TransactionRepository.java`
Update the `findByUserAccountIdPaginated` query to explicitly cast the parameters or handle the NULL case in a way that PostgreSQL can determine the data type.

**Current Query:**
```java
    @Query("SELECT t FROM Transaction t WHERE t.userAccount.id = :userId AND " +
           "(:lastDate IS NULL OR t.transactionDate < :lastDate OR " +
           "(t.transactionDate = :lastDate AND t.id < :lastId)) " +
           "ORDER BY t.transactionDate DESC, t.id DESC")
```

**Proposed Fix:**
We will use a different approach to handle the NULL `:lastDate` by splitting the logic or using a more robust JPQL syntax. In PostgreSQL, `CAST(:lastDate AS LocalDateTime) IS NULL` might work, but another common approach is to use a very large default date if it's null, or just rewrite the condition to be more explicit.

However, since this is JPQL, we should try to keep it as standard as possible.
The error specifically happens because Hibernate sends the parameter without a type hint, and PostgreSQL doesn't know what it is when compared to `NULL`.

A fix that often works in Spring Data JPA with PostgreSQL is:
`((CAST(:lastDate AS LocalDateTime) IS NULL) OR ...)`

Actually, we can use `COALESCE` or just simplify the query if possible.

Actually, the standard way to fix this in Spring Data JPA for PostgreSQL is to use:
`(target_column < :param OR :param IS NULL)` -> but PostgreSQL fails here.

I will try:
`(:lastDate IS NULL OR t.transactionDate < CAST(:lastDate AS LocalDateTime) ...)` - but JPQL `CAST` might not work with `LocalDateTime` as a type.

Actually, a simpler fix is to use two different repository methods or use a `CriteriaBuilder`.
But given the current structure, I will try to fix the query in-place.

One reliable way is:
```java
    @Query("SELECT t FROM Transaction t WHERE t.userAccount.id = :userId AND " +
           "(CAST(:lastDate AS timestamp) IS NULL OR t.transactionDate < :lastDate OR " +
           "(t.transactionDate = :lastDate AND t.id < :lastId)) " +
           "ORDER BY t.transactionDate DESC, t.id DESC")
```
PostgreSQL's `timestamp` corresponds to `LocalDateTime`.

### 2. Verification
1.  Create `TransactionPaginationIntegrationTest.java` to reproduce the bug.
2.  Apply the fix.
3.  Run the test to ensure it passes.

## Implementation Steps
1.  Exit Plan Mode.
2.  Create the reproduction test.
3.  Observe the failure.
4.  Apply the fix to `TransactionRepository.java`.
5.  Run the test again to verify the fix.
