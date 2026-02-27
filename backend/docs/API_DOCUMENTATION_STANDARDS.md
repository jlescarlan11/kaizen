# API Documentation Standards

This project uses Springdoc OpenAPI for backend API documentation.

## Required Documentation Per Endpoint

- Add `@Tag` at controller level for domain grouping.
- Add `@Operation` with `summary`, `description`, and `operationId`.
- Add `@ApiResponses` including a success response (`2xx`) with response schema.
- Add expected auth/validation/error responses (for example `400`, `401`, `403`, `404`, `409`, `500`) as applicable.
- Add example payloads for request/response when practical.

## Error Response Documentation Requirements

- Document expected status codes for each operation.
- Include example error payloads aligned with project standards: `code`, `message`, `details`, `traceId`.
- If an endpoint uses framework-default errors today, still document the intended error format in OpenAPI examples.

## Naming Conventions

- Tags: domain-based names such as `Health`, `Auth`, `Users`.
- `operationId`: verb + noun in `camelCase` (for example `getProbeStatus`, `createUser`).
- Schemas/DTOs: `PascalCase` with clear suffixes like `Request` and `Response`.

## Minimum Expectation For New Endpoints

- `summary`, `description`, and `operationId`.
- Request parameter/body schema (if applicable).
- Success response with schema.
- Applicable error/auth responses with examples.
- Security requirement annotation for protected endpoints.
