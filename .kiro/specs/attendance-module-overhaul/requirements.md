# Requirements Document

## Introduction

Comprehensive overhaul of the attendance module across four routes: attendance list (`/admin/attendance`), self-attendance (`/admin/attendance/my-day`), attendance report (`/admin/attendance/report`), and attendance settings (`/admin/attendance/settings`). The overhaul addresses a formatting bug ("0j"/"1j" display), migrates remaining non-shadcn components to shadcn-vue primitives, fixes broken interactive elements (employee dropdown, export), eliminates redundant information, and optimizes the overall UX for clarity and consistency.

The settings page was recently migrated to shadcn (see `attendance-settings-shadcn` spec) and only needs review for consistency. The list, self-attendance, and report pages require full migration from Options API with custom scoped CSS to Composition API (`<script setup>`) using shadcn-vue primitives and Tailwind CSS utilities.

## Glossary

- **Attendance_List**: The `AttendanceListComponent.vue` page displaying today's attendance records, active workers, review items, and manual clock-in form at `/admin/attendance`
- **Self_Attendance**: The `AttendanceSelfComponent.vue` page for employee self-service clock-in/clock-out at `/admin/attendance/my-day`
- **Attendance_Report**: The `AttendanceReportListComponent.vue` page displaying monthly attendance reports with filtering and export at `/admin/attendance/report`
- **Photo_Modal**: The `AttendancePhotoModalComponent.vue` dialog displaying clock-in/clock-out proof photos
- **Format_Utility**: The `attendanceFormat.js` module containing `formatMinutesToHours` and `resolveDurationMinutes` functions
- **Attendance_Store**: The Pinia store (`useAttendanceStore`) managing attendance state and API calls
- **Report_Store**: The Pinia store (`useAttendanceReportStore`) managing report data, pagination, and export actions
- **KPI_Panel**: A summary section displaying key metrics (active workers, completed records, review items, work hours, etc.)
- **Export_Panel**: The UI section in the report page providing XLSX, CSV, and PDF download actions
- **shadcn_Primitive**: A UI component from `resources/js/components/ui/` (Card, Button, Badge, Dialog, Sheet, Table, Select, etc.)

## Requirements

### Requirement 1: Duration Formatting Fix

**User Story:** As an admin, I want work duration displayed as full Indonesian words ("0 jam", "1 jam 30 menit"), so that the values are immediately readable without abbreviation confusion.

#### Acceptance Criteria

1. WHEN the duration input is zero, THE Format_Utility SHALL return "0 jam"
2. WHEN the duration is an exact number of hours with no remainder minutes, THE Format_Utility SHALL format the value as "{hours} jam" (e.g., "0 jam", "1 jam", "2 jam")
3. WHEN the duration has both hours and remainder minutes, THE Format_Utility SHALL format the value as "{hours} jam {minutes} menit" (e.g., "1 jam 30 menit")
4. WHEN the duration is less than 60 minutes and greater than zero, THE Format_Utility SHALL format the value as "0 jam {minutes} menit" (e.g., "0 jam 45 menit")
5. THE Format_Utility SHALL accept non-negative integer minute values in the range 0 to 999,999 and produce output such that parsing the formatted string recovers the original minute count (round-trip property)
6. IF the input is null, undefined, non-numeric, negative, or a non-integer float, THEN THE Format_Utility SHALL return "0 jam"
7. WHEN the duration input is a non-integer positive number, THE Format_Utility SHALL truncate to the integer part (floor) before formatting (e.g., 90.7 is treated as 90)

### Requirement 2: Attendance List Migration to Composition API

**User Story:** As a developer, I want the attendance list page rewritten using `<script setup>` Composition API with shadcn-vue primitives, so that it follows the project's modern conventions and is maintainable.

#### Acceptance Criteria

