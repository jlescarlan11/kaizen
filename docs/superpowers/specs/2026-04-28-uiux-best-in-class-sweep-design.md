# UI/UX Best-in-Class Sweep — Design

**Date:** 2026-04-28
**Branch:** `audit/uiux-best-in-class-sweep`
**Predecessors:** `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`, `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md`
**Quality bar:** Best-in-class — Linear / Vercel / Stripe. The app should *feel designed*, not merely correct.

---

## 1. Goal and deliverable

**What this spec produces:** an *audit document* — methodology, severity rubric, finding inventory with `file:line` citations, foundation-vs-page categorization, and a wave decomposition. This is the same shape as the Apr 26 audit but conducted via live walkthrough, against a higher quality bar, and across more coverage axes.

**What this spec does NOT produce:** the fixes themselves. Each downstream wave (foundation, per-surface, cross-cutting opportunity) becomes its own `writing-plans → implementation` cycle, the same shape as Wave U-1a / U-1bcd shipped last week. This spec is the map; the journeys come after.

**Why this framing.** "Best-in-class + live walkthrough + every coverage axis" will plausibly surface 80–150 findings. Fixing them as we walk would yield a half-finished mega-PR with no review boundary. Categorizing them into a finding inventory + wave plan keeps each downstream PR reviewable, lets the team pause/resume between waves, and means the walk itself can be done in 2–4 sittings instead of dragging across days of fix work.

**Doc lifecycle.** This document has two states:

- **At spec-write time (now):** methodology, severity rubric, page inventory, walk protocol, wave principle, sequencing constraint. Sections 7 and 8 are intentionally empty and act as the output target for the walk.
- **At end of Session D:** sections 7 and 8 fully populated; foundation auto-promotion run; cross-references filed. The "complete" state is the final deliverable.

**Success criterion for the spec-write state:** sections 1–6 + 9–10 stable; severity rubric, finding format, and wave principle agreed; page inventory and session boundaries confirmed; open kickoff items enumerated.

**Success criterion for the end-of-walk state:** finding inventory complete; every finding has citation (or visual-only marker), foundation/page tag, severity, fix sketch, effort; waves decomposed and prioritized; sequencing constraint applied to actual findings; cross-references to Apr 26 audit filed.

---

## 2. Page inventory and walk order

### Surfaces in scope (12 surfaces + the global shell)

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
| 10 | **Goals** | List, detail, create, edit |
| 11 | **Your Account** | Profile, sessions, settings groups |
| 12 | **404 / Not Found** | The page itself + how it's reached |

`playground` is excluded as internal-only.

### Suggested session boundaries (~2.5–3 hrs total)

- **Session A (~45 min)** — logged-out (1, 2) + onboarding (3) + shell (0) + Home (4). The first-impression block.
- **Session B (~45 min)** — money flows: Transactions (5) + Budgets (6).
- **Session C (~45 min)** — Insights (7) + settings cluster (8, 9, 10).
- **Session D (~30 min)** — Your Account (11), 404 (12), shell re-walk for cross-page issues.

**Order rationale.** Logged-out + onboarding first because the first-impression bar is highest there. Money flows second because they're highest-traffic and densest. Settings last because they're predictable. Shell findings get logged whenever they surface and revisited at the end.

---

## 3. Walk methodology

### Per-page rhythm (~15 min/page)

Instead of testing all 96 axis combinations per page, layer them in this order:

1. **Light + Desktop + Populated** — primary view. Composition, hierarchy, density, rhythm. ~3 min.
2. **Toggle dark** (same window) — contrast, semantic-token slips, dark-only issues. ~1 min.
3. **Resize to ~375px** (mobile, light mode) — overflow, nav shift, touch-target sizing. ~2 min.
4. **Resize to ~768px** (tablet, quick check) — usually catches breakpoints mobile didn't. ~1 min.
5. **Empty state** — clear data or use the empty-state route; quick light+dark glance. ~2 min.
6. **Loading state** — throttle network in DevTools or trigger a slow query; capture skeleton/spinner treatment. ~1 min.
7. **Error state** — force a failure (block request in DevTools or kill backend briefly) on the page's key call; capture how the page degrades. ~2 min.
8. **Keyboard pass** — tab through every interactive; check focus rings, hover affordance, disabled treatment, modal focus traps. ~3 min.

