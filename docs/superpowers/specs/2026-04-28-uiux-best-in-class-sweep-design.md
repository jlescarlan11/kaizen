# UI/UX Best-in-Class Sweep — Design

**Date:** 2026-04-28
**Branch:** `audit/uiux-best-in-class-sweep`
**Predecessors:** `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`, `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`
**Quality bar:** Best-in-class — Linear / Vercel / Stripe. The app should *feel designed*, not merely correct.

**Methodology:** Agent-orchestrated code-read audit. Same shape as the Apr 26 audit (parallel exploration agents per surface area, orchestrator-verified BLOCKERs) but raised to the higher quality bar and extended with a new `OPPORTUNITY` severity tier. No live walkthroughs, no synchronous user time required during discovery. Findings are produced from source-code reading; visual-only judgement (e.g., "this card feels cramped") is a deliberate gap that can be filled later with a lightweight screenshot pass if the user wants.

---

## 1. Goal and deliverable

**What this spec produces:** an *audit document* — methodology, severity rubric, finding inventory with `file:line` citations, foundation-vs-surface categorization, and a wave decomposition. Same shape as the Apr 26 audit, raised to the higher quality bar (best-in-class) and extended with a new OPPORTUNITY severity tier.

**What this spec does NOT produce:** the fixes themselves. Each downstream wave (foundation, per-surface, cross-cutting opportunity) becomes its own `writing-plans → implementation` cycle, the same shape as Wave U-1a / U-1bcd shipped last week. This spec is the map; the journeys come after.

**Why this framing.** "Best-in-class" against a real codebase will plausibly surface 60–120 findings. Fixing them in one mega-PR would have no review boundary. Categorizing into a finding inventory + wave plan keeps each downstream PR reviewable, lets the team pause/resume between waves, and lets each wave plan land independently.

**Doc lifecycle.** This document has two states:

- **At spec-write time (now):** methodology, severity rubric, surface inventory, audit protocol, wave principle, sequencing constraint. Sections 7 and 8 are intentionally empty and act as the output target for the audit run.
- **At end of audit run:** sections 7 and 8 fully populated; foundation auto-promotion run; cross-references filed. The "complete" state is the final deliverable.

**Success criterion for the spec-write state:** sections 1–6 + 9–10 stable; severity rubric, finding format, and wave principle agreed; surface inventory locked.

**Success criterion for the end-of-audit state:** finding inventory complete; every finding has citation, foundation/surface tag, severity, fix sketch, effort; waves decomposed and prioritized; sequencing constraint applied to actual findings; cross-references to Apr 26 audit filed.

---

## 2. Surface inventory and audit dispatch order

### Surfaces in scope (11 surfaces + the global shell)

| # | Surface | Sub-views to cover |
|---|---------|--------------------|
| 0 | **AuthenticatedLayout shell** | Top nav, sidebar, AddEntryFAB, UndoSnackbar, profile menu, notifications |
| 1 | **Signin** (logged-out) | Form, OAuth button, error states |
| 2 | **Register / OAuth callback** | Whatever flows exist — first-impression matters |
| 3 | **Onboarding** | Each step (income, budgets, categories, etc.) — first run |
| 4 | **Home / Dashboard** | Stats, charts, recent activity, FAB |
| 5 | **Transactions** | List, filters, detail, add/edit, bulk-delete |
| 6 | **Budgets** | List, detail, add/edit, manual setup |
| 7 | **Insights** | Spending summary, category breakdown, trends, period selector |
| 8 | **Categories** | List, create, edit, merge |
| 9 | **Payment Methods** | List, create, edit, delete confirm |
| 10 | **Your Account** | Profile, sessions, settings groups (incl. Appearance / theme toggle) |
| 11 | **404 / Not Found** | The page itself + how it's reached |

**Excluded from the walk** (treated as WIP / internal-only):
- `playground` — internal-only
- `Vault` — WIP placeholder; routed in the sidebar but not user-ready
- `Goals` — WIP placeholder; routed in the sidebar but feature not yet implemented