1. THE Attendance_List SHALL use `<script setup>` syntax with no Options API (`export default {}`) block
2. THE Attendance_List SHALL use `ref()`, `computed()`, and `onMounted()` from Vue for reactive state and lifecycle management
3. THE Attendance_List SHALL access the Attendance_Store directly via `useAttendanceStore()` composable pattern, removing the `attendanceService` wrapper functions for attendance data and actions
4. THE Attendance_List SHALL contain no `<style>` block (scoped or unscoped) and use only Tailwind CSS utility classes for all layout, spacing, color, and responsive behavior
5. THE Attendance_List SHALL replace `LoadingComponent` with `LoadingOverlay` from shadcn-vue primitives, binding the `:active` prop to a boolean ref instead of the previous `{ isActive }` object pattern
6. THE Attendance_List SHALL replace `alertService` calls with `createToast()` imported from the shadcn-vue toast system, using `{ type: 'destructive' }` for error notifications and `{ type: 'default' }` for success notifications
7. THE Attendance_List SHALL preserve all existing user-facing functionality including: manual clock-in form with employee/shift selection and photo upload, clock-out with photo upload, review completion, active worker display, KPI summary counts, attendance records table, and the photo modal via `useAttendancePhotoModal` composable
8. THE Attendance_List SHALL access employee data via `useEmployeeStore()` and shift data via `useAttendanceSettingsStore()` directly, replacing the `employeeService` and `attendanceSettingsService` wrapper functions

### Requirement 3: Attendance List UI Components

**User Story:** As an admin, I want the attendance list page to use consistent shadcn-vue components for all interactive elements, so that the UI is visually cohesive with the rest of the admin panel.

#### Acceptance Criteria

1. THE Attendance_List SHALL use Card, CardHeader, CardTitle, and CardContent components from shadcn-vue for the hero section, KPI panel, review panel, active workers panel, manual form panel, and records panel
2. THE Attendance_List SHALL use Button from shadcn-vue for all action buttons (manual attendance toggle, refresh, clock-in, clock-out, review complete)
3. THE Attendance_List SHALL use Badge from shadcn-vue for attendance status indicators, mapping "clocked_in" status to the default variant, "completed" status to the secondary variant, and "missed_check_out" status to the destructive variant
4. THE Attendance_List SHALL use Select, SelectTrigger, SelectContent, and SelectItem from shadcn-vue for the employee and shift dropdowns in the manual form
5. THE Attendance_List SHALL use Table, TableHeader, TableBody, TableRow, TableHead, and TableCell from shadcn-vue for the records table, styled exclusively with Tailwind CSS utility classes
6. WHEN the admin clicks "View Proof" on an attendance record that has at least one photo (clock-in or clock-out), THE Attendance_List SHALL open the AttendancePhotoModalComponent dialog displaying the record's photo evidence
7. IF an attendance record has no clock-in photo and no clock-out photo, THEN THE Attendance_List SHALL render the "View Proof" button in a disabled state
8. THE Attendance_List SHALL contain zero custom scoped CSS — all layout and visual styling SHALL use Tailwind CSS utility classes and shadcn-vue component props exclusively

### Requirement 4: Attendance List KPI Panel Consolidation

**User Story:** As an admin, I want the today's attendance summary to show clear, non-redundant metrics in a consistent card layout, so that I can assess the situation at a glance.

#### Acceptance Criteria

1. THE KPI_Panel SHALL display exactly three metric cards, each showing a text label and a numeric count: "currently working" (employees with status clocked_in), "completed today" (employees with status completed), and "needs review" (employees with status missed_check_out)
2. THE KPI_Panel SHALL use a responsive grid layout that renders 3 columns at viewport widths of 768px and above, and 1 column at viewport widths below 768px
3. THE KPI_Panel SHALL render each metric inside a Card component, where each card uses a different Tailwind background-color utility class to visually distinguish the three metric types
4. WHEN attendance data is loading, THE KPI_Panel SHALL display one Skeleton placeholder per metric card (3 total), matching the same grid layout as the loaded state
5. IF the attendance data fetch fails, THEN THE KPI_Panel SHALL display all three metric cards with a count of 0
6. WHEN attendance data returns zero for all metrics, THE KPI_Panel SHALL still render all three cards with a count of 0

### Requirement 5: Attendance List Manual Clock-In Form

**User Story:** As an admin, I want the manual clock-in form to work reliably with proper employee selection and photo upload, so that I can record attendance for employees who cannot self-clock.

#### Acceptance Criteria

