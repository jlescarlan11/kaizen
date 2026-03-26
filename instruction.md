1. Category Data Model & Schema — Define and implement the category entity schema and the nullable category field on the transaction record, establishing the data foundation for all other instructions.
2. Default System Categories Seed — Implement the seed dataset of default system categories, distinguishing them from user-created categories in the data model.
3. Category Selector Component — Implement the shared category selector UI component used by both transaction entry and recategorization flows, sourced from the single category list.
4. Category Assignment on Transaction Entry — Implement the category field in the transaction entry and edit forms, wiring it to the shared category selector and storing a null value when no category is selected.
5. Category Display in List and Detail Views — Implement the category field display on the transaction list row and detail view, reading from the stored category reference.
6. Change Transaction Category — Implement the recategorization action on an existing transaction, presenting the category selector and updating the stored category reference on confirm.
7. Uncategorized Transaction Highlighting — Implement the visual indicator on transaction list rows with a null category, and the tap-to-categorize shortcut if confirmed.
8. Merge Categories — Implement the merge operation that reassigns all transactions from a source category to a target category and removes the source, atomically and with a pre-confirmation count.
9. Post-Merge Referential Integrity Enforcement — Implement the data-layer constraint that ensures no transaction record retains a reference to a deleted or merged source category after the merge completes.

---

## Instruction 1: Category Data Model & Schema

**Goal**
Define and implement the category entity schema and the nullable category reference field on the transaction record, establishing the authoritative data model that all other category-related instructions depend on.

**Scope**
In scope: the category entity (at minimum: unique identifier, display name, and a flag distinguishing system categories from user-created ones), the nullable category field on the transaction record, and a flat reference table documenting all field names and types. Out of scope: the default seed dataset (Instruction 2), the category selector UI (Instruction 3), all transaction form changes (Instruction 4), display logic (Instruction 5), recategorization (Instruction 6), highlighting (Instruction 7), and merge logic (Instructions 8 and 9).

**Inputs**

- Full codebase
- PRD Section 6b (each transaction must have a nullable category field; null is the canonical uncategorized state — not a blank string or reserved entry; category list stored as its own entity with at minimum a unique identifier and display name; system categories distinguishable from user-created ones in the data model), Section 6a (transaction category must reference a valid category list entry)

**Constraints**

- The category field on the transaction record must be nullable. A null value is the canonical representation of an uncategorized transaction. Do not use a blank string, a zero-value integer, or a reserved "None" category entry as a substitute.
- The category entity must have at minimum: a unique identifier and a display name. Include a boolean or enum field distinguishing system categories from user-created categories — even if both appear identical to the user.
- Do not fabricate field names, table names, or column types — use naming conventions verifiably present in the codebase.
- Amount precision rules from the Transaction Entry PRD apply to the transaction record; do not regress them when adding the category field.
- Do not implement any UI, seed data, or business logic here — this instruction produces the schema and a reference document only.
- All other instructions that read or write category fields must treat this instruction's output as the authoritative field name reference.
- Recommended execution order: run before all other instructions in this set.

**Expected Output**

- The category entity schema: field names, data types, nullability, and constraints (e.g., display name must be unique, identifier must be unique).
- The updated transaction record schema showing the nullable category reference field added.
- A flat reference table: entity name, field name, type, required/optional, and a one-line description.
- If modifying an existing schema, a before/after comparison and a migration plan.

**Deliverables**

- New or updated category entity schema file (ORM model, migration, type definition, or equivalent)
- Updated transaction record schema showing the nullable category field
- Migration file or script if the codebase uses a migration system
- Flat reference table
- List of all files added or modified

**Preconditions**

- PRD Open Question 3 (single category per transaction vs. multi-category) must be confirmed before the schema is written. A single nullable foreign key and a many-to-many join table are fundamentally different structures. If unconfirmed, implement a single nullable foreign key per PRD Section 6a ("at most one category") and flag the assumption.
- Confirm whether a category entity or table already exists in the codebase before creating a new one.
- Confirm the codebase's ORM, database type, or data modeling convention before writing schema syntax.

