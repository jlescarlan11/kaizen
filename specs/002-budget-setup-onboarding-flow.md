Here is the full PRD generated from Stories 10–16.

---

# Product Requirements Document

## Budget Setup & Onboarding Flow

| Field                      | Value                                                        |
| -------------------------- | ------------------------------------------------------------ |
| **Product / Feature Name** | Budget Setup & Onboarding Flow — Kaizen Personal Finance App |
| **Version**                | 1.0                                                          |
| **Status**                 | Draft                                                        |
| **Last Updated**           | _(leave blank — fill before review)_                         |
| **Author**                 | _(leave blank — fill before review)_                         |

---

## 1. Problem Statement

New users of Kaizen arrive without any budgeting structure in place. They know their account balance but have no framework for deciding how to allocate it, no vocabulary for categories, and no understanding of what budgeting periods mean or how to use them. Without guided setup, users either abandon the onboarding flow entirely or reach the dashboard with no budgets configured, which renders the app's core value — tracking against limits — completely inert from day one.

The cost of leaving this unsolved is both immediate and compounding. A user who skips or fails to complete budget setup has no feedback loop: they can log transactions, but they cannot see whether they are overspending, which is the fundamental reason they downloaded a personal finance app. Worse, users who skip setup and find no recovery path — no prompt, no shortcut, no re-entry point — are unlikely to return to the task on their own initiative. A cold dashboard with no budgets creates the impression that the app does not work, not that setup was deferred.

Success looks like this: a new user completes the app within their first session either by accepting suggested budgets, configuring their own, or explicitly deferring with a clear path back. When they reach the dashboard, either the budget structure is in place and active, or a visible and unambiguous prompt guides them to complete it when they are ready. Users who set up budgets understand why the suggested amounts were chosen, what the period options mean, and how much of their balance they are committing before they save anything.

---

## 2. User Personas

**Persona 1: New User — Guided Onboarder**

| Field               | Content                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Persona Name**    | New User — Guided Onboarder                                                                                                                                              |
| **Role**            | New user                                                                                                                                                                 |
| **Primary Goal**    | Complete initial budget setup quickly and with enough confidence to start using the app                                                                                  |
| **Key Pain Points** | Does not know how to allocate their balance across categories; does not understand what budget periods mean; lacks confidence that the amounts they enter are reasonable |
| **Stories Owned**   | 10, 11, 12, 13, 14                                                                                                                                                       |

**Persona 2: New User — Deferred Setup**

| Field               | Content                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | New User — Deferred Setup                                                                                             |
| **Role**            | New user (skip path)                                                                                                  |
| **Primary Goal**    | Explore the app before committing to a budget structure                                                               |
| **Key Pain Points** | Feels pressured to set up budgets before understanding the app; after skipping, has no visible way to return to setup |
| **Stories Owned**   | 15                                                                                                                    |

**Persona 3: Returning Skipped User**

| Field               | Content                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Returning Skipped User                                                                                                      |
| **Role**            | User who skipped budgets                                                                                                    |
| **Primary Goal**    | Set up budgets at their own pace after exploring the app                                                                    |
| **Key Pain Points** | No path to budget setup exists after the initial onboarding screen is dismissed; dashboard appears empty and non-functional |
| **Stories Owned**   | 16                                                                                                                          |

---

## 3. Feature List

Features are ordered by user impact and story density.

---

**Feature A: Smart Budget Allocation (Suggested Setup)**

A guided setup screen that proposes four pre-calculated budget amounts based on the user's current balance, with inline editing and real-time total feedback.

User stories covered:

1. _"As a new user, I want quick budget setup with suggestions so that I can get started fast."_ (Story 10)
2. _"As a new user, I want to understand budget suggestions so that I know why amounts were chosen."_ (Story 11)
3. _"As a new user, I want to see budget allocation total so that I know how much I'm committing."_ (Story 13)

Core value: Removes the blank-slate problem — users arrive at a populated, editable starting point rather than an empty form, dramatically reducing time-to-first-budget.

---

**Feature B: Manual Budget Setup**

