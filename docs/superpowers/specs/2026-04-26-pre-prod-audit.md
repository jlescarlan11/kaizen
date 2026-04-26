# Pre-Production Audit — Kaizen

**Date:** 2026-04-26
**Scope:** Layered audit (BLOCKERS → QUALITY → POLISH) covering frontend, backend, security, deploy, and cross-cutting concerns. Test-coverage gaps explicitly out of scope per user direction.

## Methodology

- Four parallel exploration agents covered: (1) backend code & API, (2) backend security & money math, (3) frontend code/UX/a11y, (4) cross-cutting (deploy/config/secrets/CI/deps/CVEs).
- Real checks executed: frontend `tsc -b`, ESLint, `vite build`, `knip`, `npm audit`, backend `mvn compile`, backend `mvn test`.
- Backend tests pass. Backend compile passes. Frontend ESLint passes. **Frontend production build is broken** (see B-FE-1).

## Verification status

Most file:line references come from sub-agents reading source. The following were independently verified by the orchestrator:
- Frontend build/typecheck failure (`TransactionEntryForm.tsx`).
- Vite CVE advisories from `npm audit --production`.
- `backend/.env` is **gitignored** (the cross-cutting agent claimed it was committed; that claim was wrong and is excluded from this report).
- Knip results.

Treat un-verified findings as high-confidence leads, not facts. Re-read the cited file:line before fixing.

## Severity rubric

- **BLOCKER** — security hole, data corruption, broken prod flow, mandatory-standard violation, broken build.
- **QUALITY** — drift, duplication, dead code, weak error handling, missing observability, perf footgun.
- **POLISH** — naming, micro-cleanups, comment hygiene, doc drift.

## Counts

- BLOCKERS: 16
- QUALITY: 38
- POLISH: 25
- **Total: 79**

---

# BLOCKERS

## Security

### B-SEC-1: IDOR on receipt attachments — no auth, no ownership check
- **Files:** `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java:32-58`, `…/transaction/service/ReceiptAttachmentService.java:44-113`
- **Evidence:** `@PostMapping("/{transactionId}/attachments")` and `@GetMapping("/attachments/{attachmentId}/content")` accept path IDs with no `@AuthenticationPrincipal`. Service loads the transaction by ID and never checks the caller owns it.
- **Impact:** Authenticated user A can upload to / download from / delete user B's receipts by enumerating IDs. Discloses receipt PII; lets attacker corrupt others' transaction records.
- **Fix:** Add `@AuthenticationPrincipal UserDetails` to all three endpoints; pass `userDetails.getUsername()` to service; verify transaction owner before any storage call.
- **Effort:** S

### B-SEC-2: Open redirect via OAuth `redirect_uri` (+ session fixation)
- **Files:** `backend/src/main/java/com/kaizen/backend/auth/controller/GoogleOAuthController.java:99-241`
- **Evidence:** `/authorize` stores user-supplied `redirect_uri` query param into `session.setAttribute(REDIRECT_URI_SESSION_ATTRIBUTE, redirectUriParam)` with no whitelist check; `/callback` later reads it back unvalidated and redirects.
- **Impact:** Attacker crafts `…/authorize?redirect_uri=https://attacker.tld/phish`; victim completes OAuth and is redirected to attacker domain with active session cookie. Combined with the unbound session attribute, this is a session-fixation primitive.
- **Fix:** Remove the request-controlled `redirect_uri` parameter (use `authFlowProperties.postAuthRedirectUri()` only) or whitelist origins via `AuthFlowProperties`.
- **Effort:** S

### B-SEC-3: Hardcoded fallback encryption key in `application.yml`
- **Files:** `backend/src/main/resources/application.yml:65`, `…/auth/service/OAuthTokenCipher.java:28-30`
- **Evidence:** `token-encryption-key-base64: ${APP_AUTH_TOKEN_ENCRYPTION_KEY_BASE64:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=}` decodes to `0123456789abcdef…` — a public test key. If env var is unset in prod, every encrypted OAuth token is decryptable by anyone reading source.
- **Impact:** Database breach scenario allows decryption of all stored Google access/refresh tokens → user account takeover via Google.
- **Fix:** Remove the default. Add a startup `@PostConstruct` that fails-fast if the key is unset OR matches the test default. Generate a fresh 256-bit random key per env, store in secrets manager.
- **Effort:** S

### B-SEC-4: No rate limiting on auth endpoints
- **Files:** `…/auth/controller/GoogleOAuthController.java`, `…/auth/controller/SessionController.java` — no rate-limit filter or annotation in repo.
- **Evidence:** No bucket4j/resilience4j/custom rate limiter present; endpoints `/api/auth/google/callback`, `/api/auth/sessions`, `/api/auth/logout` accept unlimited requests per IP/user.
- **Impact:** Brute force of OAuth callback codes; resource exhaustion via repeated session listing/revocation; password-reset spam (if/when implemented).
- **Fix:** Add a bucket-based rate-limit filter (bucket4j or resilience4j) keyed on IP + user, e.g. 10/min per IP on `/auth/*` POST endpoints.
- **Effort:** M

### B-SEC-5: PII logged at INFO in OAuth flow
- **Files:** `backend/src/main/java/com/kaizen/backend/auth/service/GoogleOAuthService.java:121`, `…/auth/config/PersistentSessionFilter.java:127`
- **Evidence:** `log.info("Google User Info: email={}, name={}, picture={}", …)`; `log.debug("Restoring security context from persistent session for user: {}", email)`.
- **Impact:** Email is PII. CODING_STANDARDS §2.6 forbids logging full PII payloads. Centralized log breach exposes user roster; violates privacy commitments.
- **Fix:** Replace with user ID or a stable hash. Drop `name`/`picture` from the log statement entirely. Apply consistently across auth flows.
- **Effort:** S

