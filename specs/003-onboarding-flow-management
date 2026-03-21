# Product Requirements Document

## Onboarding Flow Management

---

### 1. Document Header

| Field                      | Value                                    |
| -------------------------- | ---------------------------------------- |
| **Product / Feature Name** | Kaizen — Onboarding Flow Management      |
| **Version**                | 1.0                                      |
| **Status**                 | Draft                                    |
| **Last Updated**           | _(leave blank — fill before publishing)_ |
| **Author**                 | _(leave blank — fill before publishing)_ |

---

### 2. Problem Statement

New users entering Kaizen's onboarding flow currently have no resilience against interruption, no ability to correct past answers, and no sanctioned way to leave the flow without completing it. A user who closes the app mid-onboarding, enters a wrong balance figure, or simply decides they are not ready to commit, has no recovery path. They are either forced to start over, stuck in a broken state, or locked out of meaningful navigation until they finish — none of which is acceptable for a first-time experience.

The consequence of leaving this unsolved is measurable abandonment. Onboarding is the first real interaction a user has with the product. If it fails to accommodate natural human behaviors — pausing, correcting, reconsidering — users will associate Kaizen with frustration before they have seen a single feature. For a personal finance app targeting Filipino students and young adults, trust is established or destroyed in these first minutes.

Success looks like this: a new user who is interrupted can return to exactly where they left off. A user who mistyped their balance can go back and fix it without losing their other inputs. A user who is not ready can exit cleanly and return later with no data corruption. The onboarding flow becomes something users move through with confidence, not anxiety.

---

### 3. User Personas

**Persona 1 — New User**

| Field               | Content                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | New User                                                                                                      |
| **Role**            | New user                                                                                                      |
| **Primary Goal**    | Complete Kaizen onboarding at their own pace, with the ability to correct mistakes and leave safely if needed |
| **Key Pain Points** | Cannot resume if interrupted; cannot correct a previous step; cannot exit the flow without being stranded     |
| **Stories Owned**   | Story 17, Story 18, Story 20                                                                                  |

**Persona 2 — Developer**

| Field               | Content                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Developer                                                                                                                   |
| **Role**            | Developer                                                                                                                   |
| **Primary Goal**    | Ensure the onboarding state machine is predictable, guarded against invalid states, and maintainable                        |
| **Key Pain Points** | No centralized state management means flows break on edge cases such as browser back-button navigation or direct URL access |
| **Stories Owned**   | Story 19                                                                                                                    |

---

### 4. Feature List

Features are ordered by the number of stories they encompass and the severity of user impact.

---

**Feature A — Onboarding Progress Persistence**
Saves the user's onboarding progress to durable storage after each step so that an interrupted session can be resumed from the last completed step.

Stories:

1. _"As a new user, I want my onboarding progress saved so that I can resume if interrupted."_ (Story 17)

Core value: Users who close the app, lose connectivity, or are otherwise interrupted do not lose their progress and are not forced to restart onboarding.

---

**Feature B — Onboarding State Management**
Provides a centralized Redux slice that is the single source of truth for onboarding state, including navigation guards that prevent invalid states caused by direct URL access or browser-level back-navigation.

Stories:

1. _"As a developer, I want onboarding state managed properly so that flows don't break."_ (Story 19)

Core value: Engineering reliability — the onboarding flow behaves consistently regardless of how the user navigates, eliminating silent state corruption.

---

**Feature C — Backward Navigation in Onboarding**
Allows a user to return to a previous onboarding step to review or change their input, while preserving existing values and preventing unintended side effects such as re-seeding default categories.

Stories:

1. _"As a new user, I want to go back in onboarding so that I can change previous answers."_ (Story 18)

Core value: Users can correct input errors without abandoning or restarting onboarding, reducing friction and improving data accuracy.

---

**Feature D — Onboarding Exit with Logout**
Provides a visible logout option during onboarding that, upon user confirmation, clears all partial onboarding data and ends the session cleanly.

Stories:

1. _"As a new user, I want to exit onboarding so that I can log out if needed."_ (Story 20)

Core value: Users who are not ready to complete onboarding have a clear, safe exit path that leaves the system in a clean state for their next visit.

---

### 5. Acceptance Criteria

---

**Story 17:** _"As a new user, I want my onboarding progress saved so that I can resume if interrupted."_

Acceptance Criteria:

- [ ] Given a new user has completed the Balance Setup step, when the user closes or exits the application, then their current onboarding step is persisted to durable server-side storage before the session ends.
- [ ] Given a new user has completed the Budget Prompt step, when the user closes or exits the application, then their current onboarding step and budget choice are persisted to durable server-side storage.
- [ ] Given a user has partial onboarding progress saved, when they log back in, then the application routes them directly to the step immediately following their last completed step — not to the start of onboarding.
- [ ] Given a user has partial onboarding progress saved, when they log back in, then all previously entered values (balance amount, budget choice) are pre-populated in the resumed step.
- [ ] Given a user has completed all onboarding steps, when they log back in, then no onboarding screens are shown; they are routed to the main application.

