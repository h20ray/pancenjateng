# Requirements Document

## Introduction

This feature enables administrators to customize the application's typography by selecting from a curated list of Google Fonts. The system currently uses two font families (`--font-sans` for body/UI text and a mono font for code contexts). Administrators will be able to change both the sans-serif and monospace fonts via the Settings → Theme page. The default remains the local system font stack. Additionally, the admin Theme settings page will be refactored to follow shadcn-vue component conventions, replacing custom CSS classes with proper shadcn-vue primitives.

## Glossary

- **Theme_Settings_Page**: The admin Settings → Theme page (`ThemeComponent.vue`) where administrators configure visual appearance
- **Font_Selector**: A UI control that allows the administrator to pick a font from the curated list
- **Font_Sans_List**: A curated collection of 10–20 popular modern sans-serif Google Fonts available for selection
- **Font_Mono_List**: A curated collection of 10–20 popular modern monospace Google Fonts available for selection
- **System_Font_Stack**: The default local font fallback (`system-ui, -apple-system, sans-serif` for sans; `ui-monospace, monospace` for mono)
- **Google_Fonts_CDN**: The external service (fonts.google.com) from which font files are loaded dynamically
- **Theme_Store**: The Pinia store (`useThemeStore`) that manages theme state and persistence
- **Font_Preview**: A visual sample of the selected font rendered in the Font_Selector dropdown

## Requirements

### Requirement 1: Curated Sans-Serif Font List

**User Story:** As an administrator, I want a curated list of modern sans-serif Google Fonts, so that I can choose a professional body font for the application.

#### Acceptance Criteria

1. THE Font_Sans_List SHALL contain between 10 and 20 sans-serif Google Fonts, each of which is classified under the "Sans Serif" category on the Google Fonts platform and has at minimum 4 available weight variants (e.g., 300, 400, 500, 700).
2. THE Font_Sans_List SHALL include "System Default" as the first option, representing the System_Font_Stack, and the remaining fonts SHALL be ordered alphabetically by font family name.
3. WHEN the administrator views the Font_Selector for sans fonts, THE Font_Selector SHALL display each font name rendered in its own typeface as a Font_Preview by loading the font from the Google Fonts CDN.
4. IF a Google Font fails to load within 3 seconds during Font_Preview rendering, THEN THE Font_Selector SHALL display that font name rendered in the System_Font_Stack and SHALL not block the rendering of other font previews in the list.
5. THE Font_Sans_List SHALL be defined as a single shared constant accessible to both the frontend component and the font-loading utility.

### Requirement 2: Curated Monospace Font List

**User Story:** As an administrator, I want a curated list of modern monospace Google Fonts, so that I can choose a code/mono font for the application.

#### Acceptance Criteria

1. THE Font_Mono_List SHALL contain between 10 and 20 monospace Google Fonts that are currently available on the Google Fonts catalog and classified under the "Monospace" category.
2. THE Font_Mono_List SHALL include "System Default" as the first option, representing the System_Font_Stack for monospace (`ui-monospace, monospace`), and this entry SHALL NOT trigger a Google_Fonts_CDN load.
3. WHEN the administrator views the Font_Selector for mono fonts, THE Font_Selector SHALL display each font name rendered in its own typeface as a Font_Preview, falling back to the System_Font_Stack if the font has not yet loaded from the Google_Fonts_CDN.
4. THE Font_Mono_List SHALL be defined as a single shared constant accessible to both the frontend component and the font-loading utility.
5. THE Font_Mono_List SHALL store each entry as an object containing at minimum a `name` property (the human-readable font family name used for display) and a `value` property (the exact Google Fonts family identifier used for CDN loading), except for the "System Default" entry whose `value` SHALL be a sentinel indicating no external font load is required.

### Requirement 3: Font Selection via Theme Settings Page

**User Story:** As an administrator, I want to select sans and mono fonts on the Settings → Theme page, so that I can customize the application typography.

#### Acceptance Criteria

1. THE Theme_Settings_Page SHALL display two Font_Selector controls: one labeled for sans-serif font selection and one labeled for monospace font selection, each implemented as a dropdown (`Select` component) listing available font options.
2. WHEN the administrator selects a font from the Font_Sans_List, THE Font_Selector SHALL update the live preview within 500 milliseconds to show a sample text string (minimum 20 characters) rendered in the selected sans-serif font.
3. WHEN the administrator selects a font from the Font_Mono_List, THE Font_Selector SHALL update the live preview within 500 milliseconds to show a sample text string (minimum 20 characters) rendered in the selected monospace font.
4. WHEN the administrator clicks the save button, THE Theme_Store SHALL persist the selected font_sans and font_mono values to the backend API via a POST request, and upon receiving a success response, THE Theme_Settings_Page SHALL display a success notification.
5. IF the backend API returns an error response when saving font selections, THEN THE Theme_Settings_Page SHALL display an error notification and retain the unsaved selections in the Font_Selector controls so the administrator can retry without re-selecting.
6. WHEN the Theme_Settings_Page is loaded, THE Theme_Settings_Page SHALL populate both Font_Selector controls with the currently saved font values retrieved from the backend API, falling back to "System Default" if no saved values exist.

