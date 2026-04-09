package com.algolog.revision;

import com.algolog.revision.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/revisions")
@RequiredArgsConstructor
public class RevisionController {

    private final RevisionService revisionService;

    @GetMapping("/due")
    public ResponseEntity<List<RevisionDto>> getDueRevisions(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(revisionService.getDueRevisions(userId));
    }

    @GetMapping("/queue")
    public ResponseEntity<RevisionQueueDto> getQueue(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(revisionService.getQueue(userId));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<Page<RevisionItemDto>> getScheduled(
            @AuthenticationPrincipal UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(revisionService.getScheduled(userId, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<RevisionStatsDto> getStats(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(revisionService.getStats(userId));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<RevisionDto> completeRevision(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody Map<String, Integer> body) {
        int confidence = body.getOrDefault("confidence", 3);
        return ResponseEntity.ok(revisionService.completeRevision(userId, id, confidence));
    }

    @PatchMapping("/{id}/snooze")
    public ResponseEntity<RevisionDto> snoozeRevision(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody SnoozeRequest request) {
        return ResponseEntity.ok(revisionService.snoozeRevision(userId, id, request.getDays()));
    }
}
