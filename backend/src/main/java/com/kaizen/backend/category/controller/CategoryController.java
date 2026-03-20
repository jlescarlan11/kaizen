package com.kaizen.backend.category.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kaizen.backend.category.dto.CategoryCreateRequest;
import com.kaizen.backend.category.dto.CategoryResponse;
import com.kaizen.backend.category.entity.Category;
import com.kaizen.backend.category.service.CategoryService;
import com.kaizen.backend.common.dto.ErrorResponse;
import com.kaizen.backend.user.dto.UserResponse;
import com.kaizen.backend.user.exception.ProfileNotFoundException;
import com.kaizen.backend.user.service.UserAccountService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

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
            .map(this::mapCategory)
            .collect(Collectors.toList());
    }

    @Operation(
        summary = "Create a custom category",
        description = "Creates a user-scoped category that will appear alongside the default categories."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Category created successfully.",
            content = @Content(schema = @Schema(implementation = CategoryResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Payload validation failed.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "User is unauthenticated.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User profile not found.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Category name already exists for the current user.",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
        )
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CategoryCreateRequest request
    ) {
        if (userDetails == null) {
            throw new ProfileNotFoundException();
        }

        CategoryResponse response = mapCategory(categoryService.createCategory(userDetails.getUsername(), request));
        return response;
    }

    private CategoryResponse mapCategory(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.isGlobal(),
            category.getIcon(),
            category.getColor()
        );
    }
}
