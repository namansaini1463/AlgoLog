package com.algolog.category;

import com.algolog.category.dto.ReorderRequest;
import com.algolog.category.dto.UserCategoryDto;
import com.algolog.category.dto.UserCategoryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class UserCategoryController {

    private final UserCategoryService userCategoryService;

    @GetMapping
    public ResponseEntity<List<UserCategoryDto>> getCategories(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(userCategoryService.getUserCategories(userId));
    }

    @PostMapping
    public ResponseEntity<UserCategoryDto> create(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UserCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userCategoryService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserCategoryDto> update(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody UserCategoryRequest request) {
        return ResponseEntity.ok(userCategoryService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id) {
        userCategoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(
            @AuthenticationPrincipal UUID userId,
            @RequestBody ReorderRequest request) {
        userCategoryService.reorder(userId, request);
        return ResponseEntity.noContent().build();
    }
}
