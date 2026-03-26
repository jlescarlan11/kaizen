# Product Requirements Document

---

## 1. Document Header

| Field                      | Value              |
| -------------------------- | ------------------ |
| **Product / Feature Name** | Balance Management |
| **Version**                | 1.0                |
| **Status**                 | Draft              |
| **Last Updated**           | _(fill in)_        |
| **Author**                 | _(fill in)_        |

---

## 2. Problem Statement

Users who log transactions need a balance that reflects their true financial position at all times — one that updates automatically as records change, can be corrected when it diverges from reality, and can be reviewed over time to understand how it evolved. A static or manually maintained balance fails on all three counts: it drifts the moment a transaction is added, edited, or deleted without a corresponding balance update; it provides no path to correction when the in-app figure does not match what the user sees in their actual account; and it gives no historical context for understanding when and why the balance moved.

The consequence of an unreliable balance is that the entire ledger becomes untrustworthy. A user who cannot depend on the displayed balance to reflect their actual position will stop using it as a reference, reducing the product to a simple transaction log with no analytical value. Discrepancies between the app and reality — from rounding, missed transactions, or data entry errors — have no resolution path without reconciliation. And a balance that only shows the current figure offers no way to answer questions like "what was my balance before that large expense last week."

Success looks like a user whose balance is always current without manual intervention, who can identify and correct discrepancies between the app and their real account in a structured way, and who can consult a balance history to understand how their financial position has changed across any time period.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Personal Finance User                                                                                                                                                                                                                                                |
| **Role**            | User                                                                                                                                                                                                                                                                 |
| **Primary Goal**    | Maintain a balance that is automatically accurate, correctable when it diverges from reality, and reviewable across time                                                                                                                                             |
| **Key Pain Points** | Balance does not update when transactions are added, edited, or deleted; no structured way to resolve discrepancies between the app and the user's actual account; no historical record of how the balance changed, making it impossible to audit or trace movements |
| **Stories Owned**   | Stories 26, 27, 28                                                                                                                                                                                                                                                   |

---

## 4. Feature List

### Feature 1: Balance Auto-Calculation

A system that recomputes the balance automatically whenever the transaction dataset changes.

- Story 26: _"As a user, I want balance auto-calculation so that it stays accurate."_

**Core value:** Removes the user's responsibility to maintain the balance manually — every add, edit, or delete is immediately reflected in the displayed figure without user intervention.

---

### Feature 2: Balance Reconciliation

A structured workflow that allows the user to compare the app's computed balance against a known real-world figure and record an adjustment to resolve any gap.

- Story 27: _"As a user, I want balance reconciliation so that I can fix discrepancies."_

**Core value:** Gives the user a defined, auditable path to correct the balance when the app and reality diverge, rather than leaving discrepancies unresolved or requiring manual transaction manipulation.

---

### Feature 3: Balance History

A chronological record of balance values over time, showing how the balance changed as transactions were recorded.

- Story 28: _"As a user, I want balance history so that I can see how it changed over time."_

**Core value:** Converts the balance from a single current figure into a traceable record — the user can see not just where they are, but how they got there.

`[Priority unconfirmed — verify with author]` — Feature 1 is a prerequisite for Features 2 and 3. Feature 2 is ordered before Feature 3 on the basis that correctness must be ensured before history is meaningful. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 26:** _"As a user, I want balance auto-calculation so that it stays accurate."_

Acceptance Criteria:

- [ ] Given a new income transaction is saved, when the save completes, then the displayed balance increases by the transaction amount without any manual user action.
- [ ] Given a new expense transaction is saved, when the save completes, then the displayed balance decreases by the transaction amount without any manual user action.
- [ ] Given an existing transaction is edited and its amount changes, when the edit is saved, then the displayed balance reflects the difference between the old and new amounts — not a full recomputation from a stale base. `[INFERRED — verify with author: confirm whether full recomputation or delta application is the preferred approach]`
- [ ] Given an existing transaction is edited and its type changes (e.g., expense to income), when the edit is saved, then the displayed balance is recalculated to reflect the corrected transaction direction.
- [ ] Given a transaction is deleted, when the deletion is confirmed, then the displayed balance is updated to remove the deleted transaction's contribution.
- [ ] Given a bulk delete is performed, when the operation completes, then the displayed balance reflects the removal of all deleted transactions in a single update — not a sequential series of visible intermediate states.
- [ ] Given any transaction change occurs, when the balance updates, then the update completes before the user can initiate another transaction action — no intermediate inconsistent balance state is displayed. `[INFERRED — verify with author: confirm concurrency and UI update ordering requirements]`

