# Implementation Plan: Dynamic Onboarding UI Improvement

#### Phase 1: Preparation and Environment Setup
- [ ] Task: Review existing onboarding tests to understand the current coverage and testing strategy.
- [ ] Task: Verify the "Flat Out" design tokens in `shared/styles/layout.ts` and `shared/styles/typography.ts`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

#### Phase 2: Refactor Onboarding Layout and Step Progress
- [ ] Task: TDD: Create a new test file `frontend/src/tests/onboarding-progress.test.tsx` to define the expected progress indicator behavior.
- [ ] Task: TDD: Update `OnboardingLayout.tsx` to include a progress indicator (e.g., Step 1/2) that adapts to the current step.
- [ ] Task: TDD: Ensure `OnboardingLayout` uses a fully fluid container that handles extreme aspect ratios.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

#### Phase 3: Enhance Balance Setup Dynamic Experience
- [ ] Task: TDD: Update `frontend/src/tests/onboarding-balance-step.test.tsx` to include mobile-specific viewport tests.
- [ ] Task: TDD: Refactor `BalanceSetupStep.tsx` for mobile-first layout, ensuring clear separation between payment methods and inputs on small screens.
- [ ] Task: TDD: Standardize touch targets for the payment method list and inputs (minimum 48px height).
- [ ] Task: TDD: Improve the "Total Starting Funds" summary to be more prominent and easily readable on mobile.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

#### Phase 4: Refine Budget Setup Dynamic Experience
- [ ] Task: TDD: Update `frontend/src/tests/onboarding-budget-step.test.tsx` to include mobile-specific viewport tests.
- [ ] Task: TDD: Ensure `AllocationBar` and `BudgetCard` are fully responsive and meet "Flat Out" design principles on mobile.
- [ ] Task: TDD: Refine the fixed bottom action bar in `OnboardingBudgetStep.tsx` for better mobile reachability and visual feedback.
- [ ] Task: TDD: Verify `ResponsiveModal` provides a "drawer-like" experience on mobile devices.
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

#### Phase 5: Final Verification and Polish
- [ ] Task: Perform a final audit of all onboarding screens across multiple viewports (Mobile, Tablet, Desktop).
- [ ] Task: Run full test suite `npm test` and ensure all tests pass.
- [ ] Task: Ensure zero accessibility errors and strict adherence to "Flat Out" design rules.
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