1. WHEN the admin clicks the manual attendance toggle button, THE Attendance_List SHALL show the manual clock-in form panel containing an employee select dropdown, a shift select dropdown, a photo file input accepting image files only, and a submit button; WHEN the admin clicks the toggle button again, THE Attendance_List SHALL hide the form panel
2. THE employee Select dropdown SHALL populate with all active employees retrieved from the employee service, sorted alphabetically by name, and display a placeholder option "Select employee" when no employee is selected
3. THE shift Select dropdown SHALL populate with all configured shifts showing name and time range, default to "Auto (active shift)", and allow the admin to optionally select a specific shift
4. WHEN the admin submits the manual clock-in form without selecting an employee, THE Attendance_List SHALL display an error toast indicating that employee selection is required and SHALL NOT submit the form to the server
5. WHEN the admin submits the manual clock-in form without attaching a photo, THE Attendance_List SHALL display an error toast indicating that a clock-in photo is required and SHALL NOT submit the form to the server
6. WHEN the manual clock-in API call succeeds, THE Attendance_List SHALL reset all form fields to their default values, hide the manual clock-in panel, refresh both the attendance records list and the active workers list, and display a success toast
7. IF the manual clock-in API call fails, THEN THE Attendance_List SHALL display an error toast containing the server-provided error message, preserve the form field values, and keep the manual clock-in panel open
8. WHILE the manual clock-in form submission is in progress, THE Attendance_List SHALL display a loading indicator and prevent duplicate submissions until the API call completes or fails

### Requirement 6: Attendance List Review Panel

**User Story:** As an admin, I want to see and resolve missed-checkout attendance records in a dedicated review section, so that I can quickly complete administrative reviews.

#### Acceptance Criteria

1. WHEN there are attendance records with "missed_check_out" status, THE Attendance_List SHALL display a review panel Card above the active workers section
2. THE review panel SHALL display each review item as a sub-card showing employee name, work date, clock-out time, view proof button, and review complete button
3. WHEN the admin clicks "Review Done" on a review item, THE Attendance_List SHALL update the attendance status to "completed", refresh all lists, and display a success toast
4. WHILE a review action is saving, THE Attendance_List SHALL disable the review complete button and show a loading label

### Requirement 7: Attendance Report Migration to Composition API

**User Story:** As a developer, I want the attendance report page rewritten using `<script setup>` Composition API with shadcn-vue primitives, so that it follows the project's modern conventions.

#### Acceptance Criteria

1. THE Attendance_Report SHALL use `<script setup>` syntax with no Options API (`export default {}`) block
2. THE Attendance_Report SHALL use `ref()`, `computed()`, and `onMounted()` from Vue for reactive state and lifecycle management
3. THE Attendance_Report SHALL access the Report_Store directly via `useAttendanceReportStore()` composable pattern, with no imports from `attendanceReportService.js` or `employeeService.js` service wrappers
4. THE Attendance_Report SHALL contain no `<style>` block (scoped or unscoped) and use only Tailwind CSS utility classes for all layout, spacing, color, and responsive behavior
5. THE Attendance_Report SHALL replace `LoadingComponent` with `LoadingOverlay` imported from the shadcn-vue ui barrel, bound via an `:active` prop to a boolean `ref`
6. IF a store action (fetchLists, fetchOverview, or export) rejects, THEN THE Attendance_Report SHALL call `createToast()` with `{ type: 'destructive' }` and display the server-provided error message or a static fallback string
7. WHEN a store action (fetchLists, fetchOverview, or export) resolves successfully and user feedback is warranted, THE Attendance_Report SHALL call `createToast()` with `{ type: 'default' }`

### Requirement 8: Attendance Report Filter Panel

**User Story:** As an admin, I want the report filter controls to use shadcn-vue form components and work reliably, so that I can filter attendance data by month, year, and employee.

#### Acceptance Criteria

1. THE Attendance_Report SHALL display a filter panel containing a month Select, a year Input (type number, minimum 2020, maximum the current year), an employee Select, an "Apply" submit button, and a "Reset" button
2. THE month Select SHALL display all 12 months with Indonesian labels (Januari through Desember) and default to the current month
3. THE employee Select SHALL populate with all employees returned by the employee service sorted alphabetically by name, and include an "All Employees" option selected by default
4. WHEN the admin clicks "Apply", THE Attendance_Report SHALL display a loading indicator, fetch report data using the selected month, year, and employee filters, and update the data table and KPI panel with the response
5. IF the report data fetch fails, THEN THE Attendance_Report SHALL dismiss the loading indicator and display an error notification with the failure reason
6. WHEN the admin clicks "Reset", THE Attendance_Report SHALL restore filters to defaults (current month, current year, all employees) and refetch data
7. THE filter panel SHALL use a responsive CSS grid layout: 4 columns at viewports above 1080px, 2 columns between 681px and 1080px, and 1 column at 680px and below

