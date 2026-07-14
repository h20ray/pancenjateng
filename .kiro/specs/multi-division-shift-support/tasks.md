# Implementation Plan: Multi-Division Shift Support

## Overview

This plan implements support for employees working multiple shifts across different divisions on the same day. The implementation follows an incremental approach: schema migrations first, then the new DivisionResolver service, followed by modifications to existing services (ClockService, PolicyResolver, PayrollService), and finally integration wiring and testing.

## Tasks

- [x] 1. Database schema migrations
  - [x] 1.1 Create migration to add `division_id` to `attendances` table
    - Add nullable `division_id` unsignedBigInteger column with FK to `divisions.id` (SET NULL on delete)
    - Drop existing `unique(user_id, work_date)` constraint
    - Add new unique constraint `uq_attendances_user_date_division` on `(user_id, work_date, division_id)`
    - Add composite index `idx_attendances_user_date_status` on `(user_id, work_date, status)`
    - Include proper `down()` method that reverses all changes
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Create migration to add `division_id` to `attendance_overtime_rules` table
    - Add nullable `division_id` unsignedBigInteger column with FK to `divisions.id` (SET NULL on delete)
    - Add index `idx_overtime_rules_division_active_effective` on `(division_id, is_active, effective_from)`
    - Include proper `down()` method
    - _Requirements: 4.1_

  - [x] 1.3 Create migration to add `division_id` to `attendance_penalty_rules` table
    - Add nullable `division_id` unsignedBigInteger column with FK to `divisions.id` (SET NULL on delete)
    - Add index `idx_penalty_rules_division_active_effective` on `(division_id, is_active, effective_from)`
    - Include proper `down()` method
    - _Requirements: 5.1_

- [x] 2. Update Eloquent models
  - [x] 2.1 Update `Attendance` model with `division_id` support
    - Add `division_id` to `$fillable` array
    - Add `division_id` cast as `integer`
    - Add `division()` BelongsTo relationship to `Division::class`
    - _Requirements: 1.1_

  - [x] 2.2 Update `AttendanceOvertimeRule` model with `division_id` support
    - Add `division_id` to `$fillable` array
    - Add `division_id` cast as `integer`
    - Add `division()` BelongsTo relationship to `Division::class`
    - _Requirements: 4.1_

  - [x] 2.3 Update `AttendancePenaltyRule` model with `division_id` support
    - Add `division_id` to `$fillable` array
    - Add `division_id` cast as `integer`
    - Add `division()` BelongsTo relationship to `Division::class`
    - _Requirements: 5.1_

- [x] 3. Checkpoint - Verify migrations and models
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement AttendanceDivisionResolver service
  - [x] 4.1 Create `AttendanceDivisionResolver` service class
    - Create `app/Modules/Attendance/Services/AttendanceDivisionResolver.php`
    - Implement `resolve(int $userId, Carbon $clockInTime, Carbon $workDate): int` method
    - Step 1: Query published `attendance_weekly_schedules` for the employee on the current day-of-week where the associated shift's `start_time` is within ±120 minutes of `$clockInTime`
    - Step 2: If exactly one division matches → return that division_id
    - Step 3: If multiple divisions match → filter to those without a completed/missed_check_out attendance record for today; if exactly one remains → return it; if multiple remain → pick the one whose shift start_time is closest to current time
    - Step 4: If no schedule matches → fall back to the employee's primary division (`employee_divisions.is_primary = true`)
    - Step 5: If no primary division → throw an exception with descriptive error message "Tidak ditemukan jadwal shift untuk waktu ini. Silakan hubungi admin."
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.2 Write property test for division auto-detection from schedule (Property 2)
    - **Property 2: Division auto-detection from schedule**
    - For any employee with published weekly schedules, when the employee clocks in at a time within ±120 minutes of exactly one scheduled shift's start_time, the resolved division_id equals the division_id of that matching schedule entry
    - **Validates: Requirements 2.1, 2.2**

  - [x] 4.3 Write property test for division disambiguation by attendance state (Property 3)
    - **Property 3: Division disambiguation by attendance state**
    - For any employee with schedules in multiple divisions, if exactly one division has no completed attendance record for today, the resolved division_id is that unattended division
    - **Validates: Requirements 2.3**

  - [x] 4.4 Write property test for division disambiguation by closest time (Property 4)
    - **Property 4: Division disambiguation by closest time**
    - For any employee with schedules in multiple divisions where more than one has no completed attendance, the resolved division_id is the one whose shift start_time is closest to clock-in time
    - **Validates: Requirements 2.4**

  - [x] 4.5 Write property test for primary division fallback (Property 5)
    - **Property 5: Primary division fallback**
    - For any employee with no matching schedule entry, the resolved division_id equals the employee's primary division
    - **Validates: Requirements 2.5**

