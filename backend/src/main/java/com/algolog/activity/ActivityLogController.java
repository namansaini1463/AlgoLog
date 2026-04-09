package com.algolog.activity;

import com.algolog.activity.dto.HeatmapEntry;
import com.algolog.activity.dto.StreakDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapEntry>> getHeatmap(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(activityLogService.getHeatmap(userId));
    }

    @GetMapping("/streak")
    public ResponseEntity<StreakDto> getStreak(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(activityLogService.getStreak(userId));
    }
}
