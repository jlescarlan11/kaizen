# Specification: UI Refinement - Unify Onboarding Step 1

## Overview
The current onboarding process in Kaizen uses a custom `BalanceSetupStep` that asks for starting funds and a funding source. This is redundant with the `Add Income` transaction flow. This track will replace the custom form in Onboarding Step 1 with the shared `TransactionEntryForm` component to ensure consistency and reduce code duplication.

## Functional Requirements
1.  **Component Integration:** Replace the current form in `BalanceSetupStep.tsx` with the `TransactionEntryForm` component.
2.  **Transaction Context:** The form should be locked to the `INCOME` type during onboarding.
3.  **Refactor `TransactionEntryForm`:** Update the shared component to support:
    -   An optional `onSuccess` callback to override the default navigation to the home page.
    -   An optional `initialType` prop to lock or default the transaction type.
    -   Optional flags to hide advanced fields (e.g., `hideRecurring`, `hideReceipt`) to keep onboarding streamlined.
4.  **Onboarding Flow:**
    -   Upon successful transaction creation, the user should be automatically advanced to Onboarding Step 2 (`BUDGET`).
    -   The system should still record the onboarding progress (updating the `currentStep` in the backend).
5.  **Data Alignment:** The "Starting Funds" and "Payment Method" previously tracked in Step 1 will now be represented by the Income Transaction's amount and payment method.

## Non-Functional Requirements
-   **Maintainability:** Use shared components to reduce the surface area for future bugs.
-   **UX Consistency:** Ensure the look and feel of data entry in onboarding matches the rest of the application.

## Acceptance Criteria
- [ ] Onboarding Step 1 displays the standard `TransactionEntryForm`.
- [ ] Transaction type is restricted to `INCOME` in the onboarding context.
- [ ] Saving the transaction correctly updates the database and backend onboarding progress.
- [ ] Successful save triggers a navigation to the Budget Setup step.
- [ ] `TransactionEntryForm` continues to work correctly in its existing locations (e.g., Transaction Entry page).

## Out of Scope
-   Refactoring Step 2 (Budgets) or other onboarding steps.
-   Redesigning the `TransactionEntryForm` beyond making it more configurable.
