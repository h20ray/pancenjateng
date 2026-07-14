# Requirements Document

## Introduction

This feature addresses accessibility (a11y) and internationalization (i18n) compliance gaps across the toko-roti-gambang Vue.js + Laravel application. The audit identified missing ARIA attributes on interactive elements, hardcoded strings bypassing the i18n system, non-descriptive alt text on images, and form inputs lacking proper label associations. Fixing these issues ensures the application is usable by assistive technology users and fully translatable for both English and Indonesian locales.

## Glossary

- **Icon_Button_Component**: A Vue component rendering a button that contains only an icon (no visible text label), such as `SmIconDeleteComponent`, `SmIconViewComponent`, `SmIconQrCodeComponent`, `SmTimeSloteDeleteComponent`, `SmIconSidebarModalEditComponent`, `SmIconModalEditComponent`.
- **Screen_Reader**: Assistive technology that reads aloud UI content and interactive element names for visually impaired users.
- **ARIA_Label**: The `aria-label` HTML attribute providing an accessible name for an element when no visible text label is present.
- **Translation_System**: The vue-i18n integration using `$t()` or `t()` functions to resolve locale keys from `en.json` and `id.json`.
- **Locale_File**: JSON files at `resources/js/languages/en.json` and `resources/js/languages/id.json` containing all translation keys.
- **SR_Only_Text**: Visually hidden text (using the `sr-only` CSS class) intended exclusively for screen readers.
- **Alt_Text**: The `alt` attribute on `<img>` elements providing a text alternative for the image content.
- **Tab_Widget**: A set of interactive buttons that function as tabs, requiring `role="tab"`, `aria-selected`, and `aria-controls` attributes per WAI-ARIA Tabs pattern.
- **Form_Input**: An HTML `<input>`, `<textarea>`, or `<select>` element that accepts user data.
- **Dashboard_Component**: The `DashboardComponentShadcn.vue` admin dashboard page component.
- **POS_Cart_Panel**: The `PosCartPanelShadcn.vue` point-of-sale cart sidebar component.
- **Backend_Navbar**: The `BackendNavbarComponent.vue` admin layout header component.
- **Catalog_Panel**: The `PosCatalogPanelShadcn.vue` POS product catalog component.

## Requirements

### Requirement 1: Icon-Only Buttons Accessible Name

**User Story:** As a screen reader user, I want icon-only buttons to announce their purpose, so that I can identify and activate them without seeing the icon.

#### Acceptance Criteria

1. THE Icon_Button_Component SHALL provide an `aria-label` attribute whose value is a non-empty translated string from the Translation_System describing the button action (minimum 2 characters after trimming whitespace).
2. IF an Icon_Button_Component has a visible tooltip (either a Tooltip component or a CSS-based hover span), THEN THE Icon_Button_Component SHALL use the same translation key for both the tooltip text content and the `aria-label` value.
3. IF an Icon_Button_Component has no visible tooltip, THEN THE Icon_Button_Component SHALL still provide an `aria-label` with a translated string matching the `button.<action>` key convention.
4. THE Icon_Button_Component SHALL follow the existing pattern `:aria-label="$t('button.<action>')"` already used in `SmDeleteComponent.vue` and `SmViewComponent.vue`.
5. IF a translation key used for `aria-label` resolves to an empty string or is undefined in the Translation_System, THEN THE Icon_Button_Component SHALL fall back to a hardcoded English string describing the action so that the button is never announced without a name.

### Requirement 2: Cart Quantity Input Accessible Name

**User Story:** As a screen reader user, I want the cart quantity input to announce its purpose, so that I can understand what value I am editing.

#### Acceptance Criteria

1. IF the cart item has a non-empty name, THEN THE POS_Cart_Panel quantity `<input type="number">` SHALL have an `aria-label` attribute set to a translated string that includes the item name to distinguish it from other quantity inputs (e.g., "Quantity for {itemName}").
2. IF the cart item name is empty or undefined, THEN THE POS_Cart_Panel quantity `<input type="number">` SHALL have an `aria-label` attribute set to a translated string identifying it as a generic quantity input (e.g., "Quantity").
3. THE POS_Cart_Panel SHALL resolve the `aria-label` value through the Translation_System so that the label is displayed in the active locale.

### Requirement 3: Dashboard Tab Buttons ARIA Roles

**User Story:** As a screen reader user, I want the dashboard navigation tabs to be announced as tabs, so that I can understand the navigation structure and my current position.

