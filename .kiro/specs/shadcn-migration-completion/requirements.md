# Requirements Document

## Introduction

This specification covers the remaining shadcn-vue migration work for the POS App application. The admin surface primitive migration is complete (all 252 components converted to shadcn-vue primitives). The remaining work spans nine areas: form validation wrappers, custom sidebar, date picker replacement, command palette, dark mode tokens, POS surface migration (17 components), storefront surface migration (46 components), CSS token cleanup, and an order status stepper component.

## Glossary

- **Migration_System**: The overall shadcn-vue migration toolchain including the CLI scaffolder, component source in `resources/js/components/ui/`, the `cn()` utility, and the HSL token bridge
- **Form_Wrapper**: A set of composable form field components (FormField, FormItem, FormLabel, FormMessage) that encapsulate validation display logic currently handled by inline `errors[field]` patterns across admin forms
- **Sidebar_Component**: A responsive navigation component that renders as a fixed panel on desktop viewports and a Sheet slide-in on mobile viewports, replacing the current `.db-sidebar` CSS pattern
- **Date_Picker**: A date/date-range selection component built from shadcn Calendar + Popover primitives, replacing the `@vuepic/vue-datepicker` dependency (currently used in 16 admin components)
- **Command_Palette**: A keyboard-driven search and command interface built from the shadcn Command component, providing quick navigation and entity search
- **Dark_Mode_System**: A CSS class-based theming layer (`.dark` on `<html>`) that flips all HSL token values to dark variants without requiring a rebuild
- **POS_Surface**: The 15 point-of-sale Vue components in `resources/js/components/admin/pos/` plus their sub-components, used by cashiers during live service
- **Storefront_Surface**: The 46 customer-facing Vue components in `resources/js/components/frontend/`, covering navigation, product display, checkout, and account management
- **Token_Cleanup**: The removal of legacy `--md-*` RGB CSS variables from `resources/css/theme-variables.css` and all `rgb(var(--md-*))` references, leaving only HSL `--primary`, `--secondary`, etc.
- **Order_Stepper**: A custom step-progress component for visualizing order status transitions (pending → confirmed → processing → ready → delivered), replacing the current `.db-order-status` CSS pattern
- **Feature_Flag**: A runtime toggle (environment variable or admin setting) that controls which UI version renders for a given surface, enabling instant rollback

## Requirements

### Requirement 1: Form Validation Wrappers

**User Story:** As a developer, I want reusable form field wrapper components, so that I can replace repetitive inline validation markup with a consistent, accessible pattern across all admin forms.

#### Acceptance Criteria

1. THE Migration_System SHALL provide FormField, FormItem, FormLabel, FormControl, and FormMessage components in `resources/js/components/ui/form/`
2. WHEN a form field receives a validation error from the Laravel backend response, THE Form_Wrapper SHALL display the first error message below the input using the FormMessage component
3. WHEN a form field has an active validation error, THE Form_Wrapper SHALL apply a visual error state (red border) to the associated input element
4. THE Form_Wrapper SHALL associate the label, input, and error message using `aria-describedby` and `aria-invalid` attributes for screen reader accessibility
5. WHEN a form field error is cleared (user corrects input or form resubmits successfully), THE Form_Wrapper SHALL remove the error state and error message
6. THE Form_Wrapper SHALL support both Options API (`components:` registration) and Composition API (`<script setup>`) usage patterns
7. THE Form_Wrapper SHALL accept an `errors` object prop matching the existing Laravel validation response shape (`{ field: [messages] }`)

### Requirement 2: Custom Sidebar Component

**User Story:** As a user, I want a responsive sidebar navigation that collapses on mobile and persists on desktop, so that I can navigate the admin panel efficiently on any device.

#### Acceptance Criteria

1. WHILE the viewport width is at or above the desktop breakpoint (md: 768px), THE Sidebar_Component SHALL render as a fixed vertical panel on the left side of the layout
2. WHILE the viewport width is below the desktop breakpoint, THE Sidebar_Component SHALL render as a Sheet slide-in triggered by a hamburger button
3. WHEN the user clicks the sidebar toggle button on desktop, THE Sidebar_Component SHALL collapse to a narrow icon-only state and expand the main content area
4. WHEN the user navigates to a route, THE Sidebar_Component SHALL highlight the active menu item corresponding to the current route
5. THE Sidebar_Component SHALL preserve the existing menu structure (parent items, child items, SVG icons, labels) from BackendMenuComponent
6. WHILE the POS or Kitchen Display System route is active, THE Sidebar_Component SHALL hide itself entirely
7. THE Sidebar_Component SHALL use the Sheet primitive from `resources/js/components/ui/sheet/` for the mobile drawer implementation

