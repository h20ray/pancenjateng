# Bugfix Requirements Document

## Introduction

The attendance module contains multiple weaknesses identified through a SWOT analysis: a legacy Vuex reference that violates the project's Pinia-only rule, memory leak risks from unguarded async operations and unreleased Object URLs, DRY violations across components, a legacy mixin pattern, UI inconsistencies with hardcoded colors and custom elements instead of shadcn-vue primitives, a race condition in the clock-out flow, missing error boundary handling for `attendance_unavailable` status, and a non-returning promise in `captureAttendanceLocation`. These issues collectively degrade maintainability, introduce potential runtime bugs, and create visual inconsistency with the rest of the admin surface.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN `AttendanceSelfComponent` accesses auth info THEN the system uses `this.$store.getters.authInfo` and `this.$store.getters.authPermission` which reference the removed Vuex store, causing runtime errors or undefined values

1.2 WHEN `AttendanceSelfComponent` is destroyed during camera initialization (e.g., route change while `getUserMedia` promise is pending) THEN the system resolves the promise after unmount and attaches a stream to a destroyed component, leaking the media stream

1.3 WHEN `retakePhoto` is called multiple times rapidly in `AttendanceSelfComponent` THEN the system creates new Object URLs without revoking intermediate ones, leaking browser memory

1.4 WHEN `captureAttendanceLocation` is called in `useAttendanceCapture.js` THEN the system does not return the promise chain, making it impossible for callers to await completion or handle errors

1.5 WHEN `resolveDurationMinutes()` is needed THEN the system duplicates the identical implementation in both `AttendanceListComponent` and `AttendanceReportListComponent` instead of using a shared utility

1.6 WHEN `statusLabel()`/`statusClass()` wrapper methods are needed THEN the system duplicates trivial pass-through wrappers in every attendance component instead of using the utility directly in templates

1.7 WHEN `formatCurrency()`/`money()` is needed THEN the system duplicates the identical `Intl.NumberFormat` implementation in both `AttendanceSettingsComponent` and `AttendanceReportListComponent`

1.8 WHEN photo modal logic is needed in `AttendanceListComponent` or `AttendanceReportListComponent` THEN the system uses the legacy Vue 2 mixin pattern (`attendancePhotoModal`) instead of a composable

