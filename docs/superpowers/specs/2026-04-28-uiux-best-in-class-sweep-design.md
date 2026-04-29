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

> **Audit run completed 2026-04-29.** Five parallel exploration agents read source. Orchestrator independently re-verified every BLOCKER claim by re-reading the cited file:line. Cross-agent duplicates merged. Foundation auto-promotion applied (any root cause spanning 3+ surfaces re-tagged `[FOUNDATION]`).
>
> **Verification adjustments:**
>
> - Agent 1 BIC-FRM-1 (BLOCKER, GoalPlaceholderRow missing `onKeyDown`) — **DROPPED.** Re-read of HomePage.tsx:293 shows `onKeyDown={(e) => e.key === 'Enter' && navigate('/goals')}` is in fact present. Agent missed it.
> - Agent 5 BIC-FRM-1 — **citations corrected.** Agent cited `SelectionActionBar.tsx:8` and `TransactionDetailInfo.tsx:15`. Actual lines are `SelectionActionBar.tsx:33` and `TransactionDetailInfo.tsx:75`. UndoSnackbar:42 was correct.
> - Agent 3 BIC-VIS-1 + BIC-MOT-2 — **merged.** Same root cause (`text-blue-500` in TrendInsights.tsx:53 icon-color map).
> - Agent 4 BIC-LAY-2 + BIC-COPY-2 — **merged.** Same root cause (YourAccountPage `<h2>` should be `<h3>` with responsive scaling).
> - Agent 2 BIC-VIS-1 + BIC-LAY-1 — **merged.** Same root cause (BudgetDetailPage h1 conflicting `tracking-tight`/`tracking-wide`).
> - Agent 2 BIC-FRM-1 + BIC-REGR-1 — **merged.** TransactionEntryForm `category`/`paymentMethodId` selectors still validate on `onChange` — partial regression of Apr 26 U-FRM-1.
> - Closure-verification entries from Agents 1 + 3 (BIC-LAY-1 already-fixed, BIC-COPY-1 already-compliant, BIC-REGR-1/2/3) dropped — they're audit-log notes, not findings.
> - Token violations across Agents 2 / 3 / 4 / 5 (`text-amber-500`, `text-blue-500`, `text-white` on dynamic bg, `text-danger` undefined, semantic-color ad-hoc use) auto-promoted to `[FOUNDATION]` — same root cause spans 4 surfaces.
> - Agent 4 BIC-LAY-4 (Category vs PaymentMethod management page layout differ) and BIC-FRM-2 (form helper-text differ) — **dropped.** Re-read suggests these are intentional product-design differences, not violations or drift.

### Counts (post-consolidation)

- **BLOCKER:** 4
- **QUALITY:** 22
- **POLISH:** 12
- **OPPORTUNITY:** 9
- **Total: 47**

---

### Agent 1 — First impression (Shell, Signin, Register/OAuth, Onboarding, Home)

#### BIC-DAT-A1-1: HomePage transaction/budget rows wrap interactive children inside a single `role="button"` div (nested interactives)
- Severity: QUALITY
- Tag: [PAGE: Home]
- Files: `frontend/src/features/home/HomePage.tsx:38-109` (TransactionRow), `:112-284` (BudgetRow)
- Evidence: BudgetRow's outer `role="button"` div wraps a `<DisclosureButton>` (line 185) — a nested interactive control. Screen readers will announce one and may skip or doubly-announce the other.
- Impact: WCAG 2.1 — no nested interactive controls. SR users may miss the Insights toggle.
- Fix sketch: Convert the outer clickable area to a real `<button>` and place the disclosure as a sibling with shared parent grid/flex.
- Effort: M

#### BIC-LAY-A1-1: Sidebar (desktop) and bottom-nav (mobile) active-state affordances differ visually
- Severity: QUALITY
- Tag: [SHELL]
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx:198-211`, `:335-365`
- Evidence: Desktop active state always renders `bg-ui-accent-subtle border border-ui-border-strong` pill. Mobile active state combines `text-foreground scale-110` with a *conditional* background, causing a visual jump on toggle.
- Impact: Inconsistent affordance across breakpoints; mobile feels less defined.
- Fix sketch: Always render a subtle pill on mobile (low opacity inactive, full opacity active), or adopt a single indicator-bar pattern shared with desktop.
- Effort: M

#### BIC-COPY-A1-1: Empty-state CTA copy drift across home and onboarding
- Severity: QUALITY
- Tag: [PAGE: Home], [PAGE: Onboarding]
- Files: `frontend/src/features/home/emptyStateCopy.ts:5-10`, `frontend/src/features/onboarding/OnboardingBudgetStep.tsx:494-498`
- Evidence: Home TransactionsEmptyState uses `"Tap + to get started"` (mobile-centric, FAB-dependent), Home BudgetsEmptyState uses `"Quick setup"` (vague), Onboarding uses generic step-button labels.
- Impact: First-impression copy reads inconsistent — three CTA flavors for the same action class.
- Fix sketch: Standardize on verb-noun (`"Add transaction"` / `"Set up budget"`) and document in the empty-state pattern.
- Effort: M

#### BIC-VIS-A1-1: Notification badge hardcodes `bg-red-500`
- Severity: POLISH
- Tag: [SHELL]
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx:279`
- Evidence: `<span className="absolute … w-2 h-2 bg-red-500 rounded-full …" />` — generic Tailwind color, not a semantic token.
- Impact: Token drift in shell. Dark-mode tone not guaranteed to match other danger affordances.
- Fix sketch: Replace with `bg-ui-danger` (or whichever notification-dot token is documented).
- Effort: S

#### BIC-VIS-A1-2: HomePage balance amount sits as bare `<span>` outside semantic structure
- Severity: POLISH
- Tag: [PAGE: Home]
- Files: `frontend/src/features/home/HomePage.tsx:378-382`
- Evidence: `<h2>` wraps the amount label, but the formatted amount + `"PHP"` currency-code render as adjacent `<span>`s with no semantic relationship.
- Impact: The largest number on the dashboard isn't part of a semantic element. Minor a11y/structure nit.
- Fix sketch: Either lift the amount into the `<h2>` or wrap as `<p>` with role-typography. Pair currency code with `<abbr>` if appropriate.
- Effort: S

