# UI/UX Consistency Audit — Kaizen

**Date:** 2026-04-26
**Scope:** Five-slice UI/UX consistency audit — visual & components, page shell & layout, forms/states/interactions, copy/a11y/routing, backend API UX. Frontend (React/TypeScript/Vite) and backend (Spring Boot) under `D:/kaizen`. Companion to `docs/superpowers/specs/2026-04-26-pre-prod-audit.md`.
**Design:** `docs/superpowers/specs/2026-04-26-uiux-consistency-audit-design.md`
**Branch:** `audit/uiux-consistency-phase1`

## Methodology

- Five parallel exploration agents covered: (1) visual & components, (2) page shell & layout, (3) forms/states/interactions, (4) copy/a11y/routing, (5) backend API UX.
- Sub-agents were briefed with the prior audit's UI-related finding IDs and instructed to reference, not re-discover.
- The orchestrator independently re-verified every BLOCKER claim (and every "mandatory-standard violation" claim) by reading the cited file:line.

## Verification status

The orchestrator independently re-read the cited file:line for each item below and adjusted the report accordingly:

- **U-VIS-2 (BLOCKER)** — VERIFIED. `SpendingTrends.tsx:57,63,75` carry `bg-indigo-600 text-white`, `bg-gray-100 text-gray-700`, and `fill="#6366f1"` exactly as cited.
- **U-VIS-3 (BLOCKER)** — VERIFIED, **citations corrected**. The agent cited `TransactionList.tsx:233,238,240,244`. Re-grep showed amber colors actually live at lines **169, 189, 208, 238**. The pattern is real; cited lines now reflect the truth.
- **U-FRM-1 (BLOCKER)** — VERIFIED. `TransactionEntryForm.tsx:412–479` calls `validateField(...)` inside every `onChange` handler. `CODING_STANDARDS.md` §1.7.2 #3 explicitly states *"Errors should not appear before the user has interacted with a field. Validation should trigger on blur or form submission."* Mandatory-standard violation confirmed.
- **U-FRM-2 / U-FRM-3 (originally BLOCKER) — DOWNGRADED to QUALITY and consolidated.** The agent claimed `text-ui` was an *invalid* token in `Checkbox.tsx:57` and `Radio.tsx:58`. Re-reading `frontend/src/styles/globals.css:73-76` and `frontend/src/shared/styles/index.css:27-30` shows `--ui-text` is defined as a CSS custom property and exposed to Tailwind v4 via `--color-ui` → so `text-ui` is a *working* class. The real finding is that two parallel neutral-text token vocabularies are in use: the canonical `text-foreground` / `text-muted-foreground` / `text-subtle-foreground` family named in CODING_STANDARDS §1.7.1, and a parallel `text-ui` / `text-ui-muted` / `text-ui-subtle` family used in 29 files. That is a documented-pattern drift, not a "broken color." Reframed as a single QUALITY finding (U-FRM-2) covering both Checkbox/Radio and the broader 29-file footprint.
- **U-LAY-7 (originally QUALITY) — UPGRADED to BLOCKER.** The agent flagged that `Card.tsx` does not declare a `title` prop while nine sites in `features/insights/components/*` pass `<Card title="…">`. Re-read of `Card.tsx:7-29` confirms `CardProps extends HTMLAttributes<HTMLDivElement>` adds only `tone` — no `title`. Re-grep across `frontend/src` finds 9 call sites in InsightsPage components passing `title=`. Because `Card` spreads `...props` onto a `<div>`, the `title` lands as the HTML `title` attribute (a hover tooltip), not a heading. Result: every section title in InsightsPage's three sub-components is silently invisible. That is a broken UX flow, not just a missed convention — promoted to BLOCKER.
- **U-API-1, U-API-2, U-API-3 (BLOCKER)** — VERIFIED. `PaymentMethodController.java:54` returns `ResponseEntity.ok(...)` for a POST create; `ReceiptAttachmentController.java:37` returns `ResponseEntity.ok(...)` for a POST upload; `SessionController.java:79` returns `ResponseEntity.ok().build()` for a successful DELETE.

Findings dropped during verification:

- **U-COPY-9** — dropped. The agent admitted "Without reading the form, I cannot cite a specific line. This is a lead, not a verified finding." Per the audit's quality bar (no citation = no finding), removed.
- **U-FRM-14** — dropped. The agent itself noted it was a duplicate of U-FRM-2/U-FRM-3.
- **U-COPY-1** — dropped. Pure duplicate of U-VIS-1 (and of B-FE-5). Cross-referenced.
- **U-COPY-2** — dropped. Restates `P-FE-6` exactly; the agent's BLOCKER framing is also incorrect because `alt=""` *is* valid for decorative images, and the avatar sits inside a labeled NavLink. Tracked under P-FE-6.
- **U-LAY-6** — dropped. Pure duplicate of U-VIS-1 (and of B-FE-5). Cross-referenced.
- **U-COPY-5** — dropped. Pure duplicate of U-LAY-1 (and of Q-FE-9). Cross-referenced.

The other ~40 findings were not exhaustively re-verified. Treat un-verified findings as high-confidence leads, not facts. Re-read the cited file:line before fixing.

## Severity rubric

- **BLOCKER** — mandatory-standard violation (CODING_STANDARDS / AGENTS.md), broken UX flow, accessibility violation that fails a known WCAG criterion, or backend contract that breaks frontend assumptions.
- **QUALITY** — visible inconsistency users would notice, duplicated/parallel implementations, drift from documented patterns.
- **POLISH** — micro-cleanups: copy capitalization, single off-token color in a low-traffic surface, spacing nits.

## Counts

- BLOCKERS: 7
- QUALITY: 33
- POLISH: 8
- **Total: 48**

(Net of dedup, severity adjustments, and three audit follow-ups recorded under "Follow-up checks needed" rather than as findings.)

---

# BLOCKERS

## Visual & components (U-VIS)

### U-VIS-1: InsightsPage and its three sub-components hardcode non-semantic colors and forbidden font weights
- Files: `frontend/src/features/insights/InsightsPage.tsx:42,43,49`, `frontend/src/features/insights/components/SpendingSummary.tsx:14,24,27`, `frontend/src/features/insights/components/CategoryBreakdown.tsx:12,19,29,52,73`, `frontend/src/features/insights/components/SpendingTrends.tsx:23,57,63,75`
- Evidence: `text-gray-900`, `text-gray-500`, `text-green-600`, `text-red-600`, `bg-red-50 border border-red-200 text-red-700`, `bg-indigo-600 text-white`, `bg-gray-100 text-gray-700`, hex literals (`#0088FE`, `#00C49F`, `#FFBB28`, `#FF8042`, `#8884d8`, `#82ca9d`, `#ffc658`, `#6366f1`, `fill="#8884d8"`, `fill="#6366f1"`), and `text-3xl font-bold` on the page h1.
- Impact: Mandatory-standard violation. CODING_STANDARDS §1.7.1 forbids `text-gray-*`, `text-red-*`, etc., and limits font weights to `font-normal` / `font-medium` / `font-semibold`. Dark-mode AAA contrast not guaranteed. Charts ignore theme entirely.
- Fix: Replace neutral grays with `text-foreground` / `text-muted-foreground` / `text-subtle-foreground`. Replace ad-hoc red/green with semantic `text-ui-success` / `text-ui-danger` (or whichever income/expense tokens are documented). Replace `bg-indigo-600 text-white` button styling with the `Button` primitive variants. Replace hardcoded hex chart colors with a theme-aware palette read from CSS variables. Replace `font-bold` with `font-semibold` and apply the canonical `h1` typography role.
- Effort: M
- Cross-ref: consolidates B-FE-5; consolidates U-LAY-6 and U-COPY-1 from this audit's raw output.

