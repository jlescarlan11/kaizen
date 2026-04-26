import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

export interface ErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
  traceId?: string
}

export interface ValidationFieldError {
  field: string
  message: string
  code?: string
}

export interface ValidationErrorResponse {
  code: string
  message: string
  errors?: ValidationFieldError[]
  traceId?: string
}

type ApiErrorPayload = ErrorResponse | ValidationErrorResponse

type RTKError = FetchBaseQueryError | SerializedError | undefined | unknown

function asPayload(err: RTKError): ApiErrorPayload | null {
  if (!err || typeof err !== 'object') return null
  const fetchErr = err as FetchBaseQueryError
  if ('data' in fetchErr && fetchErr.data && typeof fetchErr.data === 'object') {
    return fetchErr.data as ApiErrorPayload
  }
  return null
}

/**
 * Extracts a user-facing message from an RTK Query error. Preserves the
 * backend's `message` when present; otherwise falls back to a generic
 * string. Use this for form-level submission errors.
 */
export function getErrorMessage(
  err: RTKError,
  fallback = 'Something went wrong. Please try again.',
): string {
  const payload = asPayload(err)
  if (payload?.message) return payload.message
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  return fallback
}

/**
 * Extracts field-level errors as a `Record<field, message>` map. Returns
 * an empty object if the response isn't a ValidationErrorResponse. Use
 * this to route per-field errors back to inputs.
 */
export function getFieldErrors(err: RTKError): Record<string, string> {
  const payload = asPayload(err)
  if (!payload || !('errors' in payload) || !Array.isArray(payload.errors)) return {}
  const out: Record<string, string> = {}
  for (const fe of payload.errors) {
    if (fe && fe.field && fe.message) out[fe.field] = fe.message
  }
  return out
}

/**
 * True when the error has any validation field errors.
 */
export function hasFieldErrors(err: RTKError): boolean {
  const payload = asPayload(err)
  return Boolean(
    payload && 'errors' in payload && Array.isArray(payload.errors) && payload.errors.length > 0,
  )
}
