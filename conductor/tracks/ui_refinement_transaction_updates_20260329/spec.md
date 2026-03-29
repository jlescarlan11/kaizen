# Specification: UI Refinement and Transaction Input Updates

## Overview
Update the budget icon style to match the onboarding experience and refactor the transaction entry UI to be more focused and mobile-first. This includes updating transaction inputs based on the transaction type (Income vs Expense).

## Functional Requirements
1. **Budget Icon Style:**
   - Update budget cards in `ManualBudgetSetupPage` to use the same `BudgetCard` component or style as in `OnboardingBudgetStep`.
   - Use the "onboarding style" icons (Lucide icons where applicable) to maintain a single source of truth.
2. **Transaction Entry UI:**
   - Refactor `TransactionEntryForm` to be a more focused, dedicated page experience.
   - **Expense Fields:** Amount, Category, Payment Method, Date (Optional), Description (Optional), Notes (Optional), Attachment (Optional).
   - **Income Fields:** Amount, Payment Method, Date (Optional), Description (Optional), Notes (Optional), Attachment (Optional). (Category is excluded for Income).
   - Maintain the "Recurring" options as a secondary section.
3. **Responsive Design:**
   - Mobile-first approach: Optimized for touch and mobile screens.
   - Desktop scaling: Scale into an inline card layout on larger screens (maintaining current behavior).

## Acceptance Criteria
- Budget cards in manual setup match onboarding visuals exactly.
- Transaction form dynamically shows/hides fields based on type (Income/Expense).
- Income transactions are successfully saved without a category.
- Mobile UI is intuitive and touch-friendly.
- Desktop UI remains clean and centered/contained in a card.
- Offline support and validation continue to work for the new form structure.

## Out of Scope
- Backend schema changes.
- New types of attachments beyond existing image/PDF support.
