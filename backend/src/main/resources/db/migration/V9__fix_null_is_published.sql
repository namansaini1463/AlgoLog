-- Update any NULL is_published values to false
UPDATE problem_bank SET is_published = FALSE WHERE is_published IS NULL;

-- Add NOT NULL constraint to prevent future NULL values
ALTER TABLE problem_bank ALTER COLUMN is_published SET NOT NULL;
ALTER TABLE problem_bank ALTER COLUMN is_published SET DEFAULT FALSE;
