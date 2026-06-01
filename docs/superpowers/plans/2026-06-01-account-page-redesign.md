# Account Page Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace circular bordered icon containers, ALL-CAPS typography, and disconnected row layout on the Account page with green-tinted square icons, Title Case text, and card-grouped sections — all in one file.

**Architecture:** Pure class-string and copy-string substitutions in `YourAccountPage.tsx`. `AccountRow` is file-local (not imported), so icon wrap, label, and description changes happen inside the same file. Row grouping requires a structural JSX change to wrap each section's rows in a `bg-surface rounded-2xl shadow-sm overflow-hidden divide-y divide-border-subtle` card. No data, routing, or animation changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, design tokens via CSS custom properties (`bg-primary/5`, `bg-surface`, `text-primary`, `text-error`)

---

## File Map

| File | Change |
|---|---|
| `frontend/src/features/your-account/YourAccountPage.tsx` | Only file modified — class strings, label copy strings, and row-grouping JSX structure |

No other files are created or modified.

---

### Task 1: Green square icon containers (Story 1)

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx` (lines ~49–54)

The `AccountRow` component (defined at line 39 of this file) computes the icon wrap className inline. There are two variants: default (non-destructive) and destructive.

- [ ] **Step 1: Replace the non-destructive icon wrap className**

Find this exact string (lines ~49–51):
```
flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all shadow-sm bg-surface-secondary border-border-subtle text-text-secondary group-hover:text-text-primary
```

Replace with:
```
flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] transition-all bg-primary/5 text-primary
```

Changes: `rounded-xl` → `rounded-[9px]`, remove `border shadow-sm bg-surface-secondary border-border-subtle text-text-secondary group-hover:text-text-primary`, add `bg-primary/5 text-primary`.

- [ ] **Step 2: Leave the destructive icon wrap className unchanged**

Confirm the destructive variant still reads:
```
flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all shadow-sm bg-error/10 border-error/20 text-error
```

Do NOT modify this line. Destructive rows keep the red tint.

- [ ] **Step 3: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0 (ignore pre-existing DataTable.tsx error if present — it predates this change).

- [ ] **Step 4: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/your-account/YourAccountPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(your-account): green square icon containers on account rows"
```

---

### Task 2: Title Case labels + sentence-case descriptions (Story 2)

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx` (lines ~56–64, ~120–200)

Two parts: (A) fix the CSS class strings on the label and description elements inside `AccountRow`; (B) update the label copy strings in the `accountSections` array to proper Title Case.

- [ ] **Step 1: Replace the default label className**

Find (line ~57):
```
text-base font-bold tracking-tight uppercase text-text-primary
```
Replace with:
```
text-base font-semibold tracking-tight text-text-primary
```

- [ ] **Step 2: Replace the destructive label className**

Find (line ~58, inside the destructive condition):
```
text-base font-bold tracking-tight uppercase text-error
```
Replace with:
```
text-base font-semibold tracking-tight text-error
```

- [ ] **Step 3: Replace the default description className**

Find (line ~62):
```
text-3xs font-bold uppercase tracking-widest mt-0.5 opacity-60 text-text-secondary
```
Replace with:
```
text-xs mt-0.5 text-text-secondary
```

- [ ] **Step 4: Replace the destructive description className**

Find (line ~63):
```
text-3xs font-bold uppercase tracking-widest mt-0.5 opacity-60 text-error/80
```
Replace with:
```
text-xs mt-0.5 text-error/80
```

- [ ] **Step 5: Update label copy strings to Title Case**

In the `accountSections` array, find and update each `label` string exactly as shown:

| Before | After |
|---|---|
| `"Personal details"` | `"Personal Details"` |
| `"Active sessions"` | `"Active Sessions"` |
| `"Payment methods"` | `"Payment Methods"` |
| `"Show tour again"` | `"Show Tour Again"` |
| `"Recurring reminders"` | `"Recurring Reminders"` |
| `"Help center"` | `"Help Center"` |
| `"Close account"` | `"Close Account"` |
| `"Log out"` | `"Log Out"` |
| `"Reset onboarding (DEV)"` | `"Reset Onboarding (DEV)"` |

Leave unchanged: `"Appearance"`, `"Categories"`, `"Statements"` (already Title Case).

**Do NOT change any description strings** — they are already sentence case and just need the CSS removal from Steps 3–4.

- [ ] **Step 6: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/your-account/YourAccountPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(your-account): Title Case labels, sentence-case descriptions, remove uppercase"
```

---

