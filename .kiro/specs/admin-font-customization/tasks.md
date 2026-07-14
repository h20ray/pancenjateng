# Implementation Plan: Admin Font Customization

## Overview

This plan implements administrator font customization by adding curated Google Fonts lists, font selector UI with live preview, dynamic CDN loading, CSS variable application, backend persistence with whitelist validation, and a Theme Settings page refactor to decomposed shadcn-vue sub-components. Each task builds incrementally, wiring components together as they are created.

## Tasks

- [x] 1. Create shared font list constants and utility foundations
  - [x] 1.1 Create `resources/js/constants/fontLists.js` with curated sans-serif and monospace font lists
    - Define `SYSTEM_DEFAULT_SENTINEL`, `FONT_SANS_LIST` (16 sans-serif fonts + System Default), `FONT_MONO_LIST` (10 monospace fonts + System Default), and `FONT_WEIGHTS` array
    - Each entry is an object with `name` and `value` properties; first entry in each list has `value` equal to `SYSTEM_DEFAULT_SENTINEL`
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.4, 2.5_

  - [x] 1.2 Write property test for font list entry structure (Property 1)
    - **Property 1: Font list entries have valid structure**
    - Verify every entry in FONT_SANS_LIST and FONT_MONO_LIST has non-empty `name` and `value` strings; first entry has `value === SYSTEM_DEFAULT_SENTINEL`
    - **Validates: Requirements 2.5, 1.2, 2.2**

  - [x] 1.3 Create `resources/js/utils/fontLoader.js` with Google Fonts CDN link management
    - Implement `buildGoogleFontsUrl(fontFamily, weights)` to construct CDN URL with specified weights
    - Implement `loadGoogleFont(fontFamily, slot)` to inject `<link>` with `data-font-slot` attribute, removing previous link for same slot, with 5-second timeout
    - Implement `removeGoogleFont(slot)` to remove `<link>` by `data-font-slot`
    - Implement `preloadFontForPreview(fontFamily)` with 3-second timeout returning boolean
    - Ensure at most one `<link>` per slot exists at any time; no-op if same font already loaded
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.4 Write property test for Google Fonts URL weights (Property 5)
    - **Property 5: Google Fonts URL contains specified weights**
    - For any font family name from curated lists (excluding System Default), verify `buildGoogleFontsUrl(fontFamily, FONT_WEIGHTS)` URL contains weights 400, 500, 600, 700
    - **Validates: Requirements 4.4**

  - [x] 1.5 Write property test for Google Fonts link management invariant (Property 4)
    - **Property 4: Google Fonts link management invariant**
    - For any sequence of font load operations on a given slot, verify at most one `<link>` with matching `data-font-slot` exists; applying same font twice does not create duplicate
    - **Validates: Requirements 4.1, 4.6**

