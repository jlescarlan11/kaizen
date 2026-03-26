1. Shared Result Pipeline — Implement the composable data pipeline that applies filter, search, and sort in sequence to a single underlying transaction dataset, ensuring all three controls operate on the same result set.
2. Transaction Search Input — Implement the search input field and the logic that narrows the result pipeline to transactions whose searchable fields match the entered query, including empty-query full restore and no-results empty state.
3. Search Match Highlighting — Implement the visual highlighting of the matched portion of each search result row.
4. Transaction Filter Controls — Implement the filter UI and the logic that narrows the result pipeline to transactions matching all selected filter criteria simultaneously, including the active-filter indicator and filter empty state.
5. Search and Filter Concurrent Composition — Implement the constraint that search and filter are independent controls whose effects are composed, so clearing one does not clear the other.
6. Transaction Sort Control — Implement the sort UI and the ordering logic that reorders the current result set by the selected criterion and direction, including the default sort label and direction toggle.
7. Sort Persistence Across Navigation — Implement the mechanism that preserves the selected sort criterion and direction when the user navigates away from and returns to the transaction list.
8. Filter Empty State — Implement the empty state displayed when an active filter or combined search-and-filter produces zero results, distinguished from the zero-transaction empty state.

---

## Instruction 1: Shared Result Pipeline

**Goal**
Implement the composable data pipeline that takes the full transaction dataset as input, applies active filter criteria, then applies an active search query, then applies the active sort order — in that sequence — and exposes the result as the single source of truth for the transaction list view.

**Scope**
In scope: the pipeline function or hook that composes filter, search, and sort into an ordered sequence; the interface by which each control reads from and writes to the pipeline; and the guarantee that all three controls operate on the same underlying dataset rather than independent copies. Out of scope: the filter UI (Instruction 4), the search input UI (Instruction 2), the sort control UI (Instruction 6), match highlighting (Instruction 3), and the transaction data fetch itself (Transaction History PRD).

**Inputs**

- Full codebase
- PRD Section 6a (filter narrows dataset; search narrows further; sort orders the result; all three composable simultaneously), Section 6c (Stories 16, 17, 18 must share a single consistent result set)

**Constraints**

- The pipeline must apply operations in this fixed order: filter → search → sort. Do not allow the order to vary based on which controls are active.
- Each stage must receive the output of the previous stage as its input — do not branch or merge independent result sets.
- The pipeline must re-execute whenever any of its three inputs (filter state, search query, sort criterion) changes.
- Clearing one control must not affect the state of the other two — the pipeline must read each control's state independently.
- Do not implement the filter logic, search logic, or sort logic here — define the pipeline's interface (what each stage receives and returns) and wire the stages together. Each stage's logic belongs to its own instruction.
- Do not modify the transaction data fetch — the pipeline consumes the fetched dataset as a read-only input.
- Recommended execution order: run before Instructions 2, 4, and 6, since all three depend on the pipeline interface.

**Expected Output**

- A pipeline function, hook, or composable that accepts the full transaction list plus the current filter state, search query, and sort criterion as inputs, and returns an ordered filtered result array.
- The pipeline interface documented: what each stage function must accept and return.
- The pipeline re-executes on any state change across any of its three inputs.
- Confirmation that clearing any one input does not reset the others.

**Deliverables**

- Pipeline function or hook file
- Interface definition for each stage (filter stage, search stage, sort stage)
- Wiring into the transaction list component as the single data source for rendered rows
- List of all files added or modified

**Preconditions**

- The transaction list component and its data source must be identifiable in the codebase (cross-reference Transaction History PRD Instruction 1) before the pipeline is wired in.
- PRD Open Question 5 (search and filter concurrent vs. mutually exclusive) must be confirmed as concurrent before this pipeline is implemented. PRD Section 6a states they are composable — treat this as the working assumption and flag it.

**Open Questions**

- PRD Open Question 5: Do search and filter operate concurrently or does activating one reset the other? This instruction assumes concurrency per Section 6a — author confirmation removes the flag.

---

## Instruction 2: Transaction Search Input

**Goal**
Implement the search input field and the search stage of the result pipeline, narrowing the displayed transaction list to records whose searchable fields contain the entered query, restoring the full list when the query is cleared, and displaying a no-results empty state when no transactions match.

