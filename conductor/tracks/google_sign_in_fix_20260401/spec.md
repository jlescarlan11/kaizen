# Specification: Fix Google Sign-in Database Error

## 1. Overview
Users are experiencing internal server errors (500) during the Google Sign-in callback. The backend logs show a `PSQLException` indicating a missing database column: `budget_setup_skipped`. Interestingly, the issue does not affect all accounts and is sometimes bypassed by using incognito mode, suggesting it may be related to specific user records or session states.

## 2. Problem Analysis
- **Error:** `org.postgresql.util.PSQLException: ERROR: column ua1_0.budget_setup_skipped does not exist`
- **Location:** Backend API (`/api/auth/google/callback`)
- **Root Cause:** The JPA/Hibernate entity model expects a `budget_setup_skipped` column in the user-related table, but this column is missing from the actual PostgreSQL schema.

## 3. Functional Requirements
- **Database Alignment:** Ensure the PostgreSQL schema contains all columns defined in the `User` (or related) entity, specifically `budget_setup_skipped`.
- **Authentication Recovery:** Restore the ability for all users to sign in via Google without encountering internal server errors.
- **Drift Investigation:** Identify why the schema drifted from the entity definition and resolve the inconsistency.

## 4. Non-Functional Requirements
- **Data Integrity:** The fix must not result in data loss for existing users.
- **Reliability:** Ensure the sign-in flow is robust against similar schema mismatches in the future.

## 5. Acceptance Criteria
- [ ] Google Sign-in works for accounts that were previously failing.
- [ ] No `PSQLException` related to `budget_setup_skipped` occurs during the sign-in flow.
- [ ] The database schema is verified to be in sync with the backend entity definitions.
- [ ] Manual verification confirms that both "Normal" and "Incognito" browser sessions can sign in successfully.

## 6. Out of Scope
- Implementing new authentication providers.
- Major refactoring of the onboarding flow (beyond fixing this specific block).
