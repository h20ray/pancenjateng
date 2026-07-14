# Implementation Plan: shadcn-migration-completion

## Overview

Complete the shadcn-vue migration by scaffolding remaining primitives (Form, Calendar, Popover, Command, Sidebar, Stepper), building the dark mode token set, migrating POS and storefront surfaces behind feature flags, and performing final token cleanup. Tasks follow the design's migration sequence to ensure each layer builds on the previous.

## Tasks

- [x] 1. Scaffold new UI primitives and shared infrastructure
  - [x] 1.1 Scaffold Form components (FormField, FormItem, FormLabel, FormControl, FormMessage)
    - Create `resources/js/components/ui/form/` directory
    - Implement `FormField.vue` with provide/inject pattern exposing `{ fieldName, fieldErrors, fieldId }`
    - Implement `FormItem.vue` as a flex-col gap layout container
    - Implement `FormLabel.vue` with error-state styling (red text when field has errors)
    - Implement `FormControl.vue` that injects context and applies `aria-invalid`, `aria-describedby` to slot child
    - Implement `FormMessage.vue` that injects context and renders the first error message
    - Create `resources/js/components/ui/form/index.ts` re-exporting all form components
    - Update `resources/js/components/ui/index.ts` to export form components
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.2 Scaffold Calendar and Popover primitives via shadcn-vue CLI
    - Run `npx shadcn-vue@latest add calendar` to scaffold Calendar into `resources/js/components/ui/calendar/`
    - Run `npx shadcn-vue@latest add popover` to scaffold Popover into `resources/js/components/ui/popover/`
    - Update `resources/js/components/ui/index.ts` to re-export Calendar and Popover
    - _Requirements: 3.1_

  - [x] 1.3 Build DatePicker wrapper component
    - Create `resources/js/components/ui/date-picker/DatePicker.vue` composing Calendar inside Popover
    - Implement single date and range selection modes via `mode` prop
    - Implement preset range shortcuts (today, this week, this month, last month, this year, last year)
    - Format trigger button display using `date-fns` with locale support
    - Emit ISO 8601 strings (`YYYY-MM-DD`) on selection
    - Support RTL via `dir` attribute propagation
    - Create `resources/js/components/ui/date-picker/index.ts` and update `resources/js/components/ui/index.ts`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_

  - [x] 1.4 Scaffold Command primitive and build CommandPalette integration
    - Run `npx shadcn-vue@latest add command` to scaffold Command into `resources/js/components/ui/command/`
    - Update `resources/js/components/ui/index.ts` to re-export Command components
    - Create `resources/js/components/admin/components/CommandPaletteComponent.vue`
    - Register `Ctrl+K` / `Cmd+K` global keyboard shortcut to open
    - Populate items from admin menu structure grouped by category (pages, settings, entities)
    - Implement client-side filtering with case-insensitive substring match on label and keywords
    - Handle item selection → `vue-router` navigation → close overlay
    - Handle Escape and click-outside to close
    - Display empty state when no results match
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 1.5 Build Sidebar component
    - Create `resources/js/components/ui/sidebar/` directory
    - Implement `Sidebar.vue` with responsive switch: fixed panel (≥768px) vs Sheet slide-in (<768px)
    - Implement `SidebarContent.vue` as scrollable nav container
    - Implement `SidebarGroup.vue` for menu groups with optional label
    - Implement `SidebarItem.vue` with icon + label + active state (matched via `vue-router` current route)
    - Implement `SidebarToggle.vue` for collapse/expand trigger
    - Persist collapsed state in `localStorage` key `sidebar-collapsed`
    - Hide sidebar entirely when route matches `/admin/pos` or `/admin/kds`
    - Use Sheet from `resources/js/components/ui/sheet/` for mobile drawer
    - Create `resources/js/components/ui/sidebar/index.ts` and update `resources/js/components/ui/index.ts`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.6 Build Order Status Stepper component
    - Create `resources/js/components/ui/stepper/` directory
    - Implement `Stepper.vue` root container with horizontal/vertical responsive orientation (switches at 480px)
    - Implement `StepperItem.vue` with completed/active/pending visual states and connector lines
    - Support delivery and takeaway step sequences via `steps` prop
    - Mark completed steps (filled circle + checkmark), active step (ring highlight + pulse), pending steps (muted circle)
    - Create `resources/js/components/ui/stepper/index.ts` and update `resources/js/components/ui/index.ts`
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_

  - [x] 1.7 Create useFeatureFlags composable
    - Create `resources/js/composables/useFeatureFlags.ts`
    - Implement `useFeatureFlags()` returning `{ posShadcn, storefrontShadcn }` from `import.meta.env`
    - Default to `false` when env vars are not defined
    - Add `VITE_FEATURE_POS_SHADCN` and `VITE_FEATURE_STOREFRONT_SHADCN` to `.env.example`
    - _Requirements: 6.2, 7.2_

