# Implementation Plan: Admin Shell Overhaul

## Overview

Incremental refactor of the admin shell layout to match the shadcn-admin aesthetic. New sub-components are built first (BranchSwitcher, SidebarUserMenu, HeaderAvatarMenu), then existing components are refactored to consume them. The approach preserves all existing business logic, permissions, and data flows while reorganizing the spatial layout.

## Tasks

- [x] 1. Create new sub-components
  - [x] 1.1 Create BranchSwitcher.vue component
    - Create `resources/js/components/layouts/backend/BranchSwitcher.vue` using `<script setup lang="ts">`
    - Implement Popover-based branch selector using shadcn-vue `Popover`, `PopoverTrigger`, `PopoverContent`
    - Accept props: `collapsed` (boolean), `branches` (array), `currentBranch` (object), `authBranch` (number)
    - Emit `change` event with selected branch ID
    - Render nothing when `authBranch !== 0` (single branch)
    - When collapsed: render icon-only 38×38 button; click opens Popover with full branch list
    - When expanded: render icon + branch name + chevron; click opens Popover
    - Mark current branch as active/selected in the list
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 1.2 Create SidebarUserMenu.vue component
    - Create `resources/js/components/layouts/backend/SidebarUserMenu.vue` using `<script setup lang="ts">`
    - Implement drop-up menu using shadcn-vue `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent` (side="top")
    - Accept props: `collapsed` (boolean), `user` (object with name, email, image)
    - Emit `logout` event
    - Render avatar + name when expanded, avatar-only when collapsed
    - DropdownMenu content: non-interactive header (name + email), separator, Edit Profile link, Change Password link, My Attendance link, separator, Logout button
    - Use `router-link` for navigation items
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.3 Create HeaderAvatarMenu.vue component
    - Create `resources/js/components/layouts/backend/HeaderAvatarMenu.vue` using `<script setup lang="ts">`
    - Implement compact avatar dropdown using shadcn-vue `DropdownMenu`
    - Accept props: `user` (object with name, image)
    - Emit `logout` event
    - Render 32px avatar button as trigger
    - DropdownMenu content: Edit Profile link + Logout button
    - _Requirements: 3.4_

- [x] 2. Update Sidebar.vue CSS and transitions
  - [x] 2.1 Update Sidebar.vue positioning and height
    - In `resources/js/components/ui/sidebar/Sidebar.vue`, change `top-16` to `top-0` on the `<aside>` element
    - Change `h-[calc(100svh-4rem)]` to `h-dvh` for full viewport height
    - Add `duration-200 ease-out` transition classes (already has `transition-[left,right,width]`)
    - Ensure collapsed state uses `--sidebar-width-icon` (3.5rem) and expanded uses `--sidebar-width` (16rem)
    - _Requirements: 4.1, 4.4_

  - [x] 2.2 Add Tooltip integration for collapsed sidebar items
    - In `SidebarItem.vue` (or equivalent menu item component), wrap collapsed-state items with shadcn-vue `Tooltip`, `TooltipTrigger`, `TooltipContent`
    - Show tooltip with menu item label on hover when sidebar is collapsed
    - Tooltip appears on the right side of the item
    - Ensure 32×32px hit targets for collapsed menu items
    - _Requirements: 4.2, 4.3_

- [x] 3. Refactor BackendMenuComponent.vue
  - [x] 3.1 Integrate BranchSwitcher into sidebar header slot
    - Import and render `BranchSwitcher` in the `#header` slot of the Sidebar
    - Pass `collapsed` from slot scope, `branches` from `backendBranches()`, `currentBranch` from `backendBranchShow()`, `authBranch` from store getter
    - Handle `@change` event: call `changeBranch()` action and navigate to default admin page
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 3.2 Integrate SidebarUserMenu into sidebar footer slot
    - Import and render `SidebarUserMenu` in the `#footer` slot of the Sidebar
    - Pass `collapsed` from slot scope, `user` object from `authInfo` store getter (name, email, image)
    - Handle `@logout` event: call existing logout action
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.3 Add LanguageSwitcher to sidebar footer
    - Relocate the language switcher control to the sidebar footer area, above the UserMenu
    - Conditionally render only when language feature is enabled
    - Use existing `useFrontendLanguageStore().lists` for language data
    - _Requirements: 7.1_

  - [x] 3.4 Add POS link as sidebar navigation item
    - Add POS link as a menu item in the sidebar navigation (not header)
    - Conditionally render based on POS permission from `authPermission`
    - _Requirements: 7.3_

- [x] 4. Checkpoint - Verify new sub-components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Refactor BackendNavbarComponent.vue
  - [x] 5.1 Strip header to essential controls
    - Remove: branch selector, language switcher, attendance pill, POS link from the header template
    - Retain: SidebarTrigger (mobile toggle), breadcrumb/page title, Command Palette trigger (Ctrl+K), dark mode toggle
    - Add `HeaderAvatarMenu` component with user data and logout handler
    - Set header max height to 48px with proper flex layout (left: trigger + breadcrumb, right: cmd + dark mode + avatar)
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [x] 5.2 Retain contextual POS controls
    - Keep `CashierSessionPanelShadcn` and `PosOrderHistoryPanelShadcn` visible only on POS-related routes
    - Keep fullscreen toggle + back-to-admin link for KDS/OSS routes
    - Use route-based conditional rendering (existing pattern)
    - _Requirements: 7.4, 7.5_

  - [x] 5.3 Wire Command Palette trigger
    - Ensure the search trigger button in the header opens the existing `CommandPaletteComponent` overlay
    - Preserve Ctrl+K / Cmd+K keyboard shortcut behavior
    - _Requirements: 3.5_

