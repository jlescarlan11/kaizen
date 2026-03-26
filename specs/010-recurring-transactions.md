# Product Requirements Document

---

## 1. Document Header

| Field                      | Value                  |
| -------------------------- | ---------------------- |
| **Product / Feature Name** | Recurring Transactions |
| **Version**                | 1.0                    |
| **Status**                 | Draft                  |
| **Last Updated**           | _(fill in)_            |
| **Author**                 | _(fill in)_            |

---

## 2. Problem Statement

Users who have predictable, repeating financial obligations — subscriptions, rent, utility bills, regular income — have no way to distinguish these from one-off transactions in their history. Every transaction sits in the same flat list regardless of whether it is a unique purchase or the fifteenth instance of a monthly charge. The result is a history that cannot surface patterns, and a workflow that offers no help for the user's most predictable financial events.

Without a recurring marker, identifying patterns requires the user to scan and mentally group transactions themselves — a task that becomes harder as the history grows and that produces no durable structure the app can act on. Without reminders, the user must independently remember when recurring transactions fall due and log them manually on time. Missed or late logging produces gaps in the history that distort balances, summaries, and any analysis that depends on complete data for a given period.

Success looks like a user who can flag any transaction as recurring, see that designation clearly when reviewing their history, and receive a timely reminder to log each instance when it falls due — so that predictable obligations are never missing from the record.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Persona Name**    | Personal Finance User                                                                                                                                                    |
| **Role**            | User                                                                                                                                                                     |
| **Primary Goal**    | Identify and stay current with predictable repeating transactions by marking them as recurring and receiving prompts to log each instance on schedule                    |
| **Key Pain Points** | No way to distinguish recurring transactions from one-off ones in the history; no prompt or reminder when a known recurring charge is due, leading to gaps in the ledger |
| **Stories Owned**   | Stories 33, 34                                                                                                                                                           |

---

## 4. Feature List

### Feature 1: Recurring Transaction Marking

A designation on a transaction that identifies it as recurring, along with the frequency at which it repeats.

- Story 33: _"As a user, I want to mark recurring transactions so that I can identify patterns."_

**Core value:** Makes predictable, repeating transactions structurally distinguishable from one-off entries, so the user can see patterns in their history without manual grouping.

---

### Feature 2: Recurring Transaction Reminders

A notification delivered to the user when a recurring transaction is due, prompting them to log the next instance.

- Story 34: _"As a user, I want recurring transaction reminders so that I don't forget to log them."_

**Core value:** Closes the gap between knowing a transaction will recur and actually logging it on time, preventing predictable omissions from the history.

`[Priority unconfirmed — verify with author]` — Feature 1 is a prerequisite for Feature 2: a reminder cannot be scheduled without a recurring designation and frequency. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 33:** _"As a user, I want to mark recurring transactions so that I can identify patterns."_

Acceptance Criteria:

- [ ] Given the user is adding or editing a transaction, when they access the recurring field, then they can mark the transaction as recurring and select a frequency from a defined set of options. `[INFERRED — verify with author: confirm available frequency options — daily, weekly, monthly, yearly, or custom interval]`
- [ ] Given the user marks a transaction as recurring and saves it, when the transaction is saved, then the recurring designation and frequency are stored and displayed in the transaction detail view.
- [ ] Given the transaction list is displayed, when a transaction is marked as recurring, then a visible indicator distinguishes it from non-recurring transactions — without requiring the user to open the detail view.
- [ ] Given the user marks a transaction as recurring, when they later edit it and remove the recurring designation, then the transaction is saved as a standard non-recurring entry and the recurring indicator is removed from all views.
- [ ] Given a transaction is marked as recurring, when the user views the detail, then the frequency is displayed in human-readable form (e.g., "Monthly", "Every 2 weeks") — not as a raw interval value. `[INFERRED — verify with author: confirm display format for frequency]`

---

**Story 34:** _"As a user, I want recurring transaction reminders so that I don't forget to log them."_

Acceptance Criteria:

- [ ] Given a transaction is marked as recurring with a defined frequency, when the due date for the next instance arrives, then the user receives a notification reminding them to log it. `[INFERRED — verify with author: confirm notification delivery mechanism — push notification, in-app alert, or both]`
- [ ] Given a reminder notification is delivered, when the user taps or selects it, then they are taken directly to a transaction entry form pre-populated with the field values of the recurring transaction. `[INFERRED — verify with author: confirm whether the reminder deep-links to a pre-filled entry form]`
- [ ] Given the user has logged the next instance of a recurring transaction, when the current due date has passed, then no further reminder is sent for that instance — the next reminder is scheduled for the following due date.
- [ ] Given a recurring transaction exists, when the user has not logged an instance by the due date, then the reminder is not re-sent indefinitely — a defined maximum number of reminder attempts per due date applies. `[INFERRED — verify with author: confirm reminder retry behavior and maximum attempts]`
- [ ] Given the user opens notification settings, when they view recurring transaction reminders, then they can enable or disable reminders globally or per recurring transaction. `[INFERRED — verify with author: confirm whether per-transaction reminder control is required or only a global toggle]`
- [ ] Given a recurring transaction's frequency is changed by the user, when the edit is saved, then all future reminders are rescheduled based on the updated frequency — no reminders based on the previous frequency remain queued.
- [ ] Given a recurring transaction is deleted, when the deletion is confirmed, then all scheduled reminders for that transaction are cancelled — no orphaned reminders fire after the transaction is removed.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- A recurring designation must store both the recurrence flag and the frequency as separate attributes. A transaction marked as recurring with no frequency is an invalid state and must not be saveable. `[INFERRED — verify with author]`
- Reminders (Story 34) must be scheduled based on the transaction's stored frequency and the date of the most recently logged instance — not based on the original creation date alone. `[INFERRED — verify with author: confirm the anchor date for reminder scheduling — creation date, last logged date, or a user-defined start date]`
- Marking a transaction as recurring must not automatically create future transaction records. The recurring flag is a prompt to log — it does not log on the user's behalf unless auto-logging is explicitly confirmed as in scope. `[INFERRED — verify with author: confirm whether auto-creation of future transactions is ever in scope]`
- Deleting a recurring transaction must cancel all pending reminders for that transaction at the time of deletion. No reminder must fire for a transaction that no longer exists.

