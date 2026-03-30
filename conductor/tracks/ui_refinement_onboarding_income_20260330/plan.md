# Implementation Plan: UI Refinement - Unify Onboarding Step 1

## Overview
This plan focuses on refactoring the shared `TransactionEntryForm` to be more flexible and then integrating it into the Onboarding Step 1 to replace the current custom form.

---

## Phase 1: Refactor `TransactionEntryForm` for Flexibility
- [ ] Task: Create unit tests for refactored `TransactionEntryForm` props.
    - [ ] Write tests in `TransactionEntryForm.test.tsx` for `onSuccess` callback.
    - [ ] Write tests for `initialType` prop (e.g., locking to INCOME).
    - [ ] Write tests for hiding advanced fields (`hideRecurring`, `hideReceipt`).
- [ ] Task: Implement prop-based customization in `TransactionEntryForm.tsx`.
    - [ ] Add `onSuccess?: () => void` to props.
    - [ ] Add `initialType?: TransactionType` and `lockType?: boolean` to props.
    - [ ] Add `hideAdvancedFields?: boolean` (or specific flags like `hideRecurring`) to props.
    - [ ] Update `handleSubmit` to call `onSuccess` if provided, otherwise default to existing navigation.
- [ ] Task: Verify existing functionality of `TransactionEntryForm`.
    - [ ] Ensure the Transaction Entry page still works correctly without the new props.
- [ ] Task: Conductor - User Manual Verification 'Refactor TransactionEntryForm' (Protocol in workflow.md)

## Phase 2: Integrate `TransactionEntryForm` into Onboarding Step 1
- [ ] Task: Create unit tests for `BalanceSetupStep` integration.
    - [ ] Write tests in a new `BalanceSetupStep.test.tsx` (if it doesn't exist) or update existing ones.
    - [ ] Mock `TransactionEntryForm` to verify it receives the correct props.
- [ ] Task: Update `BalanceSetupStep.tsx` to use the refactored form.
    - [ ] Replace the current form layout with `TransactionEntryForm`.
    - [ ] Pass `initialType="INCOME"`, `lockType={true}`, and `hideAdvancedFields={true}`.
    - [ ] Implement an `handleSuccess` callback that calls `updateProgress` and advances the onboarding step.
- [ ] Task: Update `onboardingSlice.ts` to reflect the new data flow.
    - [ ] Evaluate if `startingFunds` and `fundingSourceType` in the slice should be updated after the transaction is saved (for subsequent steps).
- [ ] Task: Conductor - User Manual Verification 'Integrate TransactionEntryForm' (Protocol in workflow.md)

## Phase 3: Cleanup and Final Polish
- [ ] Task: Remove obsolete code and types.
    - [ ] Delete `fundingSource.ts` and `FundingSourceIcons.tsx` if no longer used.
    - [ ] Clean up `BalanceSetupStep.tsx` of unused imports and local state.
- [ ] Task: Final mobile-responsiveness and accessibility check.
    - [ ] Verify the form looks good on small screens during onboarding.
- [ ] Task: Conductor - User Manual Verification 'Cleanup and Final Verification' (Protocol in workflow.md)
