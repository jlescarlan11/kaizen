1. Validation Rule Set — Define and implement the canonical validation rule set for transaction records as a single authoritative module, covering all required fields, type constraints, range constraints, and format rules.
2. Data-Layer Validation Enforcement — Implement the validation gate at the data layer that runs every transaction mutation — create, edit, and sync — through the canonical rule set before any write is executed, regardless of mutation origin.
3. Sync-Path Validation — Implement the validation step applied to locally saved transactions when they reach the remote store during sync, surfacing or quarantining failures per the confirmed strategy.
4. Validation Error Response Schema — Define the structured error response format returned by the data-layer validation gate, carrying field identifiers and error codes that the UI layer can map to field locations without string parsing.
5. Field-Level Inline Error Display — Implement the UI component and wiring that renders validation error messages adjacent to the specific fields that failed, clears them when the condition is resolved, and exposes the association programmatically for screen readers.
6. System-Level Error Messages — Implement the toast or alert component that surfaces system-level failure messages — sync failure, network timeout, storage write error — identifying the failure type, data-save status, and whether user action or automatic retry applies.
7. Success and Offline State Confirmation Messages — Implement the confirmation message for successful actions and the distinct error message for offline-blocked actions, ensuring success and failure states are visually unambiguous.
8. Error Message Copy Management — Implement the centralized copy store for all user-facing error and confirmation message strings, structured to support future localization without changes to business logic.

---

## Instruction 1: Validation Rule Set

**Goal**
Define and implement the canonical validation rule set for transaction records as a single authoritative module that all validation enforcement points consume, covering required field presence, type constraints, range constraints, and format rules.

**Scope**
In scope: the rule definitions for every transaction field — required/optional, type, range, and format constraints — organized as a single module that is imported by both the data-layer enforcement (Instruction 2) and the UI layer for mirroring. Out of scope: the enforcement gate that runs records through the rules (Instruction 2), the error response schema (Instruction 4), the UI error display (Instruction 5), and validation of non-transaction fields (out of scope per PRD Section 8).

**Inputs**

- Full codebase
- PRD Section 6b (at minimum: amount is a positive number > 0 with no more than two decimal places; type is one of the defined valid transaction types; date is a valid calendar date not in the future; required fields are non-null and non-empty), Section 6a (single canonical rule location; data layer is authoritative; UI mirrors), Section 5 Story 37 acceptance criteria

**Constraints**

- Define rules only for fields explicitly confirmed as existing in the transaction schema — cross-reference all schema-defining PRDs (Transaction Entry, Categories, Payment Methods, Notes, Recurring) for the full field list. Do not fabricate field names.
- Required field presence checks must be defined and sequenced before type/range/format checks. A null value must produce a "required" error, never a type or range error.
- Amount rule: positive number, greater than zero (subject to PRD Open Question 2 confirmation), maximum two decimal places. If zero is confirmed valid, adjust the rule and flag.
- Type rule: value must be one of the valid transaction types as defined in the Transaction Entry PRD schema.
- Date rule: valid calendar date, not in the future — consistent with the Transaction Entry PRD future-date constraint.
- PRD Open Question 7 (auto-rounding vs. user-correction for decimal places) must be confirmed. If auto-rounding is confirmed, the rule does not reject — it corrects silently. If user-correction is required, the rule rejects with an error. If unconfirmed, reject and flag.
- Do not hard-code user-facing message strings in the rule definitions — rules return error codes only. Message copy belongs to Instruction 8.
- Recommended execution order: run before all other instructions — Instructions 2, 3, 4, and 5 all depend on this module.

**Expected Output**

- A validation rule module that exports a rule definition per transaction field: field name, required flag, type constraint, range constraint, format constraint.
- A validation function that accepts a transaction record object and returns a structured list of `{ field, errorCode }` pairs for each violated rule, or an empty list if the record is valid.
- The function applies required-presence checks before type/range checks.

**Deliverables**

- Validation rule module file
- Per-field rule definitions with named error codes
- Validation function returning structured `{ field, errorCode }` pairs
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (complete required field list and all constraints) must be confirmed before the rule set is finalized. If unconfirmed, implement the minimum confirmed rules and mark all others as provisional with flags.
- PRD Open Question 2 (zero-amount validity) must be confirmed before the amount > 0 rule is written as absolute.
- PRD Open Question 7 (auto-rounding vs. rejection for decimal places) must be confirmed before the decimal format rule is written.
- Cross-reference all transaction schema PRDs to confirm the full field list before writing rules.

**Open Questions**

- PRD Open Question 1: What is the complete required field list and what are all type and range constraints? Without this, the rule set is necessarily provisional.
- PRD Open Question 2: Are zero-amount transactions valid? This determines whether the amount rule is `> 0` or `>= 0`.
- PRD Open Question 7: Is exceeding two decimal places an auto-correctable condition or a user-rejection? Determines whether the format rule corrects or rejects.

---

## Instruction 2: Data-Layer Validation Enforcement

**Goal**
Implement the validation gate at the data layer that runs every transaction mutation — create, edit — through the canonical rule set from Instruction 1 before any write is executed, and rejects the mutation with a structured error response if any rule is violated, regardless of whether the mutation originates from the UI, offline sync, or a direct data-layer call.