**Scope**
In scope: the search input UI component, the search stage logic (field matching against the entered query), the empty-query full-restore behavior, and the no-results empty state specific to search. Out of scope: match highlighting (Instruction 3), filter controls (Instruction 4), sort control (Instruction 6), and the pipeline wiring (Instruction 1).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 1), Section 5 (Story 16 acceptance criteria), Section 6a (clearing search must not clear active filters), Section 6b (search operates against stored field values; searchable fields must be defined and consistent)

**Constraints**

- Search must operate only against the confirmed searchable fields — do not match against fields not in the confirmed list. If the list is unconfirmed, halt at Preconditions.
- When the query is empty, the search stage must pass through its input unchanged — do not filter anything.
- When the query is non-empty, display only matching transactions. No non-matching transaction may appear.
- Clearing the search input must restore the full pre-search result (respecting any active filter) without affecting filter state.
- Implement debounce if search fires on every keystroke — use the debounce utility already in the codebase, or the platform's standard input delay pattern. Confirm the trigger model with the author (PRD Open Question 4) before choosing between real-time and submit-triggered search.
- Do not implement match highlighting here — that surface belongs to Instruction 3.
- Do not modify the pipeline wiring — slot this instruction's search stage function into the interface defined by Instruction 1.
- Recommended execution order: run after Instruction 1 defines the pipeline interface.

**Expected Output**

- A search input component rendered on the transaction list screen.
- A search stage function that accepts a transaction array and a query string, and returns only transactions with at least one searchable field containing the query string (case-insensitive match unless codebase convention differs).
- Empty query behavior: search stage returns the input array unmodified.
- No-results state: when the search stage returns an empty array, a contextual empty state message is displayed (distinct from the zero-transaction empty state — cross-reference Instruction 8).
- Confirmation that clearing the input restores the filtered result set without touching filter state.

**Deliverables**

- Search input component file
- Search stage function (to be slotted into the pipeline from Instruction 1)
- No-results empty state markup (for search-specific case)
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (searchable fields) must be confirmed before the search stage logic is written. Without this, the match logic cannot be implemented against a defined field set.
- PRD Open Question 4 (real-time vs. submit-triggered search) must be confirmed before the input's change handler is implemented. If unconfirmed, implement real-time with debounce and flag the assumption.
- Instruction 1 must define the pipeline interface before this instruction's search stage function is written to match it.

**Open Questions**

- PRD Open Question 1: Which fields are included in the search index? This is the primary blocker for this instruction — the match logic cannot be written without a defined field set.
- PRD Open Question 4: Is search real-time (debounced on input change) or submit-triggered? This determines whether debounce logic is needed and the perceived responsiveness of the feature.

---

## Instruction 3: Search Match Highlighting

**Goal**
Implement the visual highlighting of the portion of each search result row that matched the search query, rendered within the list row display.

**Scope**
In scope: the highlight rendering logic applied to each matching transaction row's searchable field values, and the visual treatment (e.g., bold, background color, underline) applied to the matched substring. Out of scope: the search input and match logic (Instruction 2), the pipeline (Instruction 1), and any field outside the confirmed searchable set.

**Inputs**

- Full codebase
- PRD Section 5 (Story 16, fifth acceptance criterion: matching portion visually distinguished)

**Constraints**

- Highlight only the substring that matched the query — do not highlight the entire field value.
- Apply highlighting only when a search query is active. When the query is empty, render field values without any highlight treatment.
- Use the text highlight or emphasis pattern already established in the codebase (color token, CSS class, or component). Do not introduce a new visual style that conflicts with existing design tokens.
- Do not modify the search stage logic — read the active query from the pipeline state; do not recompute matches here.
- Do not highlight fields that are not in the confirmed searchable field set.
- Recommended execution order: run after Instruction 2 confirms the searchable fields and the active query is accessible from the pipeline state.

**Expected Output**

- A highlight utility function or component that accepts a string value and the active query, and returns the string rendered with the matched substring visually distinguished.
- The utility applied to each searchable field in the transaction list row component.
- No highlight treatment when the query is empty.

**Deliverables**

- Highlight utility function or component file
- Updated transaction list row component showing highlight integration
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (searchable fields) must be confirmed — highlighting applies only to confirmed searchable fields.
- Confirm the active query is accessible from the pipeline state or a shared context before writing the highlight component.
- Confirm the codebase's existing text emphasis or highlight pattern before choosing a visual treatment.

**Open Questions**

