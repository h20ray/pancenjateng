# Implementation Plan: Storefront shadcn-vue Migration

## Overview

Migrate four storefront home page content components (product cards, category pills, offer grid, variation modal) from legacy CSS to shadcn-vue primitives using the established wrapper pattern with feature flag toggle. Each component gets a `*Shadcn.vue` sibling and a `*Wrapper.vue` that conditionally renders based on the `storefrontShadcn` feature flag. Code splitting via `defineAsyncComponent` ensures only the active variant loads at runtime.

## Tasks

- [x] 1. Create ItemComponentShadcn with grid and list layouts
  - [x] 1.1 Create `ItemComponentShadcn.vue` with grid layout using Card, CardContent, Button, and Badge primitives
    - Create `resources/js/components/frontend/components/ItemComponentShadcn.vue`
    - Import and register Card, CardContent, Button, Badge from `../../ui`
    - Use Options API with `components:` registration matching codebase pattern
    - Implement grid layout: 2-col mobile / 3-col sm / 4-col md+ with gap-3 lg:gap-6
    - Render product image, name (truncated 26 chars), description (truncated 50 chars), price with offer strikethrough, stock Badge, and add-to-cart Button
    - Apply out-of-stock styling: opacity-60, cursor-not-allowed, disabled Button
    - Set `role="button"`, `tabindex="0"`, keyboard handlers (Enter/Space) on card containers
    - Use `alt` attribute set to `item.name` on product images
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 8.1, 8.2_

  - [x] 1.2 Add list layout to `ItemComponentShadcn.vue` using Card and Button primitives
    - Implement horizontal card layout with thumbnail on leading side, content trailing
    - Render name (truncated 25 chars), description (truncated 65 chars), price, stock Badge, add-to-cart Button
    - Apply out-of-stock styling: opacity-60, disabled Button, suppress click/keyboard events
    - Set `role="button"`, `tabindex="0"`, keyboard handlers on card containers
    - Implement responsive grid: 1-col mobile / 2-col sm / 3-col lg+
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1, 8.2_

  - [x] 1.3 Implement variation modal in `ItemComponentShadcn.vue` using Dialog, Input, Button, Textarea, Select, RadioGroup, and Checkbox primitives
    - Import and register Dialog, DialogContent, DialogHeader, DialogTitle, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, RadioGroupItem, Checkbox from `../../ui`
    - Implement quantity controls with Button (variant="outline", size="icon") and Input (type="number", min=1, max=100, w-12 text-center)
    - Implement variation selection via Select (multi-attribute) and RadioGroup (single-attribute) with Swiper
    - Implement extras selection via Checkbox with Swiper
    - Implement addon browsing with Swiper and quantity controls
    - Implement special instructions Textarea (maxlength=200)
    - Implement add-to-cart Button (full width, primary) showing formatted total price
    - Disable add-to-cart when total_price <= 0 or item is out of stock
    - Reset quantity to 1 when value set below 1, recalculate total
    - Use section headings with `text-sm font-medium text-foreground` instead of legacy `fs-body-md text-heading`
    - Port all existing methods: variationModalShow, variationModalHide, changeVariation, changeExtra, changeAddon, totalPriceSetup, addToCart
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 8.3, 8.4_

  - [x]* 1.4 Write property test for text truncation invariant
    - **Property 1: Text truncation invariant**
    - **Validates: Requirements 1.2, 2.2**
    - Use fast-check to generate arbitrary strings and positive integers
    - Assert `textShortener(text, N).length <= N` for all inputs

  - [x]* 1.5 Write property test for stock badge label determinism
    - **Property 2: Stock badge label determinism**
    - **Validates: Requirements 1.5, 2.2**
    - Use fast-check to generate item objects with boolean `is_out_of_stock`, `is_low_stock`, and numeric `online_stock_quantity`
    - Assert exactly one of three labels returned based on flag priority

  - [x]* 1.6 Write property test for total price calculation
    - **Property 7: Total price calculation**
    - **Validates: Requirements 5.6**
    - Use fast-check to generate base price, variation prices array, extra prices array, addon (price × quantity) array, and quantity >= 1
    - Assert `total_price === (base + sum(variations) + sum(extras)) * quantity + sum(addon_price * addon_qty)`

  - [x]* 1.7 Write property test for quantity floor at 1
    - **Property 8: Quantity floor at 1**
    - **Validates: Requirements 5.8**
    - Use fast-check to generate numeric values < 1 (zero, negative, decimals)
    - Assert quantity resets to 1 and total recalculates accordingly

