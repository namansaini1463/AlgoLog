package com.algolog.userProblem;

import com.algolog.revision.RevisionService;
import com.algolog.revision.dto.FlagRequest;
import com.algolog.revision.dto.RevisionDto;
import com.algolog.userProblem.dto.UserProblemDto;
import com.algolog.userProblem.dto.UserProblemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class UserProblemController {

    private final UserProblemService userProblemService;
    private final RevisionService revisionService;

    @GetMapping
    public ResponseEntity<Page<UserProblemDto>> getProblems(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userProblemService.getUserProblems(userId, category, pageable));
    }

    @PostMapping
    public ResponseEntity<UserProblemDto> logProblem(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UserProblemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userProblemService.logProblem(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProblemDto> updateProblem(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody UserProblemRequest request) {
        return ResponseEntity.ok(userProblemService.updateProblem(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        userProblemService.deleteProblem(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/flag")
    public ResponseEntity<RevisionDto> flagProblem(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody FlagRequest request) {
        return ResponseEntity.ok(revisionService.flagProblem(userId, id, request.isFlagged(), request.getFlaggedNote()));
    }
}