### Requirement 3: Date Picker Replacement

**User Story:** As a developer, I want a native shadcn-based date picker component, so that I can remove the `@vuepic/vue-datepicker` dependency and maintain a consistent design system.

#### Acceptance Criteria

1. THE Migration_System SHALL provide Calendar and Popover components scaffolded in `resources/js/components/ui/calendar/` and `resources/js/components/ui/popover/`
2. THE Date_Picker SHALL support single date selection and date range selection modes
3. THE Date_Picker SHALL support preset range shortcuts (today, this week, this month, last month, this year, last year) matching the current datepicker preset configuration
4. WHEN the user selects a date or range, THE Date_Picker SHALL emit the selected value in ISO 8601 format compatible with the existing `date-fns` formatting used in list filters
5. THE Date_Picker SHALL support RTL layout direction based on the active frontend language setting
6. WHEN the Date_Picker replaces all 16 existing `@vuepic/vue-datepicker` usages, THE Migration_System SHALL remove `@vuepic/vue-datepicker` from `package.json`
7. THE Date_Picker SHALL display the selected date formatted according to the application locale

### Requirement 4: Command Palette

**User Story:** As an admin user, I want a keyboard-accessible command palette, so that I can quickly search for and navigate to any admin page or entity without clicking through menus.

#### Acceptance Criteria

1. THE Migration_System SHALL scaffold the Command component (Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator) in `resources/js/components/ui/command/`
2. WHEN the user presses Ctrl+K (or Cmd+K on macOS), THE Command_Palette SHALL open as a centered modal overlay
3. WHEN the user types in the command input, THE Command_Palette SHALL filter available navigation items and display matching results within 100ms of keystroke
4. WHEN the user selects a command item (via click or Enter key), THE Command_Palette SHALL navigate to the corresponding admin route and close the overlay
5. THE Command_Palette SHALL group results by category (pages, settings, entities) with labeled section headers
6. WHEN no results match the search query, THE Command_Palette SHALL display an empty state message
7. WHEN the user presses Escape or clicks outside the overlay, THE Command_Palette SHALL close without navigation

### Requirement 5: Dark Mode Token Set

**User Story:** As a tenant administrator, I want to enable dark mode for the admin interface, so that users can work comfortably in low-light environments.

#### Acceptance Criteria

1. THE Dark_Mode_System SHALL define a complete `.dark` CSS class token override set in the application stylesheet covering all shadcn semantic tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring)
2. WHEN the `.dark` class is present on the `<html>` element, THE Dark_Mode_System SHALL apply dark color values to all shadcn-vue components without requiring a CSS rebuild
3. THE Dark_Mode_System SHALL store the dark mode preference as a `dark_mode` key in the theme settings group via the existing ThemeService
4. WHEN no explicit dark mode preference is stored, THE Dark_Mode_System SHALL respect the user's operating system `prefers-color-scheme` media query as the default
5. WHEN the admin toggles dark mode in the theme settings panel, THE Dark_Mode_System SHALL apply the change immediately without a page reload
6. THE Dark_Mode_System SHALL maintain WCAG 2.1 AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) for all token pairings in dark mode

### Requirement 6: POS Surface Migration

**User Story:** As a product owner, I want the POS interface migrated to shadcn-vue components, so that the design system is consistent across all surfaces and the POS benefits from accessible, maintainable primitives.

#### Acceptance Criteria