A sequential, modal-based flow that allows users to define custom categories and amounts one at a time, with duplicate prevention and a running allocation total.

User stories covered:

1. _"As a new user, I want manual budget setup so that I can choose my own categories and limits."_ (Story 12)
2. _"As a new user, I want to see budget allocation total so that I know how much I'm committing."_ (Story 13)

Core value: Gives users full control over their category structure without being forced to accept suggested allocations.

---

**Feature C: Budget Period Explanation**

Contextual help text embedded within the setup flow that explains what Monthly and Weekly budget periods mean and shows their practical equivalents.

User stories covered:

1. _"As a new user, I want budget period explained so that I understand monthly vs weekly."_ (Story 14)

Core value: Eliminates a silent point of confusion that causes users to either select the wrong period or abandon setup because they do not understand the options.

---

**Feature D: Skip & Deferred Budget Setup**

A skip mechanism with explicit user confirmation and a persistent re-entry path accessible from both the dashboard and the Budgets tab after onboarding is dismissed.

User stories covered:

1. _"As a new user, I want to skip budget setup so that I can explore the app first."_ (Story 15)
2. _"As a user who skipped budgets, I want to set up budgets later so that I can add limits when ready."_ (Story 16)

Core value: Respects user autonomy during onboarding while ensuring no user is permanently stranded without a path to complete setup.

---

## 4. Acceptance Criteria

---

**Story 10:** _"As a new user, I want quick budget setup with suggestions so that I can get started fast."_

Acceptance Criteria:

- [ ] Given a new user has entered their current balance during onboarding, when the Smart Budget Allocation screen loads, then four suggested budget categories are displayed, each pre-populated with an amount derived from the following percentages of the entered balance: 30%, 16%, 10%, 10%.
- [ ] Given the Smart Budget Allocation screen is displayed, when a user taps the edit button next to any suggested budget, then that amount becomes editable inline without navigating away from the screen.
- [ ] Given the user has edited one or more suggested amounts, when any amount field changes, then the total allocation figure updates in real time without requiring a page reload or form submission.
- [ ] Given the user is satisfied with the allocations, when they tap the save or confirm action, then a single `POST /budgets/batch` request is issued containing all four budgets, and all four are saved atomically — either all succeed or none are saved.
- [ ] Given the `POST /budgets/batch` request succeeds, when the response is received, then the user is redirected to the dashboard and all four budgets are visible there.
- [ ] Given the `POST /budgets/batch` request fails, when the response is received, then the user remains on the Smart Budget Allocation screen and an error message is displayed; no partial budgets are saved.

---

**Story 11:** _"As a new user, I want to understand budget suggestions so that I know why amounts were chosen."_

Acceptance Criteria:

- [ ] Given the Smart Budget Allocation screen is displayed, when the user views each suggested budget row, then a tooltip or information icon is visible adjacent to the suggested amount or category label.
- [ ] Given the user taps the tooltip or information icon, when the tooltip opens, then it displays the text: "Based on recommended budgeting guidelines" and shows the percentage breakdown used to calculate the amount.
- [ ] Given the tooltip is open, when the user taps a link labeled "Learn more" or equivalent, then they are directed to a help article about budgeting principles. `[INFERRED — verify with author: confirm whether the link opens in-app WebView or an external browser]`
- [ ] Given the tooltip is displayed, when the user taps anywhere outside the tooltip, then the tooltip closes without altering any budget amounts.

---

**Story 12:** _"As a new user, I want manual budget setup so that I can choose my own categories and limits."_

Acceptance Criteria:

- [ ] Given the budget setup screen is displayed, when the user selects the manual setup path, then a screen appears with a "+ Add Budget" button and an empty list of budgets.
- [ ] Given the user taps "+ Add Budget", when the modal opens, then it displays a category picker and an amount input field.
- [ ] Given the category picker is open, when the user views the list of categories, then any category already assigned to an existing budget in the current session is visually greyed out and not selectable.
- [ ] Given the user selects a category and enters a valid positive numeric amount, when they confirm the entry, then the modal closes and the new budget appears in the list with the chosen category and amount.
- [ ] Given the user has added at least one budget, when they tap "+ Add Budget" again, then the modal reopens and the previously selected category is greyed out in the picker.
- [ ] Given the user adds a budget, when the budget is confirmed, then the `POST /budgets` endpoint is called with the `categoryId` and amount as the payload, and the budget is saved referencing that `categoryId`.
- [ ] Given one or more budgets have been added, when the user taps the "Done" button, then they are redirected to the dashboard.
- [ ] Given the user taps "Done" with zero budgets added, when the "Done" action is triggered, then the behavior follows the skip flow defined in Story 15. `[INFERRED — verify with author]`

---

**Story 13:** _"As a new user, I want to see budget allocation total so that I know how much I'm committing."_

Acceptance Criteria:

- [ ] Given the user is on either the Smart Budget Allocation screen or the Manual Budget Setup screen, when any budget amount is added or edited, then the display updates in real time to show: the total allocated in Philippine Peso (e.g., "Total: ₱4,500 / ₱10,000 balance"), the percentage allocated (e.g., "45% of balance allocated"), and the remaining unallocated amount (e.g., "₱5,500 unallocated").
- [ ] Given the total allocated is 70% or less of the entered balance, when the total is displayed, then the total figure is rendered in green.
- [ ] Given the total allocated is between 71% and 99% of the entered balance, when the total is displayed, then the total figure is rendered in yellow. `[INFERRED — verify with author: confirm the exact threshold between yellow and red]`
- [ ] Given the total allocated equals or exceeds 100% of the entered balance, when the total is displayed, then the total figure is rendered in red.
- [ ] Given the total allocated exceeds 100% of the balance, when the user attempts to save or batch-submit, then the action is blocked and an error message is shown explaining that total allocations cannot exceed the available balance. `[INFERRED — verify with author: confirm whether over-allocation is a hard block or a soft warning]`

---

**Story 14:** _"As a new user, I want budget period explained so that I understand monthly vs weekly."_

Acceptance Criteria:

- [ ] Given the budget setup screen (either Smart or Manual) is displayed, when the user views the period selection field, then help text is visible explaining: "Monthly resets on the 1st. Weekly resets on Monday."
- [ ] Given the user selects Monthly as their budget period, when the selection is made, then the screen displays a calculated weekly equivalent of the monthly budget amount (e.g., "≈ ₱1,050/week").
- [ ] Given the period selection field is presented for the first time to a new user, when the screen loads, then Monthly is pre-selected as the default.
- [ ] Given the user switches between Monthly and Weekly, when the selection changes, then the help text and any calculated equivalents update immediately without a page reload.

---

**Story 15:** _"As a new user, I want to skip budget setup so that I can explore the app first."_

Acceptance Criteria:

- [ ] Given the budget setup screen is displayed, when the user taps "Skip for now", then a confirmation dialog appears before any navigation occurs.
- [ ] Given the confirmation dialog is shown, when the user confirms the skip, then a skip preference flag is stored persistently for the user's account or session.
- [ ] Given the skip is confirmed, when navigation completes, then the user is redirected to the dashboard.
- [ ] Given the user is on the dashboard after skipping, when the dashboard loads, then an empty state is displayed that communicates the absence of budgets and provides a visible prompt to set them up. `[INFERRED — verify with author: confirm exact empty state copy and design]`
- [ ] Given the confirmation dialog is shown, when the user taps "Cancel" or dismisses the dialog, then the dialog closes and the user remains on the budget setup screen with no state changed.

---

**Story 16:** _"As a user who skipped budgets, I want to set up budgets later so that I can add limits when ready."_

Acceptance Criteria:

- [ ] Given the user has previously skipped budget setup, when the dashboard loads, then a "Set up budgets" card is visible in the dashboard UI.
- [ ] Given the user has previously skipped budget setup, when the user navigates to the Budgets tab, then a "Set up budgets" option or entry point is visible.
- [ ] Given the user taps either the dashboard card or the Budgets tab entry point, when the tap is registered, then they are directed to the same budget setup flow used during initial onboarding (Smart or Manual, per their choice).
- [ ] Given the user completes at least one budget through the deferred setup flow, when the first budget is saved, then the onboarding status for budget setup is marked as complete.
- [ ] Given onboarding is marked as complete, when the dashboard reloads, then the "Set up budgets" card is no longer displayed.