**Open Questions**

- PRD Open Question 1: Are default system categories provided? If yes, the schema must include the system/user-created distinction flag. If no, that field may be omitted — but the PRD Section 6b implies it is required regardless. Confirm before omitting.
- PRD Open Question 3: Single category per transaction or multi-category? This is the most consequential schema decision in this instruction.

---

## Instruction 2: Default System Categories Seed

**Goal**
Implement the seed dataset that populates the category list with a default set of system-provided categories, ensuring they are marked as system categories in the data model and are available without user action on first use.

**Scope**
In scope: the seed script or migration that inserts the default category records, the system category flag applied to each seeded record, and the idempotency guarantee (re-running the seed does not duplicate records). Out of scope: the category schema definition (Instruction 1), the category selector UI (Instruction 3), user-created category management (out of scope per PRD Section 8), and merge logic (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 19, third acceptance criterion: a default set of categories is available without requiring the user to create them), Section 6b (system categories must be distinguishable from user-created ones in the data model), Instruction 1 output (category schema field names)

**Constraints**

- Use the category schema defined in Instruction 1. Do not fabricate field names or add fields not defined there.
- Each seeded category must have the system/user-created flag set to system.
- The seed must be idempotent — running it more than once must not create duplicate category records.
- Do not hardcode category names as magic strings in application logic — they belong only in the seed dataset.
- The specific category names to seed must come from the author (PRD Open Question 1). If unconfirmed, use a placeholder list (e.g., Food, Transport, Utilities, Income, Other) marked explicitly as provisional in a code comment.
- Recommended execution order: run after Instruction 1 defines the category schema.

**Expected Output**

- A seed script or migration that inserts the default system category records with the system flag set.
- Idempotency logic (e.g., insert-if-not-exists keyed on display name or a stable identifier).
- The provisional or confirmed category name list used, with a flag if provisional.

**Deliverables**

- Seed script or migration file
- List of seeded category records with field values
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the category schema before this instruction writes seed records against it.
- PRD Open Question 1 (are default categories provided, and what are they) must be confirmed or provisionally assumed. If the author confirms no default categories, this entire instruction is void.
- Confirm the codebase's seeding mechanism (migration, fixture file, setup script, or equivalent) before writing the seed.

**Open Questions**

- PRD Open Question 1: Are default system categories provided? If yes, what are the category names in the default set? Without the confirmed list, the seed content is provisional.

---

## Instruction 3: Category Selector Component

**Goal**
Implement the shared category selector UI component that presents the full category list as selectable options, used by both transaction entry and recategorization flows, sourced from the single category list data store.

**Scope**
In scope: the category selector component, the data fetch that retrieves the current category list, the single-select behavior (one category at a time), and the no-selection/null state (user can leave the selector unset). Out of scope: the transaction entry form integration (Instruction 4), the recategorization flow integration (Instruction 6), the category schema (Instruction 1), and any create/rename/delete operations on categories (out of scope per PRD Section 8).

**Inputs**

- Full codebase
- PRD Section 5 (Story 19 first criterion: one category selectable from an available list; Story 20 first criterion: category selector shows all available categories), Section 6a (one category per transaction), Section 6c (Stories 19 and 20 must reference the same category list data source)

**Constraints**

- The selector must present the category list from the single authoritative data source — do not maintain a local copy or hardcode category names.
- The selector must support a null/unset state — the user must be able to open the selector and close it without selecting a category, leaving the transaction uncategorized.
- Single-select only, per PRD Section 6a. Do not implement multi-select unless PRD Open Question 3 is resolved in favor of multi-category.
- Do not implement category creation, renaming, or deletion within this component — it is a read-only selector.
- Use the selection UI pattern (dropdown, bottom sheet, modal list, or equivalent) already established in the codebase. Do not introduce a new overlay pattern.
- This component is shared — do not embed form-specific logic (e.g., validation error display) inside it. Keep it generic so both Instruction 4 and Instruction 6 can use it without modification.
- Recommended execution order: run after Instruction 1 confirms field names and after Instruction 2 confirms that the category list will be populated. Run before Instructions 4 and 6.

