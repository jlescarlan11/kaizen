# Coding Standards

## 0) Global Principles (Applies Everywhere)

- Clarity > cleverness. Prefer readable, boring code.
- Small units. Functions/classes should do one thing.
- No silent failures. Handle errors explicitly; log with context.
- Deterministic behavior. Avoid hidden global state and time-dependent logic without clear boundaries.
- Security by default. Validate inputs; least privilege; never log secrets.

## 1) TypeScript (Vite) Web App Standards

### 1.1 Project Structure

Recommended:

```text
src/
  app/              // app wiring (providers, routes, bootstrapping)
  features/         // feature modules (vertical slice)
    auth/
      api/
      components/
      hooks/
      types.ts
      index.ts
  shared/
    components/
    hooks/
    lib/            // utilities, fetch wrappers, formatting, etc.
    styles/
  assets/
  tests/
```

Rules:

- Prefer feature-first organization (`features/*`) over type-first (`components/*`) for maintainability.
- `shared/` is only for truly reusable things.

### 1.2 TypeScript Rules

- Strict mode required (`"strict": true`).
- No `any` in app code. If unavoidable, isolate and explain with a comment.
- Prefer `unknown` + type guards over `any`.
- Avoid `enum` unless runtime values are needed; prefer string unions.
- Use explicit return types for exported functions and public APIs.

### 1.3 Naming Conventions

- `camelCase` for variables/functions.
- `PascalCase` for components/classes/types.
- `UPPER_SNAKE_CASE` only for compile-time constants.
- Files:
- React components: `UserCard.tsx`
- hooks: `useUser.ts`
- utilities: `formatCurrency.ts`
- tests: `UserCard.test.tsx`

### 1.4 React/Frontend Patterns

- Keep components pure when possible (derive UI from props/state).
- Prefer controlled inputs when feasible.
- Keep side effects in `useEffect` / `useMutation` / `useQuery` (or equivalent), not in render.
- Use `useMemo`/`useCallback` only when measured and justified by real performance issues.

### 1.5 State & Data Fetching

- Separate server state (fetched) vs UI state (local).
- Data fetching must:
- Have typed request/response contracts.
- Handle loading/error/empty states.
- Use cancellation where appropriate (`AbortController`).

### 1.6 Error Handling

- Never swallow errors.
- User-facing errors must be friendly, actionable, and not leak internals.
- Log errors with operation name, identifiers (request id/entity id), and user-safe context only.

### 1.7 Styling

- Use one styling system per app (e.g., Tailwind OR CSS Modules OR styled-components).
- No random inline styles unless it is a one-off dynamic value.
- Prefer design tokens: spacing scale, font scale, color palette.

### 1.7.1 Typography Standards (Tailwind CSS Only)

Use this guide for all typography across the app. The goal is consistent hierarchy, readability, accessibility, and visual calm.

Core principles:

- Use Tailwind CSS utilities only.
- Use semantic HTML elements for text whenever possible.
- Use a fixed set of typography roles.
- Do not use random font sizes, weights, tracking, or colors.
- Keep typography clean, predictable, and accessible.
- Prefer consistency over visual experimentation.

Approved typography roles:

- `display`
- `h1`
- `h2`
- `h3`
- `h4`
- `body-lg`
- `body`
- `body-sm`
- `label`
- `caption`
- `code`

Do not invent new text styles unless there is a strong product reason.

Standard Tailwind class mapping:

- `display`: `text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground`
- `h1`: `text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground`
- `h2`: `text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-foreground`
- `h3`: `text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground`
- `h4`: `text-lg md:text-xl font-medium leading-snug text-foreground`
- `body-lg`: `text-lg leading-7 text-muted-foreground`
- `body`: `text-base leading-7 text-foreground`
- `body-sm`: `text-sm leading-6 text-muted-foreground`
- `label`: `text-sm font-medium leading-none text-foreground`
- `caption`: `text-xs leading-5 text-muted-foreground`
- `code`: `text-sm font-mono leading-6 text-foreground`

Role usage:

- `display`: hero headlines and major marketing banners only. Do not use in dashboards, forms, cards, or regular app pages.
- `h1`: main page title, usually once per page.
- `h2`: major page sections.
- `h3`: card titles, panel titles, modal titles, and subsection headers.
- `h4`: smaller grouped section titles.
- `body-lg`: prominent supporting text, introductions, and important descriptions.
- `body`: normal paragraph text and default text style.
- `body-sm`: secondary text, metadata, and compact descriptions.
- `label`: form labels and control labels.
- `caption`: helper text, timestamps, hints, and microcopy.
- `code`: inline code, commands, and technical values.

