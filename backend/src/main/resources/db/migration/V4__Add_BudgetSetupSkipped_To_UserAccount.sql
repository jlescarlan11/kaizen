-- Migration to add missing budget_setup_skipped column to user_account table
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS budget_setup_skipped BOOLEAN NOT NULL DEFAULT FALSE;
