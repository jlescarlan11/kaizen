# Product Requirements Document

---

## 1. Document Header

| Field                      | Value                   |
| -------------------------- | ----------------------- |
| **Product / Feature Name** | Payment Method Tracking |
| **Version**                | 1.0                     |
| **Status**                 | Draft                   |
| **Last Updated**           | _(fill in)_             |
| **Author**                 | _(fill in)_             |

---

## 2. Problem Statement

Users who track transactions across multiple payment sources — cash, debit cards, credit cards, e-wallets, bank transfers — have no way to record which method was used for each transaction. The result is a history that captures what was spent and when, but not where the money came from or which financial instrument carried the cost.

Without payment method data, users cannot answer questions that matter for real financial management: "How much have I charged to my credit card this month?", "Am I spending more through my e-wallet than I realize?", "Which accounts are most active?" These questions require the payment method to be a first-class attribute of each transaction, not an afterthought. Users who rely on multiple payment sources also need the freedom to define their own methods — a fixed preset list will not reflect the diversity of cards, wallets, and accounts a user actually holds.

Success looks like a user who can assign a payment method to every transaction, define custom methods that match their actual financial setup, and view a summary of spending broken down by method — giving them a clear picture of how their money flows across instruments without requiring manual tallying.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Personal Finance User                                                                                                                                                                                             |
| **Role**            | User                                                                                                                                                                                                              |
| **Primary Goal**    | Record which payment instrument was used for each transaction and review spending totals per method to understand how money flows across their financial accounts                                                 |
| **Key Pain Points** | No way to distinguish which account or card funded a transaction; fixed payment method lists do not match the user's actual instruments; no aggregate view of spending per method means users must tally manually |
| **Stories Owned**   | Stories 23, 24, 25                                                                                                                                                                                                |

---

## 4. Feature List

### Feature 1: Payment Method Tracking

A payment method field on each transaction that records which instrument was used.

- Story 23: _"As a user, I want payment method tracking so that I can see which methods I use."_

**Core value:** Makes payment method a stored, queryable attribute of every transaction, enabling method-level analysis that a bare amount-and-date record cannot support.

---

### Feature 2: Custom Payment Methods

A management interface that allows users to define payment methods beyond any system-provided defaults.

- Story 24: _"As a user, I want to add custom payment methods so that I can track all sources."_

**Core value:** Ensures the payment method list reflects the user's actual financial instruments rather than a generic preset that may not match their setup.

---

### Feature 3: Payment Method Summary

An aggregated view that shows total spending broken down by each payment method.

- Story 25: _"As a user, I want to see payment method summary so that I know spending per method."_

**Core value:** Converts per-transaction method data into actionable insight — the user can see, at a glance, how much has been spent through each instrument without manual calculation.

`[Priority unconfirmed — verify with author]` — Feature 1 is a prerequisite for Features 2 and 3. Feature 2 is ordered before Feature 3 on the basis that the summary is only meaningful once the method list accurately reflects the user's instruments. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 23:** _"As a user, I want payment method tracking so that I can see which methods I use."_

Acceptance Criteria:

- [ ] Given the user is adding or editing a transaction, when the payment method field is presented, then they can assign one payment method from the available list.
- [ ] Given a payment method is assigned to a transaction, when the transaction is saved, then the method is stored and displayed alongside the transaction in the list and detail views.
- [ ] Given the payment method field is presented, when the user does not select a method, then the transaction is saved with a null or "unspecified" payment method state — not silently assigned to a default. `[INFERRED — verify with author: confirm whether payment method is a required or optional field]`
- [ ] Given a saved transaction with an assigned payment method, when the user views the transaction list, then the payment method is visible on each transaction row without requiring the user to open the detail view. `[INFERRED — verify with author: confirm whether method is shown in list view or detail view only]`

---

**Story 24:** _"As a user, I want to add custom payment methods so that I can track all sources."_

Acceptance Criteria:

- [ ] Given the user accesses payment method management, when they create a new custom method with a valid name, then the new method is saved and immediately available for selection in the transaction entry and edit forms.
- [ ] Given the user attempts to create a payment method with a name identical to an existing method, when they submit, then the creation is rejected and an error is displayed indicating the name is already in use.
- [ ] Given the user attempts to create a payment method with a blank or whitespace-only name, when they submit, then the creation is rejected and a field-level validation error is displayed.
- [ ] Given a custom payment method has been created, when the user views the method list, then the custom method appears alongside any system-provided methods without visual distinction that would suggest it is secondary. `[INFERRED — verify with author: confirm whether custom and system methods are visually differentiated]`
- [ ] Given a custom payment method exists and has transactions assigned to it, when the user attempts to delete it, then a warning is displayed indicating how many transactions reference it before the deletion is confirmed. `[INFERRED — verify with author: confirm whether deletion of payment methods is in scope]`

---

**Story 25:** _"As a user, I want to see payment method summary so that I know spending per method."_

Acceptance Criteria:

- [ ] Given the user navigates to the payment method summary, when it loads, then each payment method with at least one assigned transaction is displayed with its total spending amount.
- [ ] Given the summary is displayed, when the user views it, then the total for each method equals the sum of all expense transactions assigned to that method — income transactions are excluded from the spending total. `[INFERRED — verify with author: confirm whether income is excluded or shown separately per method]`
- [ ] Given a new transaction is saved or an existing transaction is edited, when the user views the summary, then the affected method's total is updated to reflect the change.
- [ ] Given the summary is displayed, when a payment method has no assigned transactions, then it is either omitted from the summary or displayed with a zero total — it does not display a blank or null value. `[INFERRED — verify with author: confirm whether zero-total methods are shown or hidden]`
- [ ] Given the summary is displayed, when transactions with no payment method assigned exist, then unassigned transactions are either grouped under a distinct "Unspecified" entry or excluded — they do not silently inflate or deflate any named method's total.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- Payment method assignment must be optional at the transaction level unless the product owner designates it as required. A missing method must never be silently defaulted to an existing method. `[INFERRED — verify with author]`
- Custom method names must be unique within a user's method list. Case-insensitive duplicate detection is recommended. `[INFERRED — verify with author: confirm case sensitivity rules]`
- The payment method summary (Story 25) must derive totals from live transaction data — it must not cache a running total that can drift out of sync with the transaction store.
- Deleting a payment method, if supported, must not leave orphaned method references on existing transactions. A resolution strategy (reassign to unspecified, block deletion, or bulk reassign) must be defined. `[INFERRED — verify with author]`

### 6b. Data Constraints

- Each transaction record must support a nullable payment method field referencing a valid entry in the payment method list. `[INFERRED — verify with author: confirm schema approach — foreign key reference vs. embedded string]`
- The payment method entity must store, at minimum, a unique identifier and a display name. Additional attributes (e.g., method type, icon) are not defined by these stories. `[INFERRED — verify with author: confirm full payment method schema]`
- The summary view (Story 25) requires the data layer to support aggregation queries grouped by payment method. This must be confirmed as supported by the chosen data store.
- If system-provided default methods exist, they must be distinguishable from user-created methods at the data layer even if rendered identically in the UI. `[INFERRED — verify with author]`

### 6c. Integration Constraints

- Story 24 implies a payment method management interface separate from the transaction entry form — a settings screen, modal, or dedicated route where methods can be created and managed. The navigation path is not defined. `[INFERRED — verify with author]`
- Story 25 implies a summary or reporting view distinct from the transaction list. Whether this is a standalone screen, a section within an existing dashboard, or a modal is not specified. `[INFERRED — verify with author]`
- Stories 23 and 24 both involve method selection during transaction entry. Both must reference the same payment method data source to ensure consistency between what the user creates and what appears in the transaction form.

---

## 7. Success Metrics

| Feature Area            | Metric                                                                                                 | Measurement Method          | Target                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------ |
| Payment Method Tracking | Percentage of saved transactions that have a payment method assigned                                   | Data audit                  | `[TBD — set by product owner]` |
| Custom Payment Methods  | Number of custom methods created per active user within the first 30 days                              | User-level data aggregation | `[TBD — set by product owner]` |
| Payment Method Summary  | Percentage of sessions where the summary view is opened at least once                                  | Session event tracking      | `[TBD — set by product owner]` |
| Payment Method Summary  | Accuracy of displayed per-method totals against independently computed sums from the transaction store | Automated data validation   | 100%                           |

---

## 8. Out of Scope

- This PRD does not cover editing or renaming existing payment methods.
- This PRD does not cover deleting payment methods unless confirmed as in scope by the product owner.
- This PRD does not cover payment method icons, colors, or visual customization.
- This PRD does not cover linking payment methods to external bank accounts, cards, or financial institutions.
- This PRD does not cover automatic transaction import or sync from payment providers.
- This PRD does not cover per-method budgets or spending limits.
- This PRD does not cover filtering the transaction list by payment method — that is covered under the Search, Filter & Sort PRD.
- This PRD does not cover income summaries per payment method unless confirmed as in scope.
- This PRD does not cover multi-currency handling per payment method.

---

## 9. Open Questions

| #   | Question                                                                                                                                      | Relevant Story     | Impact if Unresolved                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1   | Is payment method a required field on a transaction, or optional?                                                                             | Story 23           | Determines whether the entry form enforces selection and whether unassigned transactions are a valid state    |
| 2   | Are system-provided default payment methods included (e.g., Cash, Credit Card, Debit Card), or must the user create all methods from scratch? | Story 23, Story 24 | Determines whether a seed dataset is required and how system vs. custom methods are handled in the data model |
| 3   | Is payment method deletion in scope? If so, what happens to transactions that reference a deleted method?                                     | Story 24           | Determines whether a deletion flow and orphan-resolution strategy must be designed                            |
| 4   | Does the payment method summary show only expense totals, or does it also break down income per method separately?                            | Story 25           | Affects the aggregation query design and the layout of the summary view                                       |
| 5   | Are zero-total payment methods (methods with no transactions assigned) shown or hidden in the summary?                                        | Story 25           | Determines whether the summary reflects all defined methods or only active ones                               |
| 6   | Is the payment method summary scoped to all time, or can the user apply a date range or other filter to the summary?                          | Story 25           | Significantly affects the complexity of the summary view and its query requirements                           |
| 7   | Can a transaction be assigned more than one payment method (e.g., split payment across cash and card)?                                        | Story 23           | Fundamentally affects the data schema — single reference vs. split-payment structure                          |