Font weight rules:

- Allowed: `font-normal`, `font-medium`, `font-semibold`
- Headings use `font-semibold`.
- Labels use `font-medium`.
- Body text uses `font-normal`.
- Do not use `font-thin`, `font-extralight`, `font-light`, `font-bold`, `font-extrabold`, or `font-black` unless explicitly required.

Line height rules:

- `text-xs` -> `leading-5`
- `text-sm` -> `leading-6`
- `text-base` -> `leading-7`
- `text-lg` -> `leading-7`
- `text-xl` and above -> `leading-snug` or `leading-tight`
- Use `leading-tight` for `display` and `h1`.
- Use `leading-snug` for `h2`, `h3`, and `h4`.
- Use relaxed line height for body text.

Tracking rules:

- `tracking-tight` for headings only.
- Default tracking for body text.
- `tracking-wide` only for rare uppercase micro-labels.
- Do not add tracking to paragraphs or mix tracking styles in one component without reason.

Color rules:

- Use semantic text color tokens only: `text-foreground`, `text-muted-foreground`, `text-subtle-foreground`, and `text-on-*` tokens for filled colored surfaces.
- Use exactly three neutral text levels on neutral surfaces:
- `text-foreground` for primary text such as headings, labels, important actions, and core body copy.
- `text-muted-foreground` for secondary/supporting text such as descriptions, helper text, and explanatory content.
- `text-subtle-foreground` for metadata and low-emphasis microcopy such as timestamps, overlines, and status context.
- Do not introduce additional neutral text color levels unless there is a documented product requirement.
- Use `text-muted-foreground` for secondary/supporting text on neutral surfaces only.
- Use `text-subtle-foreground` for metadata and low-emphasis microcopy on neutral surfaces only.
- If text sits on a filled colored background, use the matching `text-on-*` token.
- If text sits on a subtle tinted surface, prefer `text-foreground` unless contrast testing proves another token is safer.
- Do not use semantic colors for ordinary body text; reserve semantic/on-color text tokens for filled semantic surfaces, badges, alerts, validation, and meaning-carrying UI.
- Do not use brand/accent tokens as a general-purpose text color.
- Do not use arbitrary color utilities such as `text-black`, `text-white`, `text-gray-500`, `text-zinc-600`, or `text-slate-700`.

Responsive rules:

- Usually responsive: `display`, `h1`, `h2`, sometimes `h3`
- Usually not responsive: `body`, `body-sm`, `label`, `caption`
- Good: `text-3xl md:text-4xl`, `text-2xl md:text-3xl`
- Avoid scaling normal paragraph text responsively unless there is a strong reason.

Semantic HTML rules:

- Choose the correct element first, then style it.
- Use `<h1>` for page title.
- Use `<h2>` for major section title.
- Use `<h3>` for card/panel/subsection title.
- Use `<h4>` for smaller grouped title.
- Use `<p>` for paragraph text.
- Use `<label>` for form label.
- Use `<span>` for short inline text when needed.
- Use `<code>` for code or commands.
- Do not use a `<div>` for text if a semantic text element is more appropriate.

Spacing rules for text groups:

- Preferred patterns: `space-y-1`, `space-y-2`, `space-y-3`, `space-y-4`
- `label + hint`: `space-y-1`
- `heading + description`: `space-y-2`
- `paragraph groups`: `space-y-4`
- Do not stack text with inconsistent manual margins unless necessary.

Accessibility rules:

- Normal body text should usually be at least `text-base`.
- Avoid tiny text for critical content.
- Maintain clear visual hierarchy.
- Text contrast must meet WCAG AAA wherever practical for text content.
- Use a minimum of `7:1` for normal text and `4.5:1` for large text when defining or changing theme tokens.
- Filled interactive and semantic surfaces must keep text at AAA contrast across base, hover, and active states.
- UI borders, focus indicators, icons, and non-text controls must meet at least `3:1`.
- Focus indicators must remain clearly visible in both light and dark themes.
- Hover and active states must not reduce text contrast below the required threshold.
- Use readable contrast through semantic theme tokens.
- Do not rely on color alone to convey meaning.
- Keep paragraphs readable with proper line height.
- Avoid long blocks of uppercase text.

Filled surface text rules:

- Neutral surfaces: `text-foreground` by default.
- Primary/success/error/warning/info filled surfaces: use the matching `text-on-*` token unless the system has been explicitly validated for a foreground-only model.
- If using a foreground-only model on filled surfaces, each base, hover, and active token must be contrast-tested before use.
- Do not assume a brand or semantic fill is safe with `text-foreground` without measurement.

