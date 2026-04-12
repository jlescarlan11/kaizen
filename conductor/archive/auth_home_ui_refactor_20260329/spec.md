# Specification: Authenticated Home UI Refactor

## Overview
This track involves a significant UI overhaul of the authenticated home screen to align with a new wireframe design. The key changes include restructuring the navigation, moving the "Add Entry" action to a Floating Action Button (FAB) at the bottom right, and updating the layout of the main content sections.

## Functional Requirements

### 1. Navigation Restructuring
- **Mobile:**
  - Transition the bottom navigation bar from 5 items to 4 items: **Home**, **Budget**, **Goal**, and **Vault**.
  - The 4 items should be equally spaced and centered within the bottom bar.
  - The "Add Entry" item is removed from the navigation bar.
- **Desktop:**
  - Maintain the existing sidebar navigation for **Home**, **Budget**, **Goal**, and **Vault**.
  - Remove the "Add Entry" action from the sidebar if it currently exists there.

### 2. "Add Entry" Floating Action Button (FAB)
- Implement a persistent "Add Entry" FAB located at the **bottom right** of the screen on both mobile and desktop.
- **Style:**
  - Icon-only circular button (using a relevant icon from `lucide-react`, e.g., `Plus`).
  - Follow the project's **Primary Green Theme** (`--color-primary`).
  - Should have a shadow (`--shadow-lg`).

### 3. Main Content Sections
- Implement the following sections on the Home screen:
  - **Header:** Top right area containing three icons: Profile picture and two other functional icons (e.g., Notifications and Search/Settings).
  - **Total Balance:** A prominent display of the user's total balance.
  - **Transactions:** A list showing the **3-5 most recent** transactions with a "See all" link.
  - **Budget:** A list of active budgets with progress bars showing the **3-5 most recent/important** budgets with a "See all" link.
  - **Goal:** A list of active goals with progress bars showing the **3-5 most recent/important** goals with a "See all" link.

### 4. Data Loading & Display
- Use **Skeleton Loaders** for all sections while data is being fetched.
- Ensure smooth transitions when data replaces the skeletons.

## Non-Functional Requirements
- **Responsiveness:** The layout must be fully responsive, handling transitions between mobile (bottom nav) and desktop (sidebar) seamlessly.
- **Accessibility:** Ensure the FAB and navigation items have appropriate ARIA labels and focus states.
- **Theme Alignment:** Strictly adhere to the project's existing Green Theme defined in `globals.css`.

## Acceptance Criteria
- [ ] Bottom navigation on mobile shows 4 centered items (Home, Budget, Goal, Vault).
- [ ] Sidebar on desktop shows 4 items (Home, Budget, Goal, Vault).
- [ ] "Add Entry" FAB is visible at the bottom right on both mobile and desktop.
- [ ] FAB performs the "Add Entry" action (e.g., opens a modal or navigates to a form).
- [ ] Transactions, Budget, and Goal sections display the latest 3-5 items with "See all" links.
- [ ] Skeleton loaders are visible during data fetching.
- [ ] UI follows the project's green theme.

## Out of Scope
- Implementation of the full "See all" pages (unless already existing).
- Backend logic changes (this track focuses on the frontend UI/UX).
- Dark mode specific adjustments beyond what is already supported by the theme.
