# Design Plan: 30-Day Spending Graph

## Summary
Implementation of a compact, low-noise spending trend visualization for the home dashboard. The design follows "Variant F" from the Design Lab, combining an Area Chart's volume visualization with clear temporal context.

## Component Specification: `SpendingGraphCard`

### API / Props
```typescript
interface SpendingGraphCardProps {
  data: Array<{
    date: string;       // e.g., "Oct 12"
    amount: number;     // numeric value for chart
    fullDate: string;   // ISO string for keying
  }>;
  totalSpending: number;
  percentageChange?: number; // vs previous period
  isLoading?: boolean;
}
```

### Visual Requirements
- **Container:** `bg-surface`, `border-border`, `rounded-lg`.
- **Chart Type:** Recharts `AreaChart` with `monotone` curve.
- **Stroke:** `var(--color-primary)` (2px).
- **Fill:** Linear gradient `var(--color-primary)` at 20% opacity fading to 0%.
- **Grid:** Horizontal `CartesianGrid` only, using `var(--color-border-subtle)`.
- **X-Axis:** Visible every 7 days; `fontSize: 9px`, `var(--color-text-tertiary)`.
- **Y-Axis:** Hidden (to minimize noise).
- **Tooltip:** High-contrast dark background (`var(--color-text-primary)`), white text, primary accent for values.

## Implementation Steps

1.  **Data Layer:**
    - Create a custom hook `useSpendingAnalytics(days: 30)` to aggregate transaction data from Dexie/Redux.
    - Ensure dates are sorted chronologically and gaps (days with zero spend) are filled with `amount: 0`.

2.  **Component Foundation:**
    - Create `frontend/src/features/home/components/SpendingGraphCard.tsx`.
    - Implement the header section with Total Spend and the percentage change indicator.

3.  **Chart Implementation:**
    - Integrate `ResponsiveContainer` and `AreaChart`.
    - Apply the specific Recharts styling overrides identified in Variant F (defs, strokeWidth, tick interval).

4.  **Integration:**
    - Add the `SpendingGraphCard` to the main grid in the dashboard view.
    - Handle the empty state (no transactions in 30 days) with a placeholder or helpful illustration.

## Accessibility Checklist
- [ ] Add `role="region"` and `aria-label="Spending trend for the last 30 days"`.
- [ ] Ensure Tooltip is keyboard accessible (accessible via focus/hover).
- [ ] Verify contrast ratio for text on both light and dark themes (min 4.5:1).
- [ ] Add `aria-hidden="true"` to purely decorative chart elements (grid lines).

## Testing Guidance
- **Empty State:** Verify the chart renders a flat line or empty placeholder when no data exists.
- **Extreme Values:** Test with very large single-day spikes to ensure the Y-axis auto-scaling works without breaking the layout.
- **Responsive:** Verify the chart resizes correctly from mobile (portrait) to desktop (wide).
