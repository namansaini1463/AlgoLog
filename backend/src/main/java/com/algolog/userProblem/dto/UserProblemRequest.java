package com.algolog.userProblem.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProblemRequest {

    // Option 1: from bank
    private UUID bankProblemId;

    // Option 2: custom problem
    private String customTitle;
    private String customUrl;
    private String customTopic;
    private String customDifficulty;
    private List<String> customTags;

    @Min(1) @Max(5)
    private Integer confidence;

    private String oneLiner;
    private String detailedNotes;
    private Integer timeTakenMins;
    private Boolean hintsUsed;
}
