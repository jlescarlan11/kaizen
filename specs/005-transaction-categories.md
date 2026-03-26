# Product Requirements Document

---

## 1. Document Header

| Field                      | Value                  |
| -------------------------- | ---------------------- |
| **Product / Feature Name** | Transaction Categories |
| **Version**                | 1.0                    |
| **Status**                 | Draft                  |
| **Last Updated**           | _(fill in)_            |
| **Author**                 | _(fill in)_            |

---

## 2. Problem Statement

Users who log transactions need a way to classify them so that individual records belong to a meaningful group — food, transport, utilities, income, and so on. Without categories, all transactions exist as an undifferentiated list of amounts and dates. The user can see what they spent and when, but not what they spent it on in aggregate, making the history useful only for verification and not for understanding spending behavior.

The consequence is that the ledger never becomes analytical. A user cannot answer "how much did I spend on food this month" or "which category is consuming most of my budget" without categories as a structural foundation. Miscategorized or uncategorized transactions compound this problem silently — if the user cannot see which records are unclassified, incomplete data gets treated as complete, and any summary built on it is wrong. And as the category list grows organically, near-duplicate categories (e.g., "Food", "Dining", "Restaurants") fragment spending data that should be consolidated.

Success looks like a user who can assign every transaction to a category, identify and resolve uncategorized records at a glance, correct miscategorizations at any time, and maintain a clean category taxonomy by merging redundant entries — resulting in a history where spending is fully and accurately classified.

---

## 3. User Personas

| Field               | Content                                                                                                                                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Personal Finance User                                                                                                                                                                                                                                                                  |
| **Role**            | User                                                                                                                                                                                                                                                                                   |
| **Primary Goal**    | Maintain a fully categorized transaction history where every record is classified accurately and the category list remains clean and non-redundant                                                                                                                                     |
| **Key Pain Points** | No way to classify transactions by type of spending; uncategorized records are invisible among categorized ones, leaving gaps unnoticed; miscategorized transactions require a correction path; duplicate or similar categories fragment spending data that should be grouped together |
| **Stories Owned**   | Stories 19, 20, 21, 22                                                                                                                                                                                                                                                                 |

---

## 4. Feature List

### Feature 1: Transaction Categories

A category system that allows each transaction to be assigned to a named classification.

- Story 19: _"As a user, I want transactions to have categories so that I can organize spending."_

**Core value:** Provides the structural foundation for all spending organization — every transaction belongs to a named group that can be reviewed, filtered, and summarized.

---

### Feature 2: Change Transaction Category

Allows the user to reassign an existing transaction from one category to another.

- Story 20: _"As a user, I want to change transaction category so that I can recategorize."_

**Core value:** Keeps the category data on any transaction correctable at any time, so the history remains accurate as the user's classification preferences evolve.

---

### Feature 3: Uncategorized Transaction Highlighting

A visual indicator that distinguishes transactions with no assigned category from those that are fully categorized.

- Story 21: _"As a user, I want uncategorized transactions highlighted so that I can categorize them."_

**Core value:** Makes classification gaps immediately visible, so the user can act on them rather than unknowingly treating an incomplete history as complete.

---

### Feature 4: Merge Categories

An operation that consolidates two or more categories into one, reassigning all transactions from the merged categories to the target category.

- Story 22: _"As a user, I want to merge categories so that I can consolidate similar ones."_

**Core value:** Lets users correct a fragmented category taxonomy without manually recategorizing every affected transaction one by one.

`[Priority unconfirmed — verify with author]` — Feature 1 is a prerequisite for Features 2, 3, and 4. Features 2 and 3 are ordered before Feature 4 on the basis that single-record correction and gap visibility are more frequently needed than bulk taxonomy consolidation. Final priority should be confirmed with the product owner.

---

## 5. Acceptance Criteria

---

**Story 19:** _"As a user, I want transactions to have categories so that I can organize spending."_

Acceptance Criteria:

