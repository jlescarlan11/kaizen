# UI/UX Consistency Audit — Design

**Date:** 2026-04-26
**Status:** Approved (brainstorming)
**Companion to:** `docs/superpowers/specs/2026-04-26-pre-prod-audit.md` (cross-referenced, not duplicated)

## Goal

Produce a systematic, evidence-anchored audit of UI/UX consistency across the Kaizen frontend and the backend's user-facing API surface, then ship the fixes in tiered waves. End state: every page, component, form, state, error, route, and API response shape conforms to a single documented standard, and that standard lives in the existing `CODING_STANDARDS.md` / `AGENTS.md` so future drift is caught at review time.

## Scope

In scope (10 dimensions, full sweep):

1. Visual tokens & typography (color, spacing, radii, shadows, type scale)
2. Component primitives (`frontend/src/shared/components/*`) — variants, sizes, props, duplicate implementations
3. Page shell & layout (`AuthenticatedLayout` adoption, header/section/sticky patterns, summary cards, FAB usage, list patterns)
4. Forms, validation & error display (field-level vs form-level errors, label association, server-error mapping, confirm/cancel copy)
5. Empty / loading / error states (skeleton vs spinner, empty-state copy, retry pattern)
6. Interaction patterns (modal vs drawer vs inline, toast vs inline error, confirmations, undo, focus management, keyboard shortcuts)
7. Copy & terminology (microcopy consistency, "Add" vs "Create" vs "New", error tone, terminology drift, date/currency formatting)
8. Accessibility (landmarks, alt text, ARIA, focus indicators, light+dark contrast, keyboard nav)
9. Routing & IA (URL conventions, nav-label vs page-title alignment, deep-link reachability, 404 behavior)
10. Backend API UX (error envelope shape, field-level validation errors, response consistency, status codes, pagination, naming)

Out of scope (explicit):

- Test coverage gaps (same exclusion as the prior pre-prod audit).
- Performance tuning of any kind (DB query plans, JVM flags, bundle splitting). Choosing *which* loading affordance is consistent (skeleton vs spinner) is in scope; making it faster is not.
- New features.
- Re-discovery of findings already in `2026-04-26-pre-prod-audit.md` — those are referenced via the cross-reference table, not re-listed.

## Approach

Approach A from brainstorming: audit-first, then waved fixes. Three phases.

### Phase 1 — Parallel multi-agent audit

Five sub-agents run concurrently, each owning a slice. Charters:

| Agent | Owns |
|-------|------|
| **A1 — Visual & components** | Token usage (color/typography/spacing/radii) across `frontend/src/`, shared component primitives in `shared/components/`, duplicate or parallel implementations |
| **A2 — Page shell & layout** | `AuthenticatedLayout` adoption, header/section/sticky patterns, summary-card patterns, FAB usage, list patterns across all `features/*` pages |
| **A3 — Forms, states, interactions** | Form structure, validation/error display, empty/loading/error states, modal/drawer/toast usage, confirmation patterns, focus management |
| **A4 — Copy, terminology, a11y, routing** | Microcopy, terminology drift, alt text, ARIA/landmarks, contrast in dark mode, URL conventions, nav-label vs page-title alignment |
| **A5 — Backend API UX** | Error envelope shape across controllers, field-level validation error format, response consistency (DTO shape per resource), status codes, pagination, naming conventions |

Each agent writes findings with file:line evidence and a proposed fix. The orchestrator (the assistant in the next session) consolidates, de-duplicates, cross-references against the existing pre-prod audit, and verifies a sample of findings (~20% of BLOCKERs and every "mandatory-standard violation" claim) by re-reading the cited file:line. Un-verified findings are tagged as high-confidence leads, not facts — same caveat as the prior audit.

### Phase 2 — Standards addendum

Distill the audit's recurring rules into additions to `CODING_STANDARDS.md` (or `AGENTS.md` when a rule fits its structure better). No new parallel doc. Only rules the audit actually justified (a pattern was inconsistent in N places, we picked the canonical version, we wrote it down). Format per rule: one-line rule + Why + How to comply (with a link to the canonical implementation in code).

Example rules likely to codify (final list comes from the audit):

- *Single button component, variants only.* "Use `<Button variant=…>` from `shared/components/Button.tsx`. Do not introduce new button styles inline."
- *Server validation envelope.* "Backend returns `{ code, field?, message }` per error; frontend uses `getErrorMessage()` and routes `field` errors to the input."
- *Page shell.* "Every authenticated page renders inside `AuthenticatedLayout`. Pages do not render their own outer chrome."

### Phase 3 — Waved fixes

One implementation plan per wave, produced via the `writing-plans` skill, executed sequentially with a per-wave go/no-go gate.

