# Implementation Plan: Transaction Accuracy & Global UI Refinement (2026-04-11)

## Phase 1: Research & Discovery
- [ ] Task: Identify all "Inflow" and "Outflow" occurrences in the codebase (frontend and backend).
- [ ] Task: Investigate the timezone issue:
    - [ ] Trace transaction creation from frontend form to backend controller.
    - [ ] Verify database column type for transaction timestamps.
- [ ] Task: Reproduce and analyze the overlapping dropdown issue on desktop.
- [ ] Task: Conductor - User Manual Verification 'Research & Discovery' (Protocol in workflow.md)

## Phase 2: Global Terminology Refactor
- [ ] Task: Implement TDD for terminology changes (verify specific labels in tests).
- [ ] Task: Update frontend components:
    - [ ] Change "Inflow" to "Income".
    - [ ] Change "Outflow" to "Expense".
- [ ] Task: Update backend DTOs/Enums if they affect the UI labels.
- [ ] Task: Conductor - User Manual Verification 'Global Terminology Refactor' (Protocol in workflow.md)

## Phase 3: Timezone & Accuracy Fix
- [ ] Task: Implement TDD for timezone accuracy (test cases for local vs UTC conversion).
- [ ] Task: Fix frontend date-time handling to capture local timezone.
- [ ] Task: Update backend entity mapping/serialization to handle timezone-aware timestamps correctly.
- [ ] Task: Verify fix with Philippines time (UTC+8) test cases.
- [ ] Task: Conductor - User Manual Verification 'Timezone & Accuracy Fix' (Protocol in workflow.md)

## Phase 4: UI/UX Fixes
- [ ] Task: Implement TDD for UI positioning (verify Z-index/visibility where possible).
- [ ] Task: Correct the Z-index and positioning of the dropdown filters on `/transactions`.
- [ ] Task: Verify responsiveness and layout on desktop resolutions.
- [ ] Task: Conductor - User Manual Verification 'UI/UX Fixes' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 8bebc3e