- [x] 2. Create ItemComponentWrapper with feature flag toggle
  - [x] 2.1 Create `ItemComponentWrapper.vue` with defineAsyncComponent and feature flag conditional rendering
    - Create `resources/js/components/frontend/components/ItemComponentWrapper.vue`
    - Use `defineAsyncComponent` for both legacy `ItemComponent` and `ItemComponentShadcn` imports
    - Use `useFeatureFlags().storefrontShadcn` to toggle between versions
    - Pass all props and attrs through via `v-bind="$attrs"`
    - Follow the established pattern from `HomeComponentWrapper.vue`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x]* 2.2 Write property test for wrapper prop pass-through
    - **Property 9: Wrapper prop pass-through**
    - **Validates: Requirements 6.8**
    - Use fast-check to generate arbitrary prop objects
    - Assert all props passed to wrapper are received by active child component

- [x] 3. Create CategoryComponentShadcn and CategoryComponentWrapper
  - [x] 3.1 Create `CategoryComponentShadcn.vue` with shadcn design tokens replacing legacy CSS classes
    - Create `resources/js/components/frontend/components/CategoryComponentShadcn.vue`
    - Use Options API with Swiper/SwiperSlide for horizontal scrolling
    - Replace `bg-surface-variant` with `bg-muted`, `fs-label-sm` with `text-xs font-medium`, `bg-primary-light` with `hover:bg-primary/10`, `menu-category-active` with `bg-primary/10 border-primary`
    - Render pills at 5.5rem mobile / 8rem (sm:w-32 sm:h-32) on sm+ viewports
    - Implement active state detection via route query parameter `s` matching category slug
    - Preserve router-link navigation to `{ name: 'frontend.menu', query: { s: category.slug } }`
    - Use `text-foreground` for text color, `border-transparent` default border
    - Set `alt` attribute on category images to `category.name`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.5_

  - [x] 3.2 Create `CategoryComponentWrapper.vue` with feature flag toggle
    - Create `resources/js/components/frontend/components/CategoryComponentWrapper.vue`
    - Use `defineAsyncComponent` for both legacy and shadcn imports
    - Toggle via `useFeatureFlags().storefrontShadcn`
    - Pass all props through via `v-bind="$attrs"`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x]* 3.3 Write property test for active category matches route query
    - **Property 3: Active category matches route query**
    - **Validates: Requirements 3.3**
    - Use fast-check to generate category arrays and route query strings
    - Assert exactly one category has active styling when slug matches query

  - [x]* 3.4 Write property test for category router-link correctness
    - **Property 4: Category router-link correctness**
    - **Validates: Requirements 3.5**
    - Use fast-check to generate category objects with slug strings
    - Assert router-link `to` prop equals `{ name: 'frontend.menu', query: { s: category.slug } }`

