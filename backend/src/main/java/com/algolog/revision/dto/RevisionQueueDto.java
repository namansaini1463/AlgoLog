package com.algolog.revision.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevisionQueueDto {

    private List<RevisionItemDto> flagged;
    private List<RevisionItemDto> overdue;
    private List<RevisionItemDto> dueToday;
    private List<RevisionItemDto> upcoming7Days;
    private RevisionStatsDto stats;
}
