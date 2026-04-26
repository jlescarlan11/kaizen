# Pre-Production First Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four small, high-impact pre-prod blockers from `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`: unbreak the frontend build (B-FE-1), eliminate the lockfile conflict (B-CC-1), patch dependency CVEs (B-FE-2), and make backend CORS env-driven (Q-CC-2).

**Architecture:** Each task is a separate concern with its own commit. Two are frontend (TS narrowing + dependency patches), one is repo hygiene (delete redundant lockfile), one is backend config (replace hardcoded CORS list with `@Value` injection). They're sequenced so that lockfile cleanup precedes dependency upgrades, and the build fix lands first to keep CI green.

**Tech Stack:** TypeScript / React 19 / Vite 7 / Spring Boot 3.5 / Java 21.

**Order of execution:** Task 1 → Task 2 → Task 3 → Task 4. Single PR, four commits. Branch suggestion: `fix/pre-prod-first-wave`.

---

## Task 1: B-FE-1 — Unbreak the frontend production build

**Why:** `npm run build` and `npm run typecheck` currently fail with 4 `TS2345` errors in `TransactionEntryForm.tsx`. The `validateField(field, value: string | number | boolean | null)` signature is too loose for its actual call sites — every caller passes `string | null` (input values) or a `TransactionType` literal — but inside the function `parseFloat(value)` and `parseInt(value)` need a `string`, and the resulting payload's `type` field cannot widen to `string | number | boolean | null` when `validationGate` expects `TransactionType | undefined`.

**Files:**
- Modify: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:121-187`

**No test framework is configured in `frontend/`** (no vitest/jest, no `*.test.ts*` files). The "test" for this task is the TypeScript compiler: typecheck must pass, then `vite build` must succeed.

- [ ] **Step 1: Reproduce the failure**

Run: `npm --prefix frontend run typecheck`

Expected (current state):
```
src/features/transactions/components/TransactionEntryForm.tsx(124,47): error TS2345: ...
src/features/transactions/components/TransactionEntryForm.tsx(132,24): error TS2345: ...
src/features/transactions/components/TransactionEntryForm.tsx(140,24): error TS2345: ...
src/features/transactions/components/TransactionEntryForm.tsx(150,57): error TS2345: ...
```

Confirm the four error lines match before editing. If the line numbers have drifted, re-read the file at those approximate locations and adjust.

- [ ] **Step 2: Narrow the `validateField` signature and parse sites**

Open `frontend/src/features/transactions/components/TransactionEntryForm.tsx`. Replace the existing `validateField` function (currently lines 120–187) with:

```typescript
  // Real-time validation helper
  const validateField = (field: string, value: string | null) => {
    // Construct a partial payload for validation
    const currentPayload = {
      amount: field === 'amount' ? parseFloat(value ?? '') : parseFloat(amount),
      type: (field === 'type' ? value : type) as TransactionType,
      transactionDate:
        field === 'transactionDate'
          ? (value ?? '')
          : transactionDate || toLocalISOString(new Date()),
      description: field === 'description' ? (value ?? '') : description,
      categoryId:
        field === 'categoryId'
          ? value
            ? parseInt(value)
            : null
          : categoryId
            ? parseInt(categoryId)
            : null,
      paymentMethodId:
        field === 'paymentMethodId'
          ? value
            ? parseInt(value)
            : null
          : paymentMethodId
            ? parseInt(paymentMethodId)
            : null,
      isRecurring,
      frequencyUnit,
      frequencyMultiplier: parseInt(frequencyMultiplier),
    }

    const { errors: validationErrors } = validationGate(currentPayload)
    const fieldError = validationErrors.find((e) => e.field === field)

    setErrors((prev) => {
      const next = { ...prev }
      const fieldName = field === 'transactionDate' ? 'transactionDate' : field

      if (fieldError) {
        next[fieldName] = getErrorMessage(fieldError.code, fieldName)
      } else {
        delete next[fieldName]
      }

      // Special case: insufficient balance is also a real-time error for amount
      // We must calculate the balance for the target method to avoid stale closure issues
      const targetMethodId = field === 'paymentMethodId' ? value : paymentMethodId
      const targetType = (field === 'type' ? value : type) as TransactionType
      const targetAmount = field === 'amount' ? (value ?? '') : amount

      const methodSummary = balanceSummaries?.find(
        (s) => s.paymentMethod?.id.toString() === targetMethodId,
      )
      const rawBal = methodSummary?.totalAmount ?? 0
      const currentAvailableBalance =
        editData?.paymentMethod?.id.toString() === targetMethodId && editData.type === 'EXPENSE'
          ? rawBal + editData.amount
          : rawBal

      const val = parseFloat(targetAmount)
      if (targetType === 'EXPENSE' && !isNaN(val) && val > currentAvailableBalance) {
        next.amount = `Insufficient balance. Available: PHP ${currentAvailableBalance.toFixed(2)}`
      } else if (next.amount?.includes('Insufficient balance')) {
        delete next.amount
      }

      return next
    })
  }
