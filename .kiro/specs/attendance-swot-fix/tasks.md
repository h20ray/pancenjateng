# Implementation Plan

## Overview

Implementation tasks for fixing 15 defects in the attendance module identified through SWOT analysis. The fix covers runtime bugs (Vuex reference, memory leaks, non-returning promise, timer accumulation), code quality issues (DRY violations, legacy mixin), UI inconsistencies (hardcoded colors, custom elements → shadcn-vue), and a missing error boundary. Tasks follow the exploratory bugfix workflow: explore bugs with tests, preserve existing behavior, implement fixes, then validate.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Attendance Module Runtime Defects
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the runtime bugs exist
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for each runtime defect
  - Test 1a: Mount `AttendanceSelfComponent` — verify `this.$store.getters.authInfo` throws or returns undefined (Vuex removed, Pinia not wired)
  - Test 1b: Call `captureAttendanceLocation(vm)` — assert return value is a Promise (currently returns `undefined`)
  - Test 1c: Mount component, start timer via `mounted()`, simulate keep-alive reactivation by calling `mounted()` again — assert only one interval exists (currently accumulates)
  - Test 1d: Start camera init with delayed `getUserMedia`, unmount component before resolution — assert stream tracks are stopped (currently leaks)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found: `this.$store` is undefined, `captureAttendanceLocation` returns `undefined`, multiple `setInterval` IDs accumulate, camera stream tracks remain active after unmount
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.4, 1.15_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Attendance Utilities and Workflows Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: `formatMinutesToHours(150)` returns `"2j 30m"`, `formatMinutesToHours(0)` returns `"0j"`, `formatMinutesToHours(60)` returns `"1j"`
  - Observe on UNFIXED code: `attendanceStatusLabel("clocked_in")` returns localized label, `attendanceStatusClass("clocked_in")` returns `{ "is-working": true, ... }`
  - Observe on UNFIXED code: `resolveDurationMinutes({ live_duration_minutes: 45, duration_minutes: 30 })` returns `45` (live takes priority)
  - Observe on UNFIXED code: `resolveDurationMinutes({ duration_minutes: 30 })` returns `30` (fallback)
  - Observe on UNFIXED code: currency format `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(15000)` returns `"Rp 15.000"`
  - Observe on UNFIXED code: `hasAnyPhoto({ check_in_photo: "url" })` returns `true`, `hasAnyPhoto({})` returns `false`
  - Write property-based tests:
    - For all non-negative integer minutes, `formatMinutesToHours` returns a string matching pattern `/^\d+j(\s\d+m)?$/` or `"0j"`
    - For all valid status strings (pending, clocked_in, completed, missed_check_out), `attendanceStatusLabel` returns a non-empty string and `attendanceStatusClass` returns an object
    - For all item objects with numeric `live_duration_minutes` or `duration_minutes`, `resolveDurationMinutes` returns a non-negative number matching priority logic (live > duration > 0)
    - For all numeric values, `formatCurrency` produces a string containing "Rp"
    - For all attendance items, `hasAnyPhoto` returns true iff `check_in_photo` or `check_out_photo` is truthy
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.11, 3.12, 3.13_

- [x] 3. Shared utilities — create and extract

  - [x] 3.1 Create `resources/js/utils/currencyFormat.js` with shared `formatCurrency()`
    - Export `formatCurrency(value)` using `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0))`
    - _Bug_Condition: input.function IN ["formatCurrency", "money"] AND input.isDuplicatedAcrossComponents_
    - _Expected_Behavior: Single shared utility used by all consumers_
    - _Preservation: Currency output format "Rp X.XXX" with no decimals unchanged_
    - _Requirements: 2.7, 3.13_

  - [x] 3.2 Add `resolveDurationMinutes()` to `resources/js/utils/attendanceFormat.js`
    - Export `resolveDurationMinutes(item)` returning `Number(item?.live_duration_minutes ?? item?.duration_minutes ?? 0)`
    - _Bug_Condition: input.function == "resolveDurationMinutes" AND input.isDuplicatedAcrossComponents_
    - _Expected_Behavior: Single shared utility used by all consumers_
    - _Preservation: Duration resolution logic (live > duration > 0) unchanged_
    - _Requirements: 2.5, 3.12_

  - [x] 3.3 Add `attendance_unavailable` handling to `resources/js/utils/attendanceStatus.js`
    - Add `attendance_unavailable: "attendance.status.attendance_unavailable"` to the labels map
    - Add `"is-unavailable": status === "attendance_unavailable"` to the class map
    - _Bug_Condition: input.receivesStatus("attendance_unavailable") AND NOT input.handlesGracefully_
    - _Expected_Behavior: User-friendly label and CSS class for attendance_unavailable status_
    - _Preservation: Existing status labels/classes for pending, clocked_in, completed, missed_check_out unchanged_
    - _Requirements: 2.14, 3.11_

