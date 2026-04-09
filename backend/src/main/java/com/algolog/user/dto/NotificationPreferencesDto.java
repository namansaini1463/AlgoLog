package com.algolog.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferencesDto {

    private Boolean emailReminders;
    private LocalTime reminderTime;
    private String reminderTimezone;
}