- PRD Section 5 Story 16 fifth criterion is marked as inferred — confirm with the author whether match highlighting is required. If not required, this entire instruction is void.

---

## Instruction 4: Transaction Filter Controls

**Goal**
Implement the filter UI and the filter stage of the result pipeline, narrowing the displayed transaction list to transactions that satisfy all selected filter criteria simultaneously, displaying an active-filter indicator when any filter is active, and showing a filter-specific empty state when no transactions match.

**Scope**
In scope: the filter control UI (panel, drawer, chips, or equivalent), the filter stage logic (intersection of all active criteria), the active-filter indicator on the list view, and the filter-specific empty state. Out of scope: the search input (Instruction 2), the sort control (Instruction 6), the pipeline wiring (Instruction 1), and the combined search-and-filter empty state (Instruction 8).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 2), Section 5 (Story 17 acceptance criteria), Section 6a (filter indicator must be visible when any filter is active; clearing filters must not clear search), Section 6b (filter dimensions must correspond to values in the transaction data model), Section 6c (category field must exist in data model before filter by category can be implemented)

**Constraints**

- Implement only filter dimensions confirmed by the author (PRD Open Question 2). Do not invent additional filter dimensions.
- Apply all active filter criteria as an intersection — a transaction must satisfy every active criterion to appear in the result.
- Clearing all filter values must restore the full pre-filter result (respecting any active search) without affecting the search query.
- The active-filter indicator must be visible on the list view whenever any filter criterion is selected — do not rely on the user remembering a filter is active.
- Do not implement the combined empty state for concurrent search and filter here — that surface belongs to Instruction 8.
- Do not modify the pipeline wiring — slot this instruction's filter stage function into the interface defined by Instruction 1.
- Do not add filter dimensions that require schema fields not confirmed as present in the transaction data model.
- Recommended execution order: run after Instruction 1 defines the pipeline interface.

**Expected Output**

- A filter control UI that presents the confirmed filter dimensions and allows single or multi-value selection per dimension.
- A filter stage function that accepts a transaction array and the current filter state, and returns only transactions matching all active criteria. When no criteria are active, the function returns the input array unmodified.
- An active-filter indicator rendered on the list view when at least one filter criterion is selected.
- A reset/clear action that deactivates all filter criteria without affecting the search query.
- No-results empty state when the filter stage returns an empty array (cross-reference Instruction 8 for the combined case).

**Deliverables**

- Filter control UI component file
- Filter stage function (to be slotted into the pipeline from Instruction 1)
- Active-filter indicator component or markup
- Clear/reset filter action
- List of all files added or modified

**Preconditions**

- PRD Open Question 2 (filter dimensions) must be confirmed before the filter UI or stage logic is implemented. Without this, the filter surface area is undefined.
- Confirm that all required filter dimension fields (e.g., category, transaction type) are present in the transaction data model before building filter logic against them. If a field is missing, flag it as a prerequisite schema addition.
- Instruction 1 must define the pipeline interface before the filter stage function is written to match it.

**Open Questions**

- PRD Open Question 2: What filter dimensions are supported — category, transaction type, date range, amount range, others? The filter UI and stage logic cannot be built without a confirmed dimension list.
- PRD Section 6c: If category is a filter dimension, the category field must exist in the transaction data model. Confirm this before implementation.

---

## Instruction 5: Search and Filter Concurrent Composition

**Goal**
Implement the constraint that search and filter are independent controls whose active states do not interfere with each other — clearing search does not reset filter state, and clearing filter does not reset search state.

**Scope**
In scope: the state isolation between the search query and the filter criteria within the pipeline, and the verification that each control's clear action affects only its own state. Out of scope: the search input logic (Instruction 2), the filter logic (Instruction 4), the pipeline sequencing (Instruction 1), and the sort control (Instruction 6).

**Inputs**

- Full codebase
- PRD Section 6a (clearing search must not clear active filters; clearing filters must not clear active search), PRD Section 5 (Story 17, fifth acceptance criterion: search and filter both active simultaneously show intersection)

**Constraints**

- Search state and filter state must be stored independently — do not share a single query object that clears both when either is reset.
- The clear action on the search input must set only the search query to empty; filter state must remain unchanged.
- The clear/reset action on the filter controls must set only the filter criteria to empty; the search query must remain unchanged.
- Do not re-implement pipeline sequencing here — only verify and enforce state isolation at the state management layer.
- This instruction is structural: if Instructions 2 and 4 already implement independent state correctly, this instruction produces a test or verification artifact confirming the isolation rather than new production code.
- Recommended execution order: run after Instructions 2 and 4 are complete, as it verifies their combined behavior.

