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
