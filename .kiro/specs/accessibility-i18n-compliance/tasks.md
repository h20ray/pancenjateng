# Implementation Plan: Accessibility & i18n Compliance

## Overview

This plan implements accessibility (a11y) and internationalization (i18n) fixes across the toko-roti-gambang Vue.js application. Tasks are organized to first establish the translation key foundation, then apply ARIA and i18n changes to components grouped by surface area (UI primitives → admin → POS → frontend), and finally wire everything together with validation.

## Tasks

- [x] 1. Add translation keys to locale files
  - [x] 1.1 Add all new `button.*`, `label.*`, `dashboard.*`, and `message.*` keys to `resources/js/languages/en.json`
    - Add keys as defined in the design Data Models section
    - Include: `button.qr_code`, `button.fullscreen`, `button.apply`, `button.close`
    - Include: `label.dine_in`, `label.light_mode`, `label.dark_mode`, `label.list_view`, `label.grid_view`, `label.quantity`, `label.quantity_for_item`, `label.product_image`, `label.customer_avatar`, `label.coupon_code`, `label.discount_amount`, `label.decrease_quantity`, `label.increase_quantity`, `label.clear_search`, `label.toggle_theme`
    - Include: all `dashboard.*` empty state and metric description keys
    - Include: all `message.*` alert keys with interpolation placeholders
    - _Requirements: 12.1, 12.2_

  - [x] 1.2 Add all new keys to `resources/js/languages/id.json` with Indonesian translations
    - Mirror the same key paths added in 1.1
    - Provide Indonesian translations for every key
    - _Requirements: 12.1, 12.3_

- [x] 2. Fix UI primitive sr-only text with i18n
  - [x] 2.1 Update `DialogContent.vue` to use `useI18n` for sr-only "Close" text
    - Import `useI18n` from `vue-i18n`
    - Replace hardcoded "Close" sr-only text with `t('button.close')`
    - _Requirements: 7.4, 7.5_

  - [x] 2.2 Update `SheetContent.vue` to use `useI18n` for sr-only "Close" text
    - Import `useI18n` from `vue-i18n`
    - Replace hardcoded "Close" sr-only text with `t('button.close')`
    - _Requirements: 7.4, 7.5_

  - [x] 2.3 Update `LoadingOverlay.vue` to use `useI18n` for sr-only "Loading" text
    - Import `useI18n` from `vue-i18n`
    - Replace hardcoded "Loading" sr-only text with `t('label.loading')`
    - _Requirements: 7.4, 7.5_

  - [x]* 2.4 Write property test for sr-only text locale reactivity
    - **Property 5: SR-only text updates reactively on locale switch**
    - **Validates: Requirements 7.7**

