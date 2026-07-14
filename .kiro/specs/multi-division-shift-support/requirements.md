# Requirements Document

## Introduction

This feature enables employees to work multiple shifts across different divisions on the same day ("double desk" / "double division"). Currently, the system enforces a single attendance record per employee per day via a `unique(user_id, work_date)` constraint. This feature lifts that restriction to allow up to two attendance records per day (one per division), with each record independently governed by the rules of its respective division.

## Glossary

- **Attendance_System**: The attendance module responsible for clock-in, clock-out, payroll calculation, and policy resolution
- **Policy_Resolver**: The service (`AttendancePolicyResolver`) that determines the effective shift, rate, grace period, and rules for a given employee, date, and division context
- **Clock_Service**: The service (`AttendanceClockService`) that handles clock-in and clock-out operations
- **Payroll_Service**: The service (`AttendancePayrollService`) that calculates duration, lateness, overtime, penalty, and pay for an attendance record
- **Weekly_Schedule**: A published schedule (`attendance_weekly_schedules`) that defines which shifts an employee works on which days, scoped per division
- **Division**: An organizational unit to which employees can belong; each division may have its own shift settings, hourly rates, overtime rules, and penalty rules
- **Attendance_Record**: A single row in the `attendances` table representing one clock-in/clock-out session for a specific employee, date, and division
- **Penalty_Rule**: A rule (`attendance_penalty_rules`) defining the penalty amount applied when an employee is late beyond a threshold
- **Overtime_Rule**: A rule (`attendance_overtime_rules`) defining the multiplier and threshold for overtime pay calculation
- **Primary_Division**: The division marked with `is_primary = true` in the `employee_divisions` pivot table

## Requirements

### Requirement 1: Multi-Division Attendance Schema

**User Story:** As a system administrator, I want the attendance table to support multiple records per employee per day (one per division), so that employees working across divisions have independent attendance tracking.

#### Acceptance Criteria

1. THE Attendance_System SHALL store a nullable `division_id` foreign key (referencing the `divisions` table) on each Attendance_Record, where NULL indicates a legacy record created before multi-division support
2. THE Attendance_System SHALL enforce a unique constraint on `(user_id, work_date, division_id)` where only non-NULL `division_id` combinations are guaranteed unique (NULL values are excluded from duplicate prevention by standard SQL behavior)
3. IF an employee already has 2 Attendance_Records for the same work_date, THEN THE Attendance_System SHALL reject the creation of an additional record with an error message indicating the daily maximum has been reached
4. WHEN an Attendance_Record is created and the employee belongs to exactly one division, THE Attendance_System SHALL automatically associate that division's ID with the record
5. WHEN an Attendance_Record is created and the employee belongs to multiple divisions, THE Attendance_System SHALL require the division_id to be explicitly provided in the request

### Requirement 2: Division Auto-Detection at Clock-In

**User Story:** As an employee, I want the system to automatically determine which division I am clocking in for based on my published weekly schedule, so that I do not need to manually select a division.

#### Acceptance Criteria

1. WHEN an employee clocks in, THE Clock_Service SHALL identify the target division by finding the employee's published Weekly_Schedule entries for the current day (day-of-week) whose associated shift_setting start_time is at most 120 minutes before or after the current time
2. WHEN the employee has exactly one published Weekly_Schedule entry matching the current time window in one division, THE Clock_Service SHALL use that division as the clock-in target
3. IF the employee has published Weekly_Schedule entries in multiple divisions for the current day and exactly one division has no completed attendance record for today, THEN THE Clock_Service SHALL select that unattended division as the clock-in target
4. IF the employee has published Weekly_Schedule entries in multiple divisions for the current day and more than one division has no completed attendance record for today, THEN THE Clock_Service SHALL select the division whose shift start_time is closest to the current time
5. IF no published Weekly_Schedule entry exists for the current day and time window, THEN THE Clock_Service SHALL fall back to the employee's Primary_Division (the division marked is_primary in employee_divisions)
6. IF the division cannot be determined from the schedule or primary assignment, THEN THE Clock_Service SHALL return a descriptive error indicating that no scheduled shift was found and reject the clock-in attempt

### Requirement 3: Concurrent Open Attendance Handling

**User Story:** As an employee working double shifts, I want to be able to clock in for a second division after completing my first shift, so that both shifts are tracked independently.

#### Acceptance Criteria

