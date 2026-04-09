package com.algolog.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReportRepository extends JpaRepository<ReportedProblem, UUID> {

    Page<ReportedProblem> findByStatus(String status, Pageable pageable);
}
