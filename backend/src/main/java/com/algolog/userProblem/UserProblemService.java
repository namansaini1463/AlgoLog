package com.algolog.userProblem;

import com.algolog.activity.ActivityLogService;
import com.algolog.exception.ResourceNotFoundException;
import com.algolog.problem.ProblemBank;
import com.algolog.problem.ProblemBankService;
import com.algolog.revision.Revision;
import com.algolog.revision.RevisionRepository;
import com.algolog.user.User;
import com.algolog.user.UserService;
import com.algolog.userProblem.dto.UserProblemDto;
import com.algolog.userProblem.dto.UserProblemRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProblemService {

    private final UserProblemRepository userProblemRepository;
    private final RevisionRepository revisionRepository;
    private final ProblemBankService problemBankService;
    private final UserService userService;
    private final ActivityLogService activityLogService;

    public Page<UserProblemDto> getUserProblems(UUID userId, Pageable pageable) {
        return userProblemRepository.findByUserId(userId, pageable).map(this::toDto);
    }

    @Transactional
    public UserProblemDto logProblem(UUID userId, UserProblemRequest request) {
        boolean isCustom = request.getBankProblemId() == null;

        if (!isCustom) {
            if (userProblemRepository.existsByUserIdAndBankProblemId(userId, request.getBankProblemId())) {
                throw new IllegalArgumentException("Problem already tracked");
            }
        }

        if (isCustom && (request.getCustomTitle() == null || request.getCustomTitle().isBlank())) {
            throw new IllegalArgumentException("Problem name is required for custom problems");
        }

        User user = userService.findById(userId);
        ProblemBank bankProblem = isCustom ? null : problemBankService.findById(request.getBankProblemId());

        UserProblem userProblem = UserProblem.builder()
                .user(user)
                .bankProblem(bankProblem)
                .customTitle(request.getCustomTitle())
                .customUrl(request.getCustomUrl())
                .customTopic(request.getCustomTopic())
                .customDifficulty(request.getCustomDifficulty())
                .customTags(request.getCustomTags())
                .confidence(request.getConfidence())
                .oneLiner(request.getOneLiner())
                .detailedNotes(request.getDetailedNotes())
                .timeTakenMins(request.getTimeTakenMins())
                .hintsUsed(request.getHintsUsed() != null ? request.getHintsUsed() : false)
                .build();

        userProblem = userProblemRepository.save(userProblem);

        // Create initial revision entry
        Revision revision = Revision.builder()
                .userProblem(userProblem)
                .intervalDays(1)
                .repetitionCount(0)
                .easeFactor(2.5)
                .nextDueAt(LocalDateTime.now().plusDays(1))
                .build();
        revisionRepository.save(revision);

        // Record activity for streak/heatmap
        activityLogService.recordActivity(userId);

        return toDto(userProblem);
    }

    public UserProblemDto updateProblem(UUID userId, UUID problemId, UserProblemRequest request) {
        UserProblem userProblem = findByIdAndUser(problemId, userId);
        userProblem.setConfidence(request.getConfidence());
        userProblem.setOneLiner(request.getOneLiner());
        userProblem.setDetailedNotes(request.getDetailedNotes());
        userProblem.setTimeTakenMins(request.getTimeTakenMins());
        if (request.getHintsUsed() != null) {
            userProblem.setHintsUsed(request.getHintsUsed());
        }
        if (request.getCustomTags() != null) {
            userProblem.setCustomTags(request.getCustomTags());
        }
        if (request.getCustomTopic() != null) {
            userProblem.setCustomTopic(request.getCustomTopic());
        }
        if (request.getCustomDifficulty() != null) {
            userProblem.setCustomDifficulty(request.getCustomDifficulty());
        }
        return toDto(userProblemRepository.save(userProblem));
    }

    @Transactional
    public void deleteProblem(UUID userId, UUID problemId) {
        UserProblem userProblem = findByIdAndUser(problemId, userId);
        userProblemRepository.delete(userProblem);
    }

    private UserProblem findByIdAndUser(UUID problemId, UUID userId) {
        return userProblemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
    }

    public UserProblemDto toDto(UserProblem up) {
        ProblemBank bp = up.getBankProblem();

        // Look up revision for flag state
        boolean flagged = false;
        String flagNote = null;
        Revision rev = revisionRepository.findByUserProblemId(up.getId()).orElse(null);
        if (rev != null && Boolean.TRUE.equals(rev.getIsFlagged())) {
            flagged = true;
            flagNote = rev.getFlaggedNote();
        }

        return UserProblemDto.builder()
                .id(up.getId())
                .bankProblemId(bp != null ? bp.getId() : null)
                .problem(bp != null ? problemBankService.toDto(bp) : null)
                .customTitle(up.getCustomTitle())
                .customUrl(up.getCustomUrl())
                .customTopic(up.getCustomTopic())
                .customDifficulty(up.getCustomDifficulty())
                .customTags(up.getCustomTags())
                .confidence(up.getConfidence())
                .oneLiner(up.getOneLiner())
                .detailedNotes(up.getDetailedNotes())
                .timeTakenMins(up.getTimeTakenMins())
                .hintsUsed(up.getHintsUsed())
                .solvedAt(up.getSolvedAt())
                .updatedAt(up.getUpdatedAt())
                .isFlagged(flagged)
                .flaggedNote(flagNote)
                .build();
    }
}
