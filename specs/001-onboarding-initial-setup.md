---
# Product Requirements Document
---

## 1. Document Header

| Field                      | Value                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Product / Feature Name** | Onboarding & Initial Setup — Transaction Categorization and Balance Configuration `[INFERRED — verify with author]` |
| **Version**                | 1.0                                                                                                                 |
| **Status**                 | Draft                                                                                                               |
| **Last Updated**           | _(leave blank)_                                                                                                     |
| **Author**                 | _(leave blank)_                                                                                                     |

---

## 2. Problem Statement

First-time users of a personal finance application face an immediate setup barrier: before they can track a single transaction, they must establish a financial baseline and a categorization structure from scratch. Without a pre-configured starting point, the cognitive cost of setup is high enough that users abandon the flow before reaching the core product. Returning users face a separate but related friction: they are forced through onboarding flows already completed, delaying access to the dashboard they came back to use.

The consequence of leaving this unsolved is measurable drop-off at the earliest and most critical stage of the user lifecycle. A user who cannot complete setup never becomes an active user. A returning user who encounters unnecessary onboarding steps loses trust in the product's awareness of their state. Both failure modes result in reduced retention and engagement, undermining the application's core purpose as a day-to-day financial tool.

Success means a new user reaches a fully functional dashboard — with a valid opening balance, at least one usable category, and a persistent session — without encountering invalid-state errors or manual dead ends. It also means a returning user lands on their dashboard directly, with their previous configuration intact. When this is built correctly, the first interaction with the app is productive rather than administrative.

---

## 3. User Personas

---

**Persona 1: New User**

| Field               | Content                                                                                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | First-Time User                                                                                                                                                                                                                        |
| **Role**            | new user                                                                                                                                                                                                                               |
| **Primary Goal**    | Complete initial setup quickly and reach a functional, personalized dashboard with minimal friction                                                                                                                                    |
| **Key Pain Points** | No categories exist by default, forcing manual setup before any transaction can be logged; no balance baseline means the app has no financial context; invalid inputs during setup are not caught, leading to corrupted starting state |
| **Stories Owned**   | Story 1, Story 4, Story 5                                                                                                                                                                                                              |

---

**Persona 2: Returning User**

| Field               | Content                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Returning User                                                                                                        |
| **Role**            | returning user                                                                                                        |
| **Primary Goal**    | Resume using the app immediately without repeating steps already completed                                            |
| **Key Pain Points** | Being routed through onboarding on every login wastes time and signals the app does not recognize their account state |
| **Stories Owned**   | Story 2                                                                                                               |

---

**Persona 3: General Authenticated User**

| Field               | Content                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Persona Name**    | Authenticated User                                                                                                                                                             |
| **Role**            | user                                                                                                                                                                           |
| **Primary Goal**    | Maintain an accurate financial record over time with categories that reflect personal spending habits                                                                          |
| **Key Pain Points** | Sessions that do not persist force repeated logins; balance errors discovered after onboarding cannot be corrected; default categories do not match personal spending patterns |
| **Stories Owned**   | Story 3, Story 6, Story 7                                                                                                                                                      |

---

**Persona 4: Developer**

| Field               | Content                                                                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona Name**    | Developer / Implementer                                                                                                                                                                               |
| **Role**            | developer                                                                                                                                                                                             |
| **Primary Goal**    | Implement a category system where each category is visually distinguishable at a glance                                                                                                               |
| **Key Pain Points** | Without a defined icon and color system, category UI becomes visually ambiguous, making implementation of list views, charts, and transaction displays inconsistent `[INFERRED — verify with author]` |
| **Stories Owned**   | Story 8                                                                                                                                                                                               |

---

## 4. Feature List

---

### Feature Area 1: Onboarding Flow Management

A gated, role-aware entry flow that routes new users through setup and bypasses that setup entirely for returning users, with a persistent session maintained throughout.

**User Stories:**

1. Story 1 — _"As a new user, I want default categories pre-populated so that I can categorize transactions immediately."_
2. Story 2 — _"As a returning user, I want to bypass onboarding so that I go straight to the dashboard."_
3. Story 3 — _"As a user, I want my session to persist after onboarding so that I don't get logged out."_

**Core Value:** Reduces time-to-productive-use for both new and returning users by making the onboarding flow state-aware and non-repetitive.

---

### Feature Area 2: Balance Configuration

A setup step and post-onboarding mechanism that allows users to enter, validate, and later correct their opening account balance.

**User Stories:**

1. Story 4 — _"As a new user, I want to set my current balance so that the app knows my starting point."_
2. Story 5 — _"As a new user, I want balance validation so that I can't enter invalid amounts."_
3. Story 6 — _"As a user, I want to edit my balance later so that I can correct mistakes."_

