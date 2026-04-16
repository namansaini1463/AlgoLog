package com.algolog.topic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    Optional<Topic> findByName(String name);

    boolean existsByName(String name);

    List<Topic> findByCategory(String category);

    boolean existsByNameAndCategory(String name, String category);
}
