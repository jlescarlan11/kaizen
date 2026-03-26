1. Balance Computation Function — Implement the canonical balance formula that derives the current balance from the full transaction store, including reconciliation adjustments, with consistent decimal precision.
2. Balance Auto-Calculation Trigger — Implement the data-layer hooks that fire the balance recomputation on every transaction mutation: create, edit, delete, and bulk delete.
3. Balance Display Update — Implement the UI-layer update that reflects the recomputed balance in the displayed balance figure after each mutation trigger fires.
4. Reconciliation Adjustment Record — Define and implement the data schema for reconciliation adjustment records, distinguishing them from regular transactions in the store.
5. Balance Reconciliation Workflow — Implement the reconciliation interface where the user enters a real-world balance, reviews the computed difference, and confirms or dismisses the adjustment.
6. Balance History Derivation — Implement the computation that produces a chronological sequence of balance values from the ordered transaction store, including reconciliation entries, with retroactive correction when past transactions are edited or deleted.
7. Balance History View — Implement the balance history screen that presents the derived chronological balance sequence, with each entry showing date, balance value, and the causative event.
8. Opening Balance — Implement the optional starting balance value that seeds the balance formula and appears as the first entry in the balance history.

---

## Instruction 1: Balance Computation Function

**Goal**
Implement the canonical function that computes the current balance from the full transaction store — summing income, subtracting expenses, and applying reconciliation adjustments — at consistent decimal precision, to serve as the single authoritative balance calculation used everywhere in the codebase.

