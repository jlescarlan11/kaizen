# UI/UX Best-in-Class Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the agent-orchestrated code-read audit described in `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` and populate sections 7 (finding inventory) and 8 (wave plan) of that doc.

**Architecture:** Five parallel exploration agents read source per surface cluster. Orchestrator (this session) verifies BLOCKERs by re-reading citations, consolidates duplicates, runs foundation auto-promotion, and writes the wave decomposition. No live walkthrough, no synchronous user time required during the audit run. The audit doc is the deliverable; per-wave fix plans are spawned downstream.

**Tech Stack:** No new code. Tools used:
- `Agent` tool with `subagent_type: Explore` for read-only source exploration.
- `Read`, `Bash` (`grep`/`find`), `Edit` for orchestrator verification + doc population.
- The audit doc at `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` is the live working document.

**Discovery-vs-coding adaptation.** This plan does not follow strict TDD because there is no production code being written. Each "test" is a *doc-state assertion*. Each "commit" is a snapshot of the audit doc.

---

## File Structure

Files this plan touches:

- **Modify:** `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` — sections 7 and 8 get populated. Primary deliverable.
- **Modify:** `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` — this plan; checkboxes get ticked.
- **Read-only:** `frontend/src/**`, `CODING_STANDARDS.md`, `AGENTS.md`, the Apr 26 audit specs.

No new code modules, no test files, no scripts. Entire deliverable is documentation.

---

## Task 1: Prepare per-agent briefs

**Goal:** draft the five briefs that will be passed to the parallel agents. Each brief is self-contained and follows the template in spec § 3.

**Files:** none modified yet — briefs live in this session's working memory until dispatch.

- [ ] **Step 1: Inventory still-open Apr 26 findings**

Read `docs/superpowers/specs/2026-04-26-uiux-consistency-audit.md` § BLOCKERS, QUALITY, POLISH. Cross-reference against recent commits on `main` to identify which findings are *still open* (not yet fixed). Build a list per agent slice:

- Agent 1 surfaces: Apr 26 IDs that touched shell / signin / onboarding / Home.
- Agent 2 surfaces: Apr 26 IDs that touched transactions / budgets.
- Agent 3 surfaces: Apr 26 IDs that touched insights.
- Agent 4 surfaces: Apr 26 IDs that touched settings (categories, payment-methods, your-account, 404).
- Agent 5 (foundation): Apr 26 IDs that touched shared/components, styles, or were tagged as cross-cutting.

The point: agents reference these instead of re-discovering them. Saves context, reduces duplicate findings.

- [ ] **Step 2: Draft Agent 1 brief — first impression cluster**

Compose a self-contained prompt with the structure specified in spec § 3 "Per-agent brief template". Surface scope: `frontend/src/app/router/AuthenticatedLayout.tsx`, `frontend/src/features/signin/**`, `frontend/src/features/onboarding/**`, `frontend/src/features/home/**`. Reference docs + still-open Apr 26 IDs from Step 1's Agent 1 list. Include the four-tier severity rubric inline. Tell the agent to output one Markdown finding per item with the exact field set from spec § 4.

- [ ] **Step 3: Draft Agent 2 brief — money flows**

