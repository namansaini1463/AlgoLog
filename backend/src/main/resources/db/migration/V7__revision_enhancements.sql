-- Revision system enhancements: flagging, tracking, snooze support

ALTER TABLE revisions
    ADD COLUMN is_flagged        BOOLEAN   DEFAULT FALSE,
    ADD COLUMN flagged_note      VARCHAR(500),
    ADD COLUMN flagged_at        TIMESTAMP,
    ADD COLUMN times_revised     INTEGER   DEFAULT 0,
    ADD COLUMN last_confidence   INTEGER,
    ADD COLUMN streak_count      INTEGER   DEFAULT 0,
    ADD COLUMN is_snoozed        BOOLEAN   DEFAULT FALSE,
    ADD COLUMN snoozed_at        DATE;

CREATE INDEX idx_revisions_user_flagged ON revisions(is_flagged) WHERE is_flagged = TRUE;

-- Notification preferences (stub for future use)
CREATE TABLE notification_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_reminders     BOOLEAN DEFAULT TRUE,
    reminder_time       TIME DEFAULT '09:00:00',
    reminder_timezone   VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at          TIMESTAMP DEFAULT NOW()
);