- [x] 6. Refactor DefaultComponent.vue layout
  - [x] 6.1 Move header inside SidebarInset
    - Move `BackendNavbarComponent` rendering from outside `SidebarInset` to inside it (before `<main>`)
    - This positions the header within the content area rather than spanning the full viewport width
    - Ensure the header is sticky/fixed at the top of the inset area
    - _Requirements: 3.6, 4.4_

  - [x] 6.2 Update main content area transitions
    - Ensure `SidebarInset` expands to fill freed horizontal space when sidebar collapses
    - Add matching transition duration to the inset area (200ms ease-out)
    - Remove legacy `sidebar-collapsed` / `sidebar-hidden` CSS class logic if no longer needed
    - _Requirements: 4.1, 4.4_

- [x] 7. Apply consistent modern styling
  - [x] 7.1 Update sidebar menu item styling
    - Set icon sizing to 16×16px for all sidebar menu items
    - Set 4px vertical gap between items, 12px gap between groups
    - Set section labels: muted-foreground color, uppercase, 11px font size, 600 font weight
    - _Requirements: 5.2, 5.3_

  - [x] 7.2 Update header control sizing
    - Set header buttons to 36px height, avatar to 32px
    - Set 8px gaps between header controls
    - Use existing HSL color tokens for visual hierarchy
    - _Requirements: 5.4, 5.5_

  - [x] 7.3 Verify dark mode compatibility
    - Ensure all new/modified components use existing dark mode CSS variable tokens
    - No new color values introduced — rely on `--foreground`, `--muted-foreground`, `--background`, `--accent`, `--border`, `--primary` tokens
    - _Requirements: 5.6_

- [x] 8. Mobile sidebar behavior
  - [x] 8.1 Verify mobile Sheet contains all elements
    - Confirm the Sheet overlay (already in Sidebar.vue) renders BranchSwitcher, navigation menu, and UserMenu in expanded state
    - The Sheet already passes `collapsed="false"` to slots — verify BranchSwitcher and UserMenu render correctly in this context
    - Ensure Sheet closes on navigation item selection (existing `watch(route)` behavior)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Ensure SidebarTrigger visibility on mobile
    - Confirm SidebarTrigger in the header is visible below 1024px viewport (`lg:hidden` or always visible)
    - Verify it toggles `adminMobileSidebarOpen` state
    - _Requirements: 6.1_

- [x] 9. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [x]* 10. Property-based tests
  - [x]* 10.1 Write property test for branch list completeness
    - **Property 1: Branch list completeness and current indicator**
    - Generate random branch arrays and current branch IDs with fast-check
    - Assert all branches appear in rendered list and exactly one is marked active
    - **Validates: Requirements 1.2**

  - [x]* 10.2 Write property test for user info rendering
    - **Property 2: User info rendering in sidebar footer**
    - Generate random user objects (non-empty name, image URL) with fast-check
    - Assert rendered output contains `<img>` with matching src and text with user name
    - **Validates: Requirements 2.1**

  - [x]* 10.3 Write property test for user menu header
    - **Property 3: User menu header displays identity**
    - Generate random user objects (name, email) with fast-check
    - Assert dropdown header section contains both name and email as text
    - **Validates: Requirements 2.5**

  - [x]* 10.4 Write property test for collapsed tooltip labels
    - **Property 4: Collapsed menu items show tooltip with label**
    - Generate random menu item labels with fast-check
    - Assert tooltip content matches the label text when sidebar is collapsed
    - **Validates: Requirements 4.3**

  - [x]* 10.5 Write property test for menu item dimensions
    - **Property 5: Menu item dimensional consistency**
    - Generate random menu items with fast-check
    - Assert icon is 16×16px and collapsed hit target is 32×32px with 4px spacing
    - **Validates: Requirements 4.2, 5.2**

- [x]* 11. Unit tests for new components
  - [x]* 11.1 Write unit tests for BranchSwitcher
    - Test: hidden when `authBranch !== 0`
    - Test: shows icon-only when collapsed
    - Test: branch selection emits `change` event
    - _Requirements: 1.3, 1.4, 1.5_

  - [x]* 11.2 Write unit tests for BackendNavbarComponent (revised)
    - Test: header contains only specified elements (trigger, breadcrumb, cmd, dark mode, avatar)
    - Test: header does NOT contain removed elements (branch selector, language, attendance, POS)
    - Test: header height ≤ 48px
    - Test: avatar click shows Edit Profile + Logout
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x]* 11.3 Write unit tests for mobile sidebar behavior
    - Test: sidebar hidden below 1024px
    - Test: Sheet contains BranchSwitcher + nav + UserMenu
    - Test: Sheet always shows expanded state
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All components use `<script setup lang="ts">` and shadcn-vue primitives (no Bootstrap, no Vuex)
- State management uses existing Pinia stores and `globalStateService`
- No new API calls or data models — purely presentational refactor

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["5.1", "5.2", "5.3", "6.1"] },
    { "id": 3, "tasks": ["6.2", "7.1", "7.2", "7.3"] },
    { "id": 4, "tasks": ["8.1", "8.2"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 6, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
