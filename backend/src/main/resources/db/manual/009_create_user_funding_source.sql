-- Migration: Create user funding sources and extend onboarding progress
-- Path: backend/src/main/resources/db/manual/009_create_user_funding_source.sql

CREATE TABLE user_funding_source (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    user_account_id BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    source_type VARCHAR(32) NOT NULL,
    name VARCHAR(100) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_user_funding_source_user ON user_funding_source(user_account_id);

CREATE UNIQUE INDEX uk_user_funding_source_primary
    ON user_funding_source(user_account_id)
    WHERE is_primary = TRUE;

ALTER TABLE user_funding_source
    ADD CONSTRAINT chk_user_funding_source_type
        CHECK (source_type IN ('CASH_ON_HAND', 'BANK_ACCOUNT', 'E_WALLET'));

ALTER TABLE onboarding_progress
    ADD COLUMN funding_source_type VARCHAR(32);

ALTER TABLE onboarding_progress
    ADD CONSTRAINT chk_onboarding_progress_funding_source_type
        CHECK (
            funding_source_type IS NULL
            OR funding_source_type IN ('CASH_ON_HAND', 'BANK_ACCOUNT', 'E_WALLET')
        );
