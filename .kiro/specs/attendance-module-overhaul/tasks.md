# Implementation Plan: Attendance Module Overhaul

## Overview

Comprehensive overhaul of the attendance module covering: fixing the duration formatting bug, creating a shared status badge utility, migrating the photo modal to Composition API, decomposing the attendance list and report pages into focused sub-components using shadcn-vue primitives, eliminating the service facade layer, and updating routes. Each task builds incrementally on the previous, ending with integration wiring and verification.

## Tasks

- [x] 1. Fix `formatMinutesToHours` utility and create shared status badge
  - [x] 1.1 Fix `formatMinutesToHours` in `resources/js/utils/attendanceFormat.js`
    - Replace the abbreviated "0j"/"1j 30m" format with full Indonesian words "0 jam"/"1 jam 30 menit"
    - Handle edge cases: null, undefined, non-numeric, negative, NaN → return "0 jam"
    - Truncate positive floats via Math.floor before formatting
    - Accept non-negative integers in range 0–999,999
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.2 Write property test: Duration format round-trip (Property 1)
    - **Property 1: Duration format round-trip**
    - Generate random integers [0, 999999], format with `formatMinutesToHours`, parse back to minutes, verify equality
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5**

  - [x] 1.3 Write property test: Invalid input safety (Property 2)
    - **Property 2: Invalid input safety**
    - Generate random invalid values (null, undefined, strings, negatives, NaN), verify output is "0 jam"
    - **Validates: Requirements 1.1, 1.6**

  - [x] 1.4 Write property test: Floor truncation for positive floats (Property 3)
    - **Property 3: Floor truncation for positive floats**
    - Generate random positive floats, verify `f(x) === f(Math.floor(x))`
    - **Validates: Requirements 1.7**

  - [x] 1.5 Create shared `attendanceStatusBadge` utility in `resources/js/utils/attendanceStatus.js`
    - Replace the current `attendanceStatusClass` function that returns object-style classes
    - New function accepts a status string and returns a Badge variant name or Tailwind class string
    - Map: clocked_in → sky classes, completed → success/emerald, missed_check_out → warning/amber, pending → secondary, attendance_unavailable → outline
    - Return "default" for unknown status values
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 1.6 Write property test: Status badge completeness (Property 5)
    - **Property 5: Status badge completeness**
    - Generate random strings, verify non-empty return; verify valid statuses map to specific variants; verify invalid statuses return "default"
    - **Validates: Requirements 15.4, 15.5**

- [x] 2. Migrate `AttendancePhotoModal` to Composition API
  - [x] 2.1 Rewrite `AttendancePhotoModal.vue` using `<script setup>` with shadcn-vue Dialog
    - Use Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription from shadcn-vue
    - Remove all `<style>` blocks, use only Tailwind CSS utilities
    - Display clock-in and clock-out photos in Card containers with max-h-[420px] object-contain
    - Add "Open Image" Button (variant="outline") that opens full-size URL in new tab
    - Show placeholder (min-h-[160px]) when photo URL is not present
    - Constrain scrollable body to max-h-[calc(100vh-200px)]
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 2.2 Write component tests for AttendancePhotoModal
    - Test Dialog opens/closes via visible prop
    - Test photo renders with correct max-height styling
    - Test placeholder renders when no photo URL
    - Test "Open Image" button opens URL in new tab
    - _Requirements: 13.4, 13.5, 13.6_