---

## 5. Technical Constraints

### 5a. Functional Constraints

- The Smart Budget Allocation screen must calculate suggested amounts as follows: Budget 1 = 30% of balance, Budget 2 = 16%, Budget 3 = 10%, Budget 4 = 10%. The remaining 34% is left unallocated by default. `[INFERRED — verify with author: confirm the four default category labels (e.g., Food, Transport, Savings, Entertainment)]`
- All four suggested budgets must be saved atomically via `POST /budgets/batch`. If any single budget in the batch fails validation server-side, the entire transaction must be rolled back and no budgets persisted.
- Individual budgets created via Manual Setup must be saved via `POST /budgets` (single budget endpoint), referencing a valid `categoryId`.
- A category that has already been assigned a budget in the current session must not be selectable again in the Manual Setup category picker.
- Total allocation feedback (Story 13) must update on every keystroke or field-change event, with no debounce delay greater than 200ms. `[INFERRED — verify with author]`
- The skip preference flag (Story 15) must persist across sessions so that the "Set up budgets" card continues to appear on subsequent logins until setup is completed.
- Onboarding status must be set to complete when the user saves their first budget through any path (Smart, Manual, or Deferred). `[INFERRED — verify with author: confirm whether partial completion — e.g., two of four suggested budgets edited and saved — constitutes completion]`

### 5b. Data Constraints

- Budget records must store at minimum: `categoryId` (reference to a categories table or enum), `amount` (numeric, positive, Philippine Peso denomination), `period` (Monthly or Weekly), and `userId` (owner reference).
- The user's current balance, entered during earlier onboarding steps, must be accessible to the budget setup screens to power percentage calculations and allocation feedback. `[INFERRED — verify with author: confirm where balance is stored and how setup screens access it]`
- The skip preference flag must be stored per user account, not per device session, so that the "Set up budgets" card persists across logins from different devices. `[INFERRED — verify with author]`
- Category data (default categories available in the picker) must be stored and served from a backend source, not hardcoded on the client, to allow future category additions without a client release. `[INFERRED — verify with author]`

### 5c. Integration Constraints

- **`POST /budgets/batch`** — must accept an array of budget objects and execute all inserts within a single database transaction with full rollback on any failure.
- **`POST /budgets`** — must accept a single budget object and return the created budget with its assigned ID for display purposes.
- The help article linked from the budget suggestion tooltip (Story 11) must resolve to a stable URL. `[INFERRED — verify with author: confirm whether this is a hosted help center article or an in-app static screen]`
- The weekly equivalent calculator (Story 14) must perform its calculation client-side using the formula: `weeklyEquivalent = monthlyAmount / 4.33`, where 4.33 is the average number of weeks per month. `[INFERRED — verify with author: confirm calculation method]`
- The color-coding system for allocation totals (Story 13) must use the application's existing design token system (light and dark mode variants) and must not introduce hardcoded hex values. `[INFERRED — verify with author]`

---

## 6. Success Metrics

| Feature Area              | Metric                                                                                                     | Measurement Method                                    | Target                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------ |
| Smart Budget Allocation   | Percentage of new users who complete the Smart Setup flow without abandonment                              | Funnel analytics: screen entry → batch save event     | ≥ 65%                          |
| Smart Budget Allocation   | Percentage of users who edit at least one suggested amount before saving                                   | Event tracking: inline edit interaction               | `[TBD — set by product owner]` |
| Manual Budget Setup       | Percentage of users who add two or more budgets before tapping Done                                        | Event tracking: budget add count per session          | `[TBD — set by product owner]` |
| Budget Allocation Total   | Percentage of users who save a budget total that is over 100% of their balance (indicates clarity failure) | Backend: count of over-limit save attempts            | < 5%                           |
| Budget Period Explanation | Percentage of users who change the period away from the Monthly default                                    | Event tracking: period field interaction              | `[TBD — set by product owner]` |
| Skip & Deferred Setup     | Percentage of users who skip setup but complete it within 7 days via the deferred path                     | Cohort analysis: skip event → first budget save event | ≥ 40%                          |
| Skip & Deferred Setup     | Percentage of skipped users who return to dashboard and tap the "Set up budgets" card                      | Funnel analytics: card render → tap event             | `[TBD — set by product owner]` |

