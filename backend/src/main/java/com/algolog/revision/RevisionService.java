package com.algolog.revision;

import com.algolog.activity.ActivityLogService;
import com.algolog.exception.ResourceNotFoundException;
import com.algolog.exception.UnauthorizedException;
import com.algolog.problem.ProblemBank;
import com.algolog.revision.dto.*;
import com.algolog.userProblem.UserProblem;
import com.algolog.userProblem.UserProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RevisionService {

    private final RevisionRepository revisionRepository;
    private final SpacedRepetitionService spacedRepetitionService;
    private final UserProblemService userProblemService;
    private final ActivityLogService activityLogService;

    // ── Legacy endpoint (kept for backward compat) ──

    public List<RevisionDto> getDueRevisions(UUID userId) {
        return revisionRepository.findDueRevisions(userId, LocalDateTime.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ── Queue ──

    public RevisionQueueDto getQueue(UUID userId) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime endOfWeek = LocalDate.now().plusDays(7).atTime(LocalTime.MAX);

        List<RevisionItemDto> flagged = revisionRepository.findFlaggedByUserId(userId)
                .stream().map(this::toItemDto).toList();
        List<RevisionItemDto> overdue = revisionRepository.findOverdueByUserId(userId, startOfToday)
                .stream().map(this::toItemDto).toList();
        List<RevisionItemDto> dueToday = revisionRepository.findDueTodayByUserId(userId, startOfToday, endOfToday)
                .stream().map(this::toItemDto).toList();
        List<RevisionItemDto> upcoming = revisionRepository.findUpcoming7DaysByUserId(userId, endOfToday, endOfWeek)
                .stream().map(this::toItemDto).toList();

        RevisionStatsDto stats = getStats(userId);

        return RevisionQueueDto.builder()
                .flagged(flagged)
                .overdue(overdue)
                .dueToday(dueToday)
                .upcoming7Days(upcoming)
                .stats(stats)
                .build();
    }

    // ── Scheduled (paginated) ──

    public Page<RevisionItemDto> getScheduled(UUID userId, Pageable pageable) {
        return revisionRepository.findAllByUserId(userId, pageable).map(this::toItemDto);
    }

    // ── Complete ──

    @Transactional
    public RevisionDto completeRevision(UUID userId, UUID revisionId, int confidence) {
        Revision revision = findAndAuthorize(revisionId, userId);

        revision = spacedRepetitionService.calculate(revision, confidence);
        Revision saved = revisionRepository.save(revision);

        activityLogService.recordRevisionActivity(userId);

        return toDto(saved);
    }

    // ── Flag ──

    @Transactional
    public RevisionDto flagProblem(UUID userId, UUID userProblemId, boolean isFlagged, String flaggedNote) {
        Revision revision = revisionRepository.findByUserProblemId(userProblemId)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found for this problem"));

        if (!revision.getUserProblem().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this revision");
        }

        if (isFlagged) {
            revision.setIsFlagged(true);
            revision.setFlaggedNote(flaggedNote);
            revision.setFlaggedAt(LocalDateTime.now());
        } else {
            revision.setIsFlagged(false);
            revision.setFlaggedNote(null);
            revision.setFlaggedAt(null);
        }

        return toDto(revisionRepository.save(revision));
    }

    // ── Snooze ──

    @Transactional
    public RevisionDto snoozeRevision(UUID userId, UUID revisionId, int days) {
        Revision revision = findAndAuthorize(revisionId, userId);

        // Prevent snooping if already snoozed today
        if (revision.getIsSnoozed() && LocalDate.now().equals(revision.getSnoozedAt())) {
            throw new IllegalArgumentException("Already snoozed today");
        }

        // Snooze from now, not from original due date
        revision.setNextDueAt(LocalDateTime.now().plusDays(days));
        revision.setIsSnoozed(true);
        revision.setSnoozedAt(LocalDate.now());

        return toDto(revisionRepository.save(revision));
    }

    // ── Stats ──

    public RevisionStatsDto getStats(UUID userId) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime endOfWeek = LocalDate.now().plusDays(7).atTime(LocalTime.MAX);

        return RevisionStatsDto.builder()
                .flaggedCount(revisionRepository.countFlaggedByUserId(userId))
                .overdueCount(revisionRepository.countOverdueByUserId(userId, startOfToday))
                .dueTodayCount(revisionRepository.countDueTodayByUserId(userId, startOfToday, endOfToday))
                .thisWeekCount(revisionRepository.countThisWeekByUserId(userId, startOfToday, endOfWeek))
                .totalScheduled(revisionRepository.countTotalByUserId(userId))
                .build();
    }

    // ── Helpers ──

    private Revision findAndAuthorize(UUID revisionId, UUID userId) {
        Revision revision = revisionRepository.findById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found"));

        if (!revision.getUserProblem().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to modify this revision");
        }

        return revision;
    }

    private RevisionItemDto toItemDto(Revision revision) {
        UserProblem up = revision.getUserProblem();
        ProblemBank bp = up.getBankProblem();

        String title = bp != null ? bp.getTitle() : up.getCustomTitle();
        String difficulty = bp != null ? bp.getDifficulty() : up.getCustomDifficulty();
        String topic = bp != null ? bp.getTopic() : up.getCustomTopic();
        List<String> tags = bp != null ? bp.getTags() : up.getCustomTags();
        String platform = bp != null ? bp.getPlatform() : null;
        String platformUrl = bp != null ? bp.getPlatformUrl() : up.getCustomUrl();
        String category = up.getCategory();

        LocalDate today = LocalDate.now();
        LocalDate dueDate = revision.getNextDueAt().toLocalDate();
        int daysOverdue = (int) ChronoUnit.DAYS.between(dueDate, today);

        String state;
        if (revision.getIsFlagged()) {
            state = "FLAGGED";
        } else if (daysOverdue > 0) {
            state = "OVERDUE";
        } else if (daysOverdue == 0) {
            state = "DUE_TODAY";
        } else {
            state = "UPCOMING";
        }

        return RevisionItemDto.builder()
                .userProblemId(up.getId())
                .revisionId(revision.getId())
                .problemTitle(title)
                .category(category)
                .difficulty(difficulty)
                .topic(topic)
                .tags(tags)
                .platform(platform)
                .platformUrl(platformUrl)
                .oneLiner(up.getOneLiner())
                .detailedNotes(up.getDetailedNotes())
                .nextDueAt(revision.getNextDueAt())
                .lastReviewedAt(revision.getLastReviewedAt())
                .daysOverdue(daysOverdue)
                .timesRevised(revision.getTimesRevised())
                .lastConfidence(revision.getLastConfidence())
                .streakCount(revision.getStreakCount())
                .intervalDays(revision.getIntervalDays())
                .isFlagged(revision.getIsFlagged())
                .flaggedNote(revision.getFlaggedNote())
                .isSnoozed(revision.getIsSnoozed())
                .revisionState(state)
                .build();
    }

    private RevisionDto toDto(Revision revision) {
        UserProblem up = revision.getUserProblem();
        return RevisionDto.builder()
                .id(revision.getId())
                .userProblemId(up.getId())
                .userProblem(userProblemService.toDto(up))
                .intervalDays(revision.getIntervalDays())
                .repetitionCount(revision.getRepetitionCount())
                .easeFactor(revision.getEaseFactor())
                .lastReviewedAt(revision.getLastReviewedAt())
                .nextDueAt(revision.getNextDueAt())
                .build();
    }
}
