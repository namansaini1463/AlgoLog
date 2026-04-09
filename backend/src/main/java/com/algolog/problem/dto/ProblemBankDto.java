package com.algolog.problem.dto;

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
public class ProblemBankDto {

    private UUID id;
    private String title;
    private String slug;
    private String difficulty;
    private String topic;
    private List<String> tags;
    private String platform;
    private String platformUrl;
    private String description;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