**Core Value:** Ensures the app always operates from a valid, user-verified financial baseline, which is a prerequisite for accurate transaction and budget calculations.

---

### Feature Area 3: Category Management

A system for creating, displaying, and visually distinguishing spending categories, beginning with pre-populated defaults and extending to user-defined custom entries.

**User Stories:**

1. Story 1 — _"As a new user, I want default categories pre-populated so that I can categorize transactions immediately."_
2. Story 7 — _"As a user, I want to create custom categories so that I can organize spending my way."_
3. Story 8 — _"As a developer, I want category icons/colors so that categories are visually distinct."_

**Core Value:** Gives users an immediately usable and fully personalizable system for organizing transactions without requiring manual setup from zero.

`[Priority unconfirmed — verify with author]` Feature Area 1 and Feature Area 2 are ordered first due to their dependency relationship with Feature Area 3 (categories must exist before transactions can be logged; balance must exist before the dashboard is meaningful), but final priority should be confirmed by the product owner.

---

## 5. Acceptance Criteria

---

**Story 1:** _"As a new user, I want default categories pre-populated so that I can categorize transactions immediately."_

Acceptance Criteria:

- [ ] Given a user is completing onboarding for the first time, when they reach the category selection step or the dashboard, then at least one default category is already present without any manual input from the user.
- [ ] Given default categories are pre-populated, when the user views the category list, then each default category displays a name, an icon, and a color.
- [ ] Given a new user account with no prior data, when onboarding completes, then the default category list contains no fewer than `[N]` categories `[INFERRED — verify with author: define the minimum count and the specific default categories]`.
- [ ] Given default categories exist, when the user attempts to assign a category to a transaction, then all pre-populated categories are selectable immediately without additional configuration.

---

**Story 2:** _"As a returning user, I want to bypass onboarding so that I go straight to the dashboard."_

Acceptance Criteria:

- [ ] Given a user has previously completed onboarding, when they log in, then they are redirected directly to the dashboard without passing through any onboarding screen.
- [ ] Given a user has previously completed onboarding, when the app loads their session, then no onboarding step is rendered, even briefly before redirect.
- [ ] Given a user has not completed onboarding (e.g., abandoned mid-flow), when they log in, then they are returned to the onboarding step where they left off, not the dashboard. `[INFERRED — verify with author]`

---

**Story 3:** _"As a user, I want my session to persist after onboarding so that I don't get logged out."_

Acceptance Criteria:

- [ ] Given a new user completes the final step of onboarding, when they are redirected to the dashboard, then they are authenticated and no login prompt is presented.
- [ ] Given an authenticated user navigates between pages after onboarding, when no explicit logout action is taken, then their session remains active.
- [ ] Given an authenticated session, when the user closes and reopens the browser tab or app within the session expiry window `[INFERRED — verify with author: define session duration]`, then they are returned to the dashboard without being required to log in again.
- [ ] Given an onboarding flow completes, when the session token is issued, then the token is stored in a persistent client-side mechanism (e.g., a secure cookie or local storage) rather than only in memory. `[INFERRED — verify with author]`

---

**Story 4:** _"As a new user, I want to set my current balance so that the app knows my starting point."_

Acceptance Criteria:

- [ ] Given a new user is in the onboarding flow, when they reach the balance setup step, then a numeric input field is displayed with a visible currency label or selector.
- [ ] Given the balance input field is displayed, when the user enters a valid numeric value and proceeds, then the value is saved as the account's opening balance.
- [ ] Given a new user completes onboarding with a balance entered, when the dashboard loads, then the displayed balance reflects exactly the value submitted during setup.
- [ ] Given the balance step is reached, when the user does not enter any value and attempts to proceed, then the system either blocks progression with an error or defaults to `0.00` and notifies the user. `[INFERRED — verify with author: confirm whether ₱0.00 is a valid opening balance]`

---

**Story 5:** _"As a new user, I want balance validation so that I can't enter invalid amounts."_

Acceptance Criteria:

- [ ] Given the balance input field, when the user enters non-numeric characters (e.g., letters, symbols other than decimal point), then the input is rejected and an inline error message is displayed.
- [ ] Given the balance input field, when the user enters a negative number, then the system displays an inline error stating that the balance must be zero or greater. `[INFERRED — verify with author: confirm whether negative balances are ever valid]`
- [ ] Given the balance input field, when the user enters a number exceeding the defined maximum value `[INFERRED — verify with author: define maximum allowable balance]`, then the system displays an inline error.
- [ ] Given a validation error is shown, when the user corrects the value to a valid amount, then the error message is removed and the proceed action becomes available.
- [ ] Given any validation error, when the user attempts to proceed to the next onboarding step, then navigation is blocked until the error is resolved.

---

**Story 6:** _"As a user, I want to edit my balance later so that I can correct mistakes."_

