1. Transaction List View — Implement the scrollable list screen that loads and displays all saved transactions, including the empty state when no records exist.
2. Date Grouping — Implement grouping of transactions under calendar-date headers using each transaction's stored date, ordered most-recent-first.
3. Date Group Header Formatting — Implement the human-readable date label for each group header, including relative labels ("Today", "Yesterday") if confirmed.
4. Transaction Icons — Implement the icon display on each transaction list row, mapping icons to transaction type or category with a fallback for uncategorized records.
5. Transaction Detail View — Implement the detail view that opens from a list row tap and displays all stored fields for the selected transaction without truncation.
6. Detail View Scroll Position Restore — Implement the scroll position preservation behavior so the list returns to the same position after the detail view is dismissed.
7. Running Balance Display — Implement the running balance figure on the history screen, computed as a derived aggregate from all stored transactions.
8. Running Balance Recalculation Trigger — Implement the mechanism that causes the running balance to update when the user returns to the history screen after a new transaction is saved.

---

## Instruction 1: Transaction List View

**Goal**
Implement the transaction history screen that loads all saved transactions and renders them in a scrollable list, including an empty state when no transactions exist.

**Scope**
In scope: the history screen component, the data fetch that retrieves all saved transactions, the list rendering loop, and the empty state display. Out of scope: date grouping (Instruction 2), transaction icons (Instruction 4), the detail view (Instruction 5), and the running balance (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 1), Section 5 (Story 6 acceptance criteria), Section 6a (all records must be displayed with no omission unless disclosed)

**Constraints**

- Retrieve all saved transactions — do not silently paginate or truncate the result set. If the codebase has an existing pagination mechanism, do not apply it here unless it is explicitly disclosed to the user in the UI.
- Do not modify the transaction data schema — read field names only from the confirmed schema or existing codebase.
- Do not implement date grouping, icons, or balance in this instruction — those surfaces belong to Instructions 2, 4, and 7.
- Use data-fetching patterns already established in the codebase. Do not introduce a new data layer.
- Recommended execution order: run after the transaction schema is confirmed (cross-reference with the Transaction Entry PRD Instruction 9 output if available), since this instruction reads from the transaction store.

**Expected Output**

- A history screen component that fetches all transactions and renders each as a list row.
- Each row must display, at minimum, the fields sufficient to identify the transaction (e.g., amount, type, date) — confirm the exact row-level field set from the codebase or detail view spec.
- When no transactions exist, the screen renders an empty state message indicating no transactions have been recorded yet.
- When new transactions have been added, returning to or refreshing the screen reflects them in the list.

**Deliverables**

- New or updated history screen component file
- Data fetch call and its location in the component lifecycle
- Empty state markup
- List of all files added or modified

**Preconditions**

- The transaction data store and its query interface must be identifiable in the codebase before this instruction runs.
- PRD Open Question 5 (pagination vs. full load) must be confirmed by the author. If unconfirmed, implement full load with no pagination and flag the assumption in a code comment.
- Confirm what fields are available on each transaction record — at minimum, type, amount, and date/time must be present.

**Open Questions**

- PRD Open Question 5: Is the list paginated or fully loaded? This determines whether a load-more pattern or virtual list is needed — a decision that affects the component architecture significantly.
- What fields appear on each list row beyond what is needed to identify the transaction? This affects the row component layout and must be confirmed before the row template is finalized.

---

## Instruction 2: Date Grouping

**Goal**
Implement the logic that groups transactions under calendar-date headers in the transaction list, using each transaction's stored date as the grouping key, ordered most-recent date first.

