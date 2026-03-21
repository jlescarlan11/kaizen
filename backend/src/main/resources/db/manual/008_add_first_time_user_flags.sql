-- Migration: Add first-time-user guidance flags to user_account
-- Path: backend/src/main/resources/db/manual/008_add_first_time_user_flags.sql

ALTER TABLE user_account
    ADD COLUMN tour_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN first_transaction_added BOOLEAN NOT NULL DEFAULT FALSE;
