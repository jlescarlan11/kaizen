# Dashboard Enhancements Plan

## Objective
To enhance the Kaizen home dashboard by integrating new analytical and utility features (Quick Actions, Top Categories, Budget Burn Rates, and Upcoming Bills) while maintaining the established "Compact" and "Low Noise" aesthetic.

## Key Files & Context
- `frontend/src/features/home/HomePage.tsx`: Main layout structure.
- `frontend/src/features/home/components/HomeDashboardHeader.tsx`: Needs Quick Actions.
- `frontend/src/features/home/components/`: New components will reside here.
- `frontend/src/app/store/api/`: Existing APIs (`insightsApi`, `budgetApi`, `transactionApi`) provide the required data.
- `DESIGN_MEMORY.md`: Defines the `AnalyticsCard` and `ActivityListCard` patterns to follow.

## Implementation Steps

### Phase 1: Quick Action "Speed Dial" (Hero Level)
- **Goal:** Add 1-tap utility buttons without cluttering the grid.
- **Action:** Update `HomeDashboardHeader` to include a row of pill-shaped buttons directly underneath the balance display.
- **Buttons:** 
  - "Add Transaction" (Icon: `plus`)
  - "Transfer" (Icon: `refresh`)
  - "New Budget" (Icon: `target`)

### Phase 2: Top Categories (Analytics Level)
- **Goal:** Complement the 30-Day Spending graph by showing *what* was bought.
- **Action:** Create `TopCategoriesCard.tsx` using the `AnalyticsCard` pattern.
- **Data:** Use `useGetCategoryBreakdownQuery` from `insightsApi` (configured for the last 30 days).
- **Visualization:** A dense list of the top 3-4 categories with compact, horizontal progress bars indicating their proportion of the total spend.

### Phase 3: Budget Burn Rates (Analytics Level)
- **Goal:** Highlight active budgets running "hot".
- **Action:** Create `BudgetBurnRateCard.tsx` using the `AnalyticsCard` pattern.
- **Data:** Use `useGetBudgetsQuery` from `budgetApi`.
- **Visualization:** 3 thin, high-density progress bars showing `expense / amount`. Color coding: primary (normal), warning (near limit), error (over budget).

### Phase 4: Layout Reorganization (Bento Grid)
- **Goal:** Integrate the new components logically.
- **Action:** Update `HomePage.tsx`.
  - Top Row: `SpendingGraphCard` (col-span-8) + `TopCategoriesCard` (col-span-4).
  - Middle Row: `WalletBento` (col-span-7) + `BudgetBurnRateCard` (col-span-5).

### Phase 5: Upcoming Bills (Timeline Level)
- **Goal:** Provide a forward-looking cash flow view.
- **Action:** Create an `UpcomingBills.tsx` component or integrate it into the existing `TimelineActivity`.
- **Data:** Query transactions where `transactionDate` is in the future or `isRecurring` is true (needs investigation on how backend handles scheduled transactions). *Assumption for now: Backend supports future-dated transactions.*
- **Visualization:** A distinct visual section (perhaps with a subtle highlight or warning icon) above the recent transactions list.

## Verification & Testing
- Verify all data fetching hooks use the correct date ranges and parameters.
- Ensure the Bento grid responds correctly on mobile (stacking logically).
- Check contrast ratios for the new components (especially the Budget Burn Rate progress bars).
- Confirm Quick Actions navigate to the correct routes.