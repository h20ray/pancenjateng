# Attendance Module SWOT Fix — Bugfix Design

## Overview

The attendance module contains 15 defects identified through a SWOT analysis. These span runtime bugs (legacy Vuex reference, memory leaks, non-returning promise, timer accumulation), maintainability issues (DRY violations, legacy mixin), and UI inconsistencies (hardcoded colors, custom elements instead of shadcn-vue primitives, missing error boundary). The fix strategy is to address each defect with minimal, targeted changes while preserving all existing user-facing behavior.

## Glossary

- **Bug_Condition (C)**: Any of the 15 identified defect conditions — when the attendance module code executes a path that triggers incorrect behavior, memory leaks, DRY violations, or UI inconsistency
- **Property (P)**: The desired correct behavior after the fix — Pinia auth access, proper cleanup, returned promises, shared utilities, composables, shadcn primitives, CSS variables, error boundaries, and timer hygiene
- **Preservation**: All existing user-facing attendance workflows (clock-in, clock-out, history, admin list, report, settings, photo modal) must continue to function identically
- **`AttendanceSelfComponent`**: The employee self-service attendance view in `resources/js/components/admin/attendance/AttendanceSelfComponent.vue`
- **`AttendanceListComponent`**: The admin attendance monitoring view in `resources/js/components/admin/attendance/AttendanceListComponent.vue`
- **`AttendanceReportListComponent`**: The admin attendance report view in `resources/js/components/admin/attendance/AttendanceReportListComponent.vue`
- **`AttendanceSettingsComponent`**: The admin attendance settings view in `resources/js/components/admin/attendance/AttendanceSettingsComponent.vue`
- **`AttendancePhotoModalComponent`**: The photo proof modal in `resources/js/components/admin/attendance/AttendancePhotoModalComponent.vue`
- **`useAttendanceCapture`**: The camera/location capture hooks in `resources/js/components/admin/attendance/hooks/useAttendanceCapture.js`
- **`useAuthStore`**: The Pinia auth store at `resources/js/stores/useAuthStore.js`

## Bug Details

### Bug Condition

The bugs manifest across 15 distinct conditions in the attendance module. They fall into four categories: runtime errors (Vuex reference, memory leaks, non-returning promise, timer accumulation), code quality (DRY violations, legacy mixin), UI inconsistency (hardcoded colors, custom elements instead of shadcn), and missing error handling (attendance_unavailable status).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type AttendanceModuleExecution
  OUTPUT: boolean

  RETURN input.component == "AttendanceSelfComponent" AND input.accessesAuth via this.$store.getters
         OR input.component == "AttendanceSelfComponent" AND input.unmountsDuringCameraInit
         OR input.action == "retakePhoto" AND input.previousObjectURLExists AND NOT input.previousURLRevoked
         OR input.function == "captureAttendanceLocation" AND input.callerAwaitsResult
         OR input.function == "resolveDurationMinutes" AND input.isDuplicatedAcrossComponents
         OR input.function IN ["statusLabel", "statusClass"] AND input.isRedundantWrapper
         OR input.function IN ["formatCurrency", "money"] AND input.isDuplicatedAcrossComponents
         OR input.usesLegacyMixin("attendancePhotoModal")
         OR input.component == "AttendanceSelfComponent" AND input.usesHardcodedColors
         OR input.component == "AttendanceSettingsComponent" AND input.usesCustomFormElements
         OR input.component == "AttendanceSettingsComponent" AND input.usesCustomTabs
         OR input.component == "AttendancePhotoModalComponent" AND input.usesCustomModal
         OR input.component == "AttendanceSelfComponent" AND input.usesCustomHistorySheet
         OR input.receivesStatus("attendance_unavailable") AND NOT input.handlesGracefully
         OR input.component == "AttendanceSelfComponent" AND input.reactivatesWithKeepAlive AND input.timerExists
