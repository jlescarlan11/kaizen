ALTER TABLE transaction ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE transaction ADD COLUMN frequency_unit VARCHAR(20);
ALTER TABLE transaction ADD COLUMN frequency_multiplier INTEGER;
ALTER TABLE transaction ADD COLUMN parent_recurring_transaction_id BIGINT;

ALTER TABLE transaction ADD CONSTRAINT fk_transaction_parent_recurring FOREIGN KEY (parent_recurring_transaction_id) REFERENCES transaction(id);

-- Add constraint: if is_recurring is true, frequency_unit and frequency_multiplier must be non-null
-- Note: Some databases might have different syntax for CHECK constraints.
-- Using standard SQL syntax here.
ALTER TABLE transaction ADD CONSTRAINT chk_recurring_frequency 
CHECK (is_recurring = FALSE OR (frequency_unit IS NOT NULL AND frequency_multiplier IS NOT NULL));
