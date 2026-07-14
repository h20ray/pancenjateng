# Implementation Plan: Attendance Settings shadcn-vue Migration

## Overview

Migrate the monolithic `AttendanceSettingsComponent.vue` (977 lines, Options API, custom CSS) into 7 focused sub-components using Composition API (`<script setup>`), shadcn-vue primitives, and Tailwind CSS utilities. The implementation follows the project's established patterns: Pinia store access, `createToast` for notifications, `LoadingOverlay` for loading states, and barrel imports from `../../ui`.

## Tasks

- [x] 1. Create sub-component files and shared utilities
  - [x] 1.1 Create `SummaryBar.vue` with skeleton loading and 4 metric cards
    - Create `resources/js/components/admin/attendance/settings/SummaryBar.vue`
    - Accept `loading` boolean prop
    - Use `useAttendanceSettingsStore()` to compute `requiredRoleCount`, `activeScheduleCount`, `penaltyActive`, `geofenceActive`
    - Render 4 `Card` components in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
    - When `loading` is true, render `Skeleton` placeholders instead of values
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.2 Create `RoleRuleCard.vue` with role display and edit trigger
    - Create `resources/js/components/admin/attendance/settings/RoleRuleCard.vue`
    - Accept `rule` prop (RoleRule object), emit `edit` event
    - Render `Card` with role name, `Badge` for status (variant default/secondary), facts grid (hourly rate, today's schedule, active days), and edit `Button variant="outline" size="sm"`
    - Use Tailwind hover utilities (`hover:border-primary/30 hover:shadow-md transition`)
    - _Requirements: 5.4, 5.5, 2.1, 2.7_

  - [x] 1.3 Create `ScheduleEditorDialog.vue` with bulk actions and per-day schedule editing
    - Create `resources/js/components/admin/attendance/settings/ScheduleEditorDialog.vue`
    - Accept `open` boolean prop, `rule` prop (RoleRule | null), emit `update:open` and `saved`
    - Clone `rule` into local `ref()` form state via `watch()`
    - Implement `copyMondayToWeekdays()`, `copyMondayToAll()`, `disableWeekend()` bulk actions
    - Render `Dialog` with `DialogContent`, `DialogHeader`, `DialogTitle`
    - Each day row: `Checkbox` toggle, day name, `Input type="time"` for start/end, `Input type="number"` for grace minutes
    - Include `Switch` for "Rule Active" and "Required Attendance", `Input` for hourly rate
    - On submit call `store.saveRoleRule()`, show success/error toast via `createToast()`
    - Disable time/grace inputs when day is toggled off
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 2. Create form sub-components
  - [x] 2.1 Create `PenaltyForm.vue` with two-column layout and store sync
    - Create `resources/js/components/admin/attendance/settings/PenaltyForm.vue`
    - Use `ref()` for local form state, `watch()` to sync from `store.penalties`
    - Fields: rule name (`Input`), late threshold minutes, initial penalty amount, cap threshold minutes, cap penalty amount, active toggle (`Switch`)
    - Two-column grid on desktop (`grid-cols-1 md:grid-cols-2`), single column on mobile
    - On submit call `store.savePenalty()`, show toast
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 2.2 Create `GeofenceForm.vue` with location enforcement toggles
    - Create `resources/js/components/admin/attendance/settings/GeofenceForm.vue`
    - Use `ref()` for local form state, `watch()` to sync from `store.geofenceSetting`
    - Fields: radius meters (`Input type="number"`), enforce clock-in (`Switch`), enforce clock-out (`Switch`), active toggle (`Switch`)
    - On submit call `store.saveGeofenceSetting()`, show toast
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 2.3 Create `OvertimeForm.vue` with overtime rule configuration
    - Create `resources/js/components/admin/attendance/settings/OvertimeForm.vue`
    - Use `ref()` for local form state, `watch()` to sync from `store.overtimes`
    - Fields: active toggle (`Switch`), rule name (`Input`), overtime start threshold minutes (`Input type="number"`)
    - On submit call `store.saveOvertime()`, show toast
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 3. Create RoleRulesTab and rewrite page shell
  - [x] 3.1 Create `RoleRulesTab.vue` that composes RoleRuleCard and ScheduleEditorDialog
    - Create `resources/js/components/admin/attendance/settings/RoleRulesTab.vue`
    - Read `store.roleRules` via computed
    - Render responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
    - Show empty state `Card` when no role rules exist
    - Manage `dialogOpen` and `selectedRule` refs internally
    - On card edit click, open `ScheduleEditorDialog` with cloned rule data
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.2 Rewrite `AttendanceSettingsPage.vue` as the page shell with Composition API
    - Create `resources/js/components/admin/attendance/AttendanceSettingsPage.vue`
    - Use `<script setup>` with `ref()`, `computed()`, `onMounted()`
    - Call `store.fetchAll()` on mount, manage `loading` ref
    - Render `LoadingOverlay`, page header, `SummaryBar`, and `Tabs` with 4 `TabsContent` panels
    - Wire `RoleRulesTab`, `PenaltyForm`, `GeofenceForm`, `OvertimeForm` into tab panels
    - `TabsList` uses responsive grid (`grid-cols-2 md:grid-cols-4`)
    - Zero `<style>` block — all Tailwind utilities
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.9, 3.1, 3.2, 3.3, 3.4, 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4_

- [x] 4. Checkpoint - Ensure components compile and render
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update route and write tests
  - [x] 5.1 Update `attendanceRoutes.js` to point to `AttendanceSettingsPage.vue`
    - Modify `resources/js/router/modules/attendanceRoutes.js`
    - Change the lazy import from `AttendanceSettingsComponent` to `AttendanceSettingsPage`
    - Verify the route name `admin.attendance.settings` still resolves correctly
    - _Requirements: 1.1, 1.2_

  - [x] 5.2 Write property test: Summary bar metrics derived from store state
    - Create `resources/js/components/admin/attendance/__tests__/attendanceSettings.property.test.js`
    - **Property 1: Summary bar metrics are correctly derived from store state**
    - Use `fast-check` to generate arrays of RoleRule objects with varying `is_required`, `is_active`, and nested `schedules`
    - Assert `requiredRoleCount` equals count of rules where both `is_required` and `is_active` are true
    - Assert `activeScheduleCount` equals total schedules across all rules where `schedule.is_active` is true
    - **Validates: Requirements 4.1, 5.4**

  - [x] 5.3 Write property test: Copy Monday to weekdays preserves Monday and weekend
    - Add to `resources/js/components/admin/attendance/__tests__/attendanceSettings.property.test.js`
    - **Property 2: Copy Monday to weekdays preserves Monday and weekend, overwrites Tue–Fri**
    - Use `fast-check` to generate valid 7-day schedule arrays (days 1–7) with random times and active states
    - Apply `copyMondayToWeekdays` logic and assert days 2–5 match day 1's values, days 6–7 and day 1 remain unchanged
    - **Validates: Requirements 6.2**

  - [x] 5.4 Write property test: Disable weekend sets Sat/Sun inactive without affecting weekdays
    - Add to `resources/js/components/admin/attendance/__tests__/attendanceSettings.property.test.js`
    - **Property 3: Disable weekend sets Saturday and Sunday to inactive without affecting weekdays**
    - Use `fast-check` to generate valid 7-day schedule arrays
    - Apply `disableWeekend` logic and assert days 6–7 have `is_active = false`, days 1–5 remain completely unchanged
    - **Validates: Requirements 6.2**

  - [x] 5.5 Write component tests for SummaryBar and RoleRuleCard
    - Create `resources/js/components/admin/attendance/__tests__/attendanceSettingsComponents.test.js`
    - Test SummaryBar renders 4 metric cards with correct values from mocked store
    - Test SummaryBar renders Skeleton when `loading=true`
    - Test RoleRuleCard displays role name, Badge variant, hourly rate, schedule text
    - Test RoleRuleCard emits `edit` event on button click
    - _Requirements: 4.1, 4.3, 5.4, 5.5_

  - [x] 5.6 Write component tests for form submission flows
    - Add to `resources/js/components/admin/attendance/__tests__/attendanceSettingsComponents.test.js`
    - Test PenaltyForm calls `store.savePenalty()` on submit and shows success toast
    - Test GeofenceForm calls `store.saveGeofenceSetting()` on submit and shows success toast
    - Test OvertimeForm calls `store.saveOvertime()` on submit and shows success toast
    - Test error toast is shown when store action rejects
    - _Requirements: 7.2, 8.2, 9.2, 10.2, 10.3_

- [x] 6. Final checkpoint - Verify build and all tests pass
  - Run `npm run build` to verify no compilation errors
  - Run `npx vitest --run resources/js/components/admin/attendance/__tests__/attendanceSettings` to verify all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–3)
- Component tests validate specific rendering and interaction behavior
- The existing `AttendanceSettingsComponent.vue` is preserved (not deleted) — the route update is the switchover point
- All shadcn-vue imports come from `"../../ui"` barrel export per project conventions
- `createToast()` replaces `alertService` per design decision
- Zero custom CSS — all styling via Tailwind utilities

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "2.2", "2.3"] },
    { "id": 1, "tasks": ["1.3", "3.1"] },
    { "id": 2, "tasks": ["3.2"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6"] }
  ]
}
```