- [x] 5. Modify AttendanceClockService for multi-division support
  - [x] 5.1 Implement `validateClockInEligibility()` method in `AttendanceClockService`
    - Replace `ensureNoOpenAttendance()` with new `validateClockInEligibility(int $userId, Carbon $workDate, int $divisionId)` method
    - Implement ordered validation gates: (1) open session check — reject if `clocked_in` record exists for a different division, (2) daily limit check — reject if 2 records already exist for the work_date, (3) same-division duplicate check — reject if terminal record exists for the same division
    - Use Indonesian error messages as defined in the design's Error Handling section
    - Ensure no Attendance_Record is created or modified when rejection occurs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.1, 8.2, 8.3, 8.4_

  - [x] 5.2 Modify `clockIn()` method to use DivisionResolver and multi-record logic
    - Inject `AttendanceDivisionResolver` into the service constructor
    - Call `DivisionResolver::resolve()` to determine `division_id` at clock-in time
    - Replace `Attendance::firstOrNew(['user_id' => $userId, 'work_date' => $workDate])` with explicit creation logic that stores `division_id`
    - Call `validateClockInEligibility()` before creating the record
    - For single-division employees, auto-associate the division_id
    - For manager-created records, bypass the daily limit of 2 (allow 3rd record)
    - _Requirements: 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 8.5_

  - [x] 5.3 Write property test for daily limit enforcement (Property 1)
    - **Property 1: Daily limit enforcement**
    - For any employee with 2 existing records on a work_date, any self-service clock-in attempt is rejected and record count remains 2
    - **Validates: Requirements 1.3, 3.4, 8.1, 8.2, 8.3, 8.4**

  - [x] 5.4 Write property test for open session blocking (Property 6)
    - **Property 6: Open session blocks new clock-in**
    - For any employee with an open `clocked_in` record for division A, clock-in for division B is rejected
    - **Validates: Requirements 3.1**

  - [x] 5.5 Write property test for completed session allowing new division (Property 7)
    - **Property 7: Completed session allows new division clock-in**
    - For any employee whose existing records are all terminal and for a different division, clock-in for a new division succeeds
    - **Validates: Requirements 3.2**

  - [x] 5.6 Write property test for same-division duplicate rejection (Property 8)
    - **Property 8: Same-division duplicate rejection**
    - For any employee with a terminal record for division A, clock-in for the same division A is rejected
    - **Validates: Requirements 3.3**

  - [x] 5.7 Write property test for validation priority ordering (Property 9)
    - **Property 9: Validation priority ordering**
    - When multiple rejection conditions apply, the error corresponds to the first matching condition in order: open session → daily limit → same-division duplicate
    - **Validates: Requirements 3.5**

  - [x] 5.8 Write property test for rejection side-effect-free (Property 10)
    - **Property 10: Rejection is side-effect-free**
    - For any rejected clock-in attempt, the total count of Attendance_Records remains unchanged
    - **Validates: Requirements 3.6**

- [x] 6. Checkpoint - Verify clock-in flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Modify AttendancePolicyResolver for division context
  - [x] 7.1 Add optional `$divisionId` parameter to `resolve()` method
    - Update method signature: `resolve(int|User $user, ?Carbon $date = null, ?int $divisionId = null): array`
    - When `$divisionId` is non-null, use it for all division-dependent resolution steps (shift, grace period, hourly rate, has_fixed_hours_shift) instead of deriving from config/user/pivot
    - When `$divisionId` is non-null, still resolve weekly schedule by employee_id + week_start_date (schedule-assigned shift takes priority)
    - When `$divisionId` is non-null and no Division record exists for that id, treat as absent and fall back to standard derivation chain
    - When `$divisionId` is null or omitted, preserve existing behavior (derive from config → user → primary pivot → first pivot)
    - Update `resolveShiftAndGrace()` and `resolveHourlyRate()` private methods to accept and use the explicit `$divisionId`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 7.2 Write property test for policy resolver respecting explicit division_id (Property 13)
    - **Property 13: Policy resolver respects explicit division_id**
    - For any call with non-null `$divisionId`, the resolver uses that division for all division-dependent steps; when null, it derives via the existing chain
    - **Validates: Requirements 6.2, 6.4, 6.6**

  - [x] 7.3 Write property test for schedule-assigned shift override (Property 14)
    - **Property 14: Schedule-assigned shift overrides division shift**
    - For any call with non-null `$divisionId`, if the weekly schedule assigns a specific shift_setting_id, that shift takes priority over division-level lookup
    - **Validates: Requirements 6.3**