Same template. Surface scope: `frontend/src/features/transactions/**`, `frontend/src/features/budgets/**`, plus `frontend/src/features/home/**` (data-display slice — the dashboard's transaction/budget widgets specifically).

- [ ] **Step 4: Draft Agent 3 brief — insights & charts**

Same template. Surface scope: `frontend/src/features/insights/**`, plus chart-color primitives in `frontend/src/shared/components/` (anything matching `*Chart*`, `*Trend*`, `*Line*`).

- [ ] **Step 5: Draft Agent 4 brief — settings cluster**

Same template. Surface scope: `frontend/src/features/categories/**`, `frontend/src/features/payment-methods/**`, `frontend/src/features/your-account/**`, `frontend/src/features/not-found/**`.

- [ ] **Step 6: Draft Agent 5 brief — foundation primitives**

Same template, but with a sharper focus on cross-cutting concerns. Surface scope: `frontend/src/shared/components/**`, `frontend/src/styles/**`, `frontend/src/shared/styles/**`, `CODING_STANDARDS.md` § 1.7 (typography rules), `frontend/eslint.config.js`, the `tsconfig.app.json` design-system-relevant settings. Look specifically for: token-vocabulary drift (the Apr 26 `text-ui` vs `text-foreground` finding), missing component primitives, motion/transition primitive gaps, dark-mode token coverage, Tailwind config issues.

- [ ] **Step 7: Doc-state assertion**

Five complete agent briefs exist in working memory. Each contains: surface scope, reference docs, severity rubric, "look for" list, output format, quality bar reminder. None reference a missing source dir.

---

## Task 2: Dispatch agents in parallel

**Goal:** kick off all five exploration agents concurrently using a single message with five `Agent` tool calls.

**Files:** none modified — agents are read-only.

- [ ] **Step 1: Dispatch all five agents in one message**

Send a single assistant message containing five `Agent` tool calls (one per brief). All set `subagent_type: Explore`. Each prompt is the corresponding brief from Task 1. They run concurrently.

- [ ] **Step 2: Receive and stash agent outputs**

When all five return, capture each agent's finding list into working memory tagged by agent ID. Do not yet edit the audit doc — consolidation runs in Task 3.

- [ ] **Step 3: Doc-state assertion**

Five agent finding lists exist in working memory. Each is a Markdown block of findings with the § 4 field structure. Agent finding counts noted (e.g., "Agent 1: 12 findings; Agent 2: 18 findings; …").

If any agent returned without findings or with malformed output, re-dispatch that agent only with a sharpened brief.

---

## Task 3: Verify BLOCKERs and consolidate

**Goal:** independently re-verify every BLOCKER claim by reading the cited `file:line`. Merge cross-agent duplicates. Produce the consolidated finding set.

**Files:** the audit doc gets the finding inventory written into § 7.

- [ ] **Step 1: Re-verify every BLOCKER finding**

For each BLOCKER across all five agent outputs:

1. Open the cited file at the cited line range with `Read`.
2. Confirm the evidence string matches what's actually there.
3. If the citation is wrong (line numbers shifted, file renamed), correct it. Note the correction.
4. If the finding doesn't reproduce (the issue isn't there), drop it. Note the drop.
5. If the finding is real but the severity is overstated (e.g., agent flagged BLOCKER but it's actually QUALITY), downgrade. Note the change.
6. If a QUALITY/POLISH finding turns out to be BLOCKER on re-read, upgrade. Note the change.

This step IS the audit's quality bar. Don't skip.

- [ ] **Step 2: Identify cross-agent duplicates**

Walk all five lists looking for the same root cause cited in multiple agents (e.g., the shell's profile-menu likely shows up in both Agent 1 and Agent 4). For each duplicate cluster:

- Pick the most-detailed finding as the canonical one.
- Merge citations and evidence from siblings.
- Add `Recurrence: seen by N agents — A1, A4`.
- Drop the sibling findings.

- [ ] **Step 3: Run foundation auto-promotion**

Re-tag any finding whose root cause spans 3+ surfaces (across the consolidated set) as `[FOUNDATION]`, replacing whatever surface tag it had. This usually surfaces the token-vocabulary drift, missing primitives, motion gaps, etc.

- [ ] **Step 4: Write findings into audit doc § 7**

Edit `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` § 7. For each agent subsection (Agent 1, …, Agent 5, Cross-cutting), insert the consolidated findings that originated there (or, for cross-cutting, the merged findings). Use the field format from spec § 4. Cross-references to Apr 26 audit go in the `Cross-ref:` line.

- [ ] **Step 5: Doc-state assertion**

Spec § 7 contains all consolidated findings. Every BLOCKER has been re-verified. Every duplicate has been merged. Foundation tags are applied. Sub-section counts noted in working memory for the wave decomposition.

---

## Task 4: Wave decomposition

**Goal:** populate spec § 8 with concrete waves: each wave gets a name, finding list, effort estimate, sequencing position.

**Files:** `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (modify § 8).

- [ ] **Step 1: Catalog by tag**

Group all consolidated findings:
- `[FOUNDATION]` set → Wave Φ candidates.
- `[SHELL]` set → distributes between Φ (if foundation-rooted) and Wave 2 (if surface-specific).
- `[PAGE: X]` set → routes to the per-surface wave for X.
- `OPPORTUNITY`-severity set → Wave Ω candidates.

Within `[FOUNDATION]`, sub-group by theme: *tokens*, *typography*, *components*, *dark-mode contrast*, *motion*, *charts*, *other*. Each non-trivial sub-group becomes a Φ sub-wave (Φ1, Φ2, …).

- [ ] **Step 2: Identify surgical BLOCKERs for Wave 1**

Re-read every `BLOCKER`-severity finding. For each, ask: *can this be fixed surgically without depending on foundation work?* If yes → Wave 1. If no → fold into the appropriate Φ sub-wave.

- [ ] **Step 3: Catalog OPPORTUNITY findings into Wave Ω sub-themes**

Group all `OPPORTUNITY`-severity findings by theme: *motion*, *micro-interactions*, *empty-state delight*, *density*, *other*. Each non-trivial theme becomes an Ω sub-wave.

- [ ] **Step 4: Populate spec § 8**

Replace placeholder content of § 8 with concrete entries. Format per wave:

```markdown
### Wave Φ1 — Token vocabulary consolidation

- **Goal:** [one-line]
- **Findings:** BIC-VIS-3, BIC-VIS-7, BIC-FRM-2 (+ Apr 26 cross-ref U-FRM-2)
- **Effort estimate:** L
- **Sequencing:** ships before Waves 2..N
- **Per-wave plan:** TBD — will be a downstream `writing-plans` cycle on this wave
```

Repeat for every wave (Φ sub-waves, Wave 1, Waves 2..N, Ω sub-waves).

- [ ] **Step 5: Sanity-check totals**

Verify:
- Every finding from § 7 appears under exactly one wave in § 8.
- Wave count is in the 9–14 range predicted by the spec; if outside, briefly explain why in § 8 prose.
- Sequencing constraint diagram (spec § 5) still holds for the actual waves.

---

## Task 5: Final commit + handoff

**Goal:** snapshot the completed audit doc, announce the handoff to per-wave `writing-plans` cycles, present the user with the next-step menu.

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` (final state).
- Modify: `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` (final tick).

- [ ] **Step 1: Tick all plan checkboxes**

Mark every checkbox in this plan as done.

- [ ] **Step 2: Final commit on the audit branch**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen"
git add docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md
git commit -m "$(cat <<'EOF'
docs(audit): best-in-class UI/UX sweep — agent run complete

Five parallel exploration agents read source across first-impression,
money-flow, insights, settings, and foundation slices. Orchestrator
verified every BLOCKER by re-reading the cited file:line. Consolidated
findings recorded in spec §7 grouped by agent. §8 now contains the
concrete wave decomposition (Φ sub-waves, Wave 1 surgical BLOCKERs,
per-surface Waves 2..N, Ω sub-waves) including finding lists, effort
estimates, and sequencing positions.

Each wave will get its own downstream writing-plans cycle.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: clean working tree on `audit/uiux-best-in-class-sweep`.

- [ ] **Step 3: Present audit summary to the user**

Report concisely:
- Total finding count by severity (e.g., "12 BLOCKER, 41 QUALITY, 18 POLISH, 23 OPPORTUNITY").
- Wave inventory (e.g., "Φ1, Φ2, Φ3, Wave 1, Wave 2..6, Ω1, Ω2 — 10 waves total").
- Top 3 most-impactful findings or wave bundles.
- Cross-references to Apr 26 audit (how many still-open were re-confirmed; how many were closed by recent commits).
- Whether the optional screenshot pass is recommended given what the audit surfaced.

- [ ] **Step 4: Decide PR or merge strategy with the user**

Ask: *"The audit branch is ready. Two options: (a) open a PR for review or (b) merge directly to main since it's docs-only. Which?"*

Carry out whichever is chosen.

- [ ] **Step 5: Inventory next-step writing-plans cycles**

For each wave in spec § 8, write a one-line entry naming the next `writing-plans` cycle to spawn. Most natural starting point: Φ1 (token consolidation), since it has hard-rule sequencing precedence over per-surface waves.

---

## Summary of deliverables

When this plan completes, the repo contains:

1. `docs/superpowers/specs/2026-04-28-uiux-best-in-class-sweep-design.md` — fully populated audit doc (sections 1–10 stable; § 7 contains all agent findings; § 8 contains the wave decomposition).
2. `docs/superpowers/plans/2026-04-28-uiux-best-in-class-sweep.md` — this plan, all checkboxes ticked.
3. Either an open PR on `audit/uiux-best-in-class-sweep` or a fast-forward merge to `main`, depending on user preference.
4. A list of follow-up `writing-plans` cycles (one per wave) ready to be invoked.

No production code is changed by this plan. All production-code changes happen in the downstream per-wave plans.