```

What changed:
- Signature `string | number | boolean | null` → `string | null` (call sites at lines 397, 412, 428, 440, 461, 477 already pass only string-or-null — `TransactionType` widens to `string`).
- `parseFloat(value)` → `parseFloat(value ?? '')` so `null` becomes `''` (parses to `NaN`, same runtime behavior as before but type-safe).
- `transactionDate`/`description` branches use `value ?? ''` instead of bare `value`.
- The `type` payload field is cast via `as TransactionType` — call site at line 397 only passes `TransactionType`, the cast is sound.
- The `targetType` derivation inside the setter loses the now-redundant `(value as TransactionType)` and `(value as string)` casts in favor of the same narrowed approach.
- The `targetMethodId = field === 'paymentMethodId' ? (value as string) : paymentMethodId` cast is removed because `value` is already `string | null` (matches `paymentMethodId`'s type).

- [ ] **Step 3: Verify typecheck passes**

Run: `npm --prefix frontend run typecheck`

Expected: exits 0 with no `error TS2345` output.

If new errors appear elsewhere, re-read the file and ensure the surrounding context wasn't disturbed. Do not change call sites in this step — they should compile cleanly against the narrowed signature.

- [ ] **Step 4: Verify production build succeeds**

Run: `npm --prefix frontend run build`

Expected: `tsc -b` exits cleanly, then `vite build` produces `frontend/dist/`. No `error TS2345` lines in stdout.

- [ ] **Step 5: Verify lint still passes**

Run: `npm --prefix frontend run lint`

Expected: exit 0 (project uses `--max-warnings=0`).

- [ ] **Step 6: Smoke-test the form (manual)**

Start the dev server: `npm --prefix frontend run dev`. Open the transaction entry form (`/transactions` → "Add transaction"). Verify:
1. Typing in the **Amount** field shows live validation (no console errors).
2. Toggling **Type** between Income/Expense doesn't crash.
3. Selecting a category, then clearing it (to `null`), keeps the form responsive.
4. Selecting a payment method shows the balance line.
5. Submitting an empty form shows field errors instead of blowing up.

This is the only end-to-end check possible without a test framework. Per CODING_STANDARDS §1.4 and project conventions: "if you can't test the UI, say so explicitly rather than claiming success."

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/transactions/components/TransactionEntryForm.tsx
git commit -m "fix(transactions): narrow validateField signature to unbreak build

The validateField helper accepted string|number|boolean|null but every
caller passes string|null. Loose typing forced TS2345 errors at the
parseFloat/parseInt sites and at the validationGate payload's type
field. Narrow to string|null and coalesce nulls at parse sites."
```

---

## Task 2: B-CC-1 — Remove redundant `pnpm-lock.yaml`, standardize on npm

**Why:** `frontend/` carries both `package-lock.json` (used by CI: `frontend-pr.yml` → `npm ci` with `cache: npm`) and `pnpm-lock.yaml` (created by a prior commit `feat: fixed pnpm lock`). Contributors who run `pnpm install` resolve different versions than CI, hiding CVEs and causing reproducibility drift.

**Files:**
- Delete: `frontend/pnpm-lock.yaml`
- Modify: `README.md` (add a one-line note pinning the package manager)

- [ ] **Step 1: Confirm CI is npm-only**

Run: `grep -n "pnpm\|npm" /d/kaizen/.github/workflows/frontend-pr.yml`

Expected: every active reference is to `npm`/`npm ci`/`cache: npm`/`package-lock.json`. No active `pnpm` calls. If CI references pnpm, stop and escalate before deleting.

- [ ] **Step 2: Confirm `package-lock.json` is current**

Run: `cd /d/kaizen/frontend && npm ci --dry-run 2>&1 | tail -5`

Expected: completes without proposing changes (`added X packages` style line, no `npm WARN ... lock file was generated by pnpm`).

If `npm ci` reports the lockfile is out of sync, run `npm install` to regenerate `package-lock.json`, commit that as a separate prep step, then continue.

- [ ] **Step 3: Delete `pnpm-lock.yaml`**