- [ ] Given the user is adding or editing a transaction, when the category field is presented, then they can assign one category from an available list of categories.
- [ ] Given a category is assigned to a transaction, when the transaction is saved, then the category is stored and displayed alongside the transaction in the list and detail views.
- [ ] Given the category list is presented, when the user views it, then it contains at least a default set of categories available without requiring the user to create them first. `[INFERRED — verify with author: confirm whether default/system categories are provided or the user must create all categories from scratch]`
- [ ] Given a transaction is saved without a category assigned, when it is displayed, then it is stored with a null or "uncategorized" state — not silently assigned to a default category. `[INFERRED — verify with author: confirm whether auto-assignment to a default category is acceptable]`

---

**Story 20:** _"As a user, I want to change transaction category so that I can recategorize."_

Acceptance Criteria:

- [ ] Given an existing transaction with an assigned category, when the user selects a recategorize action, then a category selector is presented showing all available categories.
- [ ] Given the category selector is open, when the user selects a different category and confirms, then the transaction's category is updated to the newly selected one and the previous category assignment is removed.
- [ ] Given the category selector is open, when the user selects the same category already assigned and confirms, then the transaction is unchanged.
- [ ] Given the category selector is open, when the user dismisses it without making a selection, then the transaction's existing category assignment is unchanged.
- [ ] Given a transaction's category is changed, when the transaction list or any derived view is displayed, then it reflects the updated category — not the previous one.

---

**Story 21:** _"As a user, I want uncategorized transactions highlighted so that I can categorize them."_

Acceptance Criteria:

- [ ] Given the transaction list is displayed, when one or more transactions have no assigned category, then each uncategorized transaction is visually distinguished from categorized ones in a way that is immediately noticeable without tapping into the record.
- [ ] Given an uncategorized transaction is highlighted, when the user taps or selects it, then they are taken directly to a category assignment action for that transaction. `[INFERRED — verify with author: confirm whether the highlight acts as a shortcut to categorization or only as a visual indicator]`
- [ ] Given a previously uncategorized transaction is assigned a category, when the list updates, then the highlight is removed from that transaction.
- [ ] Given all transactions are categorized, when the list is displayed, then no highlight indicators are shown.
- [ ] Given the user applies a filter or search that returns only categorized transactions, when the filtered list is displayed, then no uncategorized highlights are shown within the result set.

---

**Story 22:** _"As a user, I want to merge categories so that I can consolidate similar ones."_

Acceptance Criteria:

- [ ] Given the user initiates a merge operation, when they select a source category and a target category, then a confirmation step is presented that states the number of transactions that will be reassigned from the source to the target.
- [ ] Given the user confirms the merge, when the operation completes, then all transactions previously assigned to the source category are reassigned to the target category.
- [ ] Given the user confirms the merge, when the operation completes, then the source category no longer exists in the category list.
- [ ] Given the user confirms the merge, when the operation completes, then the target category remains unchanged in name and retains all transactions it held before the merge, plus the reassigned ones.
- [ ] Given the user cancels the merge confirmation, when they return to the category list, then both the source and target categories remain unchanged.
- [ ] Given a merge is performed, when any derived views (e.g., spending summaries, filters) are displayed, then they reflect the post-merge category assignments — no transaction references the deleted source category. `[INFERRED — verify with author]`
- [ ] Given the user attempts to merge a category with itself, when the action is triggered, then the operation is blocked and an error or informational message is displayed.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- A transaction may be assigned at most one category at a time. `[INFERRED — verify with author: confirm whether multi-category tagging is ever in scope]`
- The category list must be the single source of truth. A transaction's category field must reference a valid entry in the category list — orphaned category references (pointing to a deleted or merged category) must not persist after a merge or deletion. `[INFERRED — verify with author]`
- Merge (Story 22) must be atomic: either all transactions are reassigned and the source category is removed, or neither happens. A partial merge state must not be persisted.
- Uncategorized highlighting (Story 21) must be a read-only view concern — it must not alter the transaction record or auto-assign a category.

