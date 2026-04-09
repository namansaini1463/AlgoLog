package com.algolog.report.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatusRequest {

    @Pattern(regexp = "RESOLVED|DISMISSED", message = "Status must be RESOLVED or DISMISSED")
    private String status;
}
