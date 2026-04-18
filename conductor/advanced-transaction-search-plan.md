# Implementation Plan: Advanced Transaction Search and Filtering

## Background & Motivation
Currently, transaction filtering and searching are handled client-side in the frontend. Because the API uses cursor-based pagination, client-side filtering only applies to the data currently loaded on the screen, causing inaccuracies and missing results. To fix this, we need to move the filtering and search logic to the backend so it can be applied to the entire dataset before pagination.

## Scope & Impact
- **Backend:** Update `TransactionController.java`, `TransactionService.java`, and `TransactionRepository.java` to support dynamic SQL queries based on active filters (keywords, categories, date ranges).
- **Frontend:** Update the `transactionApi.ts` client to send filters as URL parameters. Refactor `TransactionListPage.tsx` and `useTransactionPipeline.ts` to trigger a backend fetch with debouncing (auto-fetch) whenever filters change, removing local client-side filtering.
- **Database:** No schema changes required, but SQL queries will be more complex.

## Proposed Solution
We will implement server-side filtering using Spring Data JPA Specifications. This allows us to dynamically construct queries based on optional parameters:
1.  **Backend API:** Add optional query parameters (`search`, `categories`, `startDate`, `endDate`, `minAmount`, `maxAmount`) to the `GET /api/transactions` endpoint.
2.  **JPA Specifications:** Create a new `TransactionSpecification.java` class to build the predicates type-safely.
3.  **Frontend UX:** Update the frontend to use a debounced auto-fetch strategy. As the user types or selects filters, the URL parameters will update and trigger a fresh paginated request to the backend.

## Alternatives Considered
-   **JSON POST Payload for Search:** Creating a dedicated `/search` endpoint accepting a complex JSON payload. *Rejected* because standard REST query parameters are sufficient for our filtering needs and easier to manage with GET requests and caching.
-   **Explicit Search Button:** Requiring the user to click "Apply" to fetch results. *Rejected* in favor of a debounced auto-fetch for a more responsive and modern user experience.

## Implementation Plan

### Phase 1: Backend API and Repository Updates
1.  **Repository:** Update `TransactionRepository` to extend `JpaSpecificationExecutor<Transaction>`.
2.  **Specification:** Create `TransactionSpecification.java` with static methods for each filter criterion (e.g., `hasKeyword`, `hasCategoryIn`, `dateBetween`).
3.  **Service:** Update `TransactionService.getTransactionPaginated` to accept filter parameters, build the Specification, and pass it to the repository.
4.  **Controller:** Update `TransactionController.getTransactions` to accept the new optional query parameters (`search`, `categoryIds`, `startDate`, `endDate`, `minAmount`, `maxAmount`) and pass them to the service.

### Phase 2: Frontend API Client and Hook Updates
1.  **API Client:** Update `transactionApi.getTransactions` in `frontend/src/features/transactions/api/transactionApi.ts` to accept a `TransactionFilters` object and serialize it into URL query parameters.
2.  **Custom Hook:** Refactor `useTransactionPipeline.ts` (or the relevant data fetching hook) to pass the current filter state to the API client. Implement a debounce (e.g., 300ms) on the filter state to avoid excessive API calls while typing.

### Phase 3: Frontend UI Refactoring
1.  **Remove Client Filtering:** Remove all client-side filtering logic from `TransactionListPage` and `useTransactionPipeline`. The data returned from the API should be rendered directly.
2.  **Filter Components:** Ensure `TransactionFilter.tsx` and `TransactionSearch.tsx` update the shared filter state correctly.

## Verification
-   **Backend:** Ensure filtering correctly restricts paginated data on the backend.
-   **Search:** Verify that searching correctly queries descriptions and notes.
-   **Pagination:** Test that "Load More" functionality fetches the next page of the filtered dataset without duplicates or errors.
-   **Reset:** Verify that clearing filters resets the list to the default state.

## Migration & Rollback
-   **Migration:** No database migration is required. This is a backward-compatible API update if parameters are optional.
-   **Rollback:** Revert backend controller/service/repository changes and restore the previous client-side filtering logic in the frontend hooks.