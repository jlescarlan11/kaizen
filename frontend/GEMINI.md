# Frontend Instructions (React/TypeScript)

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Headless UI (Tailwind-only typography system)
- **State Management:** Redux Toolkit
- **Local Storage:** Dexie (IndexedDB)

## Typography Standards

Follow `CODING_STANDARDS.md` section 1.7.1. Use approved roles only:

- `display`, `h1`, `h2`, `h3`, `h4`, `body-lg`, `body`, `body-sm`, `label`, `caption`, `code`.
- Use a strict three-level neutral text hierarchy: `text-foreground`, `text-muted-foreground`, `text-subtle-foreground`.
- Treat filled colored surfaces as incomplete until base, hover, and active states are contrast-checked.

## Form Field Standards

Follow `CODING_STANDARDS.md` section 1.7.2.

- Every field must have a visible label.
- Errors appear on `blur` or `submit`, not during typing.
- Accessibility: Use `aria-invalid`, `aria-describedby`, and proper `id`/`htmlFor` association.

## Component Patterns

- Prefer feature-first organization (`features/*`).
- Keep components pure; derive UI from props/state.
- Handle loading/error/empty states for all data fetching.
- Maintain WCAG AAA contrast for text where practical.