#### BIC-FRM-A1-1: Onboarding step bottom-action buttons render different primary icons (ArrowRight vs Check)
- Severity: POLISH
- Tag: [PAGE: Onboarding]
- Files: `frontend/src/features/onboarding/BalanceSetupStep.tsx:155-168`, `frontend/src/features/onboarding/OnboardingBudgetStep.tsx:539-553`
- Evidence: Identical button shape, identical responsive sizing, but different glyphs without a clear "next vs final" rule.
- Impact: Visual rhythm jitters between steps; users can't predict step count from the icon.
- Fix sketch: Decide a rule (Check = final step, ArrowRight = intermediate) and apply across all onboarding steps.
- Effort: S

#### BIC-MOT-A1-1: Signin page lacks the staggered fade-in motion used on UnauthenticatedHome
- Severity: OPPORTUNITY
- Tag: [PAGE: Signin]
- Files: `frontend/src/features/signin/SigninPage.tsx:50-66`, contrast: `frontend/src/features/home/UnauthenticatedHome.tsx:20,26,35,41,52`
- Evidence: UnauthenticatedHome uses `animate-fade-up` with staggered delays. Signin renders static.
- Impact: First-impression surface feels utilitarian; the public marketing page feels designed. Mismatch in perceived craft on the most important entry path.
- Fix sketch: Apply the same staggered-fade pattern to signin's header + OAuth button. Add a redirecting-spinner state on click.
- Effort: S

#### BIC-MOT-A1-2: AddEntryFAB lacks press-state visual feedback / haptic hook
- Severity: OPPORTUNITY
- Tag: [SHELL]
- Files: `frontend/src/shared/components/AddEntryFAB.tsx:100-131`
- Evidence: Only `active:scale-95` on the main FAB; no brightness shift, no haptic call.
- Impact: On mobile, taps lack confirmation feedback; on desktop, click-down rhythm feels flat.
- Fix sketch: Add `active:brightness-110` and a `useHapticFeedback()` hook tied to `navigator.vibrate(10)` (graceful no-op when unsupported).
- Effort: S

---

### Agent 2 — Money flows (Transactions, Budgets, Home data)

#### BIC-FRM-A2-1: TransactionEntryForm category & payment-method selectors still validate on `onChange` (partial U-FRM-1 regression)
- Severity: QUALITY
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:425-427, 437-439`
- Evidence: Both selectors call `validateField(...)` synchronously inside `onChange` — same anti-pattern Apr 26 U-FRM-1 fixed for amount/date/description.
- Impact: Mandatory-standard violation per CODING_STANDARDS §1.7.2 #3 — error messages can appear before user finishes a field interaction.
- Fix sketch: Move both selectors to validate on blur (or explicitly to submit, since selectors don't always emit blur cleanly). Document the rule.
- Effort: M
- Cross-ref: U-FRM-1 (Apr 26 — partial regression; classified as QUALITY because the canonical text inputs were closed)

#### BIC-FRM-A2-2: TransactionListPage filter-chip close buttons lack `aria-label`
- Severity: QUALITY
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/TransactionListPage.tsx:212, 228, 239, 252, 263`
- Evidence: Five icon-only `<button>`s with `<CloseIcon />` and no label.
- Impact: Screen-reader users can't tell what each chip removes. WCAG 4.1.2 fail.
- Fix sketch: Add `aria-label={`Remove ${filterName}`}` to each.
- Effort: S

#### BIC-LAY-A2-1: BudgetDetailPage h1 mixes `tracking-tight` and `tracking-wide`
- Severity: QUALITY
- Tag: [PAGE: Budgets]
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:60`
- Evidence: `<h1 className="… tracking-tight text-foreground uppercase tracking-wide">` — both tracking utilities applied.
- Impact: Standards conflict: §1.7.1 uses `tracking-tight` for headings; `tracking-wide` is for uppercase micro-labels. Both on a heading is a mix-up.
- Fix sketch: Drop `tracking-wide` (and `uppercase` if the heading isn't actually all-caps in copy).
- Effort: S

#### BIC-LAY-A2-2: BudgetDetailPage content after `</header>` wraps in plain `<div>` instead of `<main>` or `<section>`
- Severity: QUALITY
- Tag: [PAGE: Budgets]
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:99-210`
- Evidence: `<div className="space-y-16">` wraps two child `<section>`s. The page lacks a single content-landmark wrapper.
- Impact: Page outline misses the main-content boundary expected on detail pages.
- Fix sketch: Change wrapping `<div>` → `<main>` (or wrap all subsections in one `<section>` with a labeled heading).
- Effort: S
- Cross-ref: extends Apr 26 U-LAY-3 (closed at Budget hero header level; this is the body-wrapper level)

#### BIC-COPY-A2-1: BudgetDetailPage primary action labelled "Edit Configuration" — drift from "Edit Entry" / "Save Changes" elsewhere
- Severity: QUALITY
- Tag: [PAGE: Budgets]
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:94`
- Evidence: `"Edit Configuration"` (gerund-of-noun) vs `"Edit Entry"` on TransactionDetail.
- Impact: Microcopy voice drift on parallel money-flow surfaces.
- Fix sketch: Change to `"Edit Budget"`. Keep voice consistent across detail pages.
- Effort: S
- Cross-ref: U-COPY-3 / U-COPY-4 (Apr 26 verb-rule space)

#### BIC-VIS-A2-1: MoneyFlowDisplay uses `text-2xl` without binding to a documented role
- Severity: POLISH
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx:27, 38`
- Evidence: `<p className="text-2xl font-semibold tracking-tight text-foreground">` — ad-hoc display-strong size, no role mapping.
- Impact: Same display pattern likely exists on other pages; without a role, future drift is invisible.
- Fix sketch: Either (a) extract a `display-strong` typography role into `shared/styles/typography.ts` and use it, or (b) lift to an existing `h3` role with explicit `leading-snug`.
- Effort: S