### U-VIS-2: TransactionList missing-category state hardcodes amber colors and forbidden `font-black`
- Files: `frontend/src/features/transactions/components/TransactionList.tsx:169, 189, 208, 238` (citations corrected during verification; agent originally cited 233/238/240/244)
- Evidence: line 169 row wrapper `border-amber-400 bg-amber-50/20 dark:bg-amber-950/5`; line 189 icon container `bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500`; line 208 icon `text-amber-700 dark:text-amber-500`; line 238 badge `text-amber-600/70 dark:text-amber-500/50 font-bold uppercase tracking-wide`. Line 248 amount uses `font-black tracking-tight`.
- Impact: Mandatory-standard violation. The amber set is a state semantic that should map to `text-ui-warning` / `bg-ui-warning-subtle` (or the codebase's documented warning token). `font-black` is forbidden by CODING_STANDARDS §1.7.1 (allowed weights are `font-normal`, `font-medium`, `font-semibold` only).
- Fix: Decide whether "missing category" is a warning or info semantic; pick the matching token family and apply consistently across the four amber sites. Replace `font-black` with `font-semibold` on line 248.
- Effort: S

## Page shell & layout (U-LAY)

### U-LAY-7: Card component silently drops `title` prop — InsightsPage section titles invisible (UPGRADED from QUALITY during verification)
- Files: `frontend/src/shared/components/Card.tsx:7-29` (definition), `frontend/src/features/insights/components/SpendingTrends.tsx:21, 31, 53`, `frontend/src/features/insights/components/SpendingSummary.tsx:23, 26, 29`, `frontend/src/features/insights/components/CategoryBreakdown.tsx:17, 27, 41`
- Evidence: `CardProps extends HTMLAttributes<HTMLDivElement>` adds only `tone`; no `title` prop is declared. Card spreads `...props` onto a plain `<div>`, so `<Card title="Spending Trends">` lands `title="Spending Trends"` as the HTML title attribute (a hover tooltip), not a rendered heading. Nine call sites in InsightsPage components pass `title=`; all nine titles are invisible to readers and to assistive tech.
- Impact: **Broken UX flow.** Every section title across SpendingTrends, SpendingSummary, and CategoryBreakdown is missing from render. Users see numeric values without their semantic context label. Screen readers do not announce the section.
- Fix: Add `title?: ReactNode` to `CardProps`, render `{title && <h3 className="…canonical h3 role…">{title}</h3>}` inside the card before `{children}`. Verify in light + dark themes.
- Effort: S
- Cross-ref: supersedes P-FE-1 (which only suggested verifying that Card's title rendered as `<h3>` — there is no title at all).

## Forms, states & interactions (U-FRM)

### U-FRM-1: TransactionEntryForm validates on every keystroke (mandatory-standard violation)
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:412-414, 428-430, 440-442, 461-463, 477-479`
- Evidence: every `onChange` handler calls `validateField(...)` synchronously: `onChange={(e) => { setAmount(e.target.value); validateField('amount', e.target.value) }}` and equivalents for category, payment method, date, description.
- Impact: Mandatory-standard violation. CODING_STANDARDS §1.7.2 #3 explicitly says *"Errors should not appear before the user has interacted with a field. Validation should trigger on blur or form submission."* The form fires error messages letter-by-letter as the user types, contradicting the standard and creating a jarring entry experience.
- Fix: Move `validateField(...)` calls from `onChange` to `onBlur`. Keep real-time *visual* affordances (e.g., insufficient-balance hint) on `onChange`, but they must be hints, not error messages. Audit other forms (`OnboardingBudgetStep`, `ManualBudgetSetupPage`, `PaymentMethodCreationForm`, `CategoryCreationForm`, `SigninPage`, `RegisterPage`) for the same anti-pattern.
- Effort: M
- Cross-ref: extends Q-FE-4 (inconsistent loading/error patterns).

## Backend API UX (U-API)

### U-API-1: POST creates return inconsistent status codes (200 vs 201)
- Files: `backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java:54`, `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java:37`, contrasted with `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java:77` (uses `@ResponseStatus(HttpStatus.CREATED)`)
- Evidence: PaymentMethodController and ReceiptAttachmentController return `ResponseEntity.ok(...)` from a POST that creates a new resource. BudgetController uses the correct `@ResponseStatus(HttpStatus.CREATED)`. Same action, different HTTP status.
- Impact: Frontend cannot rely on the status code to distinguish creation from idempotent fetch. Toast/redirect logic keyed on 201 will fail silently on payment-method or attachment creation. Breaks the API contract documented in CODING_STANDARDS §2.3 (REST conventions).
- Fix: Audit every `POST` controller method. If the method creates a new resource, return 201 — prefer `@ResponseStatus(HttpStatus.CREATED)` on the method, matching `BudgetController`. Idempotent fetch-style POSTs (rare) keep 200 with an explicit comment.
- Effort: S

### U-API-2: POST attachment upload returns 200 instead of 201
- Files: `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java:32-38`
- Evidence: `@PostMapping("/{transactionId}/attachments")` returns `ResponseEntity.ok(mapToResponse(attachment))`.
- Impact: Same as U-API-1 with a concrete site. Created attachment records return 200 instead of the conventional 201.
- Fix: Add `@ResponseStatus(HttpStatus.CREATED)` to the method, or wrap as `ResponseEntity.status(HttpStatus.CREATED).body(...)`.
- Effort: S
- Cross-ref: subset of U-API-1; listed separately because it ships in the attachment fix bundle.

### U-API-3: DELETE session returns 200 instead of 204
- Files: `backend/src/main/java/com/kaizen/backend/auth/controller/SessionController.java:79`
- Evidence: `revokeSession()` returns `ResponseEntity.ok().build()` on successful delete; line 49 of `ReceiptAttachmentController` (the canonical pattern) correctly uses `ResponseEntity.noContent().build()` for DELETE.
- Impact: Frontend can't reliably distinguish "deleted" from other 2xx responses; inconsistency with the canonical pattern in the same codebase.
- Fix: Replace with `ResponseEntity.noContent().build()` (or `@ResponseStatus(HttpStatus.NO_CONTENT)` on a `void` method).
- Effort: S

---

# QUALITY

## Visual & components (U-VIS)

### U-VIS-4: BudgetDetailPage uses arbitrary font weights and sizes throughout
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:33, 38, 60, 69, 73, 76, 86, 105, 108, 114, 118, 131, 144, 147, 152, 155, 166, 177, 190, 193, 223, 229`
- Evidence: representative — line 60 `text-3xl font-black tracking-tight` (page h1); line 69 `text-[10px] font-black uppercase tracking-[0.3em]`; line 73 `text-6xl font-black tracking-tighter` (large amount); line 76 `text-sm font-bold`; multiple `text-[9px]`/`text-[10px]` arbitrary sizes.
- Impact: Visible inconsistency. The approved typography roles (`h1`, `h2`, `display`, `body`, `label`, `caption`) are bypassed in favor of arbitrary `text-*xl` + `font-black` combos. CODING_STANDARDS §1.7.1 forbids `font-bold`, `font-black`, and arbitrary `text-[...]` values.
- Fix: Map each occurrence to the closest approved role. h1 → canonical h1 role; large amount → `display` role; metadata `text-[10px] uppercase` → `caption` role with default tracking; `font-black` → `font-semibold`; `font-bold` → `font-medium` or `font-semibold` per role.
- Effort: M
- Cross-ref: consolidates P-FE-2; concrete instance of U-VIS-5.

### U-VIS-5: `font-bold` / `font-black` and arbitrary text sizes scattered across 60+ sites
- Files: representative sample — `frontend/src/app/router/AuthenticatedLayout.tsx:179`, `frontend/src/features/budgets/BudgetsPage.tsx:60,64,83,152,167,185`, `frontend/src/features/transactions/components/TransactionDetailHeader.tsx:35,42`, `frontend/src/features/goals/GoalDetailPage.tsx:42`, and ~50 more sites identified by grep.
- Evidence: Codebase-wide pattern of `font-bold`, `font-black`, and arbitrary text sizes (`text-[10px]`, `text-[12px]`, `text-[9px]`) outside the approved role mapping.
- Impact: Visual inconsistency across pages. Hierarchy unclear when some pages use semantic roles and others use ad-hoc combos. Same root cause as U-VIS-4 but page-by-page.
- Fix: Mechanical pass per file: inventory each heading/label/amount, apply nearest approved role, replace `font-bold`/`font-black` with `font-semibold`. Add an ESLint rule to prevent regressions (e.g., `no-restricted-syntax` matching `font-bold`/`font-black` in className strings).
- Effort: L
- Cross-ref: consolidates P-FE-2.

### U-VIS-6: Recharts integrations hardcode hex colors, bypassing the theme
- Files: `frontend/src/features/insights/components/CategoryBreakdown.tsx:12, 52`, `frontend/src/features/insights/components/SpendingTrends.tsx:75`, plus likely cases in `frontend/src/shared/components/LineChart.tsx`, `frontend/src/shared/components/DailyLineChart.tsx`, `frontend/src/features/insights/components/BalanceTrendChart.tsx` (not yet sampled in audit)
- Evidence: `const COLORS = ['#0088FE', …]`, `fill="#8884d8"`, `fill="#6366f1"` — Recharts props receive literal hex strings.
- Impact: Charts do not respect light/dark theme; redesign of palette tokens leaves charts behind. Dark-mode contrast not verified.
- Fix: Extract a `useChartColors()` hook that reads CSS variables (or returns them via `getComputedStyle(document.documentElement).getPropertyValue('--…')`). Pass colors as props from there. Verify dark/light contrast.
- Effort: M

### U-VIS-7: InsightsPage h1 misses the canonical responsive page-header pattern
- Files: `frontend/src/features/insights/InsightsPage.tsx:40-46`, contrasted with `frontend/src/features/budgets/BudgetsPage.tsx:230` (canonical reference)
- Evidence: InsightsPage h1 is `text-3xl font-bold text-gray-900` (no `md:text-4xl`, no `font-semibold`, no `tracking-tight leading-tight`, no semantic color). BudgetsPage uses the documented `h1` role pattern.
- Impact: Page header sits at one size at all breakpoints; inconsistent with sibling pages; visually smaller on `md+` than peers.
- Fix: Replace with the `h1` role from CODING_STANDARDS: `text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground`. Wrap title + subtitle in `<header>` (see U-LAY-1).
- Effort: S
- Cross-ref: consolidates P-FE-5; subset of U-VIS-1.

### U-VIS-8: Arbitrary `tracking-[0.2em]` / `tracking-[0.3em]` in places where role tracking is mandated
- Files: representative — `frontend/src/features/budgets/BudgetDetailPage.tsx:69,105,114,144,152`, `frontend/src/features/insights/components/BalanceTrendChart.tsx:160,175`, plus other sites surfaced by grep.
- Evidence: Hardcoded `[0.2em]`/`[0.3em]` tracking values used on `text-[10px] uppercase` micro-labels.
- Impact: CODING_STANDARDS §1.7.1 allows `tracking-tight` on headings and `tracking-wide` for rare uppercase micro-labels; arbitrary fractional-em tracking is not in the approved set. Visual drift across similar micro-labels.
- Fix: Replace arbitrary tracking values with `tracking-wide` (where the standard's "rare uppercase micro-label" exception applies) or remove tracking entirely. Audit and document the rare cases that legitimately need custom tracking.
- Effort: S

## Page shell & layout (U-LAY)

### U-LAY-1: InsightsPage missing `<header>` landmark — page intro wrapped in plain `<div>`
- Files: `frontend/src/features/insights/InsightsPage.tsx:40-46`
- Evidence: line 40 `<div className="flex flex-col md:flex-row …">` wraps h1 + period selector. Sibling `BudgetsPage` uses `<header>`; the inconsistency was already flagged once in Q-FE-9.
- Impact: Screen-reader landmark navigation skips the page intro. Inconsistent with peer pages.
- Fix: Replace the wrapping `<div>` with `<header>`; verify the rest of the page still uses `<section>` for grouped content.
- Effort: S
- Cross-ref: consolidates Q-FE-9 and the dropped U-COPY-5.

### U-LAY-2: HomePage has no page-level `<header>` — sections start without an intro landmark
- Files: `frontend/src/features/home/HomePage.tsx:352-370`
- Evidence: top-level JSX is `<> <div className="space-y-7 pb-32">` followed by sections; no `<header>` containing a page title.
- Impact: No landmark navigation entry point; users on assistive tech land directly in the first stat without context.
- Fix: Add a `<header>` with the page title (e.g., "Dashboard" or "Home") and an optional one-line description, placed before the first section.
- Effort: S

### U-LAY-3: BudgetDetailPage and TransactionDetailPage wrap their hero in `<div>` instead of `<header>`
- Files: `frontend/src/features/budgets/BudgetDetailPage.tsx:54-89`, `frontend/src/features/transactions/TransactionDetailPage.tsx:72-89`
- Evidence: detail-page hero (amount, title, metadata) is rendered inside a plain `<div>`; list pages with the same role use `<header>`.
- Impact: Inconsistency between list and detail pages; landmark structure breaks at the detail level.
- Fix: Replace the hero `<div>` with `<header>` on both pages. Confirm semantic level of inner h1 stays correct.
- Effort: S

### U-LAY-4: YourAccountPage renders the entire page as `<div>` with no `<header>` or `<section>`
- Files: `frontend/src/features/your-account/YourAccountPage.tsx:421-462`
- Evidence: page wrapper is `<div>`; account sections are stacked `<div>`s; no `<header>`, no `<section>`.
- Impact: No landmarks at all; screen readers cannot identify or jump between groupings.
- Fix: Wrap page in structure: `<header><h1>Your Account</h1></header>` + a `<section>` per `accountSections` group with its own `<h2>` heading.
- Effort: M

### U-LAY-5: BalanceHistoryPage has `<header>` but no `<section>` wrappers around content
- Files: `frontend/src/features/transactions/BalanceHistoryPage.tsx`
- Evidence: grep finds 1 `<header>` and 0 `<section>` in the file; canonical pattern is `<header>` + N × `<section>`.
- Impact: Content groupings are implicit; structure inconsistent with peer pages.
- Fix: Wrap each grouped block in `<section>` with an inner `<h2>` heading.
- Effort: S

## Forms, states & interactions (U-FRM)

### U-FRM-2: Two parallel neutral-text token vocabularies — `text-foreground` family vs `text-ui` family — used across 29 files (CONSOLIDATED, DOWNGRADED to QUALITY)
- Files: `frontend/src/shared/components/Checkbox.tsx:57`, `frontend/src/shared/components/Radio.tsx:58`, plus 27 more files surfaced by grep — including `Button.tsx`, `Badge.tsx`, `PhoneInput.tsx`, `AddEntryFAB.tsx`, plus features `budgets/`, `home/`, `transactions/`, `your-account/`, `payment-methods/`, `goals/`, `categories/`, `signin/`, `not-found/`, `playground/`.
- Evidence: `text-ui` resolves through `frontend/src/styles/globals.css:73-76` (`--ui-text: var(--color-text-primary)`) and `frontend/src/shared/styles/index.css:27-30` (`--color-ui: var(--ui-text)`) so it functions correctly. CODING_STANDARDS §1.7.1 names *only* `text-foreground` / `text-muted-foreground` / `text-subtle-foreground` (and `text-on-*` for filled surfaces) as the canonical token set.
- Impact: Two synonyms for the same neutral text tokens are in active use. Future contributors are guided by the standard to use `text-foreground` while existing code uses `text-ui`. Drift compounds with every PR.
- Fix: Pick the canonical vocabulary (the standard names `text-foreground` family) and migrate the other one. If `text-ui` is the practical winner, update CODING_STANDARDS to formalise it. Either way, ship a single migration PR plus an ESLint rule rejecting the deprecated set.
- Effort: M

### U-FRM-4: Inconsistent empty-state patterns across list pages
- Files: `frontend/src/features/payment-methods/PaymentMethodList.tsx:32-37`, `frontend/src/features/transactions/components/TransactionEmptyState.tsx`, `frontend/src/features/budgets/BudgetsPage.tsx` (large "PHP" watermark pattern)
- Evidence: PaymentMethodList renders centered text only. TransactionEmptyState is a card with icon + title + description + actions. BudgetsPage uses a large watermark. Three different treatments for the same UX role.
- Impact: Q-FE-4 (inconsistent loading/error patterns) extended. Users see different empty-state layouts depending on the page; the experience is uneven.
- Fix: Codify a single `<EmptyStateCard>` (or adopt `TransactionEmptyState` as the reference) and migrate the rest. Document the pattern.
- Effort: M
- Cross-ref: extends Q-FE-4.

### U-FRM-5: Loading states mix spinner / skeleton / render-on-cache without a documented rule
- Files: `frontend/src/features/budgets/BudgetsPage.tsx:220-225` (spinner), `frontend/src/features/payment-methods/PaymentMethodList.tsx:22-29` (skeleton), `frontend/src/features/transactions/components/TransactionEntryForm.tsx:384-389` (spinner), `frontend/src/features/onboarding/OnboardingBudgetStep.tsx:486-500` (skeleton)
- Evidence: list pages alternate between spinner and skeleton; same-page subcomponents within a single feature use different patterns.
- Impact: Q-FE-4 extended. Predictability suffers.
- Fix: Codify per context — skeleton for list/grid items, spinner for full-page boot, and inline spinner for in-form actions. Update all sites; document the rule.
- Effort: M
- Cross-ref: extends Q-FE-4.

### U-FRM-6: No standard for surfacing server-side validation errors back to fields
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:367-380`, `frontend/src/features/onboarding/OnboardingBudgetStep.tsx:432-435`, `frontend/src/features/budgets/ManualBudgetSetupPage.tsx:417`, `frontend/src/features/payment-methods/PaymentMethodCreationForm.tsx:46`, `frontend/src/features/payment-methods/PaymentMethodList.tsx:96`
- Evidence: TransactionEntryForm parses `error.data?.errors` and routes to fields. OnboardingBudgetStep stores a single `backendMessage`. ManualBudgetSetupPage and PaymentMethodCreationForm define a one-off `RTKQueryError` cast (Q-FE-2) and surface a single string.
- Impact: Field-level constraint errors (duplicate name, etc.) appear as form-level toasts in some flows and inline messages in others. Combined with U-API-8 / Q-FE-5 on the backend, the contract is undocumented.
- Fix: Pair with U-API-8 — backend ships `{ code, message, errors: [{ field, message, code }], traceId }`. Frontend extracts via a single helper (`getErrorMessage` + `getFieldErrors`) routed to inputs. Migrate all forms.
- Effort: M
- Cross-ref: extends Q-FE-5; pairs with U-API-8.

### U-FRM-7: Modal focus management is implicit and unverified
- Files: `frontend/src/shared/components/Modal.tsx`, `frontend/src/shared/components/ResponsiveModal.tsx`
- Evidence: both use Headless UI `Dialog`, which handles initial focus, but neither component declares `initialFocus` or documents its behavior. No focus-restoration tests exist.
- Impact: Focus may land on the close button (or worse, on a non-interactive element) when modals open. WCAG-relevant.
- Fix: Document the focus contract. Add an `initialFocus` ref prop on both modals and wire it to the first form input where forms exist. Sample-test 2–3 modals (open → focus inside → close → focus returns to trigger).
- Effort: M

### U-FRM-8: Destructive-action confirmation modals diverge in layout
- Files: `frontend/src/shared/components/LogoutConfirmationModal.tsx`, `frontend/src/features/transactions/components/ConfirmBulkDeleteDialog.tsx`, `frontend/src/features/payment-methods/PaymentMethodList.tsx:80-137`
- Evidence: logout has Cancel/Confirm in the footer; bulk-delete adds an inline warning box; payment-method delete uses a conditional warning. Three layouts for the same action class.
- Impact: Inconsistent muscle memory, inconsistent button placement, inconsistent emphasis on the destructive action.
- Fix: Define a `<DestructiveActionDialog>` template (title, body, optional warning slot, Cancel + destructive footer with the destructive button on the right). Migrate all destructive flows to it.
- Effort: M

### U-FRM-9: UndoSnackbar exists but is wired only to transaction deletes
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx`, `frontend/src/features/payment-methods/PaymentMethodList.tsx:91-98` (silent delete), category and budget delete flows.
- Evidence: `UndoSnackbar` is mounted in `AuthenticatedLayout` and fires only after transaction deletion. Payment method deletes confirm and then commit silently. No undo for category or budget deletion either.
- Impact: Recovery affordance is inconsistent; the same destructive action class behaves differently depending on the feature. Users learn to expect undo and lose data when they hit a feature that omits it.
- Fix: Inventory all destructive actions; either extend undo to each (preferred), or explicitly decide per-feature that no-undo is correct and document it. Add a `useSoftDelete()` hook that wraps the delete + UndoSnackbar pattern.
- Effort: M

### U-FRM-10: No visible required-field marker on shared form components
- Files: `frontend/src/shared/components/Input.tsx`, `frontend/src/shared/components/TextArea.tsx`, `frontend/src/shared/components/Select.tsx`, `frontend/src/shared/components/PhoneInput.tsx`, `frontend/src/shared/components/Checkbox.tsx`
- Evidence: components accept the HTML `required` attribute but do not render a visual indicator on the label.
- Impact: CODING_STANDARDS §1.7.2 #4 says "Required fields: Use `*` or `(required)` consistently." Currently the visual indicator is missing across all forms; users can't distinguish required from optional without trial-and-error submission.
- Fix: Update each shared component so the label renders a `*` (or "(required)") when `required` is true. Pick one convention and apply consistently. Update Checkbox/Radio similarly when applicable.
- Effort: M

### U-FRM-11: Modal-based form does not document its close-on-success contract
- Files: `frontend/src/features/onboarding/OnboardingBudgetStep.tsx:382-383`
- Evidence: success path calls `closeModal()`; the pattern works but is not formalised in a wrapper component.
- Impact: Minor; future modal forms may forget to close on success.
- Fix: Either document the pattern in a comment near the shared modal components, or extract a `<FormModal>` wrapper that auto-closes on success callback resolution.
- Effort: S

## Copy, terminology, a11y, routing (U-COPY)

### U-COPY-3: Mixed verbs for the same action — "Remove" (budgets) vs "Delete" (everywhere else)
- Files: `frontend/src/features/budgets/components/BudgetCard.tsx:62` (aria-label "Remove budget"), `frontend/src/features/categories/MergeCategoriesModal.tsx:65` ("Delete"), `frontend/src/features/transactions/components/ConfirmBulkDeleteDialog.tsx:14` ("Delete Transactions?"), `frontend/src/features/payment-methods/PaymentMethodList.tsx:93` ("Delete {pm.name}?")
- Evidence: budgets feature uses "Remove" (aria-label, function names); other features use "Delete" for the equivalent action.
- Impact: Reduced predictability of CTAs; accessibility tooling inconsistent across features.
- Fix: Standardise on one verb. Recommend "Delete" (3 features already use it). Update the budgets feature's aria-labels, button text, and function names accordingly.
- Effort: S

### U-COPY-4: "Save changes" vs "Create category" inconsistency in form CTAs
- Files: `frontend/src/features/categories/CategoryCreationForm.tsx:179, 188`, plus other forms (`TransactionEntryForm`, `ManualBudgetSetupPage`, `OnboardingBudgetStep`, `PaymentMethodCreationForm`).
- Evidence: CategoryCreationForm uses "Save changes" (edit) and "Create category" (create). Other forms use "Save" universally or task-specific labels.
- Impact: Microcopy drift; users learn different CTAs across features for the same action class.
- Fix: Pick one pattern. Recommend the create/edit-aware pattern ("Create X" / "Save changes") and apply across all forms; document in CODING_STANDARDS.
- Effort: M

### U-COPY-6: Budget routes are singular (`/budget`) while everything else is plural
- Files: `frontend/src/app/router/router.tsx:257, 267, 277` (`budget`, `budget/:id`, `budget/add`)
- Evidence: budget routes are singular; transactions, insights, categories, payment-methods, balance-summary all use plural.
- Impact: User-visible URL drift; bookmarks fragile; mental model splits.
- Fix: Rename to `/budgets`, `/budgets/:id`, `/budgets/add`. Add 301 redirects from the old singular routes (until users have migrated). Update all internal NavLink / `<Link to>` references in the frontend.
- Effort: M
- Cross-ref: extends Q-FE-7.

### U-COPY-7: Notification icon SVG inside labeled button isn't `aria-hidden`
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx:272-277`
- Evidence: `<button aria-label="Notifications">` correctly labels the button, but the SVG inside is not `aria-hidden="true"`. Some screen readers double-announce.
- Impact: Minor accessibility nit; redundant announcement.
- Fix: Add `aria-hidden="true"` to the inner SVG (or pass `aria-hidden` via the icon component's prop API).
- Effort: S
- Cross-ref: consolidates P-FE-7.

### U-COPY-8: Detail-page back-button labels default to generic "Back" instead of naming the destination
- Files: `frontend/src/app/router/router.tsx` (backButton handle metadata across multiple routes), `frontend/src/app/router/AuthenticatedLayout.tsx:112-117` (handleBack)
- Evidence: most detail routes set `backButton.label = "Back"`; a few set destination-specific labels ("Account", "Logout"). The fallback `navigate(-1)` makes the label the only signal of the destination.
- Impact: Screen-reader users hear "Back" with no destination cue; sighted users get no preview of where the back button leads.
- Fix: Replace generic "Back" with destination-specific labels (e.g., "Transactions", "Budgets", "Categories"). Audit all `backButton` configs.
- Effort: M

## Backend API UX (U-API)

### U-API-4: Receipt attachment endpoints lack `@AuthenticationPrincipal` at the controller boundary
- Files: `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java:32-38, 40-44, 46-50, 52-58`
- Evidence: none of the four endpoints take `@AuthenticationPrincipal UserDetails`; the service is expected to enforce ownership downstream.
- Impact: Defense-in-depth missed at the controller layer. If the service check ever weakens, the endpoint becomes the IDOR primitive in B-SEC-1.
- Fix: Add `@AuthenticationPrincipal UserDetails userDetails` and pass `userDetails.getUsername()` into each service call. Verify the service rechecks. (This overlaps B-SEC-1's primary fix but the controller-layer parameter is also a UX/contract concern: clients reading the OpenAPI spec see the auth requirement explicitly.)
- Effort: S
- Cross-ref: pairs with B-SEC-1.

### U-API-5: Boolean field naming convention not codified — `isGlobal`, `isRecurring` style works today, document it
- Files: `backend/src/main/java/com/kaizen/backend/category/dto/CategoryResponse.java:8` (`isGlobal`), `backend/src/main/java/com/kaizen/backend/payment/dto/PaymentMethodResponse.java:6` (`isGlobal`), `backend/src/main/java/com/kaizen/backend/transaction/dto/TransactionResponse.java:23` (`isRecurring`)
- Evidence: existing usage is consistent (`is*`), but no documented rule prevents `active` / `enabled` / `withReceipt` / `hasReceipt` from creeping in next.
- Impact: Future drift risk; preventive finding.
- Fix: Add a one-line rule to `backend/docs/API_DOCUMENTATION_STANDARDS.md`: "Boolean fields use `is*` prefix in DTOs; `has*`, `with*`, `*Active`, `*Enabled` are not used."
- Effort: S

### U-API-6: TransactionResponse omits `createdAt`/`updatedAt` while peers expose them
- Files: `backend/src/main/java/com/kaizen/backend/budget/dto/BudgetResponse.java:20-21` (has timestamps), `backend/src/main/java/com/kaizen/backend/transaction/dto/TransactionResponse.java` (does not), `backend/src/main/java/com/kaizen/backend/auth/dto/SessionDTO.java` (has `createdAt`)
- Evidence: BudgetResponse and SessionDTO expose `createdAt` (`Instant`); TransactionResponse exposes `transactionDate` (the user-supplied date) but not the audit `createdAt`/`updatedAt`.
- Impact: Frontend cannot sort or display "when was this entered" reliably; clients have no audit trail without a separate call.
- Fix: Decide intent — if transactions should be auditable, add `createdAt` and `updatedAt` to `TransactionResponse` and persist on entity. If intentional, document the omission in the OpenAPI schema.
- Effort: M

### U-API-7: POST response wrapping is mixed — `@ResponseStatus` (Budget/Transaction) vs `ResponseEntity.ok()` (Payment/others)
- Files: `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java:77-90`, `backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java:50-54`, plus other controllers.
- Evidence: BudgetController and TransactionController use `@ResponseStatus(HttpStatus.CREATED)` + direct return; PaymentMethodController and others use `ResponseEntity.ok()`.
- Impact: Maintenance tax; silent status-code bugs (see U-API-1, U-API-2). Reviewers must remember which pattern wins where.
- Fix: Standardise on `@ResponseStatus(HttpStatus.CREATED)` for create endpoints. Update Payment/Receipt/etc. to match.
- Effort: M
- Cross-ref: pairs with U-API-1.

### U-API-8: Validation envelope shape is well-formed but not documented in CODING_STANDARDS or OpenAPI schemas
- Files: `backend/src/main/java/com/kaizen/backend/common/dto/ValidationErrorResponse.java:8-12`, `backend/src/main/java/com/kaizen/backend/common/exception/GlobalExceptionHandler.java:57-61`
- Evidence: `ValidationErrorResponse` is a record with `{code, message, errors, traceId}` (where `errors: List<ValidationError>`); `ErrorResponse` has `{code, message, details, traceId}`. CODING_STANDARDS §2.3 names only `{code, message, details, traceId}`.
- Impact: Frontend writes brittle code against an undocumented contract (Q-FE-5); future contributors don't know which envelope to expect.
- Fix: Update CODING_STANDARDS §2.3 to document both envelopes explicitly. Ensure OpenAPI/Swagger references both schemas. Pair with U-FRM-6 to make the frontend consume `errors[]` field-level.
- Effort: S
- Cross-ref: extends Q-FE-5; pairs with U-FRM-6.

### U-API-9: List endpoint with cursor pagination returns no pagination metadata
- Files: `backend/src/main/java/com/kaizen/backend/transaction/controller/TransactionController.java:56-73`
- Evidence: endpoint accepts `pageSize`, `lastDate`, `lastId` and returns `List<TransactionResponse>`. No `hasMore` / `nextCursor` returned.
- Impact: Frontend has to issue an extra request (or apply heuristics like `items.length < pageSize`) to detect end-of-list.
- Fix: Wrap in `PaginatedResponse<T> { items, hasMore, nextCursor? }`. Apply the wrapper to every paginated endpoint going forward.
- Effort: M

### U-API-10: No central registry of error codes — frontend hardcodes magic strings without a canonical list
- Files: scattered across `…/common/exception/GlobalExceptionHandler.java`, controllers, services.
- Evidence: codes like `VALIDATION_FAILURE`, `AUTH_FAILURE`, `ACCESS_DENIED`, `REQUIRED`, `AMOUNT_POSITIVE`, `FUTURE_DATE_REJECT` exist with no central registry.
- Impact: Frontend `if (error.code === 'REQUIRED')` patterns drift; backend can rename a code without notifying the frontend.
- Fix: Create `backend/docs/ERROR_CODES.md` with a table of `code | HTTP status | meaning | example payload`. Optionally generate a TypeScript enum from it for the frontend. Lock new code introductions to a PR-level checklist.
- Effort: M

### U-API-11: BudgetResponse serialises `null` for absent values rather than omitting keys
- Files: `backend/src/main/java/com/kaizen/backend/budget/dto/BudgetResponse.java:14-18`, `backend/src/main/java/com/kaizen/backend/budget/controller/BudgetController.java:226-242`
- Evidence: `burnRate`, `dailyAllowance`, `projectedTotal`, `daysElapsed`, `daysLeft` are set to `null` in non-projection paths; no `@JsonInclude(JsonInclude.Include.NON_NULL)` on the DTO so nulls are serialised.
- Impact: Frontend types must read every field as `T | null`, even though it only matters for the projection variant. Wire payload bloated with null keys.
- Fix: Add `@JsonInclude(JsonInclude.Include.NON_NULL)` at class level (preferred) — or split the DTO into base + projection variants. Document the serialisation policy in CODING_STANDARDS.
- Effort: S

### U-API-12: Status semantics for delete-or-not-found inconsistent across controllers
- Files: `backend/src/main/java/com/kaizen/backend/auth/controller/SessionController.java:79, 83`, `backend/src/main/java/com/kaizen/backend/user/controller/OnboardingProgressController.java:68`
- Evidence: SessionController returns 200 OK for successful delete and 404 for not-found; OnboardingProgressController returns 204 No Content when progress is absent (which is a successful read with no body, not a delete).
- Impact: Mixed semantics: 200 / 204 / 404 used inconsistently for "absence" vs "deleted." Frontend can't generically handle these without per-endpoint logic.
- Fix: Establish convention — DELETE success = 204; DELETE not-found = 404; GET absence = 204 only when the API contract says "absence is normal," otherwise 404. Document in CODING_STANDARDS §2.3 and audit existing endpoints.
- Effort: S
- Cross-ref: pairs with U-API-3.

---

# POLISH

## Visual & components (U-VIS)

### U-VIS-10: Arbitrary `text-[10px]` / `text-[12px]` / `text-[9px]` should map to `caption` or `body-sm`
- Files: 50+ locations (representative — `BudgetDetailPage`, `TransactionDetailHeader`, `TransactionFilter`)
- Evidence: e.g., `text-[10px] font-bold uppercase` for metadata labels; the approved `caption` role is `text-xs leading-5 text-muted-foreground`.
- Impact: Mostly cosmetic; arbitrary sizes are slightly off the role's `text-xs` (12px). Maintenance harder.
- Fix: Replace `text-[10px]`/`[12px]` with `caption` / `body-sm` roles where the intent matches. Audit uppercase-style micro-labels and apply `caption` + `tracking-wide` per the rare-uppercase exception.
- Effort: S
- Cross-ref: subset of U-VIS-5.

## Page shell & layout (U-LAY)

### U-LAY-8: InsightsPage hardcodes `p-6 max-w-7xl mx-auto` instead of using `pageLayout`
- Files: `frontend/src/features/insights/InsightsPage.tsx:39`
- Evidence: top-level `<div className="p-6 max-w-7xl mx-auto">` is a one-off; peer pages import `pageLayout` from `shared/styles/layout` and apply its tokens (e.g., `BudgetsPage.tsx:229` uses `className={pageLayout.sectionGap}`).
- Impact: Drift in layout primitives; future updates to `pageLayout` will miss InsightsPage.
- Fix: Import `pageLayout` and replace the hardcoded utilities with the appropriate variant.
- Effort: S

### U-LAY-9: AuthenticatedLayout closes without a `<footer>` landmark
- Files: `frontend/src/app/router/AuthenticatedLayout.tsx`
- Evidence: layout uses `<main>` (line 314) but no closing `<footer>` element. If the SPA has any global footer content (legal links, version, etc.), it lacks a landmark.
- Impact: Minor; only relevant if footer content exists. SPA shells often skip footers; document the choice either way.
- Fix: Either add a `<footer>` with global content (legal, version), or add a code comment explaining the deliberate absence.
- Effort: S
- Note: renumbered from agent's U-COPY-12 to land in the layout slice where it belongs.

## Forms, states & interactions (U-FRM)

### U-FRM-12: TransactionEntryForm balance hint encodes color in inline ternary
- Files: `frontend/src/features/transactions/components/TransactionEntryForm.tsx:449-453`
- Evidence: `className={`text-xs font-bold ${insufficientBalance ? 'text-error' : 'text-primary'}`}`
- Impact: Micro-readability; the semantic intent ("warn vs neutral") is buried in a className expression.
- Fix: Extract `const balanceTone = insufficientBalance ? 'text-error' : 'text-primary'` above the JSX. Replace `font-bold` with `font-semibold` per CODING_STANDARDS.
- Effort: S

### U-FRM-13: PaymentMethodList empty state lacks a primary action
- Files: `frontend/src/features/payment-methods/PaymentMethodManagementPage.tsx`, `frontend/src/features/payment-methods/PaymentMethodList.tsx:32-37`
- Evidence: empty state renders only "No payment methods found." with no CTA. Peer empty states (TransactionEmptyState) include action buttons.
- Impact: Users must scroll/infer to add a payment method.
- Fix: Add a primary "Add Payment Method" button (or a focus-the-form action) inside the empty-state card.
- Effort: S
- Cross-ref: pairs with U-FRM-4.

## Copy, terminology, a11y, routing (U-COPY)

### U-COPY-10: BalanceTrendChart and similar use `<h3>` for what is visually a metadata overline
- Files: `frontend/src/features/insights/components/BalanceTrendChart.tsx:23` (and similar in other Insights components)
- Evidence: micro-label "Income vs Expenses Analysis" rendered as `<h3>` with `tracking-widest uppercase` styling.
- Impact: Heading hierarchy is broken (h3 used for what is content overline, not a section heading).
- Fix: Replace `<h3>` with `<p>` styled as the `caption` role (`text-xs leading-5 text-muted-foreground`) plus `tracking-wide` for the rare uppercase exception. Reserve `<h3>` for actual subsection headings.
- Effort: S

### U-COPY-11: PeriodSelector dropdown lacks a visible or `aria-label`
- Files: `frontend/src/features/insights/components/PeriodSelector.tsx`
- Evidence: usage `<PeriodSelector value={period} onChange={updatePeriod} />` — verify the component has either a visible `<label htmlFor>` or an `aria-label`. Per P-FE-8 it does not today.
- Impact: Screen readers announce a dropdown with no role-context.
- Fix: Add a visible `<label htmlFor>` (preferred) or an `aria-label="Analysis period"` if the design needs no visible label.
- Effort: S
- Cross-ref: consolidates P-FE-8.

## Backend API UX (U-API)

### U-API-13: Receipt attachment and payment-method controllers lack `@ApiResponses` Swagger annotations
- Files: `backend/src/main/java/com/kaizen/backend/transaction/controller/ReceiptAttachmentController.java`, `backend/src/main/java/com/kaizen/backend/payment/controller/PaymentMethodController.java`
- Evidence: BudgetController and CategoryController carry `@Operation` + `@ApiResponses`; the two flagged controllers carry only minimal Swagger metadata.
- Impact: Swagger UI does not show 400/401/404/409 response shapes; OpenAPI consumers can't generate accurate clients.
- Fix: Add `@ApiResponses` to each endpoint with the canonical `ErrorResponse` / `ValidationErrorResponse` schemas referenced.
- Effort: S
- Cross-ref: pairs with U-API-8.

---

# Follow-up checks needed (not yet findings)

These items surfaced during the audit but lack the citation evidence required to file as findings. They should be checked before Wave U-2 closes; each may resolve into one or more concrete findings or into "no issue."

- **Shared primitives not deeply sampled.** `frontend/src/shared/components/SystemAlert.tsx`, `LineChart.tsx`, `DailyLineChart.tsx`, and `SiteHeader.tsx` were not opened by the visual & components agent. Shared primitives amplify token issues, so each should be re-read against the U-VIS-4/U-VIS-5 checklist (forbidden weights, arbitrary text sizes, off-token colors). Time-box: 30 min.
- **Backend POST audit beyond payment + attachment.** U-API-1 verified two non-conformant POST sites; the remaining ~10 controllers were not status-code-audited. Walk every `@PostMapping` to confirm 201 vs 200 semantics. Time-box: 30 min.
- **Backend PaymentMethodService audit.** Already flagged in the prior audit as Q-BE-9 (probably mirrors known issues); add this to the PaymentMethodService review when Wave U-2e runs.
- **Boolean-field naming inventory across all DTOs.** U-API-5 sampled three DTOs and found consistent `is*` naming. The remaining DTOs were not exhaustively checked; do a one-pass grep before codifying the rule in `API_DOCUMENTATION_STANDARDS.md`.

# Cross-references with the pre-prod audit

| Prior ID | Disposition | New ID(s) | Notes |
|----------|-------------|-----------|-------|
| B-FE-1 | resolved | — | Frontend build break fixed in PR #29. |
| B-FE-2 | resolved | — | Vite CVEs patched in PR #29. |
| B-FE-3 | referenced | — | 401 auto-logout — data-layer concern, out of UI/UX consistency slice. |
| B-FE-4 | referenced | — | Dexie cache clearing — data-layer concern. |
| B-FE-5 | consolidated-into | U-VIS-1 (also U-VIS-7) | InsightsPage hardcoded tokens still un-fixed; broader scope now captured. The agent's separate SpendingSummary subset (raw U-VIS-3) was folded into U-VIS-1 to avoid double-listing. |
| Q-FE-1 | referenced | — | Mixed RTK Query + manual fetch; data-layer architecture, not UX consistency. |
| Q-FE-2 | referenced | — | Duplicated RTK error-cast; resolved by U-FRM-6 / U-API-8 indirectly. |
| Q-FE-3 | referenced | — | Sentry init scope; observability. |
| Q-FE-4 | extends | U-FRM-4, U-FRM-5 | Empty/loading/error patterns inventoried. |
| Q-FE-5 | extends | U-FRM-6, U-API-8 | Server validation envelope inventoried; documentation gap surfaced. |
| Q-FE-6 | referenced | — | Same root as Q-FE-1. |
| Q-FE-7 | extends | U-COPY-6 | `/budget` vs plural — full remediation scope (rename + redirects + link audit). |
| Q-FE-8 | referenced | — | Store config; not UX. |
| Q-FE-9 | consolidated-into | U-LAY-1 | InsightsPage missing `<header>` confirmed. |
| Q-FE-10 | referenced | — | Dead code; addressed by Phase 2 standards work indirectly. |
| Q-FE-11 | referenced | — | Dependency hygiene. |
| Q-CC-1 | referenced | — | CSRF; security. |
| Q-CC-9 | referenced | — | Swagger config; security. |
| P-FE-1 | superseded-by | U-LAY-7 | Card title — finding sharpened: there is no `title` prop, not just an unverified semantic level. |
| P-FE-2 | consolidated-into | U-VIS-4, U-VIS-5 | Arbitrary typography pattern is codebase-wide, not isolated to TransactionEntryForm. |
| P-FE-3 | referenced | — | `<div role="button">` — single instance, not in the cross-cutting scope of this audit. |
| P-FE-4 | referenced | — | Vite chunk size; perf, not UX. |
| P-FE-5 | consolidated-into | U-VIS-1, U-VIS-7 | InsightsPage h1 responsive scaling rolled into broader InsightsPage cleanup. |
| P-FE-6 | referenced | — | Avatar alt — kept at POLISH; the audit's BLOCKER framing was incorrect (alt="" is valid for decorative). |
| P-FE-7 | consolidated-into | U-COPY-7 | Notification icon `aria-hidden`. |
| P-FE-8 | consolidated-into | U-COPY-11 | PeriodSelector label. |

---

# Summary & recommended waves

**Ship readiness:** Not yet. Seven BLOCKERS span visual tokens (2 — InsightsPage cluster + TransactionList amber), one broken page-shell primitive (Card silently dropping titles), one form-validation mandatory-standard violation, and three backend status-code violations. None of the blockers are individually heavy (S–M); the largest QUALITY items (visual-token cleanup across 60+ sites; backend POST/DELETE status standardisation; pagination metadata) are M–L.

The InsightsPage cluster carries unusual gravity: it independently surfaced from four of the five agents, B-FE-5 in the prior audit, and three POLISH items (P-FE-1/5, Q-FE-9). One bundled fix on InsightsPage closes a disproportionate share of the report.

**Recommended Wave U-1 (BLOCKERS, 7 findings):** bundle by area for reviewable PRs.

- **U-1a — InsightsPage cleanup** (3 findings: U-VIS-1, U-VIS-7, U-LAY-7, plus the QUALITY items U-LAY-1 and U-LAY-8 since they touch the same files). One PR. Delivers token compliance, the `Card.title` fix, the canonical h1 pattern, the `<header>` landmark, and the `pageLayout` import together. Highest-value bundle in the audit.
- **U-1b — TransactionList missing-category state** (1 finding: U-VIS-2). Tiny PR; isolates a non-Insights surface so Wave U-1a can ship independently.
- **U-1c — TransactionEntryForm validation timing** (1 finding: U-FRM-1). One PR. Touches one component but is a behaviour change; ship with QA on the form's blur/submit flow.
- **U-1d — Backend create/delete status codes** (3 findings: U-API-1, U-API-2, U-API-3). One PR across three controllers. Update frontend only if a consumer was keyed on the old status (likely no-op — most clients accept any 2xx).

**Recommended Wave U-2 (QUALITY, 33 findings):** sub-split.

- **U-2a — Forms/states/interactions** (9 findings: U-FRM-2, U-FRM-4 through U-FRM-11). The big consistency push.
- **U-2b — Page shell / layout landmarks** (4 findings: U-LAY-2, U-LAY-3, U-LAY-4, U-LAY-5; U-LAY-1 ships in U-1a). Mechanical `<div>` → `<header>`/`<section>` swaps plus YourAccount restructure.
- **U-2c — Visual tokens & typography codebase pass** (4 findings: U-VIS-4, U-VIS-5, U-VIS-6, U-VIS-8). Largest single bundle by volume; consider sub-splitting U-VIS-5 by feature folder if the PR gets too big to review.
- **U-2d — Copy / terminology / a11y / routing** (5 findings: U-COPY-3, U-COPY-4, U-COPY-6, U-COPY-7, U-COPY-8). Includes the `/budget` → `/budgets` rename which carries link-audit risk; ship behind a redirect.
- **U-2e — Backend API UX consistency** (9 findings: U-API-4 through U-API-12). Bundle naturally by controller scope. Ship paginated-response wrapper (U-API-9) and error-code registry (U-API-10) together so the frontend can consume them.

**Recommended Wave U-3 (POLISH, 8 findings):** one or two batched PRs at the end.

For each chosen sub-wave, run the `writing-plans` skill to produce a per-wave implementation plan rather than batching.