### Task 3: Section rows grouped inside a card (Story 3)

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx` (section render JSX + AccountRow container)

This is the most structural change. Each section's rows are currently separated by `gap-1.5`. They need to be wrapped in a single card with internal dividers.

- [ ] **Step 1: Read the AccountRow container element**

Open `frontend/src/features/your-account/YourAccountPage.tsx` and find lines 39–75 (the `AccountRow` component). Locate the outermost element of its return statement — the element that wraps the icon + text content. Note its full `className` string. It will contain `group`, `rounded-xl`, `hover:bg-white`, and transition classes. You need this to change the hover style.

- [ ] **Step 2: Update the AccountRow container hover style**

In the AccountRow container element's className, make these replacements:
- Remove `rounded-xl` (the parent card's `overflow-hidden` clips corners already)
- Replace `hover:bg-white` with `hover:bg-surface-secondary`
- Remove `hover:shadow-xl` and `hover:shadow-primary/5` (the card's own shadow handles depth; per-row shadow fights it)

Keep all other classes unchanged (padding, gap, transition, group, disabled state, etc.).

- [ ] **Step 3: Find the row wrapper div inside the section map**

In the JSX where sections are mapped, find the `<div>` that wraps the `<AccountRow />` calls inside each section. It currently uses a `gap-1.5` class (or similar spacing). Its full className will look something like:

```
grid grid-cols-1 gap-1.5
```
or
```
flex flex-col gap-1.5
```

- [ ] **Step 4: Replace the row wrapper className**

Replace whatever gap-based class is on that wrapper div with:

```
bg-surface rounded-2xl shadow-sm overflow-hidden divide-y divide-border-subtle
```

This single change groups all rows into a card with internal hairline dividers and no rounded corners visible on individual rows (clipped by `overflow-hidden`).

- [ ] **Step 5: Verify divider behaviour**

After saving, open the dev server:

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run dev
```

Navigate to `http://localhost:5173/your-account`. Confirm:
- Each section's rows are inside one card block
- Hairline dividers appear between rows but NOT after the last row in each section
- No rounded corners on individual rows (overflow-hidden clips them)
- Hovering a row shows `bg-surface-secondary` feedback, not white

Stop the dev server (`Ctrl+C`) when done.

- [ ] **Step 6: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 7: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/your-account/YourAccountPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(your-account): group section rows inside rounded card with divide-y"
```

---

### Task 4: Section header typography (Story 4)

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx` (line ~462)

- [ ] **Step 1: Replace the section h3 className**

Find (line ~462):
```
text-3xs font-bold uppercase tracking-[0.2em] text-text-secondary opacity-40 mb-3 px-2
```
Replace with:
```
text-xs font-semibold text-text-secondary tracking-wide mb-3 px-2
```

Changes: `text-3xs` → `text-xs`, `font-bold` → `font-semibold`, remove `uppercase tracking-[0.2em] opacity-40`, add `tracking-wide`.

