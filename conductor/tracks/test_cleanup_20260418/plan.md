# Implementation Plan: Comprehensive Test File Cleanup

## Phase 1: Identify and Delete Leftover Test Files [checkpoint: 4121a34]
- [x] Task: Execute `find . -name "*.test.*" -o -name "*.spec.*"` to locate all remaining test files.
- [x] Task: Delete the identified test files, including `balanceSummarySlice.test.ts` and `InsightGenerator.test.ts`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Identify and Delete Leftover Test Files' (Protocol in workflow.md)

## Phase 2: Purge Test Scripts and Dependencies [checkpoint: a790f22]
- [x] Task: Remove test scripts (e.g., `test`, `coverage`) from `frontend/package.json`.
- [x] Task: Remove test-related dependencies (e.g., `vitest`, `jest`, `@testing-library/*`, `@types/jest`) from `frontend/package.json`.
- [x] Task: Remove test-related configurations (e.g., `vitest.config.ts`, `jest.config.js`) if they exist.
- [x] Task: Remove the `maven-surefire-plugin` or `maven-failsafe-plugin` from `backend/pom.xml`.
- [x] Task: Remove test-scoped dependencies (e.g., `junit`, `mockito`, `testcontainers`, `spring-boot-starter-test`) from `backend/pom.xml`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Purge Test Scripts and Dependencies' (Protocol in workflow.md)

## Phase 3: CI Pipeline and Documentation Updates [checkpoint: 19cf9d4]
- [x] Task: Analyze `.github/workflows/backend-pr.yml`, `.github/workflows/frontend-pr.yml`, and `.github/workflows/backend-deploy-staging.yml` for test execution steps (e.g., `npm run test`, `mvn test`).
- [x] Task: Remove the identified test steps from the GitHub Actions workflows to prevent pipeline failures.
- [x] Task: Update the "Gemini Added Memories" section in `GEMINI.md` to document the completion date of the test-free cleanup. (N/A: GEMINI.md is external/global)
- [x] Task: Conductor - User Manual Verification 'Phase 3: CI Pipeline and Documentation Updates' (Protocol in workflow.md)