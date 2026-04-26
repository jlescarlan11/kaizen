# Security Decisions

This document records security design decisions that deviate from a framework
default or that a future reviewer might question.  Each entry states the
decision, the reasoning, and the conditions under which it should be
re-evaluated.

---

## CSRF protection disabled (SecurityConfig.java)

**Status:** Active — decided Q2 2025  
**Owner:** Backend team  
**Code reference:** `SecurityConfig#securityFilterChain`, `.csrf(csrf -> csrf.disable())`

### Decision

CSRF token validation is globally disabled.  Spring Security's default is
to enable it.

### Rationale

1. **API-only surface.**  The `/api/*` paths are consumed exclusively by the
   Kaizen SPA (single-page application) via JavaScript `fetch` calls.  There
   are no server-rendered HTML forms that a cross-site attacker could hijack
   using a traditional CSRF exploit.

2. **SameSite=Lax cookie attribute.**  The persistent-session cookie
   (`kzn_pst`) is set with `SameSite=Lax` (see `GoogleOAuthController` and
   `SessionProperties`).  Under SameSite=Lax, browsers will not send the
   cookie on cross-site sub-resource requests (XHR, fetch, `<img>`, etc.),
   only on top-level navigations initiated by the user.  Since all
   state-changing API calls are sub-resource requests, the cookie is never
   attached by a cross-site page, making a CSRF attack ineffective.

3. **HttpOnly + Secure flags.**  The cookie is also `HttpOnly` (not readable
   by JavaScript, preventing XSS-based token theft) and `Secure` (HTTPS only
   in production), further limiting the attack surface.

4. **No CSRF token round-trip overhead.**  Avoiding the synchronizer-token
   pattern simplifies the SPA's fetch logic and removes a class of
   "403 invalid CSRF token" bugs during SPA navigation.

### Trade-offs accepted

- SameSite=Lax permits cookies on top-level GET navigations (e.g., clicking a
  link from a third-party site).  If a state-changing operation were ever
  exposed as a GET endpoint, this protection would not apply.
- This decision assumes the cookie name and flags remain stable.  A
  misconfiguration that removes `SameSite=Lax` or `Secure` would re-open the
  CSRF surface.

### Re-evaluation triggers

Re-open this decision and consider enabling CSRF tokens or switching to
bearer-token-only auth if **any** of the following change:

- A state-changing endpoint is added that accepts GET requests.
- Server-rendered HTML forms are introduced (e.g., an admin UI).
- The SameSite cookie attribute is weakened to `None` for any reason.
- A penetration test or threat-model review identifies a concrete attack path.
- The session mechanism changes from cookie-based to something where the
  SameSite protection no longer applies (e.g., localStorage tokens without
  the cookie).

---

## Encryption key fail-fast guard (OAuthTokenCipher.java)

**Status:** Active — added Q2 2025  
**Owner:** Backend team  
**Code reference:** `OAuthTokenCipher#validateKey` (`@PostConstruct`)

### Decision

`OAuthTokenCipher` refuses to start in `prod` or `staging` Spring profiles
when `APP_AUTH_TOKEN_ENCRYPTION_KEY_BASE64` is absent or matches the public
test default shipped in `application.yml`.

### Rationale

The development default (`MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=`,
decodes to `0123456789abcdef0123456789abcdef`) is a well-known test vector.
If it were used in production, stored OAuth access and refresh tokens would
be encrypted with a publicly known key, rendering the encryption meaningless.

The fail-fast guard converts a silent misconfiguration into a startup crash
with a clear error message, ensuring the problem is caught at deploy time
rather than discovered after a breach.

The default is intentionally kept in `application.yml` so that local
development and test runs continue to work without additional setup.

### Re-evaluation triggers

- If key rotation is implemented, the guard may need updating to allow a
  brief dual-key window during rollover.
- If additional profiles are introduced (e.g., `canary`, `preview`) that
  should also be treated as prod-like, add them to the profile check in
  `validateKey`.
