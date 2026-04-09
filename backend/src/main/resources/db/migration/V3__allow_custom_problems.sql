-- Allow user problems without a bank entry (custom problems)
ALTER TABLE user_problems ALTER COLUMN bank_problem_id DROP NOT NULL;

-- Add custom problem fields
ALTER TABLE user_problems ADD COLUMN custom_title VARCHAR(255);
ALTER TABLE user_problems ADD COLUMN custom_url VARCHAR(500);

-- Drop the old unique constraint (requires bank_problem_id) and add a partial one
ALTER TABLE user_problems DROP CONSTRAINT IF EXISTS user_problems_user_id_bank_problem_id_key;

-- Only enforce uniqueness when bank_problem_id is present
CREATE UNIQUE INDEX uq_user_bank_problem
    ON user_problems (user_id, bank_problem_id)
    WHERE bank_problem_id IS NOT NULL;
