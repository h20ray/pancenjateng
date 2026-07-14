# Implementation Plan: Storefront Menu Page shadcn-vue Migration

## Overview

Complete the migration of `MenuComponentShadcn.vue` by replacing bare component imports with wrapper components, replacing the `LoadingComponent` overlay with inline Skeleton placeholders, introducing granular loading flags (`categoryLoading`, `itemsLoading`), removing the last legacy CSS class (`menu-swiper`), and ensuring the empty state only renders after loading completes. The wrapper component (`MenuComponentWrapper.vue`) is already in place and requires no changes.

## Tasks

- [x] 1. Refactor loading state and imports in MenuComponentShadcn
  - [x] 1.1 Replace LoadingComponent with Skeleton primitive and wire wrapper imports
    - Remove `LoadingComponent` import and component registration
    - Import `Skeleton` from `../../ui` and register in `components:`
    - Replace `CategoryComponent` async import with `CategoryComponentWrapper` from `../components/CategoryComponentWrapper.vue`
    - Replace `ItemComponent` async import with `ItemComponentWrapper` from `../components/ItemComponentWrapper.vue`
    - Update `components:` registration to `{ Button, Skeleton, CategoryComponentWrapper, ItemComponentWrapper }`
    - Replace `loading: { isActive: false }` data property with two separate flags: `categoryLoading: false` and `itemsLoading: false`
    - _Requirements: 1.1, 1.2, 2.1, 4.1, 9.3, 9.4_

  - [x] 1.2 Update mounted() and methods to use granular loading flags
    - In `mounted()`, set `this.categoryLoading = true` before `fetchLists`, set `false` in `.then()` and `.catch()`
    - In `categoryShow()`, set `this.itemsLoading = true` before `fetchShow`, set `false` in `.then()` and `.catch()`
    - In `categoryShow()` catch block, reset `this.category = {}` and `this.items = {}` so empty state renders on error
    - Remove all references to `this.loading.isActive`
    - _Requirements: 6.5, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Implement skeleton loading states in template
  - [x] 2.1 Add category skeleton section
    - Add `<div v-if="categoryLoading">` block before the category selector section
    - Render 6 `<Skeleton>` elements with classes `w-[5.5rem] sm:w-32 h-[5.5rem] sm:h-32 rounded-2xl` in a `flex items-center gap-3 sm:gap-4 mb-6 sm:mb-12` container
    - Change category selector `v-if` to `v-else-if="showCategorySelector"` so it only shows when not loading
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 2.2 Add product skeleton sections and wire ItemComponentWrapper
    - Add grid-mode skeleton: `<div v-if="itemsLoading && itemProps.design === itemDesignEnum.GRID">` with 4 `<Skeleton>` elements (`h-52 sm:h-64 rounded-xl`) in a `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-6` container
    - Add list-mode skeleton: `<div v-else-if="itemsLoading && itemProps.design === itemDesignEnum.LIST">` with 3 `<Skeleton>` elements (`h-28 sm:h-32 rounded-xl`) in a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6` container
    - Replace `<ItemComponent>` with `<ItemComponentWrapper v-else-if="hasItems" :items="items.items" :type="itemProps.type" :design="itemProps.design" />`
    - Update empty state condition from `v-else-if="!loading.isActive"` to `v-else` (loading exclusion is handled by skeleton sections above)
    - _Requirements: 6.2, 6.3, 4.1, 4.2, 4.3, 4.4, 7.3_

  - [x] 2.3 Update template to hide filters during loading and remove legacy class
    - Add `&& !itemsLoading` condition to the item type filter `v-if` so filters hide during product loading
    - Add `&& !itemsLoading` condition to the category header `v-if` so header hides during product loading
    - Update category header computed condition to use `showCategoryHeader` computed property
    - Remove the `menu-swiper` legacy CSS class from the category container div
    - Replace `CategoryComponent` tag with `CategoryComponentWrapper` in template, passing `:categories="categories" :design="categoryProps.design"`
    - _Requirements: 3.3, 5.4, 9.1, 9.2, 2.2_

- [x] 3. Add computed property for category header visibility
  - [x] 3.1 Add showCategoryHeader computed property
    - Add `showCategoryHeader` computed that returns `true` when `category` has keys and `category.name` is truthy
    - Update the category header `v-if` in template to use `showCategoryHeader && !itemsLoading`
    - _Requirements: 5.4_

- [x] 4. Checkpoint - Verify component renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Write automated tests
  - [x]* 5.1 Write unit tests for loading states and empty state
    - Test: set `categoryLoading=true`, verify 6 Skeleton elements render with correct classes
    - Test: set `itemsLoading=true` with grid design, verify 4 Skeleton elements in grid layout
    - Test: set `itemsLoading=true` with list design, verify 3 Skeleton elements in list layout
    - Test: set items empty with loading false, verify empty state renders with `text-foreground` class
    - Test: set `itemsLoading=true` with empty items, verify empty state is NOT rendered
    - Test: verify no legacy CSS classes (`veg-active`, `veg-navs`, `hover:shadow-filter`, `bg-surface-variant`, `fs-body-sm`, `fs-title-lg`, `text-heading`, `text-placeholder`, `text-black`, `menu-swiper`) in rendered output
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 7.1, 7.2, 7.3, 7.4, 9.1, 9.2_

  - [x]* 5.2 Write property test for category section visibility threshold
    - **Property 2: Category section visibility threshold**
    - **Validates: Requirements 2.3**

  - [x]* 5.3 Write property test for item type filter visibility
    - **Property 3: Item type filter visibility**
    - **Validates: Requirements 3.3**

  - [x]* 5.4 Write property test for item type filter auto-reset invariant
    - **Property 4: Item type filter auto-reset invariant**
    - **Validates: Requirements 3.4**

  - [x]* 5.5 Write property test for loading state excludes empty state
    - **Property 6: Loading state excludes empty state**
    - **Validates: Requirements 7.3**

  - [x]* 5.6 Write property test for active filter variant mapping
    - **Property 8: Active filter variant mapping**
    - **Validates: Requirements 10.3**

  - [x]* 5.7 Write unit tests for view toggle and item type filter interactions
    - Test: verify view toggle buttons use Button primitive with variant="ghost" and size="icon"
    - Test: verify active view mode icon has `text-primary`, inactive has `text-muted-foreground`
    - Test: click active item type filter, verify `itemProps.type` resets to null
    - Test: verify item type filter buttons show thumbnail image and capitalized name
    - Test: verify Buttons are keyboard-focusable (native button elements)
    - _Requirements: 3.1, 3.2, 3.5, 5.1, 5.2, 5.3, 10.1, 10.2_

  - [x]* 5.8 Write unit tests for route/branch reactivity and error handling
    - Test: mock route change with new `s` query param, verify `itemsLoading` set to true and `fetchShow` called
    - Test: mock branch ID change, verify `categoryShow()` is called
    - Test: mock `fetchShow` rejection, verify `itemsLoading` becomes false and empty state shows
    - Test: verify wrapper renders `MenuComponentShadcn` when flag is true, `MenuComponent` when false
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 1.1, 1.3_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The `MenuComponentWrapper.vue` already exists and requires no changes
- `CategoryComponentWrapper.vue` and `ItemComponentWrapper.vue` already exist from the home page migration
- The `Button` primitive import is already present in the current component — only `Skeleton` needs to be added

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "3.1"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8"] }
  ]
}
```
