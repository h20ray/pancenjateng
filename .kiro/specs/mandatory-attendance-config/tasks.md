# Implementation Plan: Mandatory Attendance Config

## Overview

This plan implements the per-employee mandatory attendance configuration feature. It adds database tables, Eloquent models, a service layer, controller, form requests, API routes, a shift preset seeder, a Pinia store, Vue components (MandatoryTab, EmployeeListSidebar, ConfigurationPanel, FlowCard, RoleCard, ScheduleCard, LocationCard, ValidationCard, GracePeriodCard), i18n keys, and integration with the existing AttendanceSettingsPage. Tasks are ordered so each step builds on the previous, ending with wiring and integration.

## Tasks

- [x] 1. Database migrations
  - [x] 1.1 Create `attendance_custom_roles` table migration
    - Create migration file with columns: id (bigint unsigned auto-increment PK), name (varchar 50, not null), created_at, updated_at
    - Add unique index `uq_acr_name` on `name`
    - Include matching `down()` that drops the table
    - _Requirements: 4.4, 12.4_

  - [x] 1.2 Create `mandatory_attendance_configs` table migration
    - Create migration file with columns: id (bigint unsigned auto-increment PK), employee_id (bigint unsigned not null), custom_role_id (bigint unsigned nullable), schedule (JSON not null), geofence_mode (varchar 20 not null default 'all_branches'), branch_id (bigint unsigned nullable), radius_meter (int unsigned nullable), validation_method (varchar 20 not null default 'selfie_gps'), grace_period (int unsigned not null default 0), custom_hourly_rate (decimal 12,2 nullable), created_at, updated_at
    - Add foreign keys: employee_id → users(id) ON DELETE CASCADE, custom_role_id → attendance_custom_roles(id) ON DELETE SET NULL, branch_id → branches(id) ON DELETE SET NULL
    - Add unique index `uq_mac_employee` on `employee_id`
    - Include matching `down()` that drops the table
    - _Requirements: 10.1, 10.7, 12.1, 12.2_

- [x] 2. Eloquent models
  - [x] 2.1 Create `AttendanceCustomRole` model
    - Create `app/Models/AttendanceCustomRole.php`
    - Define `$fillable = ['name']`, `$casts` for id and name
    - Add `configs(): HasMany` relationship to `MandatoryAttendanceConfig`
    - _Requirements: 4.4, 11.1, 12.4_

  - [x] 2.2 Create `MandatoryAttendanceConfig` model
    - Create `app/Models/MandatoryAttendanceConfig.php`
    - Define `$fillable` for all config fields, `$casts` (schedule as array, integers, decimal)
    - Add relationships: `employee(): BelongsTo(User)`, `customRole(): BelongsTo(AttendanceCustomRole)`, `branch(): BelongsTo(Branch)`
    - _Requirements: 10.1, 12.1, 12.2_

- [x] 3. Shift preset seeder
  - [x] 3.1 Create `ShiftPresetSeeder`
    - Create `database/seeders/ShiftPresetSeeder.php`
    - Seed 6 shift presets into `attendance_shift_settings`: Shift 1 Weekday (05:00-14:00), Shift 2 Weekday (12:00-21:00), Shift 1 Weekend (04:00-13:00), Shift 2 Weekend (11:00-20:00), Barista Weekday (08:00-15:00), Barista Weekend (06:00-13:00), each with grace_minutes=15, is_active=true
    - Use `firstOrCreate` by name to ensure idempotence (skip existing records)
    - _Requirements: 13.1, 13.2_

  - [x] 3.2 Write property test for seeder idempotence (Property 12)
    - **Property 12: Seeder idempotence**
    - Run seeder N times (random N between 1-5), verify count of seeded presets equals exactly 6
    - **Validates: Requirements 13.2**

