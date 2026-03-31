# Implementation Plan: Transaction Details UI/UX Update

## Phase 1: Research & Setup
- [x] Task: Audit existing Transaction Details components in `frontend/src/features/transactions/`.
- [x] Task: Define the "Flat UI" design system tokens (borders, typography) if not already standardized.
- [ ] Task: Conductor - User Manual Verification 'Research & Setup' (Protocol in workflow.md)

## Phase 2: Core UI Refactoring (TDD)
- [x] Task: Write tests for the new `TransactionDetailHeader` and `TransactionDetailInfo` components.
- [x] Task: Implement `TransactionDetailHeader` using high-signal typography for Amount and Date (PHP prefix).
- [x] Task: Implement `TransactionDetailInfo` for Category, Account, and Flow indicators (Incoming vs. Outgoing).
- [x] Task: Refactor the main `TransactionDetailView` to use these new components with clean borders and minimal shadows.
- [x] Task: Conductor - User Manual Verification 'Core UI Refactoring' (Protocol in workflow.md) [checkpoint: 2e8d9d6]

## Phase 3: Actions & Management (TDD)
- [x] Task: Write tests for the `TransactionActionGroup` component (Edit, Delete, Duplicate).
- [x] Task: Implement `TransactionActionGroup` with high-visibility buttons or icons.
- [x] Task: Ensure all actions are properly wired to existing Redux thunks or services.
- [x] Task: Conductor - User Manual Verification 'Actions & Management' (Protocol in workflow.md) [checkpoint: 3bf324e]

## Phase 4: History & Context (TDD)
- [ ] Task: Write tests for the `RelatedTransactionsList` component.
- [ ] Task: Implement `RelatedTransactionsList` to fetch and display transactions from the same category or merchant.
- [ ] Task: Implement `TransactionNoteSection` and `AttachmentViewer` for better scannability.
- [ ] Task: Integrate history and notes into the main detail view.
- [ ] Task: Conductor - User Manual Verification 'History & Context' (Protocol in workflow.md)

## Phase 5: Polishing & Accessibility
- [ ] Task: Perform a visual audit against "Flat UI Architecture" guidelines.
- [ ] Task: Run accessibility checks (WCAG) on the new components.
- [ ] Task: Verify responsive behavior on mobile (touch targets, scrolling).
- [ ] Task: Conductor - User Manual Verification 'Polishing & Accessibility' (Protocol in workflow.md)
