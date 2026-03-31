# Implementation Plan: Authenticated Home UI Refactor & Navigation Update

## Phase 1: Foundation - Unified Icons & Shared Components

- [ ] **Task: Centralized Icon Registry**
    - [ ] Create a `SharedIcon` component and an accompanying `IconRegistry` mapping for categories and payment methods based on the onboarding flow.
    - [ ] Write tests for the registry to ensure all required icons are correctly mapped.
    - [ ] Implement the `SharedIcon` component to use the registry.
- [ ] **Task: Generic DataList Component**
    - [ ] Design and implement a reusable `DataList` (or `FlatList` variant) that supports horizontal separators and consistent styling.
    - [ ] Write unit tests for the `DataList` to ensure correct rendering of items and separators.
    - [ ] Implement the `DataList` component with support for headers and data injection.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md)**

## Phase 2: Refactor - Home Screen UI Updates

- [ ] **Task: Replace Card Layout with DataList**
    - [ ] Refactor the `Dashboard` (authenticated home screen) to use the new `DataList` for Transactions, Budgets, and Goals.
    - [ ] Apply "Global List Separators" styling (thin horizontal lines).
    - [ ] Write integration tests for the `Dashboard` to verify list item rendering.
    - [ ] Implement the UI changes, removing existing card containers.
- [ ] **Task: Icon Migration on Dashboard**
    - [ ] Update all category and payment method icons on the dashboard to use the `SharedIcon` component.
    - [ ] Verify icons match the onboarding flow assets.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Home Screen Refactor' (Protocol in workflow.md)**

## Phase 3: Navigation - Modal to Detail Transition

- [ ] **Task: Update List Actions for Transactions**
    - [ ] Modify the click handler for transaction items to navigate to the transaction detail screen.
    - [ ] Ensure navigation parameters are correctly passed.
    - [ ] Write integration tests for transaction navigation.
- [ ] **Task: Update List Actions for Budgets & Goals**
    - [ ] Modify the click handler for budget and goal items to navigate to their respective detail screens.
    - [ ] Write integration tests for budget and goal navigation.
- [ ] **Task: Remove/Deprecate Home Screen Modals**
    - [ ] Remove logic and components related to the summary modals from the home screen.
    - [ ] Ensure the FAB still functions correctly for new entry creation (if applicable).
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Navigation Update' (Protocol in workflow.md)**
