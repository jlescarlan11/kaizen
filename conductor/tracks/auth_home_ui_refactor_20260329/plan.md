# Implementation Plan: Authenticated Home UI Refactor

## Phase 1: Research & Navigation Cleanup
- [x] Task: Identify existing `BottomNav`, `Sidebar`, and `HomePage` components. d87b2e1
- [x] Task: Write tests to verify the removal of "Add Entry" from `BottomNav` and `Sidebar`. 67ce80a
- [x] Task: Modify `BottomNav` to remove "Add Entry" and re-center the remaining 4 items (Home, Budget, Goal, Vault). 67ce80a
- [x] Task: Modify `Sidebar` to remove "Add Entry" if present. 67ce80a
- [~] Task: Conductor - User Manual Verification 'Phase 1: Research & Navigation Cleanup' (Protocol in workflow.md)

## Phase 2: Add Entry Floating Action Button
- [ ] Task: Write tests for the `AddEntryFAB` component (visibility, icon, action).
- [ ] Task: Create the `AddEntryFAB` component using `lucide-react` and project styles.
- [ ] Task: Integrate `AddEntryFAB` into the main layout, ensuring it remains at the bottom right on both mobile and desktop.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Add Entry Floating Action Button' (Protocol in workflow.md)

## Phase 3: Home Screen Layout Overhaul
- [ ] Task: Write tests for the new `HomePage` layout and sections.
- [ ] Task: Implement the new Header with three icons (Profile + 2 others).
- [ ] Task: Create shared `SectionHeader` and `SkeletonList` components for consistent loading states.
- [ ] Task: Refactor `HomePage` to include the restructured Transactions, Budget, and Goal sections (latest 3-5 items).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Home Screen Layout Overhaul' (Protocol in workflow.md)

## Phase 4: Final Polish & Verification
- [ ] Task: Verify responsive design across different screen sizes (mobile and desktop).
- [ ] Task: Verify accessibility (ARIA labels for FAB and Nav).
- [ ] Task: Verify consistent application of the Project Green Theme.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Verification' (Protocol in workflow.md)
