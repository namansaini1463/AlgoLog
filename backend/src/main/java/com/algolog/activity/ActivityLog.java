package com.algolog.activity;

import com.algolog.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "activity_log", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "log_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "problems_count")
    @Builder.Default
    private Integer problemsCount = 0;

    @Column(name = "revisions_count")
    @Builder.Default
    private Integer revisionsCount = 0;

    @Column(name = "streak_day")
    @Builder.Default
    private Integer streakDay = 0;
}