**Scope**
In scope: the grouping transformation applied to the flat transaction list, the date group data structure passed to the list renderer, and the group ordering (most recent first). Out of scope: the date header label format (Instruction 3), transaction row rendering (Instruction 1), transaction icons (Instruction 4), and the running balance (Instruction 7).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 2), Section 5 (Story 8 acceptance criteria), Section 6a (grouping key is the transaction's stored date, not the system date at time of viewing), Section 6b (stored date format must support calendar-date extraction)

**Constraints**

- Use the transaction's stored date field as the grouping key — never the current system date.
- Extract the calendar date from the stored date/time value. If the codebase has an existing date utility, use it. Do not introduce a new date library unless none is present.
- Transactions sharing the same calendar date must appear under one header — do not create duplicate headers for the same date.
- Groups must be ordered most-recent date first. Within a group, preserve the existing transaction sort order.
- Do not modify the transaction data schema or the data fetch — those surfaces belong to Instructions 1 and the Transaction Entry PRD.
- Do not implement date label formatting here — that surface belongs to Instruction 3. Produce a raw calendar date value for each group header; Instruction 3 formats it.
- Recommended execution order: run after Instruction 1 has established the list component and data fetch pattern.

**Expected Output**

- A grouping function or transformation that takes a flat array of transactions and returns an ordered array of `{ date: <calendar date value>, transactions: [...] }` groups, sorted most-recent first.
- The calendar date extraction logic, including how timezone or offset is handled if relevant.
- Integration point showing where in the list component the grouping function is applied.

**Deliverables**

- Grouping function or utility (new file or addition to an existing utility module)
- Updated list component showing where grouping is applied
- List of all files added or modified

**Preconditions**

- Confirm the stored date/time field name and format from the transaction schema before writing the calendar-date extraction logic.
- Confirm whether the codebase has an existing date utility or library — use it if present.
- PRD Open Question 6 (date label format) does not block this instruction — grouping only produces the raw date value. However, confirm that the raw date value produced here is in a format that Instruction 3 can consume.

**Open Questions**

- PRD Section 6b notes timezone handling is unconfirmed. If transactions are stored in UTC and displayed in a local timezone, the calendar date extraction may yield different dates depending on offset. Confirm timezone handling before finalizing the extraction logic.

---

## Instruction 3: Date Group Header Formatting

**Goal**
Implement the human-readable label for each date group header, rendering relative labels ("Today", "Yesterday") for recent dates and an absolute formatted date for all others.

**Scope**
In scope: the date formatting function that converts a raw calendar date value into a display label, the relative label logic ("Today", "Yesterday"), and the absolute date format string. Out of scope: the grouping logic that produces the raw date value (Instruction 2), the list component structure (Instruction 1), and localization beyond what is confirmed in the codebase.

**Inputs**

- Full codebase
- PRD Section 5 (Story 8 acceptance criteria: headers display date in a human-readable format, e.g., "March 26, 2026" or "Today")
- Raw calendar date value format produced by Instruction 2

**Constraints**

- The input to this function is the raw calendar date value produced by Instruction 2 — do not re-derive the calendar date here.
- Compare the raw date against the current system date only for relative label determination ("Today", "Yesterday"). Do not use the system date for grouping.
- Do not introduce a new date formatting library unless none is present in the codebase.
- Do not modify the grouping logic or list component structure — those surfaces belong to Instructions 2 and 1.
- Recommended execution order: run after Instruction 2 confirms the raw date format this function will receive.

**Expected Output**

- A date formatting function that accepts a calendar date value and returns a display string.
- "Today" for the current calendar date, "Yesterday" for the prior calendar date, and a formatted absolute date string (e.g., "March 26, 2026") for all others — unless the author confirms a different set of relative labels.
- Integration point showing where this function is called in the group header render.

**Deliverables**

- Date formatting function (new file or addition to an existing utility module)
- Updated group header component or markup showing where the function is applied
- List of all files added or modified

**Preconditions**

- Confirm the raw date format output by Instruction 2 before writing the formatter's input handling.
- PRD Open Question 6 (absolute date format and relative label set) must be confirmed by the author. If unconfirmed, implement "Today" and "Yesterday" for the two most recent calendar dates and "Month DD, YYYY" for all others, and flag this as an assumption in a code comment.

**Open Questions**

- PRD Open Question 6: What is the confirmed date label format and which relative labels (if any) are required? Without this, the formatter relies on assumptions that may need to be changed.

---

## Instruction 4: Transaction Icons

**Goal**
Implement the icon display on each transaction list row, mapping each transaction's type or category to a corresponding icon, with a fallback icon rendered for transactions with no category or an unmapped type.

**Scope**
In scope: the icon mapping structure (type/category value → icon asset or component), the icon render in the list row, and the fallback icon for unmapped or uncategorized transactions. Out of scope: the list row layout beyond icon placement (Instruction 1), category management as a feature (out of scope per PRD Section 8), and the detail view (Instruction 5).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 3), Section 5 (Story 9 acceptance criteria), Section 6b (a default icon must exist for uncategorized records), Section 6c (icon source — bundled assets, icon font, or library — is unspecified)

**Constraints**

- Use the icon source (bundled assets, icon font, or component library) already present in the codebase. Do not introduce a new icon library unless none exists.
- The icon mapping must key on the transaction's type or category field — confirm which from the author (PRD Open Question 2) before building the map.
- Every transaction row must display an icon — never a blank space. If no mapping exists for a transaction's type/category value, render the fallback icon.
- Do not modify the transaction data schema or add a new field to accommodate icons — icons are derived from existing type/category values.
- Do not implement category management — categories are consumed here as read-only values.
- Recommended execution order: run after Instruction 1 establishes the list row component, since this instruction adds the icon element to it.

**Expected Output**

- An icon mapping object or function: transaction type/category value → icon asset reference or component.
- A fallback icon defined and applied when the transaction's type/category value has no mapping.
- The icon rendered in the list row at a size that is visually distinguishable without tapping.
- Before/after comparison of the list row component showing icon integration.

