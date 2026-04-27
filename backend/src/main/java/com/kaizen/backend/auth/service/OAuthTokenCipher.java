package com.kaizen.backend.auth.service;

import com.kaizen.backend.auth.config.AuthFlowProperties;
import jakarta.annotation.Nullable;
import jakarta.annotation.PostConstruct;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class OAuthTokenCipher {

    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private static final String VERSION_PREFIX = "v1";

    /**
     * The base64-encoded public test key shipped as the development default in application.yml.
     * Decodes to "0123456789abcdef0123456789abcdef". The application refuses to start
     * in prod/staging profiles when this key is still active.
     */
    private static final String FORBIDDEN_DEFAULT_KEY_BASE64 =
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    private final SecureRandom secureRandom = new SecureRandom();
    private final SecretKey secretKey;
    private final String configuredKey;
    private final Environment env;

    public OAuthTokenCipher(AuthFlowProperties authFlowProperties, Environment env) {
        this.configuredKey = authFlowProperties.tokenEncryptionKeyBase64();
        this.env = env;
        byte[] decodedKey = Base64.getDecoder().decode(this.configuredKey);
        this.secretKey = new SecretKeySpec(decodedKey, KEY_ALGORITHM);
    }

    @PostConstruct
    void validateKey() {
        if (configuredKey == null || configuredKey.isBlank()) {
            throw new IllegalStateException(
                    "APP_AUTH_TOKEN_ENCRYPTION_KEY_BASE64 must be set");
        }
        String[] activeProfiles = env.getActiveProfiles();
        boolean isProdLike = false;
        for (String p : activeProfiles) {
            if (p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("staging")) {
                isProdLike = true;
                break;
            }
        }
        if (isProdLike && FORBIDDEN_DEFAULT_KEY_BASE64.equals(configuredKey)) {
            throw new IllegalStateException(
                    "APP_AUTH_TOKEN_ENCRYPTION_KEY_BASE64 is the public test default; "
                    + "set a unique 256-bit base64-encoded key for the '"
                    + String.join(",", activeProfiles)
                    + "' profile.");
        }
    }

    public String encrypt(String tokenValue) {
        return encryptNullable(tokenValue);
    }

    @Nullable
    public String encryptNullable(@Nullable String tokenValue) {
        if (tokenValue == null || tokenValue.isBlank()) {
            return null;
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] cipherText = cipher.doFinal(tokenValue.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + cipherText.length)
                .put(iv)
                .put(cipherText)
                .array();

            return VERSION_PREFIX + ":" + Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Failed to encrypt OAuth token value", exception);
        }
    }

    public String decrypt(String encryptedToken) {
        return decryptNullable(encryptedToken);
    }

    @Nullable
    public String decryptNullable(@Nullable String encryptedToken) {
        if (encryptedToken == null || encryptedToken.isBlank()) {
            return null;
        }

        if (!encryptedToken.startsWith(VERSION_PREFIX + ":")) {
            throw new IllegalArgumentException("Unknown encryption version or missing version prefix");
        }

        try {
            String base64Payload = encryptedToken.substring(VERSION_PREFIX.length() + 1);
            byte[] payload = Base64.getDecoder().decode(base64Payload);

            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | RuntimeException exception) {
            throw new IllegalStateException("Failed to decrypt OAuth token value", exception);
        }
    }
}
