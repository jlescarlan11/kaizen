---
title: "Dynamic Onboarding UI Implementation Plan"
design_ref: "docs/maestro/plans/onboarding_dynamic_ui_20260330_design.md"
created: "2026-03-30T13:40:00Z"
status: "approved"
total_phases: 5
estimated_files: 8
task_complexity: "medium"
---

# Dynamic Onboarding UI Implementation Plan

## Plan Overview

- **Total phases**: 5
- **Agents involved**: `architect`, `coder`, `tester`
- **Estimated effort**: Medium. Refactoring core UI layout and steps for fluid responsiveness while maintaining TDD and design standards.

## Dependency Graph

```
[Phase 1: Prep]
      |
[Phase 2: Layout & Progress]
     / \
[Phase 3: Balance] [Phase 4: Budget]
     \ /
[Phase 5: Final Validation]
```

## Execution Strategy

| Stage | Phases | Execution | Agent Count | Notes |
|-------|--------|-----------|-------------|-------|
| 1     | Phase 1 | Sequential | 1 | Foundation & Audit |
| 2     | Phase 2 | Sequential | 1 | Layout Refactor |
| 3     | Phase 3, 4 | Parallel | 2 | Step Refactors |
| 4     | Phase 5 | Sequential | 1 | Final Test & Audit |

---

## Phase 1: Preparation & TDD Strategy

### Objective
Finalize the TDD strategy and audit existing design tokens for fluid scaling suitability.

### Agent: `architect`
### Parallel: No

### Files to Modify

- `frontend/src/shared/styles/layout.ts` — Add fluid spacing utilities if missing.

### Implementation Details
- Audit `shared/styles/layout.ts` for `clamp()` based utilities.
- Define the test plan for viewport-specific assertions.

### Validation
- `npm run lint`

### Dependencies
- Blocked by: None
- Blocks: Phase 2

---

## Phase 2: Onboarding Layout & Progress Indicator

### Objective
Implement the fluid `OnboardingLayout` and the new `StepProgress` component.

### Agent: `coder`
### Parallel: No

### Files to Create

- `frontend/src/features/onboarding/StepProgress.tsx` — Progress bar/dots component.
- `frontend/src/tests/onboarding-progress.test.tsx` — TDD for progress indicator.

### Files to Modify

- `frontend/src/features/onboarding/OnboardingLayout.tsx` — Refactor for fluid container and integrate `StepProgress`.

### Implementation Details
- `StepProgress` should take `current` and `total` props.
- `OnboardingLayout` should use a max-width container with fluid padding.

### Validation
- `CI=true npm test frontend/src/tests/onboarding-progress.test.tsx`

### Dependencies
- Blocked by: Phase 1
- Blocks: Phase 3, 4

---

## Phase 3: Dynamic Balance Setup Step

### Objective
Refactor the Balance Setup step for mobile-first fluid experience.

### Agent: `coder`
### Parallel: Yes

### Files to Modify

- `frontend/src/features/onboarding/BalanceSetupStep.tsx` — Optimize list, summary, and touch targets.
- `frontend/src/tests/onboarding-balance-step.test.tsx` — Update with viewport tests.

### Implementation Details
- Use `flex-col` on mobile, potentially `flex-row` or grid on desktop for payment methods.
- Ensure all inputs have `inputmode="decimal"`.
- Verify touch targets are >= 48px.

### Validation
- `CI=true npm test frontend/src/tests/onboarding-balance-step.test.tsx`

### Dependencies
- Blocked by: Phase 2
- Blocks: Phase 5

---

## Phase 4: Dynamic Budget Setup Step

### Objective
Refactor the Budget Setup step for mobile-first fluid experience.

### Agent: `coder`
### Parallel: Yes

### Files to Modify

- `frontend/src/features/onboarding/OnboardingBudgetStep.tsx` — Refine action bar and `AllocationBar`.
- `frontend/src/tests/onboarding-budget-step.test.tsx` — Update with viewport tests.

### Implementation Details
- Refine the sticky/fixed footer for mobile reachability.
- Ensure `ResponsiveModal` behaves correctly (drawer on mobile).

### Validation
- `CI=true npm test frontend/src/tests/onboarding-budget-step.test.tsx`

### Dependencies
- Blocked by: Phase 2
- Blocks: Phase 5

---

## Phase 5: Final Validation & Accessibility Audit

### Objective
Execute all viewport tests and conduct a final accessibility and design audit.

### Agent: `tester`
### Parallel: No

### Implementation Details
- Run full test suite across all onboarding features.
- Conduct final lint and type checks.

### Validation
- `npm test`
- `npm run lint`
- `npm run check` (if available for types)

### Dependencies
- Blocked by: Phase 3, 4
- Blocks: None

---

## File Inventory

| # | File | Phase | Purpose |
|---|------|-------|---------|
| 1 | `frontend/src/shared/styles/layout.ts` | 1 | Fluid spacing tokens |
| 2 | `frontend/src/features/onboarding/StepProgress.tsx` | 2 | Progress indicator |
| 3 | `frontend/src/tests/onboarding-progress.test.tsx` | 2 | TDD for progress |
| 4 | `frontend/src/features/onboarding/OnboardingLayout.tsx` | 2 | Fluid layout container |
| 5 | `frontend/src/features/onboarding/BalanceSetupStep.tsx` | 3 | Dynamic balance setup |
| 6 | `frontend/src/tests/onboarding-balance-step.test.tsx` | 3 | Viewport tests (Balance) |
| 7 | `frontend/src/features/onboarding/OnboardingBudgetStep.tsx` | 4 | Dynamic budget setup |
| 8 | `frontend/src/tests/onboarding-budget-step.test.tsx` | 4 | Viewport tests (Budget) |

## Risk Classification

| Phase | Risk | Rationale |
|-------|------|-----------|
| 2     | MEDIUM | Core layout changes can affect all onboarding steps. |
| 3     | LOW | Targeted refactor of balance step. |
| 4     | MEDIUM | Complex interactions in budget step (modals, fixed footers). |

## Execution Profile

```
Execution Profile:
- Total phases: 5
- Parallelizable phases: 2 (in 1 batch)
- Sequential-only phases: 3
- Estimated parallel wall time: 4-6 turns
- Estimated sequential wall time: 8-10 turns

Note: Native subagents currently run without user approval gates.
All tool calls are auto-approved without user confirmation.
```
