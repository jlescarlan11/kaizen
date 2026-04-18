# Implementation Plan: Advanced Transaction Search and Filter

## Phase 1: Backend Implementation (Spring Boot) [checkpoint: 6f03e3a]
- [x] Task: Add Database Indexes 1ff090b
    - [ ] Write Flyway migration script to add indexes on `date`, `category_id`, and `account_id` in the `transactions` table.
- [x] Task: Implement Transaction Search & Filter Repository Logic b28ac7d
    - [ ] Write integration tests for `TransactionRepository` (using Testcontainers) for keyword search (description, notes, category) and filters (category, flow type, account, date range) combined with pagination.
    - [ ] Implement `Specification` or `CriteriaBuilder` logic in `TransactionRepository` to satisfy the tests.
- [x] Task: Implement Transaction Search & Filter API Endpoint 9d80956
    - [ ] Write unit tests (MockMvc) for `GET /transactions` endpoint ensuring all query parameters (`search`, `category`, `type`, `account`, `from`, `to`) are correctly parsed and passed to the service layer.
    - [ ] Update `TransactionController` and `TransactionService` to handle the new query parameters and pagination.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Implementation (Spring Boot)' (Protocol in workflow.md) 6f03e3a

## Phase 2: Frontend Implementation (React / Redux Toolkit)
- [x] Task: Update API Client and Redux Store f68449b
    - [ ] Write unit tests for the updated Redux Toolkit RTK Query endpoint or thunk to ensure the new query parameters are correctly serialized in the request.
    - [ ] Update the `transactionsApi` definition to include `search`, `category`, `type`, `account`, `from`, and `to` query parameters.
- [ ] Task: Remove Client-Side Filtering
    - [ ] Write unit tests confirming that the client-side transaction selector/reducer no longer filters data in-memory and relies entirely on the API response.
    - [ ] Remove the in-memory filtering logic from the frontend state/selectors.
- [ ] Task: Integrate UI Controls with Server-Side Filtering
    - [ ] Write unit tests (using React Testing Library) for the transaction list component to ensure that changing UI filters dispatches the updated API query with pagination reset to page 1.
    - [ ] Update the transaction list component to map existing UI filter state to the new API request parameters.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation (React / Redux Toolkit)' (Protocol in workflow.md)