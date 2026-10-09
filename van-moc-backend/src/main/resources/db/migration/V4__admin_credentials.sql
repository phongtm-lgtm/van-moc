ALTER TABLE users ADD COLUMN username VARCHAR(255);
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
