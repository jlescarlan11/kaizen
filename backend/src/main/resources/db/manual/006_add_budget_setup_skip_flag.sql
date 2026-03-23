-- Migration: Add persistent flag for skipped budget setup
-- Path: backend/src/main/resources/db/manual/006_add_budget_setup_skip_flag.sql

ALTER TABLE user_account
    ADD COLUMN budget_setup_skipped BOOLEAN NOT NULL DEFAULT FALSE;
