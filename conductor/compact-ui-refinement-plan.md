# Compact UI Refinement Plan

## Objective
Refine the Kaizen Bento UI to be more "compact but comfortable." This involves switching the primary font to Inter to utilize space more efficiently, standardizing font sizes, and reducing excessive padding and border radiuses.

## Key Files & Context
- `frontend/index.html`: Font imports.
- `frontend/src/styles/globals.css`, `frontend/src/shared/styles/index.css`: Global typography definitions.
- `frontend/src/features/**/*.tsx`: Feature pages (Home, Transactions, Budgets, Insights, Account) using extreme padding/sizes.
- `frontend/src/shared/components/**/*.tsx`: Shared components (Card, Button, Input, etc.).

## Implementation Steps

### 1. Typography Overhaul (Switch to Inter)
- Update `index.html` to fetch the `Inter` font from Google Fonts.
- Update `globals.css` and `index.css` to use `Inter, sans-serif`.
- Globally replace excessive font weights: downgrade `font-black` (900) to `font-semibold` (600) or `font-bold` (700) for a cleaner, professional look.
- Revert icon `strokeWidth={3}` back to `2` or `2.5` to match the cleaner font.

### 2. Standardize Typography Scale
- Identify and reduce extreme font sizes (e.g., reduce `text-8xl` to `text-5xl`, `text-6xl` to `text-4xl`, `text-4xl` to `text-2xl` or `text-3xl`).
- Normalize uppercase tracking (e.g., tracking-widest is okay for tiny labels, but tracking-tighter on large headers should be adjusted for Inter).

### 3. Tighten Spacing & Padding
- Reduce Bento Card padding: Replace `p-8 md:p-10` and `p-8` with `p-5 md:p-6`.
- Reduce Bento Card border radiuses: Replace `rounded-[2.5rem]` and `rounded-[2rem]` with `rounded-2xl` or `rounded-[1.5rem]`.
- Reduce layout gaps: Replace `gap-10` and `space-y-12` with `gap-6` and `space-y-6`.
- Reduce Button and Input heights: Replace `h-14`/`h-16` with `h-11`/`h-12` and adjust vertical padding accordingly.

### 4. Verification & Testing
- Visually verify the Dashboard, Transactions List, Budget List, and Account pages to ensure the UI feels dense but readable.
- Confirm that the application is fully functional and responsive on mobile viewports.
