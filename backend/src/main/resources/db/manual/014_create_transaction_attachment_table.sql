CREATE TABLE IF NOT EXISTS transaction_attachment (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    transaction_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_reference TEXT NOT NULL,
    CONSTRAINT fk_attachment_transaction FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
);

CREATE INDEX idx_attachment_transaction ON transaction_attachment(transaction_id);
