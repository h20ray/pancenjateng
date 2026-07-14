# Requirements Document

## Introduction

This specification covers the migration of the storefront menu/category listing page from legacy CSS classes to shadcn-vue primitives. The menu page is accessed via the "View All" button on the home page or by clicking a category pill. It displays a category filter section (horizontal Swiper pills), an item type filter bar, a product grid filtered by the selected category, and view toggle controls (list/grid). The page already has a `MenuComponentShadcn.vue` and `MenuComponentWrapper.vue` in place with partial shadcn usage (Button primitive for item type filters and view toggles). This spec addresses the remaining gaps: wiring the wrapped versions of shared components (CategoryComponentWrapper, ItemComponentWrapper), adding loading skeleton states, improving the empty state, and ensuring full consistency with the patterns established in the home page migration.

## Glossary

- **Menu_Page_Component**: The Vue component (`MenuComponentShadcn.vue`) responsible for rendering the storefront menu/category listing page, including category pills, item type filters, view toggle, product grid, and empty state
- **Category_Pill_Component**: The shared Vue component (`CategoryComponentWrapper.vue`) that renders horizontally-scrollable category filter pills using Swiper, already migrated to shadcn tokens in the home page spec
- **Item_Card_Component**: The shared Vue component (`ItemComponentWrapper.vue`) that renders product cards in grid or list layout, already migrated to shadcn primitives in the home page spec
- **Item_Type_Filter**: The row of pill-shaped buttons on the menu page that filter displayed products by type (e.g., veg, non-veg), rendered using the Button Shadcn_Primitive
- **View_Toggle**: The pair of icon buttons (list/grid) on the menu page that switch the product display layout between list and grid modes
- **Feature_Flag_System**: The runtime toggle (`VITE_FEATURE_STOREFRONT_SHADCN`) accessed via `useFeatureFlags().storefrontShadcn` that controls whether the shadcn or legacy version of a component renders
- **Wrapper_Component**: A thin Vue component (`MenuComponentWrapper.vue`) that conditionally renders either the legacy or shadcn version of the menu page based on the Feature_Flag_System
- **Shadcn_Primitive**: A UI component from `resources/js/components/ui/` (Button, Skeleton, Badge, Card, etc.) that follows the shadcn-vue design system
- **Legacy_CSS_Class**: A custom CSS class (e.g., `veg-active`, `veg-navs`, `fs-body-sm`, `fs-title-lg`, `text-heading`, `hover:shadow-filter`, `bg-surface-variant`) that should be replaced by Tailwind utilities and Shadcn_Primitives
- **Empty_State**: The visual placeholder shown when no products match the selected category, displaying an illustration and a "no data available" message

## Requirements

### Requirement 1: Menu Page Wrapper and Feature Flag Integration

**User Story:** As a developer, I want the menu page to toggle between legacy and shadcn versions via the feature flag, so that I can deploy the migration incrementally and roll back instantly if issues arise.

#### Acceptance Criteria

1. THE Wrapper_Component SHALL conditionally render `MenuComponentShadcn` when `useFeatureFlags().storefrontShadcn` is true, and `MenuComponent` when it is false, using `v-if` / `v-else` directives
2. THE Wrapper_Component SHALL use `defineAsyncComponent` for both the legacy and shadcn component imports so that only the active variant's code is loaded at runtime
3. IF `storefrontShadcn` is false, THEN THE Wrapper_Component SHALL render the legacy MenuComponent producing identical DOM output and event behavior as if the Wrapper_Component were not present
4. THE Wrapper_Component SHALL use Options API with explicit `components:` registration, matching the established codebase pattern

### Requirement 2: Category Pill Integration via Wrapper

