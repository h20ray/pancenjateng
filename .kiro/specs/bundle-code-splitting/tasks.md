# Implementation Plan: Bundle Code Splitting

## Overview

Implement surface-based code splitting, optimized vendor chunking, lazy-loaded heavy components, shared module deduplication, and performance budget enforcement for the Vite 8 + Rolldown build. The implementation extends the existing `manualChunks` function in `vite.config.js` with surface isolation logic, adds a custom Vite plugin for performance budgets, introduces a contamination guard, and migrates heavy components to `defineAsyncComponent()`.

## Tasks

- [x] 1. Set up module directory structure and core chunking interfaces
  - [x] 1.1 Create KDS surface module directory and scaffold all surface route files
    - Create `resources/js/modules/kds/` directory with `routes.js`, `components/`, `stores/`, `services/` subdirectories
    - Ensure all 5 surfaces (admin, pos, storefront, attendance, kds) have consistent directory structure under `resources/js/modules/`
    - _Requirements: 1.1, 1.2, 6.2, 6.4_

  - [x] 1.2 Implement the enhanced `manualChunks` function with surface isolation in `vite.config.js`
    - Extend the existing `manualChunks` function to add surface isolation logic (detect `modules/{surface}/` paths)
    - Add shared UI extraction (`components/ui/` → `"shared"` chunk)
    - Add inline comments above each chunk-grouping rule explaining what it targets and why
    - Ensure vendor rules remain first-match-wins with correct priority order
    - Add `class-variance-authority`, `clsx`, `tailwind-merge` to the `radix` chunk rule
    - Add `@unovis/ts`, `@unovis/vue` to the `charts` chunk rule
    - Ensure `manualChunks` only applies when `command === 'build'` (not in dev mode)
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.4, 3.7, 5.2, 6.1, 6.2, 6.3, 6.5, 7.1, 7.3, 7.4_

  - [x]* 1.3 Write property tests for `manualChunks` surface isolation (Property 1)
    - **Property 1: Surface Isolation**
    - Generate random module paths under `resources/js/modules/{surface}/` and verify `manualChunks` returns the correct surface chunk name
    - Use fast-check to generate paths for all 5 surfaces
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [x]* 1.4 Write property tests for vendor routing correctness (Property 2)
    - **Property 2: Vendor Routing Correctness**
    - Generate random `node_modules/` paths matching named vendor group rules and verify correct chunk assignment
    - Verify catch-all "vendor" assignment for unmatched node_modules paths
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x]* 1.5 Write property tests for vendor assignment determinism (Property 3)
    - **Property 3: Vendor Assignment Determinism**
    - Generate random `node_modules/` paths and call `manualChunks` multiple times, verifying the same result each time (never undefined)
    - **Validates: Requirements 3.7**

  - [x]* 1.6 Write property tests for shared UI extraction (Property 4)
    - **Property 4: Shared UI Extraction**
    - Generate random paths containing `components/ui/` and verify `manualChunks` always returns `"shared"`
    - **Validates: Requirements 5.2, 8.1**

  - [x]* 1.7 Write property tests for fallthrough behavior (Property 5)
    - **Property 5: Fallthrough Behavior**
    - Generate random paths that are NOT under `node_modules/`, NOT under `modules/{surface}/`, and NOT under `components/ui/`, and verify `manualChunks` returns `undefined`
    - **Validates: Requirements 6.3**