- [x] 2. Extend themeApplier and useThemeStore for font application
  - [x] 2.1 Add `applyFontSansStack(fontName)` and `applyFontMonoStack(fontName)` to `resources/js/utils/themeApplier.js`
    - `applyFontSansStack` sets `--font-sans`, `--font-body`, `--font-heading`, `--font-admin`, `--font-client` on `document.documentElement` to `'<fontName>', system-ui, sans-serif`
    - `applyFontMonoStack` sets `--font-mono` on `document.documentElement` to `'<fontName>', ui-monospace, monospace`
    - Handle "System Default" by applying the System_Font_Stack without quotes
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 Write property test for CSS variable application — sans fonts (Property 2)
    - **Property 2: CSS variable application for sans fonts**
    - For any non-empty font name string, verify `applyFontSansStack(fontName)` sets all five CSS custom properties to `'<fontName>', system-ui, sans-serif`
    - **Validates: Requirements 5.1, 5.2**

  - [x] 2.3 Write property test for CSS variable application — mono fonts (Property 3)
    - **Property 3: CSS variable application for mono fonts**
    - For any non-empty font name string, verify `applyFontMonoStack(fontName)` sets `--font-mono` to `'<fontName>', ui-monospace, monospace`
    - **Validates: Requirements 5.3**

  - [x] 2.4 Extend `resources/js/stores/useThemeStore.js` with font state and actions
    - Add `fontSans` and `fontMono` state fields (default `null`)
    - Add `applyFontSans(fontValue)` action: calls `loadGoogleFont` (or `removeGoogleFont` for System Default), calls `applyFontSansStack`, persists to localStorage under `theme_font_sans`
    - Add `applyFontMono(fontValue)` action: calls `loadGoogleFont` (or `removeGoogleFont` for System Default), calls `applyFontMonoStack`, persists to localStorage under `theme_font_mono`
    - Add `initializeFonts(themeData)` action: reads from API response → localStorage fallback → System Default; loads CDN links and applies CSS variables
    - Handle localStorage unavailability gracefully (in-memory only)
    - Add `storage` event listener for cross-tab sync of `theme_font_sans` and `theme_font_mono`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2, 7.4_

  - [x] 2.5 Write property test for localStorage round-trip (Property 6)
    - **Property 6: Font selection localStorage round-trip**
    - For any font name string, saving to localStorage under `theme_font_sans` (or `theme_font_mono`) and reading back returns the identical string
    - **Validates: Requirements 5.4**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Backend font persistence and validation
  - [x] 4.1 Create `config/fontLists.php` with allowed font arrays
    - Define `'sans'` array with all 17 allowed values (System Default + 16 sans fonts)
    - Define `'mono'` array with all 11 allowed values (System Default + 10 mono fonts)
    - _Requirements: 6.2, 6.3_

  - [x] 4.2 Update `app/Http/Requests/ThemeRequest.php` to validate `font_sans` and `font_mono`
    - Add `font_sans` rule: `nullable|string|max:100|in:` values from `config('fontLists.sans')`
    - Add `font_mono` rule: `nullable|string|max:100|in:` values from `config('fontLists.mono')`
    - Return 422 with error message for invalid values
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.3 Update `app/Http/Resources/ThemeResource.php` to include font fields in response
    - Add `font_sans` field defaulting to `'System Default'` when null/empty
    - Add `font_mono` field defaulting to `'System Default'` when null/empty
    - _Requirements: 6.5, 7.1_

  - [x] 4.4 Update `app/Http/Controllers/Admin/ThemeController.php` and ThemeService to persist font selections
    - Store `font_sans` and `font_mono` via the Settings group mechanism (same as existing theme fields)
    - _Requirements: 6.6_

  - [x] 4.5 Write property test for backend validation — sans font whitelist (Property 7)
    - **Property 7: Backend validation accepts only allowed sans fonts**
    - For any string value, the `font_sans` validation passes if and only if value equals "System Default" or is in `config('fontLists.sans')`
    - **Validates: Requirements 6.2, 6.4**

  - [x] 4.6 Write property test for backend validation — mono font whitelist (Property 8)
    - **Property 8: Backend validation accepts only allowed mono fonts**
    - For any string value, the `font_mono` validation passes if and only if value equals "System Default" or is in `config('fontLists.mono')`
    - **Validates: Requirements 6.3, 6.4**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Theme Settings page decomposition and font selector UI
  - [x] 6.1 Create `resources/js/components/admin/settings/Theme/FontSelector.vue`
    - Implement reusable font selector using shadcn-vue `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
    - Props: `modelValue`, `fontList`, `label`, `id`, `ariaLabel`
    - Emits: `update:modelValue`
    - Render each `SelectItem` font name in its own typeface via inline `font-family` style
    - Load font previews via `preloadFontForPreview` with 3-second timeout; fallback to System_Font_Stack on failure
    - Ensure keyboard navigation: Tab to focus, Enter/Space to open, Arrow keys to browse, Enter to confirm, Escape to close
    - Associate `<Label>` with Select trigger via `for`/`id` attributes; set `aria-label` from i18n
    - Maintain 4.5:1 contrast ratio and visible 2px focus indicator
    - _Requirements: 1.3, 1.4, 2.3, 3.1, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 6.2 Create `resources/js/components/admin/settings/Theme/TypographySection.vue`
    - Implement Typography settings section using shadcn-vue `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`
    - Include two `FontSelector` instances (sans-serif and monospace) with v-model binding
    - Show live preview text (minimum 20 characters) rendered in selected font, updating within 500ms of selection
    - Use i18n keys for all labels and section headings
    - _Requirements: 3.1, 3.2, 3.3, 8.2, 8.3, 8.4_

  - [x] 6.3 Decompose `ThemeComponent.vue` into sub-components
    - Extract `ColorSection.vue` for color settings
    - Extract `ShapeSection.vue` for border radius and shape settings
    - Extract `BrandAssetsSection.vue` for logo/brand asset settings
    - Extract `DarkModeSection.vue` for dark mode toggle
    - Refactor `ThemeComponent.vue` into `ThemeSettingsPage.vue` orchestrator that composes all section sub-components
    - Replace custom `.theme-*` CSS classes with shadcn-vue primitives (`Card`, `Label`, `Button`, `Select`, `Switch`) and Tailwind utilities
    - Retain scoped CSS only for native HTML inputs (color picker, range slider, file input)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.9_

  - [x] 6.4 Wire `TypographySection.vue` into the decomposed Theme Settings page
    - Import and place `TypographySection` in the orchestrator page
    - Connect font selection to `useThemeStore` save action (POST to backend API)
    - Display success notification on save; display error notification on API failure retaining selections
    - Populate selectors with saved values on page load, falling back to "System Default"
    - _Requirements: 3.4, 3.5, 3.6, 7.3_

  - [x] 6.5 Write unit tests for FontSelector.vue
    - Test rendering of font options in their own typeface
    - Test keyboard navigation (Tab, Enter, Space, Arrow keys, Escape)
    - Test aria-label and label association
    - Test fallback rendering when font preview fails to load
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 6.6 Write unit tests for TypographySection.vue
    - Test v-model binding for both font selectors
    - Test live preview updates within 500ms
    - Test correct population from saved values
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [x] 7. Add i18n keys for all new user-visible strings
  - [x] 7.1 Add i18n keys to `resources/js/languages/en.json` and `resources/js/languages/id.json`
    - Add keys for section headings: typography, colors, shape, brand assets, dark mode
    - Add keys for font labels: font_sans, font_mono, system_default, font_preview_text
    - Add keys for aria labels: font_selector_sans_aria, font_selector_mono_aria
    - Add keys for shape section: border_radius, sharp, subtle, rounded, pill
    - Add keys for dark mode: enable_dark_mode
    - _Requirements: 8.8, 9.2_

- [x] 8. Integration wiring and default behavior
  - [x] 8.1 Wire `initializeFonts` into application bootstrap
    - Call `useThemeStore.initializeFonts()` during app initialization after fetching theme data
    - Ensure CDN links are injected before CSS variables are applied
    - Handle "System Default" by not injecting any CDN links and applying System_Font_Stack
    - Verify no `<link>` elements pointing to `fonts.googleapis.com` exist when System Default is active
    - _Requirements: 4.2, 7.1, 7.2, 7.4_

  - [x] 8.2 Write integration tests for full save flow
    - Test: select font → save → verify API payload → verify CSS variables applied
    - Test: page load with saved fonts → verify selectors populated → verify fonts applied
    - Test: cross-tab sync via storage event → verify CSS variables update
    - Test: System Default selection → verify CDN links removed → verify System_Font_Stack applied
    - _Requirements: 3.4, 4.5, 5.5, 7.2_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–8)
- Unit tests validate specific examples and edge cases
- The decomposition in task 6.3 is the largest single task — it refactors the existing 850+ line ThemeComponent.vue into focused sub-components following the no-monolith-components steering rule
- All new UI uses shadcn-vue primitives per project conventions (no Bootstrap, no custom `.theme-*` classes where shadcn equivalents exist)
- All state management uses Pinia (no Vuex)
- All i18n keys must be added to both `en.json` and `id.json` before use

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "4.2", "4.3", "4.4"] },
    { "id": 2, "tasks": ["1.4", "1.5", "2.1", "4.5", "4.6"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["2.5", "6.1", "7.1"] },
    { "id": 5, "tasks": ["6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "6.5", "6.6"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2"] }
  ]
}
```
