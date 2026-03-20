package com.kaizen.backend.category.service;

import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.repository.CategoryRepository;
import com.kaizen.backend.user.entity.UserAccount;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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
}
