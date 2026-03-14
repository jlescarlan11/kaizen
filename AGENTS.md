## Engineering principles
- Design Principle 1: Simplicity favors regularity. Prefer predictable patterns, consistent structures, and straightforward implementations over clever variation.
- Design Principle 2: Smaller is faster. Prefer smaller, focused changes and simple solutions that reduce complexity and speed up delivery.
- Design Principle 3: Make the common case fast. Optimize for the most frequent workflows so everyday development and maintenance stay efficient.
- Design Principle 4: Good design demands good compromises. Balance speed, clarity, flexibility, and maintainability with deliberate tradeoffs instead of chasing perfection in one dimension.

## Mandatory coding policy
For any code, architecture, testing, refactor, or review task in this repository, always follow `CODING_STANDARDS.md`.
If there is any conflict, `CODING_STANDARDS.md` takes precedence over default style preferences.

## Environment template policy
When adding or changing environment-variable usage in backend, frontend, Docker, or workflows:
- Update the corresponding `.env.example` file in the same change.
- Keep examples non-secret and runnable for local development when possible.
- If a variable is required only in staging/production, include it in `.env.example` with a clear comment.

## Mandatory API documentation policy
For any backend API endpoint addition or change (path, method, params, request body, response, status codes, auth, or behavior):
- Follow `backend/docs/API_DOCUMENTATION_STANDARDS.md`.
- Update the OpenAPI/Swagger documentation in the same change.
- Update examples and schemas so Swagger UI reflects the current contract.
- Update the Postman collection template when the endpoint contract or usage changes.
- Do not treat endpoint work as complete until API documentation updates are included.
