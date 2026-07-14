# Requirements Document

## Introduction

This feature addresses the Vite build warning about chunks exceeding 700 kB after minification. The project currently has a single entry point (`app.js`) serving five distinct surfaces (admin, POS, storefront, attendance, KDS) with ~100 Pinia stores loaded eagerly. While route-level component lazy loading and vendor `manualChunks` are already in place, the application code itself is not split by surface boundary, causing oversized initial bundles. This feature introduces surface-based code splitting, lazy-loaded heavy components, optimized vendor chunking, and performance budgets to keep bundle sizes under control.

## Glossary

- **Build_System**: The Vite 8 bundler with Rolldown backend used to compile and bundle the frontend assets
- **Surface**: A distinct user-facing application area (admin, POS, storefront, attendance, KDS) with its own route tree and component set
- **Chunk**: A JavaScript file produced by the Build_System during the production build
- **Initial_Bundle**: The set of chunks downloaded and executed before the first meaningful paint of a given Surface
- **Lazy_Chunk**: A chunk loaded on-demand via dynamic `import()` when a route or component is first accessed
- **Performance_Budget**: A maximum allowed size (in kB, after minification and before gzip) for any single chunk
- **Heavy_Component**: A component that imports large third-party libraries (charting, rich-text editor, maps, carousel) and is not needed on initial page load
- **Vendor_Chunk**: A chunk containing only third-party `node_modules` code, grouped by logical domain
- **Shared_UI_Library**: The shadcn-vue component primitives located in `components/ui/`, serving as the single source of truth for UI patterns across all Surfaces
- **Design_Token**: A Tailwind CSS utility class or CSS variable (HSL-based) that defines spacing, padding, color, and typography values consistently across the application

## Requirements

### Requirement 1: Surface-Based Route Chunk Isolation

**User Story:** As a user accessing the POS surface, I want only POS-related code to be downloaded, so that the page loads quickly without fetching unrelated admin or storefront code.

#### Acceptance Criteria

1. WHEN a user navigates to a Surface route, THE Build_System SHALL produce a separate lazy-loaded chunk for that Surface's route tree that contains zero component, store, or service modules whose file path belongs to another Surface's directory under `resources/js/modules/`
2. THE Build_System SHALL produce distinct route chunks for each of the following Surfaces: admin, POS, storefront, attendance, and KDS, such that no two Surface chunks share a common non-vendor module (shared utilities in `resources/js/composables/`, `resources/js/utils/`, and `resources/js/components/ui/` are excluded from this constraint)
3. WHEN the storefront Surface is loaded, THE initial page response SHALL NOT transfer any JavaScript module whose file path resides under `resources/js/modules/admin/`, `resources/js/modules/pos/`, `resources/js/modules/attendance/`, or the KDS route tree
4. WHEN the POS Surface is loaded, THE initial page response SHALL NOT transfer any JavaScript module whose file path resides under `resources/js/modules/storefront/`, `resources/js/modules/admin/`, or `resources/js/modules/attendance/`
5. WHEN a Surface route chunk is loaded, THE Build_System SHALL ensure the combined transferred size of that chunk (gzipped) does not exceed 300 KB, excluding shared vendor chunks
6. IF the build produces a chunk that contains modules from more than one Surface directory, THEN THE Build_System SHALL fail the build with an error message indicating which Surfaces were incorrectly merged into a single chunk

### Requirement 2: Lazy Loading of Heavy Components

**User Story:** As a developer, I want heavy third-party-dependent components to be loaded only when needed, so that the initial page load is not penalized by libraries the user may never use.

#### Acceptance Criteria

