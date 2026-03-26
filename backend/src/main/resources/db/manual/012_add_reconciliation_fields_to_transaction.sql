-- Increase type column length and add reconciliation_increase column
ALTER TABLE transaction ALTER COLUMN type TYPE VARCHAR(20);
ALTER TABLE transaction ADD COLUMN reconciliation_increase BOOLEAN;