**Scope**
In scope: the balance computation function, the formula (income sum minus expense sum plus or minus reconciliation adjustments), the decimal precision rule, and the opening balance addend if confirmed. Out of scope: the mutation trigger that invokes this function (Instruction 2), the UI update that displays the result (Instruction 3), the reconciliation adjustment schema (Instruction 4), and the balance history sequence (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 6b (balance formula: sum of income minus sum of expenses plus or minus reconciliation adjustments; minimum two decimal places; balance history reconstructable from transaction store alone), Section 6a (balance derived exclusively from transaction store; no mutable cached field)

**Constraints**

- The function must read all transactions and reconciliation adjustments from the store — do not read from any cached or stored balance field.
- Apply consistent decimal precision throughout the computation — do not allow intermediate values to be truncated or rounded inconsistently. Use the precision standard already established in the codebase (cross-reference Transaction Entry PRD Instruction 9 for the amount field type).
- The function must handle the case where the transaction store is empty — return zero, not null or undefined.
- Do not store the result of this function as a persistent field — the function is called whenever the balance is needed and returns a fresh computed value each time.
- If an opening balance is confirmed in scope (PRD Open Question 1), the function must accept it as an addend at the start of the computation. If unconfirmed, implement without it and flag the omission.
- PRD Open Question 7 (global balance vs. per-method balance) must be confirmed before writing the function signature. If per-method balances are required, the function must accept a method identifier as a parameter and filter accordingly. If unconfirmed, implement a global balance and flag.
- Recommended execution order: run before all other instructions — Instructions 2, 3, 5, 6, and 7 all depend on this function.

**Expected Output**

- A pure function (or equivalent) that accepts the full transaction dataset (and optionally an opening balance value) and returns the computed balance as a decimal value at consistent precision.
- The function correctly handles: income transactions (add), expense transactions (subtract), reconciliation adjustments (add or subtract per direction), and an empty dataset (return zero or opening balance if set).
- A named constant or configuration value for the decimal precision used.

**Deliverables**

- Balance computation function file
- Decimal precision constant or configuration
- Unit-level examples or test cases showing the formula applied to known inputs and expected outputs
- List of all files added or modified

**Preconditions**

- Cross-reference Transaction Entry PRD Instruction 9 output to confirm the amount field type and precision convention before writing the computation.
- PRD Open Question 7 (global vs. per-method) must be confirmed or defaulted to global with a flag.
- PRD Open Question 1 (opening balance) must be confirmed or defaulted to not included with a flag.
- Instruction 4 must define the reconciliation adjustment record's schema (amount and direction fields) before this function reads from it — or the reconciliation adjustment fields must be identifiable in the existing codebase.

**Open Questions**

- PRD Open Question 1: Is there an opening/starting balance? If yes, the function must include it as the base value before any transaction is summed.
- PRD Open Question 7: Is the balance global or per payment method? A per-method balance requires the function to be parameterized by method identifier.
- PRD Section 6b flags whether full recomputation or delta application is the preferred approach for edits. A pure recomputation function is simpler and always correct; a delta approach is more performant. Confirm the preferred approach with the author.

---

## Instruction 2: Balance Auto-Calculation Trigger

**Goal**
Implement the data-layer hooks that invoke the balance computation function after every transaction mutation — create, edit, delete, and bulk delete — ensuring no mutation path bypasses recalculation.

**Scope**
In scope: the trigger or subscription wired to each transaction mutation event (create, edit, delete, bulk delete) that calls the balance computation function from Instruction 1 and makes the result available to the UI layer. Out of scope: the balance computation itself (Instruction 1), the UI update that renders the result (Instruction 3), and the reconciliation workflow (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 5 (Story 26 acceptance criteria: balance updates on income save, expense save, edit, type change, delete, and bulk delete), Section 6a (auto-calculation must trigger on every transaction mutation; no mutation path may bypass recalculation), Section 6c (data layer must expose hooks or events the balance computation can subscribe to)

**Constraints**

- Every mutation path — create, edit, delete, and bulk delete — must invoke the trigger. Audit the codebase for all transaction write paths and confirm each is covered before completing this instruction.
- The trigger must fire after the mutation is confirmed persisted — do not recompute on optimistic writes that may be rolled back.
- Bulk delete must trigger a single recomputation after all deletions complete, not one recomputation per deleted transaction.
- The trigger must not require the UI layer to initiate it — it must fire from the data layer regardless of which UI path caused the mutation.
- Do not re-implement the balance computation — call the function defined in Instruction 1.
- Do not implement the UI update — the trigger's responsibility ends when the recomputed balance value is available for consumption. Instruction 3 handles the display update.
- Reconciliation adjustments (Instruction 4) are also transaction store mutations — confirm that the trigger covers reconciliation writes as well.
- Recommended execution order: run after Instruction 1 defines the computation function. Run before Instruction 3, which consumes the trigger's output.

**Expected Output**

- A trigger, event listener, or reactive subscription wired to each transaction mutation event.
- After each mutation, the balance computation function is called with the updated transaction dataset and the result is made available to the UI layer.
- Bulk delete triggers one recomputation, not N.
- A list of all transaction write paths in the codebase and confirmation that each is covered by the trigger.

**Deliverables**

- Trigger or subscription implementation wired to each mutation path
- Audit list of all transaction write paths and their trigger coverage
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the balance computation function before this instruction calls it.
- Confirm the data layer's mutation event model (callback hooks, reactive store, pub/sub, ORM lifecycle events, or equivalent) before choosing the trigger mechanism.
- Cross-reference Transaction Management PRD (delete and bulk delete handlers) and Transaction Entry PRD (create and edit handlers) to identify all mutation paths.

---

## Instruction 3: Balance Display Update

**Goal**
Implement the UI-layer update that reflects the recomputed balance in the displayed balance figure after each trigger fires from Instruction 2, with no intermediate inconsistent state visible to the user.

**Scope**
In scope: the UI component or state binding that reads the recomputed balance from the trigger output and updates the displayed figure, the update ordering guarantee (balance updates before the user can initiate another action), and the display location for the balance figure. Out of scope: the computation itself (Instruction 1), the mutation trigger (Instruction 2), and the balance history view (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 26 acceptance criteria: balance updates without manual user action; update completes before user can initiate another transaction action; bulk delete produces a single update, not sequential intermediate states), Section 6c (balance display implied by the transaction history screen — cross-reference Transaction History PRD)

**Constraints**

- The displayed balance must update atomically from the user's perspective — do not show an intermediate value between the old and new balance.
- For bulk delete, the display must update once after all deletions are reflected in the recomputed balance — not once per deleted transaction.
- The balance update must complete before the UI re-enables transaction actions — confirm the UI blocking or sequencing mechanism in the codebase before implementing.
- Do not re-implement the balance computation or the mutation trigger — bind the UI to the output already produced by Instruction 2.
- Cross-reference Transaction History PRD Instruction 7 for the existing balance display component — update it to bind to the trigger output rather than a static or separately fetched value, if applicable.
- Recommended execution order: run after Instructions 1 and 2.

**Expected Output**

- The balance display component reads from the trigger output (reactive state, store subscription, or equivalent) and re-renders when a new computed value is available.
- The update is atomic from the user's perspective — no intermediate inconsistent state is displayed.
- For bulk delete: the display updates once, after the full bulk deletion's recomputed balance is available.
- Before/after comparison of the balance display component showing the binding change.

**Deliverables**

- Updated balance display component file
- State binding or subscription showing how the trigger output flows to the display
- List of all files added or modified

**Preconditions**

- Instruction 2 must define the trigger output interface (how the recomputed balance is surfaced to the UI layer) before this instruction binds to it.
- Confirm the UI state management pattern in the codebase (reactive store, context, local state, or equivalent) before implementing the binding.
- Cross-reference Transaction History PRD Instruction 7 to avoid duplicating balance display logic.

---

## Instruction 4: Reconciliation Adjustment Record

**Goal**
Define and implement the data schema for reconciliation adjustment records, ensuring they are stored as distinct, identifiable entries separate from regular transactions, with the required fields to support balance computation and history display.

**Scope**
In scope: the reconciliation adjustment entity schema (amount, direction, timestamp, type identifier, and optional note field if confirmed), the storage location (within the existing transaction store with a type discriminator, or a separate entity — per confirmed approach), and the reference table documenting all field names and types. Out of scope: the reconciliation workflow UI (Instruction 5), balance computation (Instruction 1), and balance history rendering (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 6a (reconciliation adjustments must be recorded as distinct, identifiable entries; must not overwrite existing transactions; must appear as labeled, distinguishable events in both transaction and balance history), Section 6b (reconciliation adjustment records must store: adjustment amount, direction, timestamp, and a type identifier)

**Constraints**

- Reconciliation adjustments must be distinguishable from regular income and expense transactions at the data layer — do not store them as anonymous income or expense entries.
- The type identifier field must uniquely mark the record as a reconciliation adjustment — confirm the naming convention with the codebase before choosing a value.
- The direction field must indicate whether the adjustment is positive (increases balance) or negative (decreases balance).
- If PRD Open Question 2 confirms adjustments are stored within the existing transaction store (with a type discriminator), the schema addition must not break existing transaction queries that filter for regular income/expense records.
- If PRD Open Question 2 confirms a separate entity, define it as its own schema and document the join or union required for balance computation and history derivation.
- PRD Open Question 6 (note/reason field): if confirmed, add a nullable text field to the schema. If unconfirmed, omit and flag.
- Do not implement any UI or business logic here — this instruction produces the schema and reference document only.
- Recommended execution order: run before Instructions 5, 6, and 7, which all read from this schema. Coordinate with Instruction 1, which must read reconciliation adjustment fields for balance computation.

**Expected Output**

- The reconciliation adjustment schema: field names, data types, nullability, and constraints.
- Storage approach documented: within transaction store with type discriminator, or separate entity.
- A flat reference table: field name, type, required/optional, description.
- If modifying an existing schema, a before/after comparison and migration plan.

**Deliverables**

- New or updated schema file for reconciliation adjustment records
- Migration file or script if the codebase uses a migration system
- Flat reference table
- List of all files added or modified

**Preconditions**

- PRD Open Question 2 (special transaction type in existing store vs. separate adjustment entity) must be confirmed before the storage location is chosen. If unconfirmed, implement as a type-discriminated record within the existing transaction store and flag.
- PRD Open Question 6 (note/reason field) must be confirmed or defaulted to omitted with a flag.
- Confirm the transaction store's existing type field (if any) before adding a reconciliation discriminator value to avoid conflicts.

**Open Questions**

- PRD Open Question 2: Are reconciliation adjustments stored within the existing transaction store (with a type discriminator) or in a separate entity? This is the primary structural decision for this instruction.
- PRD Open Question 6: Does the reconciliation schema include a note or reason field?

---

## Instruction 5: Balance Reconciliation Workflow

**Goal**
Implement the reconciliation interface where the user enters a known real-world balance, reviews the computed difference, confirms to create a reconciliation adjustment record, or dismisses without any change.

**Scope**
In scope: the reconciliation screen or modal, the display of the current app-computed balance alongside the user's input field, the difference computation and pre-confirmation display, the write that creates a reconciliation adjustment record on confirm, the no-discrepancy path (no adjustment created when balances match), and the dismiss path (no writes). Out of scope: the reconciliation adjustment schema (Instruction 4), the balance computation function (Instruction 1), and the balance history rendering of the adjustment (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 27 acceptance criteria), Section 6a (reconciliation adjustments recorded as distinct entries; must not overwrite existing transactions), Section 6c (reconciliation interface distinct from standard transaction entry form)

**Constraints**

- Display the current app-computed balance from Instruction 1 — do not hardcode or independently compute it here.
- Compute the difference as: user-entered real-world balance minus app-computed balance. Display this difference (with sign) before the user confirms.
- If the difference is zero (balances match), inform the user that no discrepancy exists and do not create an adjustment record.
- On confirm with a non-zero difference: write a reconciliation adjustment record using the schema from Instruction 4. The adjustment amount is the absolute value of the difference; the direction is positive if the real-world balance is higher, negative if lower.
- On dismiss without confirming: no writes; balance and transaction history unchanged.
- The adjustment write must trigger the balance auto-calculation trigger from Instruction 2 — confirm the write path fires the trigger.
- Do not use the standard transaction entry form for reconciliation — the reconciliation interface is distinct, per PRD Section 6c.
- PRD Open Question 6 (note/reason field): if confirmed, include a note input in the reconciliation form. If unconfirmed, omit and flag.
- Recommended execution order: run after Instructions 1 and 4.

**Expected Output**

- A reconciliation interface (screen or modal) showing the current app balance and an input for the real-world balance.
- Difference computation displayed before confirmation, with direction (positive or negative).
- On confirm with difference: reconciliation adjustment record created; balance auto-calculation triggered; displayed balance updated to match the entered real-world figure.
- On confirm with no difference: informational message; no record created.
- On dismiss: no changes.

**Deliverables**

- Reconciliation interface component file
- Difference computation logic
- Reconciliation adjustment write call (using schema from Instruction 4)
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the balance computation function before this instruction reads the current balance from it.
- Instruction 4 must define the reconciliation adjustment schema before this instruction writes to it.
- Instruction 2's trigger must be confirmed to fire on reconciliation adjustment writes before this instruction is finalized.
- Confirm the navigation path to the reconciliation interface (PRD Section 6c flags this as unspecified).

---

## Instruction 6: Balance History Derivation

**Goal**
Implement the computation that produces a chronological sequence of balance values from the ordered transaction store, with each entry paired to its causative transaction or reconciliation event, and with retroactive correction when past transactions are edited or deleted.

**Scope**
In scope: the balance history derivation function that walks the ordered transaction list and computes the running balance at each step, including reconciliation adjustments as labeled entries; the retroactive recomputation logic that updates all entries from a modified transaction's date forward when a past transaction is edited or deleted. Out of scope: the balance history view rendering (Instruction 7), the balance computation function for the current balance (Instruction 1), and the reconciliation workflow (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 5 (Story 28 acceptance criteria: each history entry shows date, balance value, and causative event; retroactive correction on edit or delete; reconciliation appears as distinct labeled entry; reverse chronological default order), Section 6a (balance history entries must be recomputed from the transaction store when past transactions change), Section 6b (balance history reconstructable from transaction store alone; if a history table is maintained, it must never be the source of truth)

**Constraints**

- Derive history by walking the transaction store in chronological order and computing a running balance at each step — do not store a balance value per transaction record as a persistent field.
- Each history entry must include: date, balance value at that point, and a reference to the causative transaction or reconciliation record.
- Reconciliation adjustment entries must be labeled as reconciliation events — not shown as anonymous income or expense steps.
- PRD Open Question 3 (retroactive correction vs. audit trail preservation) must be confirmed before implementing. PRD Section 6a states retroactive correction is required — treat this as the working assumption and flag. If the author reverses this to audit trail preservation, the derivation logic changes fundamentally.
- If an opening balance is in scope (PRD Open Question 1), it must appear as the first entry in the sequence before any transaction is applied.
- PRD Open Question 5 (all-time vs. default time window): if a default window is required, the derivation function must accept a date range parameter. If unconfirmed, derive the full history and flag.
- Do not maintain a separate balance history table as the source of truth. If a history table is used for performance, document the sync mechanism and ensure it is invalidated and rebuilt when past transactions change.
- Recommended execution order: run after Instructions 1 and 4 confirm the computation formula and the reconciliation adjustment schema.

**Expected Output**

- A balance history derivation function that accepts the ordered transaction store (including reconciliation adjustments) and returns an array of `{ date, balance, event }` entries in chronological order.
- Each entry's balance value equals the running total at that point, computed from the balance formula in Instruction 1.
- Retroactive recomputation: when a past transaction is edited or deleted, all entries at or after that transaction's date are recomputed; entries before remain unchanged.
- Reconciliation entries labeled distinctly in the returned array.
- If an opening balance is confirmed, it appears as the first entry.

**Deliverables**

- Balance history derivation function file
- Retroactive recomputation logic and where it is triggered
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the balance formula before the derivation function applies it per step.
- Instruction 4 must define the reconciliation adjustment schema fields before the derivation function reads from them.
- PRD Open Question 3 (retroactive correction vs. audit trail) must be confirmed or defaulted to retroactive correction with a flag.
- PRD Open Question 1 (opening balance) must be confirmed or defaulted to absent with a flag.

**Open Questions**

- PRD Open Question 3: Is balance history retroactively corrected when past transactions change, or does it preserve original values as an audit trail? These are mutually exclusive designs.
- PRD Open Question 1: Is there an opening balance? If yes, the history sequence starts with it as a base entry.

---

## Instruction 7: Balance History View

**Goal**
Implement the balance history screen that renders the derived chronological balance sequence, displaying each entry with its date, balance value, and causative event label, in reverse chronological order by default.

**Scope**
In scope: the balance history screen component, the data fetch invoking the derivation function from Instruction 6, the per-entry display (date, balance, causative event), the reverse-chronological default order, and the labeled reconciliation event entries. Out of scope: the history derivation logic (Instruction 6), the balance computation function (Instruction 1), the reconciliation workflow (Instruction 5), and any charting or visualization beyond what is confirmed in PRD Open Question 4.

**Inputs**

- Full codebase
- PRD Section 5 (Story 28 acceptance criteria), Section 6c (balance history is a computed view or maintained log — choice affects query performance)

**Constraints**

- Display the history in reverse chronological order by default — most recent entry at the top.
- Each row must show at minimum: date, balance value at that point, and the transaction or event that caused the change. Do not omit any of these three fields.
- Reconciliation entries must be visually or textually distinguishable from regular income/expense entries — use a label consistent with the type identifier defined in Instruction 4.
- Do not re-implement the derivation logic — call the function from Instruction 6 and render its output.
- PRD Open Question 4 (list vs. line chart vs. both) must be confirmed before the rendering component is built. If unconfirmed, implement a list view and flag the chart as pending.
- PRD Open Question 5 (all-time vs. default time window): if a default window is confirmed, the view must pass the date range parameter to the derivation function. If unconfirmed, render all-time and flag.
- Do not implement editing or deletion of history entries from this view — it is read-only.
- Recommended execution order: run after Instruction 6 defines the derivation function's output structure.

**Expected Output**

- A balance history screen that calls the derivation function and renders each entry as a row (or chart point if confirmed).
- Reverse-chronological default order.
- Each row displays: date, balance value, and causative event label.
- Reconciliation entries display a label distinguishing them from regular transactions.
- An empty state for when no transactions exist (balance history is empty).

**Deliverables**

- Balance history screen component file
- Per-entry row component
- Empty state markup
- List of all files added or modified

**Preconditions**

- Instruction 6 must define the derivation function's output structure (`{ date, balance, event }` array) before this instruction renders it.
- PRD Open Question 4 (presentation format) must be confirmed before the rendering component is built. If a line chart is required, confirm whether a charting library is already present in the codebase.
- PRD Open Question 5 (default time window) must be confirmed or defaulted to all-time with a flag.

**Open Questions**

- PRD Open Question 4: Is the history displayed as a list, a line chart, or both? If a chart is required, a charting library may be needed — confirm its presence in the codebase.
- PRD Open Question 5: Does the history open with a default time window, or all-time?

---

## Instruction 8: Opening Balance

**Goal**
Implement the optional starting balance value that the user can set to seed the balance formula with a non-zero base, ensuring it is included in auto-calculation and appears as the first entry in the balance history.

**Scope**
In scope: the UI input where the user sets the opening balance, the storage of the opening balance value, the integration of the opening balance into the computation function from Instruction 1, and its appearance as the first entry in the balance history derivation from Instruction 6. Out of scope: the balance computation function logic beyond the addend (Instruction 1), the history derivation logic beyond the first entry (Instruction 6), and the reconciliation workflow (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 6b (balance formula may include an opening/starting balance — confirmed subject to Open Question 1), PRD Section 8 (opening balance out of scope unless confirmed by product owner)

**Constraints**

- This entire instruction is conditional on PRD Open Question 1 confirming an opening balance is in scope. If unconfirmed or confirmed out of scope, do not implement — halt and flag.
- The opening balance must be stored as a distinct value separate from the transaction store — do not create a synthetic transaction record to represent it.
- The opening balance is a one-time set value; it is not a transaction and must not appear in the transaction list. It must appear only as the first entry in the balance history.
- The computation function in Instruction 1 must accept the opening balance as an addend at the start of the formula — do not modify the function's core logic, only extend its input interface.
- The balance history derivation in Instruction 6 must prepend the opening balance as a labeled first entry with its set date before any transaction entries.
- Decimal precision must be consistent with the standard established in Instruction 1.
- Recommended execution order: run after Instructions 1 and 6 are complete, since this instruction extends both of their interfaces.

**Expected Output**

- A UI input (settings screen, onboarding step, or equivalent — confirm location with the author) where the user can set an opening balance value.
- The opening balance stored persistently per user, separate from the transaction store.
- The computation function from Instruction 1 updated to include the opening balance as the base addend.
- The history derivation from Instruction 6 updated to prepend the opening balance as the first labeled history entry.

**Deliverables**

- Opening balance storage (field in user settings or equivalent)
- Opening balance input UI
- Updated computation function signature showing the opening balance addend integration
- Updated history derivation showing the first-entry prepend
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 must be confirmed in scope before this instruction runs.
- Confirm where the opening balance input UI is located (onboarding, settings, or a dedicated balance setup screen).
- Instruction 1 must define the computation function's input interface before this instruction extends it.
- Instruction 6 must define the history derivation's entry structure before this instruction prepends to it.

**Open Questions**

- PRD Open Question 1: Is an opening balance in scope? Without a yes from the author, this instruction must not run.