### Roles during a session

- **User:** drives browser, toggles theme, resizes, navigates, pastes screenshots when something looks off (or when asked), describes what feels wrong.
- **Claude:** reads source for the surface in view, cross-references descriptions to exact `file:line`, logs findings into a running draft of the audit doc, pushes proposed-fix mockups to the visual companion when before/after will help us decide.

**Constraint to honour.** Claude cannot see the user's browser directly. Findings driven by visual-only judgement (spacing rhythm, density feel, contrast under dark mode) require the user to paste a screenshot or describe explicitly. Code-traceable findings are augmented with `file:line` citations from source reading.

### Tooling expectations

- DevTools open the entire walk: responsive mode, network throttle, request blocking, device emulation.
- Screenshots: `cmd+shift+ctrl+4` (or OS equivalent) → paste directly into chat.
- Theme toggle: whatever the shell exposes; OS-level fallback if needed.
- Test data: a logged-in account with a few budgets, ~20+ transactions across multiple categories, ≥1 goal, ≥2 payment methods. If absent, write a one-time seed script before Session A.
- Visual companion at `http://localhost:63537` (or whichever port the brainstorming server reports for this session) for mockup pushes.

### Real-time logging

- Maintain a working draft of this same doc throughout the walk — append findings under the per-session section (§ 7).
- Each finding gets ID, severity, citation (or visual-only marker), foundation/page tag, evidence, impact, fix sketch, effort.
- After each session, commit the running doc to the `audit/uiux-best-in-class-sweep` branch.

### Pause/resume contract

If a session pauses, the doc state is the resumption point. The next session starts by reading "where we left off" from the doc + the task list — no oral handoff required.

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
- **Wave 7** — Settings cluster (Categories + Payment Methods + Goals + Your Account)
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

> **Output target.** This section is intentionally empty at spec-write time and gets filled in during sessions A–D. Each session appends its findings under the matching subheading. Foundation auto-promotion (§ 4) is run at end of session, not mid-walk.

### Session A — logged-out + onboarding + shell + Home

*(awaiting Session A)*

### Session B — Transactions + Budgets

*(awaiting Session B)*

### Session C — Insights + Categories + Payment Methods + Goals

*(awaiting Session C)*

### Session D — Your Account + 404 + cross-cutting cleanup

*(awaiting Session D)*

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

- Every page in the inventory walked across all four coverage axes (light/dark, desktop/tablet/mobile, populated/empty/loading/error, hover/focus/active/disabled).
- Every finding has ID, severity, foundation/page tag, citation (or visual-only marker), evidence, impact, fix sketch, effort.
- Foundation findings deduplicated and recurrence-counted.
- Wave decomposition concrete: each wave has a name, a finding list, an estimated effort, a sequencing position.
- Cross-references to Apr 26 findings filed.

**For the downstream project (all waves shipped):**

- Φ landed: one canonical token vocabulary; ESLint guards in place; typography roles enforced; dark-mode contrast verified; motion primitives defined.
- All BLOCKER and QUALITY findings closed.
- Re-walk of any 3 randomly-picked surfaces produces zero new BLOCKER/QUALITY findings.
- POLISH and OPPORTUNITY findings tracked but not gating.
- Deployment-ready: app feels intentional and cohesive across pages, themes, breakpoints, and states.

---

## 10. Open kickoff items (to confirm at Session A start)

Not blocking the spec. Blocking the first walk:

1. **Test data state** — does a logged-in account already exist with a few budgets, ~20+ transactions, ≥1 goal, ≥2 payment methods? If not, write a one-time seed script before Session A.
2. **Screenshot flow** — confirm `cmd+shift+ctrl+4` (or OS equivalent) → paste-into-chat works.
3. **Theme toggle path** — confirm where the light/dark toggle lives in the shell.
4. **Dev server bring-up** — `npm run dev` in `frontend/` and the backend equivalent come up clean.
5. **Branch** — `audit/uiux-best-in-class-sweep` already created and is the working branch for the audit doc + per-session commits. Confirm naming is OK or rename before Session A.
6. **Housekeeping** — add `.superpowers/` to `.gitignore` so brainstorm session files don't get tracked.
