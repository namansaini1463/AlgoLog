package com.algolog.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {

    @NotNull(message = "Bank problem ID is required")
    private UUID bankProblemId;

    @NotBlank(message = "Reason is required")
    private String reason;
}