- **Wave U-1 — BLOCKERS.** Mandatory-standard violations, a11y failures, broken UX contracts. Bundled by area so each wave PR is reviewable in one sitting (e.g., visual-tokens cleanup is one PR; error-envelope contract is another).
- **Wave U-2 — QUALITY.** Visible inconsistencies. Likely the largest wave; may sub-split (U-2a forms, U-2b states, U-2c components) once the finding count is known.
- **Wave U-3 — POLISH.** Micro-cleanups, batched into one or two PRs.

Per-wave gate: before each wave's plan is opened, the user decides go/no-go based on the audit and current capacity. The brainstorming skill's terminal step is `writing-plans` — no auto-implementation. Each plan goes through its own approval before any code is written.

### "Fix all issues even if out of scope" — interpretation

Read as "don't artificially prune findings from the audit." It does **not** override the brainstorming → writing-plans → executing-plans gates. If a finding surfaces during a wave that's clearly out of the wave's scope but trivial to fix in the same change (e.g., an adjacent off-token color in the same file), it gets folded in and called out in the PR description. Anything non-trivial is noted for a future wave, not silently included.

## Severity rubric

Adapted from `2026-04-26-pre-prod-audit.md` so findings cross-reference cleanly:

- **BLOCKER** — mandatory-standard violation (CODING_STANDARDS / AGENTS.md), broken UX flow, accessibility violation that fails a known WCAG criterion, or backend contract that breaks frontend assumptions.
- **QUALITY** — visible inconsistency users would notice (different button styles for the same action, mixed empty-state treatments), duplicated/parallel implementations, drift from documented patterns.
- **POLISH** — micro-cleanups: copy capitalization, spacing nits, a single off-token color in a low-traffic surface.

## Finding shape

Same as the prior audit so the team's eyes already know how to scan it.

```
### <ID>: <one-line title>
- Files: path:line, path:line
- Evidence: what was found (concrete, code-anchored)
- Impact: why it matters to users / consistency
- Fix: specific change
- Effort: S / M / L
```

## ID prefix scheme

`U-` prefix means "UI/UX consistency audit" (disambiguates from the prior audit's `B-`, `Q-`, `P-`):

- `U-VIS-#` — visual & components (Agent A1)
- `U-LAY-#` — page shell & layout (Agent A2)
- `U-FRM-#` — forms, states, interactions (Agent A3)
- `U-COPY-#` — copy, terminology, a11y, routing (Agent A4)
- `U-API-#` — backend API UX (Agent A5)

## Deliverable

Single spec file, committed.

- **Path:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`
- **Sections:**
  1. Methodology
  2. Verification status (what the orchestrator independently verified)
  3. Severity rubric
  4. Counts (BLOCKERS / QUALITY / POLISH totals)
  5. BLOCKERS (grouped by ID prefix)
  6. QUALITY (grouped by ID prefix)
  7. POLISH (grouped by ID prefix)
  8. Cross-references with the pre-prod audit (table mapping which existing findings this audit consolidates / supersedes — e.g., `B-FE-5` → consolidated into `U-VIS-1`)
  9. Summary & recommended waves

## Process flow

```
brainstorming (this doc, approved)
        ↓
writing-plans (next: produces an implementation plan for Phase 1 — running the parallel audit and consolidating the spec)
        ↓
executing-plans (runs Phase 1; outputs the audit spec)
        ↓
[per-wave loop]
   writing-plans (wave's fix plan)
        ↓
   executing-plans (ships the wave's PR)
        ↓
   user go/no-go on next wave
```

## Risks & mitigations

- **Sub-agent hallucination** — file:line references can be fabricated. Mitigation: orchestrator re-verifies a 20% sample plus every "mandatory-standard violation" claim before publishing the spec. Same approach as the prior audit, which caught the false `backend/.env committed` claim.
- **Audit duplicates the prior audit** — wasted effort, confusing two-source-of-truth state. Mitigation: agents are briefed with the prior audit and instructed to reference, not re-find. The cross-reference table makes the consolidation explicit.
- **Scope explosion in Phase 3** — "fix everything" is unbounded. Mitigation: per-wave gate, severity-tiered execution, hard rule that out-of-scope-but-trivial folds get called out in the PR description.
- **Standards addendum codifies premature decisions** — rules added before drift was clear. Mitigation: rules are added only when the audit found N inconsistent implementations and we picked the canonical one. No aspirational rules.

## Decisions captured

- Approach: A (audit-first, then waved fixes).
- Breadth: full sweep across all 10 dimensions, frontend + backend API UX.
- Severity rubric: BLOCKER / QUALITY / POLISH (matches prior audit).
- Standards location: addendum to existing `CODING_STANDARDS.md` / `AGENTS.md` — no new parallel doc.
- Wave order: BLOCKERS → QUALITY → POLISH, with go/no-go gates per wave.
- Out of scope: test coverage, perf tuning, new features.