- [x] 2. Build dark mode token set and toggle
  - [x] 2.1 Define dark mode CSS tokens
    - Add `.dark` class override block to `resources/css/theme-variables.css` (or a dedicated `resources/css/dark-mode.css` imported in `app.css`)
    - Define all semantic tokens: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring
    - Ensure all foreground/background pairings meet WCAG 2.1 AA contrast ratios (4.5:1 normal text, 3:1 large text)
    - _Requirements: 5.1, 5.2, 5.6_

  - [x] 2.2 Implement dark mode Pinia store and toggle
    - Create `resources/js/stores/useDarkModeStore.ts` with `enabled` and `source` state
    - Implement `initialize()` action: check ThemeResource for `dark_mode` setting, fallback to `prefers-color-scheme`
    - Implement `toggle()` action: add/remove `.dark` class on `document.documentElement`
    - Implement `applyToDocument()` action for initial boot application
    - Persist preference via ThemeService API (`PUT /api/admin/setting/theme`)
    - Default to light mode when no preference exists
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 3. Checkpoint - Primitives and dark mode
  - Ensure all new UI primitives render correctly, dark mode toggle works, and no build errors. Ask the user if questions arise.

- [x] 4. Migrate POS surface (feature-flagged)
  - [x] 4.1 Create shadcn variants for POS layout and catalog components
    - Create `PosComponentShadcn.vue` — main layout shell using Card, Sheet, and Tailwind utilities
    - Create `PosCatalogPanelShadcn.vue` — item grid/list using Card, Button, Input for search
    - Create `PosCartPanelShadcn.vue` — cart sidebar using Card, Table, Button, Badge
    - Create `ItemComponentShadcn.vue` — individual item card using Card, Button
    - Wire feature flag conditional rendering in parent components using `useFeatureFlags().posShadcn`
    - Replace all `pos-*` CSS classes with Tailwind utilities and shadcn component props
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_

  - [x] 4.2 Create shadcn variants for POS modal and payment components
    - Create `ItemInfoModalComponentShadcn.vue` using Dialog
    - Create `PaymentComponentShadcn.vue` using Card, Button, RadioGroup, Input
    - Create `PosAddCustomerModalComponentShadcn.vue` using Dialog, Input, Button
    - Create `PosCheckoutIdentityModalShadcn.vue` using Dialog, Select, Input
    - Create `ReceiptComponentShadcn.vue` using Card for display layout
    - Wire feature flag conditional rendering
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 4.3 Create shadcn variants for POS session and utility components
    - Create `CashierSessionPanelShadcn.vue` using Card, Button, Table
    - Create `CashierSessionReportComponentShadcn.vue` using Card, Table, Badge
    - Create `PosOrderHistoryPanelShadcn.vue` using Table, Badge, Button, Sheet
    - Create `PosShiftGateCardShadcn.vue` using Card, Button
    - Create `PosOfflineBannerShadcn.vue` using Badge/alert styling with Tailwind
    - Create `CreateCustomerAddressComponentShadcn.vue` using FormField, Input, Select, Button
    - Wire feature flag conditional rendering
    - Maintain offline-capable behavior for cart and order submission
    - _Requirements: 6.1, 6.4, 6.5, 6.6, 6.8_

  - [x]* 4.4 Write unit tests for POS feature flag switching
    - Test that legacy components render when `VITE_FEATURE_POS_SHADCN` is `false`
    - Test that shadcn components render when `VITE_FEATURE_POS_SHADCN` is `true`
    - Test cart management, payment flow, and session management in shadcn variants
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 5. Checkpoint - POS migration
  - Ensure all POS shadcn variants render correctly with feature flag enabled, no build errors, and existing POS functionality preserved. Ask the user if questions arise.