## Backend correctness

### B-BE-1: Race condition in budget expense recalculation
- **Files:** `backend/src/main/java/com/kaizen/backend/transaction/service/TransactionService.java:322-342` (`recalculateBudgetExpenses`)
- **Evidence:** `budgetRepository.saveAndFlush(...)` is called without retry on `OptimisticLockingFailureException`. `Budget` has `@Version` (verified at `…/budget/entity/Budget.java:50-52`) but the calling path doesn't react to version conflicts.
- **Impact:** Two concurrent expense writes against the same budget can drop one update silently → budget `expense` field drifts from sum-of-transactions → wrong "remaining" surfaced to user → money math corruption.
- **Fix:** Wrap mutating callers (`createTransaction` / `updateTransaction` / `deleteTransaction`) with retry-on-`OptimisticLockingFailureException` (e.g., Spring Retry `@Retryable`, max 3 attempts, refetch-then-recalc). Add an integration test that races two threads on the same budget.
- **Effort:** M

### B-BE-2: Missing nested `@Valid` on batch budget request
- **Files:** `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java:80`
- **Evidence:** `@Valid @RequestBody BudgetBatchRequest request` — but `BudgetBatchRequest` holds a list of nested DTOs and Spring won't cascade validation without `@Valid` on the list element type itself.
- **Impact:** Malformed nested entries can reach the service layer; partial-success states possible if the manual validator on line 85 doesn't halt on first error.
- **Fix:** Add `@Valid` on the nested collection field in `BudgetBatchRequest`. Audit the manual validator to confirm fail-fast behavior. Add a `@ControllerAdvice` mapping for `MethodArgumentNotValidException` if not present.
- **Effort:** S

## Frontend

### B-FE-1: Production build broken — TS errors in `TransactionEntryForm`
- **Files:** `frontend/src/features/transactions/components/TransactionEntryForm.tsx:124, 132, 140, 150`
- **Evidence:** Both `npm run typecheck` and `npm run build` report errors:
  ```
  error TS2345: Argument of type 'string | number | boolean | null' is not assignable to parameter of type 'string'.
    Type 'null' is not assignable to type 'string'.
  ```
  `validateField(field, value: string|number|boolean|null)` calls `parseFloat(value)` and `parseInt(value)` directly.
- **Impact:** `tsc -b && vite build` fails → no shippable bundle. Even at runtime, `parseFloat(null)` returns `NaN`; nullable inputs silently corrupt validation payloads.
- **Fix:** Narrow the union before parsing — coerce numeric/boolean inputs to string explicitly, or accept `unknown` and use a typed guard. Audit all four call sites.
- **Effort:** S

### B-FE-2: Vite 7.0.0–7.3.1 — 2 HIGH-severity CVEs
- **Files:** `frontend/package.json` (`vite: ^7.3.1`)
- **Evidence:** `npm audit` reports:
  - GHSA-v2wj-q39q-566r — `server.fs.deny` bypass with queries (HIGH)
  - GHSA-p9ff-h696-f583 — Arbitrary file read via Vite Dev Server WebSocket (HIGH)
  - GHSA-48c2-rrv3-qjmp — `yaml` stack overflow (MODERATE, transitive)
  - `fixAvailable: true`
- **Impact:** Dev-server only (Vite is not used in prod nginx serve), but a developer running `vite dev` on a network can have arbitrary repo files read by an attacker reachable on the network.
- **Fix:** `npm i vite@latest` (or whatever the patched 7.x line is) and re-run `npm audit`.
- **Effort:** S

### B-FE-3: No 401 auto-logout in RTK Query base
- **Files:** `frontend/src/app/store/api/baseApi.ts`
- **Evidence:** `fetchBaseQuery` is used directly with no wrapping handler for 401 responses.
- **Impact:** Expired/revoked sessions yield generic errors; user remains "logged in" client-side while every request fails. Confusing UX; cached server state goes stale silently.
- **Fix:** Wrap `fetchBaseQuery` in a `baseQueryWithReauth` that, on 401, dispatches `logout()`, clears Dexie (see B-FE-4), and navigates to `/signin`.
- **Effort:** S

### B-FE-4: Dexie cache not cleared on logout — cross-user data leak
- **Files:** `frontend/src/features/transactions/lib/localStore.ts`, `frontend/src/app/store/authSlice.ts`
- **Evidence:** `logout` action wipes Redux but not IndexedDB. Pending/failed transactions persist across sessions on the same browser.
- **Impact:** On a shared device, user B sees user A's pending entries and may sync them under their account; permission errors can also surface from server-side ownership checks.
- **Fix:** In the logout mutation's `onQueryStarted` (or in a single `logout()` thunk) call `await db.transactions.clear()` (and any other tables) before navigation. Repeat on 401 auto-logout.
- **Effort:** S

### B-FE-5: `InsightsPage` violates mandatory typography & color tokens
- **Files:** `frontend/src/features/insights/InsightsPage.tsx:42-43`, `…/insights/components/SpendingSummary.tsx:24,27,31`, `…/insights/components/CategoryBreakdown.tsx:19,29`, `…/insights/components/SpendingTrends.tsx:23,33,57,63`
- **Evidence:** Hardcoded `text-gray-900`, `text-gray-500`, `text-green-600`, `text-red-600`, `bg-indigo-600 text-white`, `bg-gray-100`. CODING_STANDARDS §1.7.1 + AGENTS.md mandate semantic tokens (`text-foreground`, `text-muted-foreground`, `text-subtle-foreground`, `text-on-*`, `bg-ui-surface-muted`, `bg-primary`).
- **Impact:** Mandatory-standard violation. Breaks dark-mode contrast (no AAA guarantee), themability, and is inconsistent with the rest of the app.
- **Fix:** Replace each non-semantic class with the documented token; verify contrast in light + dark mode together (per AGENTS.md theming rule).
- **Effort:** M

