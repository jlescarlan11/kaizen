## Engineering principles
- Design Principle 1: Simplicity favors regularity. Prefer predictable patterns, consistent structures, and straightforward implementations over clever variation.
- Design Principle 2: Smaller is faster. Prefer smaller, focused changes and simple solutions that reduce complexity and speed up delivery.
- Design Principle 3: Make the common case fast. Optimize for the most frequent workflows so everyday development and maintenance stay efficient.
- Design Principle 4: Good design demands good compromises. Balance speed, clarity, flexibility, and maintainability with deliberate tradeoffs instead of chasing perfection in one dimension.

## Mandatory coding policy
For any code, architecture, testing, refactor, or review task in this repository, always follow `CODING_STANDARDS.md`.
If there is any conflict, `CODING_STANDARDS.md` takes precedence over default style preferences.

## Frontend typography policy
For any frontend UI work, follow the typography standards in `CODING_STANDARDS.md` section `1.7.1 Typography Standards (Tailwind CSS Only)`.

Use the approved typography roles only:
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

Apply these rules when writing or editing UI:
- Use Tailwind utilities only for typography.
- Use semantic HTML text elements before styling.
- Use semantic text color tokens only.
- Use a strict three-level neutral text hierarchy on neutral surfaces:
- `text-foreground` for primary text such as headings, labels, body text, and important actions.
- `text-muted-foreground` for secondary text such as descriptions, helper text, and supporting copy.
- `text-subtle-foreground` for metadata and low-emphasis microcopy such as timestamps, section labels, and status context.
- Do not introduce additional neutral text color levels.
- If text sits on a filled colored surface, use the matching `text-on-*` token unless the palette has been explicitly validated for a foreground-only model.
- Do not use semantic colors for ordinary body copy; reserve semantic/on-color text tokens for filled semantic surfaces, alerts, badges, validation, and other meaning-carrying UI.
- Use `tracking-tight` only on headings.
- Use only `font-normal`, `font-medium`, and `font-semibold`.
- Avoid arbitrary font sizes and ad hoc typography combinations unless explicitly required.
- Only headings should usually scale responsively.
- Keep body text readable, stable, and consistent across similar UI patterns.

## Frontend accessibility color policy
For any frontend UI work that changes colors, tokens, surfaces, buttons, badges, alerts, links, borders, or focus states, follow the accessibility and color rules in `CODING_STANDARDS.md`.

Apply these rules when writing or editing UI:
- Target WCAG AAA for text content where practical.
- Treat filled colored surfaces as incomplete until base, hover, and active states are contrast-checked.
- Borders, focus indicators, icons, and controls must meet at least `3:1`.
- Do not assume `text-foreground` is safe on a colored background without verification.
- When changing theme tokens, verify both light and dark mode in the same change.

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
