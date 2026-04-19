# Implementation Plan: Real-time Transaction Validation

## Phase 1: Test & Component Setup
- [ ] Task: Update Form Tests for Real-time Validation
    - [ ] Create/Update unit tests for Amount field `onChange` validation.
    - [ ] Create/Update unit tests for Date field `onChange` validation.
    - [ ] Create/Update unit tests for Dropdowns (Category/Account) `onChange` validation.
    - [ ] Create/Update unit tests for Note field `onChange` validation.
    - [ ] Assert that tests fail (Red Phase).
- [ ] Task: Update Form Component Logic (Green Phase)
    - [ ] Implement `onChange` handlers for Amount, Date, Category, Account, and Note fields.
    - [ ] Add real-time validation logic inside the handlers.
    - [ ] Verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'Test & Component Setup' (Protocol in workflow.md)

## Phase 2: UI Implementation & Accessibility
- [ ] Task: Update UI for Error States
    - [ ] Write unit tests to check for red border and inline error text when invalid.
    - [ ] Implement red border styling for invalid inputs.
    - [ ] Implement inline error text rendering below invalid inputs.
    - [ ] Verify tests pass.
- [ ] Task: Implement Accessibility for Errors
    - [ ] Add `aria-invalid` to invalid input fields.
    - [ ] Add `aria-describedby` linking the input to the error text.
    - [ ] Add tests for ARIA attributes on error state.
    - [ ] Verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation & Accessibility' (Protocol in workflow.md)