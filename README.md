# Kaizen

<img src="frontend/public/logo.svg" alt="Kaizen" width="80" />

A full-stack personal finance tracker built for clarity and consistency. *Kaizen* (改善) — Japanese for "continuous improvement" — reflects the app's goal: helping you understand your spending habits through small, consistent tracking.

## Features

- **Authentication** — Google OAuth only; no password accounts
- **Onboarding** — guided wizard for first-time setup
- **Dashboard** — bento-grid layout with spending summary at a glance
- **Transactions** — full CRUD with **offline-first sync via IndexedDB** (changes queue locally and sync when back online), recurring transactions, receipt upload, CSV export, and bulk delete
- **Budgets** — per-category, per-period budgets with burn-rate tracking
- **Categories** — system categories + custom categories with merge support
- **Insights** — spending summary, category breakdowns, and trends over time
- **Payment Methods** — track which payment method was used per transaction
- **Account & Profile** — user settings and account management
- **Goals** *(in progress / scaffold — not yet functional)*

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Language (strict mode) |
| Vite | 7.3 | Build tool and dev server |
| Tailwind CSS | v4.2 | Styling — **CSS-first config; no `tailwind.config.*` file** — all theme tokens live in CSS |
| Redux Toolkit + RTK Query | 2.11 | Global state + server-state caching |
| React Router DOM | 7.13 | Client-side routing |
| Dexie | 4.4 | IndexedDB wrapper for offline transaction queue |
| Recharts | 3.8 | Charts and data visualization |
| Headless UI | 2.2 | Accessible unstyled UI primitives |
| Lucide React | 1.7 | Icon library |

### Backend
| Technology | Version | Role |
|---|---|---|
| Java | 21 | Language |
| Spring Boot | 3.5.13 | Application framework |
| Maven | — | Build tool |
| PostgreSQL | 16 | Primary relational database |
| Flyway | — | Database schema migrations |
| Redis | 7 | Session store and caching |
| Spring Security + Google OAuth 2.0 | — | Authentication and authorization |
| Bucket4j | 8.18 | Rate limiting |
| MapStruct | 1.6.3 | DTO mapping |
| Lombok | — | Boilerplate reduction |
| SpringDoc OpenAPI | 2.8.5 | API documentation (Swagger UI) |

### Infrastructure
| Tool | Role |
|---|---|
| Docker Compose | Local development — PostgreSQL + Redis containers |
| Nginx | Production SPA serving |
| GitHub Actions | CI/CD pipelines |
| Render | Staging deployment (backend + frontend) |

---

## Local Development Setup

### Prerequisites

- **Docker Desktop** (or Docker Engine) — required for local infrastructure
- **Node.js >= 20** — PR checks use Node 22; the staging deploy workflow uses Node 20
- **Java 21** + **Maven**
- **Git**

### 1. Start Infrastructure

From the repo root:

```bash
docker compose -f backend/docker-compose.yml up -d
```

This starts:
- **PostgreSQL 16** at `localhost:55432` (non-default port) — database `kaizen`, user `kaizen`
- **Redis 7** at `localhost:6379`

Verify both containers are healthy:

```bash
docker compose -f backend/docker-compose.yml ps
```

Flyway migrations run automatically when the backend starts. If you need to run them manually:
- **Windows (PowerShell):** run from the `backend/` directory — `cd backend` then `./migrate.ps1` (the script calls `mvn flyway:migrate` without a `-f` flag and will fail if run from the repo root)
- **Linux/macOS:** use Maven — `mvn -f backend/pom.xml flyway:migrate` — or the [Flyway CLI](https://documentation.red-gate.com/fd/command-line-184127494.html) directly (`backend/migrate.ps1` is PowerShell-only)

### 2. Configure and Start the Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`. Most variables have usable dev defaults, but these require real values:

| Variable | What you need |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_OAUTH_REDIRECT_URI` | Set to `http://localhost:8080/api/auth/google/callback` for local dev |

Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/). Add `http://localhost:8080/api/auth/google/callback` as an authorized redirect URI.

Build and run:

```bash
mvn -f backend/pom.xml -B package -DskipTests
java -jar backend/target/*.jar   # On Windows CMD use: mvn -f backend/pom.xml spring-boot:run
```

Verify the backend is up at `http://localhost:8080/swagger-ui.html` (Swagger UI) or `http://localhost:8080/actuator/health`.

### 3. Configure and Start the Frontend

```bash
cp frontend/.env.example frontend/.env
```

Set `VITE_API_BASE_URL=http://localhost:8080/api` in `frontend/.env`. This value is baked into the bundle at build time — a change requires a rebuild.

```bash
cd frontend && npm install && npm run dev
```

The app is available at **`http://localhost:5173`**. You'll be redirected to Google sign-in to confirm the OAuth flow is reachable.

**Other env vars:**
- `VITE_SENTRY_DSN` — leave blank for local development
- `VITE_BUDGET_SUGGESTION_HELP_URL` — optional; destination is a pending product decision

The Husky pre-commit hook runs ESLint and Prettier automatically on every commit. The project enforces zero ESLint warnings — a lint failure blocks the commit by design.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend API (e.g., `http://localhost:8080/api`) | Yes |
| `VITE_SENTRY_DSN` | Sentry DSN for error monitoring; leave blank to disable | No |
| `VITE_SENTRY_ENV` | Environment label sent to Sentry (e.g., `development`, `staging`) | No |
| `VITE_BUDGET_SUGGESTION_HELP_URL` | URL for budget suggestion help link; destination TBD | No |

### Backend (`backend/.env`)

| Variable | Description | Required in prod |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (e.g., `dev`, `staging`) | Yes |
| `SERVER_PORT` | HTTP port (default `8080`) | No |
| `DB_HOST` | PostgreSQL hostname | Yes |
| `DB_PORT` | PostgreSQL port (default `55432` locally; typically `5432` in prod) | No |
| `DB_NAME` | PostgreSQL database name | Yes |
| `DB_USER` | PostgreSQL username | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `REDIS_HOST` | Redis hostname | Yes |
| `REDIS_PORT` | Redis port (default `6379`) | No |
| `APP_SECURITY_USER` | Basic-auth username for actuator and admin endpoints | Yes |
| `APP_SECURITY_PASSWORD` | Basic-auth password for actuator and admin endpoints | Yes |
| `APP_AUTH_POST_AUTH_REDIRECT_URI` | SPA URL to redirect to after successful sign-in | Yes |
| `APP_AUTH_SCREEN_URI` | SPA sign-in page URL | Yes |
| `APP_AUTH_SESSION_EXPIRY_DAYS` | Rolling session lifetime in days | No |
| `APP_AUTH_TOKEN_ENCRYPTION_KEY_BASE64` | 256-bit AES key, Base64-encoded, for auth token encryption. Generate with `openssl rand -base64 32`. **The application refuses to start in prod/staging if this is absent or set to the public test default.** | Yes |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_OAUTH_REDIRECT_URI` | OAuth callback URI registered in Google Cloud Console | Yes |
| `APP_AUTH_RATE_LIMIT_CAPACITY` | Bucket4j rate limit capacity (max requests per refill window per IP) | No |
| `APP_AUTH_RATE_LIMIT_REFILL_SECONDS` | Bucket4j refill window in seconds | No |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | Yes |
| `SENTRY_DSN` | Sentry DSN for backend error monitoring | No |
| `SENTRY_ENABLED` | Enable Sentry reporting (`true` in prod/staging) | No |
| `SENTRY_ENVIRONMENT` | Environment label sent to Sentry (e.g., `production`, `staging`) | No |
| `DB_USE_EMBEDDED` | Use embedded/Testcontainers Postgres — **local dev only, ignored in prod** | No |
| `DB_FALLBACK_TO_H2` | Fall back to H2 — **local dev only, ignored in prod** | No |

> Any addition or change to env-var usage must update the corresponding `.env.example` in the same commit (per [`AGENTS.md`](./AGENTS.md) policy).

---

## Project Structure

```
kaizen/
├── .github/
│   └── workflows/               # 4 CI/CD workflow files (see CI/CD section)
├── backend/
│   ├── docker-compose.yml       # Local infrastructure only (Postgres + Redis)
│   ├── migrate.ps1              # PowerShell-only Flyway migration helper
│   ├── .env.example             # Backend env var template
│   └── src/main/java/com/kaizen/backend/
│       ├── auth/                # Google OAuth flow, session management
│       ├── budget/              # Budget CRUD and burn-rate calculations
│       ├── category/            # System + custom categories, merge logic
│       ├── common/              # Shared utilities, base classes
│       ├── config/              # Spring configuration (security, CORS, Redis)
│       ├── insights/            # Spending summary, breakdowns, trends
│       ├── payment/             # Payment method management
│       ├── transaction/         # Transaction CRUD, recurring, export
│       └── user/                # User account and profile management
├── frontend/
│   ├── .env.example             # Frontend env var template
│   └── src/
│       ├── app/                 # Redux store, RTK Query slices, routing, providers
│       ├── features/            # Vertical feature slices (one folder per domain)
│       │   ├── budgets/
│       │   ├── categories/
│       │   ├── goals/           # scaffold / in progress
│       │   ├── home/
│       │   ├── insights/
│       │   ├── onboarding/
│       │   ├── payment-methods/
│       │   ├── transactions/
│       │   └── your-account/
│       └── shared/              # Cross-feature components, hooks, utilities
├── AGENTS.md                    # Mandatory engineering policy — all contributors must read this
└── README.md                    # This file
```

---

## CI/CD

Four GitHub Actions workflows run on pull requests and merges to `main`:

### `frontend-pr.yml`
**Trigger:** PR touching `frontend/**`
1. Typecheck — `npm run typecheck`
2. Lint — `npm run lint` (zero warnings enforced; fails the build on any warning)
3. Build — `npm run build`
4. Docker build — verifies the Nginx production image builds cleanly

### `backend-pr.yml`
**Trigger:** PR touching `backend/**`
1. Maven build — `mvn -f backend/pom.xml -B package -DskipTests`
2. SpotBugs static analysis — **blocks merge if it fails**
3. Docker build — verifies the backend image builds cleanly

### `backend-deploy-staging.yml`
**Trigger:** Push to `main` touching `backend/**`
1. Maven build (`-DskipTests`)
2. SpotBugs — blocks the deploy if it fails
3. Render deploy hook — triggers the staging backend deploy
4. Health-check poll — polls `/actuator/health/readiness` up to 30 times to confirm startup

### `frontend-deploy-staging.yml`
**Trigger:** Push to `main` touching `frontend/**`
1. Typecheck — `npm run typecheck`
2. Lint — `npm run lint`
3. Build — `npm run build`
4. Render deploy hook — triggers the staging frontend deploy

> **Note on backend tests:** Backend integration tests are currently skipped in all CI pipelines (`-DskipTests`). To run tests locally: `mvn -f backend/pom.xml test`. This is an open gap, not a confirmed architectural decision.

---

## Contributing

**Branching:** All work happens in short-lived feature branches off `main`. PRs target `main` directly — there are no secondary long-lived branches.

**Commit style:** [Conventional Commits](https://www.conventionalcommits.org/) with type and scope:
```
feat(transactions): add CSV export modal
fix(budgets): correct burn-rate calculation for mid-month budgets
```

**Pull requests:** Use the template at `.github/pull_request_template.md` — a 1–2 sentence description and a technical implementation bullet list with a type checklist.

**Quality gates:** Every PR must pass:
- Zero ESLint warnings (`--max-warnings=0`)
- TypeScript compiles cleanly (`npm run typecheck`)
- SpotBugs passes on backend changes

The Husky pre-commit hook enforces ESLint + Prettier automatically on every commit.

**Full engineering policy:** See [`AGENTS.md`](./AGENTS.md) at the repo root before contributing.
