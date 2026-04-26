# Per-Feature Undo Policy

This document records the deliberate undo decisions for each feature that exposes a
destructive action. It closes audit finding U-FRM-9.

---

## Transactions — undo **enabled** (infrastructure ready; not yet wired)

**Status:** The `triggerDeleteWithUndo` thunk and `UndoSnackbar` component exist and are
mounted in both layout roots. The thunk is transaction-specific (calls `transactionApi`
internally). As of this writing the bulk-delete and single-delete confirm callbacks call
the mutation directly and show a success alert instead of triggering the undo flow. The
infrastructure is ready to be wired whenever the product owner decides to activate it.

**Rationale:** Transactions are high-frequency data entry. Accidental deletes are
likely, especially in bulk-select mode. Undo is the correct UX here; the scaffolding
has been intentionally left in place.

**Location:** `src/app/store/notificationSlice.ts` — `triggerDeleteWithUndo` thunk.
`src/shared/components/UndoSnackbar.tsx` — rendered in `AuthenticatedLayout` and
`RootLayout`.

---

## Payment Methods — no undo (by design)

**Rationale:** Low-frequency action. The `DestructiveActionDialog` already requires
explicit confirmation, and the transaction-count warning surfaces in the dialog when
the method has associated transactions. An extra undo step adds complexity without
meaningful safety benefit.

**Note:** The `notificationSlice` undo thunk is transaction-scoped and cannot be
reused for payment methods without architectural changes.

---

## Categories — no undo (by design)

**Rationale:** There is no individual category delete flow in the current codebase.
Categories can only be edited or merged via `MergeCategoriesModal`. The merge action is
destructive (permanently removes the source category) but is gated by a two-step
confirmation flow inside the modal, which is the equivalent safety gate. Low-frequency;
no undo warranted.

---

## Budgets — no undo (by design)

**Rationale:** Budget "deletion" in the current codebase is a session-local Redux
`removePendingBudget` dispatch inside the onboarding/setup flow (`ManualBudgetSetupPage`).
It removes a pending entry before the budget batch is persisted. No backend call is made
at the point of removal; the user can re-add the budget before saving the batch. No undo
snackbar is needed.

For any future persisted budget delete, the same rationale as payment methods applies
(low-frequency; destructive dialog provides sufficient confirmation).

---

## Logout — N/A

Logout is a session-level action, not a data delete. No undo concept applies.
The `LogoutConfirmationModal` provides the required confirmation gate.
