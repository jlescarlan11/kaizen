package com.kaizen.backend.common.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic envelope for paginated/cursor list responses. The frontend
 * uses `hasMore` to gate "load more" UI; `nextCursor` is the opaque
 * token that the next request should send back as `lastDate`/`lastId`
 * query params (callers re-decode it). When pagination isn't relevant
 * (e.g., a small list with no cursor), set hasMore=false and nextCursor=null.
 */
public record PaginatedResponse<T>(
    List<T> items,
    boolean hasMore,
    @JsonInclude(JsonInclude.Include.NON_NULL) String nextCursor
) {}
