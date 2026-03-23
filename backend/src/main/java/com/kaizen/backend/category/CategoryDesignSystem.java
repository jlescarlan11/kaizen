package com.kaizen.backend.category;

import java.util.List;

/**
 * Shared definition of category icons, colors, and the default seed set.
 */
public final class CategoryDesignSystem {

    private CategoryDesignSystem() {
        // Utility class
    }

    public static final List<String> ICON_SEQUENCE = List.of(
        "home",
        "utensils",
        "car",
        "bolt",
        "heartbeat",
        "film",
        "book",
        "wallet",
        "receipt",
        "credit-card",
        "shopping-bag",
        "plane",
        "users",
        "sparkles",
        "banknote",
        "shield",
        "laptop",
        "gift",
        "dumbbell",
        "paw-print"
    );

    public static final List<String> COLOR_PALETTE = List.of(
        "#1d4ed8",
        "#ea580c",
        "#059669",
        "#b91c1c",
        "#7c3aed",
        "#0f766e",
        "#d97706",
        "#0f172a",
        "#2563eb",
        "#db2777",
        "#0891b2",
        "#4f46e5",
        "#65a30d",
        "#c2410c",
        "#475569",
        "#be123c"
    );

    // Dark mode palette variants must be defined here once PRD Open Question 8 confirms the scope.

    public static final List<CategoryTemplate> DEFAULT_CATEGORIES = List.of(
        new CategoryTemplate("Housing", "home", "#1d4ed8"),
        new CategoryTemplate("Food", "utensils", "#ea580c"),
        new CategoryTemplate("Transport", "car", "#059669"),
        new CategoryTemplate("Utilities", "bolt", "#d97706"),
        new CategoryTemplate("Health", "heartbeat", "#b91c1c"),
        new CategoryTemplate("Entertainment", "film", "#7c3aed"),
        new CategoryTemplate("Education", "book", "#2563eb"),
        new CategoryTemplate("Savings", "wallet", "#0f766e"),
        new CategoryTemplate("Bills", "receipt", "#475569"),
        new CategoryTemplate("Subscriptions", "credit-card", "#4f46e5"),
        new CategoryTemplate("Shopping", "shopping-bag", "#db2777"),
        new CategoryTemplate("Travel", "plane", "#0891b2"),
        new CategoryTemplate("Family", "users", "#65a30d"),
        new CategoryTemplate("Personal Care", "sparkles", "#c2410c"),
        new CategoryTemplate("Debt", "banknote", "#0f172a"),
        new CategoryTemplate("Emergency Fund", "shield", "#be123c")
    );

    public static IconColor autoAssign(int existingCustomCount) {
        int iconIndex = existingCustomCount % ICON_SEQUENCE.size();
        int colorIndex = existingCustomCount % COLOR_PALETTE.size();
        return new IconColor(ICON_SEQUENCE.get(iconIndex), COLOR_PALETTE.get(colorIndex));
    }

    public static boolean isValidIcon(String icon) {
        return ICON_SEQUENCE.contains(icon);
    }

    public static boolean isValidColor(String color) {
        return COLOR_PALETTE.contains(color);
    }

    public static record CategoryTemplate(String name, String icon, String color) {}

    public static record IconColor(String icon, String color) {}
}