#### Acceptance Criteria

1. THE Dashboard_Component tab container SHALL have `role="tablist"` on the element that wraps the four tab buttons (Overview, Analytics, Reports, Notification).
2. THE Dashboard_Component tab buttons SHALL each have `role="tab"`, a unique `id` attribute, and an `aria-selected` attribute set to either `"true"` or `"false"`.
3. WHEN the user activates a tab, THE Dashboard_Component SHALL set `aria-selected="true"` on that tab and `aria-selected="false"` on all other tabs, ensuring exactly one tab is selected at any time.
4. THE Dashboard_Component tab buttons SHALL each have an `aria-controls` attribute whose value matches the `id` of the associated content panel, and each content panel SHALL have `role="tabpanel"` and an `aria-labelledby` attribute referencing the controlling tab's `id`.
5. IF a tab is disabled (Reports, Notification), THEN THE Dashboard_Component SHALL set `aria-disabled="true"` on that tab so that assistive technologies announce it as unavailable.
6. WHILE focus is within the tablist, THE Dashboard_Component SHALL support left/right arrow key navigation between enabled tabs per the WAI-ARIA Tabs pattern.

### Requirement 4: Internationalize Hardcoded Alert Messages

**User Story:** As a user of the Indonesian locale, I want all alert and notification messages to appear in my selected language, so that I can understand system feedback without knowing English.

#### Acceptance Criteria

1. WHEN the POS system displays a stock-exceeded alert, THE Translation_System SHALL render the message using the locale key `message.requested_quantity_exceeds_stock` present in both Locale_Files, replacing all hardcoded string literals of that message in PosComponentShadcn.vue with a `t()` call.
2. WHEN the POS system displays an offline sync success result, THE Translation_System SHALL render the message using a locale key with interpolation for the synced count value, and the key SHALL exist in both Locale_Files with language-appropriate text.
3. WHEN the POS system displays an offline sync failure result, THE Translation_System SHALL render the message using a locale key with interpolation for the failed count value, and the key SHALL exist in both Locale_Files with language-appropriate text.
4. WHEN the bulk stock update displays a success message, THE Translation_System SHALL render the message using a locale key with interpolation for the updated count value, and the key SHALL exist in both Locale_Files with language-appropriate text.
5. THE Translation_System SHALL NOT contain hardcoded Indonesian or English user-facing alert strings in component source code; every alert passed to `alertService.success()` or `alertService.error()` in PosComponentShadcn.vue and ItemBulkStockComponent.vue SHALL use a `t()` or `$t()` call referencing a key defined in both Locale_Files.
6. WHEN a locale key required by criteria 1–4 is missing from either Locale_File, THE build or runtime SHALL produce a visible warning, and the raw key string SHALL be displayed to the user instead of translated text (existing vue-i18n fallback behavior).

### Requirement 5: Internationalize Dashboard Empty State and Metric Text

**User Story:** As a user of either locale, I want dashboard placeholder text and metric descriptions to appear in my selected language, so that the entire dashboard is consistently translated.

#### Acceptance Criteria

1. THE Dashboard_Component AdminEmptyState `title` props SHALL use translated strings from the Translation_System via `$t()` calls instead of hardcoded English text for all six empty-state instances: sales chart ("No sales activity"), order summary ("No order volume"), customer chart ("No customer activity"), low-stock list ("Stock looks healthy"), featured items list, and popular items list.
2. THE Dashboard_Component AdminEmptyState `description` props SHALL use translated strings from the Translation_System via `$t()` calls instead of hardcoded English text for all six empty-state instances: "Sales for the selected range will appear here.", "Order breakdowns will appear once this range has activity.", "Customer activity for the selected range will appear here.", "Low-stock items will appear here.", "Top customers will appear here after orders are placed.", "Featured items will appear here.", and "Popular items will appear here."
3. THE Dashboard_Component AdminMetricCard `description` props SHALL use translated strings from the Translation_System via `$t()` calls instead of hardcoded English text for all four metric cards: total sales ("+20.1% from last month"), total orders ("+180.1% from last month"), total customers ("+19% from last month"), and total menu items ("+201 since last hour").
4. WHEN a translated string is introduced for any AdminEmptyState or AdminMetricCard prop, THE Translation_System SHALL contain the corresponding key with a value in both the English locale file (`en.json`) and the Indonesian locale file (`id.json`).

### Requirement 6: Internationalize Hardcoded Button and Label Text

