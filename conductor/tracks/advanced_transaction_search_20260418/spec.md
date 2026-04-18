# Specification: Advanced Transaction Search and Filter

## 1. Overview
The goal of this track is to implement server-side search and filtering for the transaction history. This replaces the existing in-memory, client-side filtering, ensuring complete and accurate results across the entire dataset regardless of pagination.

## 2. Functional Requirements
- **Keyword Search:** A keyword search must evaluate the transaction description/merchant, user notes, and category name across the entire dataset.
- **Filters:** Support filtering by `category`, `type` (Flow Type: Income, Expense, Transfer), `account`, and a date range (`from` and `to`).
- **Execution:** All filters must be executed as SQL query predicates on the backend.
- **Pagination:** Pagination must be applied *after* all filters have been applied to the dataset.
- **API Endpoint:** The backend must support the `GET /transactions` endpoint with query parameters: `search`, `category`, `type`, `account`, `from`, `to`.

## 3. Non-Functional Requirements
- **Performance:** API response time for a filtered query over 10,000+ records must stay under 500ms.
- **Database:** Ensure database indexes exist on `date`, `category`, and `account_id` before deployment to support the performance requirement.
- **Deployment Strategy:** Use a Direct Cutover approach; remove client-side filter logic immediately after the backend is live.

## 4. Acceptance Criteria
- **AC1:** A keyword search (e.g., "Starbucks") returns all matching transactions across the full dataset, not just the current page.
- **AC2:** Filtering by category, type, account, and date range is executed as a SQL query predicate, not in-memory on the frontend.
- **AC3:** Pagination is applied after all filters, ensuring page 1 always reflects the filtered result set.
- **AC4:** All existing filter UI controls remain functionally identical to the user — no UX regression.
- **AC5:** API response time for a filtered query over 10,000+ records stays under 500ms (indexed columns).

## 5. Out of Scope
- Building new UI components for filtering (existing UI controls will be reused).
- Complex boolean logic in search (e.g., AND/OR operators within the search string).