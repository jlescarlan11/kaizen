# Profile XP Page — Design Spec

**Date:** 2026-05-10
**Route:** `/your-account/xp`
**Entry point:** "Profile XP →" button in `WealthProfileCard` on the dashboard

---

## Overview

A dedicated gamification progress page that makes the "Profile XP" dashboard link meaningful. XP is computed entirely client-side from existing financial data — no new backend endpoints required. The page shows the user's wealth-building level, persona, streak, and a grid of unlockable milestone badges.

---

## XP Formula

XP is derived from four sources, all available from existing hooks:

```
xp = (savingsRate × 10)                           // 0–1,000
   + (streak × 50)                                 // 0–350
   + (netFlow > 0 ? Math.min(netFlow / 10, 500) : 0)  // 0–500
   + (tasks.length === 0 ? 200 : 0)               // 0–200 clean-record bonus
```

**Max theoretical XP:** ~2,050

---

## Level Tiers

| Level | Title | XP Range |
|---|---|---|
| 1 | The Student | 0–299 |
| 2 | Saver | 300–599 |
| 3 | Wealth Builder | 600–999 |
| 4 | Wealth Architect | 1,000–1,499 |
| 5 | Financial Master | 1,500+ |

Level 5 has no "next level" — the XP bar shows total XP with a "Max Level" label.

---

## Milestones (10 total)

All milestones are computed live from current session data. No historical state needed.

| Emoji | Name | Unlock Condition |
|---|---|---|
| 🌱 | First Steps | Always unlocked (the "you're here" badge) |
| 💰 | First Save | `savingsRate > 0` |
| 📈 | Cash Flow+ | `netFlow > 0` |
| ⚡ | Trending Up | `isImproving === true` |
| 🎯 | Power Saver | `savingsRate > 30` |
| 🔥 | 3-Day Streak | `streak >= 3` |
| 🧘 | 7-Day Streak | `streak >= 7` |
| ✨ | Zero Tasks | `tasks.length === 0` |
| 👑 | Level 4 | `xp >= 1,000` |
| 🏆 | Financial Master | `xp >= 1,500` |

Locked milestones render at 40% opacity with grayscale filter. No tooltip or hint text — the name is self-explanatory.

---

## Page Layout (4 sections, top to bottom)

### 1. XP Hero Card
- Circular level badge (gradient purple, white number) on left
- Level title + "Level N" pill + total XP + XP to next level on right
- Full-width XP progress bar below — shows position between current and next level thresholds
- Subtle purple radial glow in top-right corner (aesthetic, matches dashboard card style)

### 2. Persona + Streak (2-column grid)
- **Persona card:** Icon in rounded square + archetype name + description. Uses existing `personaData` from `useWealthPersona`.
- **Streak card:** Large streak number + 7-segment dot bar + "N days to [next locked streak badge]" hint. If `streak < 3` → "X days to 3-Day Streak". If `streak >= 3 && streak < 7` → "X days to 7-Day Streak". If `streak >= 7` → "Max streak reached 🎉". Dot bar fills left-to-right based on `streak` count.

### 3. XP Breakdown
- Line-item table: Savings Rate, Net Flow, No-Spend Streak, Clean Record Bonus
- Each row: colored dot + label + computed value in parens + XP contribution right-aligned
- Horizontal divider + bold Total row at bottom
- Educates the user on how their score is built — transparency by design

### 4. Milestones Grid
- 5-column grid, 2 rows (10 badges total)
- Unlocked: purple-tinted background, colored border, full opacity emoji
- Locked: grey background, grey border, grayscale emoji, 40% opacity

---

## Data Layer

### `useProfileXP` hook
Location: `features/your-account/hooks/useProfileXP.ts`

Composes three existing hooks:
- `useWealthHealth()` → `{ analytics: { savingsRate, netFlow, netFlowChange, isImproving }, isLoading }`
- `useWealthPersona()` → `{ persona, description, icon, streak } | null`
- `useActionCenter()` → `{ tasks }`

Returns:
```ts
{
  xp: number
  level: number             // 1–5
  levelTitle: string
  xpForCurrentLevel: number // lower bound of current level tier
  xpForNextLevel: number | null  // null at Level 5
  progressPercent: number   // 0–100 within current level band
  milestones: Array<{ emoji: string; name: string; unlocked: boolean }>
  persona: { persona: string; description: string; icon: string; streak: number } | null
  breakdown: Array<{ label: string; value: string; xp: number; color: string }>
  isLoading: boolean
}
```

### No new API calls
All data derives from existing RTK Query cache entries already populated by the dashboard. Opening this page from the dashboard adds zero new network requests.

---

## File Changes

### New files
| File | Purpose |
|---|---|
| `features/your-account/hooks/useProfileXP.ts` | XP computation hook |
| `features/your-account/ProfileXPPage.tsx` | Page shell (same pattern as `ProfilePage`) |
| `features/your-account/ProfileXPDisplay.tsx` | All visual content |

### Modified files
| File | Change |
|---|---|
| `app/router/router.tsx` | Add lazy import + `your-account/xp` route (same `ProtectedRoute` pattern) |
| `features/home/components/WealthProfileCard.tsx` | Change `navigate('/your-account/profile')` → `navigate('/your-account/xp')` |

---

## Design Tokens

Follows existing dashboard card conventions:
- Card shell: `bg-surface border border-border-subtle rounded-2xl shadow-sm`
- Section labels: `text-[9px] font-black uppercase tracking-widest text-text-tertiary opacity-50`
- XP accent: `text-primary` / `bg-primary/10` / `border-primary/20`
- Locked state: `opacity-40 grayscale`
- Level badge gradient: inline style `linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, white))` — no new token needed

---

## Edge Cases

- **No persona data** (analytics still loading): show skeleton for persona card; streak card shows `0d`
- **Level 5 reached:** XP bar shows total XP, label reads "Max Level — Financial Master", no "XP to next level" line
- **Zero XP** (new user, no transactions): show Level 1, empty progress bar, all milestones locked except none (First Steps requires transactions)
- **Negative net flow:** net flow XP contribution is 0, not negative — XP never decreases
