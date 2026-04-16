-- Create user_categories table
CREATE TABLE user_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(50) NOT NULL,
    color_hex   VARCHAR(7) NOT NULL DEFAULT '#6C63FF',
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);
CREATE INDEX idx_user_categories_user_id ON user_categories(user_id);

-- Drop hardcoded CHECK constraints from V10
ALTER TABLE problem_bank DROP CONSTRAINT IF EXISTS check_pb_category;
ALTER TABLE user_problems DROP CONSTRAINT IF EXISTS check_up_category;

-- Widen category columns from VARCHAR(10) to VARCHAR(50)
ALTER TABLE problem_bank ALTER COLUMN category TYPE VARCHAR(50);
ALTER TABLE user_problems ALTER COLUMN category TYPE VARCHAR(50);
ALTER TABLE topics ALTER COLUMN category TYPE VARCHAR(50);

-- Seed default categories for all existing users
INSERT INTO user_categories (user_id, name, color_hex, sort_order)
SELECT id, 'DSA', '#3B82F6', 0 FROM users
UNION ALL
SELECT id, 'LLD', '#A855F7', 1 FROM users
UNION ALL
SELECT id, 'HLD', '#F97316', 2 FROM users;
