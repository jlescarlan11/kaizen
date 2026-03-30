# Implementation Plan: UI Refinement - Unify Onboarding Step 1

## Overview
This plan focuses on refactoring the shared `TransactionEntryForm` to be more flexible and then integrating it into the Onboarding Step 1 to replace the current custom form.

---

## Phase 1: Refactor `TransactionEntryForm` for Flexibility
- [x] Task: Create unit tests for refactored `TransactionEntryForm` props. f3fbd37
    - [x] Write tests in `TransactionEntryForm.test.tsx` for `onSuccess` callback.
    - [x] Write tests for `initialType` prop (e.g., locking to INCOME).
    - [x] Write tests for hiding advanced fields (`hideRecurring`, `hideReceipt`).
- [x] Task: Implement prop-based customization in `TransactionEntryForm.tsx`. f3fbd37
    - [x] Add `onSuccess?: () => void` to props.
    - [x] Add `initialType?: TransactionType` and `lockType?: boolean` to props.
    - [x] Add `hideAdvancedFields?: boolean` (or specific flags like `hideRecurring`) to props.
    - [x] Update `handleSubmit` to call `onSuccess` if provided, otherwise default to existing navigation.
- [x] Task: Verify existing functionality of `TransactionEntryForm`. f3fbd37
    - [x] Ensure the Transaction Entry page still works correctly without the new props.
- [x] Task: Conductor - User Manual Verification 'Refactor TransactionEntryForm' (Protocol in workflow.md)

## Phase 2: Integrate `TransactionEntryForm` into Onboarding Step 1
- [x] Task: Create unit tests for `BalanceSetupStep` integration. f3fbd37
    - [x] Write tests in a new `BalanceSetupStep.test.tsx` (if it doesn't exist) or update existing ones.
    - [x] Mock `TransactionEntryForm` to verify it receives the correct props.
- [x] Task: Update `BalanceSetupStep.tsx` to use the refactored form. f3fbd37
    - [x] Replace the current form layout with `TransactionEntryForm`.
    - [x] Pass `initialType="INCOME"`, `lockType={true}`, and `hideAdvancedFields={true}`.
    - [x] Implement an `handleSuccess` callback that calls `updateProgress` and advances the onboarding step.
- [x] Task: Update `onboardingSlice.ts` to reflect the new data flow. f3fbd37
    - [x] Evaluate if `startingFunds` and `fundingSourceType` in the slice should be updated after the transaction is saved (for subsequent steps).
- [ ] Task: Conductor - User Manual Verification 'Integrate TransactionEntryForm' (Protocol in workflow.md)

## Phase 3: Cleanup and Final Polish
- [ ] Task: Remove obsolete code and types.
    - [ ] Delete `fundingSource.ts` and `FundingSourceIcons.tsx` if no longer used.
    - [ ] Clean up `BalanceSetupStep.tsx` of unused imports and local state.
- [ ] Task: Final mobile-responsiveness and accessibility check.
    - [ ] Verify the form looks good on small screens during onboarding.
- [ ] Task: Conductor - User Manual Verification 'Cleanup and Final Verification' (Protocol in workflow.md)