- [x] 4. Create composable `resources/js/composables/useAttendancePhotoModal.js`

  - [x] 4.1 Implement the composable
    - Export `useAttendancePhotoModal()` returning `{ photoModal, hasAnyPhoto, openPhotoModal, closePhotoModal }`
    - Use Vue `reactive` for `photoModal` state (`{ visible: false, attendance: null }`)
    - `hasAnyPhoto(item)` returns `Boolean(item?.check_in_photo || item?.check_out_photo)`
    - `openPhotoModal(item)` guards with `hasAnyPhoto` check, sets `photoModal.visible = true` and `photoModal.attendance = item`
    - `closePhotoModal()` resets to initial state
    - _Bug_Condition: input.usesLegacyMixin("attendancePhotoModal")_
    - _Expected_Behavior: Composable replaces mixin with identical API surface_
    - _Preservation: Photo modal open/close/hasAnyPhoto behavior unchanged_
    - _Requirements: 2.8, 3.9_

- [x] 5. Fix `useAttendanceCapture.js` — runtime bugs

  - [x] 5.1 Add mounted guard for camera stream in `startAttendanceCamera`
    - After `await getUserMedia`, check `vm._isMounted !== false` before assigning `vm.cameraStream`
    - If unmounted, stop all tracks on the resolved stream and return early
    - _Bug_Condition: input.component == "AttendanceSelfComponent" AND input.unmountsDuringCameraInit_
    - _Expected_Behavior: Stream discarded if component unmounted during init_
    - _Preservation: Camera lifecycle unchanged for normal mounted usage_
    - _Requirements: 2.2, 3.3_

  - [x] 5.2 Return promise from `captureAttendanceLocation`
    - Add `return` before `captureCoordinates().then(...).catch(...)` chain
    - _Bug_Condition: input.function == "captureAttendanceLocation" AND input.callerAwaitsResult_
    - _Expected_Behavior: Function returns a Promise that callers can await_
    - _Preservation: Location capture flow unchanged_
    - _Requirements: 2.4, 3.4_

  - [x] 5.3 Ensure Object URL revocation in `captureAttendancePhoto`
    - Before creating new Object URL, always revoke existing `vm.imagePreview` if truthy
    - Already partially implemented — verify edge case with rapid captures is covered
    - _Bug_Condition: input.action == "retakePhoto" AND input.previousObjectURLExists AND NOT input.previousURLRevoked_
    - _Expected_Behavior: All intermediate Object URLs revoked before replacement_
    - _Preservation: Photo capture and preview flow unchanged_
    - _Requirements: 2.3, 3.3_

