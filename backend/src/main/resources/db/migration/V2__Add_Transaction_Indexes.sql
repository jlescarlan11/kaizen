-- Add indexes to optimize transaction search and filtering
CREATE INDEX idx_transaction_date ON transaction (transaction_date);
CREATE INDEX idx_transaction_category_id ON transaction (category_id);
CREATE INDEX idx_transaction_user_account_id ON transaction (user_account_id);