## Cross-cutting

### B-CC-1: Lockfile conflict — both `package-lock.json` and `pnpm-lock.yaml` checked in
- **Files:** `frontend/package-lock.json`, `frontend/pnpm-lock.yaml`
- **Evidence:** Both present; CI uses npm (`cache: npm`, `npm ci`) but a contributor running `pnpm install` will resolve from a different lockfile.
- **Impact:** Non-reproducible installs across dev/CI. Silent dep drift; CVE pass on CI doesn't guarantee dev gets the same patched versions.
- **Fix:** Standardize on npm (matches CI). `git rm frontend/pnpm-lock.yaml` and document the choice in CONTRIBUTING/README.
- **Effort:** S

### B-CC-2: CORS hardcoded to localhost only
- **Files:** `backend/src/main/java/com/kaizen/backend/config/SecurityConfig.java:85-87`
- **Evidence:** `setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:4173"))` — no env-aware override.
- **Impact:** Frontend deployed to prod origin will be blocked by CORS preflight. App is undeployable as-is.
- **Fix:** Externalize via `@Value("${app.cors.allowed-origins}")` (comma-separated). Define lists per profile in `application-{dev,staging,prod}.yml`.
- **Effort:** S

### B-CC-3: `/actuator/health/**` permitAll exposes health details
- **Files:** `backend/src/main/resources/application.yml:47` (`show-details: when_authorized`), `backend/.../config/SecurityConfig.java:61` (`permitAll` on `/actuator/health/**`).
- **Evidence:** YAML restricts detail visibility to authorized callers, but Security permits the endpoint anonymously, and Spring's `when_authorized` only requires *any* authentication — combined effect is unclear and the readiness probe surfaces internal component status to any caller.
- **Impact:** Reconnaissance — DB/Redis up/down, custom health check labels, internal component names leak to unauthenticated callers.
- **Fix:** Permit only `/actuator/health` (summary) anonymously; require auth (or block) on `/actuator/health/**`. Set `show-details: never` in `application-prod.yml`.
- **Effort:** S

---

# QUALITY

## Backend — services & data layer

