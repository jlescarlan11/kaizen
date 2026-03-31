# Specification: UI/UX Refinement for /transactions

## Overview
This track focuses on updating the UI and UX of the `/transactions` page to align with the modern, "flat UI" design of the authenticated home page (`/`). It includes removing the total balance, adding money flow metrics (incoming vs. outgoing), and improving the transaction list with grouping, filtering, and search functionality.

## Functional Requirements
- **UI Mirroring:** The `/transactions` page should use the same header style, spacing, and "flat" card design as the authenticated home page.
- **Money Flow Metrics:**
  - Calculate and display "Incoming" (Income/Credits) vs. "Outgoing" (Expenses/Debits) for the current view/period.
  - Implement a visual ratio indicator (e.g., a progress bar or simple numeric comparison) to help users quickly understand their spending-to-income ratio.
- **Balance Removal:** Completely remove the "Total Balance" display from the `/transactions` page.
- **List Improvements:**
  - **Date Grouping:** Group transactions by date (e.g., "Today", "Yesterday", "October 2023").
  - **Category Filtering:** Add quick filters for categories or payment methods.
  - **Search Bar:** Implement an interactive text search to filter transactions by description or amount.

## Non-Functional Requirements
- **Mobile Responsiveness:** Ensure the new layout and flow indicators work seamlessly on mobile devices.
- **Performance:** Ensure filtering and search operations are efficient and provide immediate feedback.
- **Accessibility:** Maintain zero accessibility errors (WCAG 2.1 compliance).

## Acceptance Criteria
- [ ] `/transactions` header and layout mirror the authenticated home page.
- [ ] "Total Balance" is no longer visible on the page.
- [ ] "Incoming" and "Outgoing" totals are displayed with a visual ratio indicator.
- [ ] Transactions are grouped by date in the list.
- [ ] Users can filter transactions by category.
- [ ] Users can search for transactions via a search bar.
- [ ] UI is responsive and accessible.

## Out of Scope
- Backend changes to the transaction data model (unless necessary for the new metrics).
- Modifications to other pages besides `/transactions`.