1. WHEN a route requiring a charting component is navigated to, THE Build_System SHALL load the charting library (apexcharts, vue3-apexcharts) as a separate Lazy_Chunk that is not included in the entry bundle
2. WHEN a route requiring the rich-text editor is navigated to, THE Build_System SHALL load the editor libraries (tiptap, prosemirror) as a separate Lazy_Chunk that is not included in the entry bundle
3. WHEN a route requiring Google Maps is navigated to, THE Build_System SHALL load the Google Maps library (@googlemaps/js-api-loader) as a separate Lazy_Chunk that is not included in the entry bundle
4. WHEN a route requiring the carousel component is navigated to, THE Build_System SHALL load the Swiper library as a separate Lazy_Chunk that is not included in the entry bundle
5. WHEN a route requiring Firebase features is navigated to, THE Build_System SHALL load the Firebase SDK as a separate Lazy_Chunk that is not included in the entry bundle
6. THE Build_System SHALL produce an entry bundle (app.js and its synchronous imports) that contains none of the following libraries: apexcharts, vue3-apexcharts, @tiptap/*, prosemirror-*, @googlemaps/js-api-loader, swiper, or firebase
7. THE Build_System SHALL produce each Lazy_Chunk as a distinct output file with a minimum size of 5 KB (indicating the library code is contained within it rather than inlined into the entry bundle)
8. IF a user navigates to a route that does not require any heavy component, THEN THE Build_System SHALL not trigger a network request for any Lazy_Chunk associated with charting, editor, Google Maps, carousel, or Firebase libraries

### Requirement 3: Vendor Chunk Optimization

**User Story:** As a developer, I want vendor libraries grouped into logical, cacheable chunks, so that browser caching is maximized and users only re-download code that actually changed.

#### Acceptance Criteria

1. THE Build_System SHALL produce a dedicated Vendor_Chunk named "vue-vendor" containing the Vue ecosystem core packages: vue, vue-router, pinia, and vue-i18n
2. THE Build_System SHALL produce a dedicated Vendor_Chunk named "radix" containing the UI primitives: radix-vue, class-variance-authority, clsx, and tailwind-merge
3. THE Build_System SHALL produce a dedicated Vendor_Chunk for each of the following heavy library domains: charting (apexcharts, vue3-apexcharts, @unovis/ts, @unovis/vue), editor (@tiptap/*, prosemirror-*), maps (@googlemaps/js-api-loader), carousel (swiper), and Firebase (firebase)
4. THE Build_System SHALL produce a catch-all Vendor_Chunk named "vendor" containing all remaining node_modules dependencies that do not match any named chunk rule
5. WHEN a vendor library is updated without changes to files outside node_modules, THE Build_System SHALL produce a new content-hash filename only for the Vendor_Chunk containing that library, while all other Vendor_Chunk filenames remain identical to the previous build output
6. THE Build_System SHALL ensure that each produced Vendor_Chunk does not exceed 700 KB uncompressed in size; IF a Vendor_Chunk exceeds 700 KB, THEN THE Build_System SHALL emit a chunk size warning during the build process
7. THE Build_System SHALL assign each node_modules dependency to exactly one Vendor_Chunk, with no duplication of a package across multiple chunks

### Requirement 4: Performance Budget Enforcement

**User Story:** As a team lead, I want the build to warn when any chunk exceeds a defined size limit, so that bundle regressions are caught before deployment.

#### Acceptance Criteria

1. WHEN a production build produces any single Chunk whose minified size (before gzip) exceeds 500 kB, THE Build_System SHALL emit a warning to standard output identifying the violation
2. WHEN a production build produces a total Initial_Bundle for any Surface whose combined minified size (before gzip) exceeds 300 kB, THE Build_System SHALL emit a warning to standard output identifying the violation
3. WHEN a build produces a Chunk exceeding the Performance_Budget, THE Build_System SHALL list the chunk file name and its actual size in kB in the warning output
4. IF a Performance_Budget warning is emitted, THEN THE Build_System SHALL complete the build successfully with exit code 0 (warning only, not a build failure)
5. THE Build_System SHALL support configuring both the per-chunk size limit and the per-surface initial bundle size limit via the Vite configuration file without code changes

### Requirement 5: Shared Module Deduplication

**User Story:** As a developer, I want code shared across multiple surfaces to be extracted into a common chunk, so that it is downloaded once and cached for reuse across surface navigations.

#### Acceptance Criteria

1. WHEN a module is imported by two or more Surface route trees, THE Build_System SHALL extract that module into a shared Chunk rather than duplicating it in each Surface chunk, such that the module's code appears in exactly one output chunk file
2. THE Build_System SHALL extract all modules from `components/ui/` into a common Chunk available to all Surfaces, regardless of how many Surfaces currently import them
3. IF a module from `utils/`, `composables/`, or `services/` is imported by more than one Surface route tree, THEN THE Build_System SHALL extract that module into the shared Chunk
4. IF a module outside `components/ui/` is used by only one Surface, THEN THE Build_System SHALL NOT extract that module into the shared Chunk and SHALL instead include it in that Surface's own chunk
5. WHEN a Surface chunk is loaded, THE Build_System SHALL ensure the shared Chunk is loaded before the Surface chunk executes, so that shared dependencies are available at runtime
6. WHEN the production build completes, THE Build_System SHALL produce at most one shared application-code Chunk (excluding Vendor_Chunks) containing all cross-surface modules

### Requirement 6: Build Configuration Maintainability

**User Story:** As a developer, I want the code-splitting configuration to be clearly documented and centralized in the Vite config, so that future contributors can understand and modify chunking rules.

#### Acceptance Criteria

1. THE Build_System SHALL define all chunk-splitting rules (both vendor library grouping and application Surface isolation) in a single `manualChunks` function within `vite.config.js`
2. THE Build_System SHALL use path-based detection, matching module IDs against the known Surface directory prefixes (admin, attendance, pos, storefront, kds), to assign application modules to their respective Surface chunks
3. IF a module ID does not match any Surface directory prefix and is not a node_modules dependency, THEN THE Build_System SHALL leave it in the default chunk produced by the bundler
4. WHEN a new Surface is added to the application, THE Build_System SHALL require only the addition of a new path prefix entry in the `manualChunks` function to enable chunk isolation for that Surface, with no changes needed in other configuration files
5. THE Build_System SHALL include an inline comment above each chunk-grouping rule in the `manualChunks` function stating which modules the rule targets and why they are grouped separately

### Requirement 7: Development Experience Preservation

**User Story:** As a developer, I want code-splitting to apply only to production builds, so that the development server remains fast with instant hot module replacement.

#### Acceptance Criteria

1. WHILE the Build_System is running in development mode, THE Build_System SHALL NOT apply `manualChunks` splitting logic to served modules
2. WHILE the Build_System is running in development mode, THE Build_System SHALL deliver hot module replacement updates to the browser within 2 seconds of a file save for any Vue component regardless of its chunk assignment in production
3. WHEN the developer runs the production build command, THE Build_System SHALL apply the `manualChunks` splitting logic and produce the configured chunk files
4. WHEN switching between development and production builds, THE Build_System SHALL use the same `vite.config.js` file without requiring the developer to edit configuration files or set additional environment variables beyond the standard `npm run dev` and `npm run build` scripts

### Requirement 8: Shared UI Component and Style Consistency

**User Story:** As a developer, I want all surfaces to use the shared shadcn-vue component library with consistent spacing and padding tokens, so that no surface introduces duplicate or conflicting styles.

#### Acceptance Criteria

1. THE Build_System SHALL extract all modules resolved from `components/ui/` into a single shared Chunk that is loaded by every Surface's Initial_Bundle
2. WHEN a Surface component applies spacing or padding, THE Surface component SHALL exclusively use Tailwind CSS utility classes (e.g., `p-4`, `gap-3`, `mx-auto`) or CSS variables defined in the project's HSL-based Design_Token system, and SHALL NOT define custom CSS properties or static values for spacing or padding
3. THE Build_System SHALL NOT produce Surface-specific CSS chunks that re-declare any CSS rule already present in the shared CSS chunk (zero duplicated selectors across output chunks)
4. WHEN a new component is created for any Surface, THE component SHALL import shared primitives from `components/ui/` for any UI pattern that has a corresponding primitive in the Shared_UI_Library (Button, Card, Dialog, Input, Select, Table, Tabs, Sheet, Badge, Checkbox, Label, Skeleton, Switch, Textarea, Tooltip, DropdownMenu, RadioGroup, AlertDialog, Breadcrumb, DatePicker, LoadingOverlay), rather than defining custom CSS classes or markup for the same pattern
5. THE Build_System SHALL produce a single shared CSS chunk containing all Tailwind utilities and shadcn-vue component styles, and every Surface chunk SHALL reference this single CSS chunk rather than bundling its own copy of these styles

### Requirement 9: Style Fragmentation Prevention

**User Story:** As a team lead, I want a clear boundary that prevents surfaces from introducing their own one-off component styles, so that the codebase maintains a single source of truth for UI patterns.

#### Acceptance Criteria

1. WHEN a component uses layout, spacing, or padding patterns, THE component SHALL use Tailwind utility classes (e.g., `p-4`, `gap-3`, `space-y-2`) rather than custom CSS rules that redefine equivalent spacing, margin, padding, or flexbox/grid layout behavior
2. THE Build_System SHALL NOT include surface-specific CSS files (e.g., `pos.css`, `admin.css`) that define custom component classes for interactive primitives (buttons, cards, dialogs, dropdowns, tabs, badges, form inputs) already provided by shadcn-vue components in `components/ui/`
3. IF a UI pattern is used in 2 or more components across different surfaces, THEN THE pattern SHALL be implemented as a shared component in `components/ui/` rather than duplicated with inline styles or surface-scoped CSS classes in each surface
4. THE Build_System SHALL produce a build output where all CSS is consolidated into a single shared stylesheet plus Tailwind's generated utilities, with no additional per-surface CSS bundle files loaded independently of the shared stylesheet
5. IF a surface requires styles that address a context-specific constraint not expressible via Tailwind utilities or shadcn-vue props (e.g., touch-target sizing for POS kiosk, print-only visibility rules), THEN THE surface-specific CSS file SHALL contain only those context-specific overrides and SHALL NOT redefine patterns available through Tailwind utilities or shadcn-vue components
