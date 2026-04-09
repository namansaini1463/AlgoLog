package com.algolog.admin;

import com.algolog.activity.ActivityLogRepository;
import com.algolog.admin.dto.AdminAnalyticsDto;
import com.algolog.admin.dto.UserSummaryDto;
import com.algolog.problem.ProblemBankRepository;
import com.algolog.user.User;
import com.algolog.user.UserRepository;
import com.algolog.userProblem.UserProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProblemBankRepository problemBankRepository;
    private final UserProblemRepository userProblemRepository;
    private final ActivityLogRepository activityLogRepository;

    public Page<UserSummaryDto> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserSummary);
    }

    public AdminAnalyticsDto getAnalytics() {
        long totalUsers = userRepository.count();
        long totalProblems = problemBankRepository.count();
        long activeToday = activityLogRepository.countActiveUsersOnDate(LocalDate.now());

        // Top topics by problem count
        List<AdminAnalyticsDto.TopicCount> topTopics = problemBankRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        p -> p.getTopic(),
                        java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> AdminAnalyticsDto.TopicCount.builder()
                        .topic(e.getKey())
                        .count(e.getValue())
                        .build())
                .toList();

        return AdminAnalyticsDto.builder()
                .totalUsers(totalUsers)
                .totalProblems(totalProblems)
                .activeToday(activeToday)
                .topTopics(topTopics)
                .build();
    }

    private UserSummaryDto toUserSummary(User user) {
        long problemCount = userProblemRepository.countByUserId(user.getId());
        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .problemCount(problemCount)
                .lastActive(user.getUpdatedAt())
                .build();
    }
}
