# Product Requirements Document

---

## 1. Document Header

| Field                      | Value             |
| -------------------------- | ----------------- |
| **Product / Feature Name** | Spending Insights |
| **Version**                | 1.0               |
| **Status**                 | Draft             |
| **Last Updated**           | _(fill in)_       |
| **Author**                 | _(fill in)_       |

---

## 2. Problem Statement

Users who maintain a complete transaction history have the raw material for financial self-awareness, but no surface that converts it into understanding. A list of transactions answers "what did I spend" at the record level but not "how much did I spend in total," "which categories consumed the most," or "is my spending increasing or decreasing over time." These questions require aggregation, grouping, and comparison across time — operations that a transaction list alone does not perform.

Without a summary, the user must mentally tally their totals each time they want a sense of their position. Without a category breakdown, they cannot see which areas of spending are largest without scanning and grouping every record manually. Without trend visibility, a month that feels expensive is indistinguishable from one that actually is — the user has no reference point and no way to detect drift in their habits before it becomes a problem.

Success looks like a user who can open a single insights surface and immediately see their total income and spending for a period, understand which categories account for the largest share of that spending, and identify whether their spending in any category or overall is moving up, down, or holding steady relative to prior periods — all without performing any calculation themselves.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Personal Finance User                                                                                                                                                                                                                                                  |
| **Role**            | User                                                                                                                                                                                                                                                                   |
| **Primary Goal**    | Understand their financial position and spending behavior at a summary level — totals, categorical distribution, and directional trends — without manual calculation                                                                                                   |
| **Key Pain Points** | No aggregate view of total spending or income for any period; no way to see which categories account for the most spending without manually reviewing every transaction; no mechanism to detect whether spending in a given area is increasing or decreasing over time |
| **Stories Owned**   | Stories 39, 40, 41                                                                                                                                                                                                                                                     |

---

## 4. Feature List

### Feature 1: Spending Summary

An aggregated view of total income and total expenses for a defined time period, along with the net difference between them.

- Story 39: _"As a user, I want spending summary so that I know my totals."_

**Core value:** Gives the user an immediate answer to their most fundamental financial question — how much came in, how much went out, and what the net result is — for any period they choose to examine.

---

### Feature 2: Category Breakdown

A view that distributes total spending across categories, showing the absolute amount and proportional share each category represents within the selected period.

- Story 40: _"As a user, I want category breakdown so that I see where money goes."_

**Core value:** Converts a flat total into a structured distribution, letting the user see not just how much they spent but where it went — which categories are largest and whether the distribution matches their intentions.

---

### Feature 3: Spending Trends

A view that compares spending values across multiple consecutive time periods, making directional movement — increases, decreases, and stability — visible without requiring the user to compare numbers manually.

- Story 41: _"As a user, I want spending trends so that I can see patterns over time."_

**Core value:** Adds a temporal dimension to spending data, letting the user detect behavioral patterns and changes that are invisible when looking at any single period in isolation.

`[Priority unconfirmed — verify with author]` — Features are ordered by analytical complexity: summary provides a single-period total, breakdown distributes that total, and trends compare across periods. Each builds on the prior. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 39:** _"As a user, I want spending summary so that I know my totals."_

Acceptance Criteria:

- [ ] Given the user navigates to the spending summary, when it loads, then it displays total income, total expenses, and net balance (income minus expenses) for the selected time period.
- [ ] Given the summary is displayed, when the user selects a different time period, then all three figures update to reflect only the transactions within the newly selected period — no transactions outside the period are included in the totals. `[INFERRED — verify with author: confirm available time period options — current month, last month, custom range, all time, or a defined set]`
- [ ] Given the summary is displayed for a period with no transactions, when the user views it, then all three figures display as zero — not as blank or null values.
- [ ] Given the summary is displayed, when the user views it, then the total expense figure equals the independently computed sum of all expense transactions within the period, and the total income figure equals the independently computed sum of all income transactions within the period.
- [ ] Given a new transaction is saved or an existing one is edited or deleted, when the user views the summary for the affected period, then the summary figures reflect the updated transaction data.

