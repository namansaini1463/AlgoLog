package com.algolog.revision;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class SpacedRepetitionService {

    public Revision calculate(Revision revision, int confidence) {
        int intervalDays;
        int repetitionCount = revision.getRepetitionCount();
        double easeFactor = revision.getEaseFactor();

        if (confidence < 3) {
            // Failed recall — reset
            intervalDays = 1;
            repetitionCount = 0;
        } else {
            // Successful recall
            if (repetitionCount == 0) {
                intervalDays = 1;
            } else if (repetitionCount == 1) {
                intervalDays = 3;
            } else {
                intervalDays = (int) Math.round(revision.getIntervalDays() * easeFactor);
            }
            repetitionCount += 1;
        }

        easeFactor = easeFactor + (0.1 - (5 - confidence) * (0.08 + (5 - confidence) * 0.02));
        easeFactor = Math.max(1.3, easeFactor);

        // Update SM-2 fields
        revision.setIntervalDays(intervalDays);
        revision.setRepetitionCount(repetitionCount);
        revision.setEaseFactor(easeFactor);
        revision.setLastReviewedAt(LocalDateTime.now());
        revision.setNextDueAt(LocalDateTime.now().plusDays(intervalDays));

        // Update tracking fields
        revision.setTimesRevised(revision.getTimesRevised() + 1);
        revision.setLastConfidence(confidence);

        // Update streak: on-time revision with confidence >= 3 continues streak
        if (confidence >= 3) {
            revision.setStreakCount(revision.getStreakCount() + 1);
        } else {
            revision.setStreakCount(0);
        }

        // Auto-clear flag on completion
        revision.setIsFlagged(false);
        revision.setFlaggedNote(null);
        revision.setFlaggedAt(null);

        // Clear snooze state
        revision.setIsSnoozed(false);
        revision.setSnoozedAt(null);

        return revision;
    }
}
