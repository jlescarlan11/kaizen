---
# Product Requirements Document
---

## 1. Document Header

| Field                      | Value                                                         |
| -------------------------- | ------------------------------------------------------------- |
| **Product / Feature Name** | Kaizen — Post-Onboarding Dashboard & First-Time User Guidance |
| **Version**                | 1.0                                                           |
| **Status**                 | Draft                                                         |
| **Last Updated**           | _(leave blank — fill before review)_                          |
| **Author**                 | _(leave blank — fill before review)_                          |

---

## 2. Problem Statement

A user who has just completed account setup arrives at a blank, context-free application with no balance history, no transactions, and no budgets. Without deliberate design intervention, this empty state communicates nothing — the user cannot determine what the app does next, where to tap, or why any of it is worth their time. New users in this position routinely abandon financial apps within the first session because the gap between "account created" and "value received" is never bridged.

The cost of leaving this unresolved is high and compounding. Users who do not add a first transaction in their opening session are significantly less likely to return. Users who do not understand the core navigation — balance, budgets, goals, transactions — will under-utilize the product even if they do return. For a personal finance tool targeting Filipino students and young adults, first-session comprehension is not a nice-to-have; it is the primary retention lever.

Success looks like this: a new user completes onboarding, lands on a dashboard they can immediately understand, receives a clear prompt for what to do first, and either takes that action or has a reliable path to return to guidance later. Every screen they encounter has a purposeful empty state. Every tap is instructed. By the end of their first session, the application feels inhabited rather than abandoned.

---

## 3. User Personas

---

**Persona 1 — New User**

| Field               | Content                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | New User                                                                                                                                                       |
| **Role**            | New user (as stated in Stories 22, 23)                                                                                                                         |
| **Primary Goal**    | Understand the application's core features quickly and take a first meaningful action — adding a transaction or setting up a budget — within the first session |
| **Key Pain Points** | Lands on an empty dashboard with no guidance; does not know what each section does; does not know how to begin; may feel overwhelmed and exit before engaging  |
| **Stories Owned**   | Story 22, Story 23                                                                                                                                             |

---

**Persona 2 — Returning / General User**

| Field               | Content                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | General User                                                                                                                                            |
| **Role**            | User (as stated in Story 21)                                                                                                                            |
| **Primary Goal**    | Begin using the application's core features — transactions, budgets, goals — immediately after onboarding without friction                              |
| **Key Pain Points** | Transition from onboarding to the main app is unclear; does not know what the dashboard displays or why; bottom navigation structure is not established |
| **Stories Owned**   | Story 21                                                                                                                                                |

---

**Persona 3 — Developer**

| Field               | Content                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Developer                                                                                                                                                                                   |
| **Role**            | Developer (as stated in Story 24)                                                                                                                                                           |
| **Primary Goal**    | Programmatically determine whether a given user is in their first session, has completed key first-time actions, or requires contextual help — and surface the right experience accordingly |
| **Key Pain Points** | No flags exist on the User entity to distinguish first-time from returning users; contextual help cannot be conditionally displayed without this data                                       |
| **Stories Owned**   | Story 24                                                                                                                                                                                    |

---

## 4. Feature List

Features are ordered by cross-story coverage and criticality to the first-session experience.

---

### Feature A — Dashboard Shell & Bottom Navigation

A foundational screen and navigation structure that the user lands on immediately after completing onboarding.

User stories in scope:

1. _"As a user, I want the dashboard to show after onboarding so that I can start using the app."_ (Story 21)

**Core value:** Gives every user — regardless of data state — a stable, navigable home immediately after account creation.

---

### Feature B — First-Time User Flag System

A data layer on the User entity that records which first-time milestones the user has reached, enabling all conditional guidance logic across the application.

User stories in scope:

1. _"As a developer, I want first-time user flags so that I can show appropriate guidance."_ (Story 24)

**Core value:** Decouples first-time experience logic from view-layer assumptions, enabling consistent, testable, role-appropriate guidance at every touchpoint.

---

### Feature C — Empty States

Purposeful, action-oriented screens displayed in place of content when the user has no transactions, budgets, or goals recorded.

User stories in scope:

1. _"As a new user, I want helpful empty states so that I know what to do first."_ (Story 23)

