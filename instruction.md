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
- Wiring in each transaction form (entry, edit, reconciliation) that passes the validation error response to the inline error component and maps errors to their fields.
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