#### BIC-COPY-A2-2: TransactionDetail delete confirmation copy doesn't reference the existing undo affordance
- Severity: POLISH
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/TransactionDetailPage.tsx:155-157`
- Evidence: Modal body: `"Are you sure you want to delete this transaction? This action cannot be undone."`. UndoSnackbar wires transaction delete with an undo timer.
- Impact: Copy contradicts the actual undo path. Users feel less safe than the system actually is.
- Fix sketch: Update to `"Delete transaction? You can undo this from the toast that appears."`. Verify timing matches UndoSnackbar's policy.
- Effort: S

#### BIC-FRM-A2-3: TransactionTypeToggle still calls `validateField('type', ...)` on change
- Severity: POLISH
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:396-400`
- Evidence: `onChange={(newType) => { setType(newType); validateField('type', newType) }}`.
- Impact: Type can never be invalid — INCOME/EXPENSE are the only options. The validation call is dead code.
- Fix sketch: Remove the `validateField` call. Document that the toggle has no validation requirement.
- Effort: S

#### BIC-LAY-A2-3: Three sites reimplement a "secondary detail-page action button" with `rounded-xl`, bypassing the Button primitive
- Severity: OPPORTUNITY
- Tag: [PAGE: Budgets], [PAGE: Transactions]
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:84-95`, `frontend/src/features/transactions/TransactionDetailPage.tsx:54-59`, `frontend/src/features/transactions/components/TransactionActionGroup.tsx:20-30`
- Evidence: All three carry `px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide`. Button primitive uses `rounded-md`.
- Impact: Maintenance tax + parallel button styles. A new "secondary-lg / detail-action" Button variant would kill the duplication.
- Fix sketch: Add `secondaryLg` variant to Button.tsx; migrate all three sites.
- Effort: M

#### BIC-DAT-A2-1: MoneyFlowDisplay doesn't visually distinguish "no transactions" from "small outgoing"
- Severity: OPPORTUNITY
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/components/MoneyFlowDisplay.tsx:49`
- Evidence: When both income and outgoing are 0, `percentage` is 0 — the bar renders the same as healthy-low spending.
- Impact: Zero-state and healthy-state are visually identical, removing meaning.
- Fix sketch: Branch the empty case explicitly: render `bg-ui-border-subtle` plus a "no activity" caption.
- Effort: S

#### BIC-DAT-A2-2: HomePage / BudgetsPage Disclosure toggle has no `aria-label` on the chevron-only button
- Severity: OPPORTUNITY
- Tag: [PAGE: Home], [PAGE: Budgets]
- Files: `frontend/src/features/budgets/BudgetsPage.tsx:97-105`, `frontend/src/features/home/HomePage.tsx:185-193`
- Evidence: `DisclosureButton` renders a rotating chevron. No label declared.
- Impact: AT users hear an unlabeled toggle button.
- Fix sketch: Add `aria-label="Show details"` (or an open/closed-aware pair via `aria-expanded`).
- Effort: S

