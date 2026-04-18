# Implementation Plan: Bulk Transaction Deletion

## Phase 1: Setup and State Management
- [~] Task: Define state for bulk selection
    - [ ] Write failing test for toggling selection mode state.
    - [ ] Implement state logic to activate/deactivate selection mode.
    - [ ] Write failing test for selecting/deselecting individual transaction IDs.
    - [ ] Implement state logic to hold the array of selected IDs.
    - [ ] Write failing test for selecting/deselecting all currently visible IDs.
    - [ ] Implement state logic for "Select All".
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Setup and State Management' (Protocol in workflow.md)

## Phase 2: TransactionList Component Updates
- [ ] Task: Update List Header UI
    - [ ] Write failing test for the "Select" toggle button in the list header.
    - [ ] Implement "Select" toggle button next to filters.
    - [ ] Write failing test for the "Select all on page" checkbox visibility.
    - [ ] Implement the "Select all" checkbox in the header.
- [ ] Task: Update Transaction Row UI
    - [ ] Write failing test for rendering checkboxes on rows during selection mode.
    - [ ] Implement checkbox rendering and visual highlighting for selected rows.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: TransactionList Component Updates' (Protocol in workflow.md)

## Phase 3: Action Bar and Confirmation Dialog
- [ ] Task: Create Persistent Action Bar
    - [ ] Write failing test for the Action Bar rendering with correct selected count.
    - [ ] Implement the fixed-bottom Action Bar with "Delete selected" button.
- [ ] Task: Create Confirmation Dialog
    - [ ] Write failing test for confirmation dialog triggering on "Delete selected" click.
    - [ ] Implement the confirmation dialog ("Delete [N] transactions? This cannot be undone.").
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Action Bar and Confirmation Dialog' (Protocol in workflow.md)

## Phase 4: API Integration and Error Handling
- [ ] Task: Hook up the Bulk Delete Endpoint
    - [ ] Write failing test for calling `bulkDeleteTransactions` API with selected IDs.
    - [ ] Implement API call on dialog confirmation.
    - [ ] Write failing test for list refresh and balance recalculation on success.
    - [ ] Implement success state updates (refresh list, clear selection).
- [ ] Task: Implement Error Handling
    - [ ] Write failing test for API error toast/snackbar notification.
    - [ ] Implement error handling toast/dialog with retry options and partial failure state retention.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: API Integration and Error Handling' (Protocol in workflow.md)