**User Story:** As a user of either locale, I want all button labels and UI text to appear in my selected language, so that the interface is fully translated.

#### Acceptance Criteria

1. THE POS_Cart_Panel "Dine In" button label SHALL use a translated string via `$t('label.dine_in')`.
2. THE Backend_Navbar title attributes for the search button, settings link, and fullscreen button SHALL each use a translated string from the Translation_System (e.g., `$t('button.search')`, `$t('menu.settings')`, `$t('button.fullscreen')`).
3. IF darkModeEnabled is true, THEN THE Backend_Navbar dark mode toggle title SHALL display the translated string for "Light mode" via `$t('label.light_mode')`; IF darkModeEnabled is false, THEN THE Backend_Navbar dark mode toggle title SHALL display the translated string for "Dark mode" via `$t('label.dark_mode')`.
4. WHEN the RichTextEditor renders toolbar button titles, THE RichTextEditor SHALL use translated strings for each of the following 17 labels: "Bold", "Italic", "Underline", "Strikethrough", "Paragraph", "Heading 1", "Heading 2", "Bullets", "Numbers", "Quote", "Code", "Left", "Center", "Right", "Link", "Image", "Video", and "Clean".
5. THE CashierSessionReportComponent hardcoded Indonesian text SHALL be replaced with Translation_System keys present in both Locale_Files, covering at minimum: section headers (e.g., "Flow Kasir", "Ringkasan Shift dan Performa"), filter labels (e.g., "Range", "Dari", "Sampai"), button labels (e.g., "Terapkan", "Refresh", "Memuat...", "Detail", "Tutup"), metric labels (e.g., "Total Selisih", "Offline Pending"), table headers (e.g., "Tanggal", "Shift", "Kasir", "Status", "Selisih", "Aksi"), status labels (e.g., "Aktif", "Force Close"), empty-state messages (e.g., "Belum ada data shift", "Tidak ada pending offline"), range option labels (e.g., "Hari ini", "Kemarin", "7 hari terakhir", "30 hari terakhir", "Custom"), and note labels (e.g., "Catatan buka", "Alasan selisih", "Catatan tutup").
6. THE POS_Cart_Panel screen-reader-only labels "Decrease quantity" and "Increase quantity" SHALL use translated strings from the Translation_System.

### Requirement 7: Internationalize Screen-Reader-Only Text

**User Story:** As a screen reader user in either locale, I want sr-only text to be in my selected language, so that assistive technology announces content in the correct language.

#### Acceptance Criteria

1. WHEN the Backend_Navbar is rendered, THE Backend_Navbar sr-only text ("Fullscreen", "Search", "Toggle theme", "Settings") SHALL use translated strings from the Translation_System via the `t()` function instead of hardcoded English text.
2. WHEN the POS_Cart_Panel is rendered, THE POS_Cart_Panel sr-only text ("Decrease quantity", "Increase quantity") SHALL use translated strings from the Translation_System via the `$t()` function instead of hardcoded English text.
3. WHEN the Catalog_Panel is rendered, THE Catalog_Panel sr-only text ("Clear search", "Search") SHALL use translated strings from the Translation_System via the `$t()` function instead of hardcoded English text.
4. WHEN DialogContent, SheetContent, or LoadingOverlay UI primitive components are rendered, THE sr-only text ("Close", "Loading") SHALL use translated strings from the Translation_System via the `useI18n` composable instead of hardcoded English text.
5. FOR ALL sr-only text replacements, THE Translation_System SHALL have corresponding keys in both `en.json` and `id.json` Locale_Files, with English values matching the original hardcoded strings and Indonesian values providing equivalent translations.
6. IF the Translation_System fails to resolve a sr-only translation key, THEN THE component SHALL render the English fallback string so that screen reader functionality is not lost.
7. WHEN the user switches locale while a page containing sr-only text is displayed, THE sr-only text SHALL update reactively to the newly selected language without requiring a page reload.

### Requirement 8: Descriptive Alt Text on Product Images

**User Story:** As a screen reader user, I want product images to have descriptive alt text, so that I can understand what product is being shown.

#### Acceptance Criteria

