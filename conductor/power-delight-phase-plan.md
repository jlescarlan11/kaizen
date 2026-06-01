# Dashboard Power & Delight Plan (Phases 13-16)

## Objective
To refine the user experience with power-user tools and "delight" features that increase engagement and privacy.

## Implementation Steps

### Phase 13: Privacy Mode & Global UI State
- **UI Store:** Create `frontend/src/app/store/uiSlice.ts` to manage `isPrivacyMode`.
- **Currency Component:** Create a `Money.tsx` shared component that blurs values when `isPrivacyMode` is true.
- **Global Toggle:** Add a "Lock/Unlock" icon in the `HomeDashboardHeader` to toggle privacy globally.

### Phase 14: Wealth Persona & Savings Streaks
- **Persona Hook:** Create `useWealthPersona.ts` to analyze:
  - Savings Rate > 20%: "The Accumulator"
  - Net Flow > $0: "The Cash Flow King"
  - Tasks = 0: "Data Perfectionist"
- **Streak Logic:** Count consecutive days with $0 spend (Savings Streak).
- **Component:** `WealthPersonaCard.tsx` (Bento component).

### Phase 15: Subscription Watchdog
- **Data Hook:** `useSubscriptionWatchdog.ts`.
  - Filters transactions for `isRecurring: true`.
  - Finds "Potential Subscriptions" by grouping by name + amount.
- **Component:** `SubscriptionWatchdogCard.tsx`.
- **Action:** Allow users to "Verify" or "Mark as Sub" directly from the card.

### Phase 16: Command Palette (Cmd+K)
- **Palette Component:** `CommandPalette.tsx` using `@headlessui/react`.
- **Hotkeys:** Listen for `Cmd+K` or `Ctrl+K`.
- **Actions:** 
  - `t`: Add Transaction
  - `p`: Toggle Privacy Mode
  - `s`: Search Transactions
  - `/`: Go Home

### Phase 17: Final Grid Polish
- **Action:** Integrate the final set of components.
- **New Structure:**
  - **Hero:** Balance + Sparkline + **Privacy Toggle**.
  - **Top Row:** `SpendingGraphCard` + `WealthPersonaCard` (New).
  - **Mid Row:** `WalletBento` + `FinancialIntelligenceCard`.
  - **Bottom Row:** `SubscriptionWatchdog` + `ActionCenterCard`.
  - **Feed:** `UpcomingBills` + `TimelineActivity`.

## Verification
- Verify `Cmd+K` doesn't conflict with browser defaults.
- Ensure blurring in Privacy Mode is accessible (values hidden from screen readers too via `aria-hidden` or specific labels).
- Check that "Subscription" detection handles minor amount variations (e.g., currency conversion).