package com.algolog.revision;

import com.algolog.userProblem.UserProblem;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "revisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Revision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_problem_id", nullable = false, unique = true)
    private UserProblem userProblem;

    @Column(name = "interval_days")
    @Builder.Default
    private Integer intervalDays = 1;

    @Column(name = "repetition_count")
    @Builder.Default
    private Integer repetitionCount = 0;

    @Column(name = "ease_factor")
    @Builder.Default
    private Double easeFactor = 2.5;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "next_due_at", nullable = false)
    private LocalDateTime nextDueAt;

    @Column(name = "is_flagged")
    @Builder.Default
    private Boolean isFlagged = false;

    @Column(name = "flagged_note", length = 500)
    private String flaggedNote;

    @Column(name = "flagged_at")
    private LocalDateTime flaggedAt;

    @Column(name = "times_revised")
    @Builder.Default
    private Integer timesRevised = 0;

    @Column(name = "last_confidence")
    private Integer lastConfidence;

    @Column(name = "streak_count")
    @Builder.Default
    private Integer streakCount = 0;

    @Column(name = "is_snoozed")
    @Builder.Default
    private Boolean isSnoozed = false;

    @Column(name = "snoozed_at")
    private LocalDate snoozedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
