package com.kaizen.backend.category.dto;

import com.kaizen.backend.common.entity.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating a user-scoped category.
 */
public record CategoryCreateRequest(
    @NotBlank(message = "Category name is required.")
    @Size(max = 255, message = "Category name must be at most 255 characters.")
    String name,
    @NotBlank(message = "Icon selection is required.")
    @Size(max = 255, message = "Icon identifier must be at most 255 characters.")
    String icon,
    @Pattern(
        regexp = "^#[0-9A-Fa-f]{6}$",
        message = "Color must be a valid 6-digit hex value prefixed with '#'."
    )
    String color,
    TransactionType type
) {}