### Requirement 4: Google Fonts Dynamic Loading

**User Story:** As an administrator, I want selected Google Fonts to load dynamically, so that the application uses the chosen fonts without bundling all font files.

#### Acceptance Criteria

1. WHEN a font from the Google Fonts list (any font in the font selection dropdown other than "System Default") is selected and saved, THE Theme_Store SHALL inject a `<link>` element into the document `<head>` pointing to the Google_Fonts_CDN stylesheet URL for the selected font, and SHALL remove any previously injected Google_Fonts_CDN `<link>` element so that at most one Google_Fonts_CDN stylesheet is present at any time.
2. WHEN the application initializes and a saved font from the backend is a Google Font (not "System Default"), THE Theme_Store SHALL inject the corresponding Google_Fonts_CDN stylesheet `<link>` element into the document `<head>` before applying the font CSS variables.
3. IF the Google_Fonts_CDN stylesheet fails to load (network error or no response within 5 seconds), THEN THE Theme_Store SHALL apply the System_Font_Stack (`system-ui, sans-serif`) to the font CSS variables and render all text using the fallback fonts without causing invisible text (FOIT) or layout shift.
4. THE Theme_Store SHALL request only font weights 400, 500, 600, and 700 in the Google_Fonts_CDN stylesheet URL to minimize payload size.
5. WHEN "System Default" is selected and saved, THE Theme_Store SHALL remove any previously injected Google_Fonts_CDN `<link>` element from the document `<head>` and apply the System_Font_Stack (`system-ui, sans-serif`) to the font CSS variables.
6. IF the same Google Font that is already loaded is selected again, THEN THE Theme_Store SHALL NOT inject a duplicate `<link>` element and SHALL retain the existing stylesheet.

### Requirement 5: CSS Variable Application

**User Story:** As an administrator, I want my font selection to apply across the entire application, so that all surfaces reflect the chosen typography.

#### Acceptance Criteria

1. WHEN a sans font is saved, THE Theme_Store SHALL immediately set the CSS custom property `--font-sans` on `document.documentElement` with the value formatted as `'<FontName>', system-ui, sans-serif` using the System_Font_Stack as fallback.
2. WHEN a sans font is saved, THE Theme_Store SHALL immediately set the CSS custom properties `--font-body`, `--font-heading`, `--font-admin`, and `--font-client` on `document.documentElement` with the same font stack value as `--font-sans`.
3. WHEN a mono font is saved, THE Theme_Store SHALL immediately set the CSS custom property `--font-mono` on `document.documentElement` with the value formatted as `'<FontName>', ui-monospace, monospace` using the monospace System_Font_Stack as fallback.
4. THE Theme_Store SHALL persist font selections to localStorage under the keys `theme_font_sans` and `theme_font_mono` so that subsequent page loads can apply fonts before the backend API responds.
5. WHEN a storage event fires for the key `theme_font_sans` or `theme_font_mono`, THE Theme_Store SHALL read the updated values from localStorage and re-apply the font stack to all CSS custom properties in the current tab.
6. IF localStorage is unavailable or throws an error during read or write, THEN THE Theme_Store SHALL apply fonts to CSS custom properties using in-memory state only, without interrupting the save operation or displaying an error to the administrator.

### Requirement 6: Backend Font Persistence

**User Story:** As an administrator, I want my font choices to persist in the database, so that all users see the same typography after page reload.

#### Acceptance Criteria

1. THE ThemeController SHALL accept `font_sans` and `font_mono` as optional string fields (maximum 100 characters each) in the update request.
2. THE ThemeController SHALL validate that `font_sans`, when provided, is either "System Default" or a value from the Font_Sans_List.
3. THE ThemeController SHALL validate that `font_mono`, when provided, is either "System Default" or a value from the Font_Mono_List.
4. IF `font_sans` or `font_mono` contains a value not in the allowed list, THEN THE ThemeController SHALL reject the request with a 422 response and an error message indicating the invalid font value.
5. WHEN the theme API responds, THE ThemeResource SHALL include `font_sans` and `font_mono` in the response payload, defaulting to "System Default" when no font has been previously saved.
6. THE ThemeService SHALL store font selections using the Settings group mechanism (same as existing theme fields).

### Requirement 7: Default Font Behavior

