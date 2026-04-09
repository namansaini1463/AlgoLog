package com.algolog.userProblem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserProblemRepository extends JpaRepository<UserProblem, UUID> {

    Page<UserProblem> findByUserId(UUID userId, Pageable pageable);

    List<UserProblem> findByUserId(UUID userId);

    Optional<UserProblem> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndBankProblemId(UUID userId, UUID bankProblemId);

    long countByUserId(UUID userId);
}
