-- Migration to add NOT NULL constraint to email column
ALTER TABLE user_account ALTER COLUMN email SET NOT NULL;