- [x] 2. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement performance budget plugin and contamination guard
  - [x] 3.1 Implement the performance budget Vite plugin
    - Create `resources/js/build/performanceBudgetPlugin.js` (or `.ts`)
    - Implement `generateBundle` hook that iterates over chunks and measures minified size
    - Emit warnings to stdout for chunks exceeding `chunkSizeLimit` (default 500 kB)
    - Emit warnings for surfaces whose combined initial chunks exceed `surfaceInitialLimit` (default 300 kB)
    - Ensure the plugin never fails the build (always exit code 0)
    - Support configurable limits via plugin options in `vite.config.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.2 Implement the cross-surface contamination guard
    - Create `resources/js/build/contaminationGuardPlugin.js` (or `.ts`)
    - Implement a Vite plugin that runs in `generateBundle` hook
    - Scan each output chunk's module list for paths belonging to multiple surface directories
    - If contamination detected, emit a build error with the chunk name, contaminated surfaces, and offending module paths
    - Fail the build (non-zero exit) only when contamination is found
    - _Requirements: 1.6_

  - [x] 3.3 Register both plugins in `vite.config.js`
    - Add the performance budget plugin and contamination guard to the Vite plugins array
    - Ensure plugins only run during production builds (`apply: 'build'`)
    - _Requirements: 4.5, 7.1_

  - [x]* 3.4 Write property tests for per-chunk budget warning (Property 7)
    - **Property 7: Per-Chunk Budget Warning**
    - Generate random chunk sizes and verify warnings are produced only when exceeding the limit
    - Verify warning message contains chunk filename and actual size in kB
    - **Validates: Requirements 4.1, 4.3**

  - [x]* 3.5 Write property tests for per-surface initial bundle warning (Property 8)
    - **Property 8: Per-Surface Initial Bundle Warning**
    - Generate random surface bundle sizes and verify warnings are produced only when exceeding the limit
    - Verify warning message identifies the surface and its actual combined size
    - **Validates: Requirements 4.2**

  - [x]* 3.6 Write property tests for cross-surface contamination detection (Property 6)
    - **Property 6: Cross-Surface Contamination Detection**
    - Generate sets of module paths from different surfaces assigned to the same chunk
    - Verify the contamination guard detects the violation and produces an error identifying both surface names
    - **Validates: Requirements 1.6**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Migrate heavy components to lazy loading
  - [x] 5.1 Migrate charting components to `defineAsyncComponent()` with dynamic imports
    - Identify all components that import apexcharts, vue3-apexcharts, @unovis/ts, or @unovis/vue
    - Wrap them with `defineAsyncComponent(() => import(...))` at their usage sites
    - Ensure the charting Lazy_Chunk is not included in the entry bundle
    - _Requirements: 2.1, 2.6, 2.7_

  - [x] 5.2 Migrate rich-text editor components to `defineAsyncComponent()` with dynamic imports
    - Identify all components that import @tiptap/* or prosemirror-*
    - Wrap them with `defineAsyncComponent(() => import(...))` at their usage sites
    - Ensure the editor Lazy_Chunk is not included in the entry bundle
    - _Requirements: 2.2, 2.6, 2.7_

  - [x] 5.3 Migrate Google Maps components to `defineAsyncComponent()` with dynamic imports
    - Identify all components that import @googlemaps/js-api-loader
    - Wrap them with `defineAsyncComponent(() => import(...))` at their usage sites
    - Ensure the maps Lazy_Chunk is not included in the entry bundle
    - _Requirements: 2.3, 2.6, 2.7_

  - [x] 5.4 Migrate Swiper/carousel components to `defineAsyncComponent()` with dynamic imports
    - Identify all components that import swiper
    - Wrap them with `defineAsyncComponent(() => import(...))` at their usage sites
    - Ensure the swiper Lazy_Chunk is not included in the entry bundle
    - _Requirements: 2.4, 2.6, 2.7_

  - [x] 5.5 Migrate Firebase components to `defineAsyncComponent()` or dynamic `import()`
    - Identify all modules that import firebase/*
    - Wrap them with dynamic `import()` so Firebase SDK loads on demand
    - Ensure the firebase Lazy_Chunk is not included in the entry bundle
    - _Requirements: 2.5, 2.6, 2.7_
    - **Already compliant:** `firebaseNotificationService.js` exclusively uses dynamic `import()` for all Firebase SDK modules (`firebase/app`, `firebase/messaging`). The `manualChunks` function routes `node_modules/firebase/` to a separate `'firebase'` chunk. No static Firebase imports exist anywhere in the codebase.

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integration wiring and build verification
  - [x] 7.1 Write unit tests for the `manualChunks` function
    - Test specific vendor package paths (exact paths for each named group)
    - Test edge cases: paths with similar prefixes (e.g., `modules/admin-tools/` should NOT match `admin`)
    - Test nested node_modules paths and scoped packages (`@tiptap/vue-3`)
    - Test development mode bypass (manualChunks not applied when `command === 'serve'`)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.2, 7.1_

  - [x] 7.2 Write unit tests for the performance budget plugin
    - Test warning message format verification
    - Test no-throw guarantee (plugin always returns, never throws)
    - Test configurable limits
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.3 Write unit tests for the contamination guard plugin
    - Test detection of cross-surface module mixing in a single chunk
    - Test that clean chunks (single surface) pass without error
    - Test error message format includes surface names and offending module paths
    - _Requirements: 1.6_

  - [x]* 7.4 Write integration test that runs `npm run build` and verifies output
    - Verify each surface has its own chunk file in build output
    - Verify heavy vendor chunks exist as separate files (charts, editor, google-maps, swiper, firebase)
    - Verify `components/ui/` code appears in shared chunk only
    - Verify entry bundle does not contain heavy libraries
    - Verify single shared CSS output file
    - _Requirements: 1.1, 1.2, 2.6, 3.1, 3.2, 3.3, 5.2, 8.1, 8.5, 9.4_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The `manualChunks` function and plugins are pure/deterministic functions, ideal for property-based testing
- The existing `modules/` directory already has admin, pos, storefront, and attendance — only kds needs to be created
- The existing `manualChunks` in `vite.config.js` handles vendor chunking but lacks surface isolation and shared UI extraction

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "1.6", "1.7"] },
    { "id": 3, "tasks": ["3.1", "3.2"] },
    { "id": 4, "tasks": ["3.3", "3.4", "3.5", "3.6"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 7, "tasks": ["7.4"] }
  ]
}
```
