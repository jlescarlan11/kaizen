package com.kaizen.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityBeanConfig {

    private final SecurityErrorHandler securityErrorHandler;

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return securityErrorHandler;
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return securityErrorHandler;
    }
}
