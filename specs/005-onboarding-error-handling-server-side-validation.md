---

# Product Requirements Document
## Onboarding Error Handling & API Validation

---

### 1. Document Header

| Field | Value |
|---|---|
| **Product / Feature Name** | Onboarding Error Handling & Server-Side Validation |
| **Version** | 1.0 |
| **Status** | Draft |
| **Last Updated** | *(leave blank — fill before review)* |
| **Author** | *(leave blank — fill before review)* |
| **Source Stories** | Story 25, Story 26 |

---

### 2. Problem Statement

Today, users progressing through the onboarding flow encounter failures — network interruptions, invalid input, rejected submissions — without receiving actionable feedback. When errors occur, the interface either surfaces raw technical messages that a general user cannot interpret or provides no guidance at all. Worse, any data a user has already entered is frequently lost upon failure, forcing them to start over from scratch.

This compounds into a material onboarding drop-off problem. A user who hits an unrecoverable error on step three of onboarding — because their starting balance exceeded an undisclosed limit, or because a budget category was submitted as a duplicate — has no path forward except abandonment. Each silent failure or cryptic error message is a direct conversion loss and an avoidable trust deficit.

Success looks like this: a user who encounters any error during onboarding — whether a dropped connection, a validation rejection, or a bad input — receives a message that describes exactly what went wrong in plain language, is offered an immediate path to correct it (a retry button, a corrected field, an explanation), and never loses previously entered data in the process. On the server side, no malformed or semantically invalid payload reaches application logic — bad data is caught at the boundary and rejected with structured, human-readable error responses before it can corrupt state.

---

### 3. User Personas

---

**Persona 1 — Onboarding User**

| Field | Content |
|---|---|
| **Persona Name** | Onboarding User |
| **Role** | User |
| **Primary Goal** | Complete the onboarding flow successfully and begin using the product without confusion or repeated input |
| **Key Pain Points** | Cannot interpret technical error messages; loses form progress when errors occur; has no feedback on what specifically is wrong or how to fix it; network failures block progress entirely with no recovery path |
| **Stories Owned** | Story 25 |

---

**Persona 2 — Backend / Integration Developer**

| Field | Content |
|---|---|
| **Persona Name** | API Developer |
| **Role** | Developer |
| **Primary Goal** | Ensure that the onboarding API only accepts semantically valid data, protecting downstream business logic and data integrity |
| **Key Pain Points** | No enforced server-side validation means invalid payloads — negative balances, duplicate categories, budgets exceeding available balance — can silently enter the system and cause inconsistent application state |
| **Stories Owned** | Story 26 |

---

### 4. Feature List

