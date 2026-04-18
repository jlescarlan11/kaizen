# Design Document: Segmented Envelope Budget System

**Topic**: Budget Logic Fix & Period-Based Segmentation  
**Status**: Approved  
**Date**: 2026-04-12  
**Design Depth**: Deep  
**Task Complexity**: Medium  

## 1. Problem Statement
The current budget feature in Kaizen is fundamentally flawed, making it unreliable for tracking real-world spending.
*   **Historical Pollution**: `TransactionService` sums *all* historical expenses for a category, causing new budgets to appear overspent immediately if past transactions exist.
*   **Period Mismatch**: The backend supports multiple `BudgetPeriod` enums (Weekly, Monthly), but the frontend hardcodes "Monthly" labels and the logic lacks strict date-range filtering.
*   **Unclear Allocation**: "Remaining to Allocate" is calculated against the total account balance rather than periodic income, preventing users from effectively planning their monthly cash flow.
*   **Lack of Discipline**: There is no mechanism to track debt (overspending) or surplus (unspent funds) across budget cycles, leading to a "blank slate" every month that doesn't reflect financial reality.

## 2. Requirements
### Functional Requirements
*   **REQ-1: Segmented Pools**: Provide separate "Available to Allocate" balances for Weekly and Monthly periods (Traces To: Problem Statement).
*   **REQ-2: Date-Range Summing**: `TransactionService` must sum transactions strictly within the current calendar-aligned budget period in UTC (Traces To: Problem Statement).
*   **REQ-3: Initial Injection**: On first use, the system must allow a one-time injection of the total account balance into the allocation pool (Traces To: Onboarding).
*   **REQ-4: Net Rollover**: Unspent funds (surplus) or overspent funds (debt) must automatically rollover into the next period's pool for the same period type.
*   **REQ-5: Manual Transfer**: Users must be able to explicitly transfer funds between pools (e.g., Monthly to Weekly) via a new UI modal.
*   **REQ-6: Dynamic Period Labels**: Frontend components must display "Weekly Budget" or "Monthly Budget" based on the backend `BudgetPeriod` enum.

### Non-Functional Requirements
*   **NFR-1: Concurrency**: Budget updates must handle concurrent transaction imports safely using Optimistic Locking (@Version).
*   **NFR-2: Performance**: Dashboard metrics must load efficiently by caching allocation pool balances in the `UserAccount` entity.
*   **NFR-3: Data Integrity**: Budget sums must be recalculated accurately whenever transactions are added, edited, or deleted.

## 3. Approach
### Selected Approach: Segmented Envelope System
The chosen architecture implements a rigorous "Envelope" philosophy by segmenting funds into period-based pools. This ensures that short-term weekly expenses are matched against appropriate income and rollovers.

**Key Decisions & Rationale**:
*   **Segmented Pools (Weekly/Monthly)** — *Rationale: Separating weekly expenses from monthly ones provides the most accurate view of the user's cash flow (REQ-1).*
*   **Initial Injection (One-Time)** — *Rationale: Solves the "blank slate" problem for new users with existing savings (REQ-3).*
*   **Debt/Surplus Rollover (Deduct from Next Month)** — *Rationale: Enforces financial accountability by carrying over overspending as a penalty for the next month (REQ-4).*
*   **Manual Transfer (Explicit Action)** — *Rationale: Gives the user full control over how they "slice" their monthly income into weekly spending (REQ-5).* *(considered: Automatic Slicing — rejected because it can't handle variable pay dates; Cross-Pool Funding — rejected because it masks chronic overspending).*
*   **UTC Date Alignment** — *Rationale: Simplest for the backend and prevents boundary-drift between frontend and backend (REQ-2).*

### Decision Matrix
| Criterion | Weight | Selected: Segmented Envelope | Alternative: Unified Hybrid |
|-----------|--------|-------------------------------|----------------------------|
| Data Integrity | 40% | **5**: Eliminates all historical pollution and mismatches (Traces To: NFR-3). | **3**: Fixes main bug but allows cross-period masking. |
| User Experience | 30% | **3**: Highly disciplined but requires manual transfers (REQ-5). | **5**: Very simple; no new manual steps. |
| Performance | 10% | **4**: Efficient with cached fields in `UserAccount` (NFR-2). | **4**: Similar performance to current state. |
| Effort | 20% | **2**: Requires schema changes and new UI modals (REQ-1). | **5**: Mostly logic changes in existing services. |
| **Total** | | **3.9** | **4.0** |

## 4. Architecture
### Component Diagram
*   **`UserAccount` Entity**: Central store for segmented allocation pools (`availableMonthly`, `availableWeekly`).
*   **`BudgetService`**: Manages budget lifecycle, allocation pool logic, manual transfers, and initial injections.
*   **`TransactionService`**: Handles summing logic and updates budget expenses/pool balances based on transaction type (Income vs Expense).
*   **`BudgetsPage` (React)**: Main dashboard for managing budgets and viewing pool health indicators.
*   **`TransferFundsModal` (React)**: New UI component for manual transfers between Monthly and Weekly pools.

### Data Flow
1.  **Transaction Added**: `TransactionService` updates `Budget.expense` using `java.time` filters. If `type == INCOME`, it increments the relevant pool in `UserAccount`.
2.  **Budget Change**: `BudgetService` validates funds in the corresponding pool and updates the `UserAccount` balance.
3.  **Transfer**: `BudgetService.transferFunds` atomically moves funds between `availableMonthly` and `availableWeekly`.

## 5. Agent Team
*   **`data_engineer`**: Handle the database schema updates (Flyway), JPA `@Version` implementation, and `TransactionRepository` query updates.
*   **`coder`**: Implement the backend business logic in `BudgetService` and `TransactionService`, and update the frontend components (`BudgetsPage`, `BudgetDetailPage`, `TransferFundsModal`).
*   **`code_reviewer`**: Perform a final audit of the logic and concurrency handling.

## 6. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Concurrency Failure** | High | Low | **Optimistic Locking (@Version)**: JPA versioning will detect and retry concurrent updates during automated imports (NFR-1). |
| **Data Integrity Drift** | Medium | Low | **Strict UTC Boundaries**: Using `java.time` for all boundary calculations prevents drift between frontend and backend (NFR-3). |
| **User Friction** | Medium | Medium | **Clear UI Labels**: Use tooltips and explicit status messages to explain why manual transfers are needed (REQ-5). |
| **Performance Bottleneck** | Low | Low | **Cached Fields**: Storing balances in `UserAccount` avoids complex database joins during every dashboard load (NFR-2). |

## 7. Success Criteria
1.  **Historical Isolation**: New budgets start with zero spending even if past transactions in the same category exist.
2.  **Period Accuracy**: Monthly budgets sum from the 1st of the month; Weekly budgets sum for exactly 7 days from their start.
3.  **Balanced Allocation**: The sum of all allocated budgets plus the "Available to Allocate" balance for a period exactly matches the period's income plus rollover.
4.  **UI Consistency**: The frontend correctly labels budgets as "Weekly" or "Monthly" based on their period type.