**User Story:** As a customer browsing the menu page, I want the category pills to use the same shadcn-migrated version as the home page, so that the visual design is consistent across the storefront.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Menu_Page_Component SHALL import and render `CategoryComponentWrapper` instead of the bare `CategoryComponent`, so that the wrapper delegates to the shadcn or legacy version based on the feature flag
2. THE Menu_Page_Component SHALL pass the `categories` array and `design` prop through to the Category_Pill_Component via the wrapper without modification
3. WHEN more than one category exists in the fetched category list, THE Menu_Page_Component SHALL display the category Swiper section; otherwise it SHALL hide the section entirely
4. THE Category_Pill_Component SHALL highlight the active category pill corresponding to the current route query parameter `s`, using the `bg-primary/10` background and `border-primary` bottom border tokens

### Requirement 3: Item Type Filter Migration

**User Story:** As a customer, I want the item type filter pills to use shadcn Button primitives with consistent styling, so that they match the design system used across the migrated storefront.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Menu_Page_Component SHALL render item type filter pills using the Button Shadcn_Primitive (variant="default" for active, variant="outline" for inactive, size="sm", rounded-full) instead of Legacy_CSS_Classes (`veg-active`, `veg-navs`, `hover:shadow-filter`, `bg-surface-variant`)
2. WHEN an item type filter is active, THE Menu_Page_Component SHALL display a close icon within the active Button and toggle the filter off when the user clicks the same filter again
3. THE Menu_Page_Component SHALL only display item type filters when more than one item type is present among the currently visible products for the selected category
4. WHEN the selected item type filter no longer matches any visible product (due to category change), THE Menu_Page_Component SHALL automatically reset the item type filter to null
5. EACH item type filter Button SHALL display the item type thumbnail image (h-6 w-6, rounded-full, object-cover) and the capitalized item type name

### Requirement 4: Product Grid Integration via Wrapper

**User Story:** As a customer browsing products by category, I want the product cards to use the same shadcn-migrated version as the home page, so that card styling and interactions are consistent.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Menu_Page_Component SHALL import and render `ItemComponentWrapper` instead of the bare `ItemComponent`, so that the wrapper delegates to the shadcn or legacy version based on the feature flag
2. THE Menu_Page_Component SHALL pass the `items`, `type`, and `design` props through to the Item_Card_Component via the wrapper without modification
3. THE Item_Card_Component SHALL filter displayed products by the active item type filter, showing only products whose `item_type` matches the selected filter value, or showing all products when no filter is active
4. THE Item_Card_Component SHALL respect the current view mode (list or grid) as controlled by the View_Toggle

### Requirement 5: View Toggle Migration

**User Story:** As a customer, I want the list/grid view toggle buttons to use shadcn Button primitives, so that they are visually consistent and keyboard-accessible.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Menu_Page_Component SHALL render the view toggle using Button Shadcn_Primitives (variant="ghost", size="icon", class="h-8 w-8") instead of bare `<button>` elements with Legacy_CSS_Classes
2. THE View_Toggle active state SHALL be indicated by applying `text-primary` to the icon of the selected mode, and `text-muted-foreground` to the icon of the inactive mode
3. THE View_Toggle SHALL be keyboard-accessible: each Button is focusable via Tab and activatable via Enter or Space keys
4. WHEN the selected category has been loaded and has a non-empty name, THE Menu_Page_Component SHALL display the category name as a heading (text-xl sm:text-2xl, font-semibold, text-primary, capitalize) alongside the View_Toggle in a flex row with space-between alignment

### Requirement 6: Loading Skeleton States

**User Story:** As a customer on a slow connection, I want to see placeholder skeletons while the menu page data loads, so that I understand the page structure before content arrives.

#### Acceptance Criteria

1. WHILE category data is loading, THE Menu_Page_Component SHALL display 6 Skeleton placeholders (w-[5.5rem] sm:w-32 h-[5.5rem] sm:h-32 rounded-2xl) arranged horizontally, matching the pill dimensions of the Category_Pill_Component
2. WHILE product data is loading after a category is selected, THE Menu_Page_Component SHALL display Skeleton placeholders matching the current view mode: 4 card skeletons (h-52 sm:h-64 rounded-xl) in a 2/3/4-column grid for grid mode, or 3 card skeletons (h-28 sm:h-32 rounded-xl) in a 1/2/3-column grid for list mode
3. WHEN data loading completes successfully, THE Skeleton placeholders SHALL be replaced by the actual content without layout shift
4. THE Skeleton placeholders SHALL use the Skeleton Shadcn_Primitive imported from `../../ui` and registered in the component's `components:` option
5. IF data loading fails, THEN THE Skeleton placeholders SHALL be removed and the component SHALL transition to the empty state or render nothing