- [x] 4. Service layer and form requests
  - [x] 4.1 Create `MandatoryAttendanceConfigService`
    - Create `app/Services/MandatoryAttendanceConfigService.php`
    - Implement `getActiveEmployees()`: query users where status=active, role_id != 2, is_guest=0, with `has_config` boolean flag
    - Implement `getConfig(User $employee)`: retrieve config with relationships
    - Implement `saveConfig(array $data)`: upsert (updateOrCreate by employee_id) the full config atomically
    - Implement `getRoles()`: return all AttendanceCustomRole records
    - Implement `createCustomRole(string $name)`: create new custom role
    - Implement `deleteCustomRole(AttendanceCustomRole $role)`: nullify custom_role_id on affected configs, then delete role
    - Implement `getBranchesWithGps()`: return branches that have latitude/longitude set
    - _Requirements: 2.1, 10.1, 10.7, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 4.2 Create `MandatoryAttendanceConfigRequest` form request
    - Create `app/Http/Requests/MandatoryAttendanceConfigRequest.php`
    - Implement validation rules per design: employee_id (required, exists:users,id), custom_role_id (required, exists:attendance_custom_roles,id), schedule (required, array, size:7), schedule.*.day (required, integer, between:1,7), schedule.*.shift_setting_id (nullable, integer, exists:attendance_shift_settings,id), geofence_mode (required, in:all_branches,specific_outlet,free_gps), branch_id (nullable, required_if:geofence_mode,specific_outlet, exists:branches,id), radius_meter (nullable, required_if:geofence_mode,specific_outlet, integer, between:50,5000), validation_method (required, in:selfie_gps,pin), grace_period (required, integer, between:0,120), custom_hourly_rate (nullable, numeric, between:0.01,999999999.99)
    - _Requirements: 12.2, 12.7, 12.8_

  - [x] 4.3 Create `CustomRoleRequest` form request
    - Create `app/Http/Requests/CustomRoleRequest.php`
    - Implement validation rules: name (required, string, max:50, unique:attendance_custom_roles,name)
    - _Requirements: 4.4, 12.4_

  - [x] 4.4 Write property tests for backend validation
    - [x] 4.4.1 Property test: Custom role name validation (Property 4)
      - **Property 4: Custom role name validation**
      - Generate random strings (empty, whitespace-only, >50 chars, duplicates, valid names)
      - Verify acceptance/rejection matches the property specification
      - **Validates: Requirements 4.4, 12.4**

    - [x] 4.4.2 Property test: Radius validation (Property 5)
      - **Property 5: Radius validation**
      - Generate random integers (negative, 0-49, 50-5000, 5001+, non-integers)
      - Verify acceptance for [50,5000], rejection otherwise
      - **Validates: Requirements 6.3**

    - [x] 4.4.3 Property test: Grace period validation (Property 6)
      - **Property 6: Grace period validation**
      - Generate random values (negative, floats, 0-120, 121+)
      - Verify acceptance for non-negative integers [0,120], rejection otherwise
      - **Validates: Requirements 8.3**

    - [x] 4.4.4 Property test: Custom hourly rate validation (Property 8)
      - **Property 8: Custom hourly rate validation**
      - Generate random decimals (0, negative, valid range 0.01-999999999.99, >2 decimal places)
      - Verify acceptance/rejection per specification
      - **Validates: Requirements 9.5**

