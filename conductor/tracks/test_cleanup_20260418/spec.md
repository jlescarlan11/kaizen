# Specification: Comprehensive Test File Cleanup

## Overview
This chore focuses on removing all remaining test files, test-related dependencies, and CI test runner executions from the repository. This ensures strict adherence to the project's documented test-free standard and prevents accidental test triggers in CI workflows.

## Objectives
- Purge the repository of all `*.test.*` and `*.spec.*` files.
- Remove test execution scripts and related testing dependencies from project configurations (`package.json`, `pom.xml`).
- Update CI/CD pipelines to bypass or remove testing phases.
- Document the completion of this cleanup in `GEMINI.md`.

## Scope
-   **File Deletion:** All files matching the glob patterns `*.test.*` and `*.spec.*`, explicitly including `balanceSummarySlice.test.ts` and `InsightGenerator.test.ts`.
-   **Configuration Updates:**
    -   `frontend/package.json`: Remove test scripts (e.g., `npm run test`) and test dependencies (e.g., `vitest`, `jest`, `@testing-library/*`).
    -   `backend/pom.xml`: Remove Maven Surefire plugin configurations and test-scoped dependencies (e.g., `junit`, `mockito`, `testcontainers`).
    -   `.github/workflows/*.yml`: Remove any steps or jobs executing tests.
-   **Documentation:** Append a new record to the "Gemini Added Memories" section in `GEMINI.md` confirming the date of this test-free cleanup.

## Acceptance Criteria
- **AC1:** Running `find . -name "*.test.*" -o -name "*.spec.*"` from the repository root returns zero results.
- **AC2:** No test runner scripts or test-specific dependencies remain in `package.json` or `pom.xml`.
- **AC3:** `GEMINI.md` includes a new entry in its existing list reflecting the cleanup completion date.
- **AC4:** The CI pipeline (GitHub Actions) runs successfully without attempting to execute a test phase.

## Out of Scope
- Modifying core application logic or production code.
- Removing code quality tools (like ESLint or Prettier) that are not strictly test runners.