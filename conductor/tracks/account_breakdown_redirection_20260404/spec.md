# Track Specification: Clickable Account Breakdown with Filtered Redirection

## Overview
This feature enhances the "Account Breakdown" on the Balance Summary page. Users will be able to click on a specific payment method (e.g., "Cash", "Credit Card") and be redirected to the Transactions page, where the list will be automatically filtered to show only transactions related to that payment method.

## Functional Requirements
- **Clickable Payment Methods:** Each payment method item in the account breakdown list must be interactive.
- **Visual Indicators:** Add a small "external link" or "chevron" icon next to the payment method name to indicate it is a navigation link.
- **Interactive Cursor:** Change the cursor to a `pointer` when hovering over the payment method name/icon.
- **Redirection Logic:** When a payment method is clicked, the application should navigate the user to the `/transactions` page.
- **Filtering via URL:** The redirection must include a URL query parameter (e.g., `?paymentMethodId=<ID>` or `?paymentMethod=<Name>`) that the Transactions page can interpret.
- **Integrated Filtering:** The Transactions page should read the query parameter and apply the "Payment Method" filter automatically upon loading.
- **Reuse Existing UI:** Leverage the existing filtering, clearing, and empty state logic on the Transactions page.

## Non-Functional Requirements
- **User Experience:** The redirection should be smooth and immediate.
- **Maintainability:** Use standard React Router patterns for navigation and query parameter management.
- **Type Safety:** Ensure the payment method IDs or names are correctly passed and handled as strings/numbers.

## Acceptance Criteria
- [ ] Clicking a payment method in the Account Breakdown redirects to `/transactions`.
- [ ] The `/transactions` page loads with the correct payment method filter applied.
- [ ] The transactions list correctly reflects only the selected payment method.
- [ ] The "Clear Filter" or "X" button on the Transactions page successfully removes the payment method filter.
- [ ] Visual icons and pointer cursors are present and correctly styled.

## Out of Scope
- Adding new filtering capabilities to the Transactions page (this track assumes the underlying filter logic for payment methods already exists or is being extended to support URL params).
- Modifying the data structure of transactions or payment methods.
