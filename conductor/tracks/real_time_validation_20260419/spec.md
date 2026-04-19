# Specification: Real-time Transaction Validation

## Overview
This track implements real-time form validation for the transaction entry form. Users will receive immediate visual feedback as they type or interact with the form fields, allowing them to correct mistakes before attempting to submit the form.

## Functional Requirements
- **Real-time Validation:** The form must validate user input immediately on every keystroke or selection change (`onChange`).
- **Fields to Validate:**
  - **Amount:** Must be present, numeric, and a positive value.
  - **Date:** Must be present and formatted as a valid date.
  - **Dropdowns (Category/Account):** Must have a valid selection.
  - **Note/Description:** Must not exceed the maximum allowed length.
- **Visual Feedback:** 
  - Fields with errors must display a red border.
  - Inline error text explaining the specific issue must be displayed directly below the affected field.

## Non-Functional Requirements
- **Performance:** The `onChange` validation should be performant and not cause noticeable input lag.
- **Accessibility:** Error messages must be accessible to screen readers (e.g., using `aria-invalid` and `aria-errormessage`).

## Acceptance Criteria
- [ ] Typing an invalid amount immediately shows a red border and an error message below the field.
- [ ] Correcting an invalid input immediately removes the error state.
- [ ] Leaving required fields (Date, Category, Account) blank or invalid shows an error immediately upon change.
- [ ] Exceeding the max length for the note/description field shows an error immediately.
- [ ] Error states use the project's standard error styling.
- [ ] Screen readers properly announce the validation errors.

## Out of Scope
- Backend validation changes.
- Auto-saving transactions as drafts.