**Expected Output**

- Confirmation that search state and filter state are stored in independent state variables or stores.
- Verification that clearing search leaves filter state intact and vice versa.
- If a shared state object is found that would cause one clear action to reset the other, a proposed fix isolating the two states.

**Deliverables**

- State isolation verification — either a code review note confirming correct isolation, or a fix proposal if isolation is violated
- If code changes are required: updated state management file showing independent search and filter state
- List of all files added or modified (or confirmation of no changes needed)

**Preconditions**

- Instructions 2 and 4 must be complete or their state management patterns must be identifiable before this instruction can verify isolation.

---

## Instruction 6: Transaction Sort Control

**Goal**
Implement the sort control UI and the sort stage of the result pipeline, reordering the current result set by the user-selected criterion and direction, displaying the default sort criterion as a labeled default, and supporting direction toggle for criteria that have ascending/descending variants.

**Scope**
In scope: the sort control UI, the sort stage logic (ordering the result array by the selected field and direction), the direction toggle for applicable criteria, and the default sort label visible when no custom sort has been selected. Out of scope: sort persistence across navigation (Instruction 7), the pipeline wiring (Instruction 1), the filter and search controls (Instructions 2 and 4).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 3), Section 5 (Story 18 acceptance criteria), Section 6a (sort is a view-layer operation; must not alter stored transaction data or order), Section 6b (sort criteria must map to stored, sortable fields)

**Constraints**

- Implement only sort criteria confirmed by the author (PRD Open Question 3). Do not invent additional criteria.
- Sort must never modify the underlying transaction dataset — it is a view-layer ordering operation only.
- Sort must apply to the current result set as output by the filter and search stages — not to the full unfiltered dataset.
- The default sort criterion must be labeled and visible when the user has not changed the sort setting. Confirm the default sort criterion with the author; if unconfirmed, use date descending and flag it.
- For criteria with direction (e.g., amount, date), provide ascending and descending options. For criteria without a meaningful direction (confirm with author), a single ordering is sufficient.
- Do not implement sort persistence here — that surface belongs to Instruction 7. In this instruction, sort state is session-only.
- Do not modify the pipeline wiring — slot this instruction's sort stage function into the interface defined by Instruction 1.
- Recommended execution order: run after Instruction 1 defines the pipeline interface.

**Expected Output**

- A sort control UI (dropdown, segmented control, or equivalent consistent with the codebase) presenting the confirmed sort criteria.
- A sort stage function that accepts a transaction array, a sort field, and a direction, and returns the array sorted accordingly. When no custom sort is active, the function applies the default sort.
- A direction toggle for applicable criteria.
- The default sort criterion labeled in the UI when no custom sort has been selected (e.g., "Date: Newest First").
- Confirmation that sort reorders the pipeline output without modifying stored data.

**Deliverables**

- Sort control UI component file
- Sort stage function (to be slotted into the pipeline from Instruction 1)
- Default sort constant (named, not hardcoded inline)
- List of all files added or modified

**Preconditions**

- PRD Open Question 3 (sort criteria) must be confirmed before the sort control options and stage logic are implemented.
- Confirm the default sort criterion with the author. If unconfirmed, use date descending and flag.
- Instruction 1 must define the pipeline interface before the sort stage function is written to match it.

**Open Questions**

- PRD Open Question 3: What sort criteria are available — date, amount, category, alphabetical, others? The sort control cannot be built without a confirmed criteria list.

---

## Instruction 7: Sort Persistence Across Navigation

**Goal**
Implement the mechanism that preserves the user's selected sort criterion and direction when they navigate away from the transaction list and restore it when they return.

**Scope**
In scope: the persistence write triggered when the sort selection changes, the persistence read applied when the transaction list mounts or regains focus, and the layer used for persistence (session state, local storage, user preferences store, or equivalent — see Preconditions). Out of scope: the sort control UI and stage logic (Instruction 6), the pipeline wiring (Instruction 1), and sort preference across app sessions if session-only persistence is confirmed.

**Inputs**

- Full codebase
- PRD Section 5 (Story 18, fourth acceptance criterion: selected sort order preserved when user navigates away and returns)

