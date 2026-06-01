# FAB Redesign — C Minimal + Standard Sizing

**Date:** 2026-06-01  
**File:** `frontend/src/shared/components/AddEntryFAB.tsx`  
**Status:** Approved

---

## Problem

The current FAB (`AddEntryFAB`) has three bugs and one visual inconsistency:

1. **Invisible icons (3 of 4 action buttons):** Action buttons use the same color for both background and icon text — `bg-primary text-primary`, `bg-success text-success`, `bg-warning text-warning`. Icons are completely invisible.
2. **Inconsistent brand colors:** Three different greens plus orange across four action buttons. No visual coherence.
3. **Off-brand trigger button:** The main `+` trigger is white/gray, mismatched from the rest of the design system.
4. **Oversized buttons:** Action buttons appear ~56–64px, making the FAB feel heavy and dominant on mobile.

---

## Design Decision

**Direction: C — Minimal**

- Action buttons: uniform dark charcoal (`bg-zinc-900`, `#18181b`) with white icons
- Trigger button: primary green (`bg-primary`, `#16a34a`) with white icon
- Only the trigger uses brand color — it's the clear visual entry point; sub-actions are neutral and subordinate

**Sizing: Standard**

- Action buttons: `w-11 h-11` (44px)
- Trigger button: `w-14 h-14` (56px)
- Clear size hierarchy between trigger and sub-actions; good tap target on mobile

---

## Changes

All changes are confined to `AddEntryFAB.tsx`. No other files touched.

### Trigger button
| Property | Before | After |
|---|---|---|
| Background | `bg-white` / `bg-surface` (white/gray) | `bg-primary` |
| Icon color | `text-gray-700` or similar | `text-white` |
| Size | ~`w-16 h-16` (64px) | `w-14 h-14` (56px) |

### Action buttons (all 4)
| Button | Before bg | Before icon | After bg | After icon |
|---|---|---|---|---|
| Add Transaction | `bg-primary` | `text-primary` ❌ invisible | `bg-zinc-900` | `text-white` |
| Create Budget | `bg-primary` | `text-text-primary` | `bg-zinc-900` | `text-white` |
| Create Goal | `bg-success` | `text-success` ❌ invisible | `bg-zinc-900` | `text-white` |
| Hold Purchase | `bg-warning` | `text-warning` ❌ invisible | `bg-zinc-900` | `text-white` |

All action buttons: size changed to `w-11 h-11` (44px).

---

## Out of Scope

- Animation / transition behavior — unchanged
- Label visibility logic (mobile: always show, desktop: hover-only) — unchanged
- FAB positioning — unchanged
- Dark mode treatment — unchanged (zinc-900 reads well in both light and dark)
- Any other component

---

## Acceptance Criteria

- [ ] All 4 action button icons are clearly visible (white on dark)
- [ ] All 4 action buttons use `bg-zinc-900` background
- [ ] Trigger button uses `bg-primary` with white icon
- [ ] Action buttons render at 44px (w-11 h-11)
- [ ] Trigger button renders at 56px (w-14 h-14)
- [ ] No other files modified
- [ ] No TypeScript errors
- [ ] FAB opens/closes and animations still work correctly
