# Implementation Plan: UI Refinement and FAB Update

## Phase 1: Currency Standardization [checkpoint: af4695a]
- [x] Task: Write Tests - Add/Update unit tests for currency formatting utility to expect "PHP X" instead of "₱X". 0a33b9c
- [x] Task: Implement - Update global currency formatter to use "PHP " prefix and remove all hardcoded "₱" signs. 0a33b9c
- [x] Task: Conductor - User Manual Verification 'Phase 1: Currency Standardization' (Protocol in workflow.md) af4695a

## Phase 2: Budget Icons Synchronization [checkpoint: 7632ed9]
- [x] Task: Write Tests - Add tests to verify that budget list components render the icon associated with the budget entity. 7685b0b
- [x] Task: Implement - Update budget list and summary components to consume and display the `icon` property from the budget object rather than a default/static icon. 7685b0b
- [x] Task: Conductor - User Manual Verification 'Phase 2: Budget Icons Synchronization' (Protocol in workflow.md) 7632ed9

## Phase 3: Flat UI Implementation [checkpoint: 7599cdc]
- [x] Task: Write Tests - Add/Update component tests for Dashboard Widgets, Transaction Lists, and Budget Items to verify the absence of card-specific CSS classes (e.g., shadows, surface colors). 7599cdc
- [x] Task: Implement - Refactor Dashboard Widgets styles to remove surface card UI. 7599cdc
- [x] Task: Implement - Refactor Transaction Lists styles to remove surface card UI. 7599cdc
- [x] Task: Implement - Refactor Budget Items styles to remove surface card UI. 7599cdc
- [x] Task: Conductor - User Manual Verification 'Phase 3: Flat UI Implementation' (Protocol in workflow.md) 7599cdc

## Phase 4: FAB Speed Dial Integration [checkpoint: 1547ec6]
- [x] Task: Write Tests - Add component tests for the new Speed Dial FAB to verify the presence of the 4 required actions and their click handlers. 1547ec6
- [x] Task: Implement - Replace existing FAB with a Speed Dial component containing: Add transaction, Create Budget, Create Goal, Hold Purchase. 1547ec6
- [x] Task: Conductor - User Manual Verification 'Phase 4: FAB Speed Dial Integration' (Protocol in workflow.md) 1547ec6