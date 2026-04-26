# UI/UX Consistency Audit — Phase 1 (Parallel Audit Run) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run five parallel sub-agent audits across the UI/UX consistency dimensions defined in the design spec, then consolidate, verify, and publish a single tiered findings document at `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`.

**Architecture:** Five `Agent` (subagent_type=`Explore`) dispatches run concurrently, each owning a slice of the audit (visual/components, page shell, forms/states/interactions, copy/a11y/routing, backend API UX). The orchestrator consolidates their reports, verifies a 20% sample of BLOCKER findings against the actual code, builds a cross-reference table against the prior pre-prod audit, then writes and commits the consolidated spec. Phase 2 (standards addendum) and Phase 3 (waved fixes) get separate plans after this one ships.

**Tech Stack:** No code is written in this phase. Tools used: `Agent` (Explore subagents), `Read` / `Grep` (verification), `Write` (spec output), `Bash` (`git add` / `git commit`).

**Spec:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md`
**Companion:** `docs/superpowers/specs/2026-04-26-pre-prod-audit.md` (prior audit — referenced, not re-discovered)

---

## File Structure

**Created in this plan:**
- `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` — single consolidated audit deliverable.

**Read-only inputs:**
- `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md` (this plan's spec)
- `docs/superpowers/specs/2026-04-26-pre-prod-audit.md` (prior audit; for cross-reference)
- `CODING_STANDARDS.md`, `AGENTS.md` (mandatory standards the audit checks against)
- `frontend/src/**` and `backend/src/main/**` (the code under audit)

**Not modified:** No application code is touched in Phase 1. Fixes happen in Phase 3 wave plans.

---

## Task 1: Pre-flight — confirm inputs exist and prior audit is loaded

**Files:**
- Read: `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md`
- Read: `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`
- Read: `CODING_STANDARDS.md`
- Read: `AGENTS.md`

- [ ] **Step 1: Verify the design spec exists and matches the approved version**

Run: `git log --oneline -1 -- docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md`
Expected: shows commit `3ab8b94` (or later if the spec was amended).

If the file is missing, stop and surface the issue — Phase 1 cannot run without the approved design.

- [ ] **Step 2: Read the prior audit and extract the existing UI-flavored findings**

Use the `Read` tool on `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`.

Make a working list of finding IDs that touch UI/UX so they can be passed to agents as "do not re-discover; reference":

```
Existing UI-related findings to cross-reference (not re-find):
- B-FE-1, B-FE-2, B-FE-3, B-FE-4, B-FE-5
- Q-FE-1, Q-FE-2, Q-FE-3, Q-FE-4, Q-FE-5, Q-FE-6, Q-FE-7, Q-FE-8, Q-FE-9, Q-FE-10
- P-FE-1, P-FE-2, P-FE-3, P-FE-4, P-FE-5, P-FE-6, P-FE-7, P-FE-8
- (backend API UX overlaps) Q-FE-5 (server validation envelope), Q-CC-1, Q-CC-9
```

Hold this list in context for Task 2's agent briefings.

- [ ] **Step 3: Read the standards docs once so prior context is loaded**

Use `Read` on `CODING_STANDARDS.md` and `AGENTS.md` so the orchestrator can later judge agent claims against the mandatory rules.

- [ ] **Step 4: No commit (read-only task)**

---

## Task 2: Dispatch all five audit agents in parallel

**Files:**
- No files created. Five `Agent` tool calls are made in a single message so they run concurrently.

**Why one message, five tool calls:** the platform runs Agent invocations within a single assistant message in parallel. Splitting them across messages serializes them.

- [ ] **Step 1: Send a single assistant message containing five `Agent` tool calls**

Each call uses `subagent_type: "Explore"` (no code is written) and `description` set to the agent's slice. The exact prompts below MUST be used verbatim — they encode the no-duplication rule, the severity rubric, the finding shape, the ID prefix, and the verification expectation.

**Common preamble** (paste at the top of every agent prompt below; substitute `<SLICE>` and `<ID-PREFIX>`):

```
You are auditing the Kaizen codebase (D:/kaizen) for <SLICE> consistency before
production deployment. This is one of five parallel audits. Output findings only;
do NOT modify code.

Inputs you must read before starting:
- docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md (your charter)
- docs/superpowers/specs/2026-04-26-pre-prod-audit.md (prior audit — DO NOT re-find these)
- CODING_STANDARDS.md and AGENTS.md (the mandatory standards you are checking against)

DO NOT re-discover these existing finding IDs (reference them with their existing ID
if they fall in your slice; do not assign a new ID):
- B-FE-1, B-FE-2, B-FE-3, B-FE-4, B-FE-5
- Q-FE-1..Q-FE-11, Q-CC-1, Q-CC-9
- P-FE-1..P-FE-8

Severity rubric:
- BLOCKER: mandatory-standard violation (CODING_STANDARDS / AGENTS.md), broken UX
  flow, accessibility violation that fails a known WCAG criterion, or backend
  contract that breaks frontend assumptions.
- QUALITY: visible inconsistency users would notice, duplicated/parallel
  implementations, drift from documented patterns.
- POLISH: micro-cleanups (copy capitalization, single off-token color in low-traffic
  surface, spacing nits).

Finding shape (use exactly):
### <ID-PREFIX>-<n>: <one-line title>
- Files: path:line, path:line
- Evidence: what was found (concrete, code-anchored — quote the offending line if short)
- Impact: why it matters to users / consistency
- Fix: specific change
- Effort: S / M / L
- Cross-ref: <existing-finding-id> if this consolidates or extends a prior-audit item; else "none"

ID prefix for your slice: <ID-PREFIX>

Output format (return ALL of this in your final message):
1. A "## BLOCKERS" section with all BLOCKER findings.
2. A "## QUALITY" section with all QUALITY findings.
3. A "## POLISH" section with all POLISH findings.
4. A "## Cross-references" section listing prior-audit IDs your slice touched and
   how they map (consolidates / extends / supersedes / no-op).
5. A "## Coverage notes" section: what files/areas you read, what you skipped and why,
   and any place a deeper look is warranted.

Quality bar: every finding must cite at least one file:line. If you can't cite,
don't file it. Treat your own claims as leads, not facts — the orchestrator will
re-verify a sample.

Report budget: aim for thoroughness, not exhaustiveness. If a single anti-pattern
appears 30 times, file ONE finding that lists representative file:line examples
and says "and N more sites" rather than 30 separate findings.
```

**Agent A1 — Visual & components** (`description: "UI/UX audit: visual & components"`, `subagent_type: "Explore"`):

```
<COMMON PREAMBLE with SLICE="visual tokens, typography, and shared component primitives" and ID-PREFIX="U-VIS">

Specifically check:

1. Hardcoded Tailwind color/spacing/typography classes outside the documented
   semantic tokens. The standards mandate tokens like text-foreground,
   text-muted-foreground, text-subtle-foreground, text-on-*, bg-ui-surface-muted,
   bg-primary. Hunt for: text-gray-*, text-slate-*, text-zinc-*, text-neutral-*,
   bg-gray-*, bg-white, bg-black, text-green-*, text-red-*, text-blue-*,
   text-indigo-*, hex literals, rgb()/rgba() in className, inline style={{color:…}}.
   Search across frontend/src/.

2. Typography roles: arbitrary text-2xl/text-3xl/text-4xl, font-bold,
   tracking-* used outside the approved type scale. Compare to the canonical
   page header pattern (look at how BudgetsPage / TransactionsPage render their
   h1 — that's the reference).

3. Shared component primitives in frontend/src/shared/components/. For each
   primitive (Button, Input, Card, Modal, ResponsiveModal, Badge, Select,
   Checkbox, Radio, TextArea, ProgressBar, SectionHeader, SkeletonList):
   - Inventory variants and sizes.
   - Find places in features/* that re-implement the same affordance with
     a custom div/span/className instead of using the primitive (parallel
     implementations).
   - Find places where the primitive is used but its variant/size is bypassed
     via className overrides.

4. Duplicate/parallel implementations across features (e.g., two different
   "stat card" patterns, two different "section header" patterns, two
   different empty-state cards) — even if both use tokens, the visual drift
   is a finding.

Skim the features/* tree first to inventory pages; then sample-read each page
to spot drift. Don't read every file end-to-end; favor breadth.
```

**Agent A2 — Page shell & layout** (`description: "UI/UX audit: page shell & layout"`, `subagent_type: "Explore"`):

```
<COMMON PREAMBLE with SLICE="page shell, layout, and navigation chrome" and ID-PREFIX="U-LAY">

Context: a recent PR (#27, page-shell-consistency) established AuthenticatedLayout
as the single source of truth for outer page chrome. InsightsPage was flagged as a
known non-conforming page. Your job is to verify the conformance now and surface
any remaining drift.

Specifically check:

1. AuthenticatedLayout adoption: every authenticated page in features/* must
   render inside it without re-creating outer chrome (no per-page sticky topbar,
   no per-page footer, no per-page max-width container that duplicates the
   layout's). Walk every features/* directory; verify the page's top-level JSX
   is a layout child, not its own shell.

2. Header / hero pattern: the canonical pattern is <header> with h1 + optional
   period selector / right-side action. List pages that diverge (raw <div>
   wrapping h1, missing <header> landmark, inconsistent placement of secondary
   actions).

3. Section pattern: <section> wrappers with consistent spacing between sections
   on a page. Find pages that use plain <div> stacks instead.

4. Summary cards: many pages render a row of summary stats (BudgetsPage,
   InsightsPage, TransactionsPage). Are they consistent? Same card primitive?
   Same column count rules at each breakpoint?

5. List patterns: cards-in-grid vs rows-in-list. Are similar resources
   (budgets, transactions, payment methods, categories, goals) presented with
   consistent list patterns or are they each unique?

6. FAB / primary-action placement: AddEntryFAB exists. Is it used consistently
   for add-entity actions? Are there pages with a "+ New" button instead?

7. Breadcrumbs / back affordance: detail pages — is there a consistent way
   back to the list?

8. Page title vs nav label drift: e.g., the recent rename of "Transactions" nav
   label to "Home". Are page titles aligned with their nav entries now?
```

**Agent A3 — Forms, states & interactions** (`description: "UI/UX audit: forms, states, interactions"`, `subagent_type: "Explore"`):

```
<COMMON PREAMBLE with SLICE="forms, validation/error display, empty/loading/error states, and interaction patterns" and ID-PREFIX="U-FRM">

Context: the prior audit flagged Q-FE-4 (inconsistent loading/error patterns)
and Q-FE-5 (no standard for server-side validation error display) but did not
inventory either. Your job is to inventory.

Specifically check:

1. Form structure: label association (htmlFor / aria-label), required-field
   marker style, fieldset grouping, helper-text placement, disabled-state
   visual. Walk every form in features/* (TransactionEntryForm, budget setup,
   PaymentMethodCreationForm, OnboardingBudgetStep, signin/register, etc.).

2. Validation timing: blur vs submit vs change. Inconsistent timing across
   similar forms is a finding.

3. Server error display: how does each form surface backend errors today?
   (form-level toast, inline message, parsed-into-field?). Document the
   variations. The target pattern is field-level, but we need the inventory
   first.

4. Empty states: every list/table/grid that can be empty — does it render an
   empty-state card with consistent copy + illustration + primary action?
   Or just whitespace?

5. Loading states: skeleton vs spinner vs render-on-cache. List which page
   uses which. Look for pages that use multiple patterns within the same
   page (worst case).

6. Error states: a load failed — what does the user see? Toast, inline
   error card, blank? Inventory.

7. Modal vs drawer vs inline edit: are similar editing flows using consistent
   affordances? Modal (Modal.tsx, ResponsiveModal.tsx) used for what; inline
   edit used for what; full page used for what?

8. Confirmation patterns: destructive actions (delete budget, delete
   transaction, delete payment method, logout) — modal confirm? Native
   confirm()? Undo snackbar (UndoSnackbar.tsx exists)? Inventory.

9. Undo affordance: where is UndoSnackbar used? Where could it be used but
   isn't (silent destructive action)?

10. Focus management: when a modal opens, does focus move into it? When
    it closes, does focus return? Sample-check 2-3 modals.

11. Keyboard navigation: tab order on the main pages. Trap test on modals.
```

**Agent A4 — Copy, terminology, a11y, routing** (`description: "UI/UX audit: copy, a11y, routing"`, `subagent_type: "Explore"`):

```
<COMMON PREAMBLE with SLICE="microcopy, terminology, accessibility, and routing/IA" and ID-PREFIX="U-COPY">

Specifically check:

1. Microcopy verb consistency for the same action class:
   - "Add" vs "Create" vs "New" for entity creation buttons.
   - "Save" vs "Submit" vs "Confirm" for form submission.
   - "Delete" vs "Remove" for destructive actions.
   - "Cancel" vs "Close" vs "Discard" for modal dismissal.
   - "Edit" vs "Update" vs "Modify".
   Walk all CTAs in features/* and produce the inventory.

2. Terminology drift: the same concept named differently in different surfaces
   (e.g., "category" vs "tag", "budget period" vs "cycle", "balance" vs
   "remaining" vs "available", "expense" vs "spent" vs "spending").

3. Error message tone: are errors written in user-facing voice or developer
   voice ("Failed to fetch", "Network error", raw exception strings)? Sample
   across forms.

4. Date / currency / number formatting: are dates always formatted via the
   same util? Is currency consistent across summary cards (₱ vs $ vs raw
   number)? Is decimal precision consistent?

5. Accessibility:
   - Landmark structure on each page (<main>, <header>, <nav>, <footer>).
   - alt text on every <img>. AuthenticatedLayout avatar already flagged
     (P-FE-6) — reference it; check the rest.
   - aria-label on icon-only buttons (notification bell, FAB, close
     buttons, kebab menus).
   - aria-hidden on decorative SVGs.
   - Focus indicator visibility — is the default ring used everywhere or
     suppressed in places?
   - Light vs dark contrast — sample a handful of token usages and verify
     contrast meets the AAA target the standards mandate.
   - Heading hierarchy: h1 → h2 → h3 (no skipped levels).

6. Routing & IA:
   - URL conventions — singular vs plural drift (Q-FE-7 already flagged
     /budget vs /budgets — reference; check the rest).
   - Detail-route shape (e.g., /budget/:id vs /budgets/:id vs /budget/edit/:id).
   - Nav label vs page title alignment for every nav entry.
   - Deep-link reachability: every page reachable by URL without going
     through a wizard?
   - 404 behavior: is NotFoundPage routed for unknown URLs? Is it consistent
     in style with the rest of the app?
```

**Agent A5 — Backend API UX** (`description: "UI/UX audit: backend API UX"`, `subagent_type: "Explore"`):

```
<COMMON PREAMBLE with SLICE="backend API UX — error envelope, validation errors, response shape, naming, status codes" and ID-PREFIX="U-API">

This audit views the backend through the lens of the frontend developer who has
to consume it. Your charter is consistency of the contract, not security or
correctness (those are in the prior audit).

Specifically check:

1. Error envelope: every controller's error response shape. The desired target
   from the prior audit (Q-FE-5) is { code, field?, message }. What is the
   current state? Walk @ControllerAdvice, GlobalExceptionHandler, and individual
   throw new ResponseStatusException sites. Inventory the variations.

2. Validation error format: when Spring's @Valid fails, what does the response
   look like today? Is field info preserved? Is there a @ControllerAdvice
   mapping MethodArgumentNotValidException?

3. Response DTO shape consistency: across resources (Budget, Transaction,
   Category, PaymentMethod, Goal, etc.):
   - id field name (id vs <resource>Id)?
   - timestamp field names (createdAt vs created_at vs createdDate)?
   - amount/money field shape (number vs { amount, currency })?
   - enum value casing (UPPER_SNAKE vs lowerCamel vs Title Case)?

4. Status codes: POST returns 201 or 200? DELETE returns 204 or 200? PUT
   vs PATCH semantics — is the codebase consistent?

5. Pagination shape: does any list endpoint paginate? If yes, what's the
   shape (offset/limit, page/size, cursor)? Is it consistent across resources?

6. Naming: REST path consistency — kebab-case vs camelCase, plural vs
   singular (already flagged for /budget vs /budgets on the FE — the API
   path is /api/budgets per P-BE-1, verify), nested vs flat.

7. Boolean field naming: isActive vs active, hasReceipt vs withReceipt.

8. Null vs missing: do endpoints return null for absent values or omit
   the key entirely? Inconsistent handling complicates frontend types.

Read entrypoints under backend/src/main/java/com/kaizen/backend/*/controller/
and the global exception handler(s). Use the actual JSON response shape (look
at ResponseEntity returns and DTO classes) as the source of truth.
```

- [ ] **Step 2: Wait for all five agents to return**

Each agent returns one final message. Capture all five outputs verbatim in scratch context for Task 3.

- [ ] **Step 3: No commit (sub-agent dispatch is read-only)**

---

## Task 3: Verify a sample of BLOCKER findings against the actual code

**Files:**
- Read-only access to whatever paths the agents cited.

**Why this task exists:** the prior audit caught a fabricated claim (`backend/.env committed`) that would have been embarrassing to ship. We re-verify before publishing.

- [ ] **Step 1: Pick the verification sample**

For each agent's BLOCKER list, pick ~20% of items, plus EVERY claim that uses the phrase "mandatory-standard violation" or cites CODING_STANDARDS / AGENTS.md. Picking biases toward:
- Findings whose evidence is a single-line quote (most likely to be misread).
- Findings with the broadest impact (touches many files).

Make the sample list explicit (write it down before reading any code, so you don't drift toward "verify the easy ones"):

```
Verification sample:
- A1 BLOCKER U-VIS-1: <title> — sample because <reason>
- A1 BLOCKER U-VIS-3: ...
- A2 BLOCKER U-LAY-2: ...
- ...
```

- [ ] **Step 2: Re-read each cited file:line and confirm the evidence**

For each item in the sample:
1. `Read` the cited file at the cited line range (with a bit of surrounding context).
2. Confirm the evidence quote matches what's actually there.
3. Confirm the impact framing is reasonable (a "mandatory-standard violation" claim must be backed by a specific rule in CODING_STANDARDS.md or AGENTS.md — otherwise downgrade).

If a finding fails verification:
- Wrong file:line → fix the citation if the surrounding code shows the issue is real elsewhere; otherwise drop the finding.
- Evidence quote doesn't match → drop the finding.
- Severity overclaimed (BLOCKER but no mandatory rule cited) → downgrade to QUALITY.

Track verification outcome per item:

```
Verification outcomes:
- U-VIS-1: VERIFIED
- U-VIS-3: CITATION FIXED (was line 42, actually line 51)
- U-LAY-2: DOWNGRADED to QUALITY (no mandatory-standard violation)
- U-FRM-7: DROPPED (evidence quote not present)
```

- [ ] **Step 3: No commit (read-only verification)**

---

## Task 4: Build the cross-reference table against the prior audit

**Files:**
- Read: `docs/superpowers/specs/2026-04-26-pre-prod-audit.md` (already in context from Task 1)

- [ ] **Step 1: For every prior-audit UI-related ID, decide its disposition**

Walk the list assembled in Task 1, Step 2. For each ID, classify how this audit treats it:

- **consolidated-into**: the prior finding is a specific case of a broader new finding. Show both IDs.
- **extends**: the prior finding stands; this audit added related sites. Show both IDs.
- **superseded-by**: the prior finding is replaced by a more accurate / scoped new finding. Show both IDs.
- **referenced**: the prior finding is mentioned for context but not re-discovered.
- **resolved**: the prior finding is already fixed (e.g., by PR #29) — note as resolved.

Output as a markdown table:

```markdown
| Prior ID | Disposition       | New ID(s)         | Notes                                  |
|----------|-------------------|-------------------|----------------------------------------|
| B-FE-5   | consolidated-into | U-VIS-1           | InsightsPage tokens roll into broader visual-token cleanup |
| Q-FE-7   | referenced        | —                 | /budget vs /budgets covered as a single existing finding   |
| ...      | ...               | ...               | ...                                                         |
```

- [ ] **Step 2: No commit (this table goes into the spec in Task 5)**

---

## Task 5: Write the consolidated audit spec

**Files:**
- Create: `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`

- [ ] **Step 1: Write the spec using the structure below**

Use the `Write` tool. The file must follow this exact section order so it's scannable next to the prior audit:

````markdown
# UI/UX Consistency Audit — Kaizen

**Date:** 2026-04-26
**Scope:** Five-slice UI/UX consistency audit — visual & components, page shell & layout, forms/states/interactions, copy/a11y/routing, backend API UX. Frontend (React/TypeScript/Vite) and backend (Spring Boot) under `D:/kaizen`. Companion to `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`.
**Design:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md`