- [x] 6. Fix `AttendanceSelfComponent.vue` — biggest file

  - [x] 6.1 Replace Vuex with Pinia auth store
    - Import `useAuthStore` from `../../../stores/useAuthStore`
    - Replace `this.$store.getters.authInfo` with Pinia store access (e.g., computed using `useAuthStore()`)
    - Replace `this.$store.getters.authPermission` in `nextRouteAfterAttendance()` with Pinia store access
    - Register or access via `setup()` return or `data()` initialization pattern for Options API
    - _Bug_Condition: input.component == "AttendanceSelfComponent" AND input.accessesAuth via this.$store.getters_
    - _Expected_Behavior: Pinia auth store returns valid authInfo and authPermission_
    - _Preservation: Greeting displays first name, route resolution logic unchanged_
    - _Requirements: 2.1, 3.1, 3.2_

  - [x] 6.2 Add mounted guard flag
    - Set `this._isMounted = true` in `mounted()`, set `this._isMounted = false` in `beforeUnmount()`
    - Used by `useAttendanceCapture.js` mounted guard (task 5.1)
    - _Requirements: 2.2_

  - [x] 6.3 Timer accumulation fix — clear before re-create
    - In `mounted()`, add `if (this.timer) { window.clearInterval(this.timer); }` before creating new interval
    - This prevents multiple intervals when component is reactivated via `<keep-alive>`
    - _Bug_Condition: input.component == "AttendanceSelfComponent" AND input.reactivatesWithKeepAlive AND input.timerExists_
    - _Expected_Behavior: Only one 30s interval active at any time_
    - _Preservation: Timer tick behavior (nowTick update every 30s) unchanged_
    - _Requirements: 2.15, 3.1_

  - [x] 6.4 Handle `attendance_unavailable` status
    - In the `current` computed or template, add a condition for `attendance_unavailable` status
    - Display user-friendly message panel (e.g., "Layanan absensi sedang tidak tersedia") when status is `attendance_unavailable`
    - _Bug_Condition: input.receivesStatus("attendance_unavailable") AND NOT input.handlesGracefully_
    - _Expected_Behavior: Graceful UI message instead of raw status or broken UI_
    - _Requirements: 2.14_

  - [x] 6.5 Replace hardcoded colors with CSS variables
    - Replace `#386a20` → `hsl(var(--primary))`, `#1d1b20` → `hsl(var(--foreground))`, `#625b71` / `#5f5b63` → `hsl(var(--muted-foreground))`, `#f7f2fa` / `#f1edf7` → `hsl(var(--muted))`, `#fffbff` → `hsl(var(--background))`, `#f0e9f4` / `#e7e0ec` → `hsl(var(--border))`, `#1b5e20` → `hsl(var(--primary))`, `#e6f4ea` / `#f1f8e9` → `hsl(var(--primary-light))`, `#c8e6c9` → `hsl(var(--primary) / 0.3)`
    - _Bug_Condition: input.component == "AttendanceSelfComponent" AND input.usesHardcodedColors_
    - _Expected_Behavior: All colors use CSS variables/design tokens_
    - _Preservation: Visual appearance consistent with design system_
    - _Requirements: 2.9_

  - [x] 6.7 Remove redundant wrapper methods
    - Remove `statusLabel()` and `statusClass()` wrapper methods — import utilities directly or keep minimal delegation
    - _Bug_Condition: input.function IN ["statusLabel", "statusClass"] AND input.isRedundantWrapper_
    - _Expected_Behavior: Direct utility usage without redundant wrappers_
    - _Preservation: Status rendering unchanged_
    - _Requirements: 2.6, 3.11_

- [x] 7. Fix `AttendanceListComponent.vue`

  - [x] 7.1 Replace mixin with composable
    - Remove `mixins: [attendancePhotoModal]` and import of `attendancePhotoModal`
    - Import `useAttendancePhotoModal` from `../../../composables/useAttendancePhotoModal`
    - Expose `{ photoModal, hasAnyPhoto, openPhotoModal, closePhotoModal }` via `setup()` return or integrate into data/methods
    - _Bug_Condition: input.usesLegacyMixin("attendancePhotoModal")_
    - _Expected_Behavior: Composable provides identical API_
    - _Preservation: Photo modal behavior unchanged_
    - _Requirements: 2.8, 3.9_

  - [x] 7.2 Use shared `resolveDurationMinutes`
    - Remove local `resolveDurationMinutes()` method
    - Import `resolveDurationMinutes` from `../../../utils/attendanceFormat`
    - _Bug_Condition: input.function == "resolveDurationMinutes" AND input.isDuplicatedAcrossComponents_
    - _Expected_Behavior: Shared utility used_
    - _Preservation: Duration display unchanged_
    - _Requirements: 2.5, 3.12_

  - [x] 7.3 Remove redundant status wrappers
    - Remove `statusLabel()` and `statusClass()` wrapper methods
    - Use imported `attendanceStatusLabel` and `attendanceStatusClass` directly in template or keep minimal delegation
    - _Bug_Condition: input.function IN ["statusLabel", "statusClass"] AND input.isRedundantWrapper_
    - _Expected_Behavior: Direct utility usage_
    - _Preservation: Status rendering unchanged_
    - _Requirements: 2.6, 3.11_