1. WHEN an employee attempts to clock in and an open Attendance_Record (status `clocked_in`) exists for a different division, THE Clock_Service SHALL reject the clock-in and return an error message indicating the employee must clock out from the current open session first
2. WHEN an employee attempts to clock in and all existing Attendance_Records for the same work_date have a terminal status (`completed` or `missed_check_out`) and were recorded for a different division, THE Clock_Service SHALL allow the clock-in and create a new Attendance_Record for the employee's current division
3. WHEN an employee attempts to clock in and a terminal Attendance_Record (status `completed` or `missed_check_out`) already exists for the same division on the same work_date, THE Clock_Service SHALL reject the clock-in and return an error message indicating that attendance for this division has already been recorded
4. WHEN an employee attempts to clock in and 2 Attendance_Records already exist for the same work_date regardless of status or division, THE Clock_Service SHALL reject the clock-in and return an error message indicating the daily limit of 2 shifts has been reached
5. IF multiple rejection conditions from criteria 1, 3, and 4 apply simultaneously, THEN THE Clock_Service SHALL evaluate in this order: open session check (criterion 1) first, then daily limit check (criterion 4), then same-division duplicate check (criterion 3), and return the error for the first matching condition
6. IF the Clock_Service rejects a clock-in due to any condition in criteria 1, 3, or 4, THEN THE Clock_Service SHALL NOT create or modify any Attendance_Record

### Requirement 4: Division-Scoped Overtime Rules

**User Story:** As a system administrator, I want overtime rules to be configurable per division with a fallback to global rules, so that each division can have its own overtime policy.

#### Acceptance Criteria

1. THE Attendance_System SHALL support a nullable `division_id` foreign key on Overtime_Rule records, where a null value designates the rule as a global (non-division-specific) rule
2. WHEN calculating overtime for an Attendance_Record, THE Payroll_Service SHALL resolve the applicable Overtime_Rule by selecting the active rule scoped to the Attendance_Record's division_id whose effective_from date is on or before the work_date, ordered by effective_from descending (latest effective rule wins)
3. IF no active division-scoped Overtime_Rule is found for the Attendance_Record's division_id, THEN THE Payroll_Service SHALL fall back to the active global Overtime_Rule (where division_id is null) using the same effective_from date ordering
4. IF no active Overtime_Rule is found after both division-scoped and global resolution, THEN THE Payroll_Service SHALL set the overtime_amount to 0 for that Attendance_Record
5. THE Payroll_Service SHALL resolve the Overtime_Rule independently per Attendance_Record, using each record's own division_id, so that two records for the same employee on the same day may apply different Overtime_Rules

### Requirement 5: Division-Scoped Penalty Rules

**User Story:** As a system administrator, I want penalty rules to be configurable per division with a fallback to global rules, so that each division can have its own lateness policy.

#### Acceptance Criteria

1. THE Attendance_System SHALL support an optional nullable `division_id` foreign key on Penalty_Rule records, where a null value indicates a global rule applicable to all divisions
2. WHEN calculating penalties for an Attendance_Record, THE Payroll_Service SHALL resolve the applicable Penalty_Rule by selecting the active Penalty_Rule scoped to the Attendance_Record's division_id whose `effective_from` date is on or before the work date, ordered by most recent `effective_from` first then by latest ID
3. IF no active division-scoped Penalty_Rule is found for the Attendance_Record's division_id, THEN THE Payroll_Service SHALL fall back to the active global Penalty_Rule (where division_id is null) using the same `effective_from` date ordering
4. IF no active Penalty_Rule is found at either division or global scope, THEN THE Payroll_Service SHALL apply a penalty amount of 0 to the Attendance_Record
5. THE Payroll_Service SHALL apply the resolved Penalty_Rule independently to each Attendance_Record based on that record's division_id

### Requirement 6: Division-Aware Policy Resolution

**User Story:** As a developer, I want the policy resolver to accept a division context parameter, so that it resolves the correct shift, rate, and grace period for a specific division rather than always defaulting to the primary division.

#### Acceptance Criteria

