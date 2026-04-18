# Implementation Plan: Comprehensive Test File Cleanup

## Phase 1: Identify and Delete Leftover Test Files
- [ ] Task: Execute `find . -name "*.test.*" -o -name "*.spec.*"` to locate all remaining test files.
- [ ] Task: Delete the identified test files, including `balanceSummarySlice.test.ts` and `InsightGenerator.test.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Identify and Delete Leftover Test Files' (Protocol in workflow.md)

## Phase 2: Purge Test Scripts and Dependencies
- [ ] Task: Remove test scripts (e.g., `test`, `coverage`) from `frontend/package.json`.
- [ ] Task: Remove test-related dependencies (e.g., `vitest`, `jest`, `@testing-library/*`, `@types/jest`) from `frontend/package.json`.
- [ ] Task: Remove test-related configurations (e.g., `vitest.config.ts`, `jest.config.js`) if they exist.
- [ ] Task: Remove the `maven-surefire-plugin` or `maven-failsafe-plugin` from `backend/pom.xml`.
- [ ] Task: Remove test-scoped dependencies (e.g., `junit`, `mockito`, `testcontainers`, `spring-boot-starter-test`) from `backend/pom.xml`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Purge Test Scripts and Dependencies' (Protocol in workflow.md)

## Phase 3: CI Pipeline and Documentation Updates
- [ ] Task: Analyze `.github/workflows/backend-pr.yml`, `.github/workflows/frontend-pr.yml`, and `.github/workflows/backend-deploy-staging.yml` for test execution steps (e.g., `npm run test`, `mvn test`).
- [ ] Task: Remove the identified test steps from the GitHub Actions workflows to prevent pipeline failures.
- [ ] Task: Update the "Gemini Added Memories" section in `GEMINI.md` to document the completion date of the test-free cleanup.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: CI Pipeline and Documentation Updates' (Protocol in workflow.md)