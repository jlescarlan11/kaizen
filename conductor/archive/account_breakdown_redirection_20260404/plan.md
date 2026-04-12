# Implementation Plan: Clickable Account Breakdown with Filtered Redirection

This plan outlines the steps to make payment methods in the account breakdown clickable, redirecting users to a filtered Transactions page.

## Phase 1: Core Logic & Types

- [x] **Task: Update Filter Types**
    - [x] Modify `frontend/src/features/transactions/types.ts` to add `paymentMethods: number[]` to the `FilterState` interface.
- [x] **Task: Update Filter Pipeline**
    - [x] Update `applyFilter` in `frontend/src/features/transactions/utils/pipelineUtils.ts` to filter transactions by `paymentMethod.id` if `paymentMethods` are selected in the filter state.
- [x] **Task: Update Transaction List Page Logic**
    - [x] Update `TransactionListPage.tsx`:
        - [x] Read `paymentMethodId` search parameters and initialize `filterState.paymentMethods`.
        - [x] Update the `useEffect` that syncs `filterState` to URL parameters to include `paymentMethodId`.
        - [x] Update `INITIAL_FILTER` and `handleClearFilter` to include `paymentMethods`.
        - [x] Update `isFilterActive` to consider `paymentMethods`.
        - [x] Add visual indicator for active payment method filters (similar to categories/types).

## Phase 2: UI Components Enhancement [checkpoint: c485426]

- [x] **Task: Update Transaction Filter Component**
    - [x] Update `TransactionFilter.tsx`:
        - [x] Fetch payment methods using `useGetPaymentMethodsQuery`.
        - [x] Add a new section "Payment Methods" in the filter popover.
        - [x] Implement `togglePaymentMethod` logic and render payment method choices with checkboxes.
- [x] **Task: Update Account Breakdown Widget**
    - [x] Update `AccountBreakdownWidget.tsx`:
        - [x] Import `useNavigate` from `react-router-dom`.
        - [x] Import `ExternalLink` or `ChevronRight` icon from `lucide-react`.
        - [x] Update the payment method item to be a clickable container (or add a clickable action).
        - [x] Add the visual icon indicator and hover styles (pointer cursor, subtle background/text change).
        - [x] Implement the `onClick` handler to navigate to `/transactions?paymentMethodId=<id>`.

## Phase 3: Verification & Polish

- [x] **Task: Verification**
    - [x] Verify that clicking a payment method in the Balance Summary page correctly redirects to the Transactions page.
    - [x] Verify that the Transactions page is correctly filtered by the selected payment method.
    - [x] Verify that the filter can be cleared on the Transactions page.
    - [x] Verify that manual filtering by payment method in the Transactions page works correctly.
- [x] **Task: Conductor - User Manual Verification 'Clickable Account Breakdown' (Protocol in workflow.md)**