- [x] 5. Checkpoint - Ensure migrations, models, service, and form requests work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Controller and routes
  - [x] 6.1 Create `MandatoryAttendanceConfigController`
    - Create `app/Http/Controllers/Admin/MandatoryAttendanceConfigController.php`
    - Extend AdminController, apply `permission:attendance-settings` middleware
    - Implement `employeeList()`: GET, returns active employees with has_config flag
    - Implement `show(User $employee)`: GET, returns employee's config
    - Implement `store(MandatoryAttendanceConfigRequest $request)`: POST, upserts config
    - Implement `roles()`: GET, returns all custom roles
    - Implement `storeCustomRole(CustomRoleRequest $request)`: POST, creates custom role
    - Implement `destroyCustomRole(AttendanceCustomRole $role)`: DELETE, handles deletion with cascade
    - Implement `branches()`: GET, returns branches with GPS coordinates
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.9_

  - [x] 6.2 Register routes under attendance-setting prefix
    - Add route group `mandatory-config` under the existing `attendance-setting` prefix in routes file
    - Register all 7 endpoints per design: GET /employees, GET /roles, POST /custom-role, DELETE /custom-role/{role}, GET /branches, GET /{employee}, POST /
    - Apply existing attendance-settings permission middleware
    - _Requirements: 12.6, 12.9_

  - [x] 6.3 Write property tests for controller logic
    - [x] 6.3.1 Property test: Employee filter correctness (Property 1)
      - **Property 1: Employee filter correctness**
      - Generate random user records with varying status/role_id/is_guest combinations
      - Verify only users with status=active, role_id≠2, is_guest=0 appear in results
      - **Validates: Requirements 2.1, 12.3**

    - [x] 6.3.2 Property test: Atomic save (Property 9)
      - **Property 9: Atomic save (all-or-nothing persistence)**
      - Generate random valid/invalid payloads, attempt save, verify DB state matches expectation
      - Valid payloads: all fields persisted. Invalid payloads: no fields persisted
      - **Validates: Requirements 10.1**

    - [x] 6.3.3 Property test: Upsert idempotence (Property 10)
      - **Property 10: Upsert idempotence**
      - For random employees, call save multiple times with different valid payloads
      - Verify exactly one record exists per employee, values match last save
      - **Validates: Requirements 10.7**

    - [x] 6.3.4 Property test: Role deletion preserves config integrity (Property 11)
      - **Property 11: Role deletion preserves config integrity**
      - Create configs assigned to a role, delete role, verify custom_role_id is NULL but all other fields unchanged
      - **Validates: Requirements 11.5, 11.6**

    - [x] 6.3.5 Property test: Shift preset deletion protection (Property 13)
      - **Property 13: Shift preset deletion protection**
      - Generate presets with/without attendance record references
      - Verify referenced presets cannot be deleted, unreferenced ones can
      - **Validates: Requirements 13.3, 13.4**

- [x] 7. Checkpoint - Ensure backend API is functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. i18n keys
  - [x] 8.1 Add attendance i18n keys to `en.json` and `id.json`
    - Add keys under `attendance` namespace in `resources/js/languages/en.json` and `resources/js/languages/id.json`
    - Keys to add: mandatory_employees, select_employee_prompt, role_card_title, schedule_card_title, location_card_title, validation_card_title, grace_period_card_title, create_custom_role, custom_role_placeholder, save_config, saving, save_success, save_error, no_employees_found, employee_list_error, retry, monday, tuesday, wednesday, thursday, friday, saturday, sunday, libur_off, all_branches, specific_outlet, free_gps, selfie_gps, pin, grace_0_min, grace_15_min, grace_30_min, custom_minutes, radius_meters, select_branch, no_branches_available, custom_hourly_rate, custom_hourly_rate_placeholder, role_required_error, radius_range_error, grace_range_error, hourly_rate_range_error, confirm_delete_role, affected_employees
    - _Requirements: 1.2, all UI requirements_

- [x] 9. Frontend Pinia store
  - [x] 9.1 Create `useMandatoryAttendanceStore`
    - Create `resources/js/stores/useMandatoryAttendanceStore.js`
    - Define state: employees, loadingEmployees, selectedEmployeeId, config, loadingConfig, roles, shifts, branches, saving
    - Define getters: selectedEmployee, filteredEmployees (case-insensitive partial match)
    - Define actions: fetchEmployees(), fetchConfig(employeeId), saveConfig(payload), fetchRoles(), createCustomRole(name), deleteCustomRole(roleId), fetchBranches()
    - Use axios for API calls, createToast() for success/error notifications
    - _Requirements: 2.1, 2.3, 10.1, 10.2, 10.3, 10.4_

  - [x] 9.2 Write property tests for store search filter
    - [x] 9.2.1 Property test: Case-insensitive search filter (Property 3)
      - **Property 3: Case-insensitive search filter**
      - Generate random employee lists and search strings
      - Verify filtered result contains exactly employees whose name contains search string (case-insensitive)
      - **Validates: Requirements 2.3**

