# FAB Redesign — C Minimal + Standard Sizing

**Date:** 2026-06-01
**File:** `frontend/src/shared/components/AddEntryFAB.tsx`
**Status:** Approved by user

---

## Summary

The Floating Action Button (`AddEntryFAB`) currently ships with three invisible-icon bugs (background and icon colors are identical on three of four action buttons), four inconsistent action-button colors, an off-brand trigger button, and oversized action buttons. This feature corrects all four problems in a single-file change to `frontend/src/shared/components/AddEntryFAB.tsx`: the trigger button becomes `bg-primary` (green, 56px) with a white icon to establish a clear visual entry point, and all four action buttons become `bg-zinc-900` (dark charcoal, 44px) with white icons for uniform, neutral sub-action presentation. No animations, label behavior, positioning, dark-mode treatment, or any other file is touched.

---

## Stories

### Story 1: Fix invisible icons on action buttons

**As a** Kaizen user, **I want** to see clear icons on every FAB action button, **so that** I can identify which action each button performs without guessing.

**Acceptance criteria**

- Given the FAB is closed, When I tap the trigger to open it, Then all four action buttons appear with icons that are visually distinct from their button background (white icon on dark background).
- Given the "Add Transaction" button is rendered, When I inspect its classes, Then it carries `bg-zinc-900` and `text-white` (replacing `bg-primary text-primary`).
- Given the "Create Goal" button is rendered, When I inspect its classes, Then it carries `bg-zinc-900` and `text-white` (replacing `bg-success text-success`).
- Given the "Hold Purchase" button is rendered, When I inspect its classes, Then it carries `bg-zinc-900` and `text-white` (replacing `bg-warning text-warning`).
- Given the "Create Budget" button is rendered, When I inspect its classes, Then it carries `bg-zinc-900` and `text-white` (replacing `bg-primary text-text-primary`).
- Given any of the four action buttons is rendered, When I look at the button, Then the Lucide icon rendered by `SharedIcon` is visible against its background at any viewport width.

**Out of scope**

- Changes to which icon (`receipt`, `wallet`, `target`, `hand`) is used for each action — icon names are unchanged.
- Any change to icon `size` prop (remains `20`).

---

### Story 2: Unify action button color across all four sub-actions

**As a** Kaizen user, **I want** all four action buttons to share the same visual style, **so that** the FAB feels like a coherent control rather than an assortment of unrelated buttons.

**Acceptance criteria**

- Given the FAB is open, When I view all four action buttons simultaneously, Then every action button background is the same dark charcoal color (`bg-zinc-900`, `#18181b`).
- Given the FAB is open, When I view all four action buttons simultaneously, Then no action button uses `bg-primary`, `bg-success`, or `bg-warning` as its background.
- Given the FAB is open, When I view all four action buttons simultaneously, Then every action button icon appears in white (`text-white`).
- Given the `actions` array in `AddEntryFAB.tsx`, When I read each item's `color` property, Then all four items share the identical string `'bg-zinc-900 text-white'`.

**Out of scope**

- Hover or active state color changes — existing transitions are unchanged.
- Label chip styling — unchanged.

---

### Story 3: Rebrand the trigger button to primary green

**As a** Kaizen user, **I want** the main FAB trigger to use the app's primary green color, **so that** the entry point is immediately recognizable as the primary action on the screen.

**Acceptance criteria**

- Given the FAB is in its closed (default) state, When the page renders, Then the trigger button displays with a green background matching `bg-primary` (`#16a34a` in light mode).
- Given the FAB is in its closed state, When I inspect the trigger button classes, Then it no longer contains `bg-surface`, `bg-white`, `border-border`, or `text-text-primary`.
- Given the trigger button is rendered, When I look at the `+` icon, Then the icon color is `text-white` and the icon is clearly visible against the green background.
- Given the FAB is open (trigger showing the `close` icon), When I look at the trigger button, Then it still uses `bg-primary` with a white close icon (the rotation animation is unchanged).
- Given a dark-mode context, When the page renders, Then the trigger button background resolves to `--color-primary` dark value (`#4ade80`) through the existing design token.

**Out of scope**

- The `rotate-45` open-state animation on the trigger — unchanged.
- The `aria-expanded` and `aria-label` toggle behavior — unchanged.

---

### Story 4: Right-size the action buttons to 44px

**As a** Kaizen user on a mobile device, **I want** the action buttons to be compact (44px) rather than oversized (56px), **so that** the FAB feels proportional and does not dominate the screen when open.

**Acceptance criteria**

- Given the FAB is open, When I measure any action button's rendered size, Then its height and width are 44px (`w-11 h-11` in Tailwind = `2.75rem`).
- Given the FAB action button markup, When I inspect the button element's class list, Then it contains `h-11 w-11` and does not contain `h-14 w-14` or `h-16 w-16`.
- Given the trigger button markup, When I inspect the trigger element's class list, Then it retains `h-14 w-14` (56px) — the trigger is larger than the action buttons.
- Given the FAB is open on a mobile viewport (≤ 768px), When I look at the trigger alongside the action buttons, Then there is a clear size difference between the 56px trigger and the 44px action buttons.

**Out of scope**

- Changing the trigger button size — remains `h-14 w-14`.
- Gap spacing between action buttons — unchanged.
- Shadow classes — unchanged.

---

### Story 5: Confine all changes to a single file with no regressions

**As a** frontend engineer, **I want** the redesign to touch only `AddEntryFAB.tsx` and leave all runtime behavior intact, **so that** the change can be reviewed and shipped with confidence and minimal blast radius.

**Acceptance criteria**

- Given the git diff of this change, When I count the files modified, Then exactly one file is changed: `frontend/src/shared/components/AddEntryFAB.tsx`.
- Given the updated component, When I run `npm run typecheck`, Then the command exits with code 0 and no TypeScript errors.
- Given the updated component, When I run `npm run lint`, Then the command exits with code 0 and zero warnings.
- Given the FAB is open, When I tap an action button, Then the FAB closes and the corresponding callback fires — same as before.
- Given the FAB is closed, When I tap the trigger, Then the four action buttons animate upward (opacity + translateY + scale, 300ms) — animation classes are unchanged.
- Given the FAB is open, When I tap the trigger again, Then the FAB closes with the same reverse animation — no regression.

**Out of scope**

- Changes to `IconRegistry.tsx`, `IconConstants.ts`, `globals.css`, `index.css`, or any other file.
- Adding automated component tests.
- Dark-mode-specific overrides for `bg-zinc-900`.