- [x] 8. Modify AttendancePayrollService for division-scoped rules
  - [x] 8.1 Update `resolvePenaltyRuleByDate()` to accept optional `$divisionId`
    - Change signature to `resolvePenaltyRuleByDate(Carbon $workDate, ?int $divisionId = null): ?AttendancePenaltyRule`
    - When `$divisionId` is non-null, first query active penalty rules scoped to that division_id with `effective_from <= $workDate`, ordered by `effective_from` desc then `id` desc
    - If no division-scoped rule found, fall back to active global rule (where `division_id IS NULL`) with same ordering
    - If no rule found at either scope, return null (penalty_amount = 0)
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 Update `resolveOvertimeRuleByDate()` to accept optional `$divisionId`
    - Change signature to `resolveOvertimeRuleByDate(Carbon $workDate, ?int $divisionId = null): ?AttendanceOvertimeRule`
    - When `$divisionId` is non-null, first query active overtime rules scoped to that division_id with `effective_from <= $workDate`, ordered by `effective_from` desc
    - If no division-scoped rule found, fall back to active global rule (where `division_id IS NULL`) with same ordering
    - If no rule found at either scope, return null (overtime_amount = 0)
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 8.3 Update `calculate()` method to use record's `division_id`
    - Read `$attendance->division_id` and pass it to `AttendancePolicyResolver::resolve($userId, $workDate, $divisionId)` for hourly rate and shift resolution
    - Pass `$divisionId` to `resolvePenaltyRuleByDate($workDate, $divisionId)` and `resolveOvertimeRuleByDate($workDate, $divisionId)`
    - When `$attendance->division_id` is NULL (legacy records), derive division from employee's primary division; if that is also NULL, use global rules only
    - Store resolved `applied_penalty_rule_id`, `applied_overtime_rule_id`, and `applied_hourly_rate_id` on the attendance record
    - Use `has_fixed_hours_shift` flag from the record's division, not the employee's current primary division
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 8.4 Write property test for division-scoped rule resolution with global fallback (Property 11)
    - **Property 11: Division-scoped rule resolution with global fallback**
    - For any record with non-null division_id, the Payroll_Service selects the active rule scoped to that division; if none exists, falls back to global rule
    - **Validates: Requirements 4.2, 4.3, 5.2, 5.3**

  - [x] 8.5 Write property test for independent rule resolution per record (Property 12)
    - **Property 12: Independent rule resolution per attendance record**
    - For any two records on the same day with different division_ids, the Payroll_Service resolves rules independently, potentially applying different rules to each
    - **Validates: Requirements 4.5, 5.5**

  - [x] 8.6 Write property test for payroll using record's division_id (Property 15)
    - **Property 15: Payroll calculation uses record's division_id**
    - For any record with non-null division_id, the Payroll_Service resolves hourly rate, shift setting, and has_fixed_hours_shift using that record's division_id
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.8**

  - [x] 8.7 Write property test for rule snapshot IDs stored (Property 16)
    - **Property 16: Rule snapshot IDs stored after calculation**
    - For any record after payroll calculation, if applicable rules exist, the record has non-null applied_penalty_rule_id, applied_overtime_rule_id, and applied_hourly_rate_id
    - **Validates: Requirements 7.6**

  - [x] 8.8 Write property test for legacy NULL division_id fallback (Property 17)
    - **Property 17: Legacy NULL division_id uses primary division**
    - For any record where division_id is NULL, the Payroll_Service resolves all rules using the employee's primary division; if that is also NULL, global rules are used
    - **Validates: Requirements 7.7**

- [x] 9. Checkpoint - Verify payroll and policy resolution
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Integration wiring and edge cases
  - [x] 10.1 Update `AttendanceAutoCloseService` to handle multi-division records
    - Ensure `autoCloseExpiredOpenAttendances()` correctly processes multiple open records per employee (one per division)
    - Verify the auto-close logic uses the correct shift setting per record's division_id
    - _Requirements: 7.1, 7.8_

  - [x] 10.2 Update `AttendanceClockInRequest` and `AttendanceClockOutRequest` validation
    - Ensure clock-in request validation resolves the policy using the correct division context
    - Add optional `division_id` field to the clock-in request for manager overrides
    - _Requirements: 1.5, 6.1_

  - [x] 10.3 Update `AttendanceService` to pass division context
    - Update `getAttendanceStatus()` and related methods to account for multiple records per day
    - Ensure the attendance status API returns the correct current state when multiple records exist
    - _Requirements: 1.1, 3.2_

  - [x] 10.4 Write unit tests for edge cases
    - Test manager override: manager with `attendance` permission can create a 3rd record bypassing daily limit
    - Test legacy record compatibility: records with NULL division_id continue to work with existing payroll logic
    - Test division deletion: when a division is deleted, attendance records retain NULL division_id and fall back gracefully
    - Test auto-close interaction: auto-close service correctly handles multi-division records
    - _Requirements: 8.5, 7.7_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation language is PHP (Laravel) as established by the existing codebase and design document
- All migrations include proper `down()` methods per project migration hygiene rules
- Error messages use Indonesian (Bahasa Indonesia) as specified in the design's Error Handling section

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "4.5", "5.1"] },
    { "id": 4, "tasks": ["5.2"] },
    { "id": 5, "tasks": ["5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.1", "8.2"] },
    { "id": 7, "tasks": ["8.3"] },
    { "id": 8, "tasks": ["8.4", "8.5", "8.6", "8.7", "8.8"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 10, "tasks": ["10.4"] }
  ]
}
```
