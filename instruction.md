1. Recurring Transaction Schema — Add the recurring flag and structured frequency fields to the transaction record schema, enforcing that a recurring flag of true requires a valid frequency value.
2. Recurring Transaction UI — Implement the recurring toggle and frequency selector in the transaction entry and edit forms, the recurring indicator in the list view, and the human-readable frequency display in the detail view.
3. Reminder Schedule Record — Define the data schema for per-transaction reminder schedule records, storing the next scheduled reminder timestamp and the reminder preference state.
4. Reminder Scheduler — Implement the scheduling logic that computes and writes the next reminder timestamp when a recurring transaction is saved, when an instance is logged, or when the frequency is changed.
5. Reminder Delivery — Implement the notification delivery mechanism that fires at the scheduled reminder time via the confirmed platform notification API, carrying the transaction context payload.
6. Reminder Deep-Link Handler — Implement the deep-link routing that intercepts a tapped reminder notification and opens the transaction entry form pre-populated with the recurring transaction's field values.
7. Reminder Cancellation — Implement the cancellation logic that clears all pending reminder schedule records when a recurring transaction is deleted or its recurring designation is removed.
8. Reminder Settings — Implement the reminder enable/disable controls at the global level and, if confirmed, at the per-transaction level.

---

## Instruction 1: Recurring Transaction Schema

**Goal**
Add the recurring boolean flag and the structured frequency fields to the transaction record schema, enforcing that a true recurring flag cannot be saved without a valid frequency value, and document all new field names and types as the authoritative reference for all downstream instructions.

**Scope**
In scope: the recurring boolean field, the frequency structure (interval unit and multiplier), the constraint that recurring=true requires a non-null frequency, and the migration. Out of scope: the UI for setting these fields (Instruction 2), the reminder schedule record (Instruction 3), and all other transaction fields.

**Inputs**

- Full codebase
- PRD Section 6a (recurring designation must store both the flag and the frequency; recurring=true with no frequency is invalid), Section 6b (frequency stored as a structured format — interval unit and multiplier — not a freeform string)

**Constraints**

- The recurring field must be a boolean, defaulting to false. A null recurring field is not a valid state — default to false.
- The frequency must be stored as two fields: an interval unit (e.g., an enum: daily, weekly, monthly, yearly, and any confirmed custom units) and an integer multiplier (e.g., 2 for "every 2 weeks"). Do not store frequency as a freeform string.
- Enforce at the schema level that frequency fields are non-null when the recurring flag is true. If the database cannot enforce this as a check constraint, document the application-level enforcement required and flag.
- PRD Open Question 1 (available frequency options) must be confirmed before the interval unit enum is written. If unconfirmed, implement the enum with daily, weekly, monthly, and yearly as provisional values and flag.
- Do not implement any UI or scheduling logic here — schema and reference document only.
- Use the naming and migration conventions established in the codebase (cross-reference Transaction Entry PRD Instruction 9).
- Recommended execution order: run before all other instructions in this set.

**Expected Output**

- Updated transaction record schema with: a boolean recurring field (default false), an interval unit enum field (nullable, non-null when recurring=true), and an integer multiplier field (nullable, non-null when recurring=true).
- Schema-level or documented application-level constraint: recurring=true requires both frequency fields to be non-null.
- Flat reference table: field name, type, required/optional, description.
- Before/after schema comparison and migration file.

**Deliverables**

- Updated transaction schema file
- Migration file or script
- Flat reference table
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (frequency options) must be confirmed or provisionally defaulted before the interval unit enum values are written.
- Confirm the transaction schema file and ORM convention from Transaction Entry PRD Instruction 9 before modifying.

**Open Questions**

- PRD Open Question 1: What frequency options are supported? The interval unit enum cannot be finalized without this list.

---

## Instruction 2: Recurring Transaction UI