#### BIC-FRM-A2-4: TransactionEntryForm balance hint uses `.toLocaleString()` while rest of form uses `formatCurrency`
- Severity: OPPORTUNITY
- Tag: [PAGE: Transactions]
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:444-450`
- Evidence: `Balance: PHP {availableBalance.toLocaleString()}` — no decimal places, no shared formatter.
- Impact: Currency precision can drift (₱1,000 vs ₱1,000.00) within the same form.
- Fix sketch: Use the shared `formatCurrency` util.
- Effort: S

---

### Agent 3 — Insights & charts

#### BIC-VIS-A3-1: SpendingTrends `CartesianGrid` and axes don't theme via tokens
- Severity: QUALITY
- Tag: [PAGE: Insights]
- Files: `frontend/src/features/insights/components/SpendingTrends.tsx:74-76`
- Evidence: `<CartesianGrid strokeDasharray="3 3" />` and bare `<XAxis fontSize={12} />` / `<YAxis fontSize={12} width={60} />` omit the explicit token references that BalanceTrendChart sets at lines 134, 143, 151 (`stroke="var(--ui-border-subtle)"`, `tick={{ fill: 'var(--color-text-secondary)' }}`).
- Impact: Grid + axis labels in this chart fall back to Recharts defaults — not theme-aware. Visible drift in light/dark.
- Fix sketch: Mirror BalanceTrendChart's explicit `stroke` and `tick` props on CartesianGrid + axes.
- Effort: S
- Cross-ref: extends U-VIS-6 (Apr 26 — chart-color theme module landed; this site escaped the migration)

#### BIC-MOT-A3-1: Chart loading states use four different placeholder shapes
- Severity: POLISH
- Tag: [PAGE: Insights]
- Files: `frontend/src/features/insights/components/SpendingSummary.tsx:13-17`, `BalanceTrendChart.tsx:58-63`, `CategoryBreakdown.tsx:16-20`, `SpendingTrends.tsx:21-26`
- Evidence: Three `<div>` boxes vs spinner+text vs centered text vs centered text. No skeleton matches its chart's shape.
- Impact: Mental-model break as users move between charts; loading rhythm jitters.
- Fix sketch: Add a `<ChartSkeleton variant="pie|bar|line">` primitive in `shared/components`. Use it across all four sites.
- Effort: M

#### BIC-DAT-A3-1: CategoryBreakdown `<Pie>` has no fallback `fill`; relies entirely on per-`<Cell>` color
- Severity: POLISH
- Tag: [PAGE: Insights]
- Files: `frontend/src/features/insights/components/CategoryBreakdown.tsx:48-54, 56-58`
- Evidence: `<Pie>` lacks a `fill` prop. If the data-mapping logic loses cells, slices render Recharts default gray.
- Impact: Defensive gap. Future data-shape changes could silently lose theme.
- Fix sketch: Add `fill={getCategoricalColor(0)}` to `<Pie>` as a safety default.
- Effort: S

#### BIC-FRM-A3-1: PeriodSelector renders `aria-label` but no visible label
- Severity: POLISH
- Tag: [PAGE: Insights]
- Files: `frontend/src/features/insights/components/PeriodSelector.tsx:16-28`
- Evidence: `<Select id="period-selector" label="Analysis Period" aria-label="Analysis period" …>` — `label` prop declared but does not render visibly above the select control.
- Impact: Sighted users don't see what the dropdown controls; a11y is fine but UX is impoverished.
- Fix sketch: Render the label visibly via Select's documented label-display path, or wrap the Select in a labeled group.
- Effort: S
- Cross-ref: extends Apr 26 U-COPY-11 (closed via aria-label; visible label is the next polish step)

---

### Agent 4 — Settings cluster (Categories, Payment Methods, Your Account, 404)

#### BIC-FRM-A4-1: SessionsPage Revoke button has **no destructive-action confirmation dialog** *(BLOCKER)*
- Severity: BLOCKER
- Tag: [PAGE: Your Account]
- Files: `frontend/src/features/your-account/SessionsPage.tsx:82-91`
- Evidence: `<button type="button" onClick={() => handleRevoke(session.id)} disabled={isRevoking}>Revoke</button>` — fires immediately, no modal. PaymentMethodList already uses `DestructiveActionDialog` (`PaymentMethodList.tsx:125-144`).
- Impact: **Security-UX BLOCKER.** A misclick logs out a user from a device they didn't intend to revoke. Inconsistent with the codebase's documented destructive-action pattern.
- Fix sketch: Wrap revoke in `DestructiveActionDialog`. Confirmation should show device label, last-seen timestamp, and a clearly-tone-danger primary action.
- Effort: M
- Cross-ref: extends Apr 26 U-FRM-8 (destructive-modal divergence)

#### BIC-LAY-A4-1: Three Your-Account sub-pages wrap headers in `<div>` instead of `<header>`
- Severity: QUALITY
- Tag: [PAGE: Your Account]
- Files: `frontend/src/features/your-account/ProfilePage.tsx:13`, `AppearancePage.tsx:34`, `SessionsPage.tsx:26`
- Evidence: All three use `<div className={pageLayout.headerGap}>` for the page header block.
- Impact: Page-level landmark missing on three settings sub-pages.
- Fix sketch: `<div>` → `<header>` on each. Verify no CSS depends on the tag.
- Effort: S
- Cross-ref: Apr 26 U-LAY-4 (closed at YourAccountPage; sub-pages were missed)

#### BIC-LAY-A4-2: YourAccountPage section titles use `<h2>` instead of `<h3>` and lack responsive scaling
- Severity: QUALITY
- Tag: [PAGE: Your Account]
- Files: `frontend/src/features/your-account/YourAccountPage.tsx:450`
- Evidence: `<h2 className="text-lg font-medium leading-snug text-foreground mb-3">` for sub-section titles ("Your account", "Notifications", etc.). CODING_STANDARDS §1.7.1 reserves `<h2>` for major page sections; sub-section titles are `<h3>` with `text-lg md:text-xl font-medium leading-snug`.
- Impact: Outline hierarchy reads flat; mobile-vs-desktop heading rhythm doesn't scale.
- Fix sketch: `<h2>` → `<h3>`; add `md:text-xl`. Verify accountSections array iteration follows the same shape.
- Effort: S

#### BIC-COPY-A4-1: CTA verb inconsistency across creation forms
- Severity: QUALITY
- Tag: [PAGE: Categories], [PAGE: Payment Methods]
- Files: `frontend/src/features/categories/CategoryCreationForm.tsx:192`, `frontend/src/features/payment-methods/PaymentMethodCreationForm.tsx:63`
- Evidence: CategoryCreationForm uses `"Create category"` (create) / `"Save changes"` (edit). PaymentMethodCreationForm uses `"Add Payment Method"` always (no edit-mode awareness in the label).
- Impact: Settings forms answer the same question with three different verbs. Drift accumulates.
- Fix sketch: Define the rule in CODING_STANDARDS §1.7.2: **`Create <X>`** for new, **`Save changes`** for edit. Apply across categories, payment methods, budgets, transactions.
- Effort: M
- Cross-ref: Apr 26 U-COPY-4 (open)

#### BIC-FRM-A4-2: CategoryList empty state is a plain `<Card>` paragraph; no primary action
- Severity: QUALITY
- Tag: [PAGE: Categories]
- Files: `frontend/src/features/categories/CategoryList.tsx:26-30`
- Evidence: `<Card …><p className="text-sm text-muted-foreground">No categories found.</p></Card>`. Peer PaymentMethodList uses `EmptyStateCard` with a `primaryAction` button (closed via Apr 26 U-FRM-13 fix).
- Impact: Discoverability gap for first-time category creation.
- Fix sketch: Replace with `EmptyStateCard` + a primary action that focuses the creation form (or scrolls to it on mobile).
- Effort: S
- Cross-ref: extends Apr 26 U-FRM-13 (closed for PaymentMethodList; CategoryList was missed)

#### BIC-VIS-A4-1: AppearancePage theme-selector custom radio bypasses shared `Radio` primitive
- Severity: POLISH
- Tag: [PAGE: Your Account]
- Files: `frontend/src/features/your-account/AppearancePage.tsx:60-67`
- Evidence: `<div className={cn('h-5 w-5 shrink-0 rounded-full border-2 …', isSelected ? 'border-foreground bg-foreground' : 'border-ui-border-strong')}><div className="h-2 w-2 rounded-full bg-ui-bg" /></div>` — custom hand-rolled radio dot.
- Impact: Settings affordance bypasses the design system's Radio primitive; future Radio polish (motion, focus ring) won't reach this surface.
- Fix sketch: Replace with `<Radio>` from `shared/components/Radio.tsx` (or extract a `RadioIndicator` if the layout is unusual).
- Effort: S

#### BIC-COPY-A4-2: NotFoundPage offers only "Return home" — no "Go back" or search
- Severity: OPPORTUNITY
- Tag: [PAGE: 404]
- Files: `frontend/src/features/not-found/NotFoundPage.tsx:13`
- Evidence: Single CTA. No history-back, no search, no popular-pages list.
- Impact: 404 is a brand-voice and recovery-UX moment that the app underuses.
- Fix sketch: Primary "Go back" (history.back()), secondary "Home". Optional: brand illustration + a small "popular pages" list if cheap to maintain.
- Effort: M

#### BIC-MOT-A4-1: AppearancePage theme switch is instant — no transition
- Severity: OPPORTUNITY
- Tag: [PAGE: Your Account]
- Files: `frontend/src/features/your-account/AppearancePage.tsx:47-81`
- Evidence: `setTheme(option.value)` triggers an immediate class swap on `<html>`. No CSS transition.
- Impact: Theme change feels mechanical at the moment users specifically scrutinize the UI's polish.
- Fix sketch: Add `transition-colors duration-200 ease-out` on a small set of root tokens (background, foreground, border) — *not* `transition-all`. Verify it doesn't fight chart transitions.
- Effort: S

---

### Agent 5 — Foundation primitives

#### BIC-VIS-A5-1: `bg-ui-surface-strong` token is used in 3 components but never defined *(BLOCKER)*
- Severity: BLOCKER
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/UndoSnackbar.tsx:42`, `frontend/src/features/transactions/components/SelectionActionBar.tsx:33` (citation corrected from agent's `:8`), `frontend/src/features/transactions/components/TransactionDetailInfo.tsx:75` (citation corrected from agent's `:15`)
- Recurrence: 3 surfaces — UndoSnackbar (shell-level toast), SelectionActionBar (transactions bulk), TransactionDetailInfo (avatar circle)
- Evidence: `bg-ui-surface-strong` referenced in className. `grep` of `frontend/src/styles/globals.css` and `frontend/src/shared/styles/index.css` returns 0 matches for `--ui-surface-strong` or `--color-ui-surface-strong`.
- Impact: Tailwind drops the unknown class silently. UndoSnackbar's toast and SelectionActionBar render with no background; TransactionDetailInfo's avatar circle is transparent. Functional UX broken in two cases.
- Fix sketch: Define `--ui-surface-strong` (light + dark) in `globals.css`; expose via `@theme` in `index.css`. Should be a one-step-elevated surface from `--ui-surface`. Verify the three sites render correctly.
- Effort: S