### Requirement 9: Attendance Report Export Functionality

**User Story:** As an admin, I want the export buttons to reliably download attendance reports in XLSX, CSV, and PDF formats, so that I can share data with stakeholders.

#### Acceptance Criteria

1. THE Export_Panel SHALL display export buttons grouped by scope: "All Employees" exports (XLSX, CSV, PDF) and "Selected Employee" exports (XLSX, CSV, PDF)
2. IF no employee is selected in the filter, THEN THE Export_Panel SHALL disable the "Selected Employee" export buttons and prevent their click actions
3. WHEN an export button is clicked, THE Attendance_Report SHALL call the corresponding Attendance_Report_Store export action passing the current filter parameters: month, year, and user_id (null for "All Employees" scope)
4. WHEN the export API returns a blob response, THE Attendance_Report SHALL trigger a browser download with filename pattern: `attendance-report-{YYYY}-{MM}-{employee-slug}.{ext}` where employee-slug is the slugified employee name for single-employee exports or `semua-karyawan` for all-employees exports
5. IF an export action fails, THEN THE Attendance_Report SHALL display an error toast containing the API error message, or a generic fallback message indicating export failure when no API message is available
6. THE Export_Panel SHALL use Button components from shadcn-vue with variant="outline" for export actions

### Requirement 10: Attendance Report KPI Summary

**User Story:** As an admin, I want the report summary metrics displayed in a clean card layout, so that I can see totals for the selected period at a glance.

#### Acceptance Criteria

1. THE Attendance_Report SHALL display exactly five KPI cards in the following fixed order: total records, total work hours, total overtime hours, total penalty amount, and estimated net pay
2. THE KPI cards SHALL use a responsive CSS grid layout: 5 equal columns when viewport width exceeds 1080px, 2 columns when viewport width is between 681px and 1080px, and 1 column when viewport width is 680px or below
3. THE KPI cards SHALL use Card components (Card, CardHeader, CardContent) from shadcn-vue with consistent padding, border-radius, and background styling across all five cards
4. THE work hours and overtime hours KPI values SHALL use the corrected Format_Utility outputting full Indonesian words (e.g., "1 jam 30 menit", "0 jam") and SHALL display "0 jam" when the total is zero
5. THE penalty and net pay KPI values SHALL use the existing `formatCurrency` utility and SHALL display "Rp 0" when the total is zero
6. WHEN the report data is loading, THE KPI cards section SHALL display five Skeleton placeholder elements matching the card dimensions until data is available

### Requirement 11: Attendance Report Data Table

**User Story:** As an admin, I want the report data displayed in a clean table with two view modes (by date and by employee), so that I can analyze attendance from different perspectives.

#### Acceptance Criteria

1. THE Attendance_Report SHALL provide a toggle control (using Button group or Tabs) to switch between "By Date" and "By Employee" view modes, with "By Date" as the default active mode on initial load
2. WHILE "By Date" mode is active, THE Attendance_Report SHALL display a Table with columns: employee, date, status, duration, late, overtime, hourly rate, estimated work pay, penalty, overtime value, estimated net, and proof
3. WHILE "By Employee" mode is active, THE Attendance_Report SHALL group records by employee in Card containers, each showing employee name, record count, total hours, total net pay, and a nested Table with columns: date, status, duration, penalty, overtime value, estimated net, and proof
4. THE status column SHALL use Badge components with color variants for each attendance status: clocked_in=sky, completed=emerald, missed_check_out=amber, pending=neutral (muted background)
5. THE Attendance_Report SHALL display pagination controls using Button components for prev/next with a text indicator showing current range and total, paginating at 10 records per page
6. IF no attendance records exist for the selected filters, THEN THE Attendance_Report SHALL display an empty-state message within the Table area indicating no data is available for the period

### Requirement 12: Attendance Report Column Optimization

**User Story:** As an admin, I want the report table to show only essential information without redundancy, so that the data is easier to scan and understand.

#### Acceptance Criteria

