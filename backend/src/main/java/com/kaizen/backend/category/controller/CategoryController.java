package com.kaizen.backend.category.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.category.service.CategoryService;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.service.UserAccountService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Category", description = "Category management.")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserAccountService userAccountService;

    public CategoryController(CategoryService categoryService, UserAccountService userAccountService) {
        this.categoryService = categoryService;
        this.userAccountService = userAccountService;
    }

    @Operation(
        summary = "Get all categories visible to user",
        description = "Returns a list of global categories and categories created by the authenticated user."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved categories.")
    @GetMapping
    public List<CategoryResponse> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;
        if (userDetails != null) {
            UserResponse user = userAccountService.getByEmail(userDetails.getUsername());
            userId = user.id();
        }

        return categoryService.getVisibleCategories(userId).stream()
            .map(c -> new CategoryResponse(
                c.getId(),
                c.getName(),
                c.isGlobal(),
                c.getIcon(),
                c.getColor()
            ))
            .collect(Collectors.toList());
    }
}