#### BIC-VIS-A5-2: `hover:bg-black/N` violates dark-mode contrast across 12 interactive sites *(BLOCKER)*
- Severity: BLOCKER
- Tag: [FOUNDATION]
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx:201, 273, 284`, `frontend/src/shared/components/SiteHeader.tsx:128, 160, 237-238, 257`, `frontend/src/shared/components/SiteFooter.tsx:43`. Decorative (non-hover) sites separately: `IncomeVsExpenseWidget.tsx:15`, `TrendInsights.tsx:15-16`, `BalanceSummaryHero.tsx:21-23`, `HomePage.tsx:202`, `MoneyFlowDisplay.tsx:44`, `BudgetsPage.tsx:114`, `SkeletonList.tsx:24`, `ReceiptPicker.tsx:96`, `SiteHeader.tsx:99` (modal scrim).
- Recurrence: 21 total `bg-black/N` occurrences; 12 are interactive (`hover:`).
- Evidence: In dark mode, `hover:bg-black/5` darkens an already-dark surface — invisible feedback and AAA contrast fail. Modal scrim `bg-black/18` also too light against dark themes.
- Impact: **WCAG AAA fail.** Users in dark mode cannot perceive hover state on the entire shell + header navigation. Modal backdrop reads ambiguous.
- Fix sketch: Hover states → `hover:bg-ui-surface-muted` (or whatever named hover-state token is canonical). Modal scrim → a theme-aware variable (e.g., `bg-ui-bg-overlay`). Decorative skeletons → `bg-ui-border-subtle/40`.
- Effort: M

#### BIC-VIS-A5-3: Token-vocabulary drift — `text-amber-500`, `text-blue-500`, `text-white`, `text-danger`, plus 88 ad-hoc semantic-color uses
- Severity: QUALITY
- Tag: [FOUNDATION]
- Files: `frontend/src/features/budgets/BudgetsPage.tsx:191`, `frontend/src/features/home/HomePage.tsx:265` (text-amber-500, projected-over-budget); `frontend/src/features/insights/components/TrendInsights.tsx:53` (text-blue-500 in icon-color map); `frontend/src/features/categories/CategoryBadge.tsx:19` (text-white on dynamic-bg); `frontend/src/features/budgets/components/BudgetCard.tsx:73` (text-danger — undefined); plus ~88 grep hits of `text-primary`/`bg-primary`/`text-error`/`text-success` in feature code where neutral tokens are appropriate.
- Recurrence: 4+ surfaces, multiple distinct token violations — auto-promoted to `[FOUNDATION]` per § 4 rule.
- Evidence: `text-amber-500` is forbidden by §1.7.1; `text-blue-500` and `text-white` likewise; `text-danger` is referenced but undefined (the canonical token is `text-ui-danger-text`); `text-primary` etc. are valid but overused for plain body text where `text-foreground` is the documented role.
- Impact: Token drift across the codebase undermines the typography sweep that landed in `f164fb1`. Some violations break dark-mode contrast (text-amber on dark surfaces).
- Fix sketch: (a) Replace `text-amber-500` → `text-ui-warning-text` at 2 sites. (b) Replace `text-blue-500` → `text-primary` (or define a new info token if intent is "informational"). (c) Replace `text-white` in CategoryBadge with a contrast-aware token derived from the dynamic bg color. (d) Rename `text-danger` → `text-ui-danger-text` at the BudgetCard site. (e) Audit the 88 semantic-color sites; downgrade neutral text to `text-foreground`/`text-muted-foreground`/`text-subtle-foreground`. (f) Add ESLint rule banning `text-(red|amber|blue|green|gray|white|black)-` in source.
- Effort: L
- Cross-ref: extends Apr 26 U-FRM-2 (token vocab — closed for `text-ui` family; this is the next layer)

#### BIC-FRM-A5-1: Component-API naming drift — `variant` vs `tone` vs `emphasis` across primitives
- Severity: QUALITY
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/Button.tsx:5` (`ButtonVariant`), `Card.tsx:5` (`CardTone`), `Badge.tsx:4-5` (`BadgeTone` + `BadgeEmphasis`)
- Evidence: Three primitives, three different prop names for "visual style".
- Impact: Cognitive tax for component composition. New primitives may pick yet another name without a documented rule.
- Fix sketch: Adopt `variant` as the canonical name (Button already uses it). Rename `Card.tone` → `Card.variant` and `Badge.tone` → `Badge.variant`; keep `Badge.emphasis` only if it's a distinct axis. Add a CODING_STANDARDS line on primitive prop naming.
- Effort: M (touch every Card/Badge call site)

