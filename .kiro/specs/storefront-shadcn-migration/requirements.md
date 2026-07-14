# Requirements Document

## Introduction

This specification covers the migration of the storefront home page core content components from legacy custom CSS classes to shadcn-vue primitives. The outer shell (navbar, footer, mobile nav) is already migrated. The remaining work targets four component areas: product cards (ItemComponent), category pills (CategoryComponent), offer images (OfferComponent), and the variation/add-to-cart modal inside ItemComponent. Each migrated component follows the established `*Shadcn` suffix pattern with a Wrapper component toggling between legacy and new versions via the `storefrontShadcn` feature flag.

## Glossary

- **Item_Card_Component**: The Vue component (`ItemComponent.vue`) responsible for rendering product cards in both grid and list layouts on the storefront home page, currently using ~30 custom CSS classes (`product-card-grid`, `product-card-list`, etc.)
- **Category_Pill_Component**: The Vue component (`CategoryComponent.vue`) that renders horizontally-scrollable category filter pills using Swiper, currently styled with legacy tokens (`bg-surface-variant`, `fs-label-sm`, `bg-primary-light`)
- **Offer_Grid_Component**: The Vue component (`OfferComponent.vue`) that renders promotional offer images in a responsive grid, currently lacking loading skeleton and shadcn patterns
- **Variation_Modal**: The Dialog-based section within ItemComponent that displays item variations, extras, addons, quantity controls, and the add-to-cart action, currently using legacy classes (`fs-body-*`, `text-heading`, custom increment/decrement buttons)
- **Feature_Flag_System**: The runtime toggle (`VITE_FEATURE_STOREFRONT_SHADCN`) accessed via `useFeatureFlags().storefrontShadcn` that controls whether the shadcn or legacy version of a component renders
- **Wrapper_Component**: A thin Vue component that conditionally renders either the legacy or shadcn version of a component based on the Feature_Flag_System
- **Shadcn_Primitive**: A UI component from `resources/js/components/ui/` (Card, Button, Badge, Skeleton, Dialog, Select, Checkbox, RadioGroup, Input, etc.) that follows the shadcn-vue design system
- **Legacy_CSS_Class**: A custom CSS component class defined in `resources/css/app.css` (e.g., `product-card-grid`, `product-card-list-cart-btn`, `fs-label-sm`) that should be replaced by Tailwind utilities and Shadcn_Primitives

## Requirements

### Requirement 1: Product Card Grid Layout Migration

