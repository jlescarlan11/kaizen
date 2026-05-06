# Backend Instructions (Java/Spring Boot)

## Tech Stack
- **Runtime:** Java 21
- **Framework:** Spring Boot 3.5.13
- **Database:** PostgreSQL (TIMESTAMPTZ)
- **Migrations:** Flyway (Immutability is mandatory)
- **Documentation:** OpenAPI/Swagger + Postman

## Core Conventions
- **Layering:** Controller -> Service -> Repository. Controllers must not talk directly to repositories.
- **DTOs:** Never expose JPA entities directly. Use `CreateXRequest` and `XResponse`.
- **Injection:** Prefer constructor injection over field injection.
- **Transactions:** Use `@Transactional` at the service layer for atomic operations.
- **Validation:** Use `@Valid` and JSR-303 annotations on DTOs.

## API Documentation
Follow `backend/docs/API_DOCUMENTATION_STANDARDS.md`. Update Swagger and Postman templates in the same PR as endpoint changes.

## Persistence
- Use `LAZY` fetching by default.
- Prevent N+1 queries with fetch joins or entity graphs.
- Migrations must be forward-only and immutable once shared.