Run: `git rm frontend/pnpm-lock.yaml`

Expected: `rm 'frontend/pnpm-lock.yaml'`. Do not use `rm` directly — `git rm` keeps the working tree and the index in sync.

- [ ] **Step 4: Document the package manager choice**

Open `README.md`. After the existing "Project structure" section (around the `Basic development setup` ordered list), add a new short subsection. The exact insertion: after the line `4. Wait for required review approval before merge (enforced by branch protection).`, add a blank line then:

```markdown
### Frontend package manager

Use **npm** for the frontend. CI runs `npm ci` against `frontend/package-lock.json`. Do not commit `pnpm-lock.yaml` or `yarn.lock`.
```

- [ ] **Step 5: Verify the workspace still installs cleanly**

Run: `cd /d/kaizen/frontend && rm -rf node_modules && npm ci`

Expected: completes successfully (existing `package-lock.json` is honored).

- [ ] **Step 6: Verify no other reference to pnpm exists**

Run: `grep -rIn --exclude-dir=node_modules --exclude-dir=.git "pnpm" /d/kaizen/`

Expected: no results, or only matches inside docs that are explicitly historical (e.g., a CHANGELOG entry). Any active script reference must be migrated to npm before continuing.

- [ ] **Step 7: Commit**

```bash
git add frontend/pnpm-lock.yaml README.md
git commit -m "chore(frontend): drop pnpm-lock.yaml, pin to npm

CI uses npm ci against package-lock.json; carrying both lockfiles
let pnpm contributors resolve different versions than CI. Remove
the redundant lockfile and document the pin in the README."
```

---

## Task 3: B-FE-2 — Patch frontend dependency CVEs

**Why:** `npm audit --production` reports four advisories with `fixAvailable: true`:
- `vite` 7.0.0–7.3.1 — 2 HIGH (`server.fs.deny` bypass, arbitrary file read via WS) + 1 path traversal in optimized deps `.map`. Patched in 7.3.2+.
- `picomatch` 4.0.0–4.0.3 — HIGH (method injection in POSIX class globs, ReDoS via extglob).
- `postcss` <8.5.10 — MODERATE (XSS via unescaped `</style>` in CSS stringify).

These are dev/build-time issues. They don't ship to prod runtime, but they expose a developer running `vite dev` on an untrusted network and they're trivially patched.

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json` (regenerated by npm)

- [ ] **Step 1: Snapshot the current advisory state**

Run: `cd /d/kaizen/frontend && npm audit --production 2>&1 | tee /tmp/audit-before.txt`

Expected: at least the four advisories above. Save the file count: `grep -c "Severity:" /tmp/audit-before.txt`. Note the number for the "after" comparison.

- [ ] **Step 2: Apply the recommended fixes**

Run: `cd /d/kaizen/frontend && npm audit fix`

Expected output mentions packages updated (vite, picomatch, postcss, possibly transitive yaml). Do not pass `--force` unless Step 4 fails — `--force` accepts breaking major version bumps.

- [ ] **Step 3: Verify all advisories are resolved**

Run: `cd /d/kaizen/frontend && npm audit --production`

Expected: `found 0 vulnerabilities` (or only items the advisory marked "no fix available", in which case re-run without `--production` and inspect — none should remain in the production surface).

- [ ] **Step 4: Verify build, lint, typecheck**

Run in sequence:
```bash
cd /d/kaizen/frontend
npm run typecheck
npm run lint
npm run build
```

Each is expected to exit 0. Vite minor patch versions occasionally tighten plugin API contracts; if any fail, read the actual error before retrying. Do not paper over with `// @ts-ignore`.

- [ ] **Step 5: Verify the dev server still starts**

Run: `cd /d/kaizen/frontend && timeout 10 npm run dev 2>&1 | head -20`

Expected: `VITE v7.x.y  ready in N ms` plus the local URL line. `timeout 10` prevents the dev server from blocking the task. If on Windows Bash without `timeout`, run `npm run dev` interactively and Ctrl-C once you see the ready line.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "fix(deps): patch vite/picomatch/postcss CVEs

npm audit fix applied. Resolves:
- vite 7.0.0-7.3.1 (HIGH: server.fs.deny bypass, ws file read,
  optimized-deps path traversal)
- picomatch 4.0.0-4.0.3 (HIGH: method injection, extglob ReDoS)
- postcss <8.5.10 (MODERATE: stringify XSS)