- [x] 6. Migrate storefront surface (feature-flagged)
  - [x] 6.1 Create shadcn variants for storefront home and navigation components
    - Migrate `frontend/home/` components to use Button, Card, Badge, Skeleton
    - Migrate `frontend/components/` shared components (navbar, footer) to shadcn primitives
    - Wire feature flag conditional rendering using `useFeatureFlags().storefrontShadcn`
    - Preserve responsive behavior at 320px / 768px / 1280px
    - Preserve SEO markup (semantic headings, structured data, meta tags)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7_

  - [x] 6.2 Create shadcn variants for storefront menu and product components
    - Migrate `frontend/menu/` components to use Card, Button, Badge, Tabs, Select
    - Migrate `frontend/search/` components to use Input, Card, Skeleton
    - Migrate `frontend/offers/` components to use Card, Badge, Button
    - Wire feature flag conditional rendering
    - Preserve responsive behavior and SEO markup
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.7_

  - [x] 6.3 Create shadcn variants for storefront checkout and account components
    - Migrate `frontend/checkout/` components to use Card, Button, Input, RadioGroup, Select, Dialog
    - Migrate `frontend/account/` components to use Card, Input, Button, Table, Tabs
    - Migrate `frontend/auth/` components to use Card, Input, Button, FormField wrappers
    - Wire feature flag conditional rendering
    - Preserve all checkout flow functionality: cart, payment, address selection, coupon application
    - Preserve account management: profile, order history, addresses
    - _Requirements: 7.1, 7.4, 7.5, 7.6_

  - [x] 6.4 Replace OrderStatusComponent with Stepper in both surfaces
    - Replace `admin/components/OrderStatusComponent.vue` usage with the new Stepper component
    - Replace `frontend/components/OrderStatusComponent.vue` usage with the new Stepper component
    - Remove `.db-order-status` CSS pattern references
    - Support delivery and takeaway step sequences
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x]* 6.5 Write unit tests for storefront feature flag switching and order stepper
    - Test that legacy components render when `VITE_FEATURE_STOREFRONT_SHADCN` is `false`
    - Test that shadcn components render when flag is `true`
    - Test order stepper renders correct steps for delivery and takeaway sequences
    - Test stepper marks completed/active/pending states correctly
    - _Requirements: 7.2, 7.3, 7.4, 9.1, 9.2_

- [x] 7. Checkpoint - Storefront migration
  - Ensure all storefront shadcn variants render correctly with feature flag enabled, responsive behavior preserved, and no LCP regression. Ask the user if questions arise.

- [x] 8. Token cleanup and finalization
  - [x] 8.1 Remove legacy `--md-*` token definitions and references
    - Remove all `--md-*` variable definitions from `resources/css/theme-variables.css`
    - Search and remove all `rgb(var(--md-*))` patterns from Vue templates and CSS files
    - Remove any remaining `.db-order-status` CSS patterns
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Rename `--ui-*` tokens to final shadcn names and update configuration
    - Rename `--ui-primary` → `--primary`, `--ui-secondary` → `--secondary`, etc. across all CSS files
    - Update Tailwind config to reference final token names (without `ui-` prefix)
    - Update `ThemeResource.php` to output HSL-format color values
    - Update theme settings panel to consume HSL values
    - _Requirements: 8.3, 8.5_

  - [x] 8.3 Verify build and document compatibility
    - Run `npm run build` and confirm zero CSS variable undefined warnings
    - Document any third-party integration or print stylesheet compatibility mappings for removed `--md-*` tokens
    - Remove `@vuepic/vue-datepicker` from `package.json` (all 16 usages replaced by DatePicker)
    - _Requirements: 8.3, 8.4, 8.6, 3.6_

