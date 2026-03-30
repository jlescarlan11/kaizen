---
title: "Dynamic Onboarding UI Improvement"
created: "2026-03-30T13:30:00Z"
status: "approved"
authors: ["TechLead", "User"]
type: "design"
design_depth: "deep"
task_complexity: "medium"
---

# Dynamic Onboarding UI Design Document

## Problem Statement

The onboarding UI (Balance and Budget setup) lacks dynamic responsiveness, causing issues with certain screen views and not fully catering to both mobile and non-mobile devices. The current layout is static and does not follow the project's "Flat Out" design philosophy for modern, fluid interactions.

## Requirements

### Functional Requirements

1. **REQ-1**: **Responsive Layout**: Implement a fully fluid container in `OnboardingLayout.tsx` that adapts to screen sizes from 320px up to 1440px+. (Traces To: User Request)
2. **REQ-2**: **Progress Indicator**: Add a clear, accessible progress indicator (e.g., "Step 1 of 2") to guide users through the flow. (Traces To: Spec)
3. **REQ-3**: **Mobile-First Optimization**: All interactive elements (buttons, cards, inputs) must be touch-friendly with a minimum 48px height. (Traces To: Spec)
4. **REQ-4**: **Adaptive Modals**: Budget editing must use a responsive modal that behaves like a bottom drawer on mobile. (Traces To: Acceptance Criteria)
5. **REQ-5**: **Automated Validation**: Verify the dynamic behavior across mobile (375px), tablet (768px), and desktop (1440px) using automated viewport tests. (Traces To: User Choice)

### Non-Functional Requirements

1. **REQ-N1**: **Flat Out Design**: Maintain clean borders, minimalist typography, and zero shadows/elevations. (Traces To: Coding Standards)
2. **REQ-N2**: **Accessibility**: Strict adherence to WCAG standards for touch targets and contrast. (Traces To: Coding Standards)
3. **REQ-N3**: **Performance**: Zero layout shifts during fluid resizing. (Traces To: Design Goal)

### Constraints

- **TDD Requirement**: All changes must follow a Red-Green-Refactor cycle.
- **Tech Stack**: Must use Tailwind CSS and React 19.

## Approach

### Selected Approach

**Hybrid Fluid Approach**

Standard layout breakpoints with fluid typography and key spacing adjustments.

[decision] Refactor `OnboardingLayout` to include a new `StepProgress` component. — *Rationale: Provides a centralized, reusable progress indicator and ensures consistency.*
*(considered: Apply fluid styles directly to each step component — rejected because it leads to code duplication and maintenance issues.)* (Traces To: REQ-1, REQ-2)

[decision] Use standard Tailwind breakpoints for structural layout changes. — *Rationale: Maintains a predictable structure for complex components like budget lists.*
*(considered: Use fluid scaling with clamp() for all layout dimensions — rejected because it can lead to difficult-to-test and unpredictable UI on edge-case screens.)* (Traces To: REQ-1)

[decision] Implement fluid scaling with `clamp()` for typography and section gaps. — *Rationale: Provides a smooth, premium feel across varying devices.*
*(considered: Standard Tailwind responsive utility classes for text size — rejected because the user explicitly requested a "fully fluid layout" which is better achieved with scaling.)* (Traces To: REQ-1)

### Decision Matrix

| Criterion | Weight | Hybrid Fluid Approach | Full Fluid Scaling | Standard Utility Approach |
|-----------|--------|-----------------------|--------------------|---------------------------|
| **Responsiveness** | 40% | 5: Smooth and predictable. | 5: Most fluid, but can be unpredictable. | 3: Steppy transitions. |
| **Maintainability** | 30% | 4: Combines familiar Tailwind with scaling logic. | 2: Complex CSS logic. | 5: Pure Tailwind. |
| **User Experience** | 30% | 5: Premium feel with stable structure. | 4: Excellent but can be risky on mobile. | 3: Good but not "dynamic." |
| **Weighted Total** | | **4.7** | **4.1** | **3.6** |

## Architecture

### Component Diagram

```
[OnboardingLayout]
  ├── [StepProgress] (New)
  └── [Children]
        ├── [BalanceSetupStep] (Refactored for mobile)
        └── [OnboardingBudgetStep] (Refactored for mobile)
              ├── [AllocationBar] (Fluid spacing)
              └── [ResponsiveModal] (Adaptive behavior)
```

### Data Flow

- `onboardingSlice` provides `currentStep`.
- `OnboardingLayout` renders the appropriate children and updates `StepProgress`.
- Step components respond to viewport changes via Tailwind and fluid spacing.

### Key Interfaces

```typescript
// Proposed StepProgress Component
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

// Fluid spacing utility example (in layout.ts)
export const fluidSpacing = {
  sectionGap: 'clamp(1.25rem, 5vw, 2.5rem)',
} as const;
```

## Agent Team

| Phase | Agent(s) | Parallel | Deliverables |
|-------|----------|----------|--------------|
| 1     | `architect` | No | Finalized design audit & TDD strategy. |
| 2     | `coder` | No | Refactored `OnboardingLayout` & `StepProgress`. |
| 3     | `coder` | Yes | Refactored `BalanceSetupStep`. |
| 4     | `coder` | Yes | Refactored `OnboardingBudgetStep`. |
| 5     | `tester` | No | Automated viewport tests. |

## Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Unpredictable UI scaling on ultra-wide or tiny screens. | MEDIUM | MEDIUM | Implement rigid min/max bounds in `clamp()`. |
| Layout shifts during font loading. | LOW | LOW | Use system-font fallbacks or early pre-loading. |
| Mobile touch target conflicts. | HIGH | LOW | Enforce a strict 48px minimum height for all actions via automated tests. |

## Success Criteria

1. Onboarding flow displays a clear progress indicator.
2. Layout transitions smoothly across viewports without breaking elements.
3. All interactive elements meet the 48px minimum touch target.
4. Budget editing modal behaves correctly on both mobile (drawer) and desktop (modal).
5. All automated viewport tests pass for 375px, 768px, and 1440px.