---

**Story 40:** _"As a user, I want category breakdown so that I see where money goes."_

Acceptance Criteria:

- [ ] Given the user views the category breakdown, when it loads, then each category with at least one expense transaction in the selected period is displayed with its total spending amount and its percentage share of total expenses for that period.
- [ ] Given the breakdown is displayed, when the user views all category entries, then the sum of all category totals equals the total expense figure shown in the spending summary for the same period.
- [ ] Given the breakdown is displayed, when the user views it, then categories are ordered by spending amount in descending order by default — the largest category appears first. `[INFERRED — verify with author: confirm default sort order]`
- [ ] Given transactions exist in the selected period with no assigned category, when the breakdown is displayed, then uncategorized spending is represented as a distinct entry (e.g., labeled "Uncategorized") — it is not silently excluded from the total or merged into another category.
- [ ] Given the breakdown is displayed, when the user selects a category entry, then they are navigated to or shown the individual transactions that make up that category's total for the period. `[INFERRED — verify with author: confirm whether category drill-down to transaction list is required]`
- [ ] Given the selected period has no expense transactions, when the breakdown is displayed, then an empty state message is shown — not a breakdown with zero-value entries for every category.

---

**Story 41:** _"As a user, I want spending trends so that I can see patterns over time."_

Acceptance Criteria:

- [ ] Given the user views spending trends, when the view loads, then total spending is displayed across multiple consecutive time periods, with each period represented as a discrete data point or bar. `[INFERRED — verify with author: confirm the visual representation — line chart, bar chart, or both — and the default number of periods shown]`
- [ ] Given the trend view is displayed, when the user views it, then the spending value shown for each period matches the independently computed total expense sum for that period.
- [ ] Given the trend view is displayed, when spending in one period is higher than the previous period, then the visual representation makes this increase distinguishable from a decrease or flat period — the direction of change is visually apparent without reading exact values.
- [ ] Given the user selects a time granularity (e.g., monthly, weekly), when the selection is applied, then the trend view updates to display spending grouped at the selected granularity. `[INFERRED — verify with author: confirm available granularity options]`
- [ ] Given the trend view is displayed, when the user selects a specific period data point, then the spending total for that period is displayed as an exact value — not only as a visual position on the chart. `[INFERRED — verify with author: confirm whether interactive tooltips or value labels are required]`
- [ ] Given fewer than two periods of data exist, when the trend view is displayed, then an informational message is shown explaining that more data is needed before trends can be shown — the view does not display a single data point as a trend.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- All three features must operate on the same time period selection. When the user changes the selected period, all three views — summary, breakdown, and trend — must update consistently. A period change on one view must not leave another view showing data from a different period. `[INFERRED — verify with author: confirm whether period selection is shared across all three views or per-view]`
- Category breakdown totals must be derived from expense transactions only, unless income breakdown is explicitly confirmed as in scope. The breakdown must not mix income and expense transactions in a single percentage calculation.
- Trend data must be computed from the transaction store at query time. Pre-computed trend caches are acceptable for performance, but must be invalidated whenever a transaction within the trend's date range is added, edited, or deleted.
- The spending summary net figure must always equal total income minus total expenses for the selected period. It must not be stored as a separate field that can drift from the underlying transaction data.

### 6b. Data Constraints

- All three features require the data layer to support date-range-scoped aggregation queries. Queries must be capable of filtering by transaction date, grouping by category, and summing by amount — within a single efficient operation rather than fetching all records and aggregating in the application layer for large datasets.
- Trend data requires the data layer to support grouping transactions by a time unit (week, month) and computing a sum per group. The grouping logic must use the transaction's stored date — not the creation timestamp or sync timestamp.
- Uncategorized transactions must be queryable as a distinct group in the category breakdown. A null category value must be treated as its own grouping key — not excluded from aggregation.
- For the trend view, periods with zero spending must be represented as zero — not omitted — so that gaps in spending are visible rather than compressed out of the chart. `[INFERRED — verify with author]`

### 6c. Integration Constraints

