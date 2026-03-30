# Track: Authenticated Home UI Refactor & Navigation Update

## Overview
This track focuses on refactoring the authenticated home screen ("/") to improve its visual hierarchy, navigation flow, and maintainability. It aims to transition from a card-based layout to a cleaner, line-separated list approach, replace modals with full-page detail screens for core entities (Transactions, Budgets, Goals), and unify iconography across the application using assets from the onboarding flow as a single source of truth.

## Functional Requirements
- **Flat UI List Refactor:** Replace card-based containers for home screen lists (Transactions, Budgets, Goals) with thin horizontal line separators.
- **Full-Page Navigation:** Update click actions on list items (Transactions, Budgets, Goals) to navigate to dedicated detail screens instead of opening modals.
- **Centralized Icon Registry:** Create a reusable `IconRegistry` or `SharedIcon` component that maps categories and payment methods to the icons used in the onboarding flow.
- **Generic DataList Component:** Implement a generic, scalable, and maintainable `DataList` (or `UnifiedList`) component to be used for these dashboard summaries and potentially elsewhere in the app.
- **Consistent Icons:** Update all UI elements (dashboard, detail screens, etc.) to use the unified icons from the centralized registry.

## Non-Functional Requirements
- **Maintainability:** Use clean, reusable components to reduce code duplication.
- **Performance:** Ensure smooth transitions between the dashboard and detail screens.
- **Scalability:** The new generic list component should easily accommodate new data types or list styles in the future.
- **Mobile First:** Ensure the new list layout and navigation feel native and responsive on mobile devices.

## Acceptance Criteria
- [ ] Home screen lists (Transactions, Budgets, Goals) use horizontal line separators instead of card containers.
- [ ] Clicking any item in these lists navigates to its corresponding full-page detail screen.
- [ ] Modals for viewing details are removed or deprecated in favor of detail screens.
- [ ] A new reusable component manages these lists, providing a consistent look and feel.
- [ ] Icons for categories and payment methods match the ones used in the onboarding flow.
- [ ] All existing unit and integration tests pass after the refactor.

## Out of Scope
- Redesigning the detail screens themselves (only the navigation to them is in scope).
- Updating the creation/edit flow if it still requires modals (unless specified later).
- Changes to the unauthenticated home screen.
