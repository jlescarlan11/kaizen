# FAB Redesign — C Minimal + Standard Sizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three invisible-icon contrast bugs, unify action button colors to dark charcoal, rebrand the trigger button to primary green, and right-size action buttons to 44px — all in a single file.

**Architecture:** Pure class-string substitution in `AddEntryFAB.tsx`. The `actions` array holds a `color` property per action; all four get replaced with `bg-zinc-900 text-white`. The trigger button className gets its background/border/text classes replaced with `bg-primary text-white`. Button size classes change from `h-14 w-14` (action) to `h-11 w-11`. No logic, animation, or behavior changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React (via `SharedIcon` registry)

---

## File Map

| File | Change |
|---|---|
| `frontend/src/shared/components/AddEntryFAB.tsx` | Only file modified — color + size class strings |

No other files are created or modified.

---

### Task 1: Read and map the current file

**Files:**
- Read: `frontend/src/shared/components/AddEntryFAB.tsx`

- [ ] **Step 1: Read the full file**

```bash
cat -n "frontend/src/shared/components/AddEntryFAB.tsx"
```

You are looking for four things:
1. The `actions` array — each item has an `icon`, `label`, `color`, and `onClick`. Note the exact `color` string for each of the four items.
2. The trigger `<button>` element — find the `className` prop and note every class used for background, border, and text color.
3. The action `<button>` element inside the map — find the size classes (`h-??` and `w-??`).
4. The trigger `<button>` element size classes — confirm it uses `h-14 w-14`.

Expected findings (confirm before proceeding):
- Add Transaction color: `bg-primary text-primary`
- Create Budget color: `bg-primary text-text-primary`
- Create Goal color: `bg-success text-success`
- Hold Purchase color: `bg-warning text-warning`
- Trigger background: contains `bg-surface` and `border-border`
- Action button size: `h-14 w-14`
- Trigger button size: `h-14 w-14`

---

### Task 2: Fix action button colors and sizes

**Files:**
- Modify: `frontend/src/shared/components/AddEntryFAB.tsx`

This task replaces the `color` string on all four actions and changes action button size from `h-14 w-14` to `h-11 w-11`.

- [ ] **Step 1: Update the `actions` array — all four color strings**

Find the `actions` array (the const/useMemo that defines the four items). Replace each `color` value:

| Before | After |
|---|---|
| `'bg-primary text-primary'` | `'bg-zinc-900 text-white'` |
| `'bg-primary text-text-primary'` | `'bg-zinc-900 text-white'` |
| `'bg-success text-success'` | `'bg-zinc-900 text-white'` |
| `'bg-warning text-warning'` | `'bg-zinc-900 text-white'` |

All four items end up with `color: 'bg-zinc-900 text-white'`.

- [ ] **Step 2: Update action button size**

In the JSX where action buttons are rendered (the `.map()` loop), find the button's size classes. Change:

```
h-14 w-14
```
to:
```
h-11 w-11
```

This applies **only to the action buttons inside the map** — not the trigger button.

- [ ] **Step 3: Verify the diff looks correct**

```bash
git -C "$(git rev-parse --show-toplevel)" diff frontend/src/shared/components/AddEntryFAB.tsx
```

Expected diff should show:
- Four `color:` lines changed from mixed colors → `bg-zinc-900 text-white`
- One size change: `h-14 w-14` → `h-11 w-11` on the action button element
- Nothing else changed

---

### Task 3: Rebrand the trigger button

**Files:**
- Modify: `frontend/src/shared/components/AddEntryFAB.tsx`

- [ ] **Step 1: Find the trigger button className**

Locate the main trigger `<button>` element (the one that toggles `isOpen`, has the `+` / close icon, and sits outside the `.map()`). Its `className` currently contains classes like `bg-surface`, `border-2`, `border-border`, `text-text-primary`.

- [ ] **Step 2: Replace background, border, and text color classes**

Remove these classes from the trigger button `className`:
- `bg-surface` (or `bg-surface-elevated` — whichever is present)
- `border-2` and `border-border` (both the border-width and border-color class)
- `text-text-primary`

Add these classes in their place:
- `bg-primary`
- `text-white`

Keep all other classes unchanged (size `h-14 w-14`, rounded, shadow, transition, aria attributes, etc.).

The resulting trigger button should have `bg-primary text-white` among its classes, with no `bg-surface`, `border`, or `text-text-primary` classes remaining.

- [ ] **Step 3: Verify the diff looks correct**

```bash
git -C "$(git rev-parse --show-toplevel)" diff frontend/src/shared/components/AddEntryFAB.tsx
```

Expected: trigger button className line(s) show the old surface/border/text-primary classes replaced with `bg-primary text-white`. No other lines changed beyond what Task 2 already showed.

---

### Task 4: Typecheck and lint

**Files:**
- No file changes — verification only

- [ ] **Step 1: Run TypeScript check**

```bash
cd frontend && npm run typecheck
```

Expected: exits with code 0, no errors. If it fails, the class string changes are pure strings — the only possible TS error is an accidental syntax mistake in the JSX. Fix any syntax issue before continuing.

- [ ] **Step 2: Run lint**

```bash
cd frontend && npm run lint
```

Expected: exits with code 0, zero warnings. If it flags an unused variable introduced by the edit, fix it. No other lint errors are expected from a class-string change.

---

### Task 5: Commit

**Files:**
- Stage: `frontend/src/shared/components/AddEntryFAB.tsx`

- [ ] **Step 1: Stage the file**

```bash
git add frontend/src/shared/components/AddEntryFAB.tsx
```

- [ ] **Step 2: Confirm only one file is staged**

```bash
git diff --cached --name-only
```

Expected output: exactly one line — `frontend/src/shared/components/AddEntryFAB.tsx`. If any other file appears, unstage it before committing.

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
fix(fab): C minimal redesign — zinc-900 actions, primary trigger, 44px size

- All 4 action buttons: bg-zinc-900 text-white (fixes green-on-green and
  orange-on-orange invisible icon bugs on Add Transaction, Create Goal,
  Hold Purchase; unifies Create Budget)
- Trigger: bg-primary text-white (replaces off-brand bg-surface/border)
- Action button size: h-14 w-14 → h-11 w-11 (44px, down from 56px)
- No animation, label, positioning, or behavior changes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage check:**

| Story | Covered by |
|---|---|
| Story 1 — Fix invisible icons | Task 2 Step 1 (all four color strings → `bg-zinc-900 text-white`) |
| Story 2 — Unify action button color | Task 2 Step 1 (all four set to identical string) |
| Story 3 — Rebrand trigger to primary green | Task 3 Steps 1–2 |
| Story 4 — Right-size actions to 44px | Task 2 Step 2 (`h-11 w-11`) |
| Story 5 — Single file, no regressions | Task 4 (typecheck + lint), Task 5 Step 2 (one-file diff check) |

All 5 stories covered. No gaps.

**Placeholder scan:** No TBDs, no TODOs, no "similar to Task N" references. All steps include exact class strings or exact commands.

**Type consistency:** No new types or function names introduced — this is a class-string edit only.
