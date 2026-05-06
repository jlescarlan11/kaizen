# Design Plan: Kaizen Bento UI

## Overview
A complete UI/UX overhaul for Kaizen, moving to a **Student-Focused Bento Box** layout. This design combines the minimal, functional clarity of Wise with a playful, high-energy aesthetic tailored for students tracking finances.

## Visual Language
- **Layout:** 12-column responsive bento grid.
- **Typography:** `Poppins` (Bold/Black for headers, Medium/Regular for body).
- **Radius:** Large, pill-like corners (`2.5rem` / `40px` for main cards, `1rem` / `16px` for nested items).
- **Tokens:** Simplified to a core set of semantic variables (Background, Surface, Primary, Text).

## Implementation Steps

### 1. Token Simplification
- Consolidate `globals.css` to remove redundant role-based tokens.
- Maintain Light/Dark mode support using a leaner set of variables.
- Standardize the `Poppins` scale.

### 2. Global Shell Refactor
- Update `ShellLayout.tsx` and `RootLayout.tsx` to support the bento grid container.
- Implement a responsive navigation system (Sidebar for Desktop, Bottom Bar for Mobile).

### 3. Core Feature Migrations
- **Dashboard:** Implement the Hero Balance card and Quick Actions.
- **Transactions:** Move to the clean, high-proximity list style from Variant F.
- **Budgets:** Implement the simplified "Goal Progress" bars.

### 4. Accessibility Checklist
- [ ] Ensure `2.5rem` rounded corners don't clip focus rings.
- [ ] Contrast check for `#56c87b` (Primary) against white and dark backgrounds.
- [ ] Maintain logical tab order through the bento grid.

## Testing Guidance
- Verify layout responsiveness at `320px`, `768px`, and `1200px` breakpoints.
- Test "Quick Add" interaction flow (ensure it's the fastest path).
- Validate Dark Mode legibility across all bento cards.