### Q-BE-1: Allocation validation duplicated across `BudgetService` and `BudgetValidationService`
- **Files:** `…/budget/service/BudgetService.java:130-150`, `…/budget/validation/BudgetValidationService.java:71-104`
- **Evidence:** Both compute "outstanding commitment" and check the same fit constraint with near-identical code.
- **Impact:** Divergence risk — a bug fix to one path can leave the other wrong; recently fixed allocation issues (PRs #26–#28) suggest the area is sensitive.
- **Fix:** Move the canonical check into `BudgetValidationService` and have `BudgetService` call it. Delete the duplicate.
- **Effort:** M

### Q-BE-2: `findByEmail` (case-sensitive) is dead code; mixed lookup style
- **Files:** `…/user/repository/UserAccountRepository.java:12`; usages in `…/auth/controller/SessionController.java:46`, `…/auth/controller/OnboardingProgressController.java`, `…/budget/service/BudgetService.java:111` (uses `findByEmailIgnoreCase`).
- **Evidence:** Two repository methods exist; some callers use case-sensitive variant despite all auth flows treating email case-insensitively.
- **Impact:** Lookup failures if email casing differs from sign-up casing; lazy `roles` loading because the case-sensitive variant lacks `@EntityGraph(attributePaths = "roles")`.
- **Fix:** Delete `findByEmail`. Replace all call sites with `findByEmailIgnoreCase`. Verify a unique-citext or unique-index-on-lower(email) exists in the DB.
- **Effort:** S

### Q-BE-3: `catch (Exception)` swallows unexpected failures
- **Files:** `…/auth/config/PersistentSessionFilter.java:102-106`; `…/transaction/service/ReminderDeliveryJob.java` (grepped occurrence)
- **Evidence:** Broad catches log-and-continue, masking DB deadlocks, OOM, and other systemic faults.
- **Impact:** Silent prod failures; alerts never fire; debugging requires log archaeology.
- **Fix:** Catch only the expected exception types (`AuthenticationException`, `DataAccessException`, `IOException`). Let unknown errors propagate or rethrow as a 500. For scheduled jobs, log full stack at ERROR and emit a metric.
- **Effort:** S

### Q-BE-4: Potential N+1 in `getBudgetsWithProjections`
- **Files:** `…/budget/service/BudgetService.java:199, 236-237`
- **Evidence:** `findAllByUserId` declares `@EntityGraph(attributePaths = {"user", "category"})`, then iteration accesses `budget.getCategory().getName()` and `budget.getUser().getId()`. If detachment happens, lazy fetches re-trigger.
- **Impact:** Performance cliff for users with many budgets.
- **Fix:** Verify EntityGraph is honored (toggle `spring.jpa.properties.hibernate.generate_statistics=true` in dev and inspect SQL). Prefer a projection DTO over loading entities for list views.
- **Effort:** M

### Q-BE-5: `CategoryService.mergeCategories` flushes/clears mid-transaction
- **Files:** `…/category/service/CategoryService.java:82-94`
- **Evidence:** Calls `entityManager.flush()` and `entityManager.clear()` before the `existsByCategoryId` check; if the check throws, the rename has already been persisted within the transaction (still rollback-able, but the ordering is fragile).
- **Impact:** Hard-to-diagnose merge failures; ordering implies that contributor intent was unclear.
- **Fix:** Validate constraints first, then mutate. Remove unnecessary flush/clear. Wrap in a single `@Transactional` boundary that either fully commits or fully rolls back.
- **Effort:** M

### Q-BE-6: Granularity is a stringly-typed input
- **Files:** `…/insights/service/InsightsService.java:95-101, 147-150`
- **Evidence:** `if ("WEEKLY".equalsIgnoreCase(granularity)) … else MONTHLY` — invalid input silently defaults to MONTHLY.
- **Impact:** Garbage requests succeed silently with wrong semantics; impossible-to-spot client bugs.
- **Fix:** Define `enum Granularity { DAILY, WEEKLY, MONTHLY }`; bind it via Spring's enum converter; reject unknown values with 400.
- **Effort:** S

### Q-BE-7: Token hashing repeated per request
- **Files:** `…/auth/config/PersistentSessionFilter.java:80`, `…/auth/controller/SessionController.java:93`
- **Evidence:** Both compute SHA-256 of the bearer token independently.
- **Impact:** Negligible per request; multiplied across authenticated traffic, it's wasted CPU and a minor latency tax.
- **Fix:** Hash once in the filter; store on the request attribute (or the security context); reuse downstream.
- **Effort:** S

### Q-BE-8: `SessionController` uses case-sensitive `findByEmail` and forces extra role query
- **Files:** `…/auth/controller/SessionController.java:46, 69`
- **Evidence:** Plain `findByEmail` (no EntityGraph) → roles lazy-load on the DTO build.
- **Impact:** Per-request extra query in a high-traffic endpoint.
- **Fix:** See Q-BE-2 — switch to `findByEmailIgnoreCase`.
- **Effort:** S

### Q-BE-9: `PaymentMethodService` not audited (likely mirrors known issues)
- **Files:** `…/payment/controller/PaymentMethodController.java`, `…/payment/service/PaymentMethodService.java`
- **Evidence:** Time-boxed audit didn't reach this package, but the patterns elsewhere (transaction boundaries, lookup-by-email, ownership checks) are sufficiently regular that similar issues are likely.
- **Impact:** Unknown — likely contains 1–2 of the same patterns flagged in budget/transaction services.
- **Fix:** Repeat the four checks: `@AuthenticationPrincipal` on every endpoint; ownership verification in service; `@Transactional` boundary; EntityGraph hygiene.
- **Effort:** M

### Q-BE-10: BCrypt strength left at default (10)
- **Files:** `…/config/SecurityConfig.java:126-128`
- **Evidence:** `new BCryptPasswordEncoder()` — no explicit strength.
- **Impact:** Default 10 is acceptable but lower-bound for 2026; explicit config aids review and is documented.
- **Fix:** `new BCryptPasswordEncoder(12)` and add a one-line comment explaining the choice + rotate-on-login plan.
- **Effort:** S

### Q-BE-11: File uploads validate MIME type only
- **Files:** `…/transaction/service/ReceiptAttachmentService.java:64-76`
- **Evidence:** Checks `file.getContentType()` against `allowedMimeTypesString` — header is client-supplied and trivially spoofable.
- **Impact:** Attacker can upload `.exe` with `image/png` MIME; depending on download flow, can be executed by victim.
- **Fix:** Detect the actual type with Apache Tika (`tika.detect(InputStream)`) and validate against the allowlist. Also validate file extension matches the detected type.
- **Effort:** M

### Q-BE-12: Path traversal check OK but lacks forensic logging
- **Files:** `…/transaction/service/LocalStorageService.java:38-43`
- **Evidence:** `normalize().toAbsolutePath()` + parent equality check is correct.
- **Impact:** Defense works, but a rejected attempt logs only a generic exception — no signal for SOC.
- **Fix:** Log the attempted name + caller user ID at WARN before throwing; never include the path in client response.
- **Effort:** S

### Q-BE-13: Session token format check is a placeholder
- **Files:** `…/auth/config/PersistentSessionFilter.java:71-77`
- **Evidence:** Comment reads "Arbitrary check for demonstration"; only `token.length() < 10` is gated.
- **Impact:** Trivially malformed tokens still reach the (already safe) hash-lookup, wasting cycles.
- **Fix:** Replace with `token.matches("[A-Za-z0-9_-]{43,}")` (Base64Url, ≥32 bytes) and remove the demonstration comment.
- **Effort:** S

### Q-BE-14: Spring Security default headers not customized
- **Files:** `…/config/SecurityConfig.java:56-57`
- **Evidence:** Only `cacheControl().disable()` is configured. No `frameOptions`, `xssProtection`, `contentSecurityPolicy`, HSTS.
- **Impact:** Baseline browser hardening missing; clickjacking and MIME-sniff vectors remain.
- **Fix:** `headers(h -> h.frameOptions(FrameOptionsConfig::deny).xssProtection(...).contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'")))` (paired with nginx headers — see Q-CC-3).
- **Effort:** S

### Q-BE-15: No backend error tracking / log aggregation
- **Files:** `backend/pom.xml` (no Sentry / Datadog deps), no logback XML.
- **Evidence:** Logs go to stdout only; container restarts evaporate history.
- **Impact:** Prod errors are invisible until a user reports them; root-cause analysis is forensic.
- **Fix:** Add `io.sentry:sentry-spring-boot-starter`, configure DSN via env, gate enablement to non-dev profiles. Set log levels per package.
- **Effort:** M

### Q-BE-16: Migration V4 is destructive without safety net
- **Files:** `backend/src/main/resources/db/migration/V4__remove_budget_pools.sql`
- **Evidence:** `ALTER TABLE … DROP COLUMN` on three `user_account` columns. No header comment, no archival.
- **Impact:** Rollback impossible without a restore. Audit trail of the change is implicit.
- **Fix:** Add a header comment with feature link/PR link. For prod runs, capture a `pg_dump --table user_account` before applying. Document rollback shape.
- **Effort:** S

### Q-BE-17: No documented database backup / DR strategy
- **Files:** N/A (absence)
- **Evidence:** No backup cron, no docs, no Render-side automation referenced in repo.
- **Impact:** Data loss on prod = unrecoverable.
- **Fix:** Document and verify daily backups (Render automated backups + offsite copy). Document restore procedure. Schedule a yearly DR drill.
- **Effort:** L

## Frontend — data, errors, structure

### Q-FE-1: Mixed RTK Query + manual fetch wrappers
- **Files:** `frontend/src/features/categories/api.ts` (manual), `frontend/src/features/payment-methods/api.ts` (manual) vs `frontend/src/app/store/api/*.ts` (RTK Query).
- **Evidence:** Two parallel data layers; cache invalidation paths diverge.
- **Impact:** Stale cache after manual fetches that don't invalidate RTK tags; debugging cost.
- **Fix:** Migrate `categories` and `payment-methods` to RTK Query (slices already exist for some — `categoryApi`, `paymentMethodApi` — but agent reports them unused per knip).
- **Effort:** M

### Q-FE-2: Duplicated RTK error-cast in 4+ files
- **Files:** `…/budgets/ManualBudgetSetupPage.tsx:417`, `…/onboarding/OnboardingBudgetStep.tsx:432`, `…/payment-methods/PaymentMethodCreationForm.tsx:46`, `…/payment-methods/PaymentMethodList.tsx:96`
- **Evidence:** `const error = err as { data?: { message?: string }; message?: string }` repeated.
- **Impact:** Maintenance tax; type-system bypass via cast.
- **Fix:** Extract `type RTKQueryError` and a `getErrorMessage(err: unknown): string` helper in `app/store/api/`.
- **Effort:** S

### Q-FE-3: Sentry only initialized in onboarding flow
- **Files:** `frontend/src/features/onboarding/onboardingErrorLogger.ts`
- **Evidence:** No global `Sentry.init` in `AppProviders.tsx`; no `<ErrorBoundary>` wrapping the app.
- **Impact:** All non-onboarding runtime errors are invisible in prod.
- **Fix:** Init Sentry once in `app/providers/AppProviders.tsx` (gated on `VITE_SENTRY_DSN`); add a top-level error boundary; remove the duplicated init from onboarding.
- **Effort:** M

### Q-FE-4: Inconsistent loading/error patterns across pages
- **Files:** `BudgetsPage`, `InsightsPage`, `PaymentMethodManagementPage` (and others).
- **Evidence:** Some pages render spinners, others swap skeletons, others render-on-cache. Error states alternate between toast, inline message, and parsed-backend message.
- **Impact:** UX feels uneven; harder for users to predict when something failed vs is loading.
- **Fix:** Define `<LoadingSkeletonCard>` and `<ErrorStateCard>` in `shared/components/`; adopt across feature pages.
- **Effort:** M

### Q-FE-5: No standard for server-side validation error display
- **Files:** Many forms (`ManualBudgetSetupPage`, `OnboardingBudgetStep`, `TransactionEntryForm`).
- **Evidence:** Backend errors get extracted ad-hoc into a single `submissionError` string per form.
- **Impact:** Field-level constraint violations (e.g., duplicate name) appear as a form-level toast, not next to the offending input.
- **Fix:** Define a `{ code: string; field?: string; message: string }` error envelope on the backend (via `@ControllerAdvice`); on the frontend, route field errors back to the input component.
- **Effort:** M

### Q-FE-6: Manual fetch wrappers don't handle 401
- **Files:** `…/categories/api.ts`, `…/payment-methods/api.ts`
- **Evidence:** Throws "Failed to fetch" on non-2xx without distinguishing 401.
- **Impact:** Same bug as B-FE-3 but in a second code path; folds away once Q-FE-1 lands.
- **Fix:** Resolved by Q-FE-1 (migrate to RTK Query).
- **Effort:** —

### Q-FE-7: Route naming drift `/budget` vs `/budgets`
- **Files:** `frontend/src/app/router/router.tsx:257, 267, 277` (singular); other routes (`/transactions`, `/categories`) plural.
- **Evidence:** Singular `/budget` for the feature root; plural elsewhere.
- **Impact:** Bookmarks/share-links fragile; developer expectation mismatch.
- **Fix:** Pick plural (`/budgets`) for consistency with REST-y rest of app; add 301 redirects from singular if SEO/links matter.
- **Effort:** S

### Q-FE-8: No serializability check in Redux store
- **Files:** `frontend/src/app/store/store.ts`
- **Evidence:** Uses `configureStore` defaults but no explicit middleware tuning beyond what's in scope; non-serializable values can sneak in.
- **Impact:** Silent breakage of time-travel debugging; future SSR pain.
- **Fix:** Confirm `serializableCheck` middleware is enabled in dev (it's on by default in `configureStore`); add a comment that it's intentional. If actions like `RTK Query/executeQuery/pending` are noisy, scope `ignoredActions`.
- **Effort:** S

### Q-FE-9: `InsightsPage` h1 lacks semantic `<header>` wrapper
- **Files:** `frontend/src/features/insights/InsightsPage.tsx:40-46`
- **Evidence:** h1 sits inside a `<div>` flex container; sibling pages (`BudgetsPage`) use `<header>`/`<section>`.
- **Impact:** Screen-reader landmark navigation skips the page intro.
- **Fix:** Wrap title + period selector in `<header>` to match `BudgetsPage`.
- **Effort:** S

### Q-FE-10: 45 unused exports + 57 unused exported types (knip)
- **Files:** See `knip` output — highlights: `KaizenLocalDatabase`, `setupStore`, `notificationSlice` actions, `categoryApi`, `paymentMethodApi`, `sessionApi`, `insightsApi`, `useCreateBudgetMutation`, `useGetBudgetCountQuery`, multiple `*Slice`, all of `payment-methods/api.ts`'s exports.
- **Evidence:** `npx knip` summary.
- **Impact:** Confuses maintenance — half the unused symbols are in `app/store/api/` (RTK Query slices that are *intended* to be used) which suggests the migration in Q-FE-1 was started but stalled.
- **Fix:** Triage: delete genuinely dead, wire up RTK Query slices that exist but aren't consumed (this dovetails with Q-FE-1).
- **Effort:** M

### Q-FE-11: `tailwindcss` flagged unused by knip (likely false positive)
- **Files:** `frontend/package.json:32` — `tailwindcss: ^4.2.1`
- **Evidence:** Knip reports unused, but `@tailwindcss/vite` is the integration entry; tailwind itself is the engine.
- **Impact:** Either knip is wrong (likely) or there's a redundant direct dep.
- **Fix:** Confirm via `npm ls tailwindcss` whether it's only a transitive of `@tailwindcss/vite`. If yes, remove from direct deps; if no, add a knip ignore for it.
- **Effort:** S

## Cross-cutting

### Q-CC-1: CSRF globally disabled with session-based auth
- **Files:** `…/config/SecurityConfig.java:55`
- **Evidence:** `.csrf(csrf -> csrf.disable())` unconditionally; `SessionCreationPolicy.IF_REQUIRED` at line 58 means cookies are issued.
- **Impact:** Cross-site state-changing POSTs are possible if a victim is logged in; SameSite-Lax cookies mitigate but aren't a full substitute.
- **Fix:** Either (a) enable CSRF token endpoint + frontend integration, or (b) confirm the auth design is bearer-token-only (and remove the cookie/session emission). Document the choice in `SecurityConfig` with a comment.
- **Effort:** M

### Q-CC-2: Localhost defaults bleed into base `application.yml`
- **Files:** `backend/src/main/resources/application.yml:7, 22, 63-69`
- **Evidence:** `${DB_HOST:localhost}`, `${APP_AUTH_POST_AUTH_REDIRECT_URI:http://localhost:5173/}`, `${GOOGLE_OAUTH_REDIRECT_URI:http://localhost:8080/api/auth/google/callback}` — all in the *base* file rather than the dev profile.
- **Impact:** If a prod env var is missing, the app silently boots pointing at `localhost` (broken at best, attacker-controllable proxy at worst).
- **Fix:** Move localhost defaults to `application-dev.yml`. In base, leave the placeholder bare so missing-var is a startup failure. Add a startup `@PostConstruct` that asserts required vars in `prod`/`staging` profiles.
- **Effort:** S

### Q-CC-3: nginx config missing security headers
- **Files:** `frontend/nginx/default.conf`
- **Evidence:** No `add_header` directives.
- **Impact:** Browser hardening missing at the edge — clickjacking via missing X-Frame-Options, MIME sniffing via missing nosniff, HSTS not enforced, no CSP.
- **Fix:** Add: `add_header X-Frame-Options "SAMEORIGIN" always;`, `add_header X-Content-Type-Options "nosniff" always;`, `add_header Referrer-Policy "strict-origin-when-cross-origin" always;`, `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`, `add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https://*.sentry.io" always;`. Validate against actual asset usage.
- **Effort:** S

### Q-CC-4: Dockerfiles run as root, no HEALTHCHECK
- **Files:** `backend/Dockerfile`, `frontend/Dockerfile`
- **Evidence:** No `USER` directive; no `HEALTHCHECK`.
- **Impact:** Compromised process has root inside container; orchestrator can't detect a wedged JVM/nginx.
- **Fix:** Backend — `RUN useradd -r -u 1000 app && chown -R app:app /app` then `USER app`; add `HEALTHCHECK CMD curl -fsS http://localhost:8080/actuator/health || exit 1`. Frontend — switch to `nginxinc/nginx-unprivileged` or set `USER nginx`; add `HEALTHCHECK`.
- **Effort:** M

### Q-CC-5: Build artifacts checked into git
- **Files:** `backend/target/`, `frontend/dist/`
- **Evidence:** `git ls-files backend/target` returns content despite `.gitignore` listing them; means they were added before the ignore was added.
- **Impact:** Repo bloat; confusing diffs; risk of stale artifacts being deployed if someone runs from `dist/` directly.
- **Fix:** `git rm -r --cached backend/target frontend/dist` and commit. Verify the gitignore catches them going forward.
- **Effort:** S

### Q-CC-6: `.env.example` incomplete for prod
- **Files:** `backend/.env.example`
- **Evidence:** Comments say "required for staging/prod" without listing all needed vars (e.g., Sentry DSN, OAuth scopes, deploy hook URLs); placeholders not labeled `# REQUIRED`.
- **Impact:** Setup-error-prone for new envs.
- **Fix:** Restructure into `# === REQUIRED IN PROD ===` / `# === DEV DEFAULTS OK ===` sections. Cross-reference with the real prod env to find any var that isn't in the example.
- **Effort:** S

### Q-CC-7: Frontend `package.json` may not declare all installed deps
- **Files:** `frontend/package.json`, `frontend/package-lock.json`
- **Evidence:** Cross-cutting agent reports `@testing-library/jest-dom` in lockfile but not manifest.
- **Impact:** `npm ci` and `npm install` may diverge for new contributors.
- **Fix:** Audit manifest vs lockfile: `npm ls --all --json | jq '.dependencies | keys'`; add any genuinely-needed dep to the manifest; `npm prune` to clean.
- **Effort:** S

### Q-CC-8: No frontend deploy workflow
- **Files:** `.github/workflows/` — only `frontend-pr.yml` (PR build), no deploy.
- **Evidence:** Only `backend-deploy-staging.yml` exists.
- **Impact:** Frontend deploys are manual; `VITE_API_BASE_URL` enforcement depends on operator memory.
- **Fix:** Add `frontend-deploy-staging.yml` with explicit env var bake. Long-term, move API base URL to runtime (read from `window.__APP_CONFIG__` injected by nginx) so a single bundle can be reused across environments.
- **Effort:** M

### Q-CC-9: Swagger config inconsistent with security routes
- **Files:** `backend/src/main/resources/application.yml:50-55`, `…/config/SecurityConfig.java:64-66`
- **Evidence:** YAML disables Swagger by default; SecurityConfig hardcodes `/swagger-ui.html`, `/v3/api-docs/**` as `permitAll`.
- **Impact:** If someone re-enables Swagger in `application-prod.yml` (or the dev override leaks), routes are anonymous.
- **Fix:** Make the SecurityConfig's swagger-permit conditional on a `springdoc.api-docs.enabled` property check (or a profile predicate).
- **Effort:** S

### Q-CC-10: Frontend build artifacts (`dev-server.*.log`) at repo root
- **Files:** `backend/dev-server.err.log`, `backend/dev-server.out.log`, `frontend/dev-server.err.log`, `frontend/dev-server.out.log`
- **Evidence:** Tracked working-tree files at repo root.
- **Impact:** May be tracked or untracked depending on `.gitignore` (`*.log` covers); confirm and clean.
- **Fix:** `git ls-files | grep dev-server` — if tracked, remove. Confirm `*.log` matches (root `.gitignore` has it).
- **Effort:** S

---

# POLISH

### P-BE-1: Endpoint naming consistent (verified)
- **Files:** Controllers under `…/controller/`
- **Evidence:** `/api/budgets`, `/api/categories`, `/api/transactions`, `/api/payment-methods` — all plural and consistent.
- **Action:** No change. Document the convention in `API_DOCUMENTATION_STANDARDS.md` so it stays.
- **Effort:** S

### P-BE-2: Manual entity→DTO mapping vs MapStruct
- **Files:** `BudgetController.map()` and similar in `TransactionController`.
- **Evidence:** No MapStruct (declared in `pom.xml` properties but not used).
- **Action:** Either commit to MapStruct (the dep slot is reserved) and migrate, or remove the unused `mapstruct.version` property. Leaving both states is the worst case.
- **Effort:** L (full migration) / S (remove the version property).

### P-BE-3: "Initial Balance" category fragility
- **Files:** `…/user/service/UserAccountService.java:90-92`
- **Evidence:** Hard requirement on a global category by name; no startup check.
- **Action:** Add an `ApplicationRunner` (or extend the existing seed) that asserts/seeds the row. Throw on missing in non-dev profiles.
- **Effort:** S

### P-BE-4: Stale "PRD Open Question 3" comment
- **Files:** `backend/src/main/resources/application.yml:74-76`
- **Evidence:** Comment references an external doc question without context.
- **Action:** Replace with the actual decision, or delete.
- **Effort:** S

### P-BE-5: Missing JavaDoc on public service methods
- **Files:** `…/transaction/service/TransactionService.java:322` (`recalculateBudgetExpenses`), and others.
- **Action:** Add JavaDoc to non-obvious public methods (one-line summary + `@param`/`@throws`). Skip trivial getters/setters.
- **Effort:** M

### P-BE-6: Inconsistent error message formatting
- **Files:** Many controllers.
- **Action:** Adopt a single template like `"%s failed for %s id=%d: %s"`. Add a static helper in `common/`.
- **Effort:** M

### P-BE-7: Cosmetic — unused imports
- **Files:** Various.
- **Action:** Apply Spotless or Maven `formatter-maven-plugin` once.
- **Effort:** S

### P-BE-8: Encryption key naming
- **Files:** `application.yml:65`
- **Action:** Rename `app.auth.token-encryption-key-base64` to `app.auth.oauth-token-encryption-key-base64` to reflect that it encrypts OAuth tokens specifically. Update env var name to match.
- **Effort:** S

### P-BE-9: `open-in-view: false` good but undocumented
- **Files:** `application.yml:13`
- **Action:** Add a comment explaining why it's disabled (avoids N+1 outside service boundaries).
- **Effort:** S

### P-BE-10: Redis declared but unused in code
- **Files:** `pom.xml` (`spring-boot-starter-data-redis`), `docker-compose.yml`
- **Evidence:** No `RedisTemplate` / `@RedisHash` / repository usage found.
- **Action:** If Redis is planned, add a TODO with the planned usage. If not, remove the dep + service to shrink boot time and infra surface.
- **Effort:** S

### P-BE-11: Google OAuth scopes undocumented
- **Files:** `OAuthConfig` / `application.yml`
- **Action:** Document the scope list (probably `openid email profile`) in a top-of-file comment in the OAuth config class.
- **Effort:** S

### P-BE-12: Admin endpoint returns static welcome
- **Files:** `…/admin/controller/AdminController.java:19-21`
- **Evidence:** `getDashboard()` returns a hardcoded message.
- **Action:** If admin features aren't shipping yet, remove the controller. If they are, populate with real metrics.
- **Effort:** S

### P-FE-1: `Card` component title — verify semantic level
- **Files:** `frontend/src/shared/components/Card.tsx`
- **Action:** Confirm the title renders as `<h3>` (or accept a `headingLevel` prop). If it's a `<div>`, upgrade.
- **Effort:** S

### P-FE-2: Arbitrary font size in `TransactionEntryForm`
- **Files:** `…/transactions/components/TransactionEntryForm.tsx`
- **Evidence:** `text-2xl font-bold tracking-tight` — not in the approved typography roles.
- **Action:** Replace with the closest approved role (likely `display` or `h2`).
- **Effort:** S

### P-FE-3: `<div role="button">` instead of native `<button>`
- **Files:** `frontend/src/features/budgets/BudgetCard.tsx:43`
- **Action:** Native `<button>` is cleaner; only use `role="button"` when styling actually requires it.
- **Effort:** S

### P-FE-4: Vite chunk size warning limit too high
- **Files:** `frontend/vite.config.ts:19`
- **Evidence:** `chunkSizeWarningLimit: 600` (default 500).
- **Action:** Reduce to `400`; verify Recharts and Lucide tree-shake (run `vite build --report` once).
- **Effort:** S

### P-FE-5: `InsightsPage` h1 lacks responsive scaling
- **Files:** `…/insights/InsightsPage.tsx:42`
- **Evidence:** Fixed `text-3xl`; sibling pages use `text-3xl md:text-4xl`.
- **Action:** Add `md:text-4xl` to match.
- **Effort:** S

### P-FE-6: Avatar `<img alt="">`
- **Files:** `…/app/router/AuthenticatedLayout.tsx:288`
- **Action:** Provide alt text or, if purely decorative alongside a labeled control, leave empty *and* mark the wrapper accordingly. Decide and document.
- **Effort:** S

### P-FE-7: Notification icon SVG missing `aria-hidden`
- **Files:** `…/AuthenticatedLayout.tsx:272-277`
- **Action:** Set `aria-hidden="true"` on the SVG since the button already has `aria-label="Notifications"`.
- **Effort:** S

### P-FE-8: `PeriodSelector` label association
- **Files:** `…/insights/components/PeriodSelector.tsx`
- **Action:** Add an `aria-label` (or visible `<label htmlFor>`) so the dropdown is announced as "Period".
- **Effort:** S

### P-CC-1: `.env` build-time-only note
- **Files:** `frontend/.env`
- **Action:** Add a header comment clarifying `VITE_*` vars are baked at build time.
- **Effort:** S

### P-CC-2: `docker-compose.yml` is dev-only
- **Files:** `backend/docker-compose.yml`
- **Action:** Add a header comment so contributors don't assume it mirrors prod.
- **Effort:** S

### P-CC-3: No request-level audit logging
- **Files:** N/A
- **Action:** Add a `LoggingFilter` that emits `userId, method, path, status, durationMs` (no bodies) for every authenticated request — useful both for debugging and for any future compliance ask.
- **Effort:** M

### P-CC-4: Custom HealthIndicators
- **Files:** N/A
- **Action:** Add `HealthIndicator` beans for Redis (if kept) and any external service the backend calls (Google OAuth endpoint reachability).
- **Effort:** S

### P-CC-5: CSRF rotation note (if Q-CC-1 lands as "stay disabled")
- **Action:** If the conscious decision is to keep CSRF disabled, leave a comment explaining the threat-model trade-off so the next reviewer doesn't second-guess.
- **Effort:** S

---

# Summary & next steps

**Ship readiness:** Not yet. 16 BLOCKERS span security (5), backend correctness (2), frontend (5), and cross-cutting (4). Two of those are environmental fixes that take an hour or less (CORS env-driven; lockfile choice); two are mandatory standards violations (typography in InsightsPage; production build broken). The rest range from S to M.

**Verified independently by orchestrator:**
- B-FE-1 (build broken) — reproduced via `npm run build` and `npm run typecheck`.
- B-FE-2 (Vite CVEs) — reproduced via `npm audit --production`.
- Q-FE-10 (knip) — reproduced via `npx knip`.
- The cross-cutting agent's "secrets in `backend/.env` are committed" claim was **incorrect**. `.env` is gitignored and `git log --all --diff-filter=A` shows no add. Excluded from this report.

**Recommended sequence (the user has approved a per-fix planning approach):**
1. First wave (1–2 days): **B-FE-1** (unbreak the build), **B-CC-1** (lockfile), **B-FE-2** (Vite upgrade), **Q-CC-2** (CORS env-driven). These either unblock everything else or are trivial.
2. Second wave (security): **B-SEC-1** (IDOR), **B-SEC-2** (open redirect), **B-SEC-3** (encryption key default), **B-SEC-4** (rate limiting), **B-SEC-5** (PII logs), **B-CC-3** (actuator).
3. Third wave (correctness + UX): **B-BE-1** (race), **B-FE-3 / B-FE-4** (401/Dexie), **B-FE-5** (InsightsPage tokens).
4. After blockers, triage QUALITY in priority order set by the team.

For each chosen fix, run `writing-plans` to produce a per-fix implementation plan rather than batching.