---

**Story 27:** _"As a user, I want balance reconciliation so that I can fix discrepancies."_

Acceptance Criteria:

- [ ] Given the user initiates reconciliation, when the reconciliation interface opens, then the current app-calculated balance is displayed alongside an input field where the user can enter their known real-world balance.
- [ ] Given the user enters a real-world balance that differs from the app balance, when they confirm, then the difference is computed and displayed to the user before any adjustment is applied.
- [ ] Given the user confirms the reconciliation, when the adjustment is applied, then a reconciliation entry is created in the transaction record with the adjustment amount, a timestamp, and a label identifying it as a reconciliation adjustment — it is not silently merged into an existing transaction. `[INFERRED — verify with author: confirm whether reconciliation is recorded as a distinct transaction type or a separate adjustment record]`
- [ ] Given the user confirms the reconciliation, when the adjustment is applied, then the displayed balance matches the real-world figure the user entered.
- [ ] Given the user enters a real-world balance equal to the app balance, when they attempt to confirm, then no adjustment is created and the user is informed that no discrepancy exists.
- [ ] Given the user opens the reconciliation interface and then dismisses it without confirming, when they return to the main view, then the balance and transaction history are unchanged.

---

**Story 28:** _"As a user, I want balance history so that I can see how it changed over time."_

Acceptance Criteria:

- [ ] Given the user navigates to the balance history view, when it loads, then a chronological list or chart of balance values is displayed, with each entry corresponding to a point in time at which the balance changed. `[INFERRED — verify with author: confirm presentation format — list, line chart, or both]`
- [ ] Given the balance history is displayed, when the user views an entry, then it shows at minimum the date, the balance value at that point, and the transaction or event that caused the change.
- [ ] Given a new transaction is saved, when the balance history is viewed, then a new entry reflecting the updated balance appears at the correct chronological position.
- [ ] Given a transaction is edited or deleted, when the balance history is viewed, then all affected historical entries are updated to reflect the corrected balance values from that point forward — prior entries before the edited transaction remain unchanged.
- [ ] Given a reconciliation adjustment is applied (Story 27), when the balance history is viewed, then the adjustment appears as a distinct entry in the history, labeled as a reconciliation event.
- [ ] Given the balance history contains many entries, when the user views it, then entries are presented in reverse chronological order by default — most recent at the top. `[INFERRED — verify with author: confirm default sort order]`

---

## 6. Technical Constraints

### 6a. Functional Constraints

- The balance must be derived exclusively from the transaction store at all times. It must not be stored as a mutable cached field that can drift out of sync with the underlying transactions.
- Auto-calculation (Story 26) must trigger on every transaction mutation: create, edit, delete, and bulk delete. No mutation path may bypass the recalculation.
- Reconciliation adjustments (Story 27) must be recorded as distinct, identifiable entries in the transaction store. They must not overwrite or modify existing transaction records to achieve the corrected balance.
- Balance history entries (Story 28) must be derived from the ordered transaction record. If a past transaction is edited or deleted, all balance history values from that transaction's date forward must be recomputed to remain accurate.
- A reconciliation adjustment must appear in both the transaction history and the balance history as a labeled, distinguishable event — not as an anonymous income or expense entry. `[INFERRED — verify with author]`

### 6b. Data Constraints

- The balance at any point in time is defined as: the sum of all income transactions up to and including that point, minus the sum of all expense transactions up to and including that point, plus or minus any reconciliation adjustments up to that point. `[INFERRED — verify with author: confirm the balance formula and whether an opening/starting balance is supported]`
- Reconciliation adjustment records must store, at minimum: adjustment amount, direction (positive or negative), timestamp, and a type identifier distinguishing them from regular transactions.
- Balance history must be reconstructable from the transaction store alone. No separate balance history table is strictly required, but if one is maintained for performance, it must be kept in sync with the transaction store and never treated as the source of truth. `[INFERRED — verify with author]`
- All monetary values used in balance computation must use consistent precision (minimum two decimal places) to prevent rounding drift across repeated calculations. `[INFERRED — verify with author: confirm precision and rounding strategy]`

