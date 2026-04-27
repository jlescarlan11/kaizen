package com.kaizen.backend.auth.config;

import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Slf4j
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String AUTH_PATH_PREFIX = "/api/auth/";

    // TODO: bucket eviction (e.g., guava Cache with expireAfterAccess) — current map grows unbounded.
    private final ConcurrentMap<String, Bucket> bucketsByKey = new ConcurrentHashMap<>();

    private final int capacity;
    private final int refillPeriodSeconds;

    public AuthRateLimitFilter(RateLimitProperties props) {
        this.capacity = props.authPostCapacity();
        this.refillPeriodSeconds = props.authPostRefillPeriodSeconds();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        // Only rate-limit write methods on /api/auth/* paths.
        if (!path.startsWith(AUTH_PATH_PREFIX)) return true;
        return !(HttpMethod.POST.matches(method) || HttpMethod.DELETE.matches(method));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = clientKey(request);
        Bucket bucket = bucketsByKey.computeIfAbsent(key, k -> buildBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        log.warn("Auth rate limit exceeded for key={} on {} {}", key, request.getMethod(), request.getRequestURI());
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
            "{\"code\":\"RATE_LIMIT_EXCEEDED\",\"message\":\"Too many requests. Try again later.\",\"details\":{},\"traceId\":\"\"}"
        );
    }

    private Bucket buildBucket() {
        int cap = this.capacity;
        int period = this.refillPeriodSeconds;
        return Bucket.builder()
            .addLimit(limit -> limit.capacity(cap).refillIntervally(cap, Duration.ofSeconds(period)))
            .build();
    }

    private String clientKey(HttpServletRequest request) {
        // Prefer X-Forwarded-For if behind a proxy (Render adds it). Fall back to remoteAddr.
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // First entry is the original client.
            int comma = xff.indexOf(',');
            return comma == -1 ? xff.trim() : xff.substring(0, comma).trim();
        }
        return request.getRemoteAddr();
    }
}