---

**Story 18:** _"As a new user, I want to go back in onboarding so that I can change previous answers."_

Acceptance Criteria:

- [ ] Given a user is on the Budget Prompt step, when they press the "Back" button, then the application navigates them to the Balance Setup step.
- [ ] Given a user navigates back to Balance Setup from Budget Prompt, when the Balance Setup screen renders, then the balance value the user previously entered is pre-filled in the input field.
- [ ] Given a user navigates back to Balance Setup and edits their balance, when they proceed forward again to Budget Prompt, then the updated balance value is reflected in state and in any downstream display.
- [ ] Given a user navigates back to Balance Setup, when the Balance Setup screen renders, then default budget categories are not re-seeded; any previously seeded categories remain unchanged.
- [ ] Given a user is on the Balance Setup step (the first step), when the screen renders, then no "Back" button is present. `[INFERRED — verify with author: confirm whether Balance Setup is definitively the first onboarding step, and whether "Back" from it should log the user out or be hidden entirely]`
- [ ] Given a user is on the Budget Prompt step, when they press "Back", then any budget choice they had already made on that step is preserved in state after returning forward.

---

**Story 19:** _"As a developer, I want onboarding state managed properly so that flows don't break."_

Acceptance Criteria:

- [ ] Given the onboarding Redux slice is implemented, when the application initializes, then balance value and budget choice are stored exclusively in the onboarding slice — not in component-local state or disparate reducers.
- [ ] Given a user attempts to navigate directly via URL to an onboarding step they have not reached, when the navigation guard evaluates their progress, then the user is redirected to their current valid step.
- [ ] Given a user has completed onboarding, when they attempt to navigate directly via URL to any onboarding step, then the navigation guard redirects them to the main application.
- [ ] Given a user presses the browser's native back button while in the onboarding flow, when the navigation guard intercepts the event, then the application routes to the previous onboarding step (if one exists) rather than exiting the onboarding flow or entering a broken state.
- [ ] Given a user is on the first onboarding step and presses the browser's native back button, when the navigation guard intercepts the event, then the user is either held on the current step or presented with the logout confirmation — not routed to a pre-auth page without confirmation. `[INFERRED — verify with author]`
- [ ] Given any onboarding step is completed, when the step completes, then the Redux slice updates synchronously before the next step renders.

---

**Story 20:** _"As a new user, I want to exit onboarding so that I can log out if needed."_

Acceptance Criteria:

- [ ] Given a user is on any onboarding step, when they view the top navigation bar, then a "Log out" option is visible.
- [ ] Given a user presses "Log out" in the onboarding top navigation, when the confirmation dialog renders, then it displays the exact message: _"Progress will be lost. Log out?"_ with a confirm action and a cancel action.
- [ ] Given the confirmation dialog is shown, when the user selects "Cancel", then the dialog closes and the user remains on their current onboarding step with all state preserved.
- [ ] Given the confirmation dialog is shown, when the user selects "Log out", then all partial onboarding data stored for that user is deleted from server-side storage.
- [ ] Given the user confirms logout, when the deletion of partial onboarding data completes, then the user's session token is invalidated and they are routed to the login or landing screen.
- [ ] Given the user confirms logout and logs in again later, when the application evaluates their onboarding state, then no partial onboarding data is found and the user begins onboarding from the first step.

---

### 6. Technical Constraints

**6a. Functional Constraints**

- The onboarding flow must enforce step ordering. A user cannot reach a later step without having completed all prior steps. `[INFERRED — verify with author]`
- Navigation guards must intercept both in-app navigation events and browser-native back-button events during the onboarding flow (Stories 19).
- Default budget categories must not be re-seeded when a user navigates backward. The seeding operation must be gated on a flag that is set once and not reset by backward navigation (Story 18).
- The logout confirmation dialog must be modal — the user cannot interact with the onboarding UI while it is open (Story 20). `[INFERRED — verify with author]`
- Progress must be saved to persistent storage after each step completes — not only at the end of the flow (Story 17).

**6b. Data Constraints**