END FUNCTION
```

### Examples

- **Vuex crash**: `AttendanceSelfComponent` calls `this.$store.getters.authInfo` → returns `undefined` or throws because Vuex is removed; the greeting shows "undefined" or the component errors out
- **Memory leak (camera)**: User navigates away while `getUserMedia` is pending → stream resolves after unmount → tracks never stopped → camera LED stays on
- **Memory leak (Object URL)**: User calls retake 5 times → 4 intermediate Object URLs never revoked → browser memory grows
- **Non-returning promise**: `captureAttendanceLocation(vm)` does not return the `.then()/.catch()` chain → caller in `AttendanceSelfComponent.captureLocation()` cannot await or chain errors
- **Timer accumulation**: Component kept alive, deactivated, reactivated → `mounted()` creates a new 30s interval without clearing the old one → multiple intervals tick simultaneously

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Clock-in flow: photo capture → location capture → submit → success message → state refresh
- Clock-out flow: photo capture → location capture → submit → success message → state refresh
- Camera lifecycle: open → preview → capture → blob → File object → preview image
- Location capture: geolocation API → coordinates → backend validation → ready state
- History modal: open → calendar view → month navigation → day selection → record detail
- Admin attendance list: today's records table, KPI cards, review panel, manual clock-in form
- Admin report: monthly filter, employee filter, KPI summary, daily/employee view toggle, export (XLSX/CSV/PDF)
- Admin settings: role rules grid, penalty form, geofence form, overtime form, role edit modal
- Photo modal: check-in/check-out photo cards with timestamps and open-in-new-tab links
- Status rendering: correct localized labels and CSS classes for pending/clocked_in/completed/missed_check_out
- Duration formatting: "Xj Ym" format (e.g., "2j 30m")
- Currency formatting: Indonesian Rupiah "Rp X.XXX" with no decimals

**Scope:**
All inputs that do NOT involve the 15 identified defect conditions should be completely unaffected by this fix. This includes:
- All API request/response payloads (no backend changes)
- All route definitions and navigation logic
- All service layer functions (attendanceService, attendanceReportService, attendanceSettingsService)
- All existing component props interfaces
- All i18n translation keys and values

## Hypothesized Root Cause

Based on the SWOT analysis and code inspection, the root causes are:

1. **Legacy Vuex Reference (1.1)**: `AttendanceSelfComponent` was written before the Vuex→Pinia migration and still uses `this.$store.getters.authInfo` and `this.$store.getters.authPermission`. Since Vuex is removed, these return undefined or throw.

2. **Missing Mounted Guard (1.2)**: `startAttendanceCamera` in `useAttendanceCapture.js` awaits `getUserMedia` without checking if the component is still mounted before assigning `vm.cameraStream` and calling `vm.$nextTick`.

3. **Missing URL Revocation (1.3)**: `retakeAttendancePhoto` correctly revokes `vm.imagePreview`, but if `captureAttendancePhoto` is called multiple times without retake (edge case with rapid capture), intermediate URLs could leak. The primary issue is that the pattern relies on sequential calls.

4. **Non-Returning Promise (1.4)**: `captureAttendanceLocation` in `useAttendanceCapture.js` calls `captureCoordinates().then(...).catch(...)` but does not `return` the chain, making the function return `undefined` instead of a Promise.

5. **DRY Violations (1.5, 1.6, 1.7)**: `resolveDurationMinutes`, `statusLabel`/`statusClass` wrappers, and `formatCurrency`/`money` are copy-pasted across components instead of being extracted to shared utilities.

6. **Legacy Mixin (1.8)**: `attendancePhotoModal` mixin provides `photoModal` data, `hasAnyPhoto`, `openPhotoModal`, `closePhotoModal` — a pattern that should be a composable for better tree-shaking and type inference.

7. **Hardcoded Colors (1.9)**: `AttendanceSelfComponent` uses Material Design 3 hex values (#386a20, #1d1b20, #625b71, #f7f2fa, etc.) instead of the project's CSS variable system.

8. **Custom Form Elements (1.10)**: `AttendanceSettingsComponent` uses `.simple-field` inputs and custom CSS toggle switches instead of shadcn `Input`, `Label`, `Switch`.

9. **Custom Tabs (1.11)**: `AttendanceSettingsComponent` uses custom `.attendance-tab` buttons instead of shadcn `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`.

10. **Custom Modal (1.12)**: `AttendancePhotoModalComponent` uses a custom `.attendance-photo-backdrop`/`.attendance-photo-dialog` implementation instead of shadcn `Dialog`.

11. **Custom History Sheet (1.13)**: `AttendanceSelfComponent` uses a custom `.history-modal`/`.history-sheet` implementation instead of shadcn `Sheet`.

12. **Missing Error Boundary (1.14)**: No frontend handling for `attendance_unavailable` status — the UI may show raw status strings or break.

13. **Timer Accumulation (1.15)**: `mounted()` creates a 30s interval but `<keep-alive>` reactivation calls `mounted()` again without clearing the previous interval.

## Correctness Properties

Property 1: Bug Condition - Runtime Defects Fixed

_For any_ execution where the bug condition holds (legacy Vuex access, unmount during camera init, unreleased Object URLs, non-returning promise, or timer accumulation), the fixed code SHALL produce correct behavior: Pinia store access returns valid auth data, camera streams are discarded on unmount, Object URLs are revoked before replacement, `captureAttendanceLocation` returns a Promise, and intervals are cleared before re-creation.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.15**

Property 2: Bug Condition - Code Quality Defects Fixed

_For any_ execution where DRY violations or legacy patterns are present (duplicated `resolveDurationMinutes`, redundant status wrappers, duplicated currency formatting, legacy mixin usage), the fixed code SHALL use shared utility functions from `attendanceFormat.js`, `currencyFormat.js`, and a `useAttendancePhotoModal` composable, eliminating all duplication.

**Validates: Requirements 2.5, 2.6, 2.7, 2.8**

Property 3: Bug Condition - UI Consistency Defects Fixed

_For any_ rendering where UI inconsistencies exist (hardcoded colors, custom form elements, custom tabs, custom modal, custom sheet), the fixed code SHALL use CSS variables/design tokens and shadcn-vue primitives (Switch, Input, Label, Tabs, Dialog, Sheet), producing visually consistent output aligned with the design system.

**Validates: Requirements 2.9, 2.10, 2.11, 2.12, 2.13**

Property 4: Bug Condition - Error Boundary Added

_For any_ response where the backend returns `attendance_unavailable` status, the fixed code SHALL display a user-friendly message in all frontend views that consume attendance state, preventing raw status strings or broken UI.

**Validates: Requirements 2.14**

Property 5: Preservation - Existing Behavior Unchanged

_For any_ input where none of the 15 bug conditions apply (normal clock-in, clock-out, history viewing, admin list, report, settings, photo modal), the fixed code SHALL produce exactly the same user-facing behavior as the original code, preserving all workflows, API interactions, and visual output.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `resources/js/components/admin/attendance/AttendanceSelfComponent.vue`

**Specific Changes**:
1. **Vuex → Pinia (1.1)**: Replace `this.$store.getters.authInfo` with `useAuthStore().authInfo` and `this.$store.getters.authPermission` with `useAuthStore().authPermission`. Import `useAuthStore` from `../../stores/useAuthStore`. Store the instance in a computed or access directly.
2. **Mounted guard (1.2)**: Add a `_isMounted` flag set to `true` in `mounted()` and `false` in `beforeUnmount()`. Pass this flag to `startAttendanceCamera` or check it after the await.
3. **Hardcoded colors (1.9)**: Replace all hex color values in `<style scoped>` with CSS variable equivalents (e.g., `#386a20` → `hsl(var(--primary))`, `#1d1b20` → `hsl(var(--foreground))`, `#625b71` → `hsl(var(--muted-foreground))`, `#f7f2fa` → `hsl(var(--muted))`).
4. **Custom history sheet (1.13)**: Replace `.history-modal`/`.history-sheet` markup with shadcn `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`. Register components in `components:`.
5. **Timer accumulation (1.15)**: In `mounted()` (or `activated()` if using keep-alive), clear any existing `this.timer` before creating a new interval.
6. **DRY: statusLabel/statusClass wrappers (1.6)**: Remove wrapper methods; import utilities directly and use in template or keep minimal wrappers that delegate.
7. **Error boundary (1.14)**: Add handling for `attendance_unavailable` status in the `current` computed and render a user-friendly message.

