package com.algolog.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsDto {

    private long totalUsers;
    private long totalProblems;
    private long activeToday;
    private List<TopicCount> topTopics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicCount {
        private String topic;
        private long count;
    }
}
