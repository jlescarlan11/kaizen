# Dashboard Intelligence Plan (Phases 10-12)

## Objective
To transition the dashboard from "Visual Analysis" to "Actionable Intelligence" by providing predictive metrics and data-driven tasks.

## Implementation Steps

### Phase 10: Smart Metrics (Runway & Daily Limit)
- **Financial Runway Hook:** 
  - Fetch total liquidity from `paymentMethodApi`.
  - Fetch spending summary for the last 90 days from `insightsApi`.
  - Calculate `Runway = Liquidity / (Total Expenses / 3)`.
- **Daily Spending Limit Hook:**
  - Fetch `totalAllocated` and `totalSpent` (current month) from `budgetApi.getBudgetSummary`.
  - Calculate `Limit = (Total Allocated - Total Spent) / Days Remaining in Month`.

### Phase 11: Data Hygiene & Highlights (The "Action Center")
- **Action Center Component:** A new card `ActionCenterCard.tsx` that rotates between "Tasks" and "Highlights".
- **Hygiene Logic:** 
  - Scan recent transactions for "Uncategorized" labels.
  - Check if any payment methods have $0 balance (prompt to archvie/re-link).
- **Highlight Logic:**
  - "Winner of the Week": The day with the lowest spending (above $0).
  - "Alert": Any single transaction that is >200% of the daily average.

### Phase 12: The "Command Center" Grid Polish
- **Action:** Consolidate the grid to prevent information overload.
- **New Structure:**
  - **Top Row (Trends):** `SpendingGraphCard` (8) + `ActionCenterCard` (4)
  - **Mid Row (Capital):** `WalletBento` (6) + `FinancialIntelligenceCard` (Runway, Limit, Health) (6)
  - **Bottom Row (Ops):** `BudgetBurnRateCard` (4) + `TopCategoriesCard` (4) + `UpcomingBills` (4)
  - **Footer Row:** `TimelineActivity` (Full)

## Verification
- Ensure "Days Remaining in Month" logic handles month-ends correctly.
- Verify Runway doesn't divide by zero if expenses are $0.
- Confirm "Uncategorized" detection works across all transaction types.