1. WHEN a product or addon image is rendered alongside visible item name text, THE component SHALL set the `alt` attribute to the corresponding item name (e.g., the product name, addon name, or cart item name) instead of a generic string like "thumbnail".
2. WHEN a customer avatar image is rendered adjacent to the customer's name in a list or detail view, THE component SHALL set the `alt` attribute to the customer's name.
3. WHEN an image serves only as visual decoration and no unique information is lost if the image is hidden (i.e., the same content is conveyed by adjacent text or the image is a background/logo preview), THE component SHALL use `alt=""` to hide it from screen readers.
4. IF an item name value is empty or unavailable at render time, THEN THE component SHALL fall back to a generic descriptive label (e.g., "Product image") rather than an empty `alt` attribute or "thumbnail".

### Requirement 9: Form Input Label Association

**User Story:** As a screen reader user, I want form inputs to be properly labeled, so that I can understand what data each field expects.

#### Acceptance Criteria

1. THE ContactUsFormComponent `<label>` elements SHALL be linked to their corresponding inputs via matching `for` and `id` attributes, where each `id` value is unique within the page.
2. THE SignupRegisterComponent `<label>` elements SHALL be linked to their corresponding inputs via matching `for` and `id` attributes, where each `id` value is unique within the page.
3. THE CouponComponent coupon code input SHALL have an associated label element or an `aria-label` attribute with a vue-i18n translated string that describes the expected input (e.g., coupon code).
4. THE POS_Cart_Panel discount input SHALL have an associated label element or an `aria-label` attribute with a vue-i18n translated string that describes the expected input (e.g., discount amount).
5. WHEN a cart item is displayed in POS_Cart_Panel, THE cart item quantity `<input>` SHALL have an `aria-label` attribute with a vue-i18n translated string that identifies the item whose quantity is being edited.

### Requirement 10: Search Toggle Buttons Accessible Name

**User Story:** As a screen reader user, I want the list/grid view toggle buttons to announce their purpose, so that I can switch between views intentionally.

#### Acceptance Criteria

1. THE SearchItemComponentShadcn list-view toggle button SHALL have an `aria-label` attribute bound to the translation key `label.list_view`.
2. THE SearchItemComponentShadcn grid-view toggle button SHALL have an `aria-label` attribute bound to the translation key `label.grid_view`.
3. WHEN `itemProps.design` equals `itemDesignEnum.LIST`, THE list-view toggle button SHALL have `aria-pressed="true"` and THE grid-view toggle button SHALL have `aria-pressed="false"`.
4. WHEN `itemProps.design` equals `itemDesignEnum.GRID`, THE grid-view toggle button SHALL have `aria-pressed="true"` and THE list-view toggle button SHALL have `aria-pressed="false"`.
5. THE translation keys `label.list_view` and `label.grid_view` SHALL exist in both `resources/js/languages/en.json` and `resources/js/languages/id.json` with non-empty string values.

### Requirement 11: Address Component Icon Buttons Accessible Name

**User Story:** As a screen reader user, I want the edit and delete buttons on address cards to announce their purpose, so that I can manage my addresses without visual cues.

#### Acceptance Criteria

1. THE AddressComponentShadcn edit button SHALL have an `aria-label` attribute whose value is a translated string combining the edit action label and the address's `addr.label` value (e.g., "Edit Home"), so that each edit button is uniquely identifiable when multiple address cards are present.
2. THE AddressComponentShadcn delete button SHALL have an `aria-label` attribute whose value is a translated string combining the delete action label and the address's `addr.label` value (e.g., "Delete Work"), so that each delete button is uniquely identifiable when multiple address cards are present.
3. IF `addr.label` is empty or undefined, THEN THE AddressComponentShadcn edit and delete buttons SHALL fall back to using only the translated action label (edit or delete) as the `aria-label` value.

### Requirement 12: Translation Key Completeness

**User Story:** As a developer, I want all new i18n keys to exist in both locale files before deployment, so that no raw key strings are shown to users.

#### Acceptance Criteria

1. FOR ALL new translation keys introduced by this feature, THE Locale_Files SHALL contain the key in both `en.json` and `id.json` under the same nested path.
2. THE English Locale_File SHALL contain a non-empty string value of at least 1 visible character (not whitespace-only) for each new key, written in English.
3. THE Indonesian Locale_File SHALL contain a non-empty string value of at least 1 visible character (not whitespace-only) for each new key, written in Indonesian.
4. IF a translation key is used in a component via `$t()` or `t()`, THEN THE key SHALL resolve to a non-empty string in both Locale_Files.
5. IF a new translation key is added to one Locale_File but is missing from the other Locale_File, THEN THE build validation SHALL fail and indicate which key is missing and from which file.
