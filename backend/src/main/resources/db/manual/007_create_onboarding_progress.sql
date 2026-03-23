-- Migration: Persist onboarding progress for resumed sessions
-- Path: backend/src/main/resources/db/manual/007_create_onboarding_progress.sql

-- Implements durable server-side storage for onboarding steps (see PRD Section 6c, Story 17).

CREATE TABLE onboarding_progress (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    user_account_id BIGINT NOT NULL UNIQUE REFERENCES user_account(id) ON DELETE CASCADE,
    current_step VARCHAR(32) NOT NULL,
    balance_value DECIMAL(15, 2),
    budget_choice VARCHAR(255)
);

CREATE INDEX idx_onboarding_progress_user ON onboarding_progress(user_account_id);

ALTER TABLE onboarding_progress
    ADD CONSTRAINT chk_onboarding_progress_step
        CHECK (current_step IN ('BALANCE', 'BUDGET', 'COMPLETE'));