When excluded surfaces ship in a future release, they get their own targeted polish pass — they are NOT folded into the per-surface waves below.

### Agent dispatch grouping

Surfaces are grouped into five parallel agent jobs (mirroring the Apr 26 audit's five-slice approach, scoped to UI/UX only):

- **Agent 1 — First impression cluster:** Shell (0), Signin (1), Register / OAuth callback (2), Onboarding (3).
- **Agent 2 — Money flows:** Transactions (5), Budgets (6).
- **Agent 3 — Insights & charts:** Insights (7) — including the chart-color primitives.
- **Agent 4 — Settings cluster:** Categories (8), Payment Methods (9), Your Account (10), 404 (11).
- **Agent 5 — Foundation primitives (cross-cutting):** `frontend/src/shared/components/**`, `frontend/src/styles/**`, `frontend/src/shared/styles/**`, the typography role catalog in `CODING_STANDARDS.md`, ESLint config — looking for primitive gaps, token-vocabulary drift, missing motion/density tokens, and any pattern that would be a foundation finding.

**Surface 4 (Home / Dashboard)** is read by both Agent 1 (first-impression slice) and Agent 2 (data display slice) since it straddles both concerns. Duplicates are deduplicated during consolidation.

**Why this split:** keeps each agent scoped to ~3–6 source dirs so no single agent runs out of context; mirrors the natural seams in the codebase; produces independent finding sets that consolidate cleanly.

---

## 3. Audit methodology

### Process overview

1. **Brief preparation.** Orchestrator drafts a per-agent brief that includes (a) the surface scope, (b) the four-tier severity rubric (§ 4), (c) the finding-format template (§ 4), (d) a list of relevant Apr 26 audit findings to *reference but not re-discover*, (e) explicit "look for these patterns" prompts pegged to the higher quality bar.
2. **Parallel dispatch.** All five agents run concurrently. Each returns a draft finding list against its surface scope.
3. **Orchestrator verification.** For every BLOCKER claim *and* every claim flagged as "mandatory-standard violation," orchestrator independently re-reads the cited `file:line` to confirm the finding is real and the citation is correct. Agent claims are treated as high-confidence leads, not facts, until verified.
4. **Consolidation.** Cross-agent duplicates are merged (e.g., the same shell finding may appear in Agents 1, 2, 3, 4 — collapses to one with `Recurrence: seen by 4 agents`). Foundation auto-promotion (§ 4) runs over the consolidated set.
5. **Wave decomposition.** Findings are routed into Φ / Wave 1 / Wave 2..N / Ω per the principle in § 5. Each wave gets a finding list, effort estimate, sequencing position.
6. **Doc commit.** Audit doc is fully populated and committed to `audit/uiux-best-in-class-sweep`.

### Per-agent brief template

Each dispatched agent receives a brief in roughly this shape:

> **Surface scope:** `<list of feature dirs + shared dirs the agent owns>`.
> **Reference docs (do not re-discover):** `CODING_STANDARDS.md` §1.7, `AGENTS.md`, `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` (still-open finding IDs are: `<list>`).
> **Severity rubric:** BLOCKER / QUALITY / POLISH / OPPORTUNITY (definitions inline).
> **What to look for, in priority order:**
> 1. Mandatory-standard violations (forbidden font weights, off-token colors, arbitrary sizes/tracking, missing landmarks).
> 2. Visible inconsistency (parallel implementations of the same UX role, copy/terminology drift, mixed loading/empty/error patterns).
> 3. Dark-mode token slips (any color reference that isn't a semantic token; any token that's been verified to fail dark-mode AAA contrast).
> 4. Component-primitive opportunities (places where the same JSX shape is repeated 3+ times and should be a `shared/components` primitive).
> 5. Motion / micro-interaction OPPORTUNITY findings (places where the absence of a transition or hover affordance is *noticeable* against the best-in-class bar).
> 6. Data-display OPPORTUNITY findings (dense tables/lists/charts where density modes, smarter sorting, or richer empty states would meaningfully raise quality).
> **Output format:** one Markdown block per finding with the fields in § 4. Cite `file:line` for every finding. If a finding lacks a citation, drop it.
> **Quality bar reminder:** we're at "Linear / Vercel / Stripe" not "no obvious bugs". If a surface looks correct-but-uninspired, that's an OPPORTUNITY finding worth filing.

### Tooling

- Agents use Read, Grep, Glob (read-only). No edits during discovery.
- Orchestrator uses Read, Bash (grep/find), Edit (only for the audit doc).
- Visual companion at `http://localhost:53177` is available for the orchestrator to push proposed-fix mockups during downstream wave-planning, not during the audit run itself.

### What this methodology gives up (deliberate gap)

Pure-visual findings — those that require seeing pixels in the browser — won't surface from code-read alone. Examples:

- Spacing rhythm at specific breakpoints that "feels off" without violating a token.
- Dark-mode contrast that passes math but feels muddy.
- Animation timing that feels sluggish.
- Density that feels cramped or sparse without a measurable token violation.

Estimated 10–15% of total findings would fall in this gap. If the user wants to close the gap later, an optional lightweight screenshot pass can fill it in: user pastes ~10–15 screenshots of pages that "feel off"; orchestrator files visual-only findings against them. This is **out of scope for the initial audit run** but explicitly preserved as a follow-on option.

---

## 4. Severity rubric and finding format

### Severity tiers

- **BLOCKER** — broken UX flow, mandatory-standard violation (CODING_STANDARDS / AGENTS.md), WCAG criterion fail, broken contract, broken contrast.
- **QUALITY** — visible inconsistency a careful user would notice; drift from documented patterns; duplicated/parallel implementations.
- **POLISH** — micro-cleanup: copy capitalization, single off-token color in a low-traffic surface, single spacing nit.
- **OPPORTUNITY** *(new for this audit)* — not broken, not inconsistent, but a deliberate upgrade would measurably raise perceived quality (motion / transitions, micro-interactions, empty-state delight, type-rhythm tightening, dense-data polish, density modes, smarter focus rings, etc.). Reviewers can defer or decline OPPORTUNITY findings without compromising ship-readiness; they are the path to *feels designed*.

### Finding ID format

`BIC-<AREA>-<N>` (best-in-class). Areas:

- `VIS` — visual: color, typography, iconography
- `LAY` — layout: page shell, landmarks, spacing rhythm, density
- `FRM` — forms, states (empty/loading/error), interactions
- `COPY` — copy, terminology, a11y, routing
- `MOT` — motion, transitions, micro-interactions *(new)*
- `DAT` — data display: tables, charts, metrics, dense lists *(new)*
- `REGR` — regression of a previously-shipped fix *(reserved; not expected to be common)*

### Per-finding fields

```
### BIC-VIS-12: <one-line title>
- Severity: QUALITY
- Tag: [FOUNDATION] | [PAGE: Insights] | [SHELL]
- Files: frontend/src/.../File.tsx:123, ...
        (or "visual-only — see screenshot 4")
- Recurrence: seen on N pages — Home, Transactions, Budgets   (foundation only)
- Evidence: <what's there now, with quoted classNames or quoted code where useful>
- Impact: <why it matters at the best-in-class bar>
- Fix sketch: <1–2 sentences; not a full plan>
- Effort: S | M | L
- Cross-ref: U-VIS-7 (Apr 26 audit), if applicable
```

### Foundation auto-promotion rule

Any finding logged on 3+ pages with the same root cause auto-promotes to `[FOUNDATION]`, even if first logged as page-specific. Re-tagging happens at the end of each session, not during it (avoids interrupting walk flow).

### Visual-only findings

When a finding lacks a clean code citation (e.g., "the gap between the page header and the first card feels cramped at 1280px in dark mode"), tag it `visual-only — see screenshot N`. The downstream `writing-plans` cycle resolves visual-only findings into concrete code edits.

### Cross-references

- Findings overlapping a still-open Apr 26 finding get a `Cross-ref:` line.
- Findings re-confirming an *already-fixed* Apr 26 item get logged as `BIC-REGR-N`.
- Findings duplicating each other within this audit get consolidated; the merged finding lists every original ID as `Consolidates: BIC-VIS-3, BIC-VIS-7`.

---

## 5. Wave decomposition

The finding inventory turns into shippable PRs along the principle: **Foundation first, then per-surface, OPPORTUNITY last.** Each wave fits one reviewable PR (typically a few hundred LOC delta). A wave that exceeds that size is sub-split.

### Wave Φ — Foundation

Must ship before any per-surface wave. May sub-split (Φ1, Φ2, …) if too big for one PR. Likely contents (will be confirmed by the walk):

- Token-vocabulary consolidation — collapse `text-ui` family into the canonical `text-foreground` family (or formalise the inverse). Pick one, migrate, lint-guard. Pairs with the still-open `U-FRM-2` finding from the Apr 26 audit.
- Typography role coverage — every page uses approved roles; ESLint rule rejects `font-bold` / `font-black` / arbitrary `text-[Npx]` / arbitrary `tracking-[…]`.
- Component variant gaps in `shared/components` — anything the walk reveals should exist as a primitive but doesn't (e.g., section header, metric card, dense list row, status pill, page header pattern).
- Dark-mode contrast verification per token — catalog tokens that fail AAA in dark; fix the palette so semantic tokens hold in both themes.
- Motion / transition primitives — duration scale, easing tokens, reusable transition utilities. The walk will tell us if these need to exist; for "feels designed" they almost always do.
- Chart-color theming verification — the recent extract should cover all charts; close any gaps surfaced by the walk.

### Wave 1 — Critical BLOCKERs (parallelizable with Φ if surgical)

Anything labeled BLOCKER that's surgical and doesn't depend on foundation work to land cleanly. Goal: ship-readiness as fast as possible.

**BLOCKERs that are NOT surgical** (e.g., a contrast violation that's actually rooted in the dark-mode palette, or a typography violation that's really a missing role) get folded into Φ rather than Wave 1. The categorization happens at the end of the walk, when the finding's true root cause is visible.

### Waves 2..N — Per-surface (ship after Φ; may parallelize across non-overlapping files)

A wave = the QUALITY + POLISH findings for one surface or one tight cluster. Suggested clustering based on the page inventory:

- **Wave 2** — Shell + Home (highest-traffic, sets visual tone)
- **Wave 3** — Logged-out + Onboarding (first-impression block)
- **Wave 4** — Transactions cluster (list, detail, filters, add/edit, bulk-delete)
- **Wave 5** — Budgets cluster (list, detail, add/edit, manual setup)
- **Wave 6** — Insights cluster
- **Wave 7** — Settings cluster (Categories + Payment Methods + Your Account)
- **Wave 8** — 404 + cross-cutting micro-fixes left over

Cluster boundaries are starting points; the walk may suggest re-bundling.

### Wave Ω — OPPORTUNITY (lands last)

Ships after Φ + per-surface waves are stable. Sub-splittable:

- Ω1 — motion / transitions
- Ω2 — micro-interactions
- Ω3 — empty-state delight (illustration, copy, CTA refinement)
- Ω4 — density modes / dense-data polish
- Ω… — anything else the walk surfaces in the OPPORTUNITY tier

### Sequencing constraint (one hard rule)

```
Wave 1   ──▶  ships independently, anytime
Φ        ──▶  [Wave 2 .. Wave N parallel]   ──▶   Ω
```

Per-surface waves *must* wait for Φ, or each will need re-visiting after foundation lands. Wave 1 (surgical BLOCKERs) can ship whenever ready, even before Φ.

### Per-wave artifact

Each downstream wave gets its own `writing-plans` cycle producing a `docs/superpowers/plans/2026-04-XX-<wave>-plan.md` plan file matching the existing convention. This audit doc is the *index* — every wave links back to its findings.

### Estimated wave count

- Φ: 1–3 sub-waves
- Per-surface: 7 waves (one per cluster above)
- Ω: 1–4 sub-waves

Realistic total: **9–14 PRs.** That's the price of "best-in-class," but spread across waves it's reviewable and pause/resumable.

---

## 6. Out of scope

- Backend functional changes — this is UI/UX only. Backend issues that surface (e.g., a slow query making a list jank) get logged and flagged, but their fix is a separate spec.
- Functional / feature changes — no new features, no behaviour changes beyond what a polish requires (e.g., adding focus management to an existing modal counts; redesigning the modal's purpose doesn't).
- Test coverage gaps — same exclusion as the Apr 26 audit.
- The `playground` feature — internal-only.
- Performance unless perceptibly broken — the walk catches "this jitters" or "this scrolls badly," not "this could be 200ms faster."
- Re-litigating Apr 26 audit findings already shipped (recent commits) unless the walk surfaces a regression.

---

## 7. Finding inventory

> **Output target.** This section is intentionally empty at spec-write time. After the agent dispatch + orchestrator consolidation finishes, findings land here grouped by the agent that surfaced them (with cross-agent duplicates merged). Foundation auto-promotion (§ 4) runs over the consolidated set before this section is finalised.

### Agent 1 — First impression (Shell, Signin, Register/OAuth, Onboarding, Home)

*(awaiting consolidation)*

### Agent 2 — Money flows (Transactions, Budgets, Home)

*(awaiting consolidation)*

### Agent 3 — Insights & charts

*(awaiting consolidation)*

### Agent 4 — Settings cluster (Categories, Payment Methods, Your Account, 404)

*(awaiting consolidation)*

### Agent 5 — Foundation primitives

*(awaiting consolidation)*

### Cross-cutting (consolidated from multiple agents)

*(awaiting consolidation)*

---

## 8. Wave plan (post-walk)

> **Output target.** This section is intentionally empty at spec-write time. It is populated at the end of Session D, once the inventory is complete and findings have been categorized into foundation/page/opportunity buckets. Each wave entry will list its finding IDs, estimated effort, and sequencing position.

- Wave Φ: *(awaiting end of Session D)*
- Wave 1: *(awaiting end of Session D)*
- Waves 2..N: *(awaiting end of Session D)*
- Wave Ω: *(awaiting end of Session D)*

---

## 9. Success criteria

**For this spec (the audit doc):**

- Every surface in the inventory was assigned to and read by an agent.
- Every BLOCKER finding has been independently re-verified by the orchestrator (re-read at the cited `file:line`).
- Every finding has ID, severity, foundation/surface tag, `file:line` citation, evidence, impact, fix sketch, effort.
- Cross-agent duplicates merged; foundation findings deduplicated and recurrence-counted.
- Wave decomposition concrete: each wave has a name, a finding list, an estimated effort, a sequencing position.
- Cross-references to Apr 26 findings filed.

**For the downstream project (all waves shipped):**

- Φ landed: one canonical token vocabulary; ESLint guards in place; typography roles enforced; dark-mode contrast verified; motion primitives defined.
- All BLOCKER and QUALITY findings closed.
- Re-audit (re-running 1–2 of the agents from this spec, or a fresh agent on a previously-clean surface) produces zero new BLOCKER/QUALITY findings.
- POLISH and OPPORTUNITY findings tracked but not gating.
- Deployment-ready: app feels intentional and cohesive across pages, themes, and states.

---

## 10. Open kickoff items

Most kickoff friction was eliminated by the pivot to agent-orchestrated audit (no live walkthrough → no test-data seeding, screenshot flow, theme toggle path, or dev-server bring-up needed for discovery). What remains:

1. **Branch** — `audit/uiux-best-in-class-sweep` already created and is the working branch.
2. **Housekeeping** — `.superpowers/` already added to `.gitignore` (commit `c2c5a46`).
3. **Optional follow-on screenshot pass** — if the user wants to fill the visual-only gap (~10–15% of findings), they can paste 10–15 screenshots of pages that "feel off" *after* the audit run completes; orchestrator will file visual-only findings as a supplementary section in § 7.
