# Track Specification: Transaction Filter Enhancement

## Overview
This track enhances the transaction filtering system on the Transaction Page to provide better control over date ranges and clearer categorization of fund movements using "Inflow" and "Outflow" terminology. It also addresses the exclusion of "Initial Balance" when filtering for income.

## Functional Requirements
- **Date Range Filter**: 
  - Implement a hybrid date range selector with common presets (e.g., "Last 7 Days", "Last 30 Days", "Current Month") and a custom date range picker ("From" and "To").
  - Filter results dynamically or upon clicking an "Apply" button based on the selected range.
- **Terminology Refactor (UI)**:
  - Update all UI-facing labels for "Income" to "Inflow".
  - Update all UI-facing labels for "Expense" to "Outflow".
  - This is restricted to the UI layer (Filters, Lists, Summaries) and does not require database or backend schema changes.
- **Initial Balance Integration**:
  - The "Inflow" filter MUST include "Initial Balance" transactions.
  - Ensure that selecting the "Inflow" filter type correctly displays "Initial Balance" entries.
- **Mobile UX**:
  - The new filters should be displayed in an "Inline Stack" (horizontal scroll or vertical stack) to maintain accessibility on smaller screens.

## Non-Functional Requirements
- **Accessibility**: Date pickers must be keyboard-navigable.
- **Consistency**: Maintain existing color coding (e.g., Green for Inflow, Red for Outflow) where applicable.

## Acceptance Criteria
- [ ] Users can filter transactions by a specific custom date range.
- [ ] Users can filter transactions using preset date ranges.
- [ ] Labels in the filter and transaction list reflect "Inflow" and "Outflow".
- [ ] Filtering by "Inflow" successfully includes "Initial Balance" transactions.
- [ ] The filter layout is responsive and usable on mobile devices.

## Out of Scope
- Backend/Database schema changes for transaction types.
- Changes to the "Add Transaction" form terminology (unless requested, but for now we'll stick to filters and lists).
