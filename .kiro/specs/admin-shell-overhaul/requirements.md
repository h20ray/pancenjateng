# Requirements Document

## Introduction

Visual overhaul of the admin shell (sidebar, header, and page layout) to match the modern aesthetic of the shadcn-admin template. This is a cosmetic and UX refactor — no functional changes to business logic, permissions, or data flow. The goal is a cleaner, more minimal admin interface with better spatial organization: branch switcher moves to the sidebar header, user profile moves to the sidebar footer with a dropdown menu, and the header is stripped down to essentials (breadcrumb, search trigger, dark mode toggle, avatar).

## Glossary

- **Admin_Shell**: The top-level layout wrapper comprising the Sidebar, Header, and main content area used by all back-office pages.
- **Sidebar**: The fixed left-side navigation panel (`BackendMenuComponent.vue`) containing menu groups, a header slot, and a footer slot.
- **Header**: The top navigation bar (`BackendNavbarComponent.vue`) spanning the main content area.
- **Branch_Switcher**: The UI control that allows users with multi-branch access to switch the active branch context.
- **User_Menu**: A dropdown/popover menu displaying profile actions (edit profile, change password, logout).
- **Sidebar_Rail**: The collapsed state of the Sidebar showing only icons (icon-only mode).
- **Command_Palette**: The global search overlay triggered by Ctrl+K / Cmd+K.
- **SidebarProvider**: The Vue component wrapping Sidebar + SidebarInset to manage sidebar state.

## Requirements

### Requirement 1: Branch Switcher in Sidebar Header

**User Story:** As an admin user with multi-branch access, I want the branch switcher in the sidebar header area (workspace switcher pattern), so that I can switch branches without cluttering the top header.

#### Acceptance Criteria

1. WHEN the admin user has access to multiple branches (authBranch === 0), THE Sidebar SHALL display a Branch_Switcher control in the sidebar header area below the logo.
2. WHEN the Branch_Switcher is clicked, THE Sidebar SHALL display a popover or dropdown listing all available branches with the current branch indicated.
3. WHEN a branch is selected from the Branch_Switcher dropdown, THE Admin_Shell SHALL update the active branch context and navigate to the default admin page for that branch.
4. WHILE the Sidebar is in collapsed (Sidebar_Rail) state, THE Branch_Switcher SHALL display only the branch icon and show the full branch list on click.
5. WHEN the admin user has access to only a single branch (authBranch !== 0), THE Sidebar SHALL hide the Branch_Switcher control entirely.

### Requirement 2: Sidebar Footer User Menu

**User Story:** As an admin user, I want a user profile section at the bottom of the sidebar with a dropdown menu, so that I can quickly access profile actions without navigating away.

#### Acceptance Criteria

1. THE Sidebar SHALL display the authenticated user's avatar and name in the sidebar footer area.
2. WHEN the user profile area in the sidebar footer is clicked, THE User_Menu SHALL display a drop-up popover containing: Edit Profile link, Change Password link, My Attendance link, and Logout action.
3. WHEN a menu item in the User_Menu is selected, THE Admin_Shell SHALL navigate to the corresponding route or perform the logout action.
4. WHILE the Sidebar is in collapsed (Sidebar_Rail) state, THE sidebar footer SHALL display only the user avatar and show the full User_Menu on click.
5. THE User_Menu SHALL display the user's full name and email in a non-interactive header section above the action links.

### Requirement 3: Minimalized Header

**User Story:** As an admin user, I want a clean, minimal header showing only essential controls, so that the interface feels modern and uncluttered.

#### Acceptance Criteria

1. THE Header SHALL display only the following elements: sidebar toggle (mobile), breadcrumb or page title, Command_Palette search trigger (Ctrl+K), dark mode toggle, and a minimal user avatar.
2. THE Header SHALL NOT display the Branch_Switcher control (moved to Sidebar).
3. THE Header SHALL NOT display the language switcher, attendance pill, cashier session panel, POS order history panel, or POS link.
4. WHEN the minimal user avatar in the Header is clicked, THE Header SHALL display a compact dropdown with Edit Profile and Logout options.
5. WHEN the Command_Palette search trigger is clicked or Ctrl+K is pressed, THE Admin_Shell SHALL open the existing Command_Palette overlay.
6. THE Header SHALL remain fixed at the top of the main content area with a height no greater than 48px.