- An `OnboardingProgress` entity must be created with at minimum the following fields: `userId`, `currentStep` (enum: `balance`, `budget`, `complete`), `balanceValue`, `budgetChoice`, `lastUpdatedAt` (Story 17).
- Onboarding progress data for a user must be fully deleted — not soft-deleted — when that user confirms logout during onboarding (Story 20).
- Previously entered values (balance, budget choice) must be re-hydrated from the `OnboardingProgress` entity when a user resumes or navigates backward, and must not rely on in-memory state that may have been lost (Story 17, Story 18).
- The Redux onboarding slice must hold at minimum: `currentStep`, `balanceValue`, `budgetChoice`, and a `categoriesSeeded` boolean flag (Stories 18, 19). `[INFERRED — verify with author: confirm exact slice shape with the frontend lead]`

**6c. Integration Constraints**

- The onboarding Redux slice must integrate with the application's existing routing solution to support navigation guard logic (Story 19). `[INFERRED — verify with author: confirm whether the project uses React Router, Next.js App Router, or another routing mechanism]`
- The logout action from within onboarding must call the same session invalidation endpoint used by the standard logout flow to ensure consistent session teardown (Story 20). `[INFERRED — verify with author]`
- The `OnboardingProgress` entity must be persisted to the backend database — not to browser storage — to support cross-device resume (Story 17). `[INFERRED — verify with author: confirm whether cross-device resume is a requirement or if local/session storage is acceptable]`

---

### 7. Success Metrics

| Feature Area                                | Metric                                                                       | Measurement Method                                                                           | Target                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Onboarding Progress Persistence (Feature A) | Rate of successful onboarding resumption after interrupted sessions          | Backend event: session interrupted → session resumed → onboarding completed                  | `[TBD — set by product owner]`                               |
| Onboarding State Management (Feature B)     | Rate of invalid-state navigation errors during onboarding                    | Frontend error logging; count of navigation guard redirects triggered by invalid step access | 0 unhandled invalid-state errors per 100 onboarding sessions |
| Backward Navigation (Feature C)             | Rate of users who use the back button and still complete onboarding          | Funnel analytics: back-button event → onboarding complete event                              | `[TBD — set by product owner]`                               |
| Onboarding Exit with Logout (Feature D)     | Rate of users who exit mid-onboarding and successfully return to complete it | Backend: logout-during-onboarding event → subsequent onboarding-complete event               | `[TBD — set by product owner]`                               |

---

### 8. Out of Scope

- This PRD does not cover the content or design of any individual onboarding step beyond what is implied by the state transitions described (e.g., field validation rules for balance input, budget category selection UI).
- This PRD does not cover onboarding analytics or A/B testing of onboarding variants.
- This PRD does not cover account deletion or any data erasure beyond the partial onboarding data cleared on mid-flow logout.
- This PRD does not cover what happens when a user completes onboarding on one device and attempts to re-access onboarding screens on another device.
- This PRD does not cover error handling for failed persistence calls (e.g., what the user sees if the server fails to save their progress after a step). `[INFERRED — verify with author: this is a likely edge case that should be scoped before development begins]`
- This PRD does not cover password reset, account recovery, or any authentication flows adjacent to onboarding.

---

### 9. Open Questions

| #   | Question                                                                                                                                                                                                                              | Relevant Story               | Impact if Unresolved                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What does "Back" do on the Balance Setup step — is the button hidden, disabled, or does it trigger the logout confirmation flow? The task notes suggest logout, but this conflicts with Story 20's explicit logout-confirmation flow. | Story 18, Story 20           | Determines whether two separate exit mechanisms exist or whether back-on-first-step is unified with the logout action            |
| 2   | Is onboarding progress persisted to the server or to local/session storage? The resume requirement implies server-side, but this is not stated.                                                                                       | Story 17                     | Determines the `OnboardingProgress` entity's storage layer and whether cross-device resume is supported                          |
| 3   | What is the complete ordered list of onboarding steps? The stories reference "balance," "budget," and "complete" — are there additional steps (e.g., profile setup, currency selection) not captured in these stories?                | Story 17, Story 18, Story 19 | Determines the full step enum, navigation guard logic, and back-button behavior for every step                                   |
| 4   | Should partial onboarding data be cleared immediately on logout confirmation, or after the session is fully invalidated? A server error between the two operations could leave orphaned data.                                         | Story 20                     | Determines the transaction order for data deletion and session teardown; affects data integrity guarantees                       |
| 5   | If a user navigates back, edits their balance, and then presses the browser back button (not the in-app Back button), how should the navigation guard respond?                                                                        | Story 18, Story 19           | Determines whether browser back-button behavior during backward navigation is handled identically to in-app back-button behavior |
| 6   | Is the "Log out" option during onboarding the only way to exit the flow, or can users also close the app and resume? If both are valid, do they produce different state outcomes?                                                     | Story 17, Story 20           | Determines whether "close and resume" and "logout and return" are distinct states requiring separate handling                    |

---

_End of PRD v1.0 — Kaizen Onboarding Flow Management_
