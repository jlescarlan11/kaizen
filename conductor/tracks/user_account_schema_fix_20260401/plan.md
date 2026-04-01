# Implementation Plan: UserAccount Schema Mismatch Fix (budget_setup_skipped)

## Phase 1: Database Migration Setup (Red Phase)
Focus: Reproduce the failure by writing an integration test that fails due to the missing column.

- [ ] Task: Create a failing integration test `UserAccountSchemaIntegrationTest.java` in `backend/src/test/java/com/kaizen/backend/user/entity/`.
    - [ ] Setup Testcontainers for PostgreSQL.
    - [ ] Attempt to find a `UserAccount` by ID using `UserRepository`.
    - [ ] Verify the test fails with a `JdbcSQLSyntaxErrorException` or similar, indicating the column `budget_setup_skipped` does not exist.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Migration Setup' (Protocol in workflow.md)

## Phase 2: Database Migration Implementation (Green Phase)
Focus: Apply the missing Flyway migration to align the database schema with the entity.

- [ ] Task: Create the Flyway migration file `V4__Add_BudgetSetupSkipped_To_UserAccount.sql` in `backend/src/main/resources/db/migration/`.
    - [ ] Content: `ALTER TABLE user_account ADD COLUMN budget_setup_skipped BOOLEAN NOT NULL DEFAULT FALSE;`
- [ ] Task: Run the integration test `UserAccountSchemaIntegrationTest.java` and confirm it passes.
- [ ] Task: Verify overall backend test suite passes.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Database Migration Implementation' (Protocol in workflow.md)

## Phase 3: Final Verification & Documentation
Focus: Ensure the fix is complete and documented.

- [ ] Task: Perform a manual verification of the `/api/users/me` endpoint (if possible in the development environment).
- [ ] Task: Document the fix in the track metadata and update the tracks registry.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Verification & Documentation' (Protocol in workflow.md)
