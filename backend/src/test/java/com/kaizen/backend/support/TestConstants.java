package com.kaizen.backend.support;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import java.util.Objects;

/**
 * Common media types used in integration tests.
 * This ensures null safety across all MockMvc tests and reduces duplication.
 */
public final class TestConstants {
    @NonNull
    public static final MediaType JSON_MEDIA_TYPE = Objects.requireNonNull(MediaType.APPLICATION_JSON);
    
    private TestConstants() {}
}
