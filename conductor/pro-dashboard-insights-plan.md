# 'Pro' Dashboard Insights Plan

## Objective
To further elevate the Kaizen dashboard with advanced financial insights: Net Worth Trend, Savings Rate, Cash Flow Comparison, and Liquidity Split.

## Implementation Steps

### Phase 6: Net Worth Sparkline (Hero Header)
- **Goal:** Show balance growth over time without dedicated grid space.
- **Action:** Add a tiny, simplified LineChart (sparkline) to the `HomeDashboardHeader`, possibly positioned behind or next to the main balance.
- **Data:** Use `useGetBalanceTrendsQuery` from `insightsApi` (L30D, DAILY).

### Phase 7: Wealth Health Card (Analytics Level)
- **Goal:** Combine Savings Rate and Cash Flow Comparison into one high-impact card.
- **Action:** Create `WealthHealthCard.tsx` using the `AnalyticsCard` pattern.
- **Data:** 
  - `useGetSpendingSummaryQuery` for current month.
  - `useGetSpendingSummaryQuery` for previous month (to calculate MoM).
- **Visualization:** 
  - A circular "Savings Rate" gauge (e.g., "32% Saved").
  - A comparison sub-section: "Net Flow: +$1,200 (↑ 15% vs Last Month)".

### Phase 8: Liquidity Split (Wallet Level)
- **Goal:** Visualize the distribution of funds across account types.
- **Action:** Update `WalletBento.tsx` to include a header visualization.
- **Data:** Use `useGetPaymentMethodSummaryQuery` from `paymentMethodApi`.
- **Visualization:** A thin, segmented horizontal bar (stacked bar) where each segment represents a different payment method type (Cash, Bank, E-Wallet), colored by type.

### Phase 9: Final Layout Polish
- **Action:** Adjust the grid in `HomePage.tsx` to accommodate the `WealthHealthCard`.
- **Proposed Grid:**
  - Row 1: `SpendingGraphCard` (8) + `TopCategoriesCard` (4)
  - Row 2: `WalletBento` (6) + `WealthHealthCard` (6)
  - Row 3: `BudgetBurnRateCard` (4) + `TimelineActivity` (8) (with `UpcomingBills` inside)

## Verification
- Cross-check MoM calculations for accuracy.
- Ensure sparkline in header is non-interactive to prevent layout shifts.
- Verify color-coding consistency (Success for growth, Neutral for split).