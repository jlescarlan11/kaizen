# Account Page Visual Redesign

**Date:** 2026-06-01
**File:** `frontend/src/features/your-account/YourAccountPage.tsx` (+ AccountRow sub-component if separate)
**Status:** Approved by user

---

## Summary

The Account page (`/your-account`) receives a visual polish pass across its two-column layout. Icon containers change from circular bordered shapes to square `rounded-[9px]` tiles with a brand-green tint background (`bg-primary/5`) and `text-primary` icon stroke. Row labels and descriptions drop ALL-CAPS in favour of Title Case and sentence case respectively. Each section's rows are grouped inside a single white card (`bg-surface rounded-2xl shadow-sm overflow-hidden`) with internal dividers. Section headers gain slightly more visual weight. The desktop profile card is refined with a green avatar ring, softened casing on name/email/stat labels, and a destructive-tinted logout button. No routing, data, animation, mobile/desktop layout structure, or sub-page behaviour changes.

---

## Stories

### Story 1: Brand-green square icon containers on account rows

**As a** signed-in user browsing the Account page, **I want** each setting row's icon to sit inside a soft green-tinted square tile, **so that** the icon language feels consistent with the app's primary brand colour rather than appearing as a generic grey pill.

**Acceptance criteria**

- Given I am on `/your-account` and any `AccountRow` is visible, When the page renders, Then every non-destructive icon container has `border-radius` equivalent to `rounded-[9px]` and no visible border stroke.
- Given I am on `/your-account`, When the page renders, Then every non-destructive icon container has a background of `bg-primary/5` (green tint).
- Given I am on `/your-account`, When the page renders, Then every non-destructive icon renders with `text-primary` stroke colour.
- Given the "Close account" row (or any row with `destructive: true`) is visible, When the page renders, Then its icon container retains `bg-error/10` with `text-error` stroke and is not affected by the green-tint rule.
- Given I switch to dark mode, When I return to `/your-account`, Then the icon containers still render with the correct dark-mode resolved value of `bg-primary/5` (no hard-coded hex values).

**Out of scope**

- Changing icon shapes, SVG paths, or stroke width.
- Applying this container change to icons outside `AccountRow`.

---

### Story 2: Title Case / sentence-case row typography

**As a** signed-in user reading the Account settings list, **I want** row labels to appear in Title Case and descriptions in sentence case, **so that** the settings list reads naturally and aligns with standard UI text conventions.

**Acceptance criteria**

- Given I am on `/your-account`, When the page renders, Then every `AccountRow` label renders in Title Case (e.g., "Personal Details", "Show Tour Again") with no `uppercase` class applied to the label element.
- Given I am on `/your-account`, When the page renders, Then every `AccountRow` description renders in sentence case (e.g., "Name, email, and profile photo") with no `uppercase` or `tracking-widest` class.
- Given the label for a destructive row (e.g., "Close Account") is visible, When the page renders, Then it also renders in Title Case with `text-error` colour preserved.
- Given the description for a destructive row is visible, When the page renders, Then it also renders in sentence case with its error-tint colour preserved.
- Given the `AccountRow` description currently uses `uppercase tracking-widest opacity-60`, When the redesign is applied, Then the description instead uses `text-xs text-text-secondary` without `uppercase` or `tracking-widest`.

**Out of scope**

- Changing section header casing (covered in Story 4).
- Changing the profile card name/email casing (covered in Story 5).
- Altering copy strings — only CSS treatment changes.

---

### Story 3: Section rows grouped inside a white rounded card

**As a** signed-in user scanning the Account settings page, **I want** all rows within a section to sit inside a unified card with subtle shadow, **so that** each settings group reads as a cohesive block.

**Acceptance criteria**

- Given I am on `/your-account`, When the page renders, Then each section's row list is wrapped in a single container with `bg-surface rounded-2xl shadow-sm overflow-hidden`.
- Given a section has more than one row, When the page renders, Then a visible divider (`border-b border-border-subtle`) separates adjacent rows, and no divider appears after the last row.
- Given a section has exactly one row, When the page renders, Then the card renders without any divider.
- Given I am in dark mode, When the page renders, Then the card background resolves correctly via `bg-surface` (dark: `#1c1c1e`) — not hard-coded `bg-white`.
- Given I hover any interactive row inside a card, When the hover state triggers, Then visible hover feedback is preserved without clashing with the card background.

**Out of scope**

- Changing grid layout, section count, or spacing between sections.
- Changing any row's routing or interactive behaviour.

---

### Story 4: Section header typography refinement

**As a** signed-in user glancing at the Account page, **I want** section headers to be slightly more readable, **so that** I can quickly locate the group I'm looking for.

**Acceptance criteria**

- Given I am on `/your-account`, When the page renders, Then each section header uses `text-xs font-semibold text-text-secondary tracking-wide` (replacing current tiny, low-opacity all-caps style).
- Given the section headers are updated, When the page renders in light and dark mode, Then the headers do not carry `opacity-40` or any opacity that reduces contrast below 3:1.
- Given the page renders, When I inspect the section headers, Then they no longer carry `uppercase` in their class list.

**Out of scope**

- Changing which sections exist or their title text content.
- Changing section header HTML element type (remains `<h3>`).

---

### Story 5: Desktop profile card visual refinements

**As a** signed-in user viewing the desktop Account page, **I want** the profile card to display my name in Title Case, a green avatar ring, readable stat labels, and a clearly destructive logout button, **so that** the card feels polished and the logout action is visually distinct.

**Acceptance criteria**

- Given I am on `/your-account` on a viewport wider than 640 px, When the page renders, Then the avatar container has `ring-2 ring-primary/20` applied.
- Given the desktop profile card renders, When I inspect the name element, Then it uses `font-semibold` with no `uppercase` class, displaying in Title Case.
- Given the desktop profile card renders, When I inspect the email element, Then it uses normal lowercase text with no `uppercase` or `tracking-widest` class.
- Given the desktop profile card renders, When I inspect the stat labels ("Member since", "Status"), Then they use sentence case, `text-text-secondary`, `text-xs`, with no `uppercase` class.
- Given the desktop profile card renders, When I inspect the stat value ("April 2026"), Then it uses Title Case, `font-semibold`, `text-text-primary`, with no `uppercase` class.
- Given I view the desktop logout button, When the page renders, Then it has `bg-error/5 border-error/30 text-error` and does not use a neutral button style as its resting state.
- Given the desktop profile card container, When the page renders, Then it uses `rounded-2xl shadow-sm`.

**Out of scope**

- Mobile profile hero card (separate layout branch, not in scope).
- Implementing the photo upload flow.
- Changing the logout confirmation modal or mutation behaviour.
- Adding or removing stat fields from the profile card.
