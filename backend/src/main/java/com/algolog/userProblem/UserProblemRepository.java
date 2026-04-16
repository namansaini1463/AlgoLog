package com.algolog.userProblem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProblemRepository extends JpaRepository<UserProblem, UUID> {

    Page<UserProblem> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT up FROM UserProblem up WHERE up.user.id = :userId " +
           "AND (:category IS NULL OR up.category = :category)")
    Page<UserProblem> findByUserIdAndOptionalCategory(
            @Param("userId") UUID userId,
            @Param("category") String category,
            Pageable pageable);

    List<UserProblem> findByUserId(UUID userId);

    Optional<UserProblem> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndBankProblemId(UUID userId, UUID bankProblemId);

    long countByUserId(UUID userId);

    long countByUserIdAndCategory(UUID userId, String category);

    @Modifying
    @Query("UPDATE UserProblem up SET up.category = :newCategory " +
           "WHERE up.user.id = :userId AND up.category = :oldCategory")
    void updateCategoryByUserIdAndCategory(
            @Param("userId") UUID userId,
            @Param("oldCategory") String oldCategory,
            @Param("newCategory") String newCategory);
}
