-- Separate revision completions from new problem solves
ALTER TABLE activity_log
    ADD COLUMN revisions_count INTEGER DEFAULT 0;