- Story 41 implies a charting or data visualization component capable of rendering time-series data. The specific library is not defined. `[INFERRED — verify with author: confirm charting library — e.g., Recharts, Victory, Chart.js, or native]`
- Story 40 implies either a pie/donut chart or a ranked list with percentage bars to represent category proportions. The visual format is not specified. `[INFERRED — verify with author: confirm category breakdown visualization format]`
- All three features depend on the category system defined in the Transaction Categories PRD. Category breakdown is only meaningful if transactions carry category assignments — the completeness of categorization directly affects the accuracy and usefulness of the breakdown.
- The time period selector must be a shared UI component reused across all three views to ensure consistent period scoping. Independent period selectors per view risk displaying inconsistent data across the insights surface. `[INFERRED — verify with author]`

---

## 7. Success Metrics

| Feature Area       | Metric                                                                                                                                     | Measurement Method               | Target                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------ |
| Spending Summary   | Accuracy of displayed totals against independently computed sums from the transaction store                                                | Automated data validation        | 100%                           |
| Spending Summary   | Percentage of sessions where the spending summary screen is opened at least once                                                           | Session event tracking           | `[TBD — set by product owner]` |
| Category Breakdown | Percentage of breakdowns where the sum of all category totals equals the period's total expense figure                                     | Automated aggregation validation | 100%                           |
| Category Breakdown | Percentage of users who interact with at least one category entry (e.g., tap to drill down) within their first 30 days                     | Interaction event tracking       | `[TBD — set by product owner]` |
| Spending Trends    | Accuracy of per-period spending values in the trend view against independently computed period sums                                        | Automated period-sum validation  | 100%                           |
| Spending Trends    | Percentage of trend view sessions where the user changes the time granularity at least once (indicates active engagement with the feature) | Interaction event tracking       | `[TBD — set by product owner]` |

---

## 8. Out of Scope

- This PRD does not cover income trends — trend analysis is scoped to expenses unless confirmed otherwise.
- This PRD does not cover budget targets or comparisons between actual spending and a defined budget.
- This PRD does not cover per-category trend analysis — trends are shown for overall spending, not per-category spending over time.
- This PRD does not cover comparative analytics between payment methods within the insights surface — that is addressed in the Payment Method Tracking PRD.
- This PRD does not cover exporting or sharing insights views — that is addressed in the Transaction Export PRD.
- This PRD does not cover predictive analytics or spending forecasts based on historical trends.
- This PRD does not cover notifications or alerts triggered by spending thresholds detected in the summary or trends.
- This PRD does not cover user-defined custom date ranges unless confirmed as a supported period option.

---

## 9. Open Questions

| #   | Question                                                                                                                                                                     | Relevant Story               | Impact if Unresolved                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | What time period options are available for the spending summary and category breakdown — current month, last month, last 3 months, custom range, all time, or a defined set? | Story 39, Story 40           | Determines the period selector UI and the date-range query parameters required                                              |
| 2   | Is the period selection shared across all three insights views simultaneously, or can each view be scoped to a different period independently?                               | Story 39, Story 40, Story 41 | Determines whether a single shared period selector or three independent selectors must be designed                          |
| 3   | What visual format is used for the category breakdown — pie/donut chart, ranked list with percentage bars, or a combination?                                                 | Story 40                     | Determines the charting component requirements and the layout of the breakdown view                                         |
| 4   | What is the default time granularity for the trend view, and what granularity options are available — weekly, monthly, quarterly, or others?                                 | Story 41                     | Determines the default query grouping and the granularity selector options                                                  |
| 5   | Does the trend view show expenses only, or does it also overlay income on the same chart for comparison?                                                                     | Story 41                     | Affects the chart data series count and the visual complexity of the trend view                                             |
| 6   | Is drill-down from a category breakdown entry to the underlying transaction list required, or is the breakdown a terminal view?                                              | Story 40                     | Determines whether the breakdown must support navigation to a filtered transaction list                                     |
| 7   | How are periods with zero spending represented in the trend chart — as explicit zero data points, or omitted?                                                                | Story 41                     | Affects whether spending gaps are visible in the chart or compressed, which changes the user's interpretation of continuity |
