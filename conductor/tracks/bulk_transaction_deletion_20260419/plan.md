# Implementation Plan: Bulk Transaction Deletion

## Phase 1: Setup and State Management [checkpoint: 9a8972e]
- [x] Task: Define state for bulk selection (054b0e0)
    - [ ] Write failing test for toggling selection mode state.
    - [ ] Implement state logic to activate/deactivate selection mode.
    - [ ] Write failing test for selecting/deselecting individual transaction IDs.
    - [ ] Implement state logic to hold the array of selected IDs.
    - [ ] Write failing test for selecting/deselecting all currently visible IDs.
    - [ ] Implement state logic for "Select All".
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup and State Management' (Protocol in workflow.md) (9a8972e)

## Phase 2: TransactionList Component Updates [checkpoint: edeeb8c]
- [x] Task: Update List Header UI (9957290)
    - [ ] Write failing test for the "Select" toggle button in the list header.
    - [ ] Implement "Select" toggle button next to filters.
    - [ ] Write failing test for the "Select all on page" checkbox visibility.
    - [ ] Implement the "Select all" checkbox in the header.
- [x] Task: Update Transaction Row UI (ca629a2)
    - [ ] Write failing test for rendering checkboxes on rows during selection mode.
    - [ ] Implement checkbox rendering and visual highlighting for selected rows.
- [x] Task: Conductor - User Manual Verification 'Phase 2: TransactionList Component Updates' (Protocol in workflow.md) (edeeb8c)

## Phase 3: Action Bar and Confirmation Dialog [checkpoint: 9bffcf9]
- [x] Task: Create Persistent Action Bar (8fdc5d3)
    - [ ] Write failing test for the Action Bar rendering with correct selected count.
    - [ ] Implement the fixed-bottom Action Bar with "Delete selected" button.
- [x] Task: Create Confirmation Dialog (bfc2128)
    - [ ] Write failing test for confirmation dialog triggering on "Delete selected" click.
    - [ ] Implement the confirmation dialog ("Delete [N] transactions? This cannot be undone.").
- [x] Task: Conductor - User Manual Verification 'Phase 3: Action Bar and Confirmation Dialog' (Protocol in workflow.md) (9bffcf9)

## Phase 4: API Integration and Error Handling [checkpoint: 0e23800]
- [x] Task: Hook up the Bulk Delete Endpoint (5369439)
    - [ ] Write failing test for calling `bulkDeleteTransactions` API with selected IDs.
    - [ ] Implement API call on dialog confirmation.
    - [ ] Write failing test for list refresh and balance recalculation on success.
    - [ ] Implement success state updates (refresh list, clear selection).
- [x] Task: Implement Error Handling (5369439)
    - [ ] Write failing test for API error toast/snackbar notification.
    - [ ] Implement error handling toast/dialog with retry options and partial failure state retention.
- [x] Task: Conductor - User Manual Verification 'Phase 4: API Integration and Error Handling' (Protocol in workflow.md) (0e23800)