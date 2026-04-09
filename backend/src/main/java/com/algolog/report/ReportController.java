package com.algolog.report;

import com.algolog.report.dto.ReportDto;
import com.algolog.report.dto.ReportRequest;
import com.algolog.report.dto.ReportStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/api/reports")
    public ResponseEntity<ReportDto> createReport(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.createReport(userId, request));
    }

    @GetMapping("/api/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportDto>> getPendingReports(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(reportService.getPendingReports(pageable));
    }

    @PutMapping("/api/admin/reports/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportDto> updateReportStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ReportStatusRequest request) {
        return ResponseEntity.ok(reportService.updateStatus(id, request.getStatus()));
    }
}
