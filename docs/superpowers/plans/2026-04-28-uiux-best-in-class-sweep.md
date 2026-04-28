# UI/UX Best-in-Class Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **This plan is NOT subagent-friendly.** It requires the human user driving a browser in real time across multiple synchronous sessions; subagents cannot interact with the user's browser and cannot run the discovery loop on their own. Always run inline.

**Goal:** Execute the four-session live walkthrough described in `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` and populate §7 (finding inventory) and §8 (wave plan) of that doc.

**Architecture:** Synchronous human-driven discovery walk — no production code is written. The user drives the browser; Claude reads source code, cross-references descriptions to `file:line`, logs findings into the spec doc, and pushes proposed-fix mockups to the visual companion when useful. Per-session commits land on the `audit/uiux-best-in-class-sweep` branch. The terminal output is the populated audit doc; downstream wave plans (Φ, 1, 2..N, Ω) are spawned as separate `writing-plans` cycles after this plan completes.

**Tech Stack:** No new code. Tools used during the walk:
- Chrome / Firefox DevTools (responsive mode, network throttle, request blocking, color picker, accessibility tree)
- Frontend dev server: `npm run dev` in `frontend/` (Vite + React + TypeScript)
- Backend dev server: whichever script the user uses to bring up Spring Boot (likely `dev.ps1` on Windows or `mvn spring-boot:run` directly)
- The visual companion at `http://localhost:63537` (server is already up from the brainstorming session)
- The spec doc at `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (this is the live working document)

**Discovery-vs-coding adaptation.** This plan does not follow strict TDD because there is no production code being written. Each "test" in the plan is a *doc-state assertion* (e.g., "§ 7 Session A subheading now contains ≥1 finding per surface walked, each with full fields populated"). Each "commit" is a snapshot of the audit doc + any plan/spec edits.

---

## File Structure

Files this plan touches:

- **Modify:** `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` — the audit doc; sections 7 and 8 get populated. This is the primary deliverable.
- **Modify:** `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` — this plan; checkboxes get ticked as we go.
- **Modify:** `.gitignore` — add `.superpowers/` so brainstorm session files don't get tracked.
- **Create (only if needed):** `backend/scripts/seed-walkthrough-data.sql` (or equivalent) — a one-time seed if the test account is empty. Only created if Task 0's data check fails.
- **Read-only:** `frontend/src/**` — Claude reads page source during the walk to add `file:line` citations to findings.

No new code modules, no new tests in `frontend/` or `backend/`. The entire deliverable is documentation.

---

## Task 0: Session A pre-flight

**Goal:** confirm everything needed for the first walkthrough session is in place. Blocks Session A.

**Files:**
- Modify: `.gitignore`
- Read: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (refresh on the methodology before walking)
- Conditional create: `backend/scripts/seed-walkthrough-data.sql` (only if test data check fails)

- [ ] **Step 1: Confirm `.superpowers/` is in `.gitignore`**

Run:
```bash
grep -E "^\.superpowers/?$" /Users/johnlesterescarlan/Personal\ Projects/kaizen/.gitignore || echo "MISSING"
```

If output is `MISSING`, append the entry:
```bash
printf "\n# Superpowers brainstorming session files\n.superpowers/\n" >> "/Users/johnlesterescarlan/Personal Projects/kaizen/.gitignore"
```

Commit:
```bash
git add .gitignore && git commit -m "chore: ignore .superpowers/ brainstorm session files"
```

Expected: `.gitignore` now contains `.superpowers/`; `git status --short` no longer shows `?? .superpowers/`.

- [ ] **Step 2: Confirm test data exists in the dev account**

Ask the user (in chat): *"Open the app and log into your test account. Tell me roughly how many budgets, transactions, goals, and payment methods exist."*

The walk needs ≥1 budget, ≥20 transactions across multiple categories, ≥1 goal, ≥2 payment methods. If any of those are missing, write a one-time seed SQL script in Step 2a; otherwise skip to Step 3.

- [ ] **Step 2a (CONDITIONAL — only if Step 2 surfaced gaps): Write seed script**

Inspect the existing seed pattern:
```bash
ls /Users/johnlesterescarlan/Personal\ Projects/kaizen/backend/src/main/resources/db/migration/
```

Then create `backend/scripts/seed-walkthrough-data.sql` matching the existing migration style, inserting only the missing data types for the test user. Run it once against the dev DB. Do **not** commit — this is a local-only convenience.

- [ ] **Step 3: Confirm screenshot flow works**

Ask the user: *"Take a sample screenshot of any window using `cmd+shift+ctrl+4` (Mac) or your equivalent. Paste it directly into this chat."*

Expected: image arrives in chat; Claude can describe its content. If the paste doesn't work, fall back to: *"Save the screenshot to `/tmp/walk-screenshot.png` and tell me when it's there."*

- [ ] **Step 4: Confirm theme toggle path**

Ask the user: *"Where is the light/dark theme toggle in the shell? Click it once and confirm both modes work."*

Expected: user describes the toggle location (likely in `AuthenticatedLayout` profile menu or sidebar). Note the path in conversation — it'll be the first finding if the toggle is not discoverable.

- [ ] **Step 5: Confirm dev server bring-up**

Ask the user: *"Bring up both dev servers. Frontend should be at `http://localhost:5173` (or whatever Vite reports). Backend at `http://localhost:8080`. Confirm both are clean (no startup errors)."*

Expected: user confirms both servers are running. If either fails, debug before proceeding.

- [ ] **Step 6: Confirm visual companion is alive**

Run:
```bash
ls /Users/johnlesterescarlan/Personal\ Projects/kaizen/.superpowers/brainstorm/*/state/server-info 2>/dev/null && echo "ALIVE" || echo "DEAD"
```

If `DEAD`, restart the server:
```bash
/Users/johnlesterescarlan/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/brainstorming/scripts/start-server.sh --project-dir "/Users/johnlesterescarlan/Personal Projects/kaizen"
```

Save the new port and tell the user the URL.

- [ ] **Step 7: Verify Session A pre-flight is complete**

Doc-state assertion:
- `.gitignore` contains `.superpowers/`
- Test account has the required data
- Screenshot paste flow confirmed
- Theme toggle path known
- Both dev servers up
- Visual companion URL known

If any item fails, fix it before starting Session A.

---

## Task 1: Session A — Walk logged-out + onboarding + shell + Home

**Goal:** complete the walk for surfaces 1, 2, 3, 0, 4 (in walking order) using the per-page rhythm in spec §3. Append all findings to spec §7 → "Session A — logged-out + onboarding + shell + Home".

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (append findings to §7 Session A subsection)
- Read: `frontend/src/features/signin/**`, `frontend/src/features/onboarding/**`, `frontend/src/app/router/AuthenticatedLayout.tsx`, `frontend/src/features/home/**`

**Walking order within Session A:** Signin → Register / OAuth callback → Onboarding flow → AuthenticatedLayout shell (observed implicitly while on every page) → Home / Dashboard.

- [ ] **Step 1: Walk Signin (surface 1)**

Ask the user: *"Log out. We're starting at the Signin page in light mode at desktop width."*

Run the per-page rhythm from spec §3:
1. Light + Desktop + Populated (form visible, no submission yet)
2. Toggle dark
3. Resize to ~375px (mobile)
4. Resize to ~768px (tablet)
5. Empty / initial state (just the empty form)
6. Loading state (submit and observe; if too fast, throttle network)
7. Error state (submit with invalid creds; capture treatment)
8. Keyboard pass (tab through form, OAuth button, focus rings)

For each layer, ask the user to describe what they see (and screenshot if visual-only). Cross-reference any code-traceable issues to `frontend/src/features/signin/**:line` while the user looks. Append findings to spec §7 with full fields (ID, severity, tag, files, evidence, impact, fix sketch, effort) using the format in spec §4.

Doc-state assertion: spec §7 → Session A subsection now has at least one Signin entry (or a *"No findings"* note if the page is genuinely clean).

- [ ] **Step 2: Walk Register / OAuth callback (surface 2)**

Ask the user: *"Walk us through the registration flow if it exists, and the OAuth-callback handoff. Show me both happy and error paths."*

Same per-page rhythm. Watch in particular for: first-impression copy, OAuth-callback transition state (does it look like an error? a load? a blank screen?), error states from declined OAuth.

Append findings to spec §7.

- [ ] **Step 3: Walk Onboarding (surface 3)**

Ask the user: *"Reset to a fresh-onboarding state if you can (or step through onboarding from the start). Walk each step."*

For each onboarding step, run the rhythm. Pay particular attention to: first-run impression, micro-copy, illustration / empty-state treatment, multi-step navigation affordance, error states on each form, completion-state polish.

Append findings to spec §7.

- [ ] **Step 4: Walk AuthenticatedLayout shell (surface 0)**

Ask the user: *"Now log in. Before we walk Home, just look at the shell — top nav, sidebar, AddEntryFAB, profile menu, notifications. We're checking the shell's own treatment first since it's on every page."*

Run the rhythm against the shell (light/dark, mobile/tablet, hover/focus on every nav item, FAB, profile menu open, notification dropdown). Read `frontend/src/app/router/AuthenticatedLayout.tsx` to add citations.

Append findings to spec §7 with `Tag: [SHELL]`.

- [ ] **Step 5: Walk Home / Dashboard (surface 4)**

Ask the user: *"Now walk through Home. We want populated state (your existing data), then the empty state, then loading, then error."*

Run the full rhythm. Home is a dense page — expect findings around stat cards, charts, recent activity list, dark-mode contrast on charts, mobile responsive density.

Append findings to spec §7.

- [ ] **Step 6: Doc-state assertion (mid-session checkpoint)**

Re-read `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` § 7 → Session A subsection. Verify:
- Each of the 5 surfaces (Signin, Register/OAuth, Onboarding, Shell, Home) has at least one entry, OR an explicit *"No findings — surface is clean"* note.
- Every finding has: ID, severity, tag, files (or visual-only marker), evidence, impact, fix sketch, effort.
- Foundation/page tagging is set per finding.

If any surface lacks coverage, return to the relevant step and walk what was missed.

---

## Task 2: Session A — End-of-session

**Goal:** run foundation auto-promotion, snapshot the doc, take stock before Session B.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`

- [ ] **Step 1: Foundation auto-promotion pass**

Re-read the Session A findings. For each finding, check: does the same root cause appear in 3+ findings (across surfaces)? If yes, retag those findings to `[FOUNDATION]` and update their recurrence line. (At end of Session A, recurrence may only be partial — that's fine, the threshold may be reached during sessions B–D.)

For findings that already look like foundation issues (e.g., a token-vocabulary slip, a shared-component bug) but only appear once so far, leave the page tag and add an internal note `(monitor for recurrence in B–D)`.

- [ ] **Step 2: Update plan checkboxes**

Tick every completed checkbox in this plan up through Task 2 Step 1.

- [ ] **Step 3: Commit Session A snapshot**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md
git commit -m "$(cat <<'EOF'
docs(audit): Session A findings — logged-out + onboarding + shell + Home

Walked Signin, Register/OAuth callback, Onboarding flow, the
AuthenticatedLayout shell, and Home/Dashboard against the eight-layer
coverage rhythm (light/dark, desktop/tablet/mobile, populated/empty/
loading/error, keyboard). Findings logged to spec §7 Session A.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: `git status --short` shows clean working tree on `audit/uiux-best-in-class-sweep`. Recent commit visible via `git log --oneline -1`.

---

## Task 3: Session B pre-flight

**Goal:** confirm the dev environment is still in shape; refresh on what Session A surfaced; align on Session B target surfaces.

**Files:**
- Read: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (especially Session A findings, to know what foundation patterns to watch for)

- [ ] **Step 1: Confirm dev servers still up**

Ask the user: *"Are the frontend and backend dev servers still running? If not, bring them up again."*

Expected: both servers reachable.

- [ ] **Step 2: Re-read Session A findings**

Read spec §7 Session A. Note any patterns flagged with `(monitor for recurrence in B–D)` — these are the foundation-suspect findings. While walking Sessions B–D, watch for the same root causes.

- [ ] **Step 3: Confirm visual companion is still alive**

Same check as Task 0 Step 6. Restart if needed.

- [ ] **Step 4: Confirm Session B target surfaces with the user**

Tell the user: *"Session B covers Transactions (list, filters, detail, add/edit, bulk-delete) and Budgets (list, detail, add/edit, manual setup). Estimated ~45 min. Ready?"*

Wait for confirmation.

---

## Task 4: Session B — Walk Transactions + Budgets

**Goal:** complete the walk for surfaces 5 and 6 with their sub-views. Append findings to spec §7 → Session B subsection.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`
- Read: `frontend/src/features/transactions/**`, `frontend/src/features/budgets/**`

- [ ] **Step 1: Walk Transactions list view (surface 5, sub-view: list)**

Ask the user: *"Open `/transactions`. Populated state, light desktop first."*

Run the full rhythm. Transactions list is dense — pay attention to: row density, alternating treatments (or lack thereof), sort/filter affordance, bulk-select interaction, pagination/infinite-scroll behavior, empty state, error state when API fails.

Append findings.

- [ ] **Step 2: Walk Transactions filters**

Ask the user: *"Open the filter panel. Walk through each filter type."*

Rhythm. Watch for: filter-state visual feedback (active filters visible?), reset affordance, mobile filter UX (drawer? modal? inline?), keyboard navigation through filter options.

Append findings.

- [ ] **Step 3: Walk Transaction detail view**

Ask the user: *"Open any single transaction's detail page."*

Rhythm. Watch for: hero treatment, metadata layout, attachments section, edit affordance, delete confirmation flow, back-navigation label specificity.

Append findings.

- [ ] **Step 4: Walk Transaction add/edit form**

Ask the user: *"Open the AddEntryFAB to create a new transaction. Walk the form."*

Rhythm. Watch for: field labelling, required-field markers, validation timing (the Apr 26 audit flagged on-keystroke validation; verify it's been fixed), error treatment, success treatment, modal focus management, mobile keyboard avoidance.

Append findings.

- [ ] **Step 5: Walk Bulk-delete flow**

Ask the user: *"Select multiple transactions and trigger bulk-delete."*

Rhythm. Watch for: selection-state visual, destructive-action dialog treatment (Apr 26 introduced a primitive — verify it's used), undo affordance, post-delete state.

Append findings.

- [ ] **Step 6: Walk Budgets list view (surface 6, sub-view: list)**

Ask the user: *"Open `/budgets`. Populated state, light desktop."*

Rhythm. Watch for: budget-card treatment, allocation visualization, "unallocated" card (recently redesigned — verify), action affordances per card.

Append findings.

- [ ] **Step 7: Walk Budget detail view**

Ask the user: *"Open any single budget's detail page."*

Rhythm. Watch for: hero treatment, the projection / burn-rate visualization, transaction-list-within-budget treatment, edit/delete flows.

Append findings.

- [ ] **Step 8: Walk Budget add/edit + manual setup**

Ask the user: *"Walk the manual budget creation flow + the edit flow."*

Rhythm. Watch for: validation on amount/category/date, the over-allocation block (a recent addition), success treatment.

Append findings.

- [ ] **Step 9: Doc-state assertion (mid-session checkpoint)**

Re-read spec §7 → Session B subsection. Verify each of the 8 sub-views walked has at least one entry or a *"No findings"* note. Verify finding-field completeness as in Task 1 Step 6.

---

## Task 5: Session B — End-of-session

**Goal:** auto-promote, snapshot, prepare for Session C.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`

- [ ] **Step 1: Foundation auto-promotion pass**

Re-read all findings from Sessions A and B together. Any root cause now appearing on 3+ surfaces auto-promotes to `[FOUNDATION]`. Update tags and recurrence lines.

- [ ] **Step 2: Update plan checkboxes**

Tick every completed checkbox in this plan up through Task 5 Step 1.

- [ ] **Step 3: Commit Session B snapshot**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md
git commit -m "$(cat <<'EOF'
docs(audit): Session B findings — Transactions + Budgets

Walked Transactions (list, filters, detail, add/edit, bulk-delete) and
Budgets (list, detail, add/edit, manual setup) against the eight-layer
coverage rhythm. Foundation auto-promotion pass updated tags for any
root cause now seen on 3+ surfaces.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: clean working tree.

---

## Task 6: Session C pre-flight

**Goal:** confirm environment, refresh on accumulating foundation patterns, align on Session C target surfaces.

- [ ] **Step 1: Confirm dev servers still up**

Same as Task 3 Step 1.

- [ ] **Step 2: Re-read accumulated findings (Sessions A + B)**

Read spec §7 Sessions A and B. Note all `[FOUNDATION]`-tagged findings and the `(monitor for recurrence)` notes. These are the patterns to actively look for in Session C.

- [ ] **Step 3: Confirm visual companion alive**

Same as Task 0 Step 6.

- [ ] **Step 4: Confirm Session C target surfaces**

Tell the user: *"Session C covers Insights (spending summary, category breakdown, trends, period selector) plus the settings cluster: Categories (list, create, edit, merge), Payment Methods (list, create, edit, delete), Goals (list, detail, create, edit). ~45 min."*

Wait for confirmation.

---

## Task 7: Session C — Walk Insights + settings cluster

**Goal:** complete the walk for surfaces 7, 8, 9, 10. Append findings to spec §7 → Session C subsection.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`
- Read: `frontend/src/features/insights/**`, `frontend/src/features/categories/**`, `frontend/src/features/payment-methods/**`, `frontend/src/features/goals/**`

- [ ] **Step 1: Walk Insights spending summary**

Ask the user: *"Open `/insights`. We'll walk each section in order, starting with spending summary."*

Rhythm. The Apr 26 audit flagged InsightsPage as the worst offender (U-VIS-1 cluster) — many fixes shipped, but verify under the higher quality bar. Watch chart contrast in dark mode especially (still a known concern per Apr 26 follow-ups).

Append findings.

- [ ] **Step 2: Walk Insights category breakdown**

Same Insights page, scroll to category breakdown section. Rhythm.

Append findings.

- [ ] **Step 3: Walk Insights spending trends**

Same Insights page, scroll to trends section. Rhythm. Watch line/bar chart treatment, empty trend state, period selector interaction with trends.

Append findings.

- [ ] **Step 4: Walk Insights period selector**

Open the period selector dropdown. Rhythm focused on dropdown UX: keyboard navigation, label association (Apr 26 flagged as missing), selected-state treatment, mobile dropdown UX.

Append findings.

- [ ] **Step 5: Walk Categories list**

Ask the user: *"Open `/categories`. Walk the list view."*

Rhythm. Watch for: category card / row treatment, icon-color-system consistency (per `docs/category-icon-color-system.md`), global vs user-created differentiation, action affordances.

Append findings.

- [ ] **Step 6: Walk Categories create + edit + merge**

Walk each flow. Rhythm. Watch for: validation timing, color picker treatment, icon picker treatment, merge confirmation flow (this is destructive — verify the destructive-dialog primitive is used), success treatment.

Append findings.

- [ ] **Step 7: Walk Payment Methods list + create + edit + delete**

Walk each flow. Rhythm. Watch for: empty state (Apr 26 flagged missing CTA — verify), inline form treatment, delete confirmation, undo coverage (Apr 26 flagged as missing).

Append findings.

- [ ] **Step 8: Walk Goals list + detail + create + edit**

Walk each flow. Rhythm. Watch for: progress visualization, hero treatment on detail, form treatment, completion-state treatment.

Append findings.

- [ ] **Step 9: Doc-state assertion**

Re-read spec §7 → Session C subsection. Verify coverage and field-completeness as in prior sessions.

---

## Task 8: Session C — End-of-session

**Files:** modify spec doc.

- [ ] **Step 1: Foundation auto-promotion pass (Sessions A + B + C)**

Re-read all findings. Re-tag any root cause now on 3+ surfaces.

- [ ] **Step 2: Update plan checkboxes**

Tick everything through Task 8 Step 1.

- [ ] **Step 3: Commit Session C snapshot**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md
git commit -m "$(cat <<'EOF'
docs(audit): Session C findings — Insights + settings cluster

Walked Insights (spending summary, category breakdown, trends, period
selector), Categories, Payment Methods, and Goals against the eight-
layer coverage rhythm. Foundation auto-promotion pass updated tags.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: clean working tree.

---

## Task 9: Session D pre-flight

**Goal:** confirm environment; align on the final session.

- [ ] **Step 1: Confirm dev servers still up**

Same as Task 3 Step 1.

- [ ] **Step 2: Re-read all accumulated findings**

Read spec §7 Sessions A + B + C. By this point the foundation pattern catalog should be substantial. Note any `[FOUNDATION]` findings — Session D's shell re-walk targets these explicitly.

- [ ] **Step 3: Confirm visual companion alive**

Same as Task 0 Step 6.

- [ ] **Step 4: Confirm Session D target surfaces**

Tell the user: *"Session D covers Your Account (profile, sessions, settings groups), 404, plus a shell re-walk to verify any cross-page issues we surfaced earlier. ~30 min."*

Wait for confirmation.

---

## Task 10: Session D — Walk Your Account + 404 + shell re-walk

**Goal:** complete the walk for surfaces 11 and 12, plus a targeted shell re-walk. Append findings to spec §7 → Session D subsection.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`
- Read: `frontend/src/features/your-account/**`, `frontend/src/features/not-found/**`, `frontend/src/app/router/AuthenticatedLayout.tsx`

- [ ] **Step 1: Walk Your Account profile section**

Ask the user: *"Open `/your-account`. Walk the profile section first."*

Rhythm. Watch for: avatar treatment, profile-edit affordance, form treatment, save/cancel pattern.

Append findings.

- [ ] **Step 2: Walk Your Account sessions section**

Same page, sessions section. Rhythm. Watch for: session-list density, current-session indicator, revoke action treatment, destructive confirmation.

Append findings.

- [ ] **Step 3: Walk Your Account settings groups**

Same page, remaining settings groups. Rhythm. Watch for: section-grouping treatment, toggle/checkbox styling, danger-zone treatment if any.

Append findings.

- [ ] **Step 4: Walk 404 / Not Found**

Ask the user: *"Navigate to a deliberately bad URL like `/this-does-not-exist`. We're checking the 404 treatment."*

Rhythm (light/dark + responsive at minimum; loading/error/keyboard less applicable). Watch for: copy tone, illustration / icon, primary CTA back to safety, search affordance if any, dark-mode treatment.

Append findings.

- [ ] **Step 5: Targeted shell re-walk**

Re-read all `[SHELL]`-tagged findings from Sessions A, B, C. For each, verify with a quick re-walk that the issue is real, accurately described, and citation is correct. Update findings if anything has shifted.

- [ ] **Step 6: Doc-state assertion**

Re-read spec §7 → Session D subsection. Verify coverage and field-completeness.

---

## Task 11: Post-walk wave decomposition

**Goal:** populate spec §8 with concrete waves, finding lists, effort estimates, and sequencing positions.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md`

- [ ] **Step 1: Final foundation auto-promotion pass**

Re-read all findings across Sessions A–D. Apply the auto-promotion rule one last time. By now `[FOUNDATION]` tags should be settled.

- [ ] **Step 2: Catalog by tag**

Group all findings:
- `[FOUNDATION]` set → Wave Φ candidates
- `[SHELL]` set → distributes between Φ (if foundation-rooted) and Wave 2 (if surface-specific)
- `[PAGE: X]` set → routes to the per-surface wave for X

Within `[FOUNDATION]`, sub-group by theme: *tokens*, *typography*, *components*, *dark-mode contrast*, *motion*, *charts*, *other*. Each sub-group becomes a Φ sub-wave (Φ1, Φ2, …) if the totals warrant it.

- [ ] **Step 3: Identify surgical BLOCKERs for Wave 1**

Re-read every `BLOCKER`-severity finding. For each, ask: *can this be fixed surgically without depending on foundation work?* If yes → Wave 1. If no → fold into the appropriate Φ sub-wave (per spec §5).

- [ ] **Step 4: Catalog OPPORTUNITY findings into Wave Ω sub-themes**

Group all `OPPORTUNITY`-severity findings by theme: *motion*, *micro-interactions*, *empty-state delight*, *density*, *other*. Each non-trivial theme becomes a Ω sub-wave.

- [ ] **Step 5: Populate spec §8**

Replace the placeholder content of §8 with concrete entries. Format per wave:

```markdown
### Wave Φ1 — Token vocabulary consolidation

- **Goal:** [one-line]
- **Findings:** BIC-VIS-3, BIC-VIS-7, BIC-FRM-2 (+ Apr 26 cross-ref U-FRM-2)
- **Effort estimate:** L
- **Sequencing:** ships before Waves 2..N
- **Per-wave plan:** TBD — will be a downstream `writing-plans` cycle on this wave
```

Repeat for every wave (Φ sub-waves, Wave 1, Waves 2..N, Ω sub-waves).

- [ ] **Step 6: Sanity-check totals**

Verify:
- Every finding from §7 appears under exactly one wave in §8.
- Wave count is in the 9–14 range predicted by the spec; if outside, briefly explain why in §8 prose.
- Sequencing constraint diagram (spec §5) still holds for the actual waves.

- [ ] **Step 7: Update plan checkboxes through Task 11 Step 6.**

---

## Task 12: Final commit + handoff

**Goal:** snapshot the completed audit doc, announce the handoff to per-wave `writing-plans` cycles, update memory with the durable decisions from this brainstorm.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (final state)
- Modify: `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` (final tick)
- Possibly modify: memory files under `~/.claude/projects/.../memory/` (only if durable decisions were made)

- [ ] **Step 1: Final commit on the audit branch**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md
git commit -m "$(cat <<'EOF'
docs(audit): Session D + wave decomposition — sweep complete

Walked Your Account, 404, and re-walked the shell for cross-page
findings. Final foundation auto-promotion pass run; spec §8 now
populated with concrete waves (Φ sub-waves + Wave 1 + per-surface
Waves 2..N + Ω sub-waves) including finding lists and sequencing.

Each wave will get its own downstream writing-plans cycle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: clean working tree on `audit/uiux-best-in-class-sweep`.

- [ ] **Step 2: Decide PR or merge strategy with the user**

Ask: *"The audit branch is ready. Two options: (a) open a PR for review (recommended if you want a teammate to look) or (b) merge directly to main since it's docs-only (faster). Which?"*

Carry out whichever is chosen. If PR, use `gh pr create` with a body summarizing the wave decomposition. If merge, switch to main, merge, push.

- [ ] **Step 3: Inventory next-step writing-plans cycles**

For each wave in spec §8, write a one-line entry in chat naming the next `writing-plans` cycle to spawn. E.g.:

```
- Wave Φ1 (Token vocabulary): next → invoke writing-plans for Φ1
- Wave Φ2 (Typography role coverage): next → invoke writing-plans for Φ2
- Wave 1 (Surgical BLOCKERs): next → invoke writing-plans for Wave 1
- ...
```

The user picks which one to cycle on first. Most natural starting point: Φ1 (token consolidation), since it has hard-rule sequencing precedence.

- [ ] **Step 4: Update memory with durable decisions (optional)**

If during the walk we made decisions that should outlive this audit (e.g., "the canonical token vocabulary is `text-foreground` family, not `text-ui`"), save them as appropriate memory files. Skip if nothing durable surfaced.

- [ ] **Step 5: Stop the visual companion server**

```bash
ls /Users/johnlesterescarlan/Personal Projects/kaizen/.superpowers/brainstorm/ | head -1
```

Identify the active session dir, then:

```bash
/Users/johnlesterescarlan/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.7/skills/brainstorming/scripts/stop-server.sh "/Users/johnlesterescarlan/Personal Projects/kaizen/.superpowers/brainstorm/<session-dir>"
```

(Mockup files persist under the session dir for later reference — they don't get deleted, just the server stops.)

- [ ] **Step 6: Tell the user the audit is complete**

Report concisely: walks complete, doc populated, waves decomposed, branch state. Hand back control for them to choose which wave to start with.

---

## Summary of deliverables

When this plan completes, the repo will contain:

1. `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` — fully populated audit doc (sections 1–10 stable; §7 contains all walk findings; §8 contains the wave decomposition).
2. `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` — this plan, all checkboxes ticked.
3. Either an open PR on `audit/uiux-best-in-class-sweep` *or* a fast-forward merge to `main`, depending on user preference.
4. A list of follow-up `writing-plans` cycles (one per wave) ready to be invoked.

No production code is changed by this plan. All production-code changes happen in the downstream per-wave plans.