1.9 WHEN `AttendanceSelfComponent` renders THEN the system uses hardcoded Material Design 3 colors (#386a20, #1d1b20, #625b71, #f7f2fa, etc.) instead of CSS variables/design tokens

1.10 WHEN `AttendanceSettingsComponent` renders forms THEN the system uses custom CSS form elements (`.simple-field`, `.settings-switch`, custom toggle switches) instead of shadcn-vue primitives (Switch, Input, Label)

1.11 WHEN `AttendanceSettingsComponent` renders navigation THEN the system uses custom tab buttons (`.attendance-tab`) instead of shadcn Tabs component

1.12 WHEN `AttendancePhotoModalComponent` renders THEN the system uses a custom modal implementation (`.attendance-photo-backdrop`/`.attendance-photo-dialog`) instead of shadcn Dialog

1.13 WHEN `AttendanceSelfComponent` history panel renders THEN the system uses a custom modal/sheet implementation (`.history-modal`/`.history-sheet`) instead of shadcn Sheet or Dialog

1.14 WHEN the backend returns `attendance_unavailable` status from `AttendanceController` THEN the system does not handle this status gracefully in all frontend views, potentially showing raw status strings or broken UI

1.15 WHEN `AttendanceSelfComponent` is kept alive by `<keep-alive>` and re-mounts THEN the system may accumulate multiple 30-second intervals without clearing previous ones

### Expected Behavior (Correct)

2.1 WHEN `AttendanceSelfComponent` accesses auth info THEN the system SHALL use the Pinia auth store (e.g., `useAuthStore()`) to retrieve `authInfo` and `authPermission`

2.2 WHEN `AttendanceSelfComponent` is destroyed during camera initialization THEN the system SHALL track a mounted/unmounted flag and discard the `getUserMedia` result if the component has been unmounted, preventing stream attachment to destroyed components

2.3 WHEN `retakePhoto` is called THEN the system SHALL revoke the existing Object URL before creating a new one, ensuring no intermediate URLs leak

2.4 WHEN `captureAttendanceLocation` is called THEN the system SHALL return the promise chain so callers can await completion and handle errors

2.5 WHEN `resolveDurationMinutes()` is needed THEN the system SHALL use a single shared utility function from `resources/js/utils/attendanceFormat.js` (or equivalent shared location)

2.6 WHEN `statusLabel()`/`statusClass()` are needed in templates THEN the system SHALL import and use the utility functions directly without redundant wrapper methods, or use a single shared composable

2.7 WHEN currency formatting is needed THEN the system SHALL use a single shared `formatCurrency()` utility function from a common location (e.g., `resources/js/utils/currencyFormat.js`)

2.8 WHEN photo modal logic is needed THEN the system SHALL use a composable function (e.g., `useAttendancePhotoModal()`) instead of the legacy mixin, and the mixin file SHALL be removed

2.9 WHEN `AttendanceSelfComponent` renders THEN the system SHALL use CSS variables/design tokens (e.g., `hsl(var(--primary))`, `hsl(var(--foreground))`) instead of hardcoded hex colors

2.10 WHEN `AttendanceSettingsComponent` renders forms THEN the system SHALL use shadcn-vue primitives: `Switch` for toggles, `Input` for text/number fields, `Label` for field labels

2.11 WHEN `AttendanceSettingsComponent` renders navigation THEN the system SHALL use shadcn `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` components

2.12 WHEN `AttendancePhotoModalComponent` renders THEN the system SHALL use shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, and `DialogDescription` components

2.13 WHEN `AttendanceSelfComponent` history panel renders THEN the system SHALL use shadcn `Sheet`, `SheetContent`, `SheetHeader`, and `SheetTitle` components

2.14 WHEN the backend returns `attendance_unavailable` status THEN the system SHALL display a user-friendly message (e.g., "Attendance service is temporarily unavailable") in all frontend views that consume attendance state

2.15 WHEN `AttendanceSelfComponent` is kept alive and re-activated THEN the system SHALL clear any existing interval before creating a new one, preventing timer accumulation

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user performs clock-in with valid photo and location THEN the system SHALL CONTINUE TO submit the attendance record and display a success message

3.2 WHEN a user performs clock-out with valid photo and location THEN the system SHALL CONTINUE TO submit the clock-out and refresh the attendance state

3.3 WHEN the camera is opened and a photo is captured successfully THEN the system SHALL CONTINUE TO display the preview image and enable the submit button

3.4 WHEN location is captured and validated by the backend THEN the system SHALL CONTINUE TO show the location-ready state and enable submission

3.5 WHEN the attendance history modal is opened THEN the system SHALL CONTINUE TO display the calendar, summary statistics, and record list for the selected month

3.6 WHEN the admin views the attendance list THEN the system SHALL CONTINUE TO display today's records with employee name, shift, time, duration, status, and proof columns

3.7 WHEN the admin views the attendance report THEN the system SHALL CONTINUE TO display monthly records with filtering by employee and month, KPI summary, and export functionality (XLSX, CSV, PDF)

3.8 WHEN the admin edits attendance settings (role rules, penalty, geofence, overtime) THEN the system SHALL CONTINUE TO save settings via the API and display success/error feedback

3.9 WHEN the admin opens the photo modal for an attendance record THEN the system SHALL CONTINUE TO display check-in and check-out photos with timestamps and open-in-new-tab links

3.10 WHEN the admin completes a review for a missed-check-out record THEN the system SHALL CONTINUE TO update the status to completed and refresh the list

3.11 WHEN attendance status labels and classes are rendered THEN the system SHALL CONTINUE TO display the correct localized label and visual styling for each status (pending, clocked_in, completed, missed_check_out)

3.12 WHEN duration minutes are formatted THEN the system SHALL CONTINUE TO display the value in "Xj Ym" format (hours and minutes)

3.13 WHEN currency values are formatted THEN the system SHALL CONTINUE TO display in Indonesian Rupiah format (Rp X.XXX) with no decimal places
