# Implementation Plan: Google Sign-in Bug Fix

## Phase 1: Diagnosis & Reproduction
- [x] Task: Locate the `User` entity and its database mapping in `backend/src/main/java/`. [fe5c404]
- [x] Task: Write failing integration test reproducing the `PSQLException` during user retrieval/save during Google Sign-in flow. [fe5c404]
- [x] Task: Conductor - User Manual Verification 'Diagnosis & Reproduction' (Protocol in workflow.md) [fe5c404]

## Phase 2: Database Schema & Migration
- [x] Task: Create a SQL migration script to add the `budget_setup_skipped` column to the `users` table. [fe5c404]
- [x] Task: Apply the migration and verify the column exists in PostgreSQL. [fe5c404]
- [x] Task: Conductor - User Manual Verification 'Database Schema & Migration' (Protocol in workflow.md) [fe5c404]

## Phase 3: Implementation & Validation
- [x] Task: Update the `User` entity to properly map the `budget_setup_skipped` column. [fe5c404]
- [x] Task: Implement any necessary logic in the Google Sign-in callback to handle the new column. [fe5c404]
- [x] Task: Run integration tests to confirm the `PSQLException` is resolved (Green Phase). [fe5c404]
- [x] Task: Conductor - User Manual Verification 'Implementation & Validation' (Protocol in workflow.md) [fe5c404]

## Phase 4: Final Verification
- [x] Task: Perform manual Google Sign-in in both Normal and Incognito modes to confirm the fix. [fe5c404]
- [x] Task: Verify that no internal server errors related to this column appear in the backend logs. [fe5c404]
- [x] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md) [fe5c404]
