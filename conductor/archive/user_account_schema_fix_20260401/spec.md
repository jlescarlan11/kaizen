# Specification: UserAccount Schema Mismatch Fix (budget_setup_skipped)

## Overview
A new field (`budgetSetupSkipped`) was added to the `UserAccount` entity in the backend, but the corresponding database migration was not applied to the PostgreSQL `user_account` table. This causes a SQL error during Hibernate's query execution, resulting in a 401 Unauthorized error for the `/api/users/me` endpoint. This track addresses the schema mismatch by adding the missing column via a Flyway migration.

## Functional Requirements
- **Database Migration:** Create a Flyway migration file to add the `budget_setup_skipped` column to the `user_account` table.
- **Default Value:** The new column MUST default to `FALSE` for all existing and new records.
- **Entity Mapping:** Ensure the `UserAccount` entity is correctly mapped to the new database column.
- **Verification:** Implement an integration test using Testcontainers to verify that the Flyway migration correctly aligns with the JPA entity mapping.

## Non-Functional Requirements
- **Backward Compatibility:** Existing user data must be preserved.
- **Stability:** The authentication flow must be restored to a functional state.
- **Testability:** The fix must be verified through automated integration tests.

## Acceptance Criteria
- [ ] A new Flyway migration file `V4__Add_BudgetSetupSkipped_To_UserAccount.sql` is created in `backend/src/main/resources/db/migration/`.
- [ ] The `user_account` table contains the `budget_setup_skipped` column of type `BOOLEAN` with a `DEFAULT FALSE` and `NOT NULL` constraint.
- [ ] The `UserAccount` entity correctly maps the `budgetSetupSkipped` field to the `budget_setup_skipped` column.
- [ ] An integration test in `backend/src/test/java/` (using Testcontainers) passes, confirming the schema and entity are in sync.
- [ ] The `/api/users/me` endpoint returns a successful response for an authenticated user.

## Out of Scope
- Refactoring the entire `UserAccount` entity.
- Implementing UI changes related to the `budgetSetupSkipped` flag.
- Modifying other parts of the authentication logic.
