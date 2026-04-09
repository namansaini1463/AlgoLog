package com.algolog.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    Optional<ActivityLog> findByUserIdAndLogDate(UUID userId, LocalDate logDate);

    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND a.logDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.logDate ASC")
    List<ActivityLog> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
           "AND a.problemsCount > 0 ORDER BY a.logDate DESC")
    List<ActivityLog> findActiveDaysByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM ActivityLog a WHERE a.logDate = :date AND a.problemsCount > 0")
    long countActiveUsersOnDate(@Param("date") LocalDate date);
}
