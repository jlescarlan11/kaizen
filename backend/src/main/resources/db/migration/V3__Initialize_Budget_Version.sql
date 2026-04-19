-- Initialize version column for existing budget records and add constraints
UPDATE budget SET version = 0 WHERE version IS NULL;

ALTER TABLE budget ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE budget ALTER COLUMN version SET NOT NULL;
