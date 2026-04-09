package com.algolog.revision.dto;

import com.algolog.userProblem.dto.UserProblemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevisionDto {

    private UUID id;
    private UUID userProblemId;
    private UserProblemDto userProblem;
    private Integer intervalDays;
    private Integer repetitionCount;
    private Double easeFactor;
    private LocalDateTime lastReviewedAt;
    private LocalDateTime nextDueAt;
}