## Methodology

- Five parallel exploration agents covered: (1) visual & components, (2) page shell & layout, (3) forms/states/interactions, (4) copy/a11y/routing, (5) backend API UX.
- Sub-agents were briefed with the prior audit's UI-related finding IDs and instructed to reference, not re-discover.
- The orchestrator independently re-verified a 20% sample of BLOCKERS plus every "mandatory-standard violation" claim by reading the cited file:line.

## Verification status

Most file:line references come from sub-agents reading source. The following were independently verified by the orchestrator:

- <list each verified item — include any citation fixes / severity downgrades / drops>

Treat un-verified findings as high-confidence leads, not facts. Re-read the cited file:line before fixing.

## Severity rubric

- **BLOCKER** — mandatory-standard violation (CODING_STANDARDS / AGENTS.md), broken UX flow, accessibility violation that fails a known WCAG criterion, or backend contract that breaks frontend assumptions.
- **QUALITY** — visible inconsistency users would notice, duplicated/parallel implementations, drift from documented patterns.
- **POLISH** — micro-cleanups: copy capitalization, single off-token color in a low-traffic surface, spacing nits.

## Counts

- BLOCKERS: <n>
- QUALITY: <n>
- POLISH: <n>
- **Total: <n>**

---

# BLOCKERS