- [x] 4. Create OfferComponentShadcn and OfferComponentWrapper
  - [x] 4.1 Create `OfferComponentShadcn.vue` with Skeleton loading state and Tailwind grid
    - Create `resources/js/components/frontend/components/OfferComponentShadcn.vue`
    - Import and register Skeleton from `../../ui`
    - Use Options API, import `useFrontendOfferStore` for data fetching
    - Show 2 Skeleton placeholders (aspect-video rounded-2xl) in 2-col grid while loading
    - Render offer images as router-links in responsive grid (1-col mobile, 2-col sm+) when loaded
    - Render nothing when no offers or on fetch error
    - Set `alt` attribute on offer images to `offer.name`
    - Apply rounded-2xl and full-width sizing to images
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.5, 7.6_

  - [x] 4.2 Create `OfferComponentWrapper.vue` with feature flag toggle
    - Create `resources/js/components/frontend/components/OfferComponentWrapper.vue`
    - Use `defineAsyncComponent` for both legacy and shadcn imports
    - Toggle via `useFeatureFlags().storefrontShadcn`
    - Pass all props through via `v-bind="$attrs"`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8_

  - [x]* 4.3 Write property test for offer router-link correctness
    - **Property 5: Offer router-link correctness**
    - **Validates: Requirements 4.3**
    - Use fast-check to generate offer objects with slug strings
    - Assert router-link `to` prop equals `{ name: 'frontend.offers.item', params: { slug: offer.slug } }`

  - [x]* 4.4 Write property test for image alt text equals entity name
    - **Property 6: Image alt text equals entity name**
    - **Validates: Requirements 4.5, 8.2**
    - Use fast-check to generate item/offer objects with name strings
    - Assert rendered `<img>` alt attribute equals entity name

- [x] 5. Checkpoint - Verify all new components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wire wrappers into HomeComponentShadcn and section components
  - [x] 6.1 Update `HomeComponentShadcn.vue` to use `CategoryComponentWrapper` and `OfferComponentWrapper`
    - Replace `CategoryComponent` import with `CategoryComponentWrapper` (defineAsyncComponent)
    - Replace `OfferComponent` import with `OfferComponentWrapper` (defineAsyncComponent)
    - Update `components:` registration
    - Add category skeleton placeholders (6 Skeleton elements, w-[5.5rem] sm:w-32 h-[5.5rem] sm:h-32 rounded-2xl) while category data loads
    - _Requirements: 6.1, 6.3, 7.3, 7.4_

  - [x] 6.2 Update `FeaturedItemComponentShadcn.vue` to use `ItemComponentWrapper` instead of `ItemComponent`
    - Replace `ItemComponent` import with `ItemComponentWrapper` (defineAsyncComponent)
    - Update `components:` registration
    - Verify skeleton loading state remains unchanged (h-6 w-48 heading + 4 card skeletons h-52 sm:h-64 rounded-xl in 2/3/4-col grid)
    - _Requirements: 6.1, 6.3, 7.1, 7.4_

  - [x] 6.3 Update `PopularItemComponentShadcn.vue` to use `ItemComponentWrapper` instead of `ItemComponent`
    - Replace `ItemComponent` import with `ItemComponentWrapper` (defineAsyncComponent)
    - Update `components:` registration
    - Verify skeleton loading state remains unchanged (h-6 w-56 heading + 3 card skeletons h-28 sm:h-32 rounded-xl in 1/2/3-col grid)
    - _Requirements: 6.1, 6.3, 7.2, 7.4_

  - [x]* 6.4 Write unit tests for feature flag toggle behavior
    - Test that wrappers render legacy component when flag is false
    - Test that wrappers render shadcn component when flag is true
    - Test that all props pass through correctly in both states
    - _Requirements: 6.1, 6.2, 6.3, 6.8_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All components use Options API with explicit `components:` registration per codebase convention
- No new custom CSS classes introduced — all styling via Tailwind utilities and shadcn primitives
- The existing `ItemComponent.vue`, `CategoryComponent.vue`, and `OfferComponent.vue` remain unchanged

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "3.2", "4.2"] },
    { "id": 2, "tasks": ["1.3", "2.1"] },
    { "id": 3, "tasks": ["1.4", "1.5", "3.3", "3.4", "4.3", "4.4"] },
    { "id": 4, "tasks": ["1.6", "1.7", "2.2"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4"] }
  ]
}
```
