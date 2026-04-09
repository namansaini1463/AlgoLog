package com.algolog.admin;

import com.algolog.admin.dto.AdminAnalyticsDto;
import com.algolog.admin.dto.UserSummaryDto;
import com.algolog.problem.ProblemBankService;
import com.algolog.problem.dto.ProblemBankDto;
import com.algolog.problem.dto.ProblemBankRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProblemBankService problemBankService;

    // --- Problem Bank CRUD ---

    @GetMapping("/bank")
    public ResponseEntity<Page<ProblemBankDto>> getAllProblems(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(problemBankService.getAllProblems(pageable));
    }

    @PostMapping("/bank")
    public ResponseEntity<ProblemBankDto> createProblem(@Valid @RequestBody ProblemBankRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemBankService.create(request));
    }

    @PutMapping("/bank/{id}")
    public ResponseEntity<ProblemBankDto> updateProblem(@PathVariable UUID id, @Valid @RequestBody ProblemBankRequest request) {
        return ResponseEntity.ok(problemBankService.update(id, request));
    }

    @DeleteMapping("/bank/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable UUID id) {
        problemBankService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/bank/{id}/publish")
    public ResponseEntity<ProblemBankDto> togglePublish(@PathVariable UUID id) {
        return ResponseEntity.ok(problemBankService.togglePublish(id));
    }

    // --- Users & Analytics ---

    @GetMapping("/users")
    public ResponseEntity<Page<UserSummaryDto>> getUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getUsers(pageable));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }
}
