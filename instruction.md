1. Payment Method Data Model & Schema — Define and implement the payment method entity schema and the nullable payment method field on the transaction record.
2. Default System Payment Methods Seed — Implement the seed dataset of system-provided default payment methods, distinguishing them from user-created methods in the data model.
3. Payment Method Selector Component — Implement the shared payment method selector UI component used by both transaction entry and recategorization flows, sourced from the single payment method list.
4. Payment Method Assignment on Transaction Entry — Implement the payment method field in the transaction entry and edit forms, wiring it to the shared selector and storing null when no method is selected.
5. Payment Method Display in List and Detail Views — Implement the payment method field display on the transaction list row and detail view, resolving the method name from the stored reference.
6. Custom Payment Method Creation — Implement the custom payment method creation flow with name uniqueness validation, blank-name rejection, and immediate availability in the selector after creation.
7. Payment Method Deletion — Implement the deletion flow for payment methods, including the transaction-count warning and the orphan-resolution strategy for transactions referencing the deleted method.
8. Payment Method Summary View — Implement the summary screen that aggregates total spending per payment method from live transaction data, with correct handling of unassigned transactions and zero-total methods.
9. Payment Method Summary Recalculation Trigger — Implement the trigger that causes the summary totals to update when a transaction is saved, edited, or deleted.

---

## Instruction 1: Payment Method Data Model & Schema

**Goal**
Define and implement the payment method entity schema and the nullable payment method reference field on the transaction record, establishing the authoritative data model that all other instructions in this set depend on.

**Scope**
In scope: the payment method entity (at minimum: unique identifier, display name, and a flag distinguishing system-provided from user-created methods), the nullable payment method field on the transaction record, and a flat reference table documenting all field names and types. Out of scope: the seed dataset (Instruction 2), the selector UI (Instruction 3), all transaction form changes (Instruction 4), display logic (Instruction 5), custom method creation (Instruction 6), deletion (Instruction 7), and the summary view (Instructions 8 and 9).

**Inputs**

- Full codebase
- PRD Section 6b (each transaction must support a nullable payment method field referencing a valid entry in the method list; payment method entity stores at minimum a unique identifier and display name; system methods distinguishable from user-created at the data layer; schema approach — foreign key reference vs. embedded string — must be confirmed), Section 6a (missing method must never be silently defaulted)

**Constraints**

- The payment method field on the transaction record must be nullable. A null value is the canonical representation of an unassigned method — do not use a blank string, a zero-value identifier, or a reserved "Unspecified" method record as a substitute.
- The payment method entity must have at minimum: a unique identifier and a display name. Include a boolean or enum field distinguishing system-provided from user-created methods.
- Do not fabricate field names, table names, or column types — use naming conventions verifiably present in the codebase.
- PRD Open Question 7 (single method per transaction vs. split payment) must be confirmed before the schema is written. A single nullable foreign key and a split-payment join table are structurally incompatible. If unconfirmed, implement a single nullable foreign key and flag the assumption.
- Do not implement any UI, seed data, or business logic here — this instruction produces the schema and a reference document only.
- All other instructions that read or write payment method fields must treat this instruction's output as the authoritative field name reference.
- Recommended execution order: run before all other instructions in this set. Cross-reference Transaction Categories PRD Instruction 1 for the established schema convention in this codebase.

**Expected Output**

- The payment method entity schema: field names, data types, nullability, and constraints (e.g., display name must be unique per user, identifier must be globally unique).
- The updated transaction record schema showing the nullable payment method reference field added.
- A flat reference table: entity name, field name, type, required/optional, and a one-line description.
- If modifying an existing schema, a before/after comparison and a migration plan.

**Deliverables**

- New or updated payment method entity schema file (ORM model, migration, type definition, or equivalent)
- Updated transaction record schema showing the nullable payment method field
- Migration file or script if the codebase uses a migration system
- Flat reference table
- List of all files added or modified

**Preconditions**

