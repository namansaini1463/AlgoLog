package com.algolog.problem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProblemBankRepository extends JpaRepository<ProblemBank, UUID> {

    Page<ProblemBank> findByIsPublishedTrue(Pageable pageable);

    @Query(value = "SELECT * FROM problem_bank p WHERE p.is_published = true " +
           "AND (:topic IS NULL OR :topic = '' OR p.topic = :topic) " +
           "AND (:difficulty IS NULL OR :difficulty = '' OR p.difficulty = :difficulty) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY p.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM problem_bank p WHERE p.is_published = true " +
           "AND (:topic IS NULL OR :topic = '' OR p.topic = :topic) " +
           "AND (:difficulty IS NULL OR :difficulty = '' OR p.difficulty = :difficulty) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<ProblemBank> findPublishedWithFilters(
            @Param("topic") String topic,
            @Param("difficulty") String difficulty,
            @Param("search") String search,
            Pageable pageable);

    @Query(value = "SELECT DISTINCT unnest(tags) as tag FROM problem_bank WHERE tags IS NOT NULL ORDER BY tag", nativeQuery = true)
    List<String> findAllUniqueTags();

    boolean existsBySlug(String slug);
}
