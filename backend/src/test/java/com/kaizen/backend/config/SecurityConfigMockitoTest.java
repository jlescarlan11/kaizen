package com.kaizen.backend.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class SecurityConfigMockitoTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void userDetailsServiceEncodesConfiguredPassword() {
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        AppSecurityProperties properties = new AppSecurityProperties("test-user", "test-password");
        UserDetailsService userDetailsService = securityConfig.userDetailsService(properties, passwordEncoder);
        UserDetails loaded = userDetailsService.loadUserByUsername("test-user");

        assertNotNull(loaded);
        assertTrue(loaded.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority())));
        verify(passwordEncoder).encode("test-password");
    }
}