Theme token rules:

- Theme token changes are not complete until both light and dark mode contrasts are verified.
- When updating `primary`, `error`, `warning`, `info`, or `success` fills, also verify `hover`, `active`, `light/subtle`, border, and focus-ring tokens.
- Light and dark themes must feel like the same product: preserve the same role mapping, component structure, and emphasis hierarchy across themes.

Standard UI patterns:

```html
<!-- Page Header -->
<div class="space-y-2">
  <h1 class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground">
    Dashboard
  </h1>
  <p class="text-base leading-7 text-muted-foreground">
    Monitor activity, metrics, and recent updates.
  </p>
</div>

<!-- Section Header -->
<div class="space-y-1">
  <h2 class="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-foreground">
    Analytics
  </h2>
  <p class="text-sm leading-6 text-muted-foreground">
    Performance overview for the last 30 days.
  </p>
</div>

<!-- Card Header -->
<div class="space-y-2">
  <h3 class="text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground">
    Revenue
  </h3>
  <p class="text-sm leading-6 text-muted-foreground">
    Total revenue generated this month.
  </p>
</div>

<!-- Form Field -->
<div class="space-y-1">
  <label class="text-sm font-medium leading-none text-foreground">
    Email address
  </label>
  <input class="w-full rounded-md border px-3 py-2" />
  <p class="text-xs leading-5 text-muted-foreground">
    We'll never share your email.
  </p>
</div>

<!-- Inline Code -->
<p class="text-base leading-7 text-foreground">
  Run <code class="text-sm font-mono leading-6 text-foreground">npm run build</code> before deployment.
</p>
```

Strict do and do not rules:

- Do use approved typography roles only.
- Do use semantic HTML.
- Do use semantic color tokens.
- Do use the three-level neutral text hierarchy consistently.
- Do keep hierarchy clear.
- Do keep body text readable.
- Do use `tracking-tight` only for headings.
- Do use `font-medium` and `font-semibold` intentionally.
- Do keep styles consistent across similar UI patterns.
- Do not use arbitrary values like `text-[15px]` unless explicitly required.
- Do not mix too many font sizes in a single component.
- Do not use random gray or black text colors.
- Do not use extra-bold weights for normal UI.
- Do not use tiny text for important information.
- Do not overuse uppercase.
- Do not make every text element responsive.
- Do not style text differently just to make it feel unique.

Quick decision guide:

- Hero or marketing headline -> `display`
- Main page title -> `h1`
- Major page section -> `h2`
- Card, panel, modal, or subsection title -> `h3`
- Small grouped section title -> `h4`
- Prominent supporting description -> `body-lg`
- Normal paragraph -> `body`
- Secondary/supporting text -> `body-sm`
- Form control text -> `label`
- Tiny helper text or metadata -> `caption`
- Code or commands -> `code`

Final agent instruction:

- Follow a strict Tailwind-only typography system.
- Use semantic HTML tags.
- Use semantic color tokens only.
- Use exactly three neutral text levels on neutral surfaces: `text-foreground`, `text-muted-foreground`, and `text-subtle-foreground`.
- Use `tracking-tight` only on headings.
- Use only `font-normal`, `font-medium`, and `font-semibold`.
- Avoid arbitrary font sizes unless explicitly required.
- Only headings should usually scale responsively.
- Keep body text readable and stable.
- Maintain calm, clean, consistent typography across the app.

### 1.8 Linting / Formatting (Enforced)

- Prettier for formatting.
- ESLint for correctness.
- Must pass:
- `npm run lint`
- `npm run typecheck`
- `npm test`

### 1.9 Testing Standards

- Unit test: pure utilities, reducers/state logic.
- Component test: critical interaction flows.
- Test behavior, not implementation details.
- Every bug fix should include a regression test when reasonable.

## 2) Java + Spring Boot Backend Standards

### 2.1 Layering

Preferred layers:

- Controller: HTTP boundary only (validation, mapping, status codes)
- Service: business logic, transactions
- Repository: persistence only
- Domain/Model: entities/value objects
- DTOs: request/response objects (never expose entities directly)

Rules:

- Controllers should not talk directly to repositories.
- Services should not return JPA entities to controllers for responses.

### 2.2 Naming Conventions

- Classes: `PascalCase`
- Methods/vars: `camelCase`
- Packages: lowercase, segmented by domain (`com.company.product.feature.*`)
- DTOs: `CreateUserRequest`, `UserResponse`
- Exceptions: `UserNotFoundException`

### 2.3 API & DTO Rules