- [x] 3. Create Attendance List sub-components
  - [x] 3.1 Create `resources/js/components/admin/attendance/list/AttendanceKpiPanel.vue`
    - Accept props: workingCount, completedCount, reviewCount, loading
    - Render 3 Card components in responsive grid (grid-cols-1 md:grid-cols-3)
    - Use distinct backgrounds: bg-sky-50, bg-emerald-50, bg-amber-50
    - Show Skeleton placeholders when loading
    - Display 0 counts when data is empty or fetch fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 3.2 Create `resources/js/components/admin/attendance/list/AttendanceReviewPanel.vue`
    - Accept props: items (AttendanceRecord[])
    - Emit: review-complete, view-proof
    - Render review items as sub-cards with employee name, date, clock-out time, view proof button, review complete button
    - Disable review button and show loading label while saving
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 3.3 Create `resources/js/components/admin/attendance/list/AttendanceActiveWorkers.vue`
    - Accept props: workers (AttendanceRecord[])
    - Responsive grid with auto-fit minmax(220px, 1fr)
    - Show name, shift, clock-in time, duration via formatMinutesToHours
    - _Requirements: 16.5_

  - [x] 3.4 Create `resources/js/components/admin/attendance/list/AttendanceManualForm.vue`
    - Accept props: employees, shifts, visible
    - Emit: submitted, close
    - Use Select for employee/shift dropdowns, file input for photo
    - Validate: require employee selection and photo before submit
    - Show error toast on validation failure, success toast on API success
    - Reset form and hide panel on success; preserve form on failure
    - Disable submit button and show loading while in progress
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 3.5 Create `resources/js/components/admin/attendance/list/AttendanceRecordsTable.vue`
    - Accept props: records (AttendanceRecord[])
    - Emit: view-proof, clock-out, review-complete
    - Use Table components from shadcn-vue with Tailwind styling
    - Use Badge with attendanceStatusBadge utility for status column
    - Disable "View Proof" button when record has no photos
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [x] 4. Checkpoint - Verify list sub-components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `AttendanceListPage.vue` page shell
  - [x] 5.1 Create `resources/js/components/admin/attendance/AttendanceListPage.vue`
    - Use `<script setup>` with no Options API block, no `<style>` block
    - Import and use useAttendanceStore, useEmployeeStore, useAttendanceSettingsStore directly (no service facades)
    - Orchestrate sub-components: KpiPanel, ReviewPanel, ActiveWorkers, ManualForm, RecordsTable, PhotoModal
    - Use LoadingOverlay bound to loading ref
    - Use createToast for all notifications (destructive for errors, default for success)
    - Fetch all data on mount via Promise.all
    - Mobile-first responsive layout: single-column base, multi-column at md/lg breakpoints
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 16.1, 16.3, 16.6, 17.1, 17.3, 17.4, 17.5, 17.6, 18.1, 18.3, 18.5_

  - [x] 5.2 Write component tests for AttendanceKpiPanel
    - Verify 3 cards render with correct counts
    - Verify Skeleton renders when loading
    - Verify 0 counts on empty data
    - _Requirements: 4.1, 4.4, 4.6_

  - [x] 5.3 Write component tests for AttendanceManualForm
    - Verify validation: no employee → error toast, no photo → error toast
    - Verify successful submission resets form
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 6. Create Report sub-components
  - [x] 6.1 Create `resources/js/components/admin/attendance/report/ReportFilterPanel.vue`
    - Accept props: modelValue (filters), employees
    - Emit: update:modelValue, apply, reset
    - Month Select with 12 Indonesian labels (Januari–Desember), default current month
    - Year Input (type number, min 2020, max current year)
    - Employee Select with "All Employees" default option, sorted alphabetically
    - Responsive grid: 1 col base, 2 cols sm, 4 cols lg
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

  - [x] 6.2 Create `resources/js/components/admin/attendance/report/ReportKpiSummary.vue`
    - Accept props: overview (ReportOverview), loading
    - Render 5 Card components in responsive grid (1 col → 2 cols sm → 5 cols xl)
    - Use formatMinutesToHours for duration values, formatCurrency for monetary values
    - Show Skeleton placeholders when loading
    - Display "0 jam" for zero durations, "Rp 0" for zero amounts
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 6.3 Create `resources/js/components/admin/attendance/report/ReportDataTable.vue`
    - Accept props: records, mode ('daily'|'employee'), page (pagination meta)
    - Emit: page-change, view-proof
    - Toggle between "By Date" and "By Employee" views using Button group
    - "By Date": flat Table with consolidated earnings column + Tooltip breakdown
    - "By Employee": grouped Cards with nested Tables
    - Badge for status column with attendanceStatusBadge utility
    - Duration column uses formatMinutesToHours
    - Pagination controls (prev/next + range indicator, 10 per page)
    - Empty state message when no records
    - Penalty cell shows "-" when zero/null/undefined
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 6.4 Create `resources/js/components/admin/attendance/report/ReportExportPanel.vue`
    - Accept props: hasSelectedEmployee
    - Emit: export ({ type, selectedOnly })
    - Two button groups: "All Employees" and "Selected Employee" exports (XLSX, CSV, PDF)
    - Disable "Selected Employee" buttons when no employee selected
    - Use Button variant="outline" for all export actions
    - _Requirements: 9.1, 9.2, 9.6_

  - [x] 6.5 Write property test: Export filename pattern (Property 4)
    - **Property 4: Export filename pattern**
    - Generate random month/year/name combinations, verify filename matches regex `attendance-report-{YYYY}-{MM}-{slug}.{ext}`
    - **Validates: Requirements 9.4**