- [x] 10. Frontend components - Layout and wrappers
  - [x] 10.1 Create `FlowCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/FlowCard.vue`
    - Reusable card wrapper with props: stepNumber (Number), title (String), isLast (Boolean)
    - Render numbered circle indicator on the left, card content via slot, vertical connector line between cards (hidden on last card)
    - Use shadcn-vue Card primitives with Tailwind styling
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 10.2 Create `EmployeeListSidebar.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/EmployeeListSidebar.vue`
    - Search input with 300ms debounce, scrollable employee list
    - Display avatar + full name; placeholder initials (first letter of first name + first letter of last name) when no avatar
    - Highlight selected employee with distinct background color
    - Show error state with retry button on fetch failure
    - Show "no employees found" message when search yields no results
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 10.3 Write property test for employee initials derivation (Property 2)
    - **Property 2: Employee initials derivation**
    - Generate random name strings (1-word, 2-word, multi-word)
    - Verify initials equal uppercase first char of first word + uppercase first char of last word (single char for single-word names)
    - **Validates: Requirements 2.2**

- [x] 11. Frontend components - Configuration cards
  - [x] 11.1 Create `RoleCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/RoleCard.vue`
    - Native `<select>` dropdown with all roles + "+ Buat Divisi/Role Baru (Custom)" option
    - Inline input field for new custom role name with validation (non-empty, ≤50 chars, unique)
    - Custom hourly rate input field (numeric, 0.01-999999999.99, ≤2 decimals)
    - Show validation errors inline
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 9.1, 9.2, 9.5, 9.6, 9.7_

  - [x] 11.2 Create `ScheduleCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/ScheduleCard.vue`
    - 7-row grid (Monday-Sunday) with native HTML `<select>` for shift selection per day
    - Display time range next to selected shift, no time range for "Libur/Off"
    - Visually distinguish weekend rows (Saturday, Sunday) with different background color
    - Default all days to "Libur/Off" for new configs
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 11.3 Create `LocationCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/LocationCard.vue`
    - Geofence mode selector (radio group): all_branches, specific_outlet, free_gps
    - Conditional branch dropdown + radius input (integer 50-5000) when specific_outlet selected
    - Clear branch/radius when switching away from specific_outlet
    - Show message when no branches with GPS exist
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 11.4 Create `ValidationCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/ValidationCard.vue`
    - Radio group with options: Selfie + GPS, PIN code
    - Default to "Selfie + GPS" for new configs
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 11.5 Create `GracePeriodCard.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/GracePeriodCard.vue`
    - Preset buttons: 0 min, 15 min, 30 min + custom input field
    - Validate custom input: non-negative integer 0-120
    - Show inline error for invalid custom values
    - Default to 0 minutes for new configs
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 12. Frontend components - Panel and tab orchestration
  - [x] 12.1 Create `ConfigurationPanel.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/ConfigurationPanel.vue`
    - Render 5 FlowCards (RoleCard, ScheduleCard, LocationCard, ValidationCard, GracePeriodCard) when employee selected
    - Show placeholder message when no employee selected
    - Include save button with loading state, disable during save
    - Client-side validation before save (role required, schedule size 7, radius 50-5000 if specific_outlet, grace 0-120, hourly rate format)
    - Display field-level validation errors on relevant cards
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.1, 10.2, 10.5_

  - [x] 12.2 Create `MandatoryTab.vue` component
    - Create `resources/js/components/admin/attendance/mandatory/MandatoryTab.vue`
    - Layout orchestrator: flex row with EmployeeListSidebar (left) + ConfigurationPanel (right)
    - Initialize store on mount (fetch employees, roles, shifts, branches)
    - _Requirements: 2.1, 3.1_

  - [x] 12.3 Integrate MandatoryTab into AttendanceSettingsPage
    - Modify existing `AttendanceSettingsPage.vue` to add MandatoryTab trigger as first tab in TabsList
    - Use i18n key `attendance.mandatory_employees` for tab label
    - Add TabsContent for MandatoryTab component
    - Keep Role Rules as default active tab
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 13. Checkpoint - Ensure frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Integration and rate resolution
  - [x] 14.1 Implement rate resolution logic in service
    - Add `getEffectiveHourlyRate(MandatoryAttendanceConfig $config)` method to service
    - If custom_hourly_rate is non-null and > 0, return custom rate; otherwise return role-level rate
    - _Requirements: 9.3, 9.4_

  - [x] 14.2 Write property test for rate resolution (Property 7)
    - **Property 7: Rate resolution precedence**
    - Generate random configs with/without custom rates and role rates
    - Verify effective rate equals custom rate when non-null, role rate otherwise
    - **Validates: Requirements 9.3, 9.4**

  - [x] 14.3 Integrate custom roles with Role Rules tab
    - Ensure custom roles created in MandatoryTab appear in Role Rules tab data without page reload
    - Implement delete confirmation dialog showing affected employee count
    - On confirmed deletion, nullify role assignment on affected configs, retain other fields
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Integration tests
  - [x] 16.1 Write integration test: full save flow
    - Create employee → save config → retrieve config → verify all fields match
    - _Requirements: 10.1, 10.7, 12.1, 12.2_

  - [x] 16.2 Write integration test: custom role lifecycle
    - Create custom role → assign to employee → delete role → verify cascade (custom_role_id NULL, other fields intact)
    - _Requirements: 11.4, 11.5, 11.6_

  - [x] 16.3 Write integration test: permission enforcement
    - Verify all endpoints return 403 without `attendance-settings` permission
    - _Requirements: 12.6, 12.9_

  - [x] 16.4 Write integration test: shift preset protection
    - Create preset → reference in attendance record → attempt delete → verify rejection
    - Create preset → no references → delete → verify success
    - _Requirements: 13.3, 13.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Native HTML `<select>` elements are used for shift dropdowns per steering rule 08
