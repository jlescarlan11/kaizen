package com.kaizen.backend.common.exception;

import java.util.Collections;
import java.util.Map;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;

public abstract class ApiException extends RuntimeException {

    @Getter
    private final String code;
    @NonNull
    private final HttpStatus status;
    @Getter
    private final Map<String, Object> details;

    @NonNull
    public HttpStatus getStatus() {
        return status;
    }

    protected ApiException(String code, String message, @NonNull HttpStatus status) {
        this(code, message, status, Collections.emptyMap());
    }

    protected ApiException(String code, String message, @NonNull HttpStatus status, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}
