package com.algolog.problem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemBankRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    @NotBlank(message = "Difficulty is required")
    @Pattern(regexp = "EASY|MEDIUM|HARD", message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty;

    @NotBlank(message = "Topic is required")
    private String topic;

    private List<String> tags;
    private String platform;
    private String platformUrl;
    private String description;

    @Size(max = 50, message = "Category name must not exceed 50 characters")
    private String category;
}