**Constraints**

- Persist the sort criterion and direction together as a single unit — do not persist criterion without direction or vice versa.
- Read the persisted sort on list mount or focus and apply it as the initial sort state, bypassing the default only if a stored preference exists.
- Do not modify the sort stage logic — read the persisted value and pass it to the sort control's state; do not re-implement sorting here.
- Use the persistence mechanism already established in the codebase for user preferences or view state. Do not introduce a new storage layer.
- PRD Open Question 6 (session-only vs. cross-session persistence) determines the storage scope. If session-only, use in-memory or navigation state. If cross-session, use the user preference store. Confirm before choosing.
- Recommended execution order: run after Instruction 6 defines the sort state structure and the sort criterion/direction pair to be persisted.

**Expected Output**

- A persistence write triggered whenever the user changes the sort criterion or direction.
- A persistence read applied on list mount or focus that initializes the sort control with the stored value.
- If no stored value exists (first visit or cleared preferences), the sort control initializes with the default sort.
- Confirmation that navigating away and returning restores the user's last sort selection.

**Deliverables**

- Updated sort control or list component showing the persistence read/write calls
- Storage key and value format documented
- List of all files added or modified

**Preconditions**

- PRD Open Question 6 (sort persistence scope — session vs. cross-session) must be confirmed before choosing the storage mechanism.
- Instruction 6 must define the sort criterion/direction state structure before this instruction persists it.
- Confirm the codebase's existing user preference or view-state persistence mechanism before selecting a storage approach.

**Open Questions**

- PRD Open Question 6: Is sort order persisted across app sessions, or only within a single navigation session? This determines whether the storage target is in-memory, local storage, or a user settings store.

---

## Instruction 8: Filter Empty State

**Goal**
Implement the empty state displayed when an active filter, active search, or their combination produces zero results — distinguished visually and textually from the zero-transaction empty state shown when no transactions have been logged at all.

**Scope**
In scope: the empty state component for filter-only zero results, search-only zero results, and combined filter-and-search zero results; the logic that selects the correct empty state variant based on which controls are active; and the distinction from the baseline zero-transaction empty state. Out of scope: the search input (Instruction 2), the filter controls (Instruction 4), the baseline zero-transaction empty state (Transaction History PRD Instruction 1), and the pipeline logic (Instruction 1).

**Inputs**

- Full codebase
- PRD Section 5 (Story 16 third acceptance criterion: no-results message for search; Story 17 fourth acceptance criterion: no-results message for filter), PRD Open Question 7 (filter empty state must be distinguishable from zero-transaction empty state)

**Constraints**

- Do not reuse the zero-transaction empty state copy or component for the filter/search empty state. Each variant must communicate a distinct reason for the empty list.
- Identify which controls are active (search only, filter only, or both) and select the appropriate empty state message accordingly.
- The empty state must include a clear action or prompt that lets the user exit the empty state — either by clearing the search, clearing the filter, or both. Do not strand the user in an empty state with no recovery path.
- Do not modify the pipeline or the search/filter logic — this instruction only renders a state that the pipeline has already produced.
- Recommended execution order: run after Instructions 2 and 4 define the active state signals for search and filter.

**Expected Output**

- An empty state component with at minimum three distinct message variants: search-only no results, filter-only no results, and combined search-and-filter no results.
- Each variant includes a message and a recovery action (clear search, clear filter, or clear both).
- The correct variant is selected based on the current active state of the search query and filter criteria.
- Confirmation that none of these variants are displayed when no controls are active and no transactions exist — in that case, the baseline zero-transaction empty state (from Transaction History PRD) is displayed instead.

**Deliverables**

- Empty state component file with all variants
- Variant selection logic showing how active search/filter state maps to each variant
- List of all files added or modified

**Preconditions**

- Confirm the baseline zero-transaction empty state component from the Transaction History PRD or existing codebase to ensure the new variants are visually and textually distinct from it.
- Instructions 2 and 4 must expose the active search and filter states so the variant selector can read them.
- PRD Open Question 7 (distinguish filter empty state from zero-transaction empty state) is raised explicitly — confirm the intended copy or messaging pattern with the author before finalizing variant text.

**Open Questions**

- PRD Open Question 7: Should the filter/search empty state explicitly tell the user why no results are shown (e.g., "No transactions match your current filter") and offer a direct clear action? Confirm the intended message pattern and recovery affordance with the author.
