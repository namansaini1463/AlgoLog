package com.algolog.problem;

import com.algolog.problem.dto.ProblemBankDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class ProblemBankController {

    private final ProblemBankService problemBankService;

    @GetMapping
    public ResponseEntity<Page<ProblemBankDto>> browseProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(problemBankService.getPublishedProblems(topic, difficulty, category, search, pageable));
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAllTags() {
        return ResponseEntity.ok(problemBankService.getAllUniqueTags());
    }
}
