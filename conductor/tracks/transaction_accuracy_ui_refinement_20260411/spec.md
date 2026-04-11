# Track: Transaction Accuracy & Global UI Refinement (2026-04-11)

## Overview
This track addresses a critical timezone offset bug where transactions are displayed in UTC instead of the user's local time (specifically an 8-hour difference for UTC+8/Philippines). It also includes a global terminology update, replacing "Inflow/Outflow" with "Income/Expense", and a UI fix for overlapping dropdown filters on the desktop version of the `/transactions` page.

## Functional Requirements
1.  **Timezone Correction:**
    *   Ensure that when a transaction is created, the time is correctly captured and displayed in the user's local timezone (UTC+8 for Philippines).
    *   Investigate and fix the conversion between frontend (local time), backend (API/JSON), and database (PostgreSQL `timestamp`).
2.  **Global Terminology Update:**
    *   Replace all instances of "Inflow" with "Income" across the entire application (Dashboard, Transactions, Summaries, Reports, etc.).
    *   Replace all instances of "Outflow" with "Expense" across the entire application.
3.  **UI/UX Improvement:**
    *   Fix the Z-index and positioning of the dropdown filters on the `/transactions` page to prevent them from overlapping other UI elements on desktop.

## Non-Functional Requirements
- **Consistency:** Ensure the terminology change is applied uniformly to maintain a professional and cohesive user experience.
- **Precision:** Financial data must reflect accurate timing for better record-keeping.

## Acceptance Criteria
- [ ] A transaction created at 10:06 PM (UTC+8) displays as 10:06 PM in the transaction list and details view.
- [ ] "Inflow" is replaced by "Income" globally in the UI.
- [ ] "Outflow" is replaced by "Expense" globally in the UI.
- [ ] Dropdown filters on the `/transactions` page no longer overlap with other page components on desktop.

## Out of Scope
- Adding new filtering capabilities not mentioned.
- Changing the underlying data structure (unless necessary for the timezone fix).
