package com.algolog.revision.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevisionItemDto {

    private UUID userProblemId;
    private UUID revisionId;
    private String problemTitle;
    private String difficulty;
    private String topic;
    private List<String> tags;
    private String platform;
    private String platformUrl;
    private String oneLiner;
    private String detailedNotes;
    private LocalDateTime nextDueAt;
    private LocalDateTime lastReviewedAt;
    private int daysOverdue;
    private int timesRevised;
    private Integer lastConfidence;
    private int streakCount;
    private int intervalDays;
    @JsonProperty("isFlagged")
    private boolean isFlagged;
    private String flaggedNote;
    @JsonProperty("isSnoozed")
    private boolean isSnoozed;
    private String revisionState;  // OVERDUE, DUE_TODAY, UPCOMING, FLAGGED
}