### Requirement 4: Sidebar Collapse Transitions

**User Story:** As an admin user, I want smooth transitions when the sidebar collapses and expands, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. WHEN the Sidebar transitions between expanded and collapsed states, THE Sidebar SHALL animate the width change with a smooth CSS transition (duration between 150ms and 250ms, ease-out timing).
2. WHILE the Sidebar is in collapsed (Sidebar_Rail) state, THE Sidebar SHALL display menu items as icon-only buttons with consistent 32×32px hit targets.
3. WHILE the Sidebar is in collapsed (Sidebar_Rail) state AND the user hovers over a menu item, THE Sidebar SHALL display a tooltip showing the menu item label on the right side.
4. WHEN the Sidebar transitions to collapsed state, THE main content area SHALL expand to fill the freed horizontal space with a matching transition duration.

### Requirement 5: Consistent Modern Styling

**User Story:** As an admin user, I want the admin shell to have consistent spacing, typography, and visual hierarchy, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Admin_Shell SHALL use the system font stack (Inter or system-ui fallback) with tight line heights (1.2 for headings, 1.5 for body text).
2. THE Sidebar menu items SHALL use consistent icon sizing (16×16px icons) and consistent vertical spacing (4px gap between items, 12px gap between groups).
3. THE Sidebar section labels SHALL use muted foreground color, uppercase text, 11px font size, and 600 font weight.
4. THE Header controls (buttons, avatar) SHALL use consistent sizing (36px height for buttons, 32px for avatar) with 8px gaps between controls.
5. THE Admin_Shell SHALL maintain proper visual hierarchy using the existing HSL color token system: foreground for primary text, muted-foreground for secondary text, border for dividers, accent for hover states.
6. WHILE dark mode is enabled, THE Admin_Shell SHALL apply all styling changes using the existing dark mode CSS variable tokens without introducing new color values.

### Requirement 6: Mobile Sidebar Behavior

**User Story:** As an admin user on a mobile device, I want the sidebar to open as a sheet overlay with the same branch switcher and user menu, so that I have a consistent experience across screen sizes.

#### Acceptance Criteria

1. WHILE the viewport width is below 1024px, THE Sidebar SHALL be hidden by default and accessible via the sidebar toggle button in the Header.
2. WHEN the sidebar toggle is activated on mobile, THE Sidebar SHALL open as a Sheet overlay from the left side containing the Branch_Switcher, navigation menu, and User_Menu in the same layout as the desktop sidebar.
3. WHEN a navigation item is selected in the mobile Sheet sidebar, THE Sidebar SHALL close the Sheet overlay automatically.
4. THE mobile Sheet sidebar SHALL display all elements in expanded (non-collapsed) state regardless of the desktop collapse preference.

### Requirement 7: Relocated Header Controls

**User Story:** As an admin user, I want the language switcher, attendance pill, cashier session panel, and POS controls to remain accessible from appropriate locations, so that no functionality is lost during the visual overhaul.

#### Acceptance Criteria

1. WHERE the language switcher feature is enabled, THE Admin_Shell SHALL relocate the language switcher to the sidebar footer area (above the user profile) or to the User_Menu dropdown.
2. THE Admin_Shell SHALL remove the attendance shift pill from the Header (attendance is already accessible via the dedicated attendance page and sidebar menu).
3. WHERE the POS permission is granted, THE Admin_Shell SHALL retain the POS link as a menu item in the Sidebar navigation rather than in the Header.
4. THE Admin_Shell SHALL retain the cashier session panel and POS order history panel as contextual controls that appear only on POS-related routes, positioned in the Header.
5. IF the admin user navigates to a kitchen-display-system or order-status-screen route, THEN THE Header SHALL display a fullscreen toggle button and a back-to-admin link as contextual controls.
