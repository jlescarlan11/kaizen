package com.kaizen.backend.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.kaizen.backend.auth.config.AuthFlowProperties;
import org.junit.jupiter.api.Test;

class OAuthTokenCipherTest {

    private final OAuthTokenCipher cipher = new OAuthTokenCipher(
        new AuthFlowProperties(
            "http://localhost:5173/app",
            "http://localhost:5173/signup",
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
        )
    );

    @Test
    void encryptsAndDecryptsTokenCorrectly() {
        String originalToken = "google-access-token";
        String encryptedToken = cipher.encrypt(originalToken);

        assertNotNull(encryptedToken);
        assertTrue(encryptedToken.startsWith("v1:"));
        assertNotEquals(originalToken, encryptedToken);

        String decryptedToken = cipher.decrypt(encryptedToken);
        assertEquals(originalToken, decryptedToken);
    }

    @Test
    void returnsNullWhenEncryptingOrDecryptingMissingToken() {
        assertNull(cipher.encryptNullable(null));
        assertNull(cipher.encryptNullable(""));
        assertNull(cipher.encryptNullable("   "));

        assertNull(cipher.decryptNullable(null));
        assertNull(cipher.decryptNullable(""));
        assertNull(cipher.decryptNullable("   "));
    }

    @Test
    void throwsExceptionWhenDecryptingInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> cipher.decrypt("v2:something"));
        assertThrows(IllegalStateException.class, () -> cipher.decrypt("v1:not-base-64-@#$"));
        assertThrows(IllegalStateException.class, () -> cipher.decrypt("v1:YmFzZTY0")); // Too short for IV
    }
}
