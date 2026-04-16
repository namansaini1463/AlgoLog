package com.algolog.topic;

import com.algolog.exception.ResourceNotFoundException;
import com.algolog.topic.dto.TopicDto;
import com.algolog.topic.dto.TopicRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;

    public List<TopicDto> getAll() {
        return topicRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<TopicDto> getByCategory(String category) {
        return topicRepository.findByCategory(category).stream().map(this::toDto).toList();
    }

    public TopicDto create(TopicRequest request) {
        String category = request.getCategory() != null ? request.getCategory() : "DSA";
        if (topicRepository.existsByNameAndCategory(request.getName(), category)) {
            throw new IllegalArgumentException("Topic already exists in this category");
        }
        Topic topic = Topic.builder()
                .name(request.getName())
                .colorHex(request.getColorHex())
                .category(category)
                .build();
        return toDto(topicRepository.save(topic));
    }

    public TopicDto update(UUID id, TopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        topic.setName(request.getName());
        topic.setColorHex(request.getColorHex());
        if (request.getCategory() != null) {
            topic.setCategory(request.getCategory());
        }
        return toDto(topicRepository.save(topic));
    }

    public void delete(UUID id) {
        if (!topicRepository.existsById(id)) {
            throw new ResourceNotFoundException("Topic not found");
        }
        topicRepository.deleteById(id);
    }

    private TopicDto toDto(Topic topic) {
        return TopicDto.builder()
                .id(topic.getId())
                .name(topic.getName())
                .colorHex(topic.getColorHex())
                .category(topic.getCategory())
                .build();
    }
}