1. THE Policy_Resolver SHALL accept an optional `division_id` parameter (nullable integer) in its `resolve` method, after the existing `$date` parameter
2. WHEN a non-null `division_id` parameter is provided, THE Policy_Resolver SHALL use that division_id for all division-dependent resolution steps (shift, grace period, hourly rate, is_required, and has_fixed_hours_shift) instead of deriving the division from the employee's MandatoryAttendanceConfig, user.division_id, or pivot assignments
3. WHEN a non-null `division_id` parameter is provided, THE Policy_Resolver SHALL still resolve the Weekly_Schedule by employee_id and week_start_date as normal, and if the schedule assigns a specific shift_setting_id for the date, that shift takes priority over the division-level shift lookup
4. WHEN a non-null `division_id` parameter is provided and no division-specific shift or rate configuration exists for that division_id, THE Policy_Resolver SHALL fall back through the standard priority chain (role → global) without re-deriving a different division
5. IF a non-null `division_id` parameter is provided and no Division record exists for that id, THEN THE Policy_Resolver SHALL treat the division_id as absent and fall back to the standard derivation chain (config → user → primary pivot → first pivot)
6. WHEN the `division_id` parameter is null or omitted, THE Policy_Resolver SHALL derive the division using the existing chain: MandatoryAttendanceConfig.division_id → user.division_id → primary pivot division → first pivot division

### Requirement 7: Independent Payroll Calculation Per Attendance Record

**User Story:** As a payroll administrator, I want each attendance record to be calculated independently using its own division's rules, so that employees are paid correctly for each shift.

#### Acceptance Criteria

1. WHEN clock-out occurs, THE Payroll_Service SHALL calculate duration_minutes, late_minutes, overtime_minutes, penalty_amount, overtime_amount, and hourly_rate_applied using the division_id stored on the Attendance_Record rather than the employee's current primary division
2. THE Payroll_Service SHALL resolve the hourly rate for each Attendance_Record by querying the rate hierarchy (employee-specific rate → division default_hourly_rate or division-scoped AttendanceHourlyRate → role-scoped AttendanceHourlyRate → global AttendanceHourlyRate) using that record's division_id, and store the resolved rate in hourly_rate_applied
3. THE Payroll_Service SHALL resolve the shift setting for lateness and overtime threshold calculation by querying AttendanceShiftSetting scoped to the Attendance_Record's division_id (with fallback to role → global), and use the resolved shift's start_time and grace_minutes for late_minutes computation
4. THE Payroll_Service SHALL resolve the penalty rule for each Attendance_Record by selecting the active AttendancePenaltyRule scoped to the record's division_id where effective_from ≤ work_date, falling back to the active global penalty rule (division_id IS NULL) if no division-scoped rule exists
5. THE Payroll_Service SHALL resolve the overtime rule for each Attendance_Record by selecting the active AttendanceOvertimeRule scoped to the record's division_id where effective_from ≤ work_date, falling back to the active global overtime rule (division_id IS NULL) if no division-scoped rule exists
6. WHEN the Payroll_Service resolves rules for an Attendance_Record, THE Payroll_Service SHALL store the resolved applied_penalty_rule_id, applied_overtime_rule_id, and applied_hourly_rate_id on that Attendance_Record before persisting calculated amounts
7. IF the Attendance_Record's division_id is NULL, THEN THE Payroll_Service SHALL resolve all rules using the employee's primary division_id (from MandatoryAttendanceConfig or User model), and if that is also NULL, use global rules only
8. WHEN determining whether an Attendance_Record uses fixed-hours shift logic, THE Payroll_Service SHALL check the has_fixed_hours_shift flag on the division referenced by the Attendance_Record's division_id, not the employee's current primary division

### Requirement 8: Daily Shift Limit Enforcement

**User Story:** As a system administrator, I want to enforce a maximum of 2 shifts per employee per day, so that scheduling remains manageable and compliant with labor policies.

#### Acceptance Criteria

1. THE Attendance_System SHALL enforce a hard limit of 2 Attendance_Records per employee per work_date, counting records in any status (pending, clocked_in, completed, missed_check_out)
2. WHEN a clock-in attempt would exceed 2 Attendance_Records for the same employee and work_date, THE Clock_Service SHALL reject the request with an error message indicating the daily shift limit has been reached
3. THE Attendance_System SHALL count all Attendance_Records for the employee on that work_date regardless of which division each record belongs to
4. WHILE an employee has 2 existing Attendance_Records for a work_date, THE Clock_Service SHALL prevent any additional self-service clock-in attempts for that date
5. IF a manager with the `attendance` permission manually creates an Attendance_Record for an employee who already has 2 records on that work_date, THEN THE Attendance_System SHALL allow the record to be created, bypassing the daily limit