Acceptance Criteria:

- [ ] Given an authenticated user on the dashboard or settings screen, when they navigate to the balance editing interface, then the current balance value is pre-filled in the input field.
- [ ] Given the balance editing interface is open, when the user enters a valid new balance and confirms, then the balance is updated and the new value is reflected on the dashboard immediately.
- [ ] Given the balance editing interface is open, when the user enters an invalid amount (matching the same rules as Story 5), then the same validation rules apply and saving is blocked.
- [ ] Given a user edits their balance, when the update is saved, then the change is persisted across sessions — a page reload does not revert to the previous value.
- [ ] Given a user opens the balance editor and makes no changes, when they dismiss or cancel, then the existing balance is unchanged.

---

**Story 7:** _"As a user, I want to create custom categories so that I can organize spending my way."_

Acceptance Criteria:

- [ ] Given an authenticated user, when they navigate to the category management interface, then a control to create a new category is visible and accessible.
- [ ] Given the new category creation form, when the user enters a category name and submits, then the new category appears in the category list.
- [ ] Given the category creation form, when the user submits without entering a name, then the form displays an inline error and does not create the category.
- [ ] Given a custom category is created, when the user creates a new transaction, then the custom category appears as a selectable option alongside all default categories.
- [ ] Given a custom category is created, when the user navigates away and returns to the category list, then the custom category is still present — it persists across sessions.
- [ ] Given a category name already exists (case-insensitive), when the user attempts to create a duplicate, then the system rejects the submission and displays an error. `[INFERRED — verify with author]`

---

**Story 8:** _"As a developer, I want category icons/colors so that categories are visually distinct."_

Acceptance Criteria:

- [ ] Given any category (default or custom) is displayed in a list or transaction view, when the view renders, then each category row or chip displays both an icon and a background or accent color distinct from adjacent categories.
- [ ] Given the set of default categories, when rendered simultaneously, then no two default categories share both the same icon and the same color.
- [ ] Given a user creates a custom category, when the category is saved, then an icon and a color are assigned to it — either selected by the user or assigned by the system from a predefined set. `[INFERRED — verify with author: confirm whether users can select icon/color or if it is system-assigned]`
- [ ] Given a category icon, when rendered at the sizes used in the list view and the transaction detail view, then the icon remains visually legible at both sizes. `[INFERRED — verify with author: define minimum render sizes]`
- [ ] Given a color assigned to a category, when rendered in both light mode and dark mode `[INFERRED — verify with author: confirm whether dark mode is in scope]`, then the color meets a contrast ratio of at least 3:1 against its background per WCAG 2.1 AA for non-text elements.

---

## 6. Technical Constraints

### 6a. Functional Constraints

- The system must distinguish between a new user (no completed onboarding record) and a returning user (completed onboarding record) at session initiation, and route them to the appropriate entry point. `[INFERRED — verify with author]`
- Onboarding must be completable in a single flow without requiring a page reload or re-authentication mid-session.
- The balance field must enforce numeric validation client-side before any submission reaches the backend, to prevent invalid data from entering the system.
- Category creation must not allow a state where a transaction can exist without a valid category reference — all categories must be persisted before they can be assigned. `[INFERRED — verify with author]`
- Session persistence must be enforced for all authenticated users regardless of entry point (post-onboarding or direct login).

### 6b. Data Constraints

- **Opening Balance:** Must be stored as a numeric value (recommend decimal precision to two places, e.g., `DECIMAL(15, 2)`) `[INFERRED — verify with author]`, associated with the user's account record, and updatable post-onboarding.
- **Categories:** Each category record must store at minimum: a unique identifier, a user-scoped or global scope flag, a name (string, non-null), an icon reference (string or enum), and a color value (e.g., hex string). Default categories may be global; custom categories must be scoped to the individual user.
- **Session Token:** Must be stored in a persistent client-side mechanism with a defined expiry. The expiry duration must be specified before implementation. `[INFERRED — verify with author]`
- **User Onboarding State:** A boolean or enum field on the user record must track whether onboarding has been completed, to support the bypass logic in Story 2.

### 6c. Integration Constraints

- **Authentication System:** Stories 2, 3, 6, and 7 all require an authenticated user context. The session persistence mechanism (Story 3) implies integration with an existing auth provider or session management layer. `[INFERRED — verify with author: confirm auth system in use, e.g., JWT, OAuth, session cookies]`
- **Dashboard Interface:** Stories 2, 3, 4, and 6 reference a dashboard as the post-onboarding destination. The dashboard must be capable of receiving and displaying a balance value passed from the onboarding completion event. `[INFERRED — verify with author]`
- **Transaction Interface:** Stories 1 and 7 imply that a transaction creation interface exists and consumes the category system. That interface is not defined in this PRD but must be compatible with the category data model defined here. `[INFERRED — verify with author]`

