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

    public TopicDto create(TopicRequest request) {
        if (topicRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Topic already exists");
        }
        Topic topic = Topic.builder()
                .name(request.getName())
                .colorHex(request.getColorHex())
                .build();
        return toDto(topicRepository.save(topic));
    }

    public TopicDto update(UUID id, TopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        topic.setName(request.getName());
        topic.setColorHex(request.getColorHex());
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
                .build();
    }
}