## Visual & components (U-VIS)
<all U-VIS BLOCKER findings, in finding-shape format>

## Page shell & layout (U-LAY)
<all U-LAY BLOCKER findings>

## Forms, states & interactions (U-FRM)
<all U-FRM BLOCKER findings>

## Copy, terminology, a11y & routing (U-COPY)
<all U-COPY BLOCKER findings>

## Backend API UX (U-API)
<all U-API BLOCKER findings>

---

# QUALITY

<same five-section structure>

---

# POLISH

<same five-section structure>

---

# Cross-references with the pre-prod audit

<the table built in Task 4>

---

# Summary & recommended waves

**Ship readiness:** <one paragraph: how many BLOCKERs, what bands they fall in, your honest read on whether this is shippable as-is>.

**Recommended waves** (per the design spec):

1. **Wave U-1 (BLOCKERS)** — <bundle into reviewable PRs by area; e.g., "U-1a: visual-token cleanup (X findings); U-1b: error-envelope contract (Y findings); U-1c: a11y blockers (Z findings)">.
2. **Wave U-2 (QUALITY)** — <expected sub-splits>.
3. **Wave U-3 (POLISH)** — <one or two batched PRs>.

For each chosen wave, run `writing-plans` to produce a per-wave implementation plan rather than batching.
````