- [x] 8. Fix `AttendanceReportListComponent.vue`

  - [x] 8.2 Use shared `resolveDurationMinutes` and `formatCurrency`
    - Remove local `resolveDurationMinutes()` method
    - Remove local `formatCurrency()` method
    - Import `resolveDurationMinutes` from `../../../utils/attendanceFormat`
    - Import `formatCurrency` from `../../../utils/currencyFormat`
    - _Bug_Condition: input.function IN ["resolveDurationMinutes", "formatCurrency"] AND input.isDuplicatedAcrossComponents_
    - _Expected_Behavior: Shared utilities used_
    - _Preservation: Duration and currency display unchanged_
    - _Requirements: 2.5, 2.7, 3.12, 3.13_

  - [x] 8.3 Remove redundant status wrappers
    - Remove `statusLabel()` and `statusClass()` wrapper methods
    - Use imported utilities directly in template or keep minimal delegation
    - _Bug_Condition: input.function IN ["statusLabel", "statusClass"] AND input.isRedundantWrapper_
    - _Expected_Behavior: Direct utility usage_
    - _Preservation: Status rendering unchanged_
    - _Requirements: 2.6, 3.11_

- [x] 9. Fix `AttendanceSettingsComponent.vue` — UI overhaul

  - [x] 9.1 Replace custom tabs with shadcn Tabs
    - Replace `.attendance-tabs`/`.attendance-tab` buttons with `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
    - Import from `"../../ui"` and register in `components:`
    - Map `activeTab` to Tabs `v-model` / `default-value`
    - Wrap each section (`roles`, `penalty`, `location`, `advanced`) in `<TabsContent>`
    - _Bug_Condition: input.component == "AttendanceSettingsComponent" AND input.usesCustomTabs_
    - _Expected_Behavior: shadcn Tabs with proper accessibility (ARIA roles, keyboard nav)_
    - _Preservation: Tab switching and content display unchanged_
    - _Requirements: 2.11, 3.8_

  - [x] 9.2 Replace custom form inputs with shadcn Input/Label
    - Replace `.simple-field` inputs with shadcn `<Input>` component
    - Replace `<label>` / `<span>` field labels with shadcn `<Label>` component
    - Import from `"../../ui"` and register in `components:`
    - _Bug_Condition: input.component == "AttendanceSettingsComponent" AND input.usesCustomFormElements_
    - _Expected_Behavior: shadcn Input/Label with consistent styling_
    - _Preservation: Form data binding and submission unchanged_
    - _Requirements: 2.10, 3.8_

  - [x] 9.3 Replace custom toggles with shadcn Switch
    - Replace `.settings-switch` custom checkbox toggles with shadcn `<Switch>` component
    - Map `v-model` boolean bindings to Switch's `checked` / `@update:checked`
    - Import from `"../../ui"` and register in `components:`
    - _Bug_Condition: input.component == "AttendanceSettingsComponent" AND input.usesCustomFormElements_
    - _Expected_Behavior: shadcn Switch with proper accessibility_
    - _Preservation: Toggle state binding unchanged_
    - _Requirements: 2.10, 3.8_

  - [x] 9.4 Replace custom role modal with shadcn Dialog
    - Replace `.role-modal`/`.role-sheet` markup with `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`
    - Import from `"../../ui"` and register in `components:`
    - Map `roleModalOpen` to Dialog's `open` prop, `closeRoleModal` to `@update:open`
    - _Bug_Condition: input.component == "AttendanceSettingsComponent" AND input.usesCustomFormElements_
    - _Expected_Behavior: shadcn Dialog with proper accessibility and focus trap_
    - _Preservation: Role edit modal open/close/save behavior unchanged_
    - _Requirements: 2.10, 3.8_

  - [x] 9.5 Use shared `formatCurrency`
    - Remove local `money()` method
    - Import `formatCurrency` from `../../../utils/currencyFormat`
    - Replace `money(rule.rate_per_hour)` calls with `formatCurrency(rule.rate_per_hour)`
    - _Bug_Condition: input.function IN ["formatCurrency", "money"] AND input.isDuplicatedAcrossComponents_
    - _Expected_Behavior: Shared utility used_
    - _Preservation: Currency display unchanged_
    - _Requirements: 2.7, 3.13_

- [x] 10. Fix `AttendancePhotoModalComponent.vue`

  - [x] 10.1 Replace custom modal with shadcn Dialog
    - Replace `.attendance-photo-backdrop`/`.attendance-photo-dialog` with `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`
    - Import from `"../../ui"` and register in `components:`
    - Map `visible` prop to Dialog's `open` prop
    - Map `$emit('close')` to `@update:open` handler
    - Preserve photo cards layout inside `<DialogContent>`
    - _Bug_Condition: input.component == "AttendancePhotoModalComponent" AND input.usesCustomModal_
    - _Expected_Behavior: shadcn Dialog with proper accessibility, focus trap, and escape-to-close_
    - _Preservation: Photo display, timestamps, and open-in-new-tab links unchanged_
    - _Requirements: 2.12, 3.9_

- [x] 11. Cleanup — delete legacy mixin

  - [x] 11.1 Delete `resources/js/mixins/attendancePhotoModal.js`
    - Verify no remaining imports reference this file (tasks 7.1 and 8.1 must be complete)
    - _Bug_Condition: input.usesLegacyMixin("attendancePhotoModal")_
    - _Expected_Behavior: Mixin file removed, composable is sole provider_
    - _Requirements: 2.8_

- [x] 12. Verify bug condition exploration test now passes

  - [x] 12.1 Re-run bug condition exploration test
    - **Property 1: Expected Behavior** - Attendance Module Runtime Defects Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied:
      - Pinia store access returns valid `authInfo` object
      - `captureAttendanceLocation` returns a thenable Promise
      - Only one interval exists after reactivation
      - Camera stream is discarded when component unmounts during init
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.4, 2.15_

  - [x] 12.2 Verify preservation tests still pass
    - **Property 2: Preservation** - Attendance Utilities and Workflows Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all utility functions produce identical output after refactoring
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.11, 3.12, 3.13_

- [x] 13. Checkpoint - Ensure all tests pass
  - Run full test suite to confirm no regressions
  - Verify all property-based tests pass
  - Verify build compiles without errors (`npm run build` or equivalent)
  - Ensure no remaining references to deleted mixin file
  - Ensure no remaining `this.$store` references in attendance components
  - Ask the user if questions arise

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3", "5", "10"] },
    { "id": 2, "tasks": ["4", "9"] },
    { "id": 3, "tasks": ["6", "7", "8"] },
    { "id": 4, "tasks": ["11"] },
    { "id": 5, "tasks": ["12"] },
    { "id": 6, "tasks": ["13"] }
  ]
}
```

## Notes

- Tasks 1 and 2 (exploration and preservation tests) have no dependencies and can run in parallel before any implementation begins.
- Task 3 (shared utilities) is a prerequisite for tasks 4, 6, 7, 8, and 9 since they consume the shared functions.
- Task 4 (composable) depends on task 3 because it uses shared utilities, and is required by tasks 6, 7, and 8.
- Task 5 (runtime fixes in useAttendanceCapture) has no dependencies and feeds into task 6.
- Task 10 (AttendancePhotoModalComponent) has no dependencies on other implementation tasks — it only replaces its own custom modal with shadcn Dialog.
- Task 11 (mixin deletion) must wait until tasks 7 and 8 have migrated away from the mixin.
- Task 12 (verification) depends on all implementation tasks (5–11) being complete.
- Task 13 (checkpoint) is the final gate after verification passes.
