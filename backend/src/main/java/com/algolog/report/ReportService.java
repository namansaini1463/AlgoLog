package com.algolog.report;

import com.algolog.exception.ResourceNotFoundException;
import com.algolog.problem.ProblemBank;
import com.algolog.problem.ProblemBankService;
import com.algolog.report.dto.ReportDto;
import com.algolog.report.dto.ReportRequest;
import com.algolog.user.User;
import com.algolog.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;
    private final ProblemBankService problemBankService;

    public ReportDto createReport(UUID userId, ReportRequest request) {
        User user = userService.findById(userId);
        ProblemBank problem = problemBankService.findById(request.getBankProblemId());

        ReportedProblem report = ReportedProblem.builder()
                .user(user)
                .bankProblem(problem)
                .reason(request.getReason())
                .build();

        return toDto(reportRepository.save(report));
    }

    public Page<ReportDto> getPendingReports(Pageable pageable) {
        return reportRepository.findByStatus("PENDING", pageable).map(this::toDto);
    }

    public ReportDto updateStatus(UUID reportId, String status) {
        ReportedProblem report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        report.setStatus(status);
        return toDto(reportRepository.save(report));
    }

    private ReportDto toDto(ReportedProblem report) {
        return ReportDto.builder()
                .id(report.getId())
                .userId(report.getUser().getId())
                .userEmail(report.getUser().getEmail())
                .bankProblemId(report.getBankProblem().getId())
                .problemTitle(report.getBankProblem().getTitle())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