**Core value:** Converts an empty application into an instructional surface — every blank section tells the user what it is for and how to populate it.

---

### Feature D — Interactive Onboarding Tour

A guided, skippable overlay tour that introduces the dashboard's key areas to new users immediately after first login, with an option to replay from Settings.

User stories in scope:

1. _"As a new user, I want an onboarding tour so that I understand key features."_ (Story 22)

**Core value:** Reduces the learning curve for core navigation — balance, transactions, budgets, goals — to a single guided session that users can exit or revisit on their own terms.

`[Priority unconfirmed — verify with author]` for relative ordering of Feature C vs. Feature D; both address first-session comprehension and may need to be sequenced together in implementation.

---

## 5. Acceptance Criteria

---

**Story 21:** _"As a user, I want the dashboard to show after onboarding so that I can start using the app."_

Acceptance Criteria:

- [ ] Given a user has just completed the final onboarding step, when onboarding is marked complete, then the application navigates to the Dashboard screen without requiring any additional user action.
- [ ] Given the user has no transaction history, when the Dashboard loads, then the balance card is visible and displays a zero or placeholder balance value with a label indicating no transactions have been recorded.
- [ ] Given the user has not created any budgets, when the Dashboard loads, then the budget summary section is either hidden or replaced by an empty state with a prompt to create a budget — it does not display undefined or broken UI.
- [ ] Given the user has no data in any section, when the Dashboard loads, then an "Add your first transaction" prompt is displayed in a prominent location on the screen.
- [ ] Given the Dashboard is loaded, when the user views the screen, then the bottom navigation bar is present with tabs for all primary sections (Transactions, Budgets, Goals, and any additional defined tabs).
- [ ] Given the bottom navigation is visible, when the user taps any navigation tab, then the application navigates to the corresponding screen within 300ms. `[INFERRED — verify with author]`
- [ ] Given a user who has already completed onboarding, when they open the app on a subsequent session, then the app opens directly to the Dashboard, not the onboarding flow.

---

**Story 22:** _"As a new user, I want an onboarding tour so that I understand key features."_

Acceptance Criteria:

- [ ] Given a user whose `tourCompleted` flag is `false`, when the Dashboard first loads after onboarding, then the interactive tour begins automatically without requiring the user to initiate it.
- [ ] Given the tour is active, when it reaches the balance card step, then a tooltip or overlay appears anchored to the balance card with the label "This shows your current balance."
- [ ] Given the tour is active, when it reaches the add-transaction step, then a tooltip or overlay appears anchored to the "+" button with the label "Tap here to add transactions."
- [ ] Given the tour is active, when it reaches the budgets step, then a tooltip or overlay appears anchored to the Budgets tab with the label "View your budget progress here."
- [ ] Given the tour is active, when it reaches the goals step, then a tooltip or overlay appears anchored to the Goals tab with the label "Set savings goals."
- [ ] Given the tour is active at any step, when the user taps the "Skip" control, then the tour is dismissed immediately and the Dashboard is fully interactive.
- [ ] Given the tour is completed or skipped, when the action occurs, then the `tourCompleted` flag on the User entity is set to `true`.
- [ ] Given a user whose `tourCompleted` flag is `true`, when they open the app, then the tour does not launch automatically.
- [ ] Given the user navigates to Settings, when they locate the tour option, then a "Show tour again" control is present.
- [ ] Given the user taps "Show tour again" in Settings, when the Dashboard is next loaded, then the tour launches from the first step.

---

**Story 23:** _"As a new user, I want helpful empty states so that I know what to do first."_

Acceptance Criteria:

- [ ] Given the user has no transactions recorded, when the Transactions screen or transactions section loads, then an empty state is displayed containing the heading "Add your first transaction", the subtext "Track where your money goes", and a tappable button labeled "Tap + to get started."
- [ ] Given the user taps the "Tap + to get started" button in the transactions empty state, when the tap is registered, then the add-transaction flow opens.
- [ ] Given the user did not set up budgets during onboarding, when the Budgets screen or budget section loads, then an empty state is displayed containing the text "Set up budgets to organize spending" and a tappable button labeled "Quick setup."
- [ ] Given the user taps "Quick setup" in the budgets empty state, when the tap is registered, then the budget creation flow opens.
- [ ] Given the user has recorded at least one transaction, when the Transactions screen loads, then the transactions empty state is not displayed.
- [ ] Given the user has at least one budget configured, when the Budgets screen loads, then the budgets empty state is not displayed.
- [ ] Given the Goals empty state, when the Goals screen loads with no goals recorded, then a defined empty state is displayed. `[INFERRED — verify with author: Goals empty state content is marked as handled in a later sprint; confirm what placeholder, if any, appears in this sprint]`