**Goal**
Implement the recurring toggle and frequency selector in the transaction entry and edit forms, the recurring indicator in the transaction list view, and the human-readable frequency display in the transaction detail view, including the removal of the recurring designation on edit.

**Scope**
In scope: the recurring toggle in the entry and edit forms, the frequency selector presented when the toggle is enabled, the validation that blocks save when recurring=true but no frequency is selected, the recurring indicator on list rows, the human-readable frequency label in the detail view, and the removal of indicator and stored values when recurring is toggled off. Out of scope: the recurring schema (Instruction 1), reminder scheduling (Instruction 4), and reminder settings (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 33 acceptance criteria), Section 6a (recurring=true with no frequency is an invalid save state)

**Constraints**

- The frequency selector must appear only when the recurring toggle is enabled — do not render it for non-recurring transactions.
- Frequency options presented in the selector must match exactly the interval unit enum values confirmed in Instruction 1. Do not add options not in the schema.
- When the user enables recurring and saves without selecting a frequency, block save and display a field-level validation error.
- When the user disables recurring on an existing recurring transaction and saves, write recurring=false and null both frequency fields — do not leave stale frequency values.
- The list row recurring indicator must be driven by the recurring boolean field — no secondary fetch required.
- The detail view frequency display must convert the stored interval unit and multiplier into a human-readable string (e.g., unit=weekly, multiplier=2 → "Every 2 weeks"; unit=monthly, multiplier=1 → "Monthly"). Define the formatting rules as a named utility function.
- Absence of recurring designation must be visually neutral in both list and detail views — no indicator shown when recurring=false.
- The edit form must pre-populate both the toggle and frequency selector from stored values.
- Do not modify the recurring schema — read field names from Instruction 1's output.
- Recommended execution order: run after Instruction 1 confirms field names and enum values.

**Expected Output**

- Entry and edit forms: recurring toggle, conditional frequency selector, and save-blocking validation when frequency is absent.
- Edit form: toggle and selector pre-populated from stored values; null write when recurring disabled.
- List row: recurring indicator when recurring=true, neutral when false.
- Detail view: human-readable frequency label, not raw field values.

**Deliverables**

- Updated transaction entry form component
- Updated transaction edit form component
- Updated transaction list row component (recurring indicator)
- Updated transaction detail view component (frequency display)
- Frequency label utility function
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the recurring field name, the interval unit enum values, and the multiplier field name before this instruction writes to or reads from them.
- PRD Open Question 1 (frequency options) must be confirmed before the selector options are rendered.

---

## Instruction 3: Reminder Schedule Record

**Goal**
Define the data schema for per-transaction reminder schedule records, storing the next scheduled reminder timestamp, the reminder enabled state, and the association to the parent recurring transaction.

