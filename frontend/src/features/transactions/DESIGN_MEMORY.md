# Design Memory: Transaction Form Redesign

## Overview

The "Add Transaction" form was redesigned in May 2026 to better utilize screen space and provide a more premium, focused user experience. The design was inspired by **Wise**, focusing on clarity of numerical data and functional minimalism.

## Extracted Color Palette

The design utilizes the core semantic tokens defined in `globals.css`:

- **Active Type (Expense):** `var(--color-expense)`
- **Active Type (Income):** `var(--color-income)`
- **Action Background:** `var(--ui-action-bg)`
- **Borders/Separators:** `var(--ui-border-subtle)`
- **Secondary Text:** `var(--ui-text-muted)`

## Typography Decisions

We mapped the new form elements to the project's standard typography roles:

- **Major Labels:** `label` (text-sm font-medium)
- **Amount Prefix:** `h2` (text-4xl font-semibold)
- **Amount Value:** `display`/`h1` (text-5xl/6xl font-semibold)
- **Field Values:** `h4`/`body-lg` (text-lg)

## Component Patterns

- **Full-Width Integration:** Moving away from "Forms-in-Cards" towards "Forms-as-the-Page". This pattern should be considered for other high-intent pages like Budget Creation.
- **Hero Inputs:** Using extremely large typography for the primary data point (Amount) to reduce cognitive load and emphasize the action.
- **Understated Meta-data:** Using border-bottom inputs for secondary fields to reduce visual noise and maintain a "sheet" or "ledger" feel.
