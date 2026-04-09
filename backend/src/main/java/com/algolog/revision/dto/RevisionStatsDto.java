package com.algolog.revision.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevisionStatsDto {

    private long flaggedCount;
    private long overdueCount;
    private long dueTodayCount;
    private long thisWeekCount;
    private long totalScheduled;
}
