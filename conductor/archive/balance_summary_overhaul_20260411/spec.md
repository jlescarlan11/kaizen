# Specification: Balance Summary UI/UX Overhaul

## Overview
This track focuses on decluttering and modernizing the `/balance-summary` page. The goal is to transform the current view into a high-performance financial dashboard that provides immediate chronological context, interactive data exploration, and clear filtering capabilities while adhering to the "Flat UI" design system.

## Functional Requirements
### 1. Chronological Visualization Engine
- **Past-to-Present Flow:** Charts (Income vs. Expense vs. Net Balance) must render chronologically from left to right, with the current date/month anchored to the far right of the X-axis.
- **Smart Granularity:**
    - **Daily Mode:** Automatically scopes to the days of the current calendar month.
    - **Monthly Mode:** Shows a trailing 12-month view ending in the current month.
- **Toggleable Datasets:** Interactive legend allowing users to hide/show specific lines (Income, Expense, Net Balance) to focus on specific trends.
- **Enhanced Tooltips:** High-signal tooltips showing exact PHP values and percentage change compared to the previous period.

### 2. High-Signal Filter System
- **Global Page Filter:** A prominent UI element to filter the entire summary by Date Range (Presets: This Month, Last Month, YTD, 1Y, Custom) and Account Selection.
- **Visual Feedback:** Active filters must be clearly displayed as removable chips.

### 3. Streamlined Account Breakdowns
- **Compact List View:** Replace large account cards with a streamlined list featuring:
    - **Mini-Sparklines:** Small 7-day trend indicators for each account balance.
    - **Quick Navigation:** Clicking an account redirects to its specific breakdown (filtered view).
- **Collapsible Layout:** Ability to collapse/expand the account list to maximize chart space.

### 4. Long-Term Value Additions (Phase 2 Integration)
- **Textual Insights:** A "Key Observations" widget summarizing trends (e.g., "Expenses are 12% lower than last month").
- **Goal Progress:** Visual indicators showing progress toward savings goals within the net balance context.
- **Export Actions:** CSV/PDF export for the current filtered summary.

## Non-Functional Requirements
- **Performance:** Chart rendering should remain smooth with up to 365 data points.
- **Accessibility:** All chart elements must have appropriate ARIA labels and keyboard-accessible legends.
- **Mobile Responsiveness:** Transition from Split-View (Desktop) to Vertical-Stack (Mobile) using Tailwind's responsive breakpoints.

## Acceptance Criteria
- [ ] Charts end with the current date/month on the far right.
- [ ] Daily view defaults to the current month's days.
- [ ] A visible, functional filter system is integrated into the page.
- [ ] Account list includes mini-sparklines.
- [ ] UI adheres to "Flat UI" principles (clean borders, no heavy shadows).

## Out of Scope
- Detailed individual transaction editing (handled in Transaction Details view).
- Multi-currency support (standardized to PHP per Product Guidelines).