1. THE "By Date" table SHALL consolidate the "estimated work pay" and "overtime value" columns into a single "earnings" column displaying the sum of both values, formatted using the existing `formatCurrency` utility
2. WHEN the admin hovers over or focuses an earnings cell, THE system SHALL display a Tooltip showing the breakdown as two labeled lines: the estimated work pay value and the overtime value, each formatted using `formatCurrency`
3. THE "By Employee" nested table SHALL omit the employee name column (already shown in the group header)
4. THE "By Employee" nested table SHALL consolidate its "penalty" and "overtime" currency columns into a single "earnings" column with the same Tooltip breakdown behavior as the "By Date" table
5. THE duration column in both "By Date" and "By Employee" views SHALL display values using the Format_Utility `formatMinutesToHours` function which outputs full "jam"/"menit" words (e.g., "1 jam 30 menit")
6. IF a record has a penalty amount that is zero, null, or undefined, THEN THE penalty cell SHALL display a dash character ("-") instead of a formatted currency value

### Requirement 13: Photo Modal Migration

**User Story:** As a developer, I want the photo modal component migrated to Composition API with Tailwind-only styling, so that it is consistent with the rest of the module.

#### Acceptance Criteria

1. THE Photo_Modal SHALL use `<script setup>` syntax with no Options API block
2. THE Photo_Modal SHALL contain no `<style>` block and use only Tailwind CSS utility classes for layout and styling
3. THE Photo_Modal SHALL use Dialog, DialogContent, DialogHeader, DialogTitle, and DialogDescription from shadcn-vue
4. THE Photo_Modal SHALL display clock-in and clock-out photos inside Card containers where each photo image has a maximum height of 420px, uses object-fit contain, and scales to 100% of the card width
5. WHEN a photo URL is present (non-null and non-empty string), THE Photo_Modal SHALL display a Button (variant="outline") that opens the full-size image URL in a new browser tab
6. IF a photo URL is not present, THEN THE Photo_Modal SHALL display a placeholder area with a minimum height of 160px containing a text message indicating the photo is unavailable
7. THE Photo_Modal SHALL constrain its scrollable body to a maximum height of the viewport minus 200px to prevent content from overflowing the screen

### Requirement 14: Self-Attendance Consistency Review

**User Story:** As a developer, I want the self-attendance page reviewed for consistency with the module-wide patterns, so that all attendance pages share the same conventions.

#### Acceptance Criteria

1. WHEN an error occurs during state loading, submission, or history fetching, THE Self_Attendance SHALL display a toast via `createToast(message, { type: "destructive" })` instead of calling `alertService.error()`, and the `alertService` import SHALL be removed once all calls are replaced
2. WHEN a clock-in or clock-out submission succeeds, THE Self_Attendance SHALL display a toast via `createToast(message, { type: "default" })` with the existing success message text before navigating away
3. THE Self_Attendance SHALL use `formatMinutesToHours` from `utils/attendanceFormat.js` for all duration displays including the history summary and selected day detail panels
4. THE Self_Attendance SHALL ensure the live duration timer in the quick-clock panel uses the same `formatMinutesToHours` output format and updates at a 30-second interval
5. THE Self_Attendance SHALL use `attendanceStatusClass` from `utils/attendanceStatus.js` combined with the shadcn-vue `Badge` component for status indicators in the history list and selected-day detail, replacing the inline `statusBadgeClass` function with the shared utility's class map applied to Badge's `:class` prop
6. THE Self_Attendance SHALL use consistent Badge variant mapping for the hero status indicator matching the pattern in `AttendanceHeroStatus.vue` (variant "secondary" for done, variant "destructive" for needs-action, custom emerald classes for working)

### Requirement 15: Shared Status Badge Pattern

**User Story:** As a developer, I want a single consistent pattern for attendance status badges across all pages, so that the visual language is uniform.

#### Acceptance Criteria

1. THE attendance module SHALL use Badge from shadcn-vue with consistent variant classes for each status: "clocked_in" uses sky colors (bg-sky-100 text-sky-700), "completed" uses the Badge "success" variant (emerald colors), "missed_check_out" uses the Badge "warning" variant (amber colors), "pending" uses the Badge "secondary" variant, and "attendance_unavailable" uses the Badge "outline" variant
2. THE attendance module SHALL define a shared utility function that accepts a status string and returns a Badge variant name or Tailwind class string compatible with the Badge component's `variant` or `class` prop
3. THE shared status utility SHALL replace the current `attendanceStatusClass` function in `resources/js/utils/attendanceStatus.js` that returns object-style classes (e.g., `{ "is-working": true }`) incompatible with the Badge component
4. FOR ALL valid attendance status values ("pending", "clocked_in", "completed", "missed_check_out", "attendance_unavailable"), THE shared utility SHALL return a non-empty string that resolves to a recognized Badge variant or valid Tailwind class string (property: no status produces an unstyled badge)
5. IF the shared utility receives a status value not in the set of valid attendance statuses, THEN THE shared utility SHALL return the "default" Badge variant so that the badge remains visually styled

