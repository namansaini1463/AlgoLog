package com.algolog.problem;

import com.algolog.exception.ResourceNotFoundException;
import com.algolog.problem.dto.ProblemBankDto;
import com.algolog.problem.dto.ProblemBankRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProblemBankService {

    private final ProblemBankRepository problemBankRepository;

    public Page<ProblemBankDto> getPublishedProblems(String topic, String difficulty, String category, String search, Pageable pageable) {
        return problemBankRepository.findPublishedWithFilters(topic, difficulty, category, search, pageable)
                .map(this::toDto);
    }

    public Page<ProblemBankDto> getAllProblems(Pageable pageable) {
        return problemBankRepository.findAll(pageable).map(this::toDto);
    }

    public ProblemBankDto getById(UUID id) {
        return toDto(findById(id));
    }

    public ProblemBank findById(UUID id) {
        return problemBankRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
    }

    public ProblemBankDto create(ProblemBankRequest request) {
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getTitle());
        }
        if (problemBankRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("A problem with this slug already exists");
        }

        // Auto-set topic to first tag for backward compatibility
        String topic = request.getTopic();
        if ((topic == null || topic.isBlank()) && request.getTags() != null && !request.getTags().isEmpty()) {
            topic = request.getTags().get(0);
        }

        ProblemBank problem = ProblemBank.builder()
                .title(request.getTitle())
                .slug(slug)
                .difficulty(request.getDifficulty())
                .topic(topic)
                .tags(request.getTags())
                .platform(request.getPlatform())
                .platformUrl(request.getPlatformUrl())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "DSA")
                .isPublished(false)
                .build();

        return toDto(problemBankRepository.save(problem));
    }

    public ProblemBankDto update(UUID id, ProblemBankRequest request) {
        ProblemBank problem = findById(id);
        
        // Auto-set topic to first tag for backward compatibility
        String topic = request.getTopic();
        if ((topic == null || topic.isBlank()) && request.getTags() != null && !request.getTags().isEmpty()) {
            topic = request.getTags().get(0);
        }
        
        problem.setTitle(request.getTitle());
        problem.setDifficulty(request.getDifficulty());
        problem.setTopic(topic);
        problem.setTags(request.getTags());
        problem.setPlatform(request.getPlatform());
        problem.setPlatformUrl(request.getPlatformUrl());
        problem.setDescription(request.getDescription());
        if (request.getCategory() != null) {
            problem.setCategory(request.getCategory());
        }
        return toDto(problemBankRepository.save(problem));
    }

    public void delete(UUID id) {
        if (!problemBankRepository.existsById(id)) {
            throw new ResourceNotFoundException("Problem not found");
        }
        problemBankRepository.deleteById(id);
    }

    public ProblemBankDto togglePublish(UUID id) {
        ProblemBank problem = findById(id);
        problem.setIsPublished(!problem.getIsPublished());
        return toDto(problemBankRepository.save(problem));
    }

    public List<String> getAllUniqueTags() {
        return problemBankRepository.findAllUniqueTags();
    }

    public ProblemBankDto toDto(ProblemBank problem) {
        return ProblemBankDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .slug(problem.getSlug())
                .difficulty(problem.getDifficulty())
                .topic(problem.getTopic())
                .tags(problem.getTags())
                .platform(problem.getPlatform())
                .platformUrl(problem.getPlatformUrl())
                .description(problem.getDescription())
                .category(problem.getCategory())
                .isPublished(problem.getIsPublished())
                .createdAt(problem.getCreatedAt())
                .updatedAt(problem.getUpdatedAt())
                .build();
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