#### BIC-LAY-A5-1: Density support is incomplete — only `MainContent` has a `density` prop
- Severity: OPPORTUNITY
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/MainContent.tsx:9, 20`
- Evidence: `density?: 'standard' | 'compact'` only on MainContent. Form primitives, Card, Button do not honor it.
- Impact: Compact mode toggles only page padding; rows + controls remain comfy-sized — users can't pack data-dense screens.
- Fix sketch: Either (a) extend density into Input / Select / Card / Button via shared `useDensity()` context, or (b) drop the prop from MainContent and document density as a per-page concern. Pick one.
- Effort: M

#### BIC-MOT-A5-1: Motion primitives missing — 30+ ad-hoc `duration-*`/`ease-*` choices across components
- Severity: OPPORTUNITY
- Tag: [FOUNDATION]
- Files: `SiteHeader.tsx:106, 109`, `UndoSnackbar.tsx:38, 42, 47`, `Button.tsx:53`, `Modal.tsx:44, 57`, `AddEntryFAB.tsx:31, 40, 51` (and ~25 more)
- Evidence: Durations span 100ms / 150ms / 200ms / 300ms / 350ms with no defined scale. Easing functions vary unpredictably.
- Impact: Visual rhythm jitters. The "feels designed" tier requires a coherent motion system.
- Fix sketch: Define `--motion-fast` (150ms), `--motion-standard` (200ms), `--motion-slow` (300ms) + named easings in `globals.css`. Add Tailwind utilities (`transition-standard`, etc.). Migrate components.
- Effort: M

#### BIC-VIS-A5-4: `Card.title` is hardcoded to `<h3>`
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/Card.tsx:28`
- Evidence: Title always renders as `<h3>`; no `titleLevel` prop.
- Impact: Cards nested deeper in a page break heading hierarchy.
- Fix sketch: Add `titleLevel?: 'h2' | 'h3' | 'h4'` (default `'h3'`); render the matched element with the role's typography class.
- Effort: S

#### BIC-FRM-A5-2: Input adornment slots don't propagate disabled state
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/Input.tsx:6, 9-11, 59-77`
- Evidence: When `disabled`, the adornment slot doesn't visually reflect the disabled state.
- Impact: Disabled inputs with currency-symbol adornments look half-active.
- Fix sketch: Apply `opacity-60` to the adornment wrapper when `disabled` is true.
- Effort: S

#### BIC-FRM-A5-3: `lucide-react` is imported directly in features instead of via `IconRegistry`
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/SectionHeader.tsx:3` (and likely many more across features — needs a sweep)
- Evidence: SectionHeader directly imports `ChevronRight` from `lucide-react` instead of going through `SharedIcon` / `IconRegistry`.
- Impact: Future icon-stroke / icon-size standardization will require re-sweeping files.
- Fix sketch: Sweep the codebase: every `from 'lucide-react'` import becomes a registry usage; expand `IconConstants.ts` as needed.
- Effort: M