---

**File**: `resources/js/components/admin/attendance/hooks/useAttendanceCapture.js`

**Specific Changes**:
1. **Mounted guard (1.2)**: Accept a mounted-check callback or ref; after `await getUserMedia`, check if still mounted before assigning stream.
2. **Object URL leak (1.3)**: In `captureAttendancePhoto`, ensure `vm.imagePreview` is revoked before creating a new one (already done — verify no edge case).
3. **Non-returning promise (1.4)**: Add `return` before the `captureCoordinates().then(...).catch(...)` chain in `captureAttendanceLocation`.

---

**File**: `resources/js/utils/attendanceFormat.js`

**Specific Changes**:
1. **DRY: resolveDurationMinutes (1.5)**: Export a new `resolveDurationMinutes(item)` function: `return Number(item?.live_duration_minutes ?? item?.duration_minutes ?? 0)`.

---

**File**: `resources/js/utils/currencyFormat.js` (NEW)

**Specific Changes**:
1. **DRY: formatCurrency (1.7)**: Create a shared `formatCurrency(value)` function using `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })`.

---

**File**: `resources/js/composables/useAttendancePhotoModal.js` (NEW)

**Specific Changes**:
1. **Legacy mixin → composable (1.8)**: Create a composable that returns `{ photoModal, hasAnyPhoto, openPhotoModal, closePhotoModal }` using Vue `reactive`/`ref`. Replace mixin usage in `AttendanceListComponent` and `AttendanceReportListComponent`.

