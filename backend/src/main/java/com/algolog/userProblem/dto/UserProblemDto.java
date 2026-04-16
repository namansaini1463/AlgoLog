package com.algolog.userProblem.dto;

import com.algolog.problem.dto.ProblemBankDto;
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
public class UserProblemDto {

    private UUID id;
    private UUID bankProblemId;
    private String category;
    private ProblemBankDto problem;
    private String customTitle;
    private String customUrl;
    private String customTopic;
    private String customDifficulty;
    private List<String> customTags;
    private Integer confidence;
    private String oneLiner;
    private String detailedNotes;
    private Integer timeTakenMins;
    private Boolean hintsUsed;
    private LocalDateTime solvedAt;
    private LocalDateTime updatedAt;
    @JsonProperty("isFlagged")
    private boolean isFlagged;
    private String flaggedNote;
}
