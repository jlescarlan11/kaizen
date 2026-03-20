package com.kaizen.backend.category.service;

import com.kaizen.backend.category.dto.CategoryCreateRequest;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.exception.DuplicateCategoryException;
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
            // Seed default categories
            // [PLACEHOLDER] Confirmed list of default categories pending author confirmation.
            // Using temporary placeholders for now as per Instruction 1 constraints.
            categoryRepository.save(new Category("Housing", true, null, "home", "#3498db"));
            categoryRepository.save(new Category("Food", true, null, "utensils", "#e67e22"));
            categoryRepository.save(new Category("Transport", true, null, "car", "#f1c40f"));
            categoryRepository.save(new Category("Utilities", true, null, "bolt", "#9b59b6"));
            categoryRepository.save(new Category("Health", true, null, "heartbeat", "#e74c3c"));
            categoryRepository.save(new Category("Entertainment", true, null, "film", "#2ecc71"));
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

        Category category = new Category(normalizedName, false, user, request.icon(), request.color());
        return categoryRepository.save(category);
    }
}
