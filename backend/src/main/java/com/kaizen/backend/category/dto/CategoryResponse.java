package com.kaizen.backend.category.dto;

public record CategoryResponse(
    Long id,
    String name,
    boolean isGlobal,
    String icon,
    String color
) {}