**Deliverables**

- Icon mapping file or object (inline or extracted, consistent with codebase patterns)
- Updated list row component with icon element
- Fallback icon implementation
- List of all files added or modified

**Preconditions**

- PRD Open Question 2 must be confirmed: are icons keyed on transaction type (expense/income), category, or both? Without this, the mapping cannot be built.
- PRD Open Question 4 must be confirmed: are categories system-defined, user-defined, or inferred? If system-defined, the icon map can be fully implemented here. If user-defined or inferred, the mapping must handle unknown values via the fallback.
- Confirm the icon source available in the codebase before selecting assets.

**Open Questions**

- PRD Open Question 2: Are icons mapped to transaction type, category, or both? This is the primary key for the mapping structure.
- PRD Open Question 4: How are categories defined and assigned? System-defined categories allow a complete static map; user-defined or inferred categories require a dynamic or partial map with robust fallback handling.

---

## Instruction 5: Transaction Detail View

**Goal**
Implement the detail view that opens when a user taps a transaction in the list, displaying all stored fields for that transaction with no truncation and no hidden values.

**Scope**
In scope: the detail view component or screen, the data passed from the list row to the detail view, and the full-field display layout including empty or null field handling. Out of scope: scroll position restoration on dismiss (Instruction 6), the list component itself (Instruction 1), and any edit or delete controls (out of scope per PRD Section 8).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 4), Section 5 (Story 7 acceptance criteria), Section 6a (all fields must be visible; empty fields shown as empty or not applicable, not hidden), Section 6c (navigation or modal pattern is unspecified)

**Constraints**

- Display every field stored on the transaction record. Do not suppress or hide any field, including those with null or empty values — show them explicitly as empty or not applicable.
- Do not add edit or delete controls to this view — those are out of scope per the PRD.
- Use the navigation or overlay pattern already established in the codebase (modal, push navigation, bottom sheet, or equivalent). Do not introduce a new routing mechanism.
- Do not modify the transaction data schema — read field names from the confirmed schema or existing codebase.
- Do not implement scroll position restoration here — that surface belongs to Instruction 6.
- Recommended execution order: run after Instruction 1 establishes the list and the tap/select interaction point.

**Expected Output**

- A detail view component that accepts a transaction record and renders all its fields.
- Each field displayed with a label and its value. Null or empty values shown as "—" or "Not set" (or whatever convention the codebase uses) rather than omitted.
- The navigation or modal trigger in the list row that opens the detail view with the correct transaction.
- Before/after comparison if modifying an existing detail component.

**Deliverables**

- New or updated detail view component file
- Updated list row showing the tap/select trigger and the data passed to the detail view
- List of all files added or modified

**Preconditions**

- PRD Open Question 1 (full field list for detail view) must be confirmed or derivable from the transaction schema. If unconfirmed, display all schema fields and flag the assumption.
- Confirm the navigation or modal pattern in use in the codebase before implementing the transition.
- Confirm the transaction schema's full field list before building the layout.

**Open Questions**

- PRD Open Question 1: Is the detail view the full set of stored fields, or a curated subset? If a subset, which fields are intentionally excluded?

---

## Instruction 6: Detail View Scroll Position Restore

**Goal**
Implement the behavior that returns the transaction list to the same scroll position the user was at before opening the detail view, when the detail view is dismissed.

**Scope**
In scope: the scroll position capture before the detail view opens, the storage of that position for the duration of the detail view session, and the restoration of that position on dismiss. Out of scope: the detail view content (Instruction 5), the list component data fetch (Instruction 1), and any scroll behavior not related to detail view dismiss.

**Inputs**

- Full codebase
- PRD Section 5 (Story 7, second acceptance criterion: user is returned to the same scroll position on dismiss)

**Constraints**

- Capture scroll position at the moment the detail view opens — not at page load or at any other lifecycle point.
- Restore the captured position when and only when the detail view is dismissed — do not restore on other navigation events.
- Use the scroll management pattern already established in the codebase. Do not introduce a new scroll library.
- Do not modify the detail view component — that surface belongs to Instruction 5.
- Do not modify the list data fetch — that surface belongs to Instruction 1.
- Recommended execution order: run after Instructions 1 and 5 are in place, since this instruction depends on both the list scroll container and the detail view dismiss event.

**Expected Output**

- Scroll position captured (as a numeric offset or equivalent) when the list row is tapped and the detail view opens.
- On detail view dismiss, the list scrolls to or renders at the captured position.
- Confirmation that this behavior works whether the detail view is a modal, push route, or overlay.

**Deliverables**

- Updated list component or navigation handler showing scroll capture and restore logic
- List of all files added or modified

**Preconditions**