- PRD Open Question 7 (single method vs. split payment) must be confirmed or defaulted before the transaction field is defined.
- Confirm the schema approach (foreign key reference vs. embedded string) with the author — PRD Section 6b flags this as unconfirmed.
- Confirm whether a payment method entity or table already exists in the codebase before creating a new one.
- Confirm the codebase's ORM, database type, or data modeling convention before writing schema syntax.

**Open Questions**

- PRD Open Question 7: Can a transaction reference more than one payment method? This is the most consequential schema decision in this instruction.
- PRD Section 6b: Is the payment method stored as a foreign key reference to a method entity, or as an embedded string on the transaction record? These have different integrity and migration implications.

---

## Instruction 2: Default System Payment Methods Seed

**Goal**
Implement the seed dataset that populates the payment method list with a default set of system-provided methods, marking each as system-provided in the data model and ensuring the seed is idempotent.

**Scope**
In scope: the seed script or migration that inserts the default payment method records, the system-provided flag applied to each seeded record, and the idempotency guarantee. Out of scope: the payment method schema definition (Instruction 1), the selector UI (Instruction 3), and user-created method management (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 5 (Story 23: method available from the available list; Story 24: custom method appears alongside system-provided methods), Section 6b (system methods distinguishable from user-created at the data layer), Instruction 1 output (payment method schema field names)

**Constraints**

- Use the payment method schema defined in Instruction 1. Do not fabricate field names or add fields not defined there.
- Each seeded method must have the system-provided flag set.
- The seed must be idempotent — running it more than once must not create duplicate records.
- Do not hardcode method names as magic strings in application logic — they belong only in the seed dataset.
- The specific method names to seed must be confirmed with the author (PRD Open Question 2). If unconfirmed, use a placeholder list (e.g., Cash, Credit Card, Debit Card, Bank Transfer) marked explicitly as provisional in a code comment.
- Recommended execution order: run after Instruction 1 defines the payment method schema.

**Expected Output**

- A seed script or migration inserting the confirmed (or provisional) default payment method records with the system-provided flag set.
- Idempotency logic (e.g., insert-if-not-exists keyed on display name or a stable identifier).
- The provisional or confirmed method name list, with a flag if provisional.

**Deliverables**

- Seed script or migration file
- List of seeded payment method records with field values
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the payment method schema before this instruction writes seed records against it.
- PRD Open Question 2 (are system defaults provided, and what are they) must be confirmed or provisionally assumed. If the author confirms no system defaults, this entire instruction is void.
- Confirm the codebase's seeding mechanism before writing the seed.

**Open Questions**

- PRD Open Question 2: Are system-provided default methods included, and what are their names? Without the confirmed list, the seed content is provisional.

---

## Instruction 3: Payment Method Selector Component

**Goal**
Implement the shared payment method selector UI component that presents the full method list as selectable options, supports a null/unset state, and is sourced from the single payment method data store for use by both transaction entry and custom method management flows.

**Scope**
In scope: the selector component, the data fetch retrieving the current method list, single-select behavior, and the null/unset state. Out of scope: the transaction entry form integration (Instruction 4), custom method creation UI (Instruction 6), the payment method schema (Instruction 1), and method deletion (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 5 (Story 23 first criterion: one method selectable from the available list; Story 24 fourth criterion: custom methods appear alongside system methods without visual distinction suggesting secondary status), Section 6a (missing method never silently defaulted), Section 6c (Stories 23 and 24 must reference the same data source)

**Constraints**

- The selector must present the method list from the single authoritative data source — do not maintain a local copy or hardcode method names.
- Support a null/unset state — the user must be able to open and dismiss the selector without selecting a method, leaving the transaction's method field null.
- Single-select only, unless PRD Open Question 7 resolves to split payment — if so, halt and wait for schema confirmation from Instruction 1.
- System-provided and user-created methods must appear in the same list without visual distinction that suggests the user-created methods are secondary, per Story 24 fourth criterion.
- Do not implement method creation, renaming, or deletion within this component — it is a read-only selector.
- Keep the component generic — do not embed form-specific validation error display inside it. Both Instruction 4 and Instruction 6's flows must be able to consume it without modification.
- Use the selection UI pattern already established in the codebase. Cross-reference Transaction Categories PRD Instruction 3 for the established selector pattern.
- Recommended execution order: run after Instructions 1 and 2; run before Instructions 4 and 6.

**Expected Output**

- A selector component that fetches and renders the current payment method list.
- Single-select behavior: selecting a method emits the selected method's identifier to the parent via callback or controlled prop.
- Null/unset state: the selector can be dismissed without a selection, emitting null.
- System and user-created methods rendered in the same list without secondary visual treatment on either.

**Deliverables**

- Payment method selector component file
- Data fetch call and its lifecycle location
- Callback/prop interface documented for use by Instructions 4 and 6
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the payment method entity's identifier and display name fields before the selector renders method records.
- Confirm whether a selector component for a similar use case already exists in the codebase before building a new one.
- Instruction 2 must be complete or the method list must be confirmed as populated before integration testing of the selector.

---

## Instruction 4: Payment Method Assignment on Transaction Entry

**Goal**
Implement the payment method field in the transaction entry and edit forms, wiring it to the shared selector component, storing null when no method is selected, and persisting the selected method identifier with the transaction record on save.

**Scope**
In scope: the payment method field in the transaction entry form and the edit form, the selector integration, the null-on-no-selection behavior, and the method identifier written to the transaction record on save. Out of scope: the selector component itself (Instruction 3), display in list and detail views (Instruction 5), and standalone recategorization-style method change (not a named feature in this PRD — method change is handled via the edit form).

**Inputs**

- Full codebase
- PRD Section 5 (Story 23 first, second, and third criteria: method assignable during entry; stored after save; null saved if no selection — not silently defaulted), Section 6a (assignment optional unless product owner designates required), Instruction 1 output (payment method field name on transaction record), Instruction 3 output (selector component interface)

**Constraints**

- Wire the selector component from Instruction 3 into the entry and edit forms without duplicating selector logic.
- When the user saves without selecting a method, write null to the payment method field — do not assign a default method silently.
- When the user selects a method and saves, write the selected method's identifier to the transaction record.
- Do not modify the transaction schema — the nullable payment method field must already exist from Instruction 1.
- The edit form must pre-populate the payment method field with the transaction's currently stored method value (including null) when opened.
- PRD Open Question 1 (required vs. optional) must be confirmed before deciding whether to enforce selection. If unconfirmed, treat as optional and flag.
- Recommended execution order: run after Instructions 1 and 3. Cross-reference Transaction Entry PRD Instruction 1 and Transaction Categories PRD Instruction 4 for established form patterns.

**Expected Output**

- The transaction entry form includes a payment method field that opens the shared selector.
- On save with a method selected: the method identifier is written to the transaction record.
- On save without a method selected: null is written — not a default value.
- The transaction edit form pre-populates the payment method field with the currently stored value.
- Before/after comparison of the entry and edit form components.

**Deliverables**

- Updated transaction entry form component file
- Updated transaction edit form component file
- Payment method field integration points documented
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the payment method field name on the transaction record.
- Instruction 3 must define the selector's callback interface before this instruction wires it in.
- PRD Open Question 1 (required or optional) must be confirmed or defaulted to optional with a flag.

**Open Questions**

- PRD Open Question 1: Is payment method a required field? If required, the entry form must enforce selection and the null path becomes an error state.

---

## Instruction 5: Payment Method Display in List and Detail Views

**Goal**
Implement the display of a transaction's assigned payment method on the transaction list row and the transaction detail view, resolving the method name from the stored reference and rendering a neutral placeholder when the method is null.

**Scope**
In scope: the payment method field rendered on the transaction list row and the transaction detail view, the null/unspecified display state, and the method name resolved from the stored identifier at the query level. Out of scope: the selector (Instruction 3), assignment logic (Instruction 4), custom method creation (Instruction 6), and the summary view (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 23 second criterion: method stored and displayed in list and detail views; fourth criterion: method visible on list row without opening detail view), Section 6c (category state must be included in the list query result without secondary fetch), Instruction 1 output (payment method field names)

**Constraints**

- Resolve the method name from the stored identifier at the data fetch level — do not issue a per-row secondary fetch. Confirm that the list query joins or includes payment method data.
- When the payment method field is null, display a neutral placeholder (e.g., "—" or "Unspecified") rather than leaving the field blank or triggering an error.
- The method must be visible on the list row without requiring the user to open the detail view, per Story 23 fourth criterion.
- Do not modify the selector or assignment logic — this instruction is read-only display.
- Use the field display pattern established in the detail view for category (Transaction Categories PRD Instruction 5) for consistency.
- Recommended execution order: run after Instruction 1 confirms field names and after the list and detail view components are identifiable.

**Expected Output**

- The transaction list row renders the payment method name (or neutral placeholder if null) for each transaction.
- The transaction detail view renders the payment method as a labeled field (or neutral placeholder if null).
- The method name is resolved from the query join or include, not from a secondary fetch.
- Before/after comparison of the list row and detail view components.

**Deliverables**

- Updated transaction list row component file
- Updated transaction detail view component file
- Documentation of where in the query the payment method join or include is added
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the payment method identifier and display name fields before this instruction resolves method names in the view.
- Confirm that the transaction list query supports including payment method data without per-row secondary fetches.

---

## Instruction 6: Custom Payment Method Creation

**Goal**
Implement the custom payment method creation flow in the payment method management interface, enforcing name uniqueness and non-blank validation, and making the new method immediately available in the payment method selector after creation.

**Scope**
In scope: the creation form within the payment method management interface, name uniqueness validation (case-insensitive), blank-name rejection, the write that adds the new method to the payment method list with the user-created flag, and the immediate availability of the new method in the selector. Out of scope: the selector component (Instruction 3), the payment method schema (Instruction 1), method deletion (Instruction 7), and the summary view (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 24 acceptance criteria), Section 6a (custom method names must be unique within a user's method list; case-insensitive duplicate detection recommended), Section 6c (management interface is separate from the transaction entry form)

**Constraints**

- Name uniqueness must be validated case-insensitively — "Cash" and "cash" must be treated as duplicates. If the codebase convention differs, confirm before implementing.
- A blank or whitespace-only name must be rejected with a field-level validation error before any write occurs.
- A duplicate name must be rejected with an error stating the name is already in use — do not silently alter the submitted name.
- The new method must be written with the user-created flag (not the system-provided flag).
- After a successful creation, the payment method selector (Instruction 3) must reflect the new method without requiring the user to reload the app — confirm whether the selector's data fetch is reactive or requires a manual refresh trigger.
- Do not implement renaming or deletion within this instruction — those are out of scope (renaming) or belong to Instruction 7 (deletion).
- Recommended execution order: run after Instructions 1 and 3 establish the schema and selector.

**Expected Output**

- A creation form in the payment method management interface with a name input field.
- Blank/whitespace validation: blocks submission and displays a field-level error.
- Duplicate name validation (case-insensitive): blocks submission and displays a "name already in use" error.
- On valid submission: a new payment method record written with the user-created flag and a unique identifier.
- The new method appears in the selector immediately after creation.

**Deliverables**

- Payment method creation form component (within the management interface)
- Name uniqueness validation logic (case-insensitive)
- Blank-name validation
- Write call adding the new method to the payment method list
- Selector refresh or reactivity trigger after creation
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the payment method entity's schema and the user-created flag field before the write call is implemented.
- Instruction 3 must expose a mechanism for the selector to reflect new methods after creation (reactive subscription, re-fetch trigger, or equivalent).
- Confirm the navigation path to the payment method management interface before building the creation form's location (PRD Section 6c flags this as unconfirmed).

---

## Instruction 7: Payment Method Deletion

**Goal**
Implement the deletion flow for payment methods, including a pre-deletion warning showing the count of transactions referencing the method, and the orphan-resolution strategy that ensures no transaction retains a reference to the deleted method after deletion completes.

**Scope**
In scope: the delete action trigger on a payment method, the pre-deletion warning with the affected transaction count, the orphan-resolution write (reassign to null or block deletion — see Preconditions), and the removal of the method from the list. Out of scope: method creation (Instruction 6), the selector component (Instruction 3), and the summary recalculation trigger (Instruction 9).

**Inputs**

- Full codebase
- PRD Section 5 (Story 24 fifth criterion: deletion warning showing transaction count before confirmation), Section 6a (deleting a method must not leave orphaned references; resolution strategy must be defined), Section 6b (referential integrity must be maintained after deletion)

**Constraints**

- This entire instruction is conditional on PRD Open Question 3 confirming deletion is in scope. If unconfirmed, do not implement — halt and flag.
- The deletion warning must state the number of transactions currently referencing the method before the user confirms. Do not proceed to deletion without surfacing this count.
- The orphan-resolution strategy must be confirmed with the author before implementation: options are (a) reassign affected transactions' method field to null, (b) block deletion if any transactions reference the method, or (c) require the user to bulk-reassign before deletion. Implement only the confirmed strategy.
- The deletion must not complete while any transaction still holds a reference to the method's identifier — enforce this at the write layer.
- Do not implement method renaming in this instruction — it is out of scope per PRD Section 8.
- Recommended execution order: run after Instructions 1 and 6 establish the schema and creation flow.

**Expected Output**

- A delete action trigger on each method in the payment method management interface.
- A pre-deletion query that counts transactions referencing the method.
- A warning step displaying the affected transaction count before confirmation.
- On confirm: orphan-resolution write executed (per confirmed strategy), followed by method record deletion.
- On cancel: no writes; method remains.
- After deletion: no transaction record references the deleted method's identifier.

**Deliverables**

- Delete action trigger in the payment method management interface
- Pre-deletion transaction count query
- Warning/confirmation UI component
- Orphan-resolution write and method deletion (in the confirmed strategy)
- List of all files added or modified

**Preconditions**

- PRD Open Question 3 (is deletion in scope, and what is the orphan-resolution strategy) must be confirmed before this instruction runs.
- Instruction 1 must define the payment method identifier and the transaction's method reference field before the orphan-resolution write is implemented.
- Confirm the codebase's transaction/atomic write mechanism for executing the orphan resolution and deletion together.

**Open Questions**

- PRD Open Question 3: Is deletion in scope? If yes, what is the orphan-resolution strategy — null reassignment, deletion block, or forced bulk reassignment?

---

## Instruction 8: Payment Method Summary View

**Goal**
Implement the summary screen that displays total spending per payment method, derived from live transaction data, with correct handling of income vs. expense, zero-total methods, and unassigned transactions.

**Scope**
In scope: the summary screen component, the aggregation query grouped by payment method, the expense-only vs. income-breakdown logic (per confirmed behavior), the zero-total method display decision, and the unassigned transaction grouping. Out of scope: the recalculation trigger on transaction save/edit/delete (Instruction 9), filtering the summary by date range or other criteria (see Open Questions), and per-method budgets (out of scope per PRD Section 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 25 acceptance criteria), Section 6a (summary must derive totals from live transaction data — no cached running total), Section 6b (data layer must support aggregation queries grouped by payment method), Section 6c (summary is a distinct screen or section — navigation path unspecified)

**Constraints**

- Compute totals from live transaction data on each load — do not read a stored or cached total field.
- Expense and income handling must follow the confirmed behavior from PRD Open Question 4. If unconfirmed, sum only expense transactions per method and flag income as excluded by assumption.
- Unassigned transactions (null method field) must be grouped under a distinct "Unspecified" entry or explicitly excluded — they must not silently affect any named method's total.
- Zero-total methods: display behavior must follow PRD Open Question 5. If unconfirmed, omit methods with no transactions and flag.
- Each displayed method total must be a sum of transaction amounts — do not display a blank or null where a zero or omitted row belongs.
- Do not implement the recalculation trigger for post-save/edit/delete updates — that surface belongs to Instruction 9.
- Recommended execution order: run after Instruction 1 confirms the payment method and transaction field names and after the data layer's aggregation capability is confirmed.

**Expected Output**

- A summary screen or section that loads and displays a list of payment methods with their computed spending totals.
- The aggregation query: groups transactions by payment method identifier, sums amounts for the confirmed transaction type (expense only, or both), and returns one row per method.
- Unassigned transactions surfaced as a distinct "Unspecified" entry or explicitly excluded — documented either way.
- Zero-total methods shown with a zero or omitted per the confirmed behavior.
- Each total correctly excludes transaction types not in scope (e.g., income, if expense-only is confirmed).

**Deliverables**

- Summary screen or section component file
- Aggregation query grouped by payment method
- Unassigned transaction handling logic (group or exclude)
- Zero-total method display logic
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the payment method identifier field and the transaction amount and type fields before the aggregation query is written.
- Confirm that the codebase's data layer supports grouping aggregation queries — PRD Section 6b flags this as a requirement to verify.
- PRD Open Question 4 (expense only vs. income breakdown) must be confirmed or defaulted to expense-only with a flag.
- PRD Open Question 5 (zero-total methods shown or hidden) must be confirmed or defaulted to hidden with a flag.
- PRD Open Question 6 (all-time vs. date-range scoped summary) must be confirmed before building the query. If date-range scoping is required, the query must accept a date range parameter — this significantly affects the query and UI complexity.

**Open Questions**

- PRD Open Question 4: Does the summary show only expense totals, or also income per method? This changes the aggregation filter.
- PRD Open Question 5: Are zero-total methods shown with a zero or omitted entirely?
- PRD Open Question 6: Is the summary scoped to all time, or can the user apply a date range? A date-range-capable summary is substantially more complex than an all-time aggregate.

---

## Instruction 9: Payment Method Summary Recalculation Trigger

**Goal**
Implement the trigger that causes the payment method summary totals to update when a transaction is saved, edited, or deleted, so the displayed totals remain accurate without requiring a manual refresh.

**Scope**
In scope: the lifecycle hook, focus event, or reactive subscription that causes the summary view to re-fetch or recompute its aggregation when the user returns to it after a transaction change. Out of scope: the summary aggregation query itself (Instruction 8), the transaction save/edit/delete logic (Transaction Entry and Transaction Management PRDs), and any real-time push update not implied by the PRD.

**Inputs**

- Full codebase
- PRD Section 5 (Story 25 third criterion: affected method total updates when a new transaction is saved or an existing one is edited), Section 6a (summary must derive totals from live data — not a cached running total)

**Constraints**

- The trigger must fire when the user returns to the summary screen after a transaction save, edit, or delete — at minimum, on screen focus or mount after a relevant change event.
- Do not re-implement the aggregation query — invoke the existing fetch defined in Instruction 8.
- Do not modify the transaction save, edit, or delete handlers — those surfaces belong to other PRDs.
- Use the screen lifecycle or focus event pattern already established in the codebase. Cross-reference Transaction History PRD Instruction 8 for the established recalculation trigger pattern.
- The trigger must not cause a redundant fetch on the initial mount of the summary screen — only on return after a change.
- Recommended execution order: run after Instruction 8 establishes the summary fetch pattern.

**Expected Output**

- A lifecycle hook, focus listener, or reactive subscription that re-fetches the summary aggregation when the summary screen becomes active after a transaction change.
- Confirmation that the trigger fires after save, edit, and delete operations when the user navigates to the summary screen.
- No duplicate fetch on initial entry to the screen.

**Deliverables**

- Updated summary screen component showing the re-fetch trigger
- List of all files added or modified

**Preconditions**

- Instruction 8 must define the summary data fetch before this instruction wraps or re-invokes it.
- Confirm the screen lifecycle or navigation event model in the codebase before selecting the trigger mechanism.
