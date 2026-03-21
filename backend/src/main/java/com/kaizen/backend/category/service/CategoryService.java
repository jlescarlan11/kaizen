package com.kaizen.backend.category.service;

import com.kaizen.backend.category.CategoryDesignSystem;
import com.kaizen.backend.category.dto.CategoryCreateRequest;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.exception.DuplicateCategoryException;
import com.kaizen.backend.category.exception.InvalidCategoryDesignException;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.user.entity.UserAccount;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.repository.UserAccountRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserAccountRepository userAccountRepository;

    public CategoryService(CategoryRepository categoryRepository, UserAccountRepository userAccountRepository) {
        this.categoryRepository = categoryRepository;
        this.userAccountRepository = userAccountRepository;
    }

    public List<Category> getVisibleCategories(Long userId) {
        return categoryRepository.findAllVisibleToUser(userId);
    }

    @Transactional
    public void ensureDefaultCategoriesExist() {
        if (categoryRepository.findByGlobalTrue().isEmpty()) {
            for (CategoryDesignSystem.CategoryTemplate template : CategoryDesignSystem.DEFAULT_CATEGORIES) {
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
    }

    @Transactional
    public Category createCategory(String email, CategoryCreateRequest request) {
        UserAccount user = userAccountRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ProfileNotFoundException("Profile not found for user."));

        String normalizedName = request.name().trim();
        // Inferred (per PRD Section 5 Story 7): duplicate name rejection is case-insensitive and user scoped.
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(user.getId(), normalizedName)) {
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
}