- Validate all external inputs (`@Valid`, `@NotNull`, `@Size`, etc.).
- Define clear structured JSON error responses: `code`, `message`, `details`, `traceId`.
- Version APIs when needed: `/api/v1/...`.

### 2.4 Transaction Rules

- Business operations requiring atomicity must be transactional (`@Transactional`) at service layer.
- Avoid external calls inside DB transactions unless necessary.
- No hidden writes; mutating methods must be named clearly (`create`, `update`, `delete`, `assign`, etc.).

### 2.5 Persistence Standards (JPA/Hibernate)

- Avoid `EAGER` fetch by default; prefer `LAZY` + explicit fetching.
- Prevent N+1 queries using fetch joins/entity graphs/projections.
- Prefer pagination for list endpoints.
- Use indexes for foreign keys, frequently filtered columns, and uniqueness constraints.

### 2.6 Logging & Observability

- Use structured logging (key/value).
- Do not log passwords, tokens, or full PII payloads.
- Log with `traceId`/request id, user id (if available), and operation name.
- Expose health checks: `/actuator/health`.

### 2.7 Security Standards

- Require authentication/authorization for protected endpoints.
- Apply least privilege to roles/scopes.
- Validate and sanitize path params, query params, and request body.
- Use CSRF protection where applicable (web forms).
- Never embed committed secrets in config.

### 2.8 Code Style

- Prefer constructor injection over field injection.
- Keep methods short (target <= 40 lines; exceptions require justification).
- Avoid utility god classes.
- Prefer immutability (`final` fields, value objects).

### 2.9 Testing Standards

- Unit tests for service logic (mock repositories).
- Integration tests for controllers + serialization + validation.
- Repository tests for non-trivial custom queries.
- Every endpoint should have happy path + validation failure + auth failure test (if protected).

## 3) Data Structures & Algorithm Efficiency Standards (Required)

### 3.1 Minimum Expectations

When writing non-trivial logic, state:

- Time complexity (Big-O)
- Space complexity
- Expected input sizes (roughly)

Example:

```ts
// Complexity: O(n log n) time, O(n) space. n = number of items.
```

### 3.2 Default Data Structure Choices

- `HashMap` / `Map`: fast key lookup (average O(1))
- `Array` / `List`: iteration, small collections, stable order
- `Set`: membership tests, uniqueness
- `Deque` / `Queue`: BFS, streaming
- `Heap` / `PriorityQueue`: top-K, scheduling, best-first search
- `TreeMap` / `SortedMap`: ordered keys, range queries

Rules:

- Nested loops must be justified or optimized.
- Avoid repeated `.includes()` on large arrays inside loops; use `Set`.

### 3.3 No Accidental O(n^2) Rules

Common pitfalls:

- Searching an array inside a loop (`find`, `filter`, `includes`)
- String concatenation in loops (prefer builder/join)
- Re-sorting repeatedly (sort once, then scan)
- Multiple large passes when one pass is possible

Required practice:

- If `n` could exceed ~10k, assume O(n^2) is unacceptable unless proven safe.

### 3.4 When to Optimize

Optimize when code is:

- Per-request backend hot path
- Rendering-critical frontend path
- Processing large lists/files
- Running in scheduled jobs with growing data

Otherwise prefer correctness + clarity first, while avoiding obvious inefficiencies.

### 3.5 Common Patterns (Preferred)

- Two-pointer for sorted arrays/ranges
- Hashing for frequency counts and dedupe
- Prefix sums for range queries
- Binary search on sorted collections
- BFS/DFS with explicit visited sets to avoid cycles

### 3.6 Memory Standards

- Avoid unnecessary copies of large arrays/objects.
- Prefer streaming/chunking for large payloads.
- On backend, avoid loading huge result sets in memory; paginate or stream.

### 3.7 Performance Documentation

For algorithmic modules (parsers, schedulers, scoring engines, etc.):

- Include small `PERF.md` or doc comment with expected input sizes, complexities, known bottlenecks, and optional benchmarks.

## 4) Enforcement (How to Make This Stick)

### 4.1 Frontend (Vite/TS)

- `eslint` + `prettier` + `typescript --noEmit`
- Pre-commit: format + lint staged files
- CI required checks: lint, typecheck, tests

### 4.2 Backend (Spring Boot)

- `spotless` or `checkstyle` for format/style
- `spotbugs` optional but recommended
- CI required checks: compile, unit + integration tests, static analysis

### 4.3 PR Rules (Both)

A PR cannot merge if:

- Lint/typecheck/tests fail
- New public API lacks tests or clear justification
- Non-trivial logic lacks complexity notes
- Security-sensitive changes lack review notes
