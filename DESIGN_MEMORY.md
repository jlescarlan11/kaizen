# Design Memory: Split Transaction Activity Page

This document records the design decisions and patterns established for the Transaction Activity page redesign.

## Visual Identity
- **Inspiration:** Hybrid of Wise (Account Cards), Apple (Bento Layout), and WaniKani (Dashboard Focus).
- **Core Theme:** Split Activity Stream.
- **Tone:** Compact, Minimalist, Student-focused.

## Design Tokens (Shared)
- **Primary Colors:** 
  - `primary`: `#56c87b` (Global Action)
  - `success`: `#2f8f4e` (Income)
  - `error`: `#c84b42` (Expenses)
- **Radii:**
  - Bento Containers: `rounded-[2.5rem]`
  - Row Elements: `rounded-2xl`
- **Typography:**
  - Descriptions: Semi-bold (avoiding Black/Super Bold for long lists).
  - Amounts: Bold with tight tracking (`tracking-tight`).

## Component Patterns
- **ActivityListCard:** A high-level bento container that wraps a specific stream of transactions. Includes a header with title, badge, and summary total.
- **ActivityRow:** A horizontal list item pattern using large icons and decoupled date/description layout.
- **AnalyticsCard:** A compact dashboard pattern used for visualizations. Characterized by a `bg-surface-secondary` header, monospace numeric displays, and high-density content.
- **Low-Noise Charts:** A specific configuration for Recharts that hides Y-axes and uses subtle horizontal grids to focus on trends rather than precise values.

## UX Principles
1. **Side-by-Side Clarity:** On large screens, Income and Expenses are visible simultaneously to provide immediate context of cash flow balance.
2. **Minimalist Grouping:** Grouping is achieved through container radius and whitespace rather than heavy backgrounds or borders between items.
3. **No-Toggle Interaction:** Users should not have to click a button to switch between seeing what they earned and what they spent.
4. **Trend over Precision:** Dashboard charts should prioritize visualizing the "shape" of data over individual data points, using tooltips only when precise lookup is required.
