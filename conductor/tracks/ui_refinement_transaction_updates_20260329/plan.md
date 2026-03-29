# Implementation Plan: UI Refinement and Transaction Input Updates

## Phase 1: Budget Card Component Sharing & Styling
- [ ] Task: Create a shared `BudgetCard` component in `frontend/src/features/budgets/components/BudgetCard.tsx`.
- [ ] Task: Migrate the styling and logic from `OnboardingBudgetStep.tsx` to the shared `BudgetCard`.
- [ ] Task: Update `OnboardingBudgetStep.tsx` to use the shared `BudgetCard`.
- [ ] Task: Update `ManualBudgetSetupPage.tsx` to use the shared `BudgetCard` for consistent visuals.
- [ ] Task: Ensure that the "onboarding style" icons (Lucide icons) are correctly used for both.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Budget UI' (Protocol in workflow.md)

## Phase 2: Transaction Form Conditional Inputs
- [ ] Task: Modify `TransactionEntryForm.tsx` to conditionally hide the `CategorySelector` when the transaction type is `INCOME`.
- [ ] Task: Update `validationGate.ts` to skip category validation for Income transactions.
- [ ] Task: Update unit tests in `frontend/src/features/transactions/TransactionEntryForm.test.tsx` to verify:
    - [ ] Category selector is visible for EXPENSE.
    - [ ] Category selector is hidden for INCOME.
    - [ ] Form submission works for INCOME without a category.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Transaction Inputs' (Protocol in workflow.md)

## Phase 3: Mobile-First UI Refinement
- [ ] Task: Refactor `TransactionEntryForm.tsx` styling for a more "focused" dedicated page experience.
- [ ] Task: Ensure that all inputs (Amount, Date, Category, etc.) have appropriate touch targets and mobile-friendly spacing.
- [ ] Task: Verify that the UI scales correctly back to the current "Inline Card" layout on desktop screens.
- [ ] Task: Test the entire flow (Add/Edit Transaction) on mobile and desktop viewports.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Refinement' (Protocol in workflow.md)