- [x] 7. Checkpoint - Verify report sub-components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create `AttendanceReportPage.vue` page shell
  - [x] 8.1 Create `resources/js/components/admin/attendance/AttendanceReportPage.vue`
    - Use `<script setup>` with no Options API block, no `<style>` block
    - Import and use useAttendanceReportStore, useEmployeeStore directly (no service facades)
    - Orchestrate sub-components: FilterPanel, KpiSummary, DataTable, ExportPanel, PhotoModal
    - Use LoadingOverlay bound to loading ref
    - Use createToast for all notifications
    - Implement export flow: call store export action, pipe blob to downloadService.downloadBlob with computed filename
    - Filename pattern: `attendance-report-{YYYY}-{MM}-{slug}.{ext}`
    - Mobile-first responsive layout with horizontal scroll for table below 768px (min-w-[600px])
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.4, 8.5, 9.3, 9.4, 9.5, 16.2, 16.4, 16.7, 17.2, 17.3, 17.4, 17.5, 17.6, 18.2, 18.4, 18.5_

  - [x] 8.2 Write component tests for ReportFilterPanel
    - Verify month Select has 12 Indonesian options
    - Verify reset restores defaults
    - _Requirements: 8.2, 8.6_

  - [x] 8.3 Write component tests for ReportDataTable
    - Verify mode toggle switches views
    - Verify "By Employee" groups records correctly
    - Verify pagination controls
    - Verify earnings column consolidation with Tooltip breakdown
    - _Requirements: 11.1, 11.3, 11.5, 12.1, 12.2_

- [x] 9. Update Self-Attendance for consistency
  - [x] 9.1 Update `AttendanceSelfComponent.vue` for module-wide consistency
    - Replace all `alertService.error()` calls with `createToast(message, { type: 'destructive' })`
    - Replace success alerts with `createToast(message, { type: 'default' })`
    - Remove `alertService` import once all calls are replaced
    - Use `formatMinutesToHours` from `utils/attendanceFormat.js` for all duration displays
    - Ensure live duration timer uses formatMinutesToHours output format at 30-second interval
    - Use `attendanceStatusBadge` from `utils/attendanceStatus.js` with Badge component for status indicators
    - Use consistent Badge variant mapping matching AttendanceHeroStatus.vue pattern
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 10. Update routes and wire pages together
  - [x] 10.1 Update route definitions to point to new page components
    - Update `/admin/attendance` route to use `AttendanceListPage.vue`
    - Update `/admin/attendance/report` route to use `AttendanceReportPage.vue`
    - Ensure lazy-loading (dynamic import) for both new page components
    - Remove old component imports once new pages are wired
    - _Requirements: 2.7, 7.1_

- [x] 11. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Write remaining component and integration tests
  - [x] 12.1 Write component tests for AttendanceRecordsTable
    - Verify table renders with correct columns
    - Verify status Badge variants via attendanceStatusBadge
    - Verify "View Proof" disabled when no photos
    - _Requirements: 3.5, 3.6, 3.7_

  - [x] 12.2 Write component tests for ReportExportPanel
    - Verify "Selected Employee" buttons disabled when no employee selected
    - Verify export emit payload structure
    - _Requirements: 9.1, 9.2_

  - [x] 12.3 Write integration test for full list page load
    - Mount AttendanceListPage, mock store responses
    - Verify loading overlay → data renders → KPI counts correct
    - _Requirements: 2.7, 4.1, 17.1_

  - [x] 12.4 Write integration test for manual clock-in flow
    - Fill form, submit, verify store action called
    - Verify form resets, verify success toast
    - _Requirements: 5.6, 17.5_

  - [x] 12.5 Write integration test for export download flow
    - Click export button, verify store action called with correct filters
    - Verify downloadService.downloadBlob called with correct filename
    - _Requirements: 9.3, 9.4_

- [x] 13. Final checkpoint - Build and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–5)
- Unit tests validate specific examples and edge cases
- All components use shadcn-vue primitives from `resources/js/components/ui/` — no Bootstrap, no custom CSS classes
- All state management uses Pinia stores directly — no Vuex, no service facade wrappers
- All new components use `<script setup>` Composition API with Tailwind CSS only

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.5"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.6", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "6.1", "6.2", "6.3", "6.4"] },
    { "id": 4, "tasks": ["6.5", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5"] }
  ]
}
```