---

**Story 24:** _"As a developer, I want first-time user flags so that I can show appropriate guidance."_

Acceptance Criteria:

- [ ] Given the User entity schema, when the data model is reviewed, then three boolean flags exist: `firstTransactionAdded`, `tourCompleted`, and `onboardingCompleted`, each defaulting to `false` on account creation.
- [ ] Given a user who has just registered, when their record is created in the database, then all three flags are set to `false`.
- [ ] Given a user completes the final onboarding step, when the step is confirmed, then `onboardingCompleted` is set to `true` and persisted before navigation to the Dashboard occurs.
- [ ] Given a user completes or skips the onboarding tour, when the action occurs, then `tourCompleted` is set to `true` and persisted.
- [ ] Given a user submits their first transaction successfully, when the transaction is saved, then `firstTransactionAdded` is set to `true` and persisted.
- [ ] Given any component that conditionally renders guidance, when it reads a flag, then it reads the persisted server-side value — not a local/session-only value — so guidance state survives app restarts.
- [ ] Given all three flags are `true` for a user, when that user opens the app, then no first-time guidance elements (tour, onboarding prompts) are displayed automatically.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- The Dashboard screen must be the navigation destination immediately following the final onboarding step. No intermediate screens may appear between onboarding completion and Dashboard render. `[INFERRED — verify with author]`
- The onboarding tour must not be triggered for any user whose `tourCompleted` flag is `true`, regardless of session state or device.
- Empty states must be evaluated per-section: a user with transactions but no budgets must see the budgets empty state while seeing real data in the transactions section. The conditions are independent.
- The "Show tour again" action in Settings must reset tour playback without altering the `onboardingCompleted` or `firstTransactionAdded` flags.
- The bottom navigation must be present on the Dashboard and all primary section screens. It must not appear during the onboarding flow or the active tour overlay. `[INFERRED — verify with author]`
- All flag reads that gate UI visibility must occur before the relevant screen renders to prevent flash-of-incorrect-content. `[INFERRED — verify with author]`

### 6b. Data Constraints

- The three flags defined in Story 24 (`firstTransactionAdded`, `tourCompleted`, `onboardingCompleted`) must be stored on the User entity in persistent server-side storage, not in local storage or session memory alone.
- Flag updates must be atomic with the actions that trigger them: the `onboardingCompleted` flag must be written in the same operation that marks onboarding complete, not deferred. `[INFERRED — verify with author]`
- The balance card on the Dashboard must derive its displayed value from the same transaction data source used elsewhere in the app — it must not maintain a separate or cached balance field. `[INFERRED — verify with author]`
- Empty state display logic must not make additional network requests beyond what is already required to determine whether data exists. `[INFERRED — verify with author]`

### 6c. Integration Constraints

- The interactive tour component (Story 22) requires access to the rendered positions of the balance card, "+" button, Budgets tab, and Goals tab at runtime to anchor tooltips or overlay highlights correctly. This implies the tour must be integrated at the Dashboard view layer with access to DOM references or equivalent component refs. `[INFERRED — verify with author]`
- The Settings screen must expose a route or action handler that the "Show tour again" control can invoke to reset tour state. This implies the Settings screen and the tour component must share access to the same flag-writing service. `[INFERRED — verify with author]`
- The "Tap + to get started" button in the transactions empty state and the "Quick setup" button in the budgets empty state must navigate to the same flows used by their respective primary entry points — they must not be standalone or duplicate flows. `[INFERRED — verify with author]`

---

## 7. Success Metrics

