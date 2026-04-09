package com.algolog.activity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakDto {

    private int currentStreak;
    private int longestStreak;
    private long totalSolved;
    private long totalRevised;
}
