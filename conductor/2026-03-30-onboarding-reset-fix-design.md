---
design_depth: deep
task_complexity: medium
---

# Design Document: Onboarding Reset & Balance Consistency Fix

## 1. Problem Statement

**Current State**:
-   The "Reset Onboarding" feature in the `UserAccountService` (backend) fails to clear the transaction history (`transaction` table).
-   The account balance displayed on the **Home Page (/)** is sourced from the `UserAccount.balance` cached field, while the **Transactions Page (/transactions)** likely calculates its total from the transaction history.
-   After a reset and re-onboarding, the cached balance is updated but old transactions remain, causing a visible mismatch between the two pages.

**Objective**:
-   Ensure a complete "Clean Slate" by clearing all user-specific data (transactions, budgets, goals, categories, payment methods) when onboarding is reset.
-   Achieve absolute balance consistency by using the transaction log as the single source of truth for all pages.

**In Scope**:
-   Modifying `UserAccountService.resetOnboarding` to clear all related entities.
-   Updating the backend to calculate the user's balance from the transaction sum.
-   Ensuring the frontend uses the transaction-derived balance for both the Home and Transactions pages.

**Out of Scope**:
-   Migrating existing user data (since the goal is a reset).
-   Optimizing for extreme transaction volumes (e.g., millions of rows) as current volume is manageable.

## 2. Requirements

**Functional Requirements**:
-   **REQ-1: Full Data Reset** — When a user triggers "Reset Onboarding," the application must delete all records associated with that user in the following tables: `transaction`, `budget`, `goal`, `category`, and `payment_method`.
-   **REQ-2: Transaction-Led Balance** — The `UserAccount.balance` field on the backend should be deprecated or always updated by summing all transactions associated with the user before returning it to the frontend.
-   **REQ-3: Consistent UI** — Both the Home Page (`/`) and the Transactions Page (`/transactions`) must use the same source (the transaction-derived balance) to display the user's total balance.
-   **REQ-4: Re-Onboarding Consistency** — Upon re-onboarding, any new `INITIAL_BALANCE` transaction should be the sole source of the balance, with no "ghost" transactions from the previous session.

**Non-Functional Requirements**:
-   **Accuracy** — The displayed balance must be accurate down to the cent, regardless of the page or view.
-   **Integrity** — Deleting data during reset must not leave orphaned records or cause database foreign key constraint violations.
-   **Simplicity** — Avoid complex caching or event-driven mechanisms to keep the codebase maintainable.

**Constraints**:
-   **Technology** — Java/Spring Boot backend, React frontend.
-   **Database** — Relational database (likely PostgreSQL or H2).

## 3. Approach

**Selected Approach: Fully Synchronized Transaction-Led Balance**
This approach makes the transaction log the absolute "single source of truth." The balance is always calculated by summing the transactions on the backend.

**Key Decisions**:
-   **Backend Reset Modification**: Update `UserAccountService.resetOnboarding` to clear all related records from `transaction`, `budget`, `goal`, `category`, and `payment_method` tables. Reset the `UserAccount.balance` to 0.
-   **Backend Balance Calculation**: The user's balance returned by the backend (e.g., in `UserResponse`) will be updated by querying the sum of all transactions associated with the user instead of relying on a stored `balance` field.
-   **Frontend Consistency**: Both the Home page and the Transactions page will fetch the balance from the same source (the backend's transaction-derived balance).

**Decision Matrix**:

| Criterion | Weight | Approach 1: Transaction-Led | Approach 2: Cached Balance |
|-----------|--------|-----------------------------|---------------------------|
| **Consistency** | 40% | 5: Guaranteed by source | 3: Prone to sync errors |
| **Performance** | 30% | 3: Acceptable for most cases | 5: Fastest reads |
| **Simplicity** | 30% | 5: No complex sync logic | 3: Requires event listeners |
| **Weighted Total** | | **4.4** | **3.6** |

**Alternatives Considered**:
-   **Approach 2: Event-Driven Cached Balance** — Use Spring Data JPA's `@PostPersist`, `@PostUpdate`, and `@PostRemove` hooks to update the `UserAccount.balance` field. This was rejected because it adds unnecessary complexity and is still prone to sync errors if a transaction is updated through a different path.
-   **Frontend-Only Calculation** — Summing transactions on the frontend. This was rejected as it would require the frontend to load *every* transaction before it could display the balance, which is not scalable.

## 4. Architecture

**Components**:
-   **UserAccountService** (Backend): Orchestrates the "Reset Onboarding" flow and coordinates with various repositories to delete user-specific data.
-   **UserAccountRepository**, **TransactionRepository**, **BudgetRepository**, **GoalRepository**, **CategoryRepository**, **PaymentMethodRepository** (Backend): Provide data access and deletion logic for each entity.
-   **UserResponse** (Backend DTO): The data structure returned to the frontend when the user's profile is fetched.
-   **Home Screen** and **Transactions Screen** (Frontend): Components that display the user's total balance.

**Data Flow (Reset)**:
1.  The user triggers "Reset Onboarding" from the frontend.
2.  `UserAccountService.resetOnboarding` is called.
3.  `UserAccountService` sequentially calls `deleteAllByUser(user)` for: `Transaction`, `Budget`, `Goal`, `Category`, and `PaymentMethod` repositories.
4.  `UserAccount.balance` is explicitly set to 0.
5.  `UserAccount.onboardingCompleted` is set to `false`.

**Data Flow (Balance Retrieval)**:
1.  The frontend requests the user's profile/data (e.g., via `/api/user/me`).
2.  The backend calculates the balance by summing all transactions for that user in the `transaction` table.
3.  The backend includes this calculated balance in the `UserResponse` DTO.
4.  Both the Home Screen and the Transactions Screen consume this balance from the same DTO (likely via a shared frontend store/context).

**Key Interfaces**:
-   `UserAccountService.resetOnboarding(UserAccount account)`: Modified to include comprehensive deletions.
-   `TransactionRepository.sumAmountByUserId(Long userId)`: A new or updated query to calculate the balance from transaction history.

## 5. Agent Team

-   **Backend Engineer** (coder): To update `UserAccountService` and repositories for data clearing and balance calculation.
-   **Frontend Engineer** (coder): To verify and ensure both Home and Transactions screens use the correct balance source.
-   **Tester** (tester): To verify the reset logic and balance consistency.

## 6. Risk Assessment

**Risks & Mitigations**:
-   **Risk: Performance Overhead** — Summing all transactions for the user every time the balance is needed might become slow as the transaction volume grows.
    -   **Mitigation**: Use an indexed database query (e.g., `SUM(amount) WHERE user_id = :id`) to ensure efficient calculation.
-   **Risk: Data Corruption (Foreign Key Violations)** — Deleting users' data might fail if entities have circular or complex foreign key dependencies.
    -   **Mitigation**: Use transaction-safe operations in the backend (`@Transactional`) and ensure deletions follow the correct order.
-   **Risk: UI Misalignment during Sync** — Rounding differences might still cause minor inconsistencies.
    -   **Mitigation**: Ensure both pages (Home and Transactions) consume the same numeric value from the backend.

## 7. Success Criteria

- [ ] All transactions, budgets, goals, categories, and payment methods are deleted upon "Reset Onboarding."
- [ ] User profile (name, picture) is preserved during reset.
-   [ ] The Home Screen and Transactions Screen display identical balance values.
-   [ ] After re-onboarding, the balance accurately reflects the new initial balance.
-   [ ] No foreign key constraint violations occur during the reset process.
