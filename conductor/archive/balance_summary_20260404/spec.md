# Specification: Balance Summary Icon & Page (balance_summary_20260404)

## Overview
Add a summary icon next to the total balance on the authenticated home screen. This icon will provide a quick gateway to a comprehensive "Balance Summary" page, allowing users to analyze their financial status through various lenses (accounts, income/expense, and historical trends).

## User Story
As an authenticated user, I want to see a "Balance Summary" icon next to my total balance so that I can easily access a detailed breakdown of my financial health without navigating through multiple menus.

## Functional Requirements
- **Home Screen Integration:**
    - Place a minimalist "Chart" icon (e.g., `Lucide ChartBar` or similar) to the immediate right of the total balance display.
    - The icon should be subtle, matching the typography of the balance value.
    - Tooltip or aria-label should indicate "View Balance Summary".
- **Navigation:**
    - Clicking the icon should navigate the user to `/balance-summary`.
- **Balance Summary Page (`/balance-summary`):**
    - **Account Breakdown:** Display a distribution of funds across different account types (Cash, Bank, Investments).
    - **Income vs. Expense:** Visualize the current month's income against expenses.
    - **Period Comparison:** Show a high-level comparison of the total balance or net flow against the previous month.
    - **Back Navigation:** Provide a clear "Back" button to return to the Home screen.

## Non-Functional Requirements
- **Responsiveness:** The icon and the summary page must be fully responsive (Mobile-first).
- **Accessibility:** Ensure proper keyboard navigation (tab index) and screen reader support (aria-labels).
- **Performance:** The summary page should load efficiently, utilizing existing Redux state where possible.

## Acceptance Criteria
- [ ] Chart icon is visible next to the total balance on the Home screen.
- [ ] Clicking the icon redirects to `/balance-summary`.
- [ ] `/balance-summary` page renders with the three requested sections (Breakdown, Income/Expense, Comparison).
- [ ] "Back" button on the summary page returns the user to the Home screen.
- [ ] UI follows the project's "Flat UI" and "Minimalist" design language.

## Out of Scope
- Detailed transaction lists within the summary page (covered by the Transactions feature).
- Advanced filtering or date range selection (initial version focuses on "Current Month/State").
