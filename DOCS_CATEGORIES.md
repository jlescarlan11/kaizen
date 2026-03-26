# Category Data Model Reference

## Entity Schema

### Category Entity
| Field Name | Type | Nullability | Description |
| :--- | :--- | :--- | :--- |
| id | Long | Non-nullable | Unique identifier (Primary Key, Identity) |
| name | String(255) | Non-nullable | Display name of the category. Must be unique within the user's scope (global + user-owned). |
| is_global | Boolean | Non-nullable | True for system categories, False for user-created categories. |
| user_id | Long (FK) | Nullable | Reference to the UserAccount who owns the category. Null for system categories. |
| icon | String(255) | Nullable | Identifier for the category icon. |
| color | String(7) | Nullable | Hex color code for the category (e.g., "#1d4ed8"). |
| created_at | Instant | Non-nullable | Audit timestamp for creation. |
| updated_at | Instant | Non-nullable | Audit timestamp for last update. |

### Transaction Entity (Updated)
| Field Name | Type | Nullability | Description |
| :--- | :--- | :--- | :--- |
| ... | ... | ... | (Existing fields: user_account_id, amount, type, description, transaction_date) |
| category_id | Long (FK) | Nullable | Reference to the Category entity. Null represents "Uncategorized". |

## Constraints & Business Rules
- **Canonical Uncategorized State**: A `null` value in `transaction.category_id` is the only representation of an uncategorized transaction.
- **Single Category**: Each transaction supports at most one category (Single Foreign Key).
- **System Categories**: Marked with `is_global = true` and `user_id = null`.
- **Referential Integrity**: Transaction category must reference a valid Category entry. Orphaned references must not persist after merge or deletion.
