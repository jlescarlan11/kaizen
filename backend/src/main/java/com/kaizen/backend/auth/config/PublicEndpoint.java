package com.kaizen.backend.auth.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark a controller method or class as publicly accessible.
 * Endpoints marked with this annotation will be added to the security allowlist.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PublicEndpoint {
    /**
     * Optional rationale for why this endpoint is public.
     */
    String rationale() default "";
}