### 6b. Data Constraints

- Each transaction record must support a nullable category field. A null value is the canonical representation of an uncategorized transaction — not a blank string or a reserved "None" category entry. `[INFERRED — verify with author]`
- The category list must be stored as its own entity with at minimum a unique identifier and a display name. `[INFERRED — verify with author: confirm full category schema]`
- After a merge, no transaction record in the data store may reference the source category's identifier. Referential integrity must be enforced at the data layer.
- If default system categories are provided (Story 19), they must be distinguishable from user-created categories in the data model, even if they appear identically to the user. `[INFERRED — verify with author]`

### 6c. Integration Constraints

- Story 22 implies that the category management interface is a distinct screen or modal separate from the transaction entry form. The navigation path to this interface is not defined. `[INFERRED — verify with author]`
- Story 21 implies the transaction list view has access to each transaction's category state at render time, without requiring a secondary fetch per transaction. Category state must be included in the list query result. `[INFERRED — verify with author]`
- Stories 19 and 20 both involve category selection. Both must reference the same category list data source so that the available options are consistent across entry and recategorization flows.

---

## 7. Success Metrics

| Feature Area                | Metric                                                                                                             | Measurement Method        | Target                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------ |
| Transaction Categories      | Percentage of saved transactions that have a category assigned                                                     | Data audit                | `[TBD — set by product owner]` |
| Change Transaction Category | Percentage of recategorization actions that complete with a confirmed category change (vs. dismissed)              | Event tracking            | `[TBD — set by product owner]` |
| Uncategorized Highlighting  | Percentage reduction in uncategorized transactions within 7 days of a user's first session with the feature active | Longitudinal data audit   | `[TBD — set by product owner]` |
| Merge Categories            | Percentage of merge operations that complete with zero orphaned transaction references to the source category      | Automated data validation | 100%                           |

---

## 8. Out of Scope

- This PRD does not cover creating, renaming, or deleting individual categories as standalone operations.
- This PRD does not cover multi-category tagging — assigning more than one category to a single transaction.
- This PRD does not cover category icons or colors as a configurable attribute.
- This PRD does not cover automatic or AI-assisted category assignment based on transaction description or amount.
- This PRD does not cover category hierarchies or subcategories.
- This PRD does not cover spending summaries, budgets, or analytics grouped by category.
- This PRD does not cover splitting a transaction across multiple categories.
- This PRD does not cover importing or exporting category configurations.

---

## 9. Open Questions

| #   | Question                                                                                                                                            | Relevant Story     | Impact if Unresolved                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Are default system categories provided out of the box, or must the user create all categories from scratch?                                         | Story 19           | Determines whether a seed dataset is required and whether system categories need special handling in the data model |
| 2   | Can a user create, rename, or delete individual categories, or is category management limited to the operations described in these stories?         | Story 19, Story 22 | Determines whether a full category management screen is in scope or out of scope for this PRD                       |
| 3   | Is category assignment limited to one category per transaction, or can a transaction belong to multiple categories?                                 | Story 19, Story 20 | Fundamentally affects the data schema — single foreign key vs. many-to-many relationship                            |
| 4   | Does the uncategorized highlight act as a tap target that opens category assignment directly, or is it only a visual indicator?                     | Story 21           | Determines whether the highlight requires interactive behavior or is purely presentational                          |
| 5   | Can a merge operation target more than two categories at once (e.g., merge three into one), or is it strictly a one source to one target operation? | Story 22           | Affects the merge UI design and the reassignment logic                                                              |
| 6   | What happens to a category that has been used as a merge target if the user later wants to rename or delete it?                                     | Story 22           | Determines whether post-merge category management needs additional constraints                                      |
| 7   | Is there an undo mechanism for merge operations, given the potentially large number of transactions affected?                                       | Story 22           | Determines whether merge must be reversible and whether a pre-merge snapshot must be retained                       |