| Feature Area                        | Metric                                                                                                  | Measurement Method                          | Target                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| Dashboard Shell & Bottom Navigation | Percentage of users who land on the Dashboard within 60 seconds of completing onboarding                | Session analytics funnel                    | ≥ 95%                          |
| First-Time User Flag System         | Percentage of flag write operations that complete successfully without error                            | Backend error logging                       | ≥ 99.5%                        |
| Empty States                        | Percentage of new users who tap a primary CTA (e.g., "Tap + to get started") within their first session | In-app event tracking                       | `[TBD — set by product owner]` |
| Interactive Onboarding Tour         | Tour completion rate (completed all steps without skipping) among users who see it                      | Analytics event on tour step completion     | `[TBD — set by product owner]` |
| Interactive Onboarding Tour         | Tour skip rate                                                                                          | Analytics event on skip action              | `[TBD — set by product owner]` |
| First Transaction Added             | Percentage of new users who add their first transaction within 24 hours of onboarding                   | `firstTransactionAdded` flag state at T+24h | `[TBD — set by product owner]` |

---

## 8. Out of Scope

- This PRD does not cover the Goals empty state design or content — Story 23 explicitly defers this to a later sprint.
- This PRD does not cover the budget creation flow itself — only the entry point (the "Quick setup" button in the empty state) is in scope.
- This PRD does not cover the add-transaction flow — only the entry points from the dashboard prompt and the transactions empty state are in scope.
- This PRD does not cover the onboarding flow that precedes the Dashboard — only the transition into and behavior of the Dashboard post-onboarding is in scope.
- This PRD does not cover Settings screen design or layout — only the specific "Show tour again" control is in scope.
- This PRD does not cover analytics instrumentation tooling or event schema design — only the identification of what must be measurable is in scope.
- This PRD does not cover error states (e.g., failed data load on Dashboard, failed flag write) — these require a separate error handling specification.
- This PRD does not cover accessibility requirements (screen reader support, contrast ratios, tap target sizing) — these should be addressed in a parallel design specification. `[INFERRED — verify with author]`

---

## 9. Open Questions

| #   | Question                                                                                                                                                                                                          | Relevant Story | Impact if Unresolved                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | What is the exact sequence of events at the end of onboarding — does the Dashboard animate in, fade in, or navigate immediately? Is there a transition screen?                                                    | Story 21       | Determines implementation of the onboarding-to-dashboard handoff and whether a loading state is required     |
| 2   | If the user skips budget setup during onboarding, does the Dashboard budget summary section render as a budgets empty state, or is the section hidden entirely?                                                   | Story 21       | Determines layout behavior of the Dashboard for users with no budgets                                        |
| 3   | Does the onboarding tour begin immediately on Dashboard render, or after a short delay to allow the screen to settle? What happens if the Dashboard is still loading data when the tour would start?              | Story 22       | Determines tour trigger logic and whether a loading gate is needed before tour initialization                |
| 4   | Are the four tour highlight areas (balance card, "+" button, Budgets tab, Goals tab) the complete and final set, or is this list subject to change as features are added?                                         | Story 22       | Determines whether the tour component should be built as a fixed sequence or a configurable, data-driven one |
| 5   | When the user taps "Show tour again" in Settings, does the tour launch immediately on the Settings screen, or does it launch the next time the user navigates to the Dashboard?                                   | Story 22       | Determines navigation flow and whether Settings needs to trigger a cross-screen event                        |
| 6   | What is the defined empty state for the Goals section in this sprint — a placeholder, a coming-soon message, or a hidden section? Story 23 defers this to a later sprint but the tab must still render.           | Story 23       | Determines whether the Goals tab is tappable and what a user sees if they navigate there in this sprint      |
| 7   | Are the three User entity flags (`firstTransactionAdded`, `tourCompleted`, `onboardingCompleted`) stored in the same database table as the core User record, or in a separate user preferences or metadata table? | Story 24       | Affects schema design, query patterns, and where flag-write logic is located in the backend                  |
| 8   | Who is authorized to reset or manually override these flags — only the system, or also an admin user or support tooling?                                                                                          | Story 24       | Determines whether an admin interface or support API endpoint is needed alongside the automated flag system  |
| 9   | Is there a defined behavior if flag persistence fails (e.g., network error when writing `onboardingCompleted`)? Should the user be blocked, retried silently, or allowed to proceed with a local fallback?        | Story 24       | Determines resilience requirements for the flag write path and whether offline support is needed             |

---

_End of Document — v1.0 Draft_
