package com.algolog.userProblem;

import com.algolog.problem.ProblemBank;
import com.algolog.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_problem_id")
    private ProblemBank bankProblem;

    @Column(name = "custom_title")
    private String customTitle;

    @Column(name = "custom_url", length = 500)
    private String customUrl;

    @Column(name = "custom_topic", length = 100)
    private String customTopic;

    @Column(name = "custom_difficulty", length = 10)
    private String customDifficulty;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "custom_tags", columnDefinition = "text[]")
    private List<String> customTags;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String category = "DSA";

    @Column
    private Integer confidence;

    @Column(name = "one_liner", length = 500)
    private String oneLiner;

    @Column(name = "detailed_notes", columnDefinition = "text")
    private String detailedNotes;

    @Column(name = "time_taken_mins")
    private Integer timeTakenMins;

    @Column(name = "hints_used")
    @Builder.Default
    private Boolean hintsUsed = false;

    @CreationTimestamp
    @Column(name = "solved_at", updatable = false)
    private LocalDateTime solvedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
