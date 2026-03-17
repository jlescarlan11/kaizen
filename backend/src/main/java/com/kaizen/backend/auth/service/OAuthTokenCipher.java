package com.kaizen.backend.auth.service;

import com.kaizen.backend.auth.config.AuthFlowProperties;
import jakarta.annotation.Nullable;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

@Service
public class OAuthTokenCipher {

    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;
    private static final String VERSION_PREFIX = "v1";

    private final SecureRandom secureRandom = new SecureRandom();
    private final SecretKey secretKey;

    public OAuthTokenCipher(AuthFlowProperties authFlowProperties) {
        byte[] decodedKey = Base64.getDecoder().decode(authFlowProperties.tokenEncryptionKeyBase64());
        this.secretKey = new SecretKeySpec(decodedKey, KEY_ALGORITHM);
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
