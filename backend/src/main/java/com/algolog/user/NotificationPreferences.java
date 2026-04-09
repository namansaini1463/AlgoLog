package com.algolog.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "email_reminders")
    @Builder.Default
    private Boolean emailReminders = true;

    @Column(name = "reminder_time")
    @Builder.Default
    private LocalTime reminderTime = LocalTime.of(9, 0);

    @Column(name = "reminder_timezone", length = 50)
    @Builder.Default
    private String reminderTimezone = "Asia/Kolkata";
}
