# Design Plan: Wise Minimalist Transaction Form

## Summary

Redesign the "Add Transaction" form to move away from a centered card-based layout to a full-width, integrated experience inspired by the Wise (TransferWise) aesthetic. The design emphasizes information hierarchy, a massive hero amount section, and a clean grid for supporting metadata.

## Component API / Props

The existing `TransactionEntryForm` will be updated. No new props are required as it already supports `noCard`.

## Implementation Instructions

### 1. Update `TransactionEntryPage.tsx`

- Remove the `mx-auto max-w-2xl` constraint from the form container.
- Replace it with a `max-w-4xl` or similar "comfortable" full-width constraint to allow the form to breathe.

### 2. Refactor `TransactionEntryForm.tsx`

When `noCard` is enabled (or as the new default for the add/edit pages):

- **Type Toggle:** Replace the existing `TransactionTypeToggle` (which likely uses a button group) with a horizontal tab-style switcher with a bottom-border active indicator.
- **Hero Amount:**
  - Label: `text-sm font-medium leading-none text-foreground uppercase tracking-wider`.
  - Currency Prefix: `text-4xl font-semibold tracking-tight text-muted-foreground` (PHP).
  - Input: `text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-foreground`.
- **Form Grid:**
  - Use a `grid-cols-1 md:grid-cols-2` layout with generous gaps (`gap-x-16 gap-y-12`).
  - Use "Border-Bottom Only" inputs and selects for a cleaner, integrated look.
  - Labels: Standard project `label` role.
- **Action Button:**
  - Position: Left-aligned for desktop, full-width for mobile.
  - Style: `px-10 py-4 bg-[var(--ui-action-bg)] text-lg font-semibold rounded-xl`.

### 3. Styling Details

- Use `var(--ui-border-subtle)` for all separators and borders.
- Ensure all transitions use `var(--motion-standard)`.

## Accessibility Checklist

- [ ] Ensure all custom selects/inputs have proper `aria-label` or associated `<label>`.
- [ ] Verify tab order flows logically through the amount -> category -> method -> date -> note.
- [ ] Check contrast ratio for the `text-muted-foreground` currency prefix.
- [ ] Ensure the active state of the type switcher is perceivable by screen readers.

## Testing Guidance

- **Visual Regression:** Compare the new full-width layout across mobile and desktop breakpoints.
- **Input Validation:** Ensure the large amount input correctly handles decimal entry and doesn't break the layout with long numbers.
- **Interaction:** Verify the transition between Expense and Income correctly updates the active tab indicator.
