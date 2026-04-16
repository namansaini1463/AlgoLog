package com.algolog.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserCategoryRepository extends JpaRepository<UserCategory, UUID> {

    List<UserCategory> findByUserIdOrderBySortOrder(UUID userId);

    boolean existsByUserIdAndName(UUID userId, String name);

    Optional<UserCategory> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