---

**File**: `resources/js/components/admin/attendance/AttendanceListComponent.vue`

**Specific Changes**:
1. **Replace mixin (1.8)**: Remove `mixins: [attendancePhotoModal]`, import and use `useAttendancePhotoModal` composable (expose via `setup()` or inline in data/methods).
2. **DRY: resolveDurationMinutes (1.5)**: Import from `attendanceFormat.js` instead of local method.
3. **DRY: statusLabel/statusClass (1.6)**: Import directly from `attendanceStatus.js`.

---

**File**: `resources/js/components/admin/attendance/AttendanceReportListComponent.vue`

**Specific Changes**:
1. **Replace mixin (1.8)**: Remove `mixins: [attendancePhotoModal]`, use composable.
2. **DRY: resolveDurationMinutes (1.5)**: Import from `attendanceFormat.js`.
3. **DRY: formatCurrency (1.7)**: Import from `currencyFormat.js` instead of local method.
4. **DRY: statusLabel/statusClass (1.6)**: Import directly.

---

**File**: `resources/js/components/admin/attendance/AttendanceSettingsComponent.vue`

**Specific Changes**:
1. **shadcn forms (1.10)**: Replace `.simple-field` inputs with shadcn `Input`, custom toggle switches with shadcn `Switch`, and field labels with shadcn `Label`. Register in `components:`.
2. **shadcn tabs (1.11)**: Replace custom `.attendance-tabs`/`.attendance-tab` with shadcn `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Register in `components:`.
3. **DRY: formatCurrency (1.7)**: Replace local `money()` method with imported `formatCurrency` from `currencyFormat.js`.
4. **Custom modal (role edit)**: Replace `.role-modal`/`.role-sheet` with shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`.

---

**File**: `resources/js/components/admin/attendance/AttendancePhotoModalComponent.vue`