- [ ] **Step 2: Run typecheck**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/your-account/YourAccountPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(your-account): section headers text-xs font-semibold, remove uppercase opacity-40"
```

---

### Task 5: Desktop profile card refinements (Story 5)

**Files:**
- Modify: `frontend/src/features/your-account/YourAccountPage.tsx` (lines ~328–393)

Seven targeted changes to the desktop profile card. The mobile card (lines ~400+) is **out of scope — do not touch it**.

- [ ] **Step 1: Update the profile card container background**

Find (line ~328):
```
flex flex-col items-center text-center gap-5 bg-white rounded-2xl p-6 border border-border-subtle w-full shadow-sm
```
Replace with:
```
flex flex-col items-center text-center gap-5 bg-surface rounded-2xl p-6 border border-border-subtle w-full shadow-sm
```

Change: `bg-white` → `bg-surface` (dark-mode safe).

- [ ] **Step 2: Update the avatar container — add green ring, remove border, update font weight**

Find (line ~330):
```
h-20 w-20 rounded-full bg-surface-secondary overflow-hidden border-2 border-background flex items-center justify-center text-2xl font-bold text-text-primary shadow-inner
```
Replace with:
```
h-20 w-20 rounded-full bg-surface-secondary overflow-hidden ring-2 ring-primary/20 flex items-center justify-center text-2xl font-semibold text-text-primary shadow-inner
```

Changes: remove `border-2 border-background`, add `ring-2 ring-primary/20`, `font-bold` → `font-semibold`.

- [ ] **Step 3: Update the name h3**

Find (line ~353):
```
text-xl font-bold tracking-tight text-text-primary uppercase leading-none
```
Replace with:
```
text-xl font-semibold tracking-tight text-text-primary leading-none
```

Changes: `font-bold` → `font-semibold`, remove `uppercase`.

- [ ] **Step 4: Update the email p**

Find (line ~357):
```
text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-40 truncate
```
Replace with:
```
text-xs text-text-secondary truncate
```

- [ ] **Step 5: Update the stat labels (two instances)**

Find the "Member since" stat label (line ~367):
```
text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-40
```
Replace with:
```
text-xs text-text-secondary
```

Find the "Status" stat label (line ~375) — same className:
```
text-3xs font-bold uppercase tracking-widest text-text-secondary opacity-40
```
Replace with:
```
text-xs text-text-secondary
```

- [ ] **Step 6: Update the stat values (two instances)**

Find the memberSince value (line ~370):
```
text-3xs font-bold uppercase tracking-widest text-text-primary opacity-60
```
Replace with:
```
text-xs font-semibold text-text-primary
```

Find the "Active" status value (line ~378):
```
flex items-center gap-1.5 text-3xs font-bold uppercase tracking-widest text-success opacity-80
```
Replace with:
```
flex items-center gap-1.5 text-xs font-semibold text-success
```

- [ ] **Step 7: Update the desktop logout button className**

The logout `<Button>` component (line ~387) has a `className` prop override. Find:
```
w-full text-error hover:bg-error/5 hover:text-error hover:border-error/20 h-10 text-xs
```
Replace with:
```
w-full bg-error/5 border border-error/30 text-error hover:bg-error/10 h-10 text-xs
```

Changes: add `bg-error/5 border border-error/30` as resting state, change `hover:bg-error/5` to `hover:bg-error/10`, remove `hover:text-error hover:border-error/20` (now always applied).

- [ ] **Step 8: Run typecheck and lint**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck && npm run lint
```

Expected: both exit code 0.

- [ ] **Step 9: Commit**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" add frontend/src/features/your-account/YourAccountPage.tsx
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" commit -m "fix(your-account): desktop profile card — avatar ring, Title Case, red logout button"
```

---

### Task 6: Final verification and single-file audit

**Files:**
- Read: `frontend/src/features/your-account/YourAccountPage.tsx`

- [ ] **Step 1: Audit remaining font-bold instances in the file**

Run:
```bash
grep -n "font-bold" "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend/src/features/your-account/YourAccountPage.tsx"
```

Expected hits that are **in scope** (desktop-only, should already be fixed by Tasks 1–5):
- Line ~330 (desktop avatar div) — should now read `font-semibold`
- Line ~353 (desktop name h3) — should now read `font-semibold`
- Line ~357 (desktop email p) — should now be gone
- Lines ~367, ~375 (desktop stat labels) — should now be gone
- Lines ~370, ~378 (desktop stat values) — should now read `font-semibold`

**Out-of-scope `font-bold` hits** (mobile card — leave untouched):
- Line ~401 (mobile avatar div)
- Line ~416 (mobile name h1)
- Line ~425 (mobile email span)
- Line ~475 (mobile footer p)

If any in-scope `font-bold` remains, fix it now. Mobile hits are expected and correct.

- [ ] **Step 2: Confirm only one file changed**

```bash
git -C "/Users/johnlesterescarlan/Personal Projects/kaizen" diff --name-only HEAD~5..HEAD
```

Expected: only `frontend/src/features/your-account/YourAccountPage.tsx` appears across all 5 commits.

- [ ] **Step 3: Final typecheck and lint**

```bash
cd "/Users/johnlesterescarlan/Personal Projects/kaizen/frontend" && npm run typecheck && npm run lint
```

Expected: both exit code 0.

---

## Self-Review

**Spec coverage:**

| Story | Task |
|---|---|
| Story 1 — Green square icon containers | Task 1 |
| Story 2 — Title Case / sentence-case typography | Task 2 |
| Story 3 — Section rows in card | Task 3 |
| Story 4 — Section header refinement | Task 4 |
| Story 5 — Desktop profile card | Task 5 (7 sub-steps) |
| font-bold audit | Task 6 |

All 5 stories covered. No gaps.

**Placeholder scan:** No TBDs, no "similar to" references. Every class string is exact. Step 3.1 asks the engineer to read the file — this is necessary because the AccountRow container className was not captured in the pre-plan audit; all other steps have exact strings.

**Type consistency:** No new types, functions, or method names introduced — this is a class-string and copy-string edit only.
