# Specification: Dynamic Onboarding UI Improvement

## 1. Overview
Improve the onboarding UI to be fully dynamic and responsive, catering to both mobile and non-mobile users while maintaining the project's "Flat Out" design philosophy. The focus is on the `BalanceSetupStep` and `OnboardingBudgetStep`.

## 2. Functional Requirements
*   **Responsive Onboarding Layout:**
    *   Implement a **Fully Fluid Layout** that adapts seamlessly to various screen sizes.
    *   Add a **Progress Indicator** to show the user's position in the two-step flow (Balance -> Budget).
*   **Mobile-First Optimized Experience:**
    *   Redesign layouts to be mobile-first, ensuring all interactive elements are easily accessible (thumb-friendly).
    *   Use adaptive UI components (Modals/Drawers) for complex inputs like budget editing.
*   **Enhanced Balance Setup:**
    *   Optimize the payment method list for mobile using larger touch targets and a more card-like structure within the "Flat Out" style.
    *   Ensure the "Total Starting Funds" and "Continue" button are prominently placed and easily reachable.
*   **Enhanced Budget Setup:**
    *   Improve the "Allocation Bar" visibility and clarity across devices.
    *   Refine the fixed action bar on mobile to provide clear feedback and easy access to "Finish setup."
*   **Touch Controls:**
    *   Standardize button heights (minimum 48px for primary actions) and spacing to prevent accidental taps.
    *   Verify and ensure all numeric inputs use `inputmode="decimal"`.

## 3. Non-Functional Requirements
*   **Flat Out Design:** Maintain clean borders, minimalist typography, and zero shadows/elevations.
*   **Accessibility (WCAG):** Ensure all touch targets are at least 44x44px and maintain high color contrast.
*   **Performance:** Ensure smooth interactions and no layout shifts during fluid resizing.

## 4. Acceptance Criteria
*   [ ] Onboarding flow displays a clear progress indicator (e.g., Step 1 of 2).
*   [ ] Layout transitions fluidly from mobile to desktop without any broken or overlapping elements.
*   [ ] All interactive elements (buttons, inputs) meet the minimum touch target size of 44x44px.
*   [ ] Budget editing uses a responsive modal that behaves like a bottom drawer on mobile.
*   [ ] Total balance and main action buttons are sticky or strategically placed for easy reach on mobile devices.

## 5. Out of Scope
*   Adding new steps or changing the core onboarding logic.
*   Modifying backend APIs or data models.