### Requirement 7: Empty State Presentation

**User Story:** As a customer who selects a category with no products, I want to see a clear empty state message, so that I understand there are no items available rather than thinking the page is broken.

#### Acceptance Criteria

1. WHEN product data has loaded and no items exist for the selected category, THE Menu_Page_Component SHALL display the configured "order not found" illustration image (from `setting.image_order_not_found`) centered with a max-width of 250px
2. WHEN the empty state is displayed, THE Menu_Page_Component SHALL show the localized "no data available" message (`$t('message.no_data_available')`) as a centered block-level text element using `text-foreground` instead of the Legacy_CSS_Class `text-black`
3. THE Menu_Page_Component SHALL NOT display the empty state while data is still loading (the loading skeleton takes precedence)
4. THE empty state container SHALL use Tailwind utilities exclusively with no Legacy_CSS_Classes

### Requirement 8: Route and Branch Reactivity

**User Story:** As a customer navigating between categories or switching branches, I want the menu page to reactively update its content, so that I always see products relevant to my current selection.

#### Acceptance Criteria

1. WHEN the route query parameter `s` changes (user clicks a different category pill), THE Menu_Page_Component SHALL fetch and display the products for the new category slug
2. WHEN the global branch ID changes, THE Menu_Page_Component SHALL re-fetch the category products using the new branch ID
3. WHILE fetching new category data after a route or branch change, THE Menu_Page_Component SHALL display the loading state (skeleton placeholders) until the fetch completes
4. IF the category fetch fails (network error or server error), THEN THE Menu_Page_Component SHALL stop the loading state and display the empty state rather than leaving skeletons visible indefinitely

### Requirement 9: No New Custom CSS Classes

**User Story:** As a developer, I want the migrated menu page to avoid introducing new custom CSS component classes, so that the codebase moves toward a pure Tailwind + shadcn styling approach.

#### Acceptance Criteria

1. THE Menu_Page_Component SHALL NOT introduce any new custom CSS component classes in `resources/css/app.css` or any other stylesheet for patterns covered by Shadcn_Primitives or Tailwind utilities
2. THE Menu_Page_Component SHALL replace all Legacy_CSS_Classes (`veg-active`, `veg-navs`, `hover:shadow-filter`, `bg-surface-variant`, `fs-body-sm`, `fs-body-md`, `fs-title-lg`, `text-heading`, `text-placeholder`, `font-fill-danger`) with equivalent Tailwind utilities or shadcn design tokens
3. THE Menu_Page_Component SHALL use Options API with explicit `components:` registration for all imported Shadcn_Primitives, matching the established codebase pattern
4. THE Menu_Page_Component SHALL use `defineAsyncComponent` for code-split imports of CategoryComponentWrapper and ItemComponentWrapper

### Requirement 10: Accessibility

**User Story:** As a customer using assistive technology, I want the migrated menu page to maintain keyboard navigation and screen reader support, so that I can browse and filter products independently.

#### Acceptance Criteria

1. THE Item_Type_Filter Buttons SHALL be keyboard-focusable via Tab and activatable via Enter or Space keys
2. THE View_Toggle Buttons SHALL be keyboard-focusable via Tab and activatable via Enter or Space keys
3. WHEN an item type filter Button is in the active state, THE Menu_Page_Component SHALL convey the active state visually through the Button variant change (default vs outline) which produces distinct background and border styling
4. THE empty state illustration image SHALL have descriptive alt text (`image_order_not_found`) to convey its purpose to screen readers
5. THE Menu_Page_Component SHALL preserve the existing router-link keyboard navigation for category pills, which are natively focusable anchor elements