**User Story:** As an administrator, I want the default font to be the system/local font, so that the application works without external font dependencies out of the box.

#### Acceptance Criteria

1. WHEN the backend theme API response contains no `font_sans` and no `font_mono` values (null, undefined, or empty string) AND no font values exist in localStorage, THE Theme_Store SHALL set `--font-sans` to the System_Font_Stack (`system-ui, -apple-system, sans-serif`) and `--font-mono` to the monospace System_Font_Stack (`ui-monospace, monospace`).
2. WHEN the administrator selects "System Default" for a font and saves, THE Theme_Store SHALL remove any Google_Fonts_CDN `<link>` elements from the document `<head>` for the previously loaded font, clear the corresponding localStorage font key, and set the CSS custom properties to the System_Font_Stack values.
3. IF no custom font is configured (both `font_sans` and `font_mono` resolve to "System Default" or are absent), THEN THE Theme_Settings_Page Font_Selector controls SHALL display "System Default" as the selected option in both the sans-serif and monospace dropdowns.
4. WHEN the Theme_Store reverts to the System_Font_Stack, THE document SHALL NOT contain any `<link>` elements with `href` pointing to `fonts.googleapis.com` or `fonts.gstatic.com`.

### Requirement 8: Theme Settings Page Refactor to shadcn-vue

**User Story:** As an administrator, I want the Theme settings page to follow shadcn-vue conventions, so that the UI is consistent with the rest of the admin panel.

#### Acceptance Criteria

1. THE Theme_Settings_Page SHALL replace all custom `.theme-*` CSS classes that have shadcn-vue or Tailwind equivalents with those primitives (Card, Label, Button, Select, Switch) and Tailwind utility classes, retaining scoped CSS only for native HTML inputs (color picker, range slider, file input) that have no shadcn-vue primitive.
2. THE Theme_Settings_Page SHALL use the shadcn-vue `Card` component (Card, CardHeader, CardTitle, CardContent) to wrap each settings section (Colors, Typography, Shape, Brand Assets, Dark Mode) as individual Card instances.
3. THE Theme_Settings_Page SHALL use the shadcn-vue `Label` component for all form field labels.
4. THE Theme_Settings_Page SHALL use the shadcn-vue `Select` component (Select, SelectTrigger, SelectContent, SelectItem) for all dropdown selections including heading font and body font.
5. THE Theme_Settings_Page SHALL use the shadcn-vue `Button` component for all action buttons including the save button and radius preset buttons.
6. THE Theme_Settings_Page SHALL use the shadcn-vue `Switch` component for the dark mode toggle.
7. IF the total template of Theme_Settings_Page exceeds 200 lines, THEN THE Theme_Settings_Page SHALL decompose into sub-components with each settings section (Colors, Typography, Shape, Brand Assets, Dark Mode) extracted as a separate child component orchestrated by a parent page component.
8. THE Theme_Settings_Page SHALL provide i18n keys in both `en.json` and `id.json` locale files for all user-visible strings, including the section headings ("Typography", "Shape", "Dark Mode"), field labels ("Heading Font", "Body Font", "Border Radius", "Enable dark mode", "Color Presets"), and radius preset labels ("Sharp", "Subtle", "Rounded", "Pill").
9. IF a native HTML input (type="color", type="range", or type="file") requires styling that cannot be achieved with Tailwind utilities alone, THEN THE Theme_Settings_Page SHALL use scoped CSS limited to that specific input element without introducing new `.theme-*` class naming conventions.

### Requirement 9: Font Selector Accessibility

**User Story:** As an administrator using assistive technology, I want the font selectors to be accessible, so that I can change fonts using a keyboard or screen reader.

#### Acceptance Criteria

1. THE Font_Selector SHALL be keyboard navigable such that the user can Tab to focus the trigger, press Enter or Space to open the dropdown, use arrow keys to browse options, press Enter to confirm a selection, and press Escape to close the dropdown without changing the value.
2. THE Font_Selector `<Label>` elements SHALL be programmatically associated with their corresponding Select trigger via matching `for` and `id` attributes, and each selector SHALL have a distinct `aria-label` attribute set to a translated string from the i18n system identifying its purpose.
3. WHEN a font is selected, THE Font_Selector SHALL convey the new selection to screen readers through the Radix Vue Select listbox/option pattern, such that the trigger element's accessible value reflects the currently selected font name.
4. THE Font_Selector SHALL maintain a minimum contrast ratio of 4.5:1 for all text within the trigger and dropdown in all interactive states (default, hover, focus, and disabled).
5. WHILE the Font_Selector trigger or any option within the open dropdown has keyboard focus, THE Font_Selector SHALL display a visible focus indicator with a minimum 2px outline or border distinguishable from the surrounding background.
