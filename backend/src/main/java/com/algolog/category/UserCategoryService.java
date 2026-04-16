package com.algolog.category;

import com.algolog.category.dto.ReorderRequest;
import com.algolog.category.dto.UserCategoryDto;
import com.algolog.category.dto.UserCategoryRequest;
import com.algolog.exception.ResourceNotFoundException;
import com.algolog.exception.UnauthorizedException;
import com.algolog.user.User;
import com.algolog.user.UserService;
import com.algolog.userProblem.UserProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserCategoryService {

    private final UserCategoryRepository userCategoryRepository;
    private final UserProblemRepository userProblemRepository;
    private final UserService userService;

    public List<UserCategoryDto> getUserCategories(UUID userId) {
        List<UserCategory> categories = userCategoryRepository.findByUserIdOrderBySortOrder(userId);
        if (categories.isEmpty()) {
            seedDefaults(userId);
            categories = userCategoryRepository.findByUserIdOrderBySortOrder(userId);
        }
        return categories.stream().map(this::toDto).toList();
    }

    @Transactional
    public void seedDefaults(UUID userId) {
        User user = userService.findById(userId);
        if (userCategoryRepository.countByUserId(userId) > 0) {
            return;
        }
        userCategoryRepository.save(UserCategory.builder()
                .user(user).name("DSA").colorHex("#3B82F6").sortOrder(0).build());
        userCategoryRepository.save(UserCategory.builder()
                .user(user).name("LLD").colorHex("#A855F7").sortOrder(1).build());
        userCategoryRepository.save(UserCategory.builder()
                .user(user).name("HLD").colorHex("#F97316").sortOrder(2).build());
    }

    public UserCategoryDto create(UUID userId, UserCategoryRequest request) {
        String name = request.getName().trim();
        if (userCategoryRepository.existsByUserIdAndName(userId, name)) {
            throw new IllegalArgumentException("Category '" + name + "' already exists");
        }

        User user = userService.findById(userId);
        int nextOrder = (int) userCategoryRepository.countByUserId(userId);

        UserCategory category = UserCategory.builder()
                .user(user)
                .name(name)
                .colorHex(request.getColorHex() != null ? request.getColorHex() : "#6C63FF")
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : nextOrder)
                .build();

        return toDto(userCategoryRepository.save(category));
    }

    @Transactional
    public UserCategoryDto update(UUID userId, UUID categoryId, UserCategoryRequest request) {
        UserCategory category = findByIdAndUser(categoryId, userId);
        String oldName = category.getName();
        String newName = request.getName().trim();

        // If name changed, check uniqueness and update user_problems
        if (!oldName.equals(newName)) {
            if (userCategoryRepository.existsByUserIdAndName(userId, newName)) {
                throw new IllegalArgumentException("Category '" + newName + "' already exists");
            }
            // Bulk-update user_problems.category for this user
            userProblemRepository.updateCategoryByUserIdAndCategory(userId, oldName, newName);
            category.setName(newName);
        }

        if (request.getColorHex() != null) {
            category.setColorHex(request.getColorHex());
        }
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        return toDto(userCategoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        UserCategory category = findByIdAndUser(categoryId, userId);

        // Check if any problems use this category
        long count = userProblemRepository.countByUserIdAndCategory(userId, category.getName());
        if (count > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete category '" + category.getName() + "' — it has " + count + " problem(s). Reassign them first.");
        }

        userCategoryRepository.delete(category);
    }

    @Transactional
    public void reorder(UUID userId, ReorderRequest request) {
        List<UUID> orderedIds = request.getOrderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            UserCategory category = findByIdAndUser(orderedIds.get(i), userId);
            category.setSortOrder(i);
            userCategoryRepository.save(category);
        }
    }

    private UserCategory findByIdAndUser(UUID categoryId, UUID userId) {
        return userCategoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private UserCategoryDto toDto(UserCategory category) {
        return UserCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .colorHex(category.getColorHex())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
