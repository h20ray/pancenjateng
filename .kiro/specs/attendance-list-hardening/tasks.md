# Implementation Plan: Attendance List Hardening

## Overview

9 tasks to fix weaknesses in the attendance list page: auto-polling, pagination, DRY cleanup, i18n compliance, row-level loading, improved clock-out UX, empty states, race condition guards, and geolocation feedback. Tasks are ordered by dependency — foundational changes (composable, i18n keys, utility, store) come first, then component modifications, then tests.

## Tasks

- [x] 1. Create `usePolling` composable in `resources/js/components/admin/attendance/composables/usePolling.js`. Implement `usePolling(callback, intervalMs)` returning `{ start, stop, isPolling }`. Use `setInterval` with `onScopeDispose` cleanup. Guard against double-start. Wrap callback in try/catch for silent failures. Fixes Bug 2.1.
- [x] 2. Add 6 i18n keys to `resources/js/languages/en.json` and `resources/js/languages/id.json`: `attendance.error_load`, `attendance.error_refresh`, `attendance.error_clock_out`, `attendance.error_review`, `attendance.location_not_captured`, `attendance.no_active_workers`. Add `button.prev` and `button.next` if not present. Fixes Bug 2.4.
- [x] 3. Update `resources/js/utils/geolocationCapture.js` — change `captureAttendanceLocation` to return `{ payload, locationCaptured: true }` on success and `{ payload: {}, locationCaptured: false }` on failure. Keep `captureCoordinates` unchanged. Fixes Bug 2.9.
- [x] 4. Update `resources/js/stores/useAttendanceStore.js` — in `fetchLists`, store `current_page` and `last_page` from `res.data.meta` alongside existing `from`, `to`, `total`. Fixes Bug 2.2.
- [x] 5. Refactor `resources/js/components/admin/attendance/AttendanceListPage.vue` — import and start `usePolling` (60s silent refresh), add pagination UI with `goToPage` function (conditional on `page.last_page > 1`), replace `loading.value = true` in `handleClockOut`/`handleReviewComplete` with `actionInProgress` reactive Set pattern, replace hardcoded English fallbacks with `t()` calls, remove `v-if="activeWorkers.length"` from Active Workers card, pass `hasAnyPhoto` and `actionInProgress` as props to `AttendanceRecordsTable`, adapt geolocation destructuring to new `{ payload, locationCaptured }` shape with warning toast. Fixes Bugs 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9.
- [x] 6. Refactor `resources/js/components/admin/attendance/list/AttendanceRecordsTable.vue` — add `hasAnyPhoto` (Function) and `actionInProgress` (Object) props, remove local `hasAnyPhoto` function, add `capture="environment"` to file input, add Object URL preview thumbnail with clear button, revoke URLs on `onScopeDispose`, disable clock-out/review buttons based on `actionInProgress` state. Fixes Bugs 2.3, 2.5, 2.6, 2.8.
- [x] 7. Update `resources/js/components/admin/attendance/list/AttendanceActiveWorkers.vue` — add `useI18n` import, wrap existing grid in `v-if="workers.length"`, add `v-else` empty state with dashed border and `t('attendance.no_active_workers')` message. Fixes Bug 2.7.
- [x] 8. Update `resources/js/components/admin/attendance/list/AttendanceManualForm.vue` — destructure `{ payload: locationPayload, locationCaptured }` from `captureAttendanceLocation("clock_in")`, show warning toast when `locationCaptured === false`, spread `locationPayload` into clockIn payload. Fixes Bug 2.9.
- [x] 9. Update `resources/js/components/admin/attendance/__tests__/attendanceListPage.integration.test.js` — add test for pagination rendering when `page.last_page > 1`, test pagination hidden when `last_page <= 1`, test empty state for active workers, test race condition guard (single API call on double-click), update `captureAttendanceLocation` mock to new return shape, verify `hasAnyPhoto` prop passed to records table.

## Task Dependency Graph

```json
{
  "waves": [
    {"tasks": [1, 2, 3, 4]},
    {"tasks": [5]},
    {"tasks": [6, 7, 8]},
    {"tasks": [9]}
  ]
}
```

Tasks 1–4 are independent and can be done in parallel. Task 5 depends on all of 1–4. Tasks 6–8 depend on Task 5. Task 9 depends on all prior tasks.

## Notes

- No backend changes required — all fixes are frontend-only
- The polling interval (60s) is hardcoded but can be made configurable later via a constant
- The `actionInProgress` Set uses string keys like `clockout-{id}` and `review-{id}` to track per-row state
- Object URL cleanup in Task 6 uses `onScopeDispose` from Vue to prevent memory leaks
- The geolocation change (Task 3) is backward-compatible — callers just need to destructure the new shape
