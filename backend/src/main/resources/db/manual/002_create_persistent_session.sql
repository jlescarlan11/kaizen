CREATE TABLE IF NOT EXISTS persistent_session (
    id BIGSERIAL PRIMARY KEY,
    user_account_id BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_persistent_session_token_hash
    ON persistent_session (token_hash);

CREATE INDEX IF NOT EXISTS idx_persistent_session_user_account_id
    ON persistent_session (user_account_id);