Every angle-bracketed `<...>` placeholder in the template above MUST be replaced with the real consolidated content from Tasks 2–4. Empty sections are allowed (write `_None._` rather than leaving the heading bare) so the structure is predictable.

- [ ] **Step 2: Self-review the spec inline (do not delegate)**

Run a mental pass on the file you just wrote:

1. **Placeholder scan:** any `<...>`, `TBD`, `TODO`, `Lorem ipsum`, or "fill in later" left over? Any heading with no body? Fix.
2. **Citation sanity:** every finding has at least one `path:line` citation. Search the file for findings without `:` — fix.
3. **ID uniqueness:** every U-* ID appears exactly once. Search and confirm.
4. **Cross-reference completeness:** every prior-audit ID from Task 1's list appears in the cross-reference table. Add missing rows (disposition `referenced` if untouched).
5. **Counts match:** the "Counts" section's totals equal the sum of findings actually present in BLOCKERS / QUALITY / POLISH. Re-count and fix.

Fix issues inline. No re-review pass.

- [ ] **Step 3: No commit yet (commit happens in Task 6 with the verification log)**

---

## Task 6: Commit the audit spec

**Files:**
- Add: `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`

- [ ] **Step 1: Stage and commit**

Run:

```bash
git add docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md
git status
```

