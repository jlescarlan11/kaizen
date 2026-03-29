# Implementation Plan: Authenticated Home UI Refactor

## Phase 1: Research & Navigation Cleanup [checkpoint: 45d28bf]
- [x] Task: Identify existing `BottomNav`, `Sidebar`, and `HomePage` components. d87b2e1
- [x] Task: Write tests to verify the removal of "Add Entry" from `BottomNav` and `Sidebar`. 67ce80a
- [x] Task: Modify `BottomNav` to remove "Add Entry" and re-center the remaining 4 items (Home, Budget, Goal, Vault). 67ce80a
- [x] Task: Modify `Sidebar` to remove "Add Entry" if present. 67ce80a
- [x] Task: Conductor - User Manual Verification 'Phase 1: Research & Navigation Cleanup' (Protocol in workflow.md) 45d28bf

## Phase 2: Add Entry Floating Action Button [checkpoint: f9bd7c4]
- [x] Task: Write tests for the `AddEntryFAB` component (visibility, icon, action). 45d28bf
- [x] Task: Create the `AddEntryFAB` component using `lucide-react` and project styles. 45d28bf
- [x] Task: Integrate `AddEntryFAB` into the main layout, ensuring it remains at the bottom right on both mobile and desktop. f9bd7c4
- [x] Task: Conductor - User Manual Verification 'Phase 2: Add Entry Floating Action Button' (Protocol in workflow.md) f9bd7c4

## Phase 3: Home Screen Layout Overhaul [checkpoint: e64252c]
- [x] Task: Write tests for the new `HomePage` layout and sections. f9bd7c4
- [x] Task: Implement the new Header with three icons (Profile + 2 others). f9bd7c4
- [x] Task: Create shared `SectionHeader` and `SkeletonList` components for consistent loading states. f9bd7c4
- [x] Task: Refactor `HomePage` to include the restructured Transactions, Budget, and Goal sections (latest 3-5 items). e64252c
- [x] Task: Conductor - User Manual Verification 'Phase 3: Home Screen Layout Overhaul' (Protocol in workflow.md) e64252c

## Phase 4: Final Polish & Verification
- [x] Task: Verify responsive design across different screen sizes (mobile and desktop). e64252c
- [x] Task: Verify accessibility (ARIA labels for FAB and Nav). e64252c
- [x] Task: Verify consistent application of the Project Green Theme. e64252c
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Verification' (Protocol in workflow.md) e64252c
