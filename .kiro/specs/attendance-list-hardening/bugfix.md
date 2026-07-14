# Bugfix Requirements Document

## Introduction

The attendance list page (`AttendanceListPage.vue`) and its sub-components contain 9 weaknesses identified through SWOT analysis. These range from missing real-time updates and pagination UI, to race conditions, silent geolocation failures, hardcoded English error strings, and UX inconsistencies. This document captures the defective behaviors, expected corrections, and preservation requirements for a systematic hardening pass.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the active workers panel is displayed THEN the system shows stale `live_duration_minutes` values that never update until the admin manually clicks "Refresh"

1.2 WHEN more than 20 attendance records exist for the current date THEN the system displays only the first 20 records with no pagination controls, making remaining records inaccessible

1.3 WHEN `AttendanceRecordsTable.vue` needs to check if a record has photos THEN the system uses a locally re-implemented `hasAnyPhoto` function instead of importing from `useAttendancePhotoModal` composable, violating DRY

1.4 WHEN an API call fails and no server error message is returned THEN the system displays hardcoded English fallback strings (e.g. "Failed to load attendance data.", "Failed to refresh attendance data.", "Failed to clock out.") instead of i18n-translated messages

1.5 WHEN an admin triggers clock-out or review-complete actions THEN the system applies a full-page `LoadingOverlay` blocking the entire interface for a single-row operation

1.6 WHEN an admin wants to clock out an employee from the records table THEN the system presents a raw `<input type="file">` with no image preview, no camera capture option, and no clear button — inconsistent with the manual form's approach

1.7 WHEN zero employees are currently clocked in (`activeWorkers.length === 0`) THEN the system hides the entire "Active Employees" card via `v-if` with no empty state message, making the section silently disappear

1.8 WHEN an admin rapidly clicks "Review Done" or "Clock Out" multiple times THEN the system triggers parallel API calls and refetches because `handleReviewComplete` in the parent has no guard against double-submission

1.9 WHEN the browser denies geolocation permission or geolocation times out THEN the system silently swallows the error (returns `{}`) and proceeds with clock-in/out without location data, providing no feedback to the admin

### Expected Behavior (Correct)

2.1 WHEN the active workers panel is displayed THEN the system SHALL auto-refresh active worker data on a configurable polling interval (e.g. every 60 seconds) so that `live_duration_minutes` and new clock-ins are reflected without manual action

2.2 WHEN more than `per_page` attendance records exist THEN the system SHALL render pagination controls (previous/next, page numbers) and allow navigation between pages

2.3 WHEN `AttendanceRecordsTable.vue` needs to check if a record has photos THEN the system SHALL import and use the `hasAnyPhoto` function from the `useAttendancePhotoModal` composable (or receive it as a prop) instead of re-implementing it locally

2.4 WHEN an API call fails and no server error message is returned THEN the system SHALL display a translated fallback message using i18n keys (e.g. `t('attendance.error_load')`, `t('attendance.error_refresh')`, `t('attendance.error_clock_out')`) in both English and Indonesian

2.5 WHEN an admin triggers clock-out or review-complete for a single record THEN the system SHALL show a row-level loading indicator (e.g. disabled button with spinner) instead of blocking the entire page with a full-page overlay

2.6 WHEN an admin wants to clock out an employee from the records table THEN the system SHALL present a file input with image preview, camera capture attribute (`capture="environment"`), and a clear/reset button consistent with the manual form's UX pattern

2.7 WHEN zero employees are currently clocked in THEN the system SHALL display the "Active Employees" card with an empty state message (e.g. "No one is currently working") instead of hiding the entire section

2.8 WHEN an admin clicks "Review Done" or "Clock Out" THEN the system SHALL disable the action button immediately and prevent duplicate submissions until the current API call completes

2.9 WHEN the browser denies geolocation permission or geolocation times out THEN the system SHALL display a warning toast informing the admin that location data was not captured, while still allowing the clock-in/out to proceed

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the admin manually clicks "Refresh" THEN the system SHALL CONTINUE TO fetch fresh data for all panels (records, reviews, active workers) as it does today

3.2 WHEN fewer than or exactly `per_page` records exist THEN the system SHALL CONTINUE TO display all records without pagination controls

3.3 WHEN `AttendanceListPage.vue` uses `hasAnyPhoto` from the composable for the photo modal THEN the system SHALL CONTINUE TO open the photo modal correctly for records with photos

3.4 WHEN an API call fails and the server returns a specific error message THEN the system SHALL CONTINUE TO display the server-provided error message in the toast

3.5 WHEN the initial page load fetches all data THEN the system SHALL CONTINUE TO show the full-page loading overlay until all initial data is loaded

3.6 WHEN the manual attendance form (`AttendanceManualForm.vue`) handles file input for clock-in photos THEN the system SHALL CONTINUE TO work with its existing file input behavior unchanged

3.7 WHEN one or more employees are currently clocked in THEN the system SHALL CONTINUE TO display the active workers cards with employee names, shift info, and duration

3.8 WHEN a single click on "Review Done" or "Clock Out" is made THEN the system SHALL CONTINUE TO call the API, update the record, and refetch data as it does today

3.9 WHEN geolocation is successfully captured THEN the system SHALL CONTINUE TO include latitude/longitude coordinates in the clock-in/out API payload
