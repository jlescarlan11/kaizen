-- Alter transaction_date to TIMESTAMPTZ for correct timezone handling
ALTER TABLE transaction ALTER COLUMN transaction_date TYPE TIMESTAMPTZ;
ALTER TABLE onboarding_progress ALTER COLUMN initial_transaction_date TYPE TIMESTAMPTZ;
ALTER TABLE onboarding_initial_balance ALTER COLUMN transaction_date TYPE TIMESTAMPTZ;
ALTER TABLE reminder_schedule ALTER COLUMN next_reminder_timestamp TYPE TIMESTAMPTZ;
ALTER TABLE reminder_schedule ALTER COLUMN last_retry_timestamp TYPE TIMESTAMPTZ;
ALTER TABLE persistent_session ALTER COLUMN expires_at TYPE TIMESTAMPTZ;

-- Apply to audit columns globally for consistency
ALTER TABLE role ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE user_account ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE category ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE budget ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE payment_method ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE transaction ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE transaction_attachment ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE onboarding_progress ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE user_funding_source ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE reminder_schedule ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
ALTER TABLE persistent_session ALTER COLUMN created_at TYPE TIMESTAMPTZ, ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
