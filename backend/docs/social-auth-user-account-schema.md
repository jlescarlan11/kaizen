# Social Auth User Account Schema

## Confirmed Preconditions

- Database: PostgreSQL
- ORM: Spring Data JPA / Hibernate
- Migration approach currently present in the repo: none; the application relies on Hibernate schema management (`update` in `dev`, `validate` in `staging` and `prod`)
- Existing users/accounts table: none found in the current codebase

## Before / After

### Before

No `UserAccount` entity, repository, or user/accounts table exists in the backend codebase.

### After

The new `user_account` schema contains:

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | `BIGSERIAL` | No | Primary key inherited from `BaseEntity` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | No | Audited create timestamp from `BaseEntity` |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | No | Audited update timestamp from `BaseEntity` |
| `name` | `VARCHAR(255)` | No | User name from the social provider |
| `email` | `VARCHAR(320)` | No | User email address, globally unique |
| `provider_name` | `VARCHAR(50)` | No | Identity provider name such as `google` or `facebook` |
| `provider_user_id` | `VARCHAR(255)` | No | Provider-issued subject/user identifier |
| `password_hash` | `VARCHAR(255)` | Yes | Nullable so social accounts are not forced to set a password |
| `encrypted_access_token` | `TEXT` | No | Stores encrypted access-token ciphertext, never plaintext |
| `encrypted_refresh_token` | `TEXT` | Yes | Stores encrypted refresh-token ciphertext when a provider returns one |

Constraints added:

- Unique email: `uk_user_account_email`
- Unique provider identity: `uk_user_account_provider_identity` on (`provider_name`, `provider_user_id`)

## Token Storage Rationale

The current codebase only demonstrates one-way secret handling through BCrypt password hashing in Spring Security. That is correct for passwords, but it is not appropriate for OAuth tokens that may need to be presented again to the provider later.

For that reason, the schema uses encrypted-token fields (`encrypted_access_token`, `encrypted_refresh_token`) instead of plaintext token columns. The intended storage contract is:

1. Encrypt the token value in the application before persistence using a symmetric encryption mechanism backed by an environment-managed key.
2. Persist only ciphertext in these columns.
3. Decrypt only at the boundary where a provider call requires the token.

This keeps the database contract compatible with future social-login flows while avoiding plaintext storage and without requiring a password for social accounts.

## Conflicts Identified

- No existing `users` or `accounts` table was found, so there is no conflicting non-null password column to relax.
- No existing migration framework was found, so the PostgreSQL DDL in `src/main/resources/db/manual/001_create_user_account.sql` is a manual migration script intended to be run before `staging` or `prod` boots with `ddl-auto=validate`.
