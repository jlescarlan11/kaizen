package com.kaizen.backend.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility for generating cryptographically secure session tokens and their hashes.
 */
public class SessionTokenUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    
    /**
     * Using 32 bytes of entropy (256 bits).
     * 
     * Justification: 256 bits of entropy is the industry standard for high-security 
     * session tokens, providing a search space of 2^256, which is effectively 
     * immune to brute-force enumeration with current and foreseeable technology.
     */
    private static final int TOKEN_BYTE_LENGTH = 32;

    /**
     * Generates a cryptographically random session token.
     * 
     * @return A Base64Url-encoded string of the random bytes.
     */
    public static String generateToken() {
        byte[] randomBytes = new byte[TOKEN_BYTE_LENGTH];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Produces a SHA-256 hash of the provided token for secure database storage.
     * 
     * @param token The raw session token.
     * @return A hex-encoded string of the SHA-256 hash.
     */
    public static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not found", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
