package com.kaizen.backend.category.service;

import com.kaizen.backend.category.CategoryDesignSystem;
import com.kaizen.backend.category.dto.CategoryCreateRequest;
import com.kaizen.backend.category.dto.CategoryUpdateRequest;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.exception.CategoryNotFoundException;
import com.kaizen.backend.category.exception.DuplicateCategoryException;
import com.kaizen.backend.category.exception.InvalidCategoryDesignException;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserAccountRepository userAccountRepository;
    private final com.kaizen.backend.transaction.repository.TransactionRepository transactionRepository;

    public CategoryService(
        CategoryRepository categoryRepository,
        UserAccountRepository userAccountRepository,
        com.kaizen.backend.transaction.repository.TransactionRepository transactionRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.userAccountRepository = userAccountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Category> getVisibleCategories(Long userId) {
        return categoryRepository.findAllVisibleToUser(userId);
    }

    public long getTransactionCountForCategory(String email, Long categoryId) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        // Verify category is accessible to user
        categoryRepository.findAccessibleByIds(List.of(categoryId), user.getId())
            .stream()
            .findFirst()
            .orElseThrow(CategoryNotFoundException::new);

        return transactionRepository.countByCategoryId(categoryId);
    }

    @Transactional
    public void mergeCategories(String email, Long sourceId, Long targetId) {
        if (sourceId.equals(targetId)) {
            throw new IllegalArgumentException("Source and target category must be different.");
        }

        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        // Verify both categories are accessible to user
        List<Category> categories = categoryRepository.findAccessibleByIds(List.of(sourceId, targetId), user.getId());
        if (categories.size() < 2) {
            throw new CategoryNotFoundException();
        }

        Category sourceCategory = categories.stream()
            .filter(c -> c.getId().equals(sourceId))
            .findFirst()
            .orElseThrow();

        // Perform merge
        transactionRepository.updateCategoryId(sourceId, targetId);

        // Delete source category
        categoryRepository.delete(sourceCategory);

        // Instruction 9: Post-Merge Referential Integrity Enforcement
        // Verify no transactions still reference the source category
        if (transactionRepository.existsByCategoryId(sourceId)) {
            throw new IllegalStateException("Referential integrity violation: transactions still reference the merged source category.");
        }
    }

    @Transactional
    public void ensureDefaultCategoriesExist() {
        Set<String> existingDefaultNames = categoryRepository.findByGlobalTrue().stream()
            .map(Category::getName)
            .map(name -> name.trim().toLowerCase())
            .collect(Collectors.toSet());

        for (CategoryDesignSystem.CategoryTemplate template : CategoryDesignSystem.DEFAULT_CATEGORIES) {
            if (existingDefaultNames.contains(template.name().trim().toLowerCase())) {
                continue;
            }

            categoryRepository.save(
                new Category(
                    template.name(),
                    true,
                    null,
                    template.icon(),
                    template.color()
                )
            );
        }
    }

    @Transactional
    public Category createCategory(String email, CategoryCreateRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        String normalizedName = request.name().trim();
        if (categoryRepository.existsVisibleToUserByNameIgnoreCase(user.getId(), normalizedName)) {
            throw new DuplicateCategoryException();
        }

        if (!CategoryDesignSystem.isValidIcon(request.icon())) {
            throw new InvalidCategoryDesignException("icon", request.icon());
        }

        if (!CategoryDesignSystem.isValidColor(request.color())) {
            throw new InvalidCategoryDesignException("color", request.color());
        }

        Category category = new Category(normalizedName, false, user, request.icon(), request.color());
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(String email, Long categoryId, CategoryUpdateRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        Category category = categoryRepository.findByIdAndUserId(categoryId, user.getId())
            .orElseThrow(CategoryNotFoundException::new);

        String normalizedName = request.name().trim();
        if (categoryRepository.existsOtherVisibleToUserByNameIgnoreCase(user.getId(), categoryId, normalizedName)) {
            throw new DuplicateCategoryException();
        }

        if (!CategoryDesignSystem.isValidIcon(request.icon())) {
            throw new InvalidCategoryDesignException("icon", request.icon());
        }

        if (!CategoryDesignSystem.isValidColor(request.color())) {
            throw new InvalidCategoryDesignException("color", request.color());
        }

        category.setName(normalizedName);
        category.setIcon(request.icon());
        category.setColor(request.color());
        return category;
    }
}
