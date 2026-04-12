package com.kaizen.backend.category.config;

import com.kaizen.backend.category.service.CategoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CategoryDataInitializer {

    @Bean
    @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
    public CommandLineRunner initCategories(CategoryService categoryService) {
        return args -> {
            categoryService.ensureDefaultCategoriesExist();
        };
    }
}