### 6b. Data Constraints

- The recurring designation must be stored on the transaction record as a boolean flag accompanied by a frequency value. The frequency must be stored in a structured format (e.g., an interval unit and a multiplier) rather than as a freeform string, to support programmatic reminder scheduling. `[INFERRED — verify with author]`
- The reminder system must store, per recurring transaction, the timestamp of the next scheduled reminder. This value must be updated each time an instance is logged or the frequency is changed.
- If reminders are delivered via push notification, device push tokens must be stored and kept current. Token invalidation and refresh must be handled to prevent delivery failures. `[INFERRED — verify with author: confirm notification infrastructure]`

### 6c. Integration Constraints

- Story 34 implies a background scheduling mechanism capable of delivering notifications at a future date and time. On mobile platforms this requires platform notification APIs (APNs for iOS, FCM for Android). On web it requires either a server-side scheduler or the Web Push API. The specific mechanism is not defined. `[INFERRED — verify with author: confirm target platforms and notification infrastructure]`
- Story 34 implies that tapping a reminder notification deep-links into the app and opens a pre-filled transaction entry form. This requires the notification payload to carry enough context (transaction ID and field values) to reconstruct the entry form. `[INFERRED — verify with author]`
- The reminder scheduler must be resilient to the app being closed or the device being offline at the scheduled reminder time. Delivery guarantees and retry behavior must be defined. `[INFERRED — verify with author]`

---

## 7. Success Metrics

| Feature Area                    | Metric                                                                                               | Measurement Method                                   | Target                         |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| Recurring Transaction Marking   | Percentage of active users who mark at least one transaction as recurring within their first 30 days | User-level event tracking                            | `[TBD — set by product owner]` |
| Recurring Transaction Marking   | Percentage of recurring-marked transactions that have a valid frequency value stored                 | Data validation audit                                | 100%                           |
| Recurring Transaction Reminders | Percentage of scheduled reminders delivered within 15 minutes of the target due time                 | Notification delivery timestamp logging              | `[TBD — set by product owner]` |
| Recurring Transaction Reminders | Percentage of delivered reminders that result in the user logging the transaction within 24 hours    | Event tracking: reminder delivery → transaction save | `[TBD — set by product owner]` |

---

## 8. Out of Scope

- This PRD does not cover automatic creation of future transaction records on a recurring schedule — reminders prompt the user to log; they do not log on the user's behalf.
- This PRD does not cover a dedicated recurring transactions management screen listing all marked recurring transactions in one place.
- This PRD does not cover pausing or skipping a single instance of a recurring transaction without removing the recurring designation.
- This PRD does not cover variable-amount recurring transactions (e.g., a utility bill that changes each month).
- This PRD does not cover an end date or expiry condition for a recurring designation.
- This PRD does not cover calendar integration for recurring transaction due dates.
- This PRD does not cover reminders for non-recurring transactions.
- This PRD does not cover in-app inbox or notification history for past reminders.

---

## 9. Open Questions

| #   | Question                                                                                                                                                                     | Relevant Story     | Impact if Unresolved                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| 1   | What frequency options are available — daily, weekly, fortnightly, monthly, yearly, custom interval, or a subset?                                                            | Story 33           | Determines the frequency selector UI and the interval values the scheduling system must support                 |
| 2   | What is the anchor date for reminder scheduling — the transaction's creation date, the date of the last logged instance, or a user-defined start date?                       | Story 34           | Directly affects when reminders fire and whether they stay aligned with the user's actual billing cycle         |
| 3   | What is the notification delivery mechanism — push notification, in-app alert, or both?                                                                                      | Story 34           | Determines the notification infrastructure required and the platform permissions that must be requested         |
| 4   | Does tapping a reminder notification deep-link to a pre-filled entry form, or does it open the app to the home screen?                                                       | Story 34           | Affects notification payload design and whether deep-link routing must be implemented                           |
| 5   | Can reminders be controlled per recurring transaction (enabled/disabled individually), or is there only a global toggle?                                                     | Story 34           | Determines the granularity of the reminder settings UI and the storage model for reminder preferences           |
| 6   | What is the retry behavior when a reminder is not acknowledged — is it re-sent, and if so, how many times and at what interval?                                              | Story 34           | Affects the scheduler's retry logic and prevents the user from being over-notified for a single missed instance |
| 7   | Is auto-creation of future transaction records ever in scope — i.e., should the system log the transaction automatically on the due date, with or without user confirmation? | Story 33, Story 34 | Fundamental scope decision that changes the feature from a reminder tool into an automated ledger system        |