---

## 7. Success Metrics

| Feature Area               | Metric                                                        | Measurement Method                                                                                 | Target                                                                                       |
| -------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Onboarding Flow Management | Onboarding completion rate among new users who begin the flow | Funnel analytics: users who start onboarding ÷ users who reach the dashboard                       | `[TBD — set by product owner]`                                                               |
| Onboarding Flow Management | Returning user dashboard load time bypassing onboarding       | Session routing logs: time from login to dashboard render                                          | ≤ 2 seconds `[INFERRED — verify with author]`                                                |
| Onboarding Flow Management | Session continuity rate post-onboarding                       | Error logs: count of unexpected logouts immediately following onboarding completion                | 0 unintended logouts per 100 completed onboarding sessions `[INFERRED — verify with author]` |
| Balance Configuration      | Balance setup completion rate during onboarding               | Funnel analytics: users who reach balance step ÷ users who submit a valid balance                  | `[TBD — set by product owner]`                                                               |
| Balance Configuration      | Balance validation error recovery rate                        | Event tracking: users who encounter a validation error and successfully correct and submit         | `[TBD — set by product owner]`                                                               |
| Category Management        | Default category adoption rate                                | Analytics: percentage of first transactions that use a default (non-custom) category               | `[TBD — set by product owner]`                                                               |
| Category Management        | Custom category creation rate                                 | Analytics: percentage of users who create at least one custom category within 7 days of onboarding | `[TBD — set by product owner]`                                                               |

---

## 8. Out of Scope

- This PRD does not cover the transaction creation or transaction logging interface, even though stories reference category assignment in that context.
- This PRD does not cover the deletion or archiving of categories (default or custom).
- This PRD does not cover the editing of category names, icons, or colors after creation.
- This PRD does not cover the deletion or deactivation of a user account.
- This PRD does not cover multi-currency support or currency selection during balance setup — a single currency is assumed. `[INFERRED — verify with author]`
- This PRD does not cover budget creation, spending limits, or any financial goal-setting functionality beyond the opening balance.
- This PRD does not cover password reset, email verification, or any other authentication management flow beyond session persistence.
- This PRD does not cover administrative or backend tooling for managing default category sets across the user base.
- This PRD does not cover notifications, reminders, or any asynchronous communication triggered by onboarding events.

---

## 9. Open Questions

| #   | Question                                                                                                                                                              | Relevant Story   | Impact if Unresolved                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | What is the specific list of default categories to be pre-populated, and are they the same for all users or configurable by locale or user segment?                   | Story 1          | Determines database seeding strategy and whether category defaults are global records or per-user copies                              |
| 2   | If a returning user is mid-onboarding (started but not finished), are they routed to the dashboard or returned to their last onboarding step?                         | Story 2          | Requires a definition of "onboarding complete" state and handling for partial completion                                              |
| 3   | What is the session expiry duration, and does it reset on activity or expire on a fixed timer?                                                                        | Story 3          | Directly affects implementation of the session storage mechanism and user re-authentication triggers                                  |
| 4   | Is a balance of ₱0.00 (or the equivalent zero value in the target currency) a valid opening balance, or must users enter a non-zero amount?                           | Story 4, Story 5 | Determines whether the balance step can be skipped or defaulted, affecting onboarding flow gating logic                               |
| 5   | What are the minimum and maximum allowable values for the balance field?                                                                                              | Story 5          | Required to write complete server-side and client-side validation rules                                                               |
| 6   | Can users select a custom icon and color when creating a custom category, or are these system-assigned from a fixed palette?                                          | Story 7, Story 8 | Determines whether a color/icon picker UI component is required in scope                                                              |
| 7   | Is the developer in Story 8 an internal implementer defining a component contract, or does this story imply an exposed API or SDK for third-party category rendering? | Story 8          | Affects whether the icon/color system needs to be documented as a public interface or treated as an internal implementation detail    |
| 8   | Is dark mode in scope for this release? The icon/color contrast requirement in Story 8 behaves differently across themes.                                             | Story 8          | If dark mode is in scope, each category color must be tested against both light and dark backgrounds — doubling the visual QA surface |
| 9   | Is the "edit balance later" feature (Story 6) accessible from the dashboard directly, or only from a dedicated settings screen?                                       | Story 6          | Determines navigation architecture and where the edit affordance must be placed in the UI                                             |
| 10  | Are default categories editable or deletable by the user, or are they fixed?                                                                                          | Story 1, Story 7 | Affects the category data model — fixed defaults can be global records; editable ones require per-user copies                         |

---

_End of PRD v1.0 — All `[INFERRED — verify with author]` flags require author confirmation before this document is used to scope or begin development work._