**User Story:** As a customer browsing the storefront, I want product cards in grid layout to use consistent shadcn Card primitives, so that the visual design matches the rest of the migrated storefront shell.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component SHALL render grid-layout product cards using the Card, CardContent, and Button Shadcn_Primitives instead of Legacy_CSS_Classes (`product-card-grid`, `product-card-grid-content-group`, `product-card-grid-cart-btn`)
2. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component grid card SHALL display the product image, name (truncated to 26 characters), description (truncated to 50 characters), price (with strikethrough for offer pricing), and an add-to-cart Button that is keyboard-accessible (role="button", focusable via Tab, activatable via Enter and Space keys)
3. WHEN a product has an active offer (the item's offer array contains at least one entry), THE Item_Card_Component grid card SHALL display the original price with strikethrough styling and the first offer's price as the current price
4. WHEN a product is out of stock, THE Item_Card_Component grid card SHALL render with opacity reduced to 0.6, a `cursor-not-allowed` visual indicator, and a disabled add-to-cart Button that prevents both click and keyboard interaction
5. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component grid card SHALL display a stock status Badge using the Badge Shadcn_Primitive indicating one of three states: "In stock" when stock is available, "{quantity} left" when the item's low-stock flag is active, or "Out of stock" when the item's out-of-stock flag is active
6. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component grid card SHALL maintain the existing responsive grid layout: 2 columns on viewports below 640px, 3 columns at the sm breakpoint (640px), and 4 columns at the md breakpoint (768px) and above, with 12px gap by default and 24px gap at the lg breakpoint (1024px) and above

### Requirement 2: Product Card List Layout Migration

**User Story:** As a customer browsing popular items, I want product cards in list layout to use consistent shadcn Card primitives, so that the horizontal card design is accessible and visually cohesive.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component SHALL render list-layout product cards using the Card and Button Shadcn_Primitives instead of Legacy_CSS_Classes (`product-card-list`, `product-card-list-content-group`, `product-card-list-cart-btn`)
2. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component list card SHALL display the product thumbnail, name (truncated to 25 characters with ellipsis), description (truncated to 65 characters with ellipsis), price, stock status Badge, and an add-to-cart Button arranged horizontally with the thumbnail on the leading side and content on the trailing side
3. WHEN a product has an active offer, THE Item_Card_Component list card SHALL display the original price with strikethrough styling and the offer price as the current price
4. WHEN a product is out of stock, THE Item_Card_Component list card SHALL render with 60% opacity and a disabled add-to-cart Button, and SHALL ignore click, Enter, and Space key activation events on the card container
5. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component list card SHALL maintain the responsive grid layout of 1 column on viewports below 640px, 2 columns from 640px, and 3 columns from 1024px and above
6. WHILE the Feature_Flag_System has `storefrontShadcn` enabled, THE Item_Card_Component list card SHALL set `role="button"` and `tabindex="0"` on each card container, and SHALL open the Variation_Modal when the user activates the card via click, Enter key, or Space key

### Requirement 3: Category Pills Migration

**User Story:** As a customer, I want the category filter pills to use shadcn design tokens and consistent styling, so that they visually integrate with the migrated storefront shell.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Category_Pill_Component SHALL render category pills using Tailwind utilities and shadcn design tokens (`bg-muted`, `text-foreground`, `hover:bg-primary`) instead of Legacy_CSS_Classes (`bg-surface-variant`, `fs-label-sm`, `bg-primary-light`, `menu-category-active`)
2. THE Category_Pill_Component SHALL display each category as a pill containing the category thumbnail image (rendered at 1.75rem height on mobile and 3rem height on sm+ viewports) and the category name, within a horizontally-scrollable Swiper container with 16px spacing between slides
3. WHEN a category pill's slug matches the active route query parameter `s`, THE Category_Pill_Component SHALL apply an active visual state using the `bg-primary/10` background and `border-primary` bottom border tokens, distinguishable from the default pill state
4. THE Category_Pill_Component SHALL render each pill at 5.5rem width and height on viewports below the `sm` breakpoint (640px), and 8rem (sm:w-32 sm:h-32) width and height on viewports at or above the `sm` breakpoint
5. THE Category_Pill_Component SHALL preserve the existing router-link navigation behavior, directing users to the route named `frontend.menu` with the query parameter `s` set to the selected category's slug
6. WHEN the Feature_Flag_System has `storefrontShadcn` disabled, THE Category_Pill_Component SHALL render using the existing Legacy_CSS_Classes without any visual change to the current behavior

### Requirement 4: Offer Grid Migration

**User Story:** As a customer, I want the promotional offers section to show loading skeletons while data loads, so that the page layout remains stable and I understand content is incoming.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Offer_Grid_Component SHALL render using the Skeleton Shadcn_Primitive for loading states and Tailwind utilities for the image grid layout
2. WHILE offer data is loading, THE Offer_Grid_Component SHALL display 2 Skeleton placeholders arranged in a 2-column grid with rounded-2xl corners and a 16:9 aspect ratio to prevent layout shift
3. WHEN offer data has loaded and offers exist, THE Offer_Grid_Component SHALL render offer images as router-links (navigating to the offer detail route using the offer slug) in a responsive grid: 1 column on mobile, 2 columns on sm and above
4. WHEN offer data has loaded and no offers exist, THE Offer_Grid_Component SHALL render nothing (no empty container or whitespace)
5. THE Offer_Grid_Component SHALL apply rounded corners (rounded-2xl) and full-width sizing to offer images with descriptive alt text using the offer name
6. IF the offer data fetch fails, THEN THE Offer_Grid_Component SHALL render nothing and not display an error state or broken layout to the customer

### Requirement 5: Variation Modal Migration

**User Story:** As a customer adding items to my cart, I want the variation/add-to-cart modal to use shadcn Input and Button primitives, so that form controls are accessible and visually consistent.

#### Acceptance Criteria

1. WHEN the Feature_Flag_System has `storefrontShadcn` enabled, THE Variation_Modal SHALL render the quantity increment/decrement controls using the Button Shadcn_Primitive (variant="outline", size="icon") instead of custom-styled `<button>` elements with inline Tailwind
2. THE Variation_Modal SHALL render the quantity value using the Input Shadcn_Primitive (type="number", min=1, max=100, centered text, width constrained to 3rem) instead of a custom-styled `<input>` element
3. THE Variation_Modal SHALL render section headings (Quantity, Variations, Extras, Addons, Special Instructions) using consistent typography classes from the shadcn token system (`text-sm font-medium text-foreground`) instead of Legacy_CSS_Classes (`fs-body-md`, `text-heading`)
4. THE Variation_Modal SHALL render the special instructions field using the Textarea Shadcn_Primitive with a maximum length of 200 characters instead of a custom-styled `<textarea>` element
5. THE Variation_Modal SHALL render the "Add to Cart" action using the Button Shadcn_Primitive (full width, primary variant) displaying the localized add-to-cart label and the formatted total price
6. THE Variation_Modal SHALL preserve all existing functional behavior: quantity adjustment, variation selection via Select or RadioGroup, extras selection via Checkbox, addon browsing, instruction input, and total price calculation
7. IF the total price is zero or the item is out of stock, THEN THE Variation_Modal add-to-cart Button SHALL be rendered with the disabled attribute set, preventing pointer interaction and applying reduced opacity (opacity-50)
8. IF the quantity Input value is manually set below 1, THEN THE Variation_Modal SHALL reset the quantity to 1 and recalculate the total price

### Requirement 6: Feature Flag Toggle and Wrapper Pattern

**User Story:** As a developer, I want each migrated component to be wrapped in a feature-flag toggle, so that I can safely deploy the migration incrementally and roll back instantly if issues arise.

#### Acceptance Criteria

1. THE Feature_Flag_System SHALL control rendering of migrated storefront home page components via the existing `storefrontShadcn` flag in `useFeatureFlags()`, where each migrated component has a corresponding Wrapper_Component that conditionally renders either the legacy or shadcn version using `v-if="featureFlags.storefrontShadcn"`
2. IF `storefrontShadcn` is false, THEN THE Wrapper_Components SHALL render the legacy component versions, producing identical DOM output and event behavior as if the Wrapper_Component were not present
3. IF `storefrontShadcn` is true, THEN THE Wrapper_Components SHALL render the new shadcn-suffixed component versions
4. THE Wrapper_Components SHALL use `defineAsyncComponent` for both the legacy and shadcn component imports so that only the active variant's code is loaded at runtime
5. THE migrated components SHALL follow the established naming convention: `ItemComponentShadcn.vue`, `CategoryComponentShadcn.vue`, `OfferComponentShadcn.vue` placed alongside their legacy counterparts in the same directory
6. THE migrated components SHALL use Options API with explicit `components:` registration for all imported Shadcn_Primitives, matching the existing codebase pattern
7. THE migrated components SHALL not introduce any new custom CSS component classes in `resources/css/app.css` for patterns covered by Shadcn_Primitives
8. THE Wrapper_Components SHALL pass all received props and event listeners through to the active child component so that parent components require no changes when the wrapper is introduced

### Requirement 7: Loading States with Skeleton Primitives

**User Story:** As a customer on a slow connection, I want to see placeholder skeletons while content loads, so that I understand the page structure before data arrives.

#### Acceptance Criteria

1. WHILE featured items data is loading, THE FeaturedItemComponentShadcn SHALL display a section heading Skeleton (h-6 w-48) followed by 4 card Skeleton placeholders (h-52 sm:h-64 rounded-xl) arranged in a 2-column (mobile) / 3-column (sm) / 4-column (md+) responsive grid matching the final card grid layout
2. WHILE popular items data is loading, THE PopularItemComponentShadcn SHALL display a section heading Skeleton (h-6 w-56) followed by 3 card Skeleton placeholders (h-28 sm:h-32 rounded-xl) arranged in a 1-column (mobile) / 2-column (sm) / 3-column (lg+) responsive grid matching the final list card layout
3. WHILE category data is loading, THE HomeComponentShadcn category section SHALL display 6 Skeleton placeholders (w-[5.5rem] sm:w-32 h-[5.5rem] sm:h-32 rounded-2xl) arranged horizontally to match the pill dimensions of the Category_Pill_Component
4. THE Skeleton placeholders SHALL use the Skeleton Shadcn_Primitive imported from `../../ui` and registered in the component's `components:` option, with explicit Tailwind height, width, and border-radius classes that match the rendered content dimensions
5. WHEN data loading completes successfully, THE Skeleton placeholders SHALL be replaced by the actual content without layout shift (Cumulative Layout Shift below 0.1 as measured by Lighthouse or Web Vitals)
6. IF data loading fails, THEN THE Skeleton placeholders SHALL be removed and the section SHALL render nothing (no empty container or residual skeleton elements)

### Requirement 8: Accessibility Preservation

**User Story:** As a customer using assistive technology, I want the migrated components to maintain keyboard navigation and screen reader support, so that I can browse and purchase products independently.

#### Acceptance Criteria

1. THE Item_Card_Component SHALL maintain focusable card containers with `role="button"` and `tabindex="0"` attributes that respond to Enter and Space key presses
2. THE Item_Card_Component SHALL provide descriptive `alt` text on product images using the product name
3. THE Variation_Modal SHALL maintain focus trap within the Dialog when open, returning focus to the triggering element on close
4. THE Variation_Modal quantity controls SHALL be operable via keyboard (Tab to navigate between decrement, input, and increment; Enter or Space to activate buttons)
5. THE Category_Pill_Component SHALL render category links as `<router-link>` elements that are natively keyboard-focusable and announce their destination
6. WHEN a product card's add-to-cart Button is disabled (out of stock), THE Item_Card_Component SHALL convey the disabled state to assistive technology via the `disabled` attribute on the Button primitive
