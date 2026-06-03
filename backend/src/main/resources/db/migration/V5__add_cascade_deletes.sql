-- V5: Add ON DELETE CASCADE to FK constraints that were missing it.
-- Fixes FK violations when deleting a user account or its transactions.

-- 1. transaction_attachment.transaction_id → transaction(id)
ALTER TABLE transaction_attachment
    DROP CONSTRAINT IF EXISTS transaction_attachment_transaction_id_fkey;
ALTER TABLE transaction_attachment
    ADD CONSTRAINT transaction_attachment_transaction_id_fkey
        FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE;

-- 2. reminder_schedule.transaction_id → transaction(id)
ALTER TABLE reminder_schedule
    DROP CONSTRAINT IF EXISTS reminder_schedule_transaction_id_fkey;
ALTER TABLE reminder_schedule
    ADD CONSTRAINT reminder_schedule_transaction_id_fkey
        FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE;

-- 3. user_role.user_account_id → user_account(id)
ALTER TABLE user_role
    DROP CONSTRAINT IF EXISTS user_role_user_account_id_fkey;
ALTER TABLE user_role
    ADD CONSTRAINT user_role_user_account_id_fkey
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE;

-- 4. persistent_session.user_account_id → user_account(id)
ALTER TABLE persistent_session
    DROP CONSTRAINT IF EXISTS persistent_session_user_account_id_fkey;
ALTER TABLE persistent_session
    ADD CONSTRAINT persistent_session_user_account_id_fkey
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE;