---

## 7. Out of Scope

- This PRD does not cover the steps that precede budget setup in the onboarding flow (e.g., account creation, balance entry, or email verification).
- This PRD does not cover editing or deleting budgets after initial setup is complete — only the creation flow during and immediately after onboarding.
- This PRD does not cover budget performance tracking, progress bars, or transaction-to-budget matching logic.
- This PRD does not cover the Budgets tab's full UI beyond the deferred-setup entry point described in Story 16.
- This PRD does not cover push or email notifications related to budget thresholds or resets.
- This PRD does not cover the behavior of the budget period reset mechanism (i.e., what happens when a Monthly budget resets on the 1st — only the explanation of the reset is in scope).
- This PRD does not cover multi-currency support; all amounts are assumed to be in Philippine Peso (₱).
- This PRD does not cover user-defined custom categories — only default categories surfaced in the picker are in scope.

---

## 8. Open Questions

| #   | Question                                                                                                                                                                                                   | Relevant Story | Impact if Unresolved                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | What are the four default category labels paired with the 30%, 16%, 10%, 10% allocations? (e.g., Food, Transport, Savings, Entertainment?)                                                                 | Story 10       | Cannot build or test the Smart Budget Allocation screen without knowing the category names and their order     |
| 2   | Is over-allocation (total > 100% of balance) a hard block that prevents saving, or a soft warning that allows the user to save anyway with confirmation?                                                   | Story 13       | Determines API validation logic and the UX of the red color state                                              |
| 3   | What is the exact threshold that separates the yellow (high) zone from the red (over) zone in the allocation color-coding system?                                                                          | Story 13       | Determines the color logic and may affect user behavior if the threshold is set too conservatively             |
| 4   | Where is the user's balance stored, and how does the budget setup screen access it — is it passed as a navigation prop, retrieved from a shared state store, or fetched from the API?                      | Stories 10, 13 | Determines data flow architecture for all percentage calculations                                              |
| 5   | Does the "Skip for now" link appear on both the Smart Budget Allocation screen and the Manual Budget Setup screen, or only on the first screen the user sees?                                              | Story 15       | Determines how many screens need the skip affordance and whether the confirmation dialog logic is shared       |
| 6   | When a deferred user taps "Set up budgets" from the dashboard card, do they go to a choice screen (Smart vs. Manual) or are they routed directly to one of the two flows?                                  | Story 16       | Determines whether the flow-selection screen is re-displayed for returning users                               |
| 7   | After the user completes deferred setup and onboarding is marked complete, does the "Set up budgets" card disappear immediately on the current session or only on the next app launch?                     | Story 16       | Determines whether a local state update or a full re-fetch of onboarding status is required                    |
| 8   | Is the help article linked from the suggestion tooltip (Story 11) an in-app static screen, a WebView pointing to a hosted help center, or an external browser link?                                        | Story 11       | Determines whether the help content requires a CMS, a WebView component, or a static in-app screen             |
| 9   | Should the weekly equivalent displayed when Monthly is selected (Story 14) use a fixed divisor (e.g., 4.33 weeks/month) or a dynamic calculation based on the actual number of weeks in the current month? | Story 14       | Affects accuracy of the displayed figure and may matter to financially literate users                          |
| 10  | Can a user mix Smart and Manual setup — for example, accept the four suggested budgets and then also add additional manual budgets in the same session?                                                    | Stories 10, 12 | Determines whether the two setup paths are mutually exclusive or composable within a single onboarding session |

---

_End of PRD — Version 1.0 Draft_
