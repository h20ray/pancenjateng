# Implementation Plan: Attendance Quick Clock

## Overview

Rewrite `AttendanceSelfComponent.vue` from Options API to Composition API (`<script setup>`) with extracted composables, shadcn-vue primitives, and a state-machine-driven quick clock flow. The implementation proceeds bottom-up: composables first, then sub-components, then the root component rewrite, followed by property-based and unit tests.

## Tasks

- [x] 1. Create composables for geolocation, camera, submission, and timer
  - [x] 1.1 Create `useGeolocation` composable
    - Create `resources/js/components/admin/attendance/composables/useGeolocation.js`
    - Implement `validateLocation(action)` that calls `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000 }`
    - On success, POST coordinates to `admin/attendance/validate-location` with action type
    - Transition `locationState` to `'ready'` when `is_valid: true` OR `enforced: false`
    - Transition `locationState` to `'failed'` on geolocation errors or geofence violations
    - Map geolocation error codes (1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT) to user-friendly error messages
    - Implement `retry(action)` and `reset()` methods
    - Export reactive refs: `locationState`, `coordinates`, `locationError`, `locationValidation`
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 2.1, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.2 Create `useCamera` composable
    - Create `resources/js/components/admin/attendance/composables/useCamera.js`
    - Accept `videoRef` (template ref to `<video>` element) as parameter
    - Implement `startCamera()` requesting front-facing camera `{ video: { facingMode: 'user' }, audio: false }`
    - Add 10-second timeout for stream initialization; set `cameraState` to `'failed'` on timeout
    - Implement `capturePhoto()` drawing video frame to canvas, converting to JPEG blob at 0.88 quality
    - Implement `retakePhoto()` revoking previous object URL and restarting camera
    - Implement `stopCamera()` and `cleanup()` for stream lifecycle management
    - Guard against stream leak on unmount via `onScopeDispose`
    - Export reactive refs: `cameraState`, `cameraError`, `image`, `imagePreview`, `stream`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.3 Create `useAttendanceSubmit` composable
    - Create `resources/js/components/admin/attendance/composables/useAttendanceSubmit.js`
    - Implement `submitClockIn(payload)` calling `clockInAttendance` from `attendanceService`
    - Implement `submitClockOut(payload)` calling `clockOutAttendance` from `attendanceService`
    - Handle network errors and 422 server rejections, extracting error messages
    - Detect clock-out state-changed errors (specific 422 messages) and return `stateChanged: true`
    - Export reactive refs: `isSubmitting`, `submitError`
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

  - [x] 1.4 Create `useAttendanceTimer` composable
    - Create `resources/js/components/admin/attendance/composables/useAttendanceTimer.js`
    - Accept `clockInAtIso` (Ref<string|null>) as parameter
    - Tick every 30 seconds via `setInterval`, updating `nowTick`
    - Compute `liveDurationLabel` as elapsed time formatted in hours and minutes (e.g., "2j 15m")
    - Clean up interval on scope disposal via `onScopeDispose`
    - _Requirements: 7.2, 7.3_

  - [x] 1.5 Create `useQuickClock` orchestrator composable
    - Create `resources/js/components/admin/attendance/composables/useQuickClock.js`
    - Accept `{ isClockOutMode: Ref<boolean>, attendanceId: Ref<number|null> }` options
    - Compose `useGeolocation`, `useCamera`, and `useAttendanceSubmit` internally
    - Implement `startFlow()` that auto-triggers location validation, then auto-starts camera on success
    - Implement state machine transitions: location ready → camera start, photo captured → enable submit
    - Implement `submit()` that re-fetches attendance state for clock-out mode before submitting
    - Compute `canSubmit` (true iff `locationState === 'ready' && image !== null`)
    - Compute `flowStep` (1=location, 2=photo, 3=submit)
    - Implement `cleanup()` stopping streams and revoking URLs
    - Preserve `image`/`coordinates` on location or submit errors (error state preservation)
    - _Requirements: 1.1, 1.4, 2.2, 3.5, 3.6, 4.1, 5.1, 5.5, 7.4, 7.5_

- [x] 2. Checkpoint - Verify composables
  - Ensure all composables export correct interfaces and have no type errors, ask the user if questions arise.

