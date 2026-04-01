# Implementation Plan: Google Sign-in Bug Fix

## Phase 1: Diagnosis & Reproduction
- [ ] Task: Locate the `User` entity and its database mapping in `backend/src/main/java/`.
- [ ] Task: Write failing integration test reproducing the `PSQLException` during user retrieval/save during Google Sign-in flow.
- [ ] Task: Conductor - User Manual Verification 'Diagnosis & Reproduction' (Protocol in workflow.md)

## Phase 2: Database Schema & Migration
- [ ] Task: Create a SQL migration script to add the `budget_setup_skipped` column to the `users` table.
- [ ] Task: Apply the migration and verify the column exists in PostgreSQL.
- [ ] Task: Conductor - User Manual Verification 'Database Schema & Migration' (Protocol in workflow.md)

## Phase 3: Implementation & Validation
- [ ] Task: Update the `User` entity to properly map the `budget_setup_skipped` column.
- [ ] Task: Implement any necessary logic in the Google Sign-in callback to handle the new column.
- [ ] Task: Run integration tests to confirm the `PSQLException` is resolved (Green Phase).
- [ ] Task: Conductor - User Manual Verification 'Implementation & Validation' (Protocol in workflow.md)

## Phase 4: Final Verification
- [ ] Task: Perform manual Google Sign-in in both Normal and Incognito modes to confirm the fix.
- [ ] Task: Verify that no internal server errors related to this column appear in the backend logs.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