Dev/build-time only; no runtime API changes."
```

---

## Task 4: Q-CC-2 — Make backend CORS env-driven

**Why:** `SecurityConfig.corsConfigurationSource()` hardcodes `http://localhost:5173` and `http://localhost:4173`. This works for dev but blocks any deployed frontend with a 403 on preflight. The fix is to bind the allowed-origins list to a property and override it per profile.

**Files:**
- Modify: `backend/src/main/java/com/kaizen/backend/config/SecurityConfig.java:81-98`
- Modify: `backend/src/main/resources/application.yml` (after the `app:` section, add `cors:` config block)
- Modify: `backend/src/main/resources/application-dev.yml` (explicit dev origins)
- Modify: `backend/src/main/resources/application-staging.yml` (placeholder requiring env var)
- Modify: `backend/src/main/resources/application-prod.yml` (placeholder requiring env var)
- Modify: `backend/.env.example` (document `APP_CORS_ALLOWED_ORIGINS`)
- Test: `backend/src/test/java/com/kaizen/backend/config/SecurityConfigCorsTest.java` (new — verifies origins are read from properties)

- [ ] **Step 1: Locate any existing test for SecurityConfig and the test base directory**

Run: `find /d/kaizen/backend/src/test -name "SecurityConfig*" -o -name "*Cors*"`

Expected: likely empty. If there's already a CORS test, extend it instead of creating a new file in Step 6.

- [ ] **Step 2: Write the failing test first (TDD)**

Create `backend/src/test/java/com/kaizen/backend/config/SecurityConfigCorsTest.java`:

```java
package com.kaizen.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@SpringBootTest
@TestPropertySource(properties = {
        "app.cors.allowed-origins=https://example.test,https://other.test"
})
class SecurityConfigCorsTest {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void corsConfigurationReadsAllowedOriginsFromProperty() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/anything");

        CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins())
                .containsExactly("https://example.test", "https://other.test");
    }
}
```

- [ ] **Step 3: Run the test to confirm it fails**

Run: `cd /d/kaizen/backend && mvn -B -q -Dtest=SecurityConfigCorsTest test`

Expected: test fails. The current hardcoded list `[http://localhost:5173, http://localhost:4173]` won't match `[https://example.test, https://other.test]`. Confirm the failure message references the assertion before continuing.

- [ ] **Step 4: Make the SecurityConfig CORS bean read from a property**

Open `backend/src/main/java/com/kaizen/backend/config/SecurityConfig.java`. Add a property field and modify the bean:

Add this import near the existing imports (after the `org.springframework.context.annotation.Bean` import):

```java
import org.springframework.beans.factory.annotation.Value;
```

Add this field near the top of the class (after the existing `private final ApplicationContext applicationContext;` line):

```java
    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;
```

Replace the existing `corsConfigurationSource` bean (currently lines 81–98) with:

```java
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin",
                "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
```

What changed: removed the hardcoded `List.of("http://localhost:5173", "http://localhost:4173")` and the `// Allow common frontend development origins` comment; the field is now sourced from the `app.cors.allowed-origins` property (Spring auto-binds comma-separated values to `List<String>`).

- [ ] **Step 5: Add `app.cors.allowed-origins` to `application.yml`**

Open `backend/src/main/resources/application.yml`. The `app:` section currently ends at the `validation:` block. Inside the `app:` section (after the `validation:` block, before the file ends), add:

```yaml
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:}
```

The empty default means: if no profile-level value or env var is set, the list is empty and no origin is allowed. Profiles must override this for the app to function.

- [ ] **Step 6: Set dev origins in `application-dev.yml`**

Open `backend/src/main/resources/application-dev.yml`. After the existing `app: security: ...` block (and before the `springdoc:` section), extend the `app:` block so it looks like:

```yaml
app:
  security:
    user:
      name: dev-user
      password: dev-password
  cors:
    allowed-origins: http://localhost:5173,http://localhost:4173
```

(Merge with the existing `app:` block — do not declare `app:` twice in the same file.)

- [ ] **Step 7: Require origins in staging/prod profiles**

Open `backend/src/main/resources/application-staging.yml`. Append (extending the existing `app:` block):

```yaml
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS}
```

Open `backend/src/main/resources/application-prod.yml`. Append the same (extending the existing `app:` block):

```yaml
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS}
```

The bare `${APP_CORS_ALLOWED_ORIGINS}` (no default) makes the env var mandatory at boot time in staging/prod — the app will fail to start if it's missing, which is the desired fail-fast behavior.

- [ ] **Step 8: Document the env var in `.env.example`**

Open `backend/.env.example`. After the existing block (under whichever section best fits — likely near the OAuth or security vars), add:

```
# CORS allowed origins (comma-separated). Required in staging/prod.
# Example: APP_CORS_ALLOWED_ORIGINS=https://app.kaizen.example,https://staging.kaizen.example
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

- [ ] **Step 9: Run the new CORS test — should now pass**

Run: `cd /d/kaizen/backend && mvn -B -q -Dtest=SecurityConfigCorsTest test`

Expected: test passes (1 test, 0 failures).

- [ ] **Step 10: Run the full backend test suite to confirm no regression**

Run: `cd /d/kaizen/backend && mvn -B -q test`

Expected: BUILD SUCCESS. The full suite was passing before this change; the property addition + bean refactor shouldn't disturb other tests, but a missing `app.cors.allowed-origins` property in any test profile would surface here.

If any test fails because the test profile doesn't set the property, add the same `app.cors.allowed-origins:` line to `backend/src/main/resources/application-test.yml` (with a value like `http://localhost`). Re-run.

- [ ] **Step 11: Manually smoke-test CORS in dev**

Start the backend (`./mvnw spring-boot:run` in `backend/` or your usual workflow) with the dev profile. From a terminal:

```bash
curl -i -X OPTIONS http://localhost:8080/api/users/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

Expected: response includes `Access-Control-Allow-Origin: http://localhost:5173`. Then repeat with `-H "Origin: http://example.com"` — expected: no `Access-Control-Allow-Origin` header (or 403 depending on Spring behavior). This confirms the env-driven list is honored.

- [ ] **Step 12: Commit**

```bash
git add backend/src/main/java/com/kaizen/backend/config/SecurityConfig.java \
        backend/src/main/resources/application.yml \
        backend/src/main/resources/application-dev.yml \
        backend/src/main/resources/application-staging.yml \
        backend/src/main/resources/application-prod.yml \
        backend/src/test/java/com/kaizen/backend/config/SecurityConfigCorsTest.java \
        backend/.env.example
git commit -m "fix(security): make CORS allowed origins env-driven

Hardcoded localhost-only origins blocked any deployed frontend with
a 403 preflight. Bind app.cors.allowed-origins via @Value, set dev
defaults in application-dev.yml, require APP_CORS_ALLOWED_ORIGINS in
staging/prod (no default, fail-fast on missing). Document in
.env.example. Add SecurityConfigCorsTest to lock in the property
binding."
```

---

## After all four tasks

- [ ] **Step A: Final full verification**

Run all from repo root in sequence:
```bash
cd /d/kaizen/frontend && npm run typecheck && npm run lint && npm run build
cd /d/kaizen/backend && mvn -B -q test
cd /d/kaizen/frontend && npm audit --production
```

Each step expected to exit 0. The npm audit should report `found 0 vulnerabilities`.

- [ ] **Step B: Open the PR**

Push the branch and open a pull request titled `fix: pre-prod first wave (build break, lockfile, deps, CORS)` referencing audit IDs B-FE-1, B-CC-1, B-FE-2, Q-CC-2 in the description. Link `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`.

---

## Self-review

**Spec coverage:** All four targeted findings have explicit tasks. B-FE-1 → Task 1 (with the 4 specific TS error sites addressed). B-CC-1 → Task 2 (delete + document). B-FE-2 → Task 3 (npm audit fix; covers vite + transitive picomatch/postcss/yaml flagged by `npm audit`). Q-CC-2 → Task 4 (env-driven CORS with profile overrides + test + .env.example).

**Placeholder scan:** No "TBD"/"TODO"/"implement later" tokens. Each code step contains complete code or an exact command. No "similar to Task N" hand-waves — Task 4's profile edits are spelled out per file.

**Type/name consistency:** Task 4's property name `app.cors.allowed-origins` matches across YAML files, the `@Value` binding, the test's `@TestPropertySource`, and the env-var name `APP_CORS_ALLOWED_ORIGINS` (Spring's relaxed binding). Task 1's `validateField` signature change to `string | null` is consistent across the body and the call sites listed.

**Untested assumptions called out:**
- Task 3 assumes `npm audit fix` won't break compatibility (no major bumps). Step 4's typecheck/lint/build catches this; the fallback (don't use `--force`) is documented.
- Task 4 assumes Spring's relaxed binding handles comma-separated env vars into `List<String>` — this is standard Spring Boot behavior and the test verifies it.
- Task 1 assumes no caller of `validateField` outside `TransactionEntryForm.tsx` exists — verified via grep (call sites at lines 397, 412, 428, 440, 461, 477 are all inside the file).
