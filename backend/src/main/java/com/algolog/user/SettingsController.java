package com.algolog.user;

import com.algolog.notification.BrevoEmailService;
import com.algolog.notification.BrevoEmailService.ReminderData;
import com.algolog.notification.BrevoEmailService.ReminderProblem;
import com.algolog.user.dto.NotificationPreferencesDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserService userService;
    private final NotificationPreferencesRepository notificationPreferencesRepository;
    private final BrevoEmailService brevoEmailService;

    @GetMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDto> getNotificationPreferences(@AuthenticationPrincipal UUID userId) {
        NotificationPreferences prefs = notificationPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaults(userId));
        return ResponseEntity.ok(toDto(prefs));
    }

    @PutMapping("/notifications")
    public ResponseEntity<NotificationPreferencesDto> updateNotificationPreferences(
            @AuthenticationPrincipal UUID userId,
            @RequestBody NotificationPreferencesDto dto) {
        NotificationPreferences prefs = notificationPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaults(userId));

        if (dto.getEmailReminders() != null) prefs.setEmailReminders(dto.getEmailReminders());
        if (dto.getReminderTime() != null) prefs.setReminderTime(dto.getReminderTime());
        if (dto.getReminderTimezone() != null) prefs.setReminderTimezone(dto.getReminderTimezone());

        return ResponseEntity.ok(toDto(notificationPreferencesRepository.save(prefs)));
    }

    /**
     * Sends a test email to the currently logged-in user with sample data.
     * Use this to verify Brevo integration and email template rendering.
     * Restricted to ADMIN users only.
     */
    @PostMapping("/test-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> sendTestEmail(@AuthenticationPrincipal UUID userId) {
        User user = userService.findById(userId);

        if (!brevoEmailService.isConfigured()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Brevo API key is not configured. Set brevo.api-key in application.properties."
            ));
        }

        // Sample data to showcase the template
        List<ReminderProblem> sampleProblems = List.of(
            new ReminderProblem("Two Sum", "EASY", "Arrays", false, 0),
            new ReminderProblem("LRU Cache", "MEDIUM", "Design", true, 3),
            new ReminderProblem("Merge K Sorted Lists", "HARD", "Heap", true, 7),
            new ReminderProblem("Word Ladder II", "HARD", "Graph", true, 2),
            new ReminderProblem("Longest Palindromic Substring", "MEDIUM", "Dynamic Programming", false, 0)
        );

        ReminderData data = new ReminderData(user.getUsername(), 3, 2, 1, sampleProblems);

        // Clear template cache so any recent edits to the .html file are picked up
        brevoEmailService.clearTemplateCache();

        brevoEmailService.sendRevisionReminder(
            user.getEmail(),
            user.getUsername(),
            "AlgoLog Test: You have 6 revisions waiting",
            data
        );

        return ResponseEntity.ok(Map.of(
            "message", "Test email sent to " + user.getEmail(),
            "note", "Check your inbox (and spam folder). It may take a minute to arrive."
        ));
    }

    private NotificationPreferences createDefaults(UUID userId) {
        User user = userService.findById(userId);
        NotificationPreferences prefs = NotificationPreferences.builder()
                .user(user)
                .build();
        return notificationPreferencesRepository.save(prefs);
    }

    private NotificationPreferencesDto toDto(NotificationPreferences prefs) {
        return NotificationPreferencesDto.builder()
                .emailReminders(prefs.getEmailReminders())
                .reminderTime(prefs.getReminderTime())
                .reminderTimezone(prefs.getReminderTimezone())
                .build();
    }
}
