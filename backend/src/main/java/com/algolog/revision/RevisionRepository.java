package com.algolog.revision;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RevisionRepository extends JpaRepository<Revision, UUID> {

    Optional<Revision> findByUserProblemId(UUID userProblemId);

    @Query("SELECT r FROM Revision r " +
           "JOIN r.userProblem up " +
           "WHERE up.user.id = :userId AND r.nextDueAt <= :now " +
           "ORDER BY r.nextDueAt ASC")
    List<Revision> findDueRevisions(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    // Flagged problems for a user
    @Query("SELECT r FROM Revision r " +
           "JOIN FETCH r.userProblem up " +
           "LEFT JOIN FETCH up.bankProblem " +
           "WHERE up.user.id = :userId AND r.isFlagged = true " +
           "ORDER BY r.flaggedAt DESC")
    List<Revision> findFlaggedByUserId(@Param("userId") UUID userId);

    // Overdue (not flagged): next_due_at < start of today
    @Query("SELECT r FROM Revision r " +
           "JOIN FETCH r.userProblem up " +
           "LEFT JOIN FETCH up.bankProblem " +
           "WHERE up.user.id = :userId AND r.isFlagged = false " +
           "AND r.nextDueAt < :startOfToday " +
           "ORDER BY r.nextDueAt ASC")
    List<Revision> findOverdueByUserId(@Param("userId") UUID userId, @Param("startOfToday") LocalDateTime startOfToday);

    // Due today (not flagged)
    @Query("SELECT r FROM Revision r " +
           "JOIN FETCH r.userProblem up " +
           "LEFT JOIN FETCH up.bankProblem " +
           "WHERE up.user.id = :userId AND r.isFlagged = false " +
           "AND r.nextDueAt >= :startOfToday AND r.nextDueAt < :endOfToday " +
           "ORDER BY r.nextDueAt ASC")
    List<Revision> findDueTodayByUserId(@Param("userId") UUID userId,
                                         @Param("startOfToday") LocalDateTime startOfToday,
                                         @Param("endOfToday") LocalDateTime endOfToday);

    // Upcoming next 7 days (not flagged, excludes never-reviewed per spec edge case #7)
    @Query("SELECT r FROM Revision r " +
           "JOIN FETCH r.userProblem up " +
           "LEFT JOIN FETCH up.bankProblem " +
           "WHERE up.user.id = :userId AND r.isFlagged = false " +
           "AND r.lastReviewedAt IS NOT NULL " +
           "AND r.nextDueAt >= :endOfToday AND r.nextDueAt < :endOfWeek " +
           "ORDER BY r.nextDueAt ASC")
    List<Revision> findUpcoming7DaysByUserId(@Param("userId") UUID userId,
                                              @Param("endOfToday") LocalDateTime endOfToday,
                                              @Param("endOfWeek") LocalDateTime endOfWeek);

    // All scheduled for a user (paginated) - use countQuery to avoid FETCH+Pageable issue
    @Query(value = "SELECT r FROM Revision r " +
           "JOIN FETCH r.userProblem up " +
           "LEFT JOIN FETCH up.bankProblem " +
           "WHERE up.user.id = :userId " +
           "ORDER BY r.nextDueAt ASC",
           countQuery = "SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId")
    Page<Revision> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    // Stats counts
    @Query("SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId AND r.isFlagged = true")
    long countFlaggedByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId AND r.isFlagged = false AND r.nextDueAt < :startOfToday")
    long countOverdueByUserId(@Param("userId") UUID userId, @Param("startOfToday") LocalDateTime startOfToday);

    @Query("SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId AND r.isFlagged = false AND r.nextDueAt >= :startOfToday AND r.nextDueAt < :endOfToday")
    long countDueTodayByUserId(@Param("userId") UUID userId, @Param("startOfToday") LocalDateTime startOfToday, @Param("endOfToday") LocalDateTime endOfToday);

    @Query("SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId AND r.nextDueAt >= :startOfToday AND r.nextDueAt < :endOfWeek")
    long countThisWeekByUserId(@Param("userId") UUID userId, @Param("startOfToday") LocalDateTime startOfToday, @Param("endOfWeek") LocalDateTime endOfWeek);

    @Query("SELECT COUNT(r) FROM Revision r JOIN r.userProblem up WHERE up.user.id = :userId")
    long countTotalByUserId(@Param("userId") UUID userId);
}