1. THE Migration_System SHALL convert all 15 POS Vue components in `resources/js/components/admin/pos/` to use shadcn-vue primitives (Button, Dialog, Input, Select, Card, Sheet, DropdownMenu, RadioGroup, Checkbox, Table)
2. THE Migration_System SHALL provide a Feature_Flag (`VITE_FEATURE_POS_SHADCN`) that controls whether the new or legacy POS UI renders
3. WHILE the Feature_Flag is disabled, THE POS_Surface SHALL render using the current component markup without visual or functional changes
4. WHEN the Feature_Flag is enabled, THE POS_Surface SHALL render using shadcn-vue components with equivalent functionality
5. THE POS_Surface migration SHALL preserve all existing POS functionality: item browsing, cart management, payment processing, receipt generation, customer creation, session management, and order history
6. IF a critical bug is discovered in the new POS UI during live service, THEN THE Feature_Flag SHALL allow immediate rollback to the legacy UI without deployment
7. THE POS_Surface migration SHALL replace all `pos-*` custom CSS classes with Tailwind utilities and shadcn component props
8. THE POS_Surface migration SHALL maintain offline-capable behavior for the cart and order submission flow

### Requirement 7: Storefront Surface Migration

**User Story:** As a product owner, I want the customer-facing storefront migrated to shadcn-vue components, so that the storefront shares the same design tokens and component quality as the admin surface.

#### Acceptance Criteria

1. THE Migration_System SHALL convert all 46 storefront Vue components in `resources/js/components/frontend/` to use shadcn-vue primitives where applicable (Button, Dialog, Input, Card, Sheet, Tabs, Badge, Checkbox, RadioGroup, Select)
2. THE Migration_System SHALL provide a Feature_Flag (`VITE_FEATURE_STOREFRONT_SHADCN`) that controls whether the new or legacy storefront UI renders
3. WHILE the Feature_Flag is disabled, THE Storefront_Surface SHALL render using the current component markup without visual or functional changes
4. WHEN the Feature_Flag is enabled, THE Storefront_Surface SHALL render using shadcn-vue components with equivalent functionality
5. THE Storefront_Surface migration SHALL preserve all existing storefront functionality: product browsing, cart management, checkout flow, coupon application, order tracking, account management, and authentication
6. THE Storefront_Surface migration SHALL maintain responsive behavior across mobile (320px), tablet (768px), and desktop (1280px) viewport widths
7. THE Storefront_Surface migration SHALL preserve SEO-relevant markup structure (semantic headings, structured data, meta tags) during component conversion
8. THE Storefront_Surface migration SHALL not increase Largest Contentful Paint (LCP) by more than 200ms compared to the pre-migration baseline on a 4G connection

### Requirement 8: Token Cleanup

**User Story:** As a developer, I want all legacy RGB token variables removed, so that the codebase has a single, consistent HSL token system without dead CSS variables.

#### Acceptance Criteria

1. WHEN all three surfaces (admin, POS, storefront) are fully migrated to shadcn-vue components, THE Token_Cleanup SHALL remove all `--md-*` variable definitions from `resources/css/theme-variables.css`
2. THE Token_Cleanup SHALL remove all `rgb(var(--md-*))` patterns from Tailwind configuration and Vue component templates
3. WHEN the token cleanup is complete, THE Migration_System SHALL produce zero CSS variable undefined warnings during `npm run build`
4. THE Token_Cleanup SHALL verify that all three surfaces render correctly with only HSL tokens active by running the application and confirming no visual regressions
5. THE Token_Cleanup SHALL update the ThemeResource and theme settings panel to output and consume only HSL-format color values
6. IF a third-party integration or print stylesheet references legacy `--md-*` tokens, THEN THE Token_Cleanup SHALL provide equivalent HSL token mappings in a documented compatibility note

### Requirement 9: Order Status Stepper

**User Story:** As a user viewing order details, I want a clear visual stepper showing order progress, so that I can understand the current status and remaining steps at a glance.

#### Acceptance Criteria

1. THE Order_Stepper SHALL render a horizontal step-progress indicator showing all status stages for the given order type (delivery: pending → confirmed → processing → out-for-delivery → delivered; takeaway: pending → confirmed → processing → ready)
2. WHEN the order status value changes, THE Order_Stepper SHALL visually mark all completed steps with a filled indicator and the current step with an active highlight
3. THE Order_Stepper SHALL support both delivery and takeaway order type step sequences using the existing `deliveryArray` and `takeawayArray` enum definitions
4. THE Order_Stepper SHALL replace the current `.db-order-status` CSS pattern in both the admin OrderStatusComponent and the frontend OrderStatusComponent
5. THE Order_Stepper SHALL be responsive, displaying steps horizontally on desktop and stacking vertically on narrow mobile viewports (below 480px)
6. THE Order_Stepper SHALL use shadcn design tokens (primary, muted, border) for consistent theming with the rest of the design system
