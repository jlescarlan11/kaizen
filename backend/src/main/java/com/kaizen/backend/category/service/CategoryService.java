package com.kaizen.backend.category.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserAccountRepository userAccountRepository;
    private final com.kaizen.backend.transaction.repository.TransactionRepository transactionRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserAccountRepository userAccountRepository,
            com.kaizen.backend.transaction.repository.TransactionRepository transactionRepository) {
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

        List<Category> categories = categoryRepository.findAccessibleByIds(List.of(sourceId, targetId), user.getId());
        if (categories.size() < 2) {
            throw new CategoryNotFoundException();
        }

        Category sourceCategory = categories.stream()
                .filter(c -> c.getId().equals(sourceId))
                .findFirst()
                .orElseThrow(CategoryNotFoundException::new);

        transactionRepository.updateCategoryId(sourceId, targetId);
        entityManager.flush();
        entityManager.clear();

        if (sourceCategory != null) {
            categoryRepository.delete(sourceCategory);
        }
        entityManager.flush();

        if (transactionRepository.existsByCategoryId(sourceId)) {
            throw new IllegalStateException(
                    "Referential integrity violation: transactions still reference the merged source category.");
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
                            template.color(),
                            template.type()));
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

        Category category = new Category(normalizedName, false, user, request.icon(), request.color(), request.type());
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