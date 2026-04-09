-- Add OAuth fields to users table
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN oauth_provider VARCHAR(20),
    ADD COLUMN oauth_id VARCHAR(255);

-- Create index for faster OAuth lookups
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