Expected: only the audit spec staged; no other files.

If anything else is staged (e.g., accidental edits), unstage them — Phase 1 should be a single-file commit.

- [ ] **Step 2: Create the commit**

Run:

```bash
git commit -m "$(cat <<'EOF'
docs(specs): add UI/UX consistency audit findings

Five-slice parallel audit covering visual/components, page shell, forms
& states, copy/a11y/routing, and backend API UX. Cross-referenced
against the prior pre-prod audit so existing findings aren't re-listed.

Companion to 2026-04-26-pre-prod-audit.md. Phase 2 (standards addendum)
and Phase 3 (waved fixes) are separate plans.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify the commit landed**

Run: `git log --oneline -1`
Expected: the new commit's title is `docs(specs): add UI/UX consistency audit findings`.

---

## Task 7: Hand off — surface the audit summary to the user and offer wave selection

**Files:** None.

- [ ] **Step 1: Print a short summary to the user**

The summary message should contain:

1. The path to the new spec.
2. The BLOCKER / QUALITY / POLISH counts.
3. The verification log highlights (how many were re-verified, how many citations corrected, how many findings dropped/downgraded).
4. Whether any prior-audit finding was discovered to already be resolved (e.g., by PR #29).
5. A list of the recommended Wave U-1 sub-bundles (e.g., `U-1a: visual-token cleanup`, `U-1b: error-envelope contract`, `U-1c: a11y blockers`) with their finding counts.
6. The next step: "Pick one or more Wave U-1 sub-bundles and I'll run `writing-plans` for each. Or, if the audit changed your priorities, tell me and we re-scope."

- [ ] **Step 2: Stop — do not auto-start Phase 3**

The brainstorming skill's terminal step is `writing-plans` (this plan). Do not invoke any further skill in this session. Wait for the user to pick the next wave.

---

## Self-Review (run after writing this plan)

This is a checklist for the plan author, run inline.

**1. Spec coverage:** Walk every section of `2026-04-26-uiux-consistency-audit-design.md` and confirm each maps to a task in this plan:
- Phase 1 / 5-agent slicing → Tasks 1, 2.
- Verification (20% sample + every mandatory-standard claim) → Task 3.
- Cross-references with prior audit → Task 4.
- Spec deliverable structure (Methodology, Verification, Rubric, Counts, BLOCKERS/QUALITY/POLISH, Cross-references, Summary & waves) → Task 5.
- Commit → Task 6.
- Hand-off without auto-implementing → Task 7.

✅ All design sections covered.

**2. Placeholder scan:** This plan contains intentional placeholders inside the *spec template* (Task 5 Step 1) — those are filled in at runtime from agent output and are explicitly called out by Task 5 Step 2. There are no unintended `TBD` / `TODO` / `add appropriate X` strings outside that template.

**3. Type / name consistency:** ID prefixes are `U-VIS`, `U-LAY`, `U-FRM`, `U-COPY`, `U-API` everywhere they appear (Task 2 prompts, Task 4 table example, Task 5 spec template). Severity strings are `BLOCKER` / `QUALITY` / `POLISH` everywhere. The spec path is `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` (no trailing variants). The design path is `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md` everywhere.

✅ No drift detected.
