# Implementation Plan: Clickable Account Breakdown with Filtered Redirection

This plan outlines the steps to make payment methods in the account breakdown clickable, redirecting users to a filtered Transactions page.

## Phase 1: Core Logic & Types

- [ ] **Task: Update Filter Types**
    - [ ] Modify `frontend/src/features/transactions/types.ts` to add `paymentMethods: number[]` to the `FilterState` interface.
- [ ] **Task: Update Filter Pipeline**
    - [ ] Update `applyFilter` in `frontend/src/features/transactions/utils/pipelineUtils.ts` to filter transactions by `paymentMethod.id` if `paymentMethods` are selected in the filter state.
- [ ] **Task: Update Transaction List Page Logic**
    - [ ] Update `TransactionListPage.tsx`:
        - [ ] Read `paymentMethodId` search parameters and initialize `filterState.paymentMethods`.
        - [ ] Update the `useEffect` that syncs `filterState` to URL parameters to include `paymentMethodId`.
        - [ ] Update `INITIAL_FILTER` and `handleClearFilter` to include `paymentMethods`.
        - [ ] Update `isFilterActive` to consider `paymentMethods`.
        - [ ] Add visual indicator for active payment method filters (similar to categories/types).

## Phase 2: UI Components Enhancement

- [ ] **Task: Update Transaction Filter Component**
    - [ ] Update `TransactionFilter.tsx`:
        - [ ] Fetch payment methods using `useGetPaymentMethodsQuery`.
        - [ ] Add a new section "Payment Methods" in the filter popover.
        - [ ] Implement `togglePaymentMethod` logic and render payment method choices with checkboxes.
- [ ] **Task: Update Account Breakdown Widget**
    - [ ] Update `AccountBreakdownWidget.tsx`:
        - [ ] Import `useNavigate` from `react-router-dom`.
        - [ ] Import `ExternalLink` or `ChevronRight` icon from `lucide-react`.
        - [ ] Update the payment method item to be a clickable container (or add a clickable action).
        - [ ] Add the visual icon indicator and hover styles (pointer cursor, subtle background/text change).
        - [ ] Implement the `onClick` handler to navigate to `/transactions?paymentMethodId=<id>`.

## Phase 3: Verification & Polish

- [ ] **Task: Verification**
    - [ ] Verify that clicking a payment method in the Balance Summary page correctly redirects to the Transactions page.
    - [ ] Verify that the Transactions page is correctly filtered by the selected payment method.
    - [ ] Verify that the filter can be cleared on the Transactions page.
    - [ ] Verify that manual filtering by payment method in the Transactions page works correctly.
- [ ] **Task: Conductor - User Manual Verification 'Clickable Account Breakdown' (Protocol in workflow.md)**