### Requirement 16: Responsive Layout Standards

**User Story:** As an admin using a mobile device, I want all attendance pages to be fully usable on small screens, so that I can manage attendance from any device.

#### Acceptance Criteria

1. THE Attendance_List SHALL use a mobile-first approach where the base layout is single-column, expanding to multi-column at `md:` (768px) and `lg:` (1024px) breakpoints
2. THE Attendance_Report SHALL use a mobile-first approach where the filter panel stacks to single-column below 768px, KPI cards reflow from a 5-column grid to 2-column below 1080px and single-column below 680px, and the data table remains full-width with horizontal scroll when content overflows
3. WHILE the viewport is below 768px, THE Attendance_List manual form SHALL stack all fields vertically into a single-column grid with each field and the submit button occupying full width
4. WHILE the viewport is below 768px, THE Attendance_Report data table SHALL be horizontally scrollable within its Card container with a minimum content width of 600px to prevent column collapse
5. THE Attendance_List worker cards and review cards SHALL use a responsive grid with `auto-fit` and a minimum column width of 220px, ensuring cards reflow to fewer columns as viewport narrows without horizontal overflow
6. WHILE the viewport is below 768px, THE Attendance_List monitor-hero header, panel-head sections, and KPI grid SHALL stack vertically into a single column with action buttons expanding to full width
7. THE Attendance_Report export panel buttons SHALL wrap to a new line when viewport width is insufficient to display all buttons in a single row, with each button maintaining a minimum touch target of 44×44 CSS pixels

### Requirement 17: Loading and Error State Consistency

**User Story:** As an admin, I want consistent loading indicators and error messages across all attendance pages, so that I always understand the system state.

#### Acceptance Criteria

1. WHILE any data fetch is in progress (initial page load, filter change, or pagination), THE Attendance_List SHALL display a LoadingOverlay component that covers the page content area and prevents user interaction until the fetch completes or fails
2. WHILE any data fetch is in progress (initial page load, filter change, or pagination), THE Attendance_Report SHALL display a LoadingOverlay component that covers the page content area and prevents user interaction until the fetch completes or fails
3. IF an API call fails and the server response contains an error message (from `err.response.data.message`), THEN THE attendance module SHALL display an error toast with that server-provided message
4. IF an API call fails and no server error message is available (network error, timeout, or missing response body), THEN THE attendance module SHALL display an error toast with a generic fallback message indicating the operation failed
5. WHEN a mutation action succeeds (clock-in, clock-out, review complete, or export download), THE attendance module SHALL display a success toast that auto-dismisses after 2000 milliseconds
6. WHILE a mutation action is in progress, THE triggering Button SHALL be set to disabled and display a loading indicator (spinner or text change) until the action completes or fails

### Requirement 18: Elimination of Service Facade Layer

**User Story:** As a developer, I want the attendance list and report components to access Pinia stores directly instead of through the service facade functions, so that the code is simpler and follows the same pattern as the settings page.

#### Acceptance Criteria

1. THE Attendance_List SHALL import `useAttendanceStore` from the Pinia stores directory and call its actions and state directly (e.g., `store.fetchLists(filters)`, `store.lists`) instead of importing any function from `attendanceService.js`
2. THE Attendance_Report SHALL import `useAttendanceReportStore` from the Pinia stores directory and call its actions and state directly (e.g., `store.fetchLists(filters)`, `store.lists`, `store.exportXlsx(payload)`) instead of importing any function from `attendanceReportService.js`
3. THE Attendance_List SHALL import `useEmployeeStore` from the Pinia stores directory and access employee data via the store instance (e.g., `employeeStore.lists`, `employeeStore.fetchLists(filters)`) instead of importing `employeeLists` or `fetchEmployees` from `employeeService.js`
4. THE Attendance_Report SHALL import `useEmployeeStore` from the Pinia stores directory and access employee data via the store instance instead of importing `employeeLists` or `fetchEmployees` from `employeeService.js`
5. WHEN the migration is complete, THE Attendance_List and Attendance_Report SHALL contain zero import statements referencing `attendanceService.js`, `attendanceReportService.js`, or `employeeService.js`
