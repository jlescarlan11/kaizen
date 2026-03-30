package com.kaizen.backend.category;

import com.kaizen.backend.common.entity.TransactionType;
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
        "paw-print",
        "briefcase",
        "trending-up",
        "piggy-bank",
        "landmark"
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
        // Expenses
        new CategoryTemplate("Housing", "home", "#1d4ed8", TransactionType.EXPENSE),
        new CategoryTemplate("Food", "utensils", "#ea580c", TransactionType.EXPENSE),
        new CategoryTemplate("Transport", "car", "#059669", TransactionType.EXPENSE),
        new CategoryTemplate("Utilities", "bolt", "#d97706", TransactionType.EXPENSE),
        new CategoryTemplate("Health", "heartbeat", "#b91c1c", TransactionType.EXPENSE),
        new CategoryTemplate("Entertainment", "film", "#7c3aed", TransactionType.EXPENSE),
        new CategoryTemplate("Education", "book", "#2563eb", TransactionType.EXPENSE),
        new CategoryTemplate("Savings", "wallet", "#0f766e", TransactionType.EXPENSE),
        new CategoryTemplate("Bills", "receipt", "#475569", TransactionType.EXPENSE),
        new CategoryTemplate("Subscriptions", "credit-card", "#4f46e5", TransactionType.EXPENSE),
        new CategoryTemplate("Shopping", "shopping-bag", "#db2777", TransactionType.EXPENSE),
        new CategoryTemplate("Travel", "plane", "#0891b2", TransactionType.EXPENSE),
        new CategoryTemplate("Family", "users", "#65a30d", TransactionType.EXPENSE),
        new CategoryTemplate("Personal Care", "sparkles", "#c2410c", TransactionType.EXPENSE),
        new CategoryTemplate("Debt", "banknote", "#0f172a", TransactionType.EXPENSE),
        new CategoryTemplate("Emergency Fund", "shield", "#be123c", TransactionType.EXPENSE),
        
        // Income
        new CategoryTemplate("Salary", "briefcase", "#059669", TransactionType.INCOME),
        new CategoryTemplate("Bonus", "sparkles", "#7c3aed", TransactionType.INCOME),
        new CategoryTemplate("Freelance", "laptop", "#2563eb", TransactionType.INCOME),
        new CategoryTemplate("Business", "landmark", "#ea580c", TransactionType.INCOME),
        new CategoryTemplate("Investment", "trending-up", "#0f766e", TransactionType.INCOME),
        new CategoryTemplate("Other Income", "piggy-bank", "#475569", TransactionType.INCOME),

        // Initial Balance
        new CategoryTemplate("Initial Setup", "wallet", "#1d4ed8", TransactionType.INITIAL_BALANCE)
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

    public static record CategoryTemplate(String name, String icon, String color, TransactionType type) {}

    public static record IconColor(String icon, String color) {}
}
