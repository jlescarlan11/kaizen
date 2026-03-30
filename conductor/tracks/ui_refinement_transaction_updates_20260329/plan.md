# Implementation Plan: UI Refinement and Transaction Input Updates

## Phase 1: Budget Card Component Sharing & Styling
- [x] Task: Create a shared `BudgetCard` component in `frontend/src/features/budgets/components/BudgetCard.tsx`. (453a38f)
- [x] Task: Migrate the styling and logic from `OnboardingBudgetStep.tsx` to the shared `BudgetCard`. (453a38f)
- [x] Task: Update `OnboardingBudgetStep.tsx` to use the shared `BudgetCard`. (453a38f)
- [x] Task: Update `ManualBudgetSetupPage.tsx` to use the shared `BudgetCard` for consistent visuals. (453a38f)
- [x] Task: Ensure that the "onboarding style" icons (Lucide icons) are correctly used for both. (453a38f)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Budget UI' (Protocol in workflow.md) (Confirmed by user)

## Phase 2: Transaction Form Conditional Inputs
- [x] Task: Modify `TransactionEntryForm.tsx` to conditionally hide the `CategorySelector` when the transaction type is `INCOME`. (ecd0d6c)
- [x] Task: Update `validationGate.ts` to skip category validation for Income transactions. (ecd0d6c)
- [x] Task: Update unit tests in `frontend/src/features/transactions/TransactionEntryForm.test.tsx` to verify: (ecd0d6c)
    - [x] Category selector is visible for EXPENSE.
    - [x] Category selector is hidden for INCOME.
    - [x] Form submission works for INCOME without a category.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Transaction Inputs' (Protocol in workflow.md) (Confirmed by user)

## Phase 3: Mobile-First UI Refinement
- [x] Task: Refactor `TransactionEntryForm.tsx` styling for a more "focused" dedicated page experience. (e489422)
- [x] Task: Ensure that all inputs (Amount, Date, Category, etc.) have appropriate touch targets and mobile-friendly spacing. (e489422)
- [x] Task: Verify that the UI scales correctly back to the current "Inline Card" layout on desktop screens. (e489422)
- [x] Task: Test the entire flow (Add/Edit Transaction) on mobile and desktop viewports. (e489422)
- [x] Task: Conductor - User Manual Verification 'Phase 3: UI Refinement' (Protocol in workflow.md) (Confirmed by user)