### 6c. Integration Constraints

- Story 26 implies the balance calculation is triggered by transaction store mutations. The data layer must expose hooks or events that the balance computation can subscribe to, rather than requiring the UI layer to trigger recalculation manually. `[INFERRED — verify with author]`
- Story 27 implies a reconciliation interface distinct from the standard transaction entry form. Whether this is a modal, a dedicated screen, or a section within settings is not defined. `[INFERRED — verify with author]`
- Story 28 implies either a computed view over the transaction store or a maintained history log. The choice affects query performance for large datasets and must be evaluated against the expected transaction volume. `[INFERRED — verify with author]`

---

## 7. Success Metrics

| Feature Area             | Metric                                                                                                                            | Measurement Method                  | Target                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------ |
| Balance Auto-Calculation | Percentage of transaction mutations after which the displayed balance matches the independently computed correct value            | Automated post-mutation validation  | 100%                           |
| Balance Auto-Calculation | Time between a transaction mutation completing and the updated balance being visible to the user                                  | UI rendering timing                 | `[TBD — set by product owner]` |
| Balance Reconciliation   | Percentage of reconciliation sessions that result in a confirmed adjustment (vs. abandoned)                                       | Session event tracking              | `[TBD — set by product owner]` |
| Balance Reconciliation   | Percentage of post-reconciliation balances that match the user-entered real-world figure exactly                                  | Post-reconciliation data validation | 100%                           |
| Balance History          | Percentage of balance history entries where the recorded balance matches the independently computed balance at that point in time | Automated historical audit          | 100%                           |

---

## 8. Out of Scope

- This PRD does not cover multiple account balances — a separate balance per payment method or account is not addressed here.
- This PRD does not cover an opening or starting balance unless confirmed as required by the product owner.
- This PRD does not cover scheduled or automatic reconciliation triggered by external bank data.
- This PRD does not cover exporting balance history to external formats.
- This PRD does not cover balance projections or forecasts based on historical trends.
- This PRD does not cover notifications or alerts triggered by balance thresholds.
- This PRD does not cover multi-currency balance computation.
- This PRD does not cover conflict resolution for balance state across multiple devices or concurrent sessions.

---

## 9. Open Questions

| #   | Question                                                                                                                                                                              | Relevant Story     | Impact if Unresolved                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Is there an opening or starting balance the user can set (e.g., "I'm starting this app with ₱5,000")? If so, how does it factor into auto-calculation and history?                    | Story 26, Story 28 | Determines whether the balance formula includes a base value and whether the history has a defined starting point                                         |
| 2   | How is a reconciliation adjustment recorded — as a special transaction type within the existing transaction store, or as a separate adjustment entity with its own schema?            | Story 27           | Affects the data model design and how reconciliation entries are displayed in the transaction list and balance history                                    |
| 3   | When a past transaction is edited or deleted, is balance history retroactively corrected from that point forward, or does history preserve the original values as a true audit trail? | Story 26, Story 28 | Fundamental design decision — a corrected history is more accurate, a preserved history is a better audit trail; the two are mutually exclusive           |
| 4   | What is the presentation format for balance history — a chronological list, a line chart, or both?                                                                                    | Story 28           | Determines front-end rendering requirements and whether a charting library is needed                                                                      |
| 5   | Is the balance history scoped to all time by default, or does it open with a default time window (e.g., last 30 days)?                                                                | Story 28           | Affects the default query scope and performance for users with large transaction histories                                                                |
| 6   | Does reconciliation support a note or reason field so the user can record why the adjustment was made?                                                                                | Story 27           | Determines whether the reconciliation schema needs a text field and whether that note appears in the history                                              |
| 7   | Is the balance a single global figure, or is it maintained separately per payment method or account?                                                                                  | Story 26, Story 27 | If per-method balances are required, the entire balance architecture — calculation, reconciliation, and history — must be scoped per method, not globally |
