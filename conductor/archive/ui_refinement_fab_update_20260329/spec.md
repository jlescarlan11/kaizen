# Specification: UI Refinement and FAB Update

## Overview
Refine the application's user interface to use a "flat out" design by removing surface cards, standardize currency formatting to use the "PHP" prefix, update budget icons to match the creation flow, and introduce a Speed Dial FAB with expanded functionality.

## Functional Requirements
- **FAB Enhancement (Speed Dial):**
  - Replace the current single-action FAB with a Speed Dial component.
  - When clicked, it should expand upwards to reveal four options:
    1. Add transaction
    2. Create Budget
    3. Create Goal
    4. Hold Purchase
- **Currency Standardization:**
  - Remove the Peso sign (₱) across the app.
  - Standardize currency display to use "PHP" as a prefix (e.g., "PHP 1,000.00").
- **Budget Icons:**
  - Update the icons displayed in budget lists/summaries to use the exact same icons selected/used when a budget is created.

## Non-Functional Requirements (UI/UX)
- **Flat UI Design:**
  - Remove surface cards (elevations, shadows, distinct background card colors) to create a flat UI for:
    - Dashboard Widgets
    - Transaction Lists
    - Budget Items
  - Ensure the new flat design maintains proper spacing, visual hierarchy, and readability.

## Acceptance Criteria
- [ ] Clicking the FAB opens a Speed Dial with the 4 specified options.
- [ ] No Peso signs are visible in the app; all currency values are prefixed with "PHP ".
- [ ] Budgets in the list display the corresponding icon chosen during their creation.
- [ ] Dashboard widgets, transaction lists, and budget items appear flat without card styling or shadows.