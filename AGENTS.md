## Engineering principles
- Small is Faster. Prefer smaller, focused changes and simple solutions that reduce complexity and speed up delivery.

## Mandatory coding policy
For any code, architecture, testing, refactor, or review task in this repository, always follow `CODING_STANDARDS.md`.
If there is any conflict, `CODING_STANDARDS.md` takes precedence over default style preferences.

## Environment template policy
When adding or changing environment-variable usage in backend, frontend, Docker, or workflows:
- Update the corresponding `.env.example` file in the same change.
- Keep examples non-secret and runnable for local development when possible.
- If a variable is required only in staging/production, include it in `.env.example` with a clear comment.
