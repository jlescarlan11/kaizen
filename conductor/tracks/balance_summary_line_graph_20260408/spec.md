# Specification: Balance Summary Line Graph

## Overview
This track introduces a comprehensive line graph to the **Balance Summary** page, visualizing **Income**, **Expenses**, and **Net Balance** over time. This replaces or augments the current monthly cash flow visualization with a more interactive and detailed trend analysis tool, similar in function to the trends seen in the playground but utilizing the more feature-rich **Recharts** library.

## Functional Requirements

### 1. Unified Trend Graph
- **Graph Type:** Single line graph displaying three distinct data series:
  - **Income:** Standard green color representing inflows.
  - **Expenses:** Standard red/orange color representing outflows.
  - **Net Balance:** Neutral/Blue color representing the net position (Income - Expenses).
- **Default Range:** The graph defaults to the **Current Year**.
- **Granularity Toggle:** Users must be able to toggle the graph's granularity between **Daily** and **Monthly** views.
  - **Daily:** Shows trends for each day within the selected period.
  - **Monthly:** Shows consolidated monthly totals for the selected year.

### 2. Interactive Components
- **Tooltips:** When a data point is hovered or selected, a detailed tooltip should display:
  - Date (or Month)
  - Income Value
  - Expense Value
  - Net Balance Value
- **Legend:** A clear legend identifying each line by color and name.
- **Axes:** Standard X-axis (Dates/Months) and Y-axis (Currency Values in PHP).

### 3. Integration
- The graph will be integrated into the **Balance Summary** page.
- It should dynamically update when the global date filters (if applicable) are changed.

## Non-Functional Requirements
- **Performance:** Ensure efficient data fetching and rendering, especially for "Daily" views across a full year.
- **UX/UI:** Adhere to the project's **Flat UI** design system for container cards and typography.
- **Responsiveness:** The graph must scale properly on mobile devices.

## Acceptance Criteria
- [ ] A line graph is visible on the Balance Summary page.
- [ ] Three lines (Income, Expenses, Net Balance) are correctly displayed with appropriate color coding.
- [ ] The graph defaults to showing the current year's data.
- [ ] A functional toggle exists to switch between "Daily" and "Monthly" granularity.
- [ ] Hovering over data points shows a tooltip with accurate financial values.
- [ ] The graph is responsive and follows the established design system.

## Out of Scope
- Integration with predictive/AI-driven forecasting (to be handled in future tracks).
- Individual category breakdowns within the line graph (this is handled by the "Category Breakdown" pie chart).