- All new Vue components use `<script setup>` with Composition API
- Pinia store (NOT Vuex) for state management per steering rule 01
- Tailwind CSS with shadcn-vue components (NO Bootstrap) per steering rules 02, 04
- i18n keys must be added to both en.json and id.json per steering rule 05
- Migration hygiene: one logical change per migration, correct first time, include down() per steering rule 03
- DRY principle: FlowCard is a reusable wrapper, validation logic extracted to composables per steering rule 06

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1", "4.2", "4.3"] },
    { "id": 4, "tasks": ["4.4.1", "4.4.2", "4.4.3", "4.4.4", "6.1"] },
    { "id": 5, "tasks": ["6.2"] },
    { "id": 6, "tasks": ["6.3.1", "6.3.2", "6.3.3", "6.3.4", "6.3.5", "8.1"] },
    { "id": 7, "tasks": ["9.1"] },
    { "id": 8, "tasks": ["9.2.1", "10.1", "10.2"] },
    { "id": 9, "tasks": ["10.3", "11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 10, "tasks": ["12.1"] },
    { "id": 11, "tasks": ["12.2"] },
    { "id": 12, "tasks": ["12.3"] },
    { "id": 13, "tasks": ["14.1"] },
    { "id": 14, "tasks": ["14.2", "14.3"] },
    { "id": 15, "tasks": ["16.1", "16.2", "16.3", "16.4"] }
  ]
}
```