**Specific Changes**:
1. **shadcn Dialog (1.12)**: Replace `.attendance-photo-backdrop`/`.attendance-photo-dialog` with shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`. The `visible` prop maps to Dialog's `open` prop; `@close` maps to `@update:open`.

---

**File**: `resources/js/utils/attendanceStatus.js`

**Specific Changes**:
1. **Error boundary (1.14)**: Add `attendance_unavailable` to the labels map with a user-friendly translation key, and add a corresponding class.

---

**File**: `resources/js/mixins/attendancePhotoModal.js`

**Specific Changes**:
1. **Remove (1.8)**: Delete this file after all consumers are migrated to the composable.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write unit tests that exercise each defect condition on the unfixed code to observe failures and confirm root causes.

**Test Cases**:
1. **Vuex Access Test**: Mount `AttendanceSelfComponent` without Vuex store → observe `this.$store.getters.authInfo` throws or returns undefined (will fail on unfixed code)
2. **Camera Unmount Test**: Start camera init, immediately destroy component → observe stream is not stopped (will fail on unfixed code)
3. **Promise Return Test**: Call `captureAttendanceLocation(vm)` and check return value is a Promise → observe it returns undefined (will fail on unfixed code)
4. **Timer Accumulation Test**: Mount component, simulate keep-alive reactivation → observe multiple intervals exist (will fail on unfixed code)
5. **Object URL Leak Test**: Call retakePhoto multiple times, track URL.revokeObjectURL calls → observe missed revocations (may fail on unfixed code)

**Expected Counterexamples**:
- `this.$store` is undefined or `this.$store.getters` throws TypeError
- Camera stream tracks remain active after component unmount
- `captureAttendanceLocation` returns `undefined` instead of `Promise`
- Multiple `setInterval` IDs accumulate without clearance

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := executeFixedCode(input)
  ASSERT expectedBehavior(result)
END FOR
```

Specifically:
- Auth access returns valid `authInfo` object from Pinia store
- Camera stream is discarded when component unmounts during init
- All Object URLs are revoked before replacement
- `captureAttendanceLocation` returns a thenable Promise
- `resolveDurationMinutes` is called from shared utility (no local duplicates)
- `formatCurrency` is called from shared utility (no local duplicates)
- Photo modal logic comes from composable (no mixin)
- All colors use CSS variables (no hex literals in scoped styles)
- Settings forms use shadcn Input/Switch/Label/Tabs
- Photo modal uses shadcn Dialog
- History panel uses shadcn Sheet
- `attendance_unavailable` renders user-friendly message
- Timer is cleared before re-creation on reactivation

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) == fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for normal attendance operations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Clock-In Preservation**: Verify clock-in with valid photo + location continues to submit and show success
2. **Clock-Out Preservation**: Verify clock-out flow continues to work identically
3. **History Preservation**: Verify history modal displays calendar, summary, and records correctly
4. **Report Preservation**: Verify report filtering, KPI display, and export continue to work
5. **Settings Preservation**: Verify role rules, penalty, geofence, overtime save correctly
6. **Format Preservation**: Verify `formatMinutesToHours` and `formatCurrency` produce identical output for all valid inputs
7. **Status Label Preservation**: Verify all status values produce correct labels and classes

### Unit Tests

- Test `useAuthStore` integration: mount component, verify `authInfo` and `authPermission` are accessible
- Test mounted guard: mock `getUserMedia` with delay, unmount component, verify stream is stopped
- Test `captureAttendanceLocation` returns a Promise
- Test `resolveDurationMinutes` shared utility with various item shapes
- Test `formatCurrency` shared utility with edge cases (0, null, negative, large numbers)
- Test `useAttendancePhotoModal` composable: open, close, hasAnyPhoto logic
- Test timer cleanup: mount, unmount, verify `clearInterval` called
- Test `attendance_unavailable` status renders graceful message

### Property-Based Tests

- Generate random `item` objects with varying `live_duration_minutes` and `duration_minutes` → verify `resolveDurationMinutes` always returns a non-negative number matching the priority logic
- Generate random numeric values → verify `formatCurrency` always produces valid "Rp X.XXX" format
- Generate random attendance status strings → verify `attendanceStatusLabel` returns a string (never throws) and `attendanceStatusClass` returns an object
- Generate random attendance items → verify `hasAnyPhoto` correctly identifies items with photos

### Integration Tests

- Full clock-in flow with shadcn Sheet history panel: open history, navigate months, select day, close
- Full settings flow with shadcn Tabs: switch between roles/penalty/location/advanced tabs, edit and save
- Photo modal flow with shadcn Dialog: open modal from attendance list, view photos, close
- Admin list flow: view KPIs, review items, complete review, manual clock-in
- Report flow: filter by month/employee, switch daily/employee view, export