- [x] 9. Checkpoint - Token cleanup
  - Ensure `npm run build` produces zero warnings, all surfaces render correctly with only HSL tokens, and no visual regressions. Ask the user if questions arise.

- [x] 10. Property-based tests for correctness properties
  - [x]* 10.1 Write property test for form error display and styling
    - **Property 1: Form error display and styling**
    - Generate random Laravel error objects and field names; verify FormMessage renders first error and input has `aria-invalid="true"`
    - **Validates: Requirements 1.2, 1.3**

  - [x]* 10.2 Write property test for form accessibility wiring
    - **Property 2: Form accessibility wiring**
    - Generate random field names; verify `aria-describedby` on input matches FormMessage element `id`
    - **Validates: Requirements 1.4**

  - [x]* 10.3 Write property test for form error clearing round-trip
    - **Property 3: Form error clearing round-trip**
    - Generate errors then clear them; verify FormMessage disappears and `aria-invalid` is removed
    - **Validates: Requirements 1.5**

  - [x]* 10.4 Write property test for sidebar active route highlighting
    - **Property 4: Sidebar active route highlighting**
    - Generate routes from menu structure; verify exactly one SidebarItem has active class for the current route
    - **Validates: Requirements 2.4**

  - [x]* 10.5 Write property test for date picker ISO 8601 emission
    - **Property 5: Date picker ISO 8601 emission**
    - Generate random dates in single and range mode; verify emitted values are parseable ISO 8601 strings
    - **Validates: Requirements 3.4**

  - [x]* 10.6 Write property test for date picker locale formatting
    - **Property 6: Date picker locale formatting**
    - Generate dates × supported locales; verify trigger button displays locale-formatted date
    - **Validates: Requirements 3.7**

  - [x]* 10.7 Write property test for command palette search filtering
    - **Property 7: Command palette search filtering**
    - Generate command items and queries; verify filtered results contain only and all matching items
    - **Validates: Requirements 4.3**

  - [x]* 10.8 Write property test for command palette category grouping
    - **Property 8: Command palette category grouping**
    - Generate categorized items; verify items are grouped contiguously with section headers
    - **Validates: Requirements 4.5**

  - [x]* 10.9 Write property test for dark mode WCAG contrast ratios
    - **Property 9: Dark mode WCAG contrast ratios**
    - Compute contrast ratios for all foreground/background token pairings in `.dark`; verify ≥4.5:1 (normal) and ≥3:1 (large)
    - **Validates: Requirements 5.6**

  - [x]* 10.10 Write property test for order stepper sequence rendering
    - **Property 10: Order stepper sequence rendering**
    - Generate delivery and takeaway order types; verify Stepper renders exactly the correct steps in order
    - **Validates: Requirements 9.1, 9.3**

  - [x]* 10.11 Write property test for order stepper progress marking
    - **Property 11: Order stepper progress marking**
    - Generate status values within step sequences; verify completed/active/pending states are correctly assigned
    - **Validates: Requirements 9.2**

- [x] 11. Final checkpoint
  - Ensure all tests pass, all surfaces render correctly in both light and dark mode, feature flags work for instant rollback, and build is clean. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- POS and storefront migrations use feature flags (`VITE_FEATURE_POS_SHADCN`, `VITE_FEATURE_STOREFRONT_SHADCN`) for instant rollback
- Token cleanup (task 8) must only be performed after all surfaces are fully migrated and feature flags enabled in production
- All new components follow shadcn-vue conventions: scaffolded into `resources/js/components/ui/`, re-exported from `index.ts`, styled with Tailwind + `cn()`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.6", "1.7"] },
    { "id": 1, "tasks": ["1.3", "1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1", "6.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "6.2"] },
    { "id": 5, "tasks": ["4.4", "6.3", "6.4"] },
    { "id": 6, "tasks": ["6.5"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2"] },
    { "id": 9, "tasks": ["8.3"] },
    { "id": 10, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9", "10.10", "10.11"] }
  ]
}
```