- [x] 3. Create sub-components with shadcn-vue
  - [x] 3.1 Create `LocationStatusBadge` component
    - Create `resources/js/components/admin/attendance/components/LocationStatusBadge.vue` using `<script setup>`
    - Accept props: `locationState`, `locationError`, `locationDistance`
    - Emit: `retry` event
    - Render `<Skeleton>` when loading, `<Badge variant="success">` with distance when ready, `<Badge variant="destructive">` with error + retry button when failed
    - Format distance using Indonesian locale (`toLocaleString("id-ID")` + " m")
    - Use shadcn-vue `Badge`, `Button`, `Skeleton` from `../../ui`
    - Ensure minimum 44×44px touch targets on retry button
    - _Requirements: 1.3, 1.7, 2.1, 2.3, 6.1, 6.3, 6.5_

  - [x] 3.2 Create `CameraCapture` component
    - Create `resources/js/components/admin/attendance/components/CameraCapture.vue` using `<script setup>`
    - Accept props: `cameraState`, `imagePreview`, `cameraError`
    - Emit: `capture`, `retake`, `start-camera` events
    - Expose template ref for video element via `defineExpose`
    - Render video feed when `cameraState === 'ready'`, photo preview when captured, idle state with "Open Camera" button when failed
    - Use Tailwind utilities for responsive aspect-ratio container
    - Ensure minimum 44×44px touch targets on all buttons
    - _Requirements: 4.2, 4.3, 4.5, 6.5, 6.7_

  - [x] 3.3 Create `SubmitBar` component
    - Create `resources/js/components/admin/attendance/components/SubmitBar.vue` using `<script setup>`
    - Accept props: `canSubmit`, `isSubmitting`, `isClockOutMode`
    - Emit: `submit` event
    - Render shadcn-vue `<Button>` with loading spinner during submission
    - Label changes: "Clock In" vs "Clock Out" based on mode
    - Disable button when `!canSubmit` or `isSubmitting`
    - Minimum 44×44px touch target, full-width on mobile
    - _Requirements: 5.1, 5.3, 6.1, 6.5_

- [x] 4. Rewrite AttendanceSelfComponent with Composition API
  - [x] 4.1 Rewrite `AttendanceSelfComponent.vue` using `<script setup>`
    - Rewrite `resources/js/components/admin/attendance/AttendanceSelfComponent.vue` from Options API to Composition API with `<script setup>`
    - Import and compose `useQuickClock` and `useAttendanceTimer`
    - Fetch current attendance state on mount via `fetchCurrentAttendance`
    - Determine mode (clock-in vs clock-out, closed, not-required) from reactive attendance state
    - Call `startFlow()` automatically when attendance requires action (auto-validate on mount)
    - Replace custom CSS classes with shadcn-vue `Card`, `Button`, `Badge`, `Skeleton` components
    - Use `LocationStatusBadge`, `CameraCapture`, `SubmitBar` sub-components
    - Apply Tailwind utilities for mobile-first layout: max-w-[720px], mx-auto, min-h-screen, flex flex-col, gap-3.5
    - Ensure 16px minimum padding on viewports < 768px
    - Maintain single-column stacked layout on mobile with min 12px gap between interactive elements
    - Ensure all text is minimum 16px on mobile viewports
    - Handle success navigation: admin dashboard if user has dashboard permission, home otherwise
    - Preserve existing history sheet functionality (Sheet, calendar, records)
    - Remove all `<style scoped>` custom CSS — replace with Tailwind utilities
    - _Requirements: 1.1, 1.3, 1.4, 2.2, 4.1, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3_

- [x] 5. Checkpoint - Verify component renders
  - Ensure the rewritten component has no compile errors and all imports resolve correctly, ask the user if questions arise.

