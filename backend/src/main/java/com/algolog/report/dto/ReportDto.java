package com.algolog.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {

    private UUID id;
    private UUID userId;
    private String userEmail;
    private UUID bankProblemId;
    private String problemTitle;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
}