**Scope**
In scope: the reminder schedule entity schema (next reminder timestamp, enabled flag, association to transaction identifier, and any retry state fields if confirmed), and the flat reference table. Out of scope: the scheduling logic that computes and writes the timestamp (Instruction 4), the delivery mechanism (Instruction 5), and the settings UI (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 6b (reminder system must store, per recurring transaction, the timestamp of the next scheduled reminder; this value must be updated when an instance is logged or frequency changes), Section 6a (delete of recurring transaction must cancel all pending reminders)

**Constraints**

- The reminder schedule record must be associated with the transaction by the transaction's confirmed unique identifier — do not embed schedule state directly on the transaction record if a separate entity is cleaner for the codebase's ORM pattern. Confirm the preferred approach.
- Store at minimum: the transaction identifier (foreign key), the next scheduled reminder timestamp (nullable — null when no reminder is pending), and the enabled boolean (default true).
- If PRD Open Question 6 (retry behavior) is confirmed, add fields for retry count and retry interval. If unconfirmed, omit and flag.
- If PRD Open Question 5 (per-transaction reminder control) is confirmed, the enabled field on this record is the per-transaction toggle. If only a global toggle is confirmed, the enabled field may be omitted from this record and managed at the global settings level.
- Do not implement scheduling logic or delivery here — schema and reference document only.
- Recommended execution order: run before Instructions 4, 5, 7, and 8.

**Expected Output**

- Reminder schedule entity schema: field names, types, nullability, constraints, and association to the transaction record.
- Flat reference table: field name, type, required/optional, description.
- Migration file if the codebase uses migrations.

**Deliverables**

- New reminder schedule entity schema file
- Migration file or script
- Flat reference table
- List of all files added or modified

**Preconditions**

- Confirm the transaction record's unique identifier field name from Transaction Entry PRD Instruction 9 before writing the foreign key.
- PRD Open Question 5 (per-transaction reminder control vs. global toggle only) must be confirmed before deciding whether the enabled field belongs on this record.
- PRD Open Question 6 (retry behavior) must be confirmed or defaulted to no retry fields with a flag.

**Open Questions**

- PRD Open Question 5: Is reminder control per-transaction or global-only? This determines whether the enabled field belongs here or only in global settings.
- PRD Open Question 6: What is the retry behavior? If retries are supported, retry count and interval fields must be added here.

---

## Instruction 4: Reminder Scheduler

**Goal**
Implement the scheduling logic that computes the next reminder timestamp and writes it to the reminder schedule record when a recurring transaction is first saved, when an instance of the transaction is logged, or when the transaction's frequency is changed.

**Scope**
In scope: the next-timestamp computation function (given anchor date and frequency, returns the next due date), the write of the computed timestamp to the reminder schedule record, and the three trigger points: initial save of a recurring transaction, logging of a new instance, and frequency change on edit. Out of scope: the reminder delivery mechanism (Instruction 5), the schedule record schema (Instruction 3), the cancellation logic (Instruction 7), and the settings UI (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 6a (reminders scheduled based on the transaction's stored frequency and the date of the most recently logged instance — not the creation date alone), Section 6b (next scheduled reminder timestamp updated each time an instance is logged or frequency is changed)

**Constraints**

- The anchor date for next-timestamp computation must be confirmed (PRD Open Question 2): creation date, last logged date, or user-defined start date. If unconfirmed, use the date of the most recently logged instance (falling back to the transaction's stored date if no instance has been logged yet) and flag.
- The computation function accepts the anchor date, the interval unit, and the multiplier, and returns the next due timestamp. Implement it as a pure, testable function separate from the trigger logic.
- Trigger 1 — initial recurring save: create a reminder schedule record and write the first computed timestamp.
- Trigger 2 — instance logged: update the reminder schedule record's next timestamp by advancing the anchor date to the just-logged instance's date and recomputing.
- Trigger 3 — frequency change on edit: recompute the next timestamp from the current anchor date using the new frequency values and overwrite the stored timestamp.
- Do not deliver the notification here — write only the timestamp. Instruction 5 reads it and delivers at the right time.
- Use the date arithmetic library already present in the codebase (cross-reference Transaction Attachments PRD for the date utility convention). Do not introduce a new date library.
- Recommended execution order: run after Instructions 1 and 3 confirm the frequency field names and reminder schedule schema.

**Expected Output**

- A pure next-timestamp computation function: (anchorDate, intervalUnit, multiplier) → nextDueTimestamp.
- Trigger 1 handler: on recurring transaction save, creates a reminder schedule record with the first computed timestamp.
- Trigger 2 handler: on instance logged, updates the reminder schedule record's timestamp.
- Trigger 3 handler: on frequency change saved, recomputes and overwrites the timestamp.
- All three triggers write to the reminder schedule record using the schema from Instruction 3.

**Deliverables**

- Next-timestamp computation function file
- Trigger handlers wired to the three mutation points
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the interval unit enum values and the multiplier field name.
- Instruction 3 must define the reminder schedule record schema and its write interface.
- PRD Open Question 2 (anchor date) must be confirmed or defaulted with a flag.
- Confirm where in the codebase "instance logged" is detectable — this is the point where a new transaction is saved that the user identifies as an instance of a recurring one. If no such mechanism exists, define how the system distinguishes an instance log from a new unrelated transaction save.

**Open Questions**

- PRD Open Question 2: What is the anchor date for reminder scheduling — creation date, last logged instance date, or a user-defined start date?
- How does the system know a newly saved transaction is an instance of a specific recurring transaction? If this linkage is not already established in the codebase, it must be defined before Trigger 2 can be implemented.

---

## Instruction 5: Reminder Delivery

**Goal**
Implement the notification delivery mechanism that reads the next scheduled reminder timestamp for each recurring transaction and fires a notification at that time via the confirmed platform notification API, carrying a transaction context payload.

**Scope**
In scope: the background scheduler or polling mechanism that reads pending reminder timestamps and fires notifications when due, the notification payload construction (transaction identifier and field values for deep-link pre-fill), and the platform notification API integration. Out of scope: the deep-link routing on tap (Instruction 6), the timestamp computation (Instruction 4), the cancellation logic (Instruction 7), and the settings UI (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 34: notification delivered when due date arrives; notification tapped opens pre-filled entry form; no further reminder for a logged instance), Section 6b (device push tokens stored and kept current if push notifications used), Section 6c (background scheduling required; resilient to app closed or device offline)

**Constraints**

- This instruction is entirely dependent on PRD Open Question 3 (notification mechanism: push notification, in-app alert, or both). Do not implement until confirmed. If unconfirmed, implement push notification and flag as an assumption.
- The notification payload must carry at minimum the recurring transaction's identifier. If PRD Open Question 4 (deep-link to pre-filled form) is confirmed, the payload must also carry enough field values for Instruction 6 to reconstruct the entry form.
- Read only reminder schedule records where the enabled flag is true (per Instruction 3) and the next timestamp is at or before the current time.
- After delivering a notification, do not automatically advance the next timestamp — that is Trigger 2 in Instruction 4, fired when the user actually logs the instance.
- If push notifications are confirmed: store device push tokens per user, handle token refresh and invalidation, and use the confirmed push provider (APNs, FCM, or Web Push). Do not introduce a provider not already in the codebase or confirmed by the author.
- The scheduler must be resilient to the app being closed — it must not rely on the app being in the foreground to fire.
- Recommended execution order: run after Instructions 3 and 4 define the reminder schedule record and the scheduling logic.

**Expected Output**

- A background scheduler or server-side job that reads due reminder schedule records and fires notifications.
- Notification payload: transaction identifier and (if confirmed) field values for pre-fill.
- Push token management (if push notifications): storage, refresh, and invalidation handling.
- The scheduler fires only for enabled reminders with a due timestamp at or before now.

**Deliverables**

- Background scheduler or job implementation
- Notification payload construction
- Push token storage and refresh logic (if push notifications confirmed)
- List of all files added or modified

**Preconditions**

- PRD Open Question 3 (notification mechanism) must be confirmed before this instruction runs.
- PRD Open Question 4 (deep-link payload) must be confirmed to determine whether field values beyond the transaction identifier are required in the payload.
- PRD Open Question 6 (retry behavior) — if retries are confirmed, the scheduler must check retry count against the maximum before firing repeat notifications for the same due date.
- Instruction 3 must define the reminder schedule record and its enabled and timestamp fields before the scheduler queries them.
- Confirm the background job or scheduler infrastructure already available in the codebase before building a new one.

**Open Questions**

- PRD Open Question 3: Push notification, in-app alert, or both? The implementation differs significantly between the two.
- PRD Open Question 6: What is the retry behavior when a reminder is not acknowledged?

---

## Instruction 6: Reminder Deep-Link Handler

**Goal**
Implement the deep-link routing that intercepts a tapped reminder notification and navigates the user directly to a transaction entry form pre-populated with the recurring transaction's field values.

**Scope**
In scope: the notification tap handler, the routing logic that parses the notification payload and navigates to the entry form, and the pre-population of the entry form from the payload data. Out of scope: the notification delivery (Instruction 5), the entry form component itself (Transaction Entry PRD), and the reminder settings (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 34 second criterion: tapping reminder navigates to pre-filled entry form), Section 6c (notification payload must carry enough context to reconstruct the entry form)

**Constraints**

- This instruction is conditional on PRD Open Question 4 confirming deep-link routing. If unconfirmed, implement it and flag — the acceptance criteria state it as a requirement and removing it later is lower risk than omitting it.
- The handler must parse the transaction identifier from the notification payload and fetch the recurring transaction's current field values from the data store — do not rely solely on field values embedded in the payload, which may be stale if the transaction was edited after the notification was scheduled.
- Open the transaction entry form with all fields pre-populated from the recurring transaction, with the date field defaulting to the current date (not the recurring transaction's stored date), consistent with the duplicate behavior established in Transaction Management PRD Instruction 7.
- If the transaction no longer exists when the notification is tapped (it was deleted after the notification was scheduled), navigate to the home screen or transaction list and display an informational message — do not crash or open a blank form.
- Use the navigation and deep-link routing pattern already established in the codebase. Do not introduce a new routing library.
- Recommended execution order: run after Instruction 5 defines the notification payload structure and after the transaction entry form is available (Transaction Entry PRD).

**Expected Output**

- A notification tap handler that parses the payload, fetches the current transaction record, and navigates to a pre-filled entry form.
- The entry form opens with all recurring transaction field values pre-populated and the date field set to today.
- If the transaction no longer exists: informational navigation to the list or home screen.

**Deliverables**

- Notification tap handler and routing logic
- Entry form pre-population wiring (reusing the duplicate pre-fill pattern from Transaction Management PRD Instruction 7)
- Deleted-transaction fallback handling
- List of all files added or modified

**Preconditions**

- PRD Open Question 4 (deep-link to pre-filled form) must be confirmed or assumed confirmed with a flag.
- Instruction 5 must define the notification payload structure (specifically, the transaction identifier field) before this instruction parses it.
- Confirm the deep-link or notification routing pattern in the codebase before implementing the handler.

**Open Questions**

- PRD Open Question 4: Does tapping the notification deep-link to a pre-filled entry form, or open the app to the home screen? Without this confirmed, the entry form pre-population logic may be unnecessary.

---

## Instruction 7: Reminder Cancellation

**Goal**
Implement the cancellation logic that clears all pending reminder schedule records for a recurring transaction when that transaction is deleted, and updates the reminder schedule when the recurring designation is removed on edit.

**Scope**
In scope: the cancellation triggered on transaction deletion (single and bulk delete), the cancellation or nullification of the reminder schedule record when recurring is toggled off on an edited transaction, and the verification that no orphaned reminder schedule records remain after either event. Out of scope: the deletion logic itself (Transaction Management PRD), the delivery mechanism (Instruction 5), and the settings UI (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 34: recurring transaction deleted → all scheduled reminders cancelled; frequency changed → future reminders rescheduled — handled in Instruction 4; recurring designation removed → no further reminders), Section 6a (delete of recurring transaction must cancel all pending reminders; no reminder must fire for a non-existent transaction)

**Constraints**

- Cancellation on delete must hook into both single-delete and bulk-delete paths from the Transaction Management PRD — cross-reference Instruction 3 (single delete) and Instruction 9 (bulk delete) of that PRD for hook points.
- On transaction delete: delete the associated reminder schedule record(s) entirely — do not leave them with a null timestamp and an enabled=false flag.
- On recurring designation removed (edit saves recurring=false): delete or deactivate the associated reminder schedule record. If the codebase pattern prefers soft-deactivation (enabled=false, timestamp=null) over hard deletion, document the choice and confirm it is consistent with the deletion cascade pattern.
- No reminder schedule record may exist for a transaction that is either deleted or no longer marked recurring.
- Do not modify the delivery mechanism — the scheduler in Instruction 5 already filters by enabled=true; this instruction ensures no stale enabled records remain.
- Recommended execution order: run after Instructions 3 and 4 define the reminder schedule record, and after the transaction delete hook points are identifiable from the Transaction Management PRD.

**Expected Output**

- A cancellation function that accepts one or more transaction identifiers and deletes or deactivates all associated reminder schedule records.
- Wired to: single-delete handler, bulk-delete handler, and the edit-save path when recurring is toggled off.
- Post-cancellation: no reminder schedule record exists for the affected transaction(s) in an enabled state with a future timestamp.

**Deliverables**

- Cancellation function file
- Integration points in single-delete, bulk-delete, and recurring-toggle-off handlers
- List of all files added or modified

**Preconditions**

- Instruction 3 must define the reminder schedule record schema and its association to the transaction identifier.
- Cross-reference Transaction Management PRD Instructions 3 and 9 for the delete handler hook points before wiring the cancellation.
- Confirm whether hard delete or soft deactivation is the codebase's preferred cleanup pattern for associated records.

---

## Instruction 8: Reminder Settings

**Goal**
Implement the reminder enable/disable controls — a global toggle that enables or disables all recurring transaction reminders, and, if confirmed, a per-transaction toggle that enables or disables reminders for a specific recurring transaction.

**Scope**
In scope: the global reminder toggle in the notification settings screen, the per-transaction reminder toggle in the transaction detail or edit view (if confirmed), the storage of these preferences, and the effect of each toggle on the reminder schedule record's enabled field. Out of scope: the reminder delivery (Instruction 5), the schedule record schema (Instruction 3), and the scheduling logic (Instruction 4).

**Inputs**

- Full codebase
- PRD Section 5 (Story 34 fifth criterion: user can enable or disable reminders globally or per recurring transaction)

**Constraints**

- The global toggle must suppress all reminder deliveries when disabled — the scheduler in Instruction 5 must check the global setting before firing any notification. Confirm the global setting storage location (user settings table, local storage, or equivalent).
- If PRD Open Question 5 confirms per-transaction control: the per-transaction toggle reads and writes the enabled field on the reminder schedule record (Instruction 3). Disabling a specific transaction's reminder sets its enabled=false; re-enabling sets it back to true without changing the stored next timestamp.
- If PRD Open Question 5 confirms global-only: do not implement per-transaction toggle UI and flag the omission.
- The global toggle must not delete reminder schedule records — it suppresses delivery. Reminder schedule records remain intact so that reminders resume correctly when the global toggle is re-enabled.
- Do not modify the scheduler logic — this instruction only writes preference state that the scheduler reads.
- Recommended execution order: run after Instruction 3 defines the enabled field on the reminder schedule record.

**Expected Output**

- A global reminder toggle in the notification or app settings screen, persisted to the confirmed user settings store.
- If per-transaction control confirmed: a per-transaction toggle in the detail or edit view that writes to the reminder schedule record's enabled field.
- The scheduler in Instruction 5 reads the global setting and per-record enabled flag to determine whether to deliver each notification.

**Deliverables**

- Global toggle UI and persistence in the settings screen
- Per-transaction toggle UI and enabled field write (if confirmed)
- Documentation of where the global setting is stored and how the scheduler reads it
- List of all files added or modified

**Preconditions**

- PRD Open Question 5 (per-transaction vs. global-only reminder control) must be confirmed before the per-transaction toggle is built.
- Instruction 3 must define the reminder schedule record's enabled field before this instruction writes to it.
- Confirm the user settings storage mechanism in the codebase before persisting the global toggle value.

**Open Questions**

- PRD Open Question 5: Is reminder control per-transaction, global-only, or both? Without this, the per-transaction toggle cannot be scoped.