**Expected Output**

- A category selector component that fetches and displays the current category list.
- Single-select behavior: selecting a category emits the selected category's identifier to the parent via a callback or controlled prop.
- Null/unset state: the selector can be dismissed without a selection, emitting null.
- Consistent display across both transaction entry and recategorization contexts without context-specific logic inside the component.

**Deliverables**

- Category selector component file
- Data fetch call and its location in the component lifecycle
- Callback/prop interface documented for use by Instructions 4 and 6
- List of all files added or modified

**Preconditions**

- Instruction 1 must define the category entity's identifier and display name fields before the selector can render category records.
- Confirm whether a selector or picker component for similar use cases already exists in the codebase before building a new one.
- PRD Open Question 3 (single vs. multi-category) must be confirmed or defaulted to single before implementing the selection behavior.

---

## Instruction 4: Category Assignment on Transaction Entry

**Goal**
Implement the category field in the transaction entry and edit forms, wiring it to the shared category selector component, storing null when no category is selected, and ensuring the selected category is persisted with the transaction record on save.

**Scope**
In scope: the category field in the transaction entry form and the edit form, the integration of the category selector component (Instruction 3) into both forms, the null-on-no-selection behavior, and the category value written to the transaction record on save. Out of scope: the category selector component itself (Instruction 3), the category schema (Instruction 1), display in the list and detail views (Instruction 5), and recategorization as a standalone action (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 5 (Story 19 first and second criteria: category assignable during entry; stored and displayed after save; fourth criterion: null stored when no category selected — not auto-assigned), Section 6a (category assignment must not auto-assign silently), Instruction 1 output (category field name on transaction record), Instruction 3 output (selector component interface)

**Constraints**

- Wire the category selector component from Instruction 3 into the entry and edit forms without duplicating selector logic.
- When the user saves without selecting a category, write null to the category field — do not assign a default category silently.
- When the user selects a category and saves, write the selected category's identifier to the transaction record.
- Do not modify the transaction schema here — the nullable category field must already exist from Instruction 1.
- Do not modify the category selector component — consume its callback interface as defined in Instruction 3.
- The edit form must pre-populate the category field with the transaction's currently stored category value (including null if uncategorized) when opened.
- Recommended execution order: run after Instructions 1 and 3. Cross-reference Transaction Entry PRD Instruction 1 for the base form patterns.

**Expected Output**

- The transaction entry form includes a category field that opens the shared category selector.
- On save with a category selected: the selected category identifier is written to the transaction record.
- On save without a category selected: null is written to the category field — not a default value.
- The transaction edit form pre-populates the category field with the existing stored value.
- Before/after comparison of the entry and edit form components.

**Deliverables**

- Updated transaction entry form component file
- Updated transaction edit form component file
- Category field integration points documented
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category field name on the transaction record before this instruction writes to it.
- Instruction 3 must define the selector component's callback interface before this instruction wires it in.
- Confirm that the transaction entry and edit forms are identifiable in the codebase (cross-reference Transaction Entry PRD and Transaction Management PRD).

---

## Instruction 5: Category Display in List and Detail Views

**Goal**
Implement the display of a transaction's assigned category in the transaction list row and the transaction detail view, reading from the stored category reference and rendering nothing (or a neutral placeholder) when the category is null.

**Scope**
In scope: the category field rendered on the transaction list row and the transaction detail view, the null/uncategorized display state (neutral placeholder, not a highlight — that belongs to Instruction 7), and the category name resolved from the stored identifier. Out of scope: uncategorized highlighting (Instruction 7), the category selector (Instruction 3), and category assignment logic (Instructions 4 and 6).

**Inputs**

- Full codebase
- PRD Section 5 (Story 19 second criterion: category stored and displayed in list and detail views), Section 6c (category state must be included in the list query result without a secondary fetch per transaction), Instruction 1 output (category field names)

**Constraints**

- Resolve the category name from the stored identifier at the data fetch level — do not issue a per-row secondary fetch to look up the category name. Confirm that the list query joins or includes category data.
- When the category field is null, display a neutral placeholder (e.g., a dash or "—") rather than leaving the field blank or triggering an error. Do not apply the uncategorized highlight here — that belongs to Instruction 7.
- Do not modify the category selector or assignment logic — this instruction is read-only display.
- Use the field display pattern already established in the detail view (cross-reference Transaction History PRD Instruction 5) for consistency.
- Recommended execution order: run after Instruction 1 confirms field names and after the list and detail view components are identifiable.

**Expected Output**

- The transaction list row renders the category name (or a neutral placeholder if null) for each transaction.
- The transaction detail view renders the category name (or a neutral placeholder if null) as a labeled field.
- The category name is resolved from the join or include in the list query, not from a secondary fetch.
- Before/after comparison of the list row and detail view components.

**Deliverables**

- Updated transaction list row component file
- Updated transaction detail view component file
- Documentation of where in the query the category join or include is added
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category identifier and display name fields before this instruction resolves category names in the view.
- Confirm that the transaction list query can be extended to include category data without a per-row secondary fetch (e.g., via a join, include, or denormalized field).

---

## Instruction 6: Change Transaction Category

**Goal**
Implement the recategorization action on an existing transaction that presents the shared category selector, updates the stored category reference on confirm, and leaves the transaction unchanged on dismiss or no-change selection.

**Scope**
In scope: the recategorization action trigger (from the transaction list row or detail view), the category selector presentation pre-populated with the current category value, the category update on confirm, and the no-op paths (dismiss without selection, same category reselected). Out of scope: the category selector component itself (Instruction 3), category display in views (Instruction 5), uncategorized highlighting (Instruction 7), and derived value recalculation (no balance impact from category change).

**Inputs**

- Full codebase
- PRD Section 5 (Story 20 acceptance criteria), Section 6a (category list is the single source of truth; no orphaned references), Instruction 1 output (category field name), Instruction 3 output (selector component interface)

**Constraints**

- Use the shared category selector component from Instruction 3 — do not build a parallel selector.
- Pre-populate the selector with the transaction's currently stored category value (including null if uncategorized) when it opens.
- On confirm with a different category: update the transaction's category field to the new identifier.
- On confirm with the same category already assigned: no write operation; transaction unchanged.
- On dismiss without selection: no write operation; transaction unchanged.
- The update must use the existing transaction record's identifier — do not delete and recreate.
- After the category update, any view displaying the transaction's category (list row, detail view) must reflect the new value.
- Recommended execution order: run after Instructions 1 and 3. Cross-reference Transaction Management PRD Instruction 1 for in-place update patterns.

**Expected Output**

- A recategorization action trigger on the transaction list row or detail view (button, menu item, or equivalent).
- The shared category selector opens pre-populated with the current category.
- On confirm with a new category: the transaction record's category field is updated in place.
- On confirm with the same category: no write.
- On dismiss: no write.
- The list and detail views reflect the updated category after confirmation.

**Deliverables**

- Recategorization action trigger in the list row or detail view
- Category update call showing in-place write by transaction identifier
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category field name on the transaction record.
- Instruction 3 must define the selector component's interface, including how the current value is passed in as a pre-selected option.
- Confirm where the recategorization action is accessible — list row only, detail view only, or both.

---

## Instruction 7: Uncategorized Transaction Highlighting

**Goal**
Implement the visual indicator on transaction list rows with a null category value, making them immediately distinguishable from categorized transactions, and implement the tap-to-categorize shortcut if confirmed by the author.

**Scope**
In scope: the visual highlight applied to list rows where the category field is null, the removal of the highlight when a category is assigned, the behavior when a filtered or searched result set contains no uncategorized transactions, and the tap-to-categorize shortcut (if confirmed). Out of scope: the category assignment logic itself (Instruction 4 and 6), the category selector (Instruction 3), category display for categorized transactions (Instruction 5), and any modification to the transaction record triggered by the highlight (the highlight is purely a view concern).

**Inputs**

- Full codebase
- PRD Section 5 (Story 21 acceptance criteria), Section 6a (uncategorized highlighting must not alter the transaction record or auto-assign a category), Section 6c (category state included in list query result without secondary fetch)

**Constraints**

- The highlight is a read-only view concern — it must not write to the transaction record or assign any category value.
- Apply the highlight only when the transaction's category field is null. Do not apply it to transactions with any assigned category, including the case where the category was just assigned in the current session.
- When a category is assigned to a previously uncategorized transaction, the highlight must be removed from that row without requiring a full list reload if the codebase supports optimistic or reactive updates.
- In a filtered or searched result set that contains only categorized transactions, no highlights are displayed — this follows naturally if the highlight is driven purely by the category null check.
- Use the codebase's existing visual emphasis pattern (border, background tint, icon badge, or equivalent) for the highlight treatment. Do not introduce a new design token.
- Do not implement the category assignment action here — if the tap-to-categorize shortcut is confirmed, it must open the shared category selector from Instruction 3 without duplicating its logic.
- Recommended execution order: run after Instructions 1 (confirms null field name), 3 (confirms selector interface for shortcut), and 5 (confirms list row component structure).

**Expected Output**

- Transaction list rows with a null category value are visually distinguished from categorized rows in a way immediately noticeable without tapping.
- The highlight is removed when the transaction's category is updated to a non-null value.
- When all visible transactions are categorized, no highlight indicators are shown.
- If the tap-to-categorize shortcut is confirmed: tapping an uncategorized row's highlight opens the shared category selector for that transaction.
- If the shortcut is not confirmed: the highlight is a non-interactive visual indicator only.

**Deliverables**

- Updated transaction list row component with null-category highlight logic
- Tap-to-categorize shortcut wiring (if confirmed), delegating to the Instruction 3 selector
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category field name and its null representation before the highlight condition is written.
- PRD Open Question 4 (does the highlight act as a tap target or only a visual indicator) must be confirmed before the shortcut is implemented. If unconfirmed, implement the visual indicator only and flag the shortcut as pending.
- Confirm the codebase's visual emphasis pattern before choosing a highlight treatment.

**Open Questions**

- PRD Open Question 4: Does tapping the highlight open category assignment directly, or is it only a visual indicator? Without this, the interactive behavior cannot be implemented.

---

## Instruction 8: Merge Categories

**Goal**
Implement the merge operation that reassigns all transactions from a source category to a target category, removes the source category from the category list, and presents a pre-confirmation count of affected transactions — executed atomically with no partial state persisted.

**Scope**
In scope: the merge UI (source and target selection), the pre-confirmation step with the affected transaction count, the atomic reassignment of all source-category transactions to the target, the removal of the source category from the category list, the self-merge block, and the cancel path. Out of scope: referential integrity enforcement at the data layer (Instruction 9), undo for merge (see Open Questions), and individual recategorization (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 5 (Story 22 acceptance criteria), Section 6a (merge must be atomic; partial merge state must not be persisted; category list is the single source of truth), Section 6c (merge interface is a distinct screen or modal separate from the transaction entry form)

**Constraints**

- The merge must be atomic: all transaction reassignments and the source category deletion must succeed or fail together. Do not commit partial state.
- The confirmation step must state the number of transactions that will be reassigned from the source to the target before any write occurs.
- Block self-merge (source equals target) before the confirmation step — display an error or informational message and do not proceed.
- On confirm: reassign all transactions referencing the source category to the target category identifier, then delete the source category record.
- On cancel: no writes; both source and target categories remain unchanged.
- The target category's name and its existing transactions must be unchanged after the merge — only its transaction count grows.
- Do not implement referential integrity cleanup here — that surface belongs to Instruction 9. This instruction's responsibility ends when the atomic write completes; Instruction 9 verifies and enforces that no orphaned references remain.
- PRD Open Question 5 (merge more than two categories at once): if unconfirmed, implement one source to one target only and flag the assumption.
- Recommended execution order: run after Instructions 1 and 9's interface is defined, since the merge write must complete before Instruction 9's integrity check fires.

**Expected Output**

- A merge interface (screen or modal) where the user selects a source category and a target category.
- Self-merge blocked with an informational message before confirmation.
- A confirmation step displaying: source category name, target category name, and the count of transactions to be reassigned.
- On confirm: atomic write — all source transactions reassigned to target, source category deleted.
- On cancel: no writes; both categories intact.
- Post-merge: derived views (filter lists, category selectors) no longer show the source category.

**Deliverables**

- Merge interface component file (screen or modal)
- Source and target selection UI
- Pre-confirmation transaction count query
- Atomic reassignment and deletion write
- Self-merge guard
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category identifier field and the transaction category reference field before the reassignment write is implemented.
- Confirm the codebase's transaction mechanism (database transaction, batch write, or equivalent) for atomic operations before writing the merge write.
- PRD Open Question 5 (one-to-one merge vs. many-to-one) must be confirmed or defaulted to one-to-one.
- PRD Open Question 7 (undo for merge) must be confirmed before implementing — if undo is required, a pre-merge snapshot mechanism must be designed. If unconfirmed, implement without undo and flag.

**Open Questions**

- PRD Open Question 5: Can more than two categories be merged at once? If yes, the source selector must support multi-select and the reassignment loop must handle a set of sources.
- PRD Open Question 7: Is there an undo mechanism for merge? If yes, this instruction must capture a pre-merge snapshot before the atomic write, and a separate undo instruction is required.

---

## Instruction 9: Post-Merge Referential Integrity Enforcement

**Goal**
Implement the data-layer constraint or post-merge verification that ensures no transaction record retains a reference to a deleted source category after a merge completes.

**Scope**
In scope: the referential integrity check or constraint applied after the merge write, the detection of any orphaned category references on transaction records, and the remediation path if orphaned references are found. Out of scope: the merge logic itself (Instruction 8), the category schema definition (Instruction 1), and UI changes.

**Inputs**

- Full codebase
- PRD Section 6a (orphaned category references must not persist after merge or deletion), Section 6b (after a merge, no transaction record may reference the source category's identifier; referential integrity must be enforced at the data layer)

**Constraints**

- Enforcement must occur at the data layer — do not rely solely on application-level logic that could be bypassed.
- If the database supports foreign key constraints with cascade or restrict behavior, confirm whether they are applicable here. If they are, document the constraint; if not (e.g., the source category is deleted after reassignment), implement a post-write verification query.
- The post-merge verification must confirm that zero transaction records reference the deleted source category identifier. If any are found, treat this as an error state and surface it — do not silently pass.
- Do not re-implement the merge write — this instruction runs after Instruction 8's atomic write and verifies its outcome.
- Recommended execution order: run after Instruction 8 defines the merge write and the point at which the source category is deleted.

**Expected Output**

- A post-merge verification query or constraint that checks for transaction records still referencing the deleted source category identifier.
- If zero orphaned references: merge is confirmed complete.
- If orphaned references are found: an error is raised, logged, or surfaced — define the error handling path consistent with the codebase's error patterns.
- If database-level foreign key constraints are used: documentation of the constraint definition and how it prevents orphaned references at the schema level.

**Deliverables**

- Post-merge verification query or database constraint definition
- Error handling path for orphaned references if found
- Documentation of where in the merge flow the verification runs
- List of all files added or modified

**Preconditions**

- Instruction 1 must confirm the category reference field on the transaction record and the category entity's identifier field before the verification query is written.
- Instruction 8 must define the merge write completion point before this instruction's verification is wired to fire after it.
- Confirm whether the codebase's database supports and enforces foreign key constraints — this determines whether the enforcement is schema-level or application-level.