**Scope**
In scope: the validation gate function wired to the transaction create and edit write paths, the invocation of the rule set from Instruction 1, the rejection behavior (no write on failure), and the structured error response returned on rejection. Out of scope: the rule definitions (Instruction 1), the sync-specific validation path (Instruction 3), the error response schema definition (Instruction 4 — this instruction uses it; Instruction 4 defines it), and the UI error display (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 5 Story 37 (eighth criterion: same validation applied regardless of mutation origin), Section 6a (validation enforced at data layer; not bypassable via UI circumvention; required field checks before format/range checks)

**Constraints**

- The gate must be positioned at the data layer write function — not exclusively in UI submit handlers. Any call to the transaction write function must pass through the gate.
- On validation failure: do not execute the write. Return the structured error response from Instruction 4's schema immediately.
- On validation success: execute the write normally.
- The gate must invoke the canonical rule set from Instruction 1 — do not re-implement validation logic here.
- The gate must cover both create and edit mutation paths. Audit the codebase for all transaction write entry points and confirm each is gated. Document the audit result.
- Required-presence checks must run before type/range checks — this is enforced by the rule set in Instruction 1; confirm the gate does not reorder the checks.
- Recommended execution order: run after Instructions 1 and 4 define the rule set and error response schema.

**Expected Output**

- A validation gate function wrapping the transaction write operation: validates the record, rejects with structured error on failure, writes on success.
- An audit list of all transaction write entry points in the codebase and confirmation that each is covered by the gate.
- No transaction write can succeed with an invalid record, regardless of origin.

**Deliverables**

- Validation gate implementation wired to all transaction write paths
- Audit list of write entry points and coverage confirmation
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the validation rule set and the `{ field, errorCode }` response format.
- Instruction 4 must define the structured error response schema before this instruction returns it.
- Confirm all transaction write entry points in the codebase (cross-reference Transaction Entry PRD, Transaction Management PRD, and Performance & Offline PRD sync path).

---

## Instruction 3: Sync-Path Validation

**Goal**
Implement the validation step applied to locally saved transactions when they reach the remote store during the sync process, and surface or quarantine validation failures per the confirmed handling strategy.

**Scope**
In scope: the validation invocation in the sync loop (from Performance & Offline PRD Instruction 7) before each remote write, the failure handling (surface to user after the fact, quarantine, or prompt per PRD Open Question 6), and the sync status update for records that fail remote validation. Out of scope: the rule set (Instruction 1), the data-layer gate for online writes (Instruction 2), the sync loop orchestration (Performance & Offline PRD), and the UI error display for inline form errors (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 6c (offline sync path runs incoming transactions through the same validation layer before writing to remote store; locally saved transactions not guaranteed valid at remote level), Section 5 Story 37 (eighth criterion: same rules applied regardless of origin)

**Constraints**

- Run the canonical rule set from Instruction 1 on each locally pending transaction before the sync loop attempts the remote write.
- On validation failure at sync time: do not write the invalid record to the remote store. Update the local sync status to "failed" with a failure reason code.
- PRD Open Question 6 (how sync validation failures are communicated to the user — surfaced after the fact, silently quarantined, or prompted for correction) must be confirmed before the failure communication path is implemented. If unconfirmed, surface a system-level message after sync completes identifying the failed transaction(s) and flag.
- Do not re-implement the sync loop — hook into the pre-write step defined in Performance & Offline PRD Instruction 7.
- The failure handling for sync validation must use the system-level error message pattern from Instruction 6, not the inline field-level pattern from Instruction 5 — the user is not on the entry form at sync time.
- Recommended execution order: run after Instruction 1 (rule set) and after Performance & Offline PRD Instruction 7 (sync loop) define their interfaces.

**Expected Output**

- A pre-write validation hook in the sync loop that invokes the canonical rule set on each pending transaction.
- On failure: sync status updated to failed with reason code; remote write skipped.
- On confirmed failure communication strategy: user-facing notification of sync validation failure identifies the affected transaction(s) and states what action to take.

**Deliverables**

- Sync pre-write validation hook
- Sync status failure update with reason code
- Failure communication message integration (via Instruction 6's system message component)
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the validation rule set and return format.
- Performance & Offline PRD Instruction 7 must define the sync loop's pre-write hook point.
- PRD Open Question 6 (sync validation failure communication) must be confirmed or defaulted to post-sync surface notification with a flag.

**Open Questions**

- PRD Open Question 6: How are sync-time validation failures communicated — surfaced after sync, silently quarantined, or prompted for user correction in real time?

---

## Instruction 4: Validation Error Response Schema

**Goal**
Define the structured error response format returned by the data-layer validation gate, ensuring each error carries a field identifier and an error code that the UI layer can map to field locations and message copy without string parsing.

**Scope**
In scope: the error response object schema (structure, field names, types), the multi-error representation (one response carrying errors for multiple fields), and the documentation of all error codes mapped to their corresponding rule. Out of scope: the rule definitions (Instruction 1), the enforcement gate (Instruction 2), the UI display (Instruction 5), and the message copy (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 6b (validation error responses must be structured; each error carries field identifier and error code or message string; UI must map errors to field locations without string parsing)

**Constraints**

- The response schema must represent multiple field errors in a single response — do not return only the first failing field when multiple fields fail.
- Each error entry must carry at minimum: a field identifier (matching the field name in the transaction schema exactly) and an error code (a named constant, not a raw string).
- Error codes must be named constants defined alongside the rule set in Instruction 1. Do not use numeric codes or raw strings that couple the UI to data-layer internals.
- The schema must be defined as a type or interface in the codebase's type system (TypeScript interface, Zod schema, or equivalent). Do not define it only as a comment or documentation.
- The response must distinguish between "no errors" (valid record) and "one or more errors" (invalid record) unambiguously — do not return an empty array and an errors array in the same response with different meanings.
- Do not include user-facing message strings in the schema — that belongs to Instruction 8.
- Recommended execution order: run after Instruction 1 defines the error codes. Run before Instruction 2 (which returns this schema) and Instruction 5 (which consumes it).

**Expected Output**

- A typed error response schema: `{ valid: boolean, errors: Array<{ field: string, code: ErrorCode }> }` or equivalent.
- All error codes as named constants co-located with the rule set from Instruction 1 or in a shared constants file.
- Documentation mapping each error code to its rule and the fields it can appear on.

**Deliverables**

- Error response type or interface definition
- Named error code constants
- Error code → rule mapping documentation
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the error codes before this instruction formalizes them into a typed schema.
- Confirm the codebase's type system (TypeScript, flow, runtime schema library) before choosing the schema definition mechanism.

---

## Instruction 5: Field-Level Inline Error Display

**Goal**
Implement the UI component and wiring that renders validation error messages adjacent to the specific fields that failed, clears them when the condition is resolved on resubmission, and exposes the message-to-field association programmatically for screen readers.

**Scope**
In scope: the inline error message component rendered adjacent to each form field, the wiring that maps the structured error response from Instruction 4 to the correct field location, the clearing behavior when errors are resolved, and the accessible association between error message and input field. Out of scope: system-level error messages (Instruction 6), the validation rule set (Instruction 1), the enforcement gate (Instruction 2), and message copy (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 Story 38 (first three acceptance criteria: per-field identification; message adjacent to field; message states problem and expected value), Section 6a (error messages must not expose stack traces, database codes, or internal field names), Section 6c (error association must be programmatically expressed for screen readers)

**Constraints**

- Map each `{ field, code }` entry from the validation error response to the corresponding form field component using the field identifier — do not parse error message strings to determine placement.
- Render the error message immediately adjacent to its field — not only in a summary at the top or bottom of the form.
- Look up the human-readable message copy from the copy store in Instruction 8 using the error code — do not inline message strings here.
- Do not expose internal field names, error codes, or database identifiers in the rendered message.
- Clear the error message for a field when the form is resubmitted and that field no longer appears in the validation error response. Do not clear all errors on any input change — clear only resolved errors on resubmission.
- Accessibility: associate each error message with its input field programmatically (e.g., `aria-describedby` on web, `accessibilityDescribedBy` on React Native, or the platform equivalent). The association must be in the markup, not only visual proximity.
- Use the form and input component patterns already established in the codebase. Do not introduce a new form library.
- Recommended execution order: run after Instructions 4 (error response schema) and 8 (copy store) define the inputs this component consumes.

**Expected Output**

- An inline error message component that accepts a field identifier and an error code and renders the corresponding message copy adjacent to the field.
- Wiring in each transaction form (entry, edit) that passes the validation error response to the inline error component and maps errors to their fields.
- Clearing behavior: resolved errors removed on resubmission.
- Accessible markup: error message programmatically associated with its input field.

**Deliverables**

- Inline error message component file
- Wiring in transaction entry form, edit form, and any other form invoking transaction writes
- Accessible association markup
- List of all files added or modified

**Preconditions**

- Instruction 4 must define the error response schema and field identifier format before the mapping logic is written.
- Instruction 8 must define the copy store and its lookup interface before this instruction calls it for message strings.
- Cross-reference the transaction entry and edit form components to confirm where the validation error response is received and where the inline component must be injected.

---

## Instruction 6: System-Level Error Messages

**Goal**
Implement the toast or alert component that surfaces system-level failure messages — sync failure, network timeout, storage write error — identifying the failure type, confirming whether the user's data was saved, and stating whether the user must act or the system will retry.

**Scope**
In scope: the system-level error message component (toast, snackbar, or modal alert), the variants for each system failure type (sync failure, network timeout, storage error), the data-saved confirmation in each message, the action-required vs. auto-retry distinction, and the offline-blocked action message. Out of scope: field-level inline errors (Instruction 5), success confirmations (Instruction 7), validation rule enforcement (Instructions 1–3), and message copy (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 Story 38 (fourth criterion: system-level failure message identifies type, data-save status, user action or auto-retry; seventh criterion: offline action message explicitly states connectivity requirement), Section 6a (error messages must not expose stack traces or internal codes)

**Constraints**

- The component must support at minimum these message variants: sync failure (with data-save status and retry indication), network timeout, storage write error, and offline-blocked action. Define each as a named message type, not a freeform string.
- Each message must state: what failed, whether the user's data was saved, and whether user action is needed or the system retries automatically. All three pieces must be present — a message that omits data-save status leaves the user uncertain about data loss.
- The offline-blocked action message must explicitly name the connectivity requirement — it must not display a generic failure message.
- Do not expose stack traces, error codes, database error messages, or internal identifiers in the rendered message.
- Look up message copy from the copy store in Instruction 8 using the message type identifier — do not inline strings here.
- Use the toast, snackbar, or alert pattern already established in the codebase. Do not introduce a new notification library.
- The component must be visually distinct from success confirmations (Instruction 7) — success and failure states must not be ambiguous.
- Recommended execution order: run after Instruction 8 defines the copy store.

**Expected Output**

- A system-level error message component supporting the named failure variants.
- Each variant rendered with: failure type label, data-save status, action instruction or auto-retry statement.
- Offline-blocked variant explicitly naming the connectivity requirement.
- No internal codes or stack traces in any rendered variant.
- Visual distinction from success message component (Instruction 7).

**Deliverables**

- System-level error message component file
- Named message type constants for each failure variant
- Integration points where each failure type is triggered (sync loop, network timeout handler, storage write error handler)
- List of all files added or modified

**Preconditions**

- Instruction 8 must define the copy store and lookup interface before this instruction calls it.
- Confirm the toast/snackbar/alert component pattern already in the codebase before selecting a presentation mechanism.
- Cross-reference Performance & Offline PRD Instructions 7 and 9 for the sync failure and offline state trigger points.

---

## Instruction 7: Success and Offline State Confirmation Messages

**Goal**
Implement the confirmation message displayed when an action succeeds and the distinct offline-state message displayed when an offline-created transaction is saved locally, ensuring success and failure states are visually unambiguous and neither is shown in the other's context.

**Scope**
In scope: the success confirmation component, the offline-save confirmation message (transaction saved locally — no network language), and the visual distinction between success, offline-save, and failure states. Out of scope: field-level errors (Instruction 5), system-level failure messages (Instruction 6), and message copy (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 Story 38 (sixth criterion: success confirmation visually distinct from error; fifth criterion: error cleared when condition resolved), Performance & Offline PRD Story 36 (offline save confirmed to user without indicating network is required)

**Constraints**

- The success confirmation must be visually distinct from the system-level error message (Instruction 6) — color, icon, or layout must unambiguously differentiate the two states. Do not rely on text content alone to distinguish them.
- The offline-save confirmation must confirm that the transaction was saved without any language implying a network failure or pending state. Use copy from Instruction 8's copy store — do not inline strings.
- Do not show a success confirmation and an error message simultaneously for the same action.
- Use the notification pattern already established in the codebase for transient confirmations (toast, snackbar, or equivalent).
- Recommended execution order: run after Instruction 8 defines the copy store and after Instruction 6 establishes the failure message visual treatment (so this instruction can be visually distinct from it).

**Expected Output**

- A success confirmation component rendered after a transaction is successfully saved (online or synced).
- An offline-save confirmation component rendered after a transaction is saved locally while offline — no network-state language.
- Both are visually unambiguous from the system-level error message (Instruction 6) in the same UI context.

**Deliverables**

- Success confirmation component file
- Offline-save confirmation component (or variant of the success component)
- Visual distinction documentation (color token, icon, or layout differentiation from error)
- List of all files added or modified

**Preconditions**

- Instruction 8 must define the copy store before this instruction looks up confirmation message strings.
- Instruction 6 must establish the failure message visual treatment before this instruction defines a visually distinct success treatment.

---

## Instruction 8: Error Message Copy Management

**Goal**
Implement the centralized copy store for all user-facing error, confirmation, and system message strings, keyed by error code or message type identifier, structured to support future localization without requiring changes to business logic or component code.

**Scope**
In scope: the copy store module mapping error codes and message type identifiers to human-readable strings, the lookup function used by Instructions 5, 6, and 7, and the structure that allows strings to be replaced by a different locale without changing any consuming code. Out of scope: localization into additional languages (out of scope per PRD Section 8 unless confirmed), the error components themselves (Instructions 5, 6, 7), and the rule set (Instruction 1).

**Inputs**

- Full codebase
- PRD Section 6b (error message copy stored or managed to support future localization; hard-coded user-facing strings in business logic not acceptable), Section 5 Story 38 (messages state problem and expected value; no internal codes or technical identifiers exposed)

**Constraints**

- Every user-facing error and confirmation string used by Instructions 5, 6, and 7 must be defined here. No user-facing string may be hard-coded in a component, rule module, or business logic file.
- The copy store is keyed by error code or message type identifier (named constants from Instruction 4 and Instruction 6). The lookup function accepts a key and returns the string for the current locale.
- PRD Open Question 5 (localization at launch vs. single-language initially) determines whether the store must support multiple locale bundles at launch or only one. If single-language at launch, structure the store as a keyed object that can be replaced with a locale-aware lookup without changing consuming code.
- PRD Open Question 4 (tone and reading level) must be confirmed before message copy is written. If unconfirmed, write in plain, direct language at a general adult reading level and flag.
- Each string must state the problem and, where applicable, the expected value or format — not just that something went wrong.
- Recommended execution order: run before Instructions 5, 6, and 7, which all look up strings from this store. May be run in parallel with Instructions 1–4 since it defines strings, not logic.

**Expected Output**

- A copy store module: `{ [errorCodeOrMessageType: string]: string }` (or locale-keyed equivalent).
- A lookup function: `getMessage(key: string, locale?: string): string` — returns the string for the given key, supporting future locale substitution without a code change.
- All error and confirmation strings for the confirmed field list, error codes, and system failure types.

**Deliverables**

- Copy store module file
- Lookup function
- All message strings for the confirmed error codes and message type identifiers
- List of all files added or modified

**Preconditions**

- Instruction 1 must define all error codes before the copy store can map them to strings.
- Instruction 4 must define named error code constants before the store keys are finalized.
- Instruction 6 must define named message type identifiers for system failures before the store keys are finalized.
- PRD Open Question 4 (tone and reading level) must be confirmed or defaulted to plain adult language with a flag.
- PRD Open Question 5 (localization at launch) must be confirmed to determine whether the store must support multiple locale bundles immediately or only one.

**Open Questions**

- PRD Open Question 4: What is the confirmed tone and reading level for error message copy?
- PRD Open Question 5: Must localization be supported at launch, or is single-language acceptable for the initial release?

1. Insights Aggregation Queries — Implement the date-range-scoped data layer query functions that compute spending summary totals, category breakdown groups, and per-period trend sums, operating efficiently without full in-memory dataset loads.
2. Shared Period Selector — Implement the shared time period selector component used across all three insights views, ensuring a period change propagates consistently to all dependent views.
3. Spending Summary View — Implement the spending summary screen that displays total income, total expenses, and net figure for the selected period, with zero-state handling and reactivity to transaction mutations.
4. Category Breakdown View — Implement the category breakdown screen that distributes total expenses across categories with amounts, percentage shares, and an uncategorized entry, in the confirmed visual format.
5. Category Drill-Down — Implement the navigation from a category breakdown entry to the filtered transaction list showing the transactions that make up that category's total for the selected period.
6. Spending Trends View — Implement the trend chart that displays total spending across consecutive periods at the selected granularity, with zero-value periods represented explicitly and interactive value display on selection.
7. Insights Cache Invalidation — Implement the cache invalidation trigger that clears pre-computed trend and summary caches when any transaction within the relevant date range is added, edited, or deleted.

---

## Instruction 1: Insights Aggregation Queries

**Goal**
Implement the date-range-scoped data layer query functions that compute total income, total expenses, category-grouped expense sums, and per-period trend sums — as efficient aggregation queries that do not load the full transaction dataset into application memory.

**Scope**
In scope: three query functions — spending summary (total income, total expenses for a date range), category breakdown (expense sum and row count grouped by category including null, for a date range), and trend series (expense sum grouped by time unit for a sequence of periods). Out of scope: the UI views that call these functions (Instructions 3, 4, 6), the period selector (Instruction 2), cache invalidation (Instruction 7), and the category drill-down list (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 6a (all views operate on the same period; totals derived from transaction store at query time; net must equal income minus expenses), Section 6b (data layer must support date-range filtering, category grouping, and time-unit grouping; uncategorized transactions queryable as a distinct null group; zero-spending periods represented as zero not omitted), Section 6c (charting and breakdown depend on category system from Transaction Categories PRD)

**Constraints**

- All three functions must operate as aggregation queries at the data layer — sum, group-by, and filter must execute in the query, not in application-layer loops over full result sets.
- Spending summary query: accepts a date range, returns `{ totalIncome, totalExpenses }`. Net is computed by the caller — do not return a stored net field.
- Category breakdown query: accepts a date range, groups expense transactions by category identifier (treating null as a distinct group key, not excluded), returns `[{ categoryId, categoryName, total, transactionCount }]` including a row where categoryId is null labeled for "Uncategorized" display.
- Trend query: accepts a date range and a time unit (week or month), groups expense transactions by the time unit bucket derived from the transaction's stored date, returns `[{ periodStart, total }]` with zero-value entries for buckets within the range that have no transactions.
- Use the transaction date field (not creation timestamp or sync timestamp) as the grouping and filter key in all three queries.
- Do not fabricate query syntax, ORM method names, or table names — use the data layer patterns verifiably present in the codebase.
- PRD Open Question 4 (trend granularity options) must be confirmed before the time-unit parameter enum is defined. If unconfirmed, support weekly and monthly and flag.
- PRD Open Question 5 (expenses only vs. income overlay in trend) must be confirmed. If unconfirmed, implement expense-only trend query and flag.
- Recommended execution order: run before Instructions 3, 4, 5, and 6, which all call these functions.

**Expected Output**

- `querySummary(startDate, endDate) → { totalIncome, totalExpenses }` — data-layer aggregation, no full load.
- `queryCategoryBreakdown(startDate, endDate) → [{ categoryId, categoryName, total, transactionCount }]` — includes null category as distinct row.
- `queryTrendSeries(startDate, endDate, timeUnit) → [{ periodStart, total }]` — zero-filled for empty buckets within range.

**Deliverables**

- Three aggregation query functions in a shared insights query module
- Zero-bucket fill logic for trend query
- List of all files added or modified

**Preconditions**

- Confirm the data layer's support for grouping and aggregation queries (ORM group-by, SQL aggregate, or equivalent) before writing query syntax.
- Cross-reference Transaction Categories PRD Instruction 1 for the category entity field names used in the breakdown grouping.
- PRD Open Question 4 (trend granularity options) must be confirmed or defaulted to weekly/monthly with a flag.
- PRD Open Question 5 (expense-only vs. income overlay) must be confirmed or defaulted to expense-only with a flag.

**Open Questions**

- PRD Open Question 4: What time granularity options are available for the trend query — weekly, monthly, quarterly, others?
- PRD Open Question 5: Does the trend query return expense data only, or also income for overlay?
- PRD Open Question 7: Are zero-spending periods represented as explicit zero data points or omitted? PRD Section 6b states zero — treat as confirmed and flag if author reverses.

---

## Instruction 2: Shared Period Selector

**Goal**
Implement the shared time period selector component used across all three insights views, ensuring that a period change in any view propagates the new selection to all dependent views simultaneously.

**Scope**
In scope: the period selector UI component, the confirmed period options (current month, last month, last 3 months, all time, and any confirmed custom range), the shared state that all three insight views subscribe to, and the update propagation on period change. Out of scope: the three insight view implementations (Instructions 3, 4, 6), the aggregation queries (Instruction 1), and any per-view independent period selector if PRD Open Question 2 confirms independent scoping.

**Inputs**

- Full codebase
- PRD Section 6a (period selection shared across all three views; a period change must not leave another view showing data from a different period), Section 6c (shared period selector reused across views for consistent scoping)

**Constraints**

- PRD Open Question 2 (shared vs. independent period selectors) must be confirmed before this instruction is implemented. If shared is confirmed, implement one selector with shared state. If per-view independent is confirmed, this instruction changes to three independent selectors and the shared state mechanism is removed.
- PRD Open Question 1 (available period options) must be confirmed before the selector options are rendered. If unconfirmed, implement current month, last month, last 3 months, and all time as provisional options and flag.
- The selected period must be stored in a shared state accessible by all three insight views — not as local component state that does not propagate.
- When the period changes, all three insight views must re-query using the new period without requiring the user to navigate or refresh.
- Use the state management pattern already established in the codebase (context, store, or equivalent). Do not introduce a new state library.
- Recommended execution order: run before Instructions 3, 4, and 6, which subscribe to the shared period state.

**Expected Output**

- A period selector UI component rendering the confirmed period options.
- A shared period state that Instructions 3, 4, and 6 subscribe to.
- Period change propagates immediately to all three insight views.

**Deliverables**

- Period selector component file
- Shared period state definition (context, store key, or equivalent)
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (period options) must be confirmed or provisionally defaulted before the selector options are built.
- PRD Open Question 2 (shared vs. independent) must be confirmed before the state architecture is chosen.

**Open Questions**

- PRD Open Question 1: What time period options are available — current month, last month, last 3 months, custom range, all time?
- PRD Open Question 2: Is period selection shared across all three views, or can each be scoped independently?

---

## Instruction 3: Spending Summary View

**Goal**
Implement the spending summary screen that displays total income, total expenses, and net (income minus expenses) for the selected period, handles the zero-transaction empty state with zero values (not null), and updates when the period changes or transaction data changes.

**Scope**
In scope: the spending summary screen component, the invocation of the summary aggregation query from Instruction 1, the display of total income, total expenses, and computed net, the zero-state (all three figures show zero), and reactivity to period selector changes and transaction mutations. Out of scope: the period selector (Instruction 2), the aggregation query (Instruction 1), the category breakdown (Instruction 4), and the trend view (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 5 (Story 39 acceptance criteria), Section 6a (net equals total income minus total expenses; must not be a stored field)

**Constraints**

- Compute net as `totalIncome - totalExpenses` in the view layer from the query results — do not read a stored net field.
- When the selected period contains no transactions, display 0 for all three figures — not blank, null, or a loading state.
- The view must re-invoke the summary query when the shared period selection changes (subscribing to the state from Instruction 2).
- The view must reflect updated data when a transaction affecting the selected period is added, edited, or deleted — cross-reference Instruction 7 for the cache invalidation trigger that drives this.
- Do not display internal field names, raw database values, or query metadata in the view.
- Recommended execution order: run after Instructions 1 and 2 define the query function and shared period state.

**Expected Output**

- A spending summary screen displaying: total income, total expenses, and computed net for the selected period.
- Zero-state: all three figures display as 0 when no transactions exist in the period.
- Period change: view re-queries and updates immediately.
- Transaction mutation: view reflects updated data when the period-relevant transaction cache is invalidated.

**Deliverables**

- Spending summary screen component file
- Query invocation and period subscription wiring
- Net computation (not stored field)
- Zero-state display
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the `querySummary` function signature before this instruction calls it.
- Instruction 2 must define the shared period state interface before this instruction subscribes to it.
- Instruction 7 must define the cache invalidation event before this instruction's re-fetch is wired to it.

---

## Instruction 4: Category Breakdown View

**Goal**
Implement the category breakdown screen that distributes total expenses across categories for the selected period, displaying each category's amount and percentage share in the confirmed visual format, with uncategorized spending as a distinct labeled entry, and an empty state when no expense transactions exist.

**Scope**
In scope: the category breakdown screen, the invocation of the category breakdown query from Instruction 1, the percentage share computation per category, the uncategorized entry rendering, the confirmed visual format (ranked list, pie/donut chart, or combination), the descending-amount default sort, and the empty state. Out of scope: the period selector (Instruction 2), the aggregation query (Instruction 1), the drill-down navigation (Instruction 5), and the spending summary (Instruction 3).

**Inputs**

- Full codebase
- PRD Section 5 (Story 40 acceptance criteria), Section 6a (expense transactions only; uncategorized as distinct group; category totals must sum to the period's total expense figure), Section 6c (charting library for visual format — unspecified)

**Constraints**

- Compute percentage share per category as `categoryTotal / totalExpenses * 100` — do not store or retrieve a pre-computed percentage.
- The sum of all displayed category totals (including the uncategorized entry) must equal the total expenses figure from the spending summary for the same period.
- The uncategorized entry must be explicitly labeled (e.g., "Uncategorized") — it must not be excluded or silently merged into another category.
- Default sort: descending by category total. Largest spending category appears first.
- Empty state: when no expense transactions exist in the period, display an empty state message — do not render a breakdown with zero-value entries for every category.
- PRD Open Question 3 (visual format: pie/donut, ranked list, or combination) must be confirmed before building the visualization component. If unconfirmed, implement a ranked list with percentage bars and flag.
- PRD Open Question 6 (drill-down required or terminal view) must be confirmed before wiring the category row tap action. If drill-down is confirmed, the tap handler belongs to Instruction 5 — this instruction renders the row and exposes a tap callback; Instruction 5 implements the navigation.
- If a charting library is required by the confirmed format, confirm whether one is already present in the codebase before introducing a new dependency.
- Recommended execution order: run after Instructions 1 and 2. If drill-down is confirmed, run before Instruction 5.

**Expected Output**

- A category breakdown screen displaying each category with: name, total spending amount, and percentage share of total expenses.
- Uncategorized entry rendered as a distinct row with its total and percentage.
- Default sort: descending by amount.
- Empty state when no expense transactions exist in the period.
- Tap callback exposed on each row for Instruction 5 to wire if drill-down is confirmed.

**Deliverables**

- Category breakdown screen component file
- Percentage share computation
- Uncategorized entry rendering
- Empty state markup
- Tap callback interface for drill-down (if confirmed)
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the `queryCategoryBreakdown` function signature and return shape before this instruction calls it.
- Instruction 2 must define the shared period state before this instruction subscribes to it.
- PRD Open Question 3 (visual format) must be confirmed before the visualization component is built.
- PRD Open Question 6 (drill-down) must be confirmed before the tap callback is wired.

**Open Questions**

- PRD Open Question 3: What visual format is used — pie/donut chart, ranked list with percentage bars, or a combination?
- PRD Open Question 6: Is drill-down from a category entry to the underlying transaction list required?

---

## Instruction 5: Category Drill-Down

**Goal**
Implement the navigation from a category breakdown entry to the filtered transaction list showing the individual transactions that compose that category's total for the selected period.

**Scope**
In scope: the tap handler on the category breakdown row that navigates to a filtered transaction list view, the filter parameters passed to the list (category identifier and date range from the selected period), and the back-navigation return to the breakdown. Out of scope: the category breakdown view itself (Instruction 4), the transaction list rendering (Transaction History PRD), and the filter logic (Search, Filter & Sort PRD).

**Inputs**

- Full codebase
- PRD Section 5 (Story 40 fifth criterion: selecting a category entry navigates to the transactions making up that category's total for the period)

**Constraints**

- This instruction is conditional on PRD Open Question 6 confirming drill-down is required. If unconfirmed, implement and flag — the acceptance criteria include it as inferred and removal later is lower risk than omission.
- Pass the category identifier and the selected period's start and end dates as filter parameters to the transaction list — do not re-query in the list view independently.
- The uncategorized entry must also support drill-down, passing a null category identifier as the filter — the list must show only transactions with no category assigned within the period.
- Back-navigation from the drill-down list must return the user to the category breakdown at the same scroll position and period — do not reset the breakdown view state.
- Use the navigation pattern already established in the codebase. Do not introduce a new routing library.
- Cross-reference Search, Filter & Sort PRD Instruction 4 for the filter interface used to scope the transaction list by category and date range.
- Recommended execution order: run after Instruction 4 defines the tap callback interface on the breakdown row.

**Expected Output**

- A tap handler on each category row (and the uncategorized row) that navigates to the transaction list filtered to that category and the selected period.
- The drill-down list shows only the transactions composing that category's total — no out-of-scope transactions.
- Back-navigation returns to the category breakdown without resetting period or scroll position.

**Deliverables**

- Tap handler wired to Instruction 4's row tap callback
- Navigation call with category and date range filter parameters
- Back-navigation return behavior
- List of all files added or modified

**Preconditions**

- PRD Open Question 6 (drill-down required) must be confirmed or assumed confirmed with a flag.
- Instruction 4 must expose the tap callback interface before this instruction wires to it.
- Confirm the transaction list's filter parameter interface (from Search, Filter & Sort PRD Instruction 4) before passing filter parameters to it.

---

## Instruction 6: Spending Trends View

**Goal**
Implement the trend chart that displays total spending across consecutive time periods at the selected granularity, with zero-value periods rendered as explicit data points, direction of change visually apparent, and exact values displayed on data point selection.

**Scope**
In scope: the trend chart screen, the invocation of the trend series query from Instruction 1, the granularity selector, the chart rendering (at the confirmed visual format), the zero-period data point representation, the interactive value display on data point selection, and the insufficient-data state (fewer than two periods). Out of scope: the period selector (Instruction 2), the aggregation query (Instruction 1), the category breakdown (Instruction 4), income overlay if not confirmed, and cache invalidation (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 41 acceptance criteria), Section 6b (zero-spending periods as explicit zero, not omitted; transaction stored date as grouping key), Section 6c (charting library unspecified)

**Constraints**

- PRD Open Question 4 (default granularity and available options) must be confirmed before the granularity selector options are built. If unconfirmed, implement monthly as default with weekly as the alternative and flag.
- PRD Open Question 5 (expense-only vs. income overlay) must be confirmed before deciding whether the chart has one or two data series. If unconfirmed, implement expense-only and flag.
- Zero-spending periods within the displayed range must appear as explicit zero data points — not omitted. This is handled by the query's zero-fill logic in Instruction 1; confirm the chart component renders them rather than skipping nulls.
- When fewer than two periods of data exist, display an informational message explaining that more data is needed — do not display a single-point chart.
- Interactive value display: when the user selects a data point, show the exact spending total for that period as a label or tooltip — not only its chart position.
- Direction of change (increase vs. decrease vs. flat) must be visually apparent from the chart without requiring the user to compare exact values.
- PRD Open Question 3 for the trend view (line chart, bar chart, or combination) — cross-reference the acceptance criteria which imply bars or line. Confirm the format with the author. If unconfirmed, implement a bar chart and flag.
- Confirm whether a charting library is already present in the codebase before introducing a new dependency.
- Recommended execution order: run after Instructions 1 and 2.

**Expected Output**

- A trend chart screen displaying spending per period at the selected granularity.
- Granularity selector with the confirmed options.
- Zero-period data points rendered explicitly.
- Insufficient-data state (< 2 periods) shown as an informational message.
- Interactive data point selection displays the exact spending total.
- Direction of change visually distinguishable from the chart.

**Deliverables**

- Spending trends screen component file
- Granularity selector integration
- Chart rendering with zero-value data point support
- Insufficient-data state display
- Interactive tooltip or value label on data point selection
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the `queryTrendSeries` function signature and its zero-filled return shape before this instruction calls it.
- Instruction 2 must define the shared period state before this instruction subscribes to it.
- PRD Open Question 4 (granularity options) must be confirmed or defaulted.
- PRD Open Question 5 (expense-only vs. income overlay) must be confirmed or defaulted.
- Confirm charting library availability in the codebase.

**Open Questions**

- PRD Open Question 4: What is the default granularity and what options are available?
- PRD Open Question 5: Does the trend chart show expenses only, or overlay income as a second series?

---

## Instruction 7: Insights Cache Invalidation

**Goal**
Implement the cache invalidation trigger that clears pre-computed summary, breakdown, and trend caches when any transaction within the relevant date range is added, edited, or deleted, so that the three insight views reflect current transaction data after mutations.

**Scope**
In scope: the invalidation trigger wired to all transaction mutation events (create, edit, delete, bulk delete), the date-range check that determines which cache entries (if any) are affected by the mutated transaction's date, and the re-fetch invocation that causes the insight views to update. Out of scope: the aggregation queries (Instruction 1), the view components (Instructions 3, 4, 6), and the transaction mutation handlers themselves (Transaction Entry and Management PRDs).

**Inputs**

- Full codebase
- PRD Section 6a (trend caches acceptable for performance but must be invalidated when a transaction within the trend's date range is added, edited, or deleted; net figure must always reflect live transaction data)

**Constraints**

- Invalidation must fire on every transaction mutation: create, edit, delete, and bulk delete. Audit all mutation paths and confirm each triggers invalidation.
- Invalidation must be scoped to the relevant date range — a transaction mutated outside the currently selected period does not need to invalidate the cached result for a different period. If scoped invalidation is complex, full cache invalidation (clearing all insight caches) is an acceptable fallback — document the choice.
- After invalidation, the three insight views must re-invoke their queries automatically — do not require the user to navigate away and return.
- Do not re-implement the mutation event hooks — subscribe to the same events already established in the codebase (cross-reference Transaction Entry PRD and Transaction Management PRD mutation hooks).
- If no pre-computed cache is in use (all queries run live on every render), this instruction reduces to confirming that the view components re-query on mutation events — document this finding and confirm no additional work is needed.
- Recommended execution order: run after Instructions 3, 4, and 6 establish the view components and their query invocation points.

**Expected Output**

- An invalidation trigger subscribed to all transaction mutation events.
- On mutation: the affected insight caches (or all caches as a fallback) are cleared.
- After invalidation: the three insight view components re-fetch their data and update.
- Audit list of mutation paths and confirmation that each is covered.

**Deliverables**

- Cache invalidation trigger implementation
- Audit list of transaction mutation paths and their invalidation coverage
- Re-fetch trigger wiring in each insight view component
- List of all files added or modified

**Preconditions**

- Confirm whether a pre-computed cache is in use for insights queries. If all queries run live, document this and confirm Instruction 7 reduces to a re-fetch trigger only.
- Cross-reference Transaction Entry PRD and Transaction Management PRD mutation event hooks before subscribing to them.
- Instructions 3, 4, and 6 must expose their re-fetch interfaces before this instruction triggers them.