- [x] 6. Write property-based tests
  - [x]* 6.1 Write property test for location validation payload correctness
    - **Property 1: Location validation payload correctness**
    - **Validates: Requirements 1.2, 7.1**
    - Create test in `resources/js/components/admin/attendance/__tests__/quickClock.property.test.js`
    - Generate random action modes ('clock_in', 'clock_out') and valid GPS coordinates (lat [-90,90], lng [-180,180])
    - Assert `useGeolocation` sends validation request with exactly the provided action, latitude, and longitude

  - [x]* 6.2 Write property test for valid location response state transition
    - **Property 2: Valid location response transitions state to ready**
    - **Validates: Requirements 1.4, 2.4**
    - Generate random responses where `is_valid: true` OR `enforced: false`
    - Assert `locationState` transitions to "ready" and coordinates are stored

  - [x]* 6.3 Write property test for geolocation error state transition
    - **Property 3: Geolocation error transitions state to failed with message**
    - **Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.4**
    - Generate random geolocation errors (codes 1, 2, 3, unsupported)
    - Assert `locationState` transitions to "failed" and `locationError` is a non-empty string

  - [x]* 6.4 Write property test for canSubmit invariant
    - **Property 4: canSubmit invariant**
    - **Validates: Requirements 5.1, 1.6, 2.2**
    - Generate all combinations of `locationState` values and `image` (null vs File)
    - Assert `canSubmit` is true iff `locationState === 'ready' && image !== null`

  - [x]* 6.5 Write property test for distance formatting
    - **Property 5: Distance formatting uses Indonesian locale**
    - **Validates: Requirements 2.1**
    - Generate random non-negative integers
    - Assert formatted string equals `Number(distance).toLocaleString("id-ID")` + " m"

  - [x]* 6.6 Write property test for error state preservation
    - **Property 6: Errors preserve previously captured state**
    - **Validates: Requirements 3.5, 3.6, 5.5**
    - Generate states with non-null `image`/`coordinates`, then trigger location or submit errors
    - Assert `image`, `imagePreview`, and `coordinates` remain unchanged after error

  - [x]* 6.7 Write property test for API endpoint selection
    - **Property 7: Correct API endpoint selection based on mode**
    - **Validates: Requirements 5.2**
    - Generate random boolean `isClockOutMode` values
    - Assert correct service function is called (`clockOutAttendance` vs `clockInAttendance`) with correct payload shape

  - [x]* 6.8 Write property test for post-submission navigation
    - **Property 8: Post-submission navigation target based on permissions**
    - **Validates: Requirements 5.4**
    - Generate random permission arrays (with/without dashboard access)
    - Assert navigation target is admin dashboard when permissions include `{ name: "dashboard", access: true }`, home otherwise

  - [x]* 6.9 Write property test for badge variant mapping
    - **Property 9: Badge variant mapping from location state**
    - **Validates: Requirements 6.3**
    - Generate all `locationState` values
    - Assert Badge variant is "default" when idle, Skeleton when loading, "success" when ready, "destructive" when failed

- [x] 7. Write unit tests for composables and components
  - [x]* 7.1 Write unit tests for `useGeolocation` composable
    - Create tests in `resources/js/components/admin/attendance/__tests__/quickClock.test.js`
    - Test auto-validate triggers on mount (Req 1.1)
    - Test skeleton shown during loading state (Req 1.3)
    - Test retry button visible when failed (Req 1.7)
    - Test retry transitions to loading (Req 2.3)
    - Test geofence inactive skips validation (Req 2.5)
    - Test geolocation unsupported browser (Req 3.1)
    - Test permission denied with instructions (Req 3.2)
    - _Requirements: 1.1, 1.3, 1.7, 2.3, 2.5, 3.1, 3.2_

  - [x]* 7.2 Write unit tests for `useCamera` composable
    - Test camera auto-starts after location ready (Req 4.1)
    - Test capture button shown when camera ready (Req 4.2)
    - Test photo preview shown after capture (Req 4.3)
    - Test front-facing camera requested (Req 4.4)
    - Test camera permission denied after auto-init (Req 4.5)
    - Test camera stream timeout 10s (Req 4.6)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x]* 7.3 Write unit tests for `useQuickClock` and submission flow
    - Test all buttons disabled during submission (Req 5.3)
    - Test state refresh on stale clock-out (Req 5.6)
    - Test live duration shown in clock-out mode (Req 7.2)
    - Test success message includes duration (Req 7.3)
    - Test pre-submission state re-fetch for clock-out (Req 7.4)
    - Test clock-out state changed during submission (Req 7.5)
    - _Requirements: 5.3, 5.6, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `hooks/useAttendanceCapture.js` will be superseded by the new composables in `composables/`
- All shadcn-vue imports come from `../../ui` (re-exported from `resources/js/components/ui/index.ts`)
- The `fast-check` package is already installed in devDependencies

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3"] }
  ]
}
```
