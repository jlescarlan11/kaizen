package com.kaizen.backend.user.entity;

import java.util.Arrays;
import java.util.Optional;

public enum FundingSourceType {
    CASH_ON_HAND("Cash on hand"),
    BANK_ACCOUNT("Bank account"),
    E_WALLET("E-wallet");

    private final String defaultName;

    FundingSourceType(String defaultName) {
        this.defaultName = defaultName;
    }

    public String defaultName() {
        return defaultName;
    }

    public static Optional<FundingSourceType> fromValue(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        return Arrays.stream(values())
            .filter(type -> type.name().equalsIgnoreCase(value.trim()))
            .findFirst();
    }
}
