package com.algolog.activity;

import com.algolog.activity.dto.HeatmapEntry;
import com.algolog.activity.dto.StreakDto;
import com.algolog.user.User;
import com.algolog.user.UserService;
import com.algolog.userProblem.UserProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserProblemRepository userProblemRepository;
    private final UserService userService;

    /**
     * Called when a user logs a NEW problem (not a revision).
     * Increments problems_count for today.
     */
    @Transactional
    public void recordActivity(UUID userId) {
        ActivityLog log = getOrCreateTodayLog(userId);
        log.setProblemsCount(log.getProblemsCount() + 1);
        activityLogRepository.save(log);
    }

    /**
     * Called when a user completes a revision.
     * Increments revisions_count for today (NOT problems_count).
     */
    @Transactional
    public void recordRevisionActivity(UUID userId) {
        ActivityLog log = getOrCreateTodayLog(userId);
        log.setRevisionsCount(log.getRevisionsCount() + 1);
        activityLogRepository.save(log);
    }

    private ActivityLog getOrCreateTodayLog(UUID userId) {
        User user = userService.findById(userId);
        LocalDate today = LocalDate.now();

        return activityLogRepository.findByUserIdAndLogDate(userId, today)
                .orElse(ActivityLog.builder()
                        .user(user)
                        .logDate(today)
                        .problemsCount(0)
                        .revisionsCount(0)
                        .streakDay(0)
                        .build());
    }

    public List<HeatmapEntry> getHeatmap(UUID userId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(364);

        List<ActivityLog> logs = activityLogRepository
                .findByUserIdAndDateRange(userId, startDate, endDate);

        Map<LocalDate, Integer> logMap = logs.stream()
                .collect(Collectors.toMap(
                        ActivityLog::getLogDate,
                        al -> al.getProblemsCount() + al.getRevisionsCount()
                ));

        List<HeatmapEntry> heatmap = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            heatmap.add(HeatmapEntry.builder()
                    .date(date)
                    .count(logMap.getOrDefault(date, 0))
                    .build());
        }
        return heatmap;
    }

    public StreakDto getStreak(UUID userId) {
        List<ActivityLog> activeDays = activityLogRepository.findActiveDaysByUserId(userId);

        // Total solved = actual problem count from user_problems table (not inflated by revisions)
        long totalSolved = userProblemRepository.countByUserId(userId);

        // Total revised = sum of all revision activity across all days
        long totalRevised = activeDays.stream()
                .mapToLong(ActivityLog::getRevisionsCount)
                .sum();

        if (activeDays.isEmpty()) {
            return StreakDto.builder()
                    .currentStreak(0).longestStreak(0)
                    .totalSolved(totalSolved).totalRevised(totalRevised)
                    .build();
        }

        // activeDays is sorted DESC by logDate
        List<LocalDate> dates = activeDays.stream()
                .map(ActivityLog::getLogDate)
                .sorted()
                .toList();

        int longestStreak = 0;
        int streak = 1;

        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i).minusDays(1).equals(dates.get(i - 1))) {
                streak++;
            } else {
                longestStreak = Math.max(longestStreak, streak);
                streak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, streak);

        // Current streak: count backwards from today
        LocalDate today = LocalDate.now();
        LocalDate check = today;
        int currentStreak = 0;
        Set<LocalDate> dateSet = new HashSet<>(dates);
        while (dateSet.contains(check)) {
            currentStreak++;
            check = check.minusDays(1);
        }

        return StreakDto.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalSolved(totalSolved)
                .totalRevised(totalRevised)
                .build();
    }
}
