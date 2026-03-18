# Google Sub-to-Account Mapping Schema

## Schema Design Rationale

Based on the existing codebase, specifically the `UserAccount` JPA entity and `001_create_user_account.sql`, the schema already utilizes a **new column approach on the primary account table** to store third-party provider identifiers. 

Rather than creating a separate mapping table or a dedicated `google_sub` column, the application leverages generic `provider_name` and `provider_user_id` columns. 
This is the correct approach for this codebase because:
- **Simplicity:** It avoids `JOIN` overhead from a separate mapping table.
- **Flexibility:** The generic nature of `provider_name` natively supports future OAuth providers (e.g., Apple, GitHub).
- **Stability:** The Google `sub` claim is inherently stable and unique per Google account, making it perfectly suited for the `provider_user_id` column.

## Proposed DDL / Migration Script

Since the application does not use an automated migration framework (like Flyway or Liquibase), and instead relies on Hibernate's `ddl-auto` for dev and manual scripts for production, the necessary DDL is already present in `backend/src/main/resources/db/manual/001_create_user_account.sql`. 

No *new* migration script is required, but the relevant schema asserting the required constraints is documented below:

```sql
-- Existing columns in the user_account table that satisfy the requirement
ALTER TABLE user_account 
    ADD COLUMN IF NOT EXISTS provider_name VARCHAR(50) NOT NULL,
    ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(255) NOT NULL;

-- Uniqueness constraint ensuring the Google sub is unique across all accounts
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_account_provider_identity
    ON user_account (provider_name, provider_user_id);
```

## Shared Surface Declaration (for Instruction 5)

Instruction 5 must use the following established data surface to read/write the Google `sub` mapping:

- **Table Name:** `user_account` (Mapped via `UserAccount.java` entity)
- **Primary Key:** `id` (Type: `Long`)
- **Provider Name Column:** `provider_name` (Expected value: `"google"`)
- **Google Sub Column:** `provider_user_id` (Stores the `sub` claim from Google's `userInfo` response)
- **Lookup Method:** `UserAccountRepository.findByProviderNameAndProviderUserId(String providerName, String providerUserId)`