#### BIC-VIS-A5-5: LoadingSpinner uses `border-primary` instead of role-based token
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/LoadingSpinner.tsx:19`
- Evidence: Spinner ring colored via raw `--color-primary`.
- Impact: Loading affordance bound to the brand-primary, not a "loading" role token.
- Fix sketch: Define `--ui-action-bg` (or rename the existing token if appropriate); use it.
- Effort: S

#### BIC-LAY-A5-2: Entrance animations repeat ad-hoc across components — no `animate-entrance-*` utility
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `EmptyStateCard.tsx:38`, `UndoSnackbar.tsx:42`, `SystemAlert.tsx`
- Evidence: Variants of `animate-in fade-in zoom-in-95` / `slide-in-from-bottom-4` repeat without a shared utility.
- Impact: Future entrance-motion drift.
- Fix sketch: Add `.animate-entrance-fade` / `.animate-entrance-slide-up` utilities in `index.css @layer utilities`. Migrate components.
- Effort: S

#### BIC-FRM-A5-4: Button focus-ring offset is uniform across variants, including ghost/outline
- Severity: POLISH
- Tag: [FOUNDATION]
- Files: `frontend/src/shared/components/Button.tsx:54`
- Evidence: All variants apply `focus-visible:ring-offset-2`; transparent variants would benefit from `ring-offset-0` or `ring-offset-1`.
- Impact: Minor visual polish gap.
- Fix sketch: Variant-conditional offset.
- Effort: S

---

### Cross-cutting (consolidated from multiple agents)

The four BLOCKERs and the `[FOUNDATION]`-tagged QUALITY findings are by definition cross-cutting; they are listed under their originating agent above to preserve the audit trail.

**Themes that span 3+ surfaces** (already auto-promoted to `[FOUNDATION]`):

- **Token-vocabulary drift** (`BIC-VIS-A5-3`) — 4+ surfaces.
- **Surface-token undefined** (`BIC-VIS-A5-1`) — 3 surfaces.
- **Dark-mode hover contrast** (`BIC-VIS-A5-2`) — 8+ shell/header sites.
- **Motion primitives missing** (`BIC-MOT-A5-1`) — 30+ ad-hoc transitions.
- **Component-API drift** (`BIC-FRM-A5-1`) — 3 primitives.
- **Entrance-animation utilities** (`BIC-LAY-A5-2`) — 3+ sites.

**Themes confined to specific surfaces** (kept under originating agent):

- Settings header-landmark drift (`BIC-LAY-A4-1`) — 3 sub-pages of one feature.
- TransactionEntryForm partial-validation regression (`BIC-FRM-A2-1`) — 1 file.

---

## 8. Wave plan (post-walk)

> **Sequencing rule (recap from § 5):** Wave 1 ships independently; Φ1–Φ4 must ship before Waves 2–7; Ω1–Ω4 ship after Φ + per-surface waves are stable. Each wave below is a self-contained PR. A wave that grows past ~400 LOC delta during planning gets sub-split.

**Total:** 14 waves (1 surgical + 4 foundation + 6 per-surface + 3 opportunity + Ω4 deferred density audit).

---

### Wave 1 — Surgical BLOCKERs

- **Goal:** ship the two BLOCKERs that are surgical and don't depend on foundation work.
- **Findings:**
  - `BIC-VIS-A5-1` (BLOCKER, FOUNDATION) — define `--ui-surface-strong` (light + dark) in `globals.css`, expose via `@theme`, verify the 3 broken-rendering sites (UndoSnackbar:42, SelectionActionBar:33, TransactionDetailInfo:75).
  - `BIC-FRM-A4-1` (BLOCKER, [PAGE: Your Account]) — wrap `SessionsPage` Revoke button in the existing `DestructiveActionDialog` primitive.
- **Effort:** S
- **Sequencing:** ships independently, anytime.
- **Per-wave plan:** TBD via downstream `writing-plans` cycle.

---

### Wave Φ1 — Token vocabulary consolidation

- **Goal:** stop the token drift that's accumulated across 4+ surfaces; introduce ESLint guardrail; restore dark-mode hover legibility.
- **Findings:**
  - `BIC-VIS-A5-2` (BLOCKER) — replace `hover:bg-black/N` with `hover:bg-ui-surface-muted` (or canonical hover-state token) across 12 interactive sites in shell/header. Migrate modal scrim and decorative skeleton sites to theme-aware tokens.
  - `BIC-VIS-A5-3` (QUALITY) — fix the 4 forbidden-color sites (`text-amber-500` ×2, `text-blue-500`, `text-white` on dynamic bg). Rename `text-danger` → `text-ui-danger-text` at BudgetCard. Audit the 88 semantic-color hits and downgrade neutral text to `text-foreground`/`text-muted-foreground`/`text-subtle-foreground` where role is plain body. Add ESLint rule banning `text-(red|amber|blue|green|gray|white|black)-`.
  - `BIC-VIS-A1-1` (POLISH) — notification badge `bg-red-500` → `bg-ui-danger`.
  - `BIC-VIS-A5-5` (POLISH) — LoadingSpinner: define + use a role-based token (e.g., `border-ui-action`).
- **Effort:** L
- **Sequencing:** must ship before Waves 2–7.
- **Per-wave plan:** TBD. Likely sub-splittable: Φ1a (dark-mode hover migration + scrim) and Φ1b (forbidden-color sweep + ESLint + neutral-token audit) if PR exceeds ~400 LOC.

---

### Wave Φ2 — Component primitives & API

- **Goal:** consolidate primitive APIs; add the small set of missing variants surfaced by the audit.
- **Findings:**
  - `BIC-FRM-A5-1` (QUALITY) — rename `Card.tone` → `Card.variant`, `Badge.tone` → `Badge.variant` (keep `Badge.emphasis` if a distinct axis); update every call site. Document primitive prop naming rule in CODING_STANDARDS.
  - `BIC-VIS-A5-4` (POLISH) — add `Card.titleLevel?: 'h2' | 'h3' | 'h4'`.
  - `BIC-FRM-A5-2` (POLISH) — propagate `disabled` to Input adornment slots (`opacity-60`).
  - `BIC-FRM-A5-4` (POLISH) — variant-conditional focus-ring offset on Button (ghost/outline → `ring-offset-1`).
  - `BIC-LAY-A2-3` (OPPORTUNITY → promoted) — add `secondaryLg` Button variant; migrate the 3 detail-page sites from inline classnames.
  - **New primitive:** `<ChartSkeleton variant="pie|bar|line">` in `shared/components` (consumed by Wave 6's `BIC-MOT-A3-1`).
- **Effort:** M
- **Sequencing:** must ship before Waves 2–7.
- **Per-wave plan:** TBD.

---

### Wave Φ3 — Motion primitives & entrance utilities

- **Goal:** introduce a coherent motion system; replace ad-hoc duration/easing choices.
- **Findings:**
  - `BIC-MOT-A5-1` (OPPORTUNITY → promoted to Φ because it's foundational) — define `--motion-fast` (150ms), `--motion-standard` (200ms), `--motion-slow` (300ms) in `globals.css` plus named easings. Add Tailwind utilities (`transition-standard`, etc.). Migrate the ~30 ad-hoc sites.
  - `BIC-LAY-A5-2` (POLISH) — add `.animate-entrance-fade` and `.animate-entrance-slide-up` utilities; migrate EmptyStateCard / UndoSnackbar / SystemAlert.
- **Effort:** M
- **Sequencing:** must ship before Waves 2–7.
- **Per-wave plan:** TBD.

---

### Wave Φ4 — Iconography registry sweep

- **Goal:** centralize icon usage so future stroke-width / size standardization is one-stop.
- **Findings:**
  - `BIC-FRM-A5-3` (POLISH) — sweep `frontend/src/**/*.tsx` for direct `from 'lucide-react'` imports; route every one through `IconRegistry` / `SharedIcon`. Expand `IconConstants.ts` to cover the missing icons. Add ESLint rule banning direct `lucide-react` imports outside `IconRegistry.tsx`.
- **Effort:** M
- **Sequencing:** must ship before Waves 2–7. Independent of Φ1/Φ2/Φ3 — can ship in parallel with them.
- **Per-wave plan:** TBD.

---

### Wave 2 — Shell + Home

- **Goal:** clean up the surfaces a logged-in user sees first and most often.
- **Findings:**
  - `BIC-LAY-A1-1` (QUALITY) — unify sidebar / bottom-nav active-state affordance.
  - `BIC-DAT-A1-1` (QUALITY) — fix HomePage nested-interactive `role="button"` divs.
  - `BIC-COPY-A1-1` (QUALITY) — empty-state CTA-copy standardization (also affects onboarding; keep coordinated with Wave 3).
  - `BIC-VIS-A1-2` (POLISH) — HomePage balance amount semantic structure.
- **Effort:** M
- **Sequencing:** after Φ1–Φ4. Parallelizable with Wave 3 (different files).

---

### Wave 3 — Logged-out + Onboarding

- **Goal:** first-impression surfaces.
- **Findings:**
  - `BIC-FRM-A1-1` (POLISH) — onboarding step bottom-action button glyph rule (Check = final, ArrowRight = intermediate).
- **Effort:** S
- **Sequencing:** after Φ1–Φ4. Parallelizable with Wave 2.

---

### Wave 4 — Transactions cluster

- **Goal:** close transaction-side validation regression and a cluster of UX nits.
- **Findings:**
  - `BIC-FRM-A2-1` (QUALITY, partial U-FRM-1 regression) — TransactionEntryForm: move `category`/`paymentMethodId` selector validation from `onChange` to blur/submit.
  - `BIC-FRM-A2-2` (QUALITY) — filter-chip close buttons get `aria-label`.
  - `BIC-VIS-A2-1` (POLISH) — extract a `display-strong` typography role for MoneyFlowDisplay's `text-2xl` numbers.
  - `BIC-COPY-A2-2` (POLISH) — TransactionDetail delete-confirm copy references the existing undo affordance.
  - `BIC-FRM-A2-3` (POLISH) — drop dead `validateField('type', …)` from TransactionTypeToggle.
  - `BIC-DAT-A2-1` (OPPORTUNITY) — MoneyFlowDisplay zero-state visual distinction.
  - `BIC-FRM-A2-4` (OPPORTUNITY) — TransactionEntryForm balance hint uses shared `formatCurrency`.
- **Effort:** M
- **Sequencing:** after Φ1–Φ4. Parallelizable with Waves 5–7.

---

### Wave 5 — Budgets cluster

- **Goal:** budget-detail typography rhythm + landmark + microcopy alignment.
- **Findings:**
  - `BIC-LAY-A2-1` (QUALITY) — BudgetDetailPage h1 drop `tracking-wide`/`uppercase` mix.
  - `BIC-LAY-A2-2` (QUALITY) — wrap content body in `<main>` (or single `<section>`).
  - `BIC-COPY-A2-1` (QUALITY) — `"Edit Configuration"` → `"Edit Budget"`.
  - `BIC-DAT-A2-2` (OPPORTUNITY) — disclosure-button `aria-label` (also lives in Home; consolidated here since Home gets a same-shape fix).
- **Effort:** S
- **Sequencing:** after Φ1–Φ4. Parallelizable with Waves 4, 6, 7.

---

### Wave 6 — Insights cluster

- **Goal:** chart theming completeness + skeleton-shape primitive consumption.
- **Findings:**
  - `BIC-VIS-A3-1` (QUALITY) — SpendingTrends: add explicit `stroke` + `tick` props on `<CartesianGrid>` / axes per BalanceTrendChart pattern.
  - `BIC-MOT-A3-1` (POLISH) — replace four ad-hoc loading placeholders with `<ChartSkeleton variant="…">` from Φ2.
  - `BIC-DAT-A3-1` (POLISH) — `<Pie>` fallback `fill={getCategoricalColor(0)}`.
  - `BIC-FRM-A3-1` (POLISH) — render PeriodSelector's `label` prop visibly.
- **Effort:** M
- **Sequencing:** after Φ1–Φ4 (depends on Φ2 for `<ChartSkeleton>`).

---

### Wave 7 — Settings cluster (Categories, Payment Methods, Your Account, 404)

- **Goal:** sub-page landmarks, heading hierarchy, CTA verb rule, primitive adoption.
- **Findings:**
  - `BIC-LAY-A4-1` (QUALITY) — Profile/Appearance/Sessions sub-pages: `<div>` → `<header>`.
  - `BIC-LAY-A4-2` (QUALITY) — YourAccountPage section titles: `<h2>` → `<h3>` with responsive `md:text-xl`.
  - `BIC-COPY-A4-1` (QUALITY) — CTA verb rule (`"Create <X>"` for new, `"Save changes"` for edit) + sweep across categories / payment methods / budgets / transactions forms. Document in CODING_STANDARDS §1.7.2.
  - `BIC-FRM-A4-2` (QUALITY) — CategoryList empty state migrates to `EmptyStateCard` with primary action.
  - `BIC-VIS-A4-1` (POLISH) — AppearancePage theme selector adopts the shared `Radio` primitive.
- **Effort:** M
- **Sequencing:** after Φ1–Φ4. Parallelizable with Waves 4–6.

---

### Wave Ω1 — Motion / transitions opportunity

- **Goal:** raise perceived craft on signin + appearance switch.
- **Findings:**
  - `BIC-MOT-A1-1` (OPPORTUNITY) — staggered fade-in on signin header + OAuth button + redirecting-spinner state.
  - `BIC-MOT-A4-1` (OPPORTUNITY) — theme switch CSS transition on root color tokens.
- **Effort:** S
- **Sequencing:** after Φ3 (uses motion tokens) + Wave 7.

---

### Wave Ω2 — Micro-interactions

- **Goal:** press / haptic feedback on the high-interaction shell control.
- **Findings:**
  - `BIC-MOT-A1-2` (OPPORTUNITY) — AddEntryFAB: `active:brightness-110` + optional `useHapticFeedback` hook (graceful no-op on unsupported devices).
- **Effort:** S
- **Sequencing:** after Φ3.

---

### Wave Ω3 — Empty-state delight

- **Goal:** raise the 404 page from utility to brand voice.
- **Findings:**
  - `BIC-COPY-A4-2` (OPPORTUNITY) — 404 page: primary `Go back` (history), secondary `Home`. Optional brand illustration + popular-pages list.
- **Effort:** M
- **Sequencing:** after Wave 7.

---

### Wave Ω4 — Density modes (deferred)

- **Goal:** decide whether the design system supports density.
- **Findings:**
  - `BIC-LAY-A5-1` (OPPORTUNITY) — either extend density across Input / Select / Button / Card via a shared context, or remove from MainContent and document density as a per-page concern.
- **Effort:** M
- **Sequencing:** **deferred** until product/design says density modes are wanted. Listed for completeness.

---

### Sanity check

- **Finding-to-wave mapping:** every finding from § 7 appears in exactly one wave above (foundation findings appear in their auto-promoted Φ wave; cross-page findings like `BIC-DAT-A2-2` and `BIC-COPY-A1-1` are pinned to a single wave with the cross-feature scope noted in the wave's own per-wave plan).
- **Wave count:** 14 — within the predicted 9–14 range (bounded by the two BLOCKERs that warranted a dedicated Wave 1, four foundation sub-waves driven by token + components + motion + icons, six per-surface clusters, three OPPORTUNITY sub-waves, and the deferred Ω4).
- **Sequencing constraint** (`Wave 1 || (Φ → [Wave 2..7] → Ω)`) holds for the actual finding distribution.

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
