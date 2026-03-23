package com.kaizen.backend.category;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CategoryDesignSystemTests {

    @Test
    void defaultCategoriesHaveUniqueIconColorPairs() {
        Set<String> combinations = new HashSet<>();
        for (CategoryDesignSystem.CategoryTemplate template : CategoryDesignSystem.DEFAULT_CATEGORIES) {
            String combo = template.icon() + "|" + template.color();
            assertTrue(combinations.add(combo), () -> "Duplicate icon/color in default categories: " + combo);
        }
    }

    @Test
    void defaultDesignsUseApprovedPalette() {
        for (CategoryDesignSystem.CategoryTemplate template : CategoryDesignSystem.DEFAULT_CATEGORIES) {
            assertTrue(CategoryDesignSystem.ICON_SEQUENCE.contains(template.icon()),
                () -> "Default category uses unknown icon: " + template.icon());
            assertTrue(CategoryDesignSystem.COLOR_PALETTE.contains(template.color()),
                () -> "Default category uses unknown color: " + template.color());
        }
    }
}
