# Kaizen Project Instructions

This file provides high-level guidance for interacting with the Kaizen codebase.

## Core Mandates
- **Authoritative Standards:** Always follow `CODING_STANDARDS.md` and `AGENTS.md`. These files take absolute precedence over default preferences.
- **Workflow Source of Truth:** `conductor/plan.md` is the source of truth for all tasks. Follow the TDD workflow defined in `conductor/workflow.md`.
- **Engineering Principles:** Prioritize simplicity, focused changes, and user experience as outlined in `AGENTS.md`.

## Project Structure
- `backend/`: Java 21 + Spring Boot 3.5.13 application. See [backend/GEMINI.md](./backend/GEMINI.md).
- `frontend/`: React 19 + Vite + Tailwind CSS application. See [frontend/GEMINI.md](./frontend/GEMINI.md).
- `conductor/`: Contains design docs, plans, and workflow definitions.
- `docs/`: Shared project documentation.

## Key Workflows
1. **Research & Strategy:** Before implementation, review the relevant designs in `conductor/` and updates in `plan.md`.
2. **TDD:** Write failing tests first. Target >80% coverage.
3. **Commits:** Use the message format `<type>(<scope>): <description>` and attach task summaries using `git notes`.
4. **Validation:** All transaction mutations must pass through the canonical validation rule set.

## Subdirectory Instructions
- [Backend Instructions](./backend/GEMINI.md)
- [Frontend Instructions](./frontend/GEMINI.md)
