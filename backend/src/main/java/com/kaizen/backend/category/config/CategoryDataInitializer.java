package com.kaizen.backend.category.config;

import com.kaizen.backend.category.service.CategoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CategoryDataInitializer {

    @Bean
    public CommandLineRunner initCategories(CategoryService categoryService) {
        return args -> {
            categoryService.ensureDefaultCategoriesExist();
        };
    }
}
