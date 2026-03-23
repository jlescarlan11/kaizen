-- Role table
CREATE TABLE IF NOT EXISTS role (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_role_name
    ON role (name);

-- User-Role join table for Multiple Roles per User (RBAC)
CREATE TABLE IF NOT EXISTS user_role (
    user_account_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_account_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_account_id) REFERENCES user_account (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE
);

-- Seed initial roles
INSERT INTO role (name, created_at, updated_at, description)
VALUES ('USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Standard application user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (name, created_at, updated_at, description)
VALUES ('ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'System administrator with full access')
ON CONFLICT (name) DO NOTHING;