- [x] 3. Add aria-labels to icon-only button components
  - [x] 3.1 Add `:aria-label="$t('button.delete')"` to `SmIconDeleteComponent.vue`
    - Follow the existing `SmDeleteComponent.vue` pattern
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 3.2 Add `:aria-label="$t('button.view')"` to `SmIconViewComponent.vue`
    - Follow the existing pattern with matching tooltip text
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 3.3 Add `:aria-label="$t('button.qr_code')"` to `SmIconQrCodeComponent.vue`
    - Follow the existing pattern
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 3.4 Add `:aria-label="$t('button.delete')"` to `SmTimeSloteDeleteComponent.vue`
    - Follow the existing pattern
    - _Requirements: 1.1, 1.4_

  - [x] 3.5 Add `:aria-label="$t('button.edit')"` to `SmIconSidebarModalEditComponent.vue`
    - Follow the existing pattern
    - _Requirements: 1.1, 1.4_

  - [x] 3.6 Add `:aria-label="$t('button.edit')"` to `SmIconModalEditComponent.vue`
    - Follow the existing pattern
    - _Requirements: 1.1, 1.4_

  - [x]* 3.7 Write property test for icon button aria-label non-empty
    - **Property 1: Icon button aria-label is non-empty**
    - **Validates: Requirements 1.1**

  - [x]* 3.8 Write property test for icon button tooltip matches aria-label
    - **Property 2: Icon button tooltip matches aria-label**
    - **Validates: Requirements 1.2**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrate dashboard tabs to shadcn-vue Tabs and i18n empty states
  - [x] 5.1 Migrate `DashboardComponentShadcn.vue` tabs to shadcn-vue `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
    - Replace plain button-based tabs with shadcn-vue Tabs components
    - Set `default-value="overview"` on the Tabs root
    - Add `disabled` prop to Reports and Notification triggers
    - Use `$t()` for tab trigger labels
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 5.2 Replace hardcoded AdminEmptyState `title` and `description` props with `$t()` calls in `DashboardComponentShadcn.vue`
    - Replace all 6 empty-state title props with `$t('dashboard.*')` keys
    - Replace all 6 empty-state description props with `$t('dashboard.*')` keys
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 5.3 Replace hardcoded AdminMetricCard `description` props with `$t()` calls in `DashboardComponentShadcn.vue`
    - Replace all 4 metric card description props with `$t('dashboard.*')` keys
    - _Requirements: 5.3, 5.4_

  - [x]* 5.4 Write property test for exactly one tab selected at any time
    - **Property 4: Exactly one tab selected at any time**
    - **Validates: Requirements 3.3**

- [x] 6. POS components accessibility and i18n fixes
  - [x] 6.1 Add dynamic `aria-label` to cart quantity inputs in `PosCartPanelShadcn.vue`
    - Use `:aria-label="cart.name ? $t('label.quantity_for_item', { item: cart.name }) : $t('label.quantity')"`
    - Add `aria-label` to discount input using `$t('label.discount_amount')`
    - Replace sr-only "Decrease quantity" / "Increase quantity" text with `$t()` calls
    - Replace hardcoded "Dine In" button label with `$t('label.dine_in')`
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.6, 7.2, 9.4, 9.5_

  - [x] 6.2 Replace hardcoded alert messages with `t()` calls in `PosComponentShadcn.vue`
    - Replace stock-exceeded alert with `t('message.requested_quantity_exceeds_stock')`
    - Replace offline sync success/failure messages with `t()` calls using interpolation
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 6.3 Replace sr-only text and add i18n in `PosCatalogPanelShadcn.vue`
    - Replace hardcoded "Clear search" and "Search" sr-only text with `$t()` calls
    - _Requirements: 7.3, 7.5_

  - [x] 6.4 Replace hardcoded alert message with `t()` call in `ItemBulkStockComponent.vue`
    - Replace bulk stock update success message with `t('message.bulk_stock_update_success', { count })` call
    - _Requirements: 4.4, 4.5_

  - [x]* 6.5 Write property test for cart quantity input aria-label includes item name
    - **Property 3: Cart quantity input aria-label includes item name**
    - **Validates: Requirements 2.1, 9.5**

- [x] 7. Backend navbar i18n fixes
  - [x] 7.1 Replace hardcoded sr-only text and title attributes in `BackendNavbarComponent.vue`
    - Replace sr-only text ("Fullscreen", "Search", "Toggle theme", "Settings") with `t()` calls
    - Replace title attributes for search, settings, fullscreen buttons with `$t()` calls
    - Conditionally set dark mode toggle title to `$t('label.light_mode')` or `$t('label.dark_mode')`
    - _Requirements: 6.2, 6.3, 7.1, 7.5_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend component accessibility fixes
  - [x] 9.1 Add `aria-label` and `aria-pressed` to toggle buttons in `SearchItemComponentShadcn.vue`
    - Add `:aria-label="$t('label.list_view')"` to list toggle button
    - Add `:aria-label="$t('label.grid_view')"` to grid toggle button
    - Add `:aria-pressed="String(itemProps.design === itemDesignEnum.LIST)"` to list button
    - Add `:aria-pressed="String(itemProps.design === itemDesignEnum.GRID)"` to grid button
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 9.2 Add contextual `aria-label` to edit/delete buttons in `AddressComponentShadcn.vue`
    - Add `:aria-label="addr.label ? $t('button.edit') + ' ' + addr.label : $t('button.edit')"` to edit buttons
    - Add `:aria-label="addr.label ? $t('button.delete') + ' ' + addr.label : $t('button.delete')"` to delete buttons
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 9.3 Add `for`/`id` label associations in `ContactUsFormComponent.vue`
    - Add unique `id` attributes to each form input (e.g., `:id="'contact-' + field"`)
    - Add matching `:for` attributes to corresponding `<label>` elements
    - _Requirements: 9.1_

  - [x] 9.4 Add `for`/`id` label associations in `SignupRegisterComponent.vue`
    - Add unique `id` attributes to each form input
    - Add matching `:for` attributes to corresponding `<label>` elements
    - _Requirements: 9.2_

  - [x] 9.5 Add `aria-label` to coupon code input in `CouponComponent.vue`
    - Add `:aria-label="$t('label.coupon_code')"` to the coupon input
    - _Requirements: 9.3_

  - [x]* 9.6 Write property test for toggle buttons mutually exclusive aria-pressed
    - **Property 7: Toggle buttons have mutually exclusive aria-pressed**
    - **Validates: Requirements 10.3, 10.4**

  - [x]* 9.7 Write property test for address button aria-label combines action and label
    - **Property 8: Address action button aria-label combines action and label**
    - **Validates: Requirements 11.1, 11.2**

- [x] 10. Descriptive alt text on product images
  - [x] 10.1 Update product/addon image `alt` attributes across POS and catalog components
    - Set `alt` to item name where a visible name is adjacent
    - Use `$t('label.product_image')` as fallback when name is empty
    - Set `alt=""` on purely decorative images
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 10.2 Update customer avatar image `alt` attributes in list/detail views
    - Set `alt` to customer name where visible
    - Use `$t('label.customer_avatar')` as fallback when name is empty
    - _Requirements: 8.2, 8.4_

  - [x]* 10.3 Write property test for image alt text equals associated entity name
    - **Property 6: Image alt text equals associated entity name**
    - **Validates: Requirements 8.1, 8.2, 8.4**

- [x] 11. Create locale key sync validation script
  - [x] 11.1 Create `scripts/validate-locale-keys.js` to verify both locale files have matching keys
    - Parse both `en.json` and `id.json`
    - Flatten all nested keys
    - Report keys present in one file but missing from the other
    - Verify no values are empty strings or whitespace-only
    - Exit with non-zero code on failure
    - _Requirements: 12.1, 12.4, 12.5_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All translation keys must be added to BOTH `en.json` and `id.json` before using them in components (per workspace steering rule)
- Use shadcn-vue primitives (Tabs, Button) from `resources/js/components/ui/` — do not introduce Bootstrap or custom CSS component classes
- Components using Options API must register shadcn-vue imports in `components:` option

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6"] },
    { "id": 2, "tasks": ["2.4", "3.7", "3.8", "5.1", "7.1", "9.3", "9.4", "9.5"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "6.1", "6.2", "6.3", "6.4", "9.1", "9.2"] },
    { "id": 4, "tasks": ["6.5", "9.6", "9.7", "10.1", "10.2"] },
    { "id": 5, "tasks": ["10.3", "11.1"] }
  ]
}
```