- Confirm the navigation or modal pattern used for the detail view (from Instruction 5 output or existing codebase) — the scroll restore mechanism depends on knowing when "dismiss" occurs (back navigation, modal close callback, etc.).
- Confirm whether the list is a native scroll container, a virtualized list, or a custom scroll implementation — this affects how the position is captured and restored.

---

## Instruction 7: Running Balance Display

**Goal**
Implement the running balance figure on the transaction history screen, computed as the sum of all income transactions minus the sum of all expense transactions, and displayed with a label that distinguishes it from individual transaction amounts.

**Scope**
In scope: the balance computation (aggregate query or client-side derivation), the balance display component on the history screen, the label, and the zero state (balance displays as zero when no transactions exist). Out of scope: balance recalculation trigger on new transaction save (Instruction 8), the transaction list itself (Instruction 1), and per-row cumulative balance if that variant is confirmed (see Open Questions).

**Inputs**

- Full codebase
- PRD Section 4 (Feature 5), Section 5 (Story 10 acceptance criteria), Section 6b (balance is a derived value — must not be stored as a mutable field), Section 6c (data layer must support a queryable aggregate of income and expense sums)

**Constraints**

- Compute the balance from all transactions in the dataset — do not use a cached or stored balance field that can drift out of sync.
- The balance equals: sum of all income amounts minus sum of all expense amounts. Do not approximate or subset.
- Display the balance with a clear label so it is not mistaken for a single transaction amount — confirm label text with the author or use a descriptive default (e.g., "Total Balance") and flag as an assumption.
- When no transactions exist, display zero.
- Do not store the computed balance as a new field in the transaction schema.
- Do not implement the recalculation trigger for when a new transaction is saved — that surface belongs to Instruction 8.
- Recommended execution order: run after Instruction 1 confirms the data fetch pattern and the transaction store's query interface.

**Expected Output**

- The balance computation: a query or client-side reduce over all transactions, applying +amount for income and −amount for expense.
- A balance display component showing the computed value and a distinguishing label.
- Zero state: when no transactions exist, the balance renders as zero (not blank or hidden).
- Before/after comparison if adding to an existing history screen.

**Deliverables**

- Balance computation function or query
- Balance display component or markup added to the history screen
- List of all files added or modified

**Preconditions**

- Confirm that the transaction store exposes the full transaction list or an aggregate query that includes both type and amount fields — both are required for the income/expense summation.
- PRD Open Question 3 must be confirmed: is the balance a single current total, or does each row show its own cumulative running balance? If per-row, this instruction's scope expands significantly and the rendering approach changes. Do not implement per-row balance without explicit confirmation.
- Confirm the label text with the author. If unconfirmed, use "Total Balance" and flag in a code comment.

**Open Questions**

- PRD Open Question 3: Is the balance a single figure for the entire history, or is each transaction row annotated with a cumulative balance up to that point? This is the most consequential unresolved question for this instruction — the two variants require fundamentally different data query and rendering approaches.

---

## Instruction 8: Running Balance Recalculation Trigger

**Goal**
Implement the mechanism that causes the running balance on the history screen to update when the user returns to the screen after a new transaction has been saved.

**Scope**
In scope: the trigger or lifecycle hook that causes the balance to be recomputed when the history screen becomes active or is refreshed after a transaction save. Out of scope: the balance computation itself (Instruction 7), the transaction save logic (covered in the Transaction Entry PRD), and any real-time push or subscription update not implied by the PRD.

**Inputs**

- Full codebase
- PRD Section 5 (Story 10, second acceptance criterion: balance updates when the user returns to the history screen after a new transaction is saved)

**Constraints**

- The trigger must fire when the user returns to the history screen — at minimum, on screen focus or mount after a save event. Do not assume a real-time subscription unless the codebase already uses one.
- Do not modify the balance computation function — that surface belongs to Instruction 7.
- Do not modify the transaction save handler — that surface belongs to the Transaction Entry PRD.
- Use the screen lifecycle or focus event pattern already established in the codebase. Do not introduce a new state management or pub/sub library.
- Recommended execution order: run after Instruction 7, since this instruction adds the re-fetch or recompute trigger to the balance already rendered by Instruction 7.

**Expected Output**

- A lifecycle hook, focus listener, or equivalent that re-fetches or recomputes the transaction list and balance when the history screen becomes active.
- Confirmation that the trigger fires after a new transaction is saved and the user navigates back to the history screen.
- No duplicate fetch on the initial mount — the trigger must not cause a redundant load on first entry to the screen.

**Deliverables**

- Updated history screen component showing the focus/re-fetch trigger
- List of all files added or modified

**Preconditions**

- Confirm the screen lifecycle or navigation event model in the codebase (e.g., route focus event, component mount/unmount cycle, global state subscription) before selecting the trigger mechanism.
- Instruction 7 must be complete or its data fetch pattern must be identifiable, since this instruction wraps or re-invokes that fetch.
