# Specification: Bulk Transaction Deletion

## Overview
As a user, I want to select multiple transactions at once and delete them in a single action so that I can quickly clean up duplicate or erroneous entries without tedious one-by-one deletion.

## Functional Requirements
- **Selection Mode:** A "Select" toggle button in the list header (next to filters) activates selection mode on the `TransactionList` component.
- **Item Selection:** In selection mode, each row shows a checkbox. Selecting rows highlights them visually.
- **Bulk Selection:** A "Select all on page" checkbox in the list header selects or deselects all currently visible rows.
- **Action Bar:** A persistent action bar appears fixed at the bottom of the screen (on both mobile and desktop), showing the count of selected items and a "Delete selected" button.
- **Confirmation:** A confirmation dialog ("Delete [N] transactions? This cannot be undone.") is shown before executing the deletion.
- **API Integration:** Confirming deletion calls the existing `bulkDeleteTransactions` backend endpoint.
- **State Updates:** Upon successful deletion, the transaction list refreshes and the balance recalculates automatically.

## Non-Functional Requirements
- **Error Handling:** 
  - Show an error toast/snackbar for general failures.
  - If appropriate, provide a detailed error dialog with a retry option.
  - Retain the selection state for items that failed to delete (if the API supports partial success).
- **Responsiveness:** The fixed bottom action bar must be accessible and correctly styled across both mobile and desktop views without overlapping critical navigation.

## Out of Scope
- Backend development (the `bulkDeleteTransactions` endpoint already exists).
- Pagination-spanning selection (the "Select all" is scoped to the current page/visible rows).