*(Priority order: Story 25 addresses user-facing onboarding integrity — the highest-impact user drop-off risk. Story 26 addresses server-side correctness — a critical dependency for Story 25's error messaging to be meaningful.)*

---

**Feature 1: User-Facing Onboarding Error Handling**

A system of client-side error states that intercepts failures during onboarding, presents user-intelligible messages, enables retry without data loss, and routes errors to an observability backend.

User stories under this feature:
1. *"As a user, I want clear error messages during onboarding so that I can fix problems."* (Story 25)

Core value: Users who encounter errors during onboarding are informed, unblocked, and never penalized with data loss.

---

**Feature 2: Onboarding API Input Validation**

Server-side validation layer on all onboarding endpoints that rejects structurally or semantically invalid payloads with a `400` status and structured, human-readable error bodies before any business logic executes.

User stories under this feature:
1. *"As a developer, I want onboarding API endpoints validated so that bad data is rejected."* (Story 26)

Core value: Invalid data is stopped at the API boundary, protecting data integrity and providing the precise error context needed for Story 25's client-side messaging to be accurate.

---

### 5. Acceptance Criteria

---

**Story 25:** *"As a user, I want clear error messages during onboarding so that I can fix problems."*

**Network Error Handling**

- [ ] Given the user is on any onboarding step, when a network request fails due to a connectivity timeout or unreachable server, then the interface displays a user-readable message (e.g., "We couldn't reach our servers. Check your connection and try again.") — not a raw HTTP status code, stack trace, or technical exception string.
- [ ] Given a network error has been displayed, when the user views the error state, then a visible **Retry** button is present on the screen.
- [ ] Given the user clicks Retry, when the retry request succeeds, then the onboarding flow continues from the same step without requiring re-entry of any previously submitted field.
- [ ] Given the user clicks Retry, when the retry request fails again, then the error message remains visible and the Retry button remains actionable.

**User-Friendly Messaging**

- [ ] Given any error state is triggered (network, validation, server), when the error message is rendered, then the message contains: (a) a plain-language description of what went wrong, and (b) at least one concrete corrective action the user can take.
- [ ] Given any error state is triggered, when the error message is rendered, then no raw technical content is visible to the user — including but not limited to: HTTP status codes presented in isolation, stack traces, internal service names, database error strings, or unformatted JSON.

**Input Preservation on Error**

- [ ] Given the user has filled in one or more fields on an onboarding step, when a network or server error occurs during submission, then all field values the user entered remain populated in the form after the error is displayed.
- [ ] Given the user has filled in one or more fields on an onboarding step, when a validation error is returned from the server, then all field values remain populated, and only the invalid field(s) are highlighted with their corresponding error message.

**Error Logging**

- [ ] Given any error occurs during onboarding (network, server `4xx`, server `5xx`), when the error is caught, then an error event is sent to Sentry containing: (a) error type, (b) the onboarding step at which the error occurred, and (c) a timestamp.
- [ ] Given a validation error (`400`) is returned by the server, when the error is caught, then the `400` is *not* logged to Sentry as an exception [INFERRED — verify with author: validation errors are expected errors and likely should not pollute error tracking, but confirm with team].

---

**Story 26:** *"As a developer, I want onboarding API endpoints validated so that bad data is rejected."*

**Balance Validation**

- [ ] Given a request to submit onboarding data, when the `balance` field is zero or negative, then the API returns `400` with a response body identifying the field (`balance`) and stating that it must be a positive number.
- [ ] Given a request to submit onboarding data, when the `balance` field exceeds the defined maximum allowed limit, then the API returns `400` with a response body identifying the field (`balance`) and stating the maximum permitted value. [INFERRED — verify with author: the maximum limit value itself must be defined and documented separately]
- [ ] Given a request to submit onboarding data, when the `balance` field is absent or non-numeric, then the API returns `400` with a response body identifying the field and the type requirement.

**Budget Amount Validation**

- [ ] Given a request containing one or more budget entries, when any budget amount is zero or negative, then the API returns `400` identifying the offending budget entry and stating that budget amounts must be positive.
- [ ] Given a restriction rule is in effect that budget amounts must not exceed the submitted balance [INFERRED — verify with author: confirm whether this constraint is always enforced or conditional], when a budget amount exceeds the balance, then the API returns `400` identifying the offending budget entry and the constraint being violated.
- [ ] Given a request containing budget entries, when the combined total of all budget amounts exceeds the submitted balance under a restricted mode [INFERRED — verify with author], then the API returns `400` with a message indicating the overage amount.

**Category Validation**

- [ ] Given a request containing one or more category selections, when any selected category ID does not exist in the system's category reference data, then the API returns `400` identifying the invalid category ID.
- [ ] Given a request containing category selections, when the same category appears more than once in the request payload, then the API returns `400` identifying the duplicated category.

**Response Format**

- [ ] Given any validation failure, when the API returns `400`, then the response body is a structured object (e.g., JSON) containing at minimum: (a) a top-level `errors` array, (b) each entry identifying the `field` name and a human-readable `message`, and (c) no internal stack traces or database error strings.
- [ ] Given a fully valid request payload, when the API processes the submission, then the response is not `400` and onboarding data is persisted correctly.

**Validation Test Coverage**

- [ ] Given the validation layer is implemented, when the test suite is run, then there is at minimum one automated test per validation rule (balance positive, balance max, budget positive, budget ≤ balance, category exists, category not duplicated) covering both the invalid and valid cases.

---

### 6. Technical Constraints

**6a. Functional Constraints**

- The client must never expose raw server error responses directly to the user interface. All server error payloads must be mapped to user-facing copy before rendering. [INFERRED — verify with author: confirm whether a centralized error message mapping layer or per-component handling is preferred]
- Retry behavior must be idempotent: retrying a failed onboarding submission must not result in duplicate records or partial state writes on the server side. [INFERRED — verify with author]
- Server-side validation must execute before any business logic (e.g., balance allocation, category assignment). No partial persistence of an invalid payload is permitted.
- The API must return `400` specifically for client-input validation failures. `500` must be reserved for unhandled server-side errors and must not be used as a substitute for failed validation.

**6b. Data Constraints**

- User-entered onboarding field values (balance, budget amounts, category selections) must be retained in client state across error events and must not be cleared on a failed submission attempt.
- Error events logged to Sentry must not include raw user-entered financial values (e.g., balance amounts) in the log payload to avoid exposing PII or sensitive financial data in observability tooling. [INFERRED — verify with author]
- The maximum permitted `balance` value referenced in Story 26 must be stored as a configurable application constant, not hardcoded in validation logic. [INFERRED — verify with author]
- Budget category reference data used for existence validation must be sourced from the same data store used throughout the rest of the application to prevent validation against a stale or divergent list. [INFERRED — verify with author]

**6c. Integration Constraints**

- **Sentry**: Story 25 explicitly requires error logging to Sentry. The onboarding client module must be instrumented with the Sentry SDK. Sentry DSN configuration and environment tagging (e.g., `production`, `staging`) must be established prior to release.
- **Onboarding API Endpoints**: Story 26 implies at minimum one API endpoint that accepts balance, budget amounts, and category selections as a payload. The exact endpoint contract (URL, HTTP method, request schema) must be defined and shared between client and server teams before implementation begins. [INFERRED — verify with author]
- **Category Reference API or Data Source**: Validation of category existence (Story 26) implies the server has access to an authoritative list of valid categories at request time. Whether this is a database lookup, an in-memory cache, or a call to a separate service must be decided before implementation. [INFERRED — verify with author]

---

### 7. Success Metrics

| Feature Area | Metric | Measurement Method | Target |
|---|---|---|---|
| User-Facing Error Handling | Onboarding completion rate among users who encounter at least one error | Funnel analytics segmented by error occurrence | [TBD — set by product owner] |
| User-Facing Error Handling | Retry success rate (user clicks Retry → onboarding completes) | Event tracking on Retry button interactions | ≥ 70% [INFERRED — verify with author] |
| User-Facing Error Handling | Error events captured in Sentry per onboarding session | Sentry dashboard — event volume and session attribution | 100% of non-`400` errors captured |
| User-Facing Error Handling | Incidence of raw technical strings visible in user-facing error UI | QA audit / automated screenshot regression | 0 occurrences in production |
| API Input Validation | Rate of invalid payloads reaching business logic layer (past validation) | Server-side logging of validation bypass events | 0% |
| API Input Validation | Automated test coverage across all validation rules | CI test report — pass/fail per validation rule | 100% of defined rules have a passing test |
| API Input Validation | `400` response time for invalid payloads | API performance monitoring | [TBD — set by product owner] |

---

### 8. Out of Scope

- This PRD does not cover onboarding steps, screens, or flows outside of error and validation states — the happy path onboarding UX is assumed to be defined elsewhere.
- This PRD does not cover front-end form validation (client-side pre-submission checks). Story 26 is scoped to server-side validation only; client-side validation is not specified and would require a separate story.
- This PRD does not cover the definition of onboarding budget categories themselves — their creation, management, or display is assumed to be handled by a separate feature.
- This PRD does not cover user authentication or session management during onboarding.
- This PRD does not cover error handling outside of the onboarding flow. Other product areas (dashboard, transaction entry, settings) require separate error handling specifications.
- This PRD does not cover Sentry alerting rules, notification routing, or triage workflows — only the instrumentation and capture of events is in scope.
- This PRD does not cover localization or translation of error messages.
- This PRD does not cover accessibility requirements for error states (e.g., ARIA live regions, screen reader announcements) — these should be addressed in a design or accessibility specification. [INFERRED — verify with author whether this is intentionally deferred]

---

### 9. Open Questions

| # | Question | Relevant Story | Impact if Unresolved |
|---|---|---|---|
| 1 | What is the maximum allowed balance value referenced in the validation task? Is this a fixed business rule, a configurable limit, or per-user? | Story 26 | Cannot implement or test balance upper-bound validation without a defined value |
| 2 | Is the constraint that budget amounts must not exceed the balance always enforced, or only in a specific "restricted mode"? What determines whether a user is in restricted mode? | Story 26 | The budget-vs-balance validation rule cannot be correctly scoped without knowing its conditionality |
| 3 | Should `400` validation errors be logged to Sentry? The story requires all errors to be logged (Story 25), but logging expected client errors may pollute observability tooling. | Story 25, Story 26 | Determines error logging policy and may affect Sentry noise levels and alert thresholds |
| 4 | What is the exact API contract for the onboarding submission endpoint — URL, HTTP method, and full request/response schema? | Story 26 | Without a shared contract, client and server implementations may diverge on field names, data types, and error response structure |
| 5 | Should the Retry button re-attempt only the failed request, or re-run all onboarding steps from a checkpoint? | Story 25 | Affects state management architecture and the risk of duplicate data creation on the server |
| 6 | Does "preserve user input on error" apply to file inputs or sensitive fields (e.g., if any future onboarding step involves document upload or passwords)? | Story 25 | Determines whether input preservation logic requires special handling for non-text field types |
| 7 | Is there a maximum number of retry attempts before the user is shown a different message or directed to support? | Story 25 | Without a retry cap, a persistent server outage could leave the user in an infinite retry loop |
| 8 | Who owns the user-facing error message copy — product, engineering, or UX? Where is this copy maintained (hardcoded, CMS, i18n file)? | Story 25 | Affects implementation architecture and future maintainability of error strings |

---

*End of PRD — v1.0 Draft*
*All items marked `[INFERRED — verify with author]` require confirmation before development begins.*