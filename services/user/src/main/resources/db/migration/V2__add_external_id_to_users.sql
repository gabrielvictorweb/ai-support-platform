ALTER TABLE users ADD COLUMN external_id VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT uk_users_external_id UNIQUE (external_id);
