package com.algolog.notification;

import com.algolog.notification.BrevoEmailService.ReminderData;
import com.algolog.notification.BrevoEmailService.ReminderProblem;
import com.algolog.problem.ProblemBank;
import com.algolog.revision.Revision;
import com.algolog.revision.RevisionRepository;
import com.algolog.user.NotificationPreferences;
import com.algolog.user.NotificationPreferencesRepository;
import com.algolog.user.User;
import com.algolog.userProblem.UserProblem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Runs every hour and sends revision reminder emails to users whose
 * configured reminder_time falls within the current hour in their timezone.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RevisionReminderScheduler {

    private final NotificationPreferencesRepository notificationPreferencesRepository;
    private final RevisionRepository revisionRepository;
    private final BrevoEmailService brevoEmailService;

    @Scheduled(cron = "0 0 * * * *")
    public void sendRevisionReminders() {
        if (!brevoEmailService.isConfigured()) {
            return;
        }

        log.info("Running revision reminder check...");

        List<NotificationPreferences> allEnabled = notificationPreferencesRepository.findAllWithEmailRemindersEnabled();
        int sentCount = 0;

        for (NotificationPreferences prefs : allEnabled) {
            try {
                if (shouldSendNow(prefs)) {
                    boolean sent = sendReminderForUser(prefs);
                    if (sent) sentCount++;
                }
            } catch (Exception e) {
                log.error("Failed to process reminder for user {}: {}", prefs.getUser().getId(), e.getMessage(), e);
            }
        }

        log.info("Revision reminders sent: {}", sentCount);
    }

    private boolean shouldSendNow(NotificationPreferences prefs) {
        try {
            ZoneId zone = ZoneId.of(prefs.getReminderTimezone());
            ZonedDateTime nowInUserZone = ZonedDateTime.now(zone);
            int userHour = nowInUserZone.getHour();
            int preferredHour = prefs.getReminderTime().getHour();
            return userHour == preferredHour;
        } catch (Exception e) {
            return ZonedDateTime.now(ZoneOffset.UTC).getHour() == 9;
        }
    }

    private boolean sendReminderForUser(NotificationPreferences prefs) {
        User user = prefs.getUser();
        UUID userId = user.getId();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        List<Revision> overdue = revisionRepository.findOverdueByUserId(userId, startOfToday);
        List<Revision> dueToday = revisionRepository.findDueTodayByUserId(userId, startOfToday, endOfToday);
        List<Revision> flagged = revisionRepository.findFlaggedByUserId(userId);

        int overdueCount = overdue.size();
        int dueTodayCount = dueToday.size();
        int flaggedCount = flagged.size();

        if (overdueCount == 0 && dueTodayCount == 0 && flaggedCount == 0) {
            return false;
        }

        // Build problem list (max 10 items for email)
        List<ReminderProblem> problems = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Revision r : flagged) {
            if (problems.size() >= 10) break;
            problems.add(toReminderProblem(r, today));
        }
        for (Revision r : overdue) {
            if (problems.size() >= 10) break;
            problems.add(toReminderProblem(r, today));
        }
        for (Revision r : dueToday) {
            if (problems.size() >= 10) break;
            problems.add(toReminderProblem(r, today));
        }

        int totalCount = overdueCount + dueTodayCount + flaggedCount;
        String subject = String.format("AlgoLog: You have %d revision%s waiting",
                totalCount, totalCount == 1 ? "" : "s");

        ReminderData data = new ReminderData(user.getUsername(), overdueCount, dueTodayCount, flaggedCount, problems);
        brevoEmailService.sendRevisionReminder(user.getEmail(), user.getUsername(), subject, data);
        return true;
    }

    private ReminderProblem toReminderProblem(Revision r, LocalDate today) {
        UserProblem up = r.getUserProblem();
        ProblemBank bp = up.getBankProblem();
        String title = bp != null ? bp.getTitle() : up.getCustomTitle();
        String difficulty = bp != null ? bp.getDifficulty() : up.getCustomDifficulty();
        String topic = bp != null ? bp.getTopic() : up.getCustomTopic();
        LocalDate dueDate = r.getNextDueAt().toLocalDate();
        int daysOver = (int) ChronoUnit.DAYS.between(dueDate, today);
        return new ReminderProblem(title, difficulty, topic, daysOver > 0, Math.max(0, daysOver));
    }
}
