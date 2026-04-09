package com.algolog.topic;

import com.algolog.topic.dto.TopicDto;
import com.algolog.topic.dto.TopicRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/topics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    public ResponseEntity<List<TopicDto>> getAll() {
        return ResponseEntity.ok(topicService.getAll());
    }

    @PostMapping
    public ResponseEntity<TopicDto> create(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicDto> update(@PathVariable UUID id, @Valid @RequestBody TopicRequest request) {
        return ResponseEntity.ok(topicService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
