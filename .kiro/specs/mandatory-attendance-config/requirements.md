# Requirements Document

## Introduction

This feature adds a new "Karyawan Wajib Absen" (Mandatory Attendance Employees) tab to the Attendance Settings page. The tab provides a per-employee attendance configuration interface using a flow-based card layout. HR administrators can assign custom roles, weekly schedules, geofence locations, validation methods, and grace periods to individual employees. The feature also introduces custom role creation to support seniority-based differentiation (e.g., "Senior Baker" vs "Junior Baker") beyond the standard system roles.

## Glossary

- **Attendance_Settings_Page**: The existing admin page at the attendance settings route that currently contains tabs for Role Rules, Late Penalty, Attendance Location, and Overtime
- **Mandatory_Tab**: The new "Karyawan Wajib Absen" tab added to the Attendance_Settings_Page, positioned before the existing Role Rules tab
- **Employee_List_Sidebar**: The left panel within the Mandatory_Tab that displays a searchable list of active employees
- **Configuration_Panel**: The main content area within the Mandatory_Tab that displays the flow-based card layout for the selected employee
- **Flow_Card**: A vertically connected card component within the Configuration_Panel, visually linked to adjacent cards via connector lines
- **Role_Card**: The first Flow_Card allowing selection or creation of a custom attendance role for the employee
- **Schedule_Card**: The second Flow_Card displaying a Monday-through-Sunday grid with shift dropdowns for each day
- **Location_Card**: The third Flow_Card for configuring geofence/location restrictions for clock-in
- **Validation_Card**: The fourth Flow_Card for selecting the attendance validation method
- **Grace_Period_Card**: The fifth Flow_Card for configuring late tolerance in minutes
- **Custom_Role**: A user-created attendance role (e.g., "Senior Baker", "Junior Kitchen") that extends beyond the standard system roles and can have distinct hourly rates and schedules
- **Shift_Preset**: A predefined shift time configuration (e.g., "Shift 1 Weekday 05:00-14:00", "Barista Weekend 06:00-13:00")
- **Employee**: A User record that is active, not a customer (role_id != 2), and not a guest (is_guest = 0)
- **Geofence_Mode**: The location restriction mode for clock-in: all branches, specific outlet with radius, or free GPS
- **Validation_Method**: The method used to verify attendance: Selfie + GPS, PIN code, or other supported methods
- **Mandatory_Attendance_Config**: The per-employee configuration record that stores role assignment, weekly schedule, location, validation method, grace period, and optional custom hourly rate
- **Custom_Hourly_Rate**: An employee-specific hourly rate that overrides the role-level rate, used for individual agreements, seniority terms, or probation periods

## Requirements

### Requirement 1: Mandatory Tab Placement

**User Story:** As an HR administrator, I want to see the "Karyawan Wajib Absen" tab on the Attendance Settings page before the Role Rules tab, so that I can quickly access per-employee attendance configuration.

#### Acceptance Criteria

1. WHEN the Attendance_Settings_Page loads, THE Mandatory_Tab SHALL appear as the first tab in the tab list, positioned before the existing Role Rules tab
2. WHEN the Attendance_Settings_Page loads, THE Mandatory_Tab SHALL display the label from the i18n key `attendance.mandatory_employees` in the active locale
3. THE Mandatory_Tab SHALL render using the shadcn-vue TabsTrigger component within the existing TabsList, matching the same minimum touch-target height as the other tab triggers on the page
4. WHEN the Attendance_Settings_Page loads, THE Attendance_Settings_Page SHALL set the Role Rules tab as the default active tab
5. WHEN the user selects the Mandatory_Tab, THE Attendance_Settings_Page SHALL display the corresponding TabsContent area for the mandatory employees panel

### Requirement 2: Employee List Sidebar

**User Story:** As an HR administrator, I want to see a list of active employees in a sidebar panel, so that I can select an employee to configure their attendance rules.

#### Acceptance Criteria

1. WHEN the Mandatory_Tab is active, THE Employee_List_Sidebar SHALL display all active Employee records (status active, role_id != 2, is_guest = 0) in a scrollable list
2. THE Employee_List_Sidebar SHALL display each employee's avatar image and full name, and IF an employee has no avatar image, THEN THE Employee_List_Sidebar SHALL display a placeholder icon with the employee's initials (first letter of first name and first letter of last name)
3. WHEN the HR administrator types in the search input, THE Employee_List_Sidebar SHALL filter the displayed employees using case-insensitive partial matching (contains) against the employee's full name, updating results on each keystroke with a debounce of 300 milliseconds
4. WHEN the HR administrator clicks an employee in the Employee_List_Sidebar, THE Configuration_Panel SHALL display the attendance configuration for that employee
5. THE Employee_List_Sidebar SHALL visually indicate the currently selected employee by applying a distinct background color to that employee's list item, differentiating it from unselected items
6. THE Employee_List_Sidebar SHALL fetch employee data from the existing employee API endpoint
7. IF the employee API request fails, THEN THE Employee_List_Sidebar SHALL display an error message indicating the data could not be loaded and SHALL provide a retry action
8. IF no employees match the current search text, THEN THE Employee_List_Sidebar SHALL display a message indicating no employees were found
9. WHEN the Employee_List_Sidebar first loads with employees available and no employee is currently selected, THE Employee_List_Sidebar SHALL not auto-select any employee, and the Configuration_Panel SHALL display a prompt instructing the HR administrator to select an employee

### Requirement 3: Flow-Based Configuration Layout

**User Story:** As an HR administrator, I want to see the employee's attendance configuration as a vertical flow of connected cards, so that I can understand the configuration steps in sequence.

#### Acceptance Criteria

1. WHEN an employee is selected, THE Configuration_Panel SHALL display five Flow_Card components arranged in top-to-bottom DOM order as follows: Role_Card (step 1), Schedule_Card (step 2), Location_Card (step 3), Validation_Card (step 4), Grace_Period_Card (step 5)
2. WHEN an employee is selected, THE Configuration_Panel SHALL display a numbered circle indicator (1 through 5) on the left side of each Flow_Card corresponding to its step position in the flow
3. WHEN an employee is selected, THE Configuration_Panel SHALL render a vertical connector line between each pair of adjacent Flow_Card components, resulting in exactly 4 connector lines linking the 5 cards in sequence
4. IF no employee is selected, THEN THE Configuration_Panel SHALL display a placeholder message indicating that the HR administrator must select an employee to view the configuration flow

### Requirement 4: Role/Division Card with Custom Role Creation

**User Story:** As an HR administrator, I want to assign a custom attendance role to an employee and create new custom roles, so that I can differentiate seniority levels with different rates and schedules.

#### Acceptance Criteria

1. THE Role_Card SHALL display a dropdown populated with all available roles from the Role Rules system plus any existing Custom_Role entries, with a final option labeled "+ Buat Divisi/Role Baru (Custom)" that triggers the custom role creation flow
2. WHEN the HR administrator selects a role from the dropdown, THE Role_Card SHALL assign that role to the selected employee's Mandatory_Attendance_Config in local state (persisted only when the overall configuration is saved)
3. WHEN the HR administrator selects the "+ Buat Divisi/Role Baru (Custom)" option, THE Role_Card SHALL display an inline input field for entering the new Custom_Role name
4. WHEN the HR administrator submits a Custom_Role name, THE System SHALL validate that the name is not empty after trimming whitespace, does not exceed 50 characters, and is unique across all existing roles (both standard and custom, case-insensitive)
5. IF the Custom_Role name fails validation, THEN THE System SHALL display an error message indicating the specific validation failure (empty name, exceeds length, or duplicate name) and retain the entered text for correction
6. WHEN a Custom_Role is successfully created, THE Role_Card dropdown SHALL include the new Custom_Role immediately without requiring a page reload, and the new role SHALL be automatically selected for the current employee
7. THE Custom_Role SHALL be available in the existing Role Rules tab for schedule and rate configuration after creation without requiring a page reload of the Role Rules tab

### Requirement 5: Weekly Schedule Card

**User Story:** As an HR administrator, I want to assign a shift to each day of the week for an employee, so that the system knows when the employee is expected to work.

#### Acceptance Criteria

1. THE Schedule_Card SHALL display a grid with 7 rows (Monday through Sunday), where each row shows the day name, a native select dropdown for shift selection, and the time range corresponding to the currently selected Shift_Preset
2. THE Schedule_Card SHALL display a shift dropdown for each day populated with all available Shift_Preset options and a "Libur/Off" option, using native HTML select elements
3. THE Schedule_Card SHALL include the following Shift_Preset options: Shift 1 Weekday (05:00-14:00), Shift 2 Weekday (12:00-21:00), Shift 1 Weekend (04:00-13:00), Shift 2 Weekend (11:00-20:00), Barista Weekday (08:00-15:00), Barista Weekend (06:00-13:00), Libur/Off
4. WHEN the HR administrator selects a Shift_Preset for a day, THE Schedule_Card SHALL update the local schedule state for that day without triggering an API call (persistence occurs via the save action in Requirement 10)
5. WHEN the Mandatory_Tab loads an employee with an existing configuration, THE Schedule_Card SHALL display the previously saved shift selections for each day
6. WHEN the Mandatory_Tab loads an employee with no existing schedule configuration, THE Schedule_Card SHALL default all 7 days to "Libur/Off"
7. THE Schedule_Card SHALL visually distinguish weekend rows (Saturday and Sunday) from weekday rows (Monday through Friday) using a different background color
8. WHEN "Libur/Off" is selected for a day, THE Schedule_Card SHALL display no time range for that row

### Requirement 6: Location/Geofencing Card

**User Story:** As an HR administrator, I want to configure where an employee can clock in from, so that attendance is validated against the correct location.

#### Acceptance Criteria

1. THE Location_Card SHALL display a Geofence_Mode selector with options: "all branches", "specific outlet", or "free GPS (mobile)"
2. WHEN the HR administrator selects "specific outlet", THE Location_Card SHALL display a dropdown of branches that have GPS coordinates configured in the system, and a radius input field with a default value of 100 meters
3. THE radius input field SHALL accept only integer values between 50 and 5000 meters
4. WHEN the HR administrator selects a Geofence_Mode, THE Location_Card SHALL store the selected mode and its associated parameters (branch ID and radius for "specific outlet", no additional parameters for "all branches" or "free GPS") in the employee's Mandatory_Attendance_Config
5. WHEN the HR administrator switches from "specific outlet" to another Geofence_Mode, THE Location_Card SHALL clear the branch selection and radius value from the displayed form
6. WHEN the Mandatory_Tab loads an employee with an existing configuration, THE Location_Card SHALL display the previously saved Geofence_Mode and, if the mode is "specific outlet", the saved branch selection and radius value
7. IF the HR administrator selects "specific outlet" and no branches with GPS coordinates exist, THEN THE Location_Card SHALL display a message indicating that no branches are available for geofencing

### Requirement 7: Validation Method Card

**User Story:** As an HR administrator, I want to choose how an employee's attendance is validated, so that the clock-in process matches the operational requirements.

#### Acceptance Criteria

1. THE Validation_Card SHALL display a selector with Validation_Method options: Selfie + GPS, PIN code
2. WHEN the HR administrator selects a Validation_Method, THE Validation_Card SHALL store the selection in the employee's Mandatory_Attendance_Config
3. WHEN the Mandatory_Tab loads an employee with an existing configuration, THE Validation_Card SHALL display the previously saved Validation_Method
4. WHEN the Mandatory_Tab loads an employee with no existing Mandatory_Attendance_Config, THE Validation_Card SHALL default to "Selfie + GPS" selected

### Requirement 8: Grace Period Card

**User Story:** As an HR administrator, I want to set a grace period for an employee before they are marked as late, so that minor delays are tolerated according to company policy.

#### Acceptance Criteria

1. THE Grace_Period_Card SHALL display selectable preset options: 0 minutes, 15 minutes, 30 minutes, and a custom input field for entering a value in whole minutes
2. WHEN the HR administrator selects a preset grace period, THE Grace_Period_Card SHALL store the value in the employee's Mandatory_Attendance_Config
3. WHEN the HR administrator enters a custom grace period value, THE Grace_Period_Card SHALL validate that the value is a non-negative integer between 0 and 120 inclusive
4. IF the HR administrator enters a custom grace period value that fails validation (non-integer, negative, or exceeds 120), THEN THE Grace_Period_Card SHALL display an inline error message indicating the valid range and SHALL NOT store the invalid value
5. WHEN the Mandatory_Tab loads an employee with an existing configuration, THE Grace_Period_Card SHALL display the previously saved grace period value, selecting the matching preset option if the value is 0, 15, or 30, or populating the custom input field otherwise
6. WHEN the Mandatory_Tab loads an employee with no existing Mandatory_Attendance_Config, THE Grace_Period_Card SHALL default to 0 minutes selected

### Requirement 9: Custom Hourly Rate per Employee

**User Story:** As an HR administrator, I want to set a custom hourly rate for a specific employee that overrides the role-level rate, so that I can accommodate individual agreements, seniority terms, or probation rates.

#### Acceptance Criteria

1. THE Configuration_Panel SHALL include an hourly rate input field within the Role_Card or as a dedicated section
2. WHEN the HR administrator enters a custom hourly rate for an employee, THE System SHALL store that rate in the employee's Mandatory_Attendance_Config upon save
3. IF an employee has a non-empty custom hourly rate configured, THEN THE System SHALL use the employee-level rate instead of the role-level rate for attendance calculations
4. IF the custom hourly rate field is empty or cleared, THEN THE System SHALL fall back to the role-level hourly rate from the Role Rules configuration
5. THE custom hourly rate field SHALL accept only numeric values from 0.01 to 999,999,999.99 with up to 2 decimal places, where a value of zero is not permitted as a valid custom rate
6. IF the HR administrator enters a value outside the accepted range or in an invalid format, THEN THE System SHALL display an inline validation error indicating the accepted range and format, and SHALL prevent saving the configuration until the value is corrected or cleared
7. WHEN the Mandatory_Tab loads an employee with an existing Mandatory_Attendance_Config that includes a custom hourly rate, THE custom hourly rate field SHALL display the previously saved rate value

### Requirement 10: Persist Employee Configuration

**User Story:** As an HR administrator, I want to save the complete attendance configuration for an employee, so that the settings are applied to future attendance records.

#### Acceptance Criteria

1. WHEN the HR administrator clicks the save button, THE System SHALL send a single API request that persists the Mandatory_Attendance_Config including role assignment, weekly schedule (7 days), location mode, validation method, grace period, and custom hourly rate atomically — either all fields are saved or none are
2. IF the save API request is in progress, THEN THE System SHALL disable the save button and display a loading indicator to prevent duplicate submissions
3. WHEN the configuration is saved successfully, THE System SHALL display a success toast notification using createToast()
4. IF the save operation fails due to a server error or network failure, THEN THE System SHALL display an error toast notification indicating the failure reason returned by the server, and SHALL retain the unsaved form values so the HR administrator can retry without re-entering data
5. IF the HR administrator clicks save without a role assignment selected, THEN THE System SHALL prevent the save and indicate that role assignment is required
6. WHEN the HR administrator selects a different employee from the Employee_List_Sidebar while the current employee has unsaved changes, THE System SHALL discard the unsaved changes without a confirmation prompt (changes are only persisted via the save button)
7. WHEN the save completes successfully for an employee who had no prior configuration, THE System SHALL create a new Mandatory_Attendance_Config record; WHEN the employee already has a configuration, THE System SHALL update the existing record

### Requirement 11: Custom Role Integration with Role Rules

**User Story:** As an HR administrator, I want custom roles created in the Mandatory Tab to appear in the Role Rules tab, so that I can configure hourly rates and default schedules for those custom roles.

#### Acceptance Criteria

1. WHEN a Custom_Role is created via the Role_Card, THE Custom_Role SHALL appear in the Role Rules tab's role list without requiring a page reload when the HR administrator navigates to the Role Rules tab
2. WHEN the HR administrator opens the Role Rules tab, THE Role Rules schedule editor SHALL allow editing the hourly rate for any Custom_Role using the same input constraints as standard roles (non-negative numeric value with up to 2 decimal places)
3. WHEN the HR administrator opens the Role Rules tab, THE Role Rules schedule editor SHALL allow editing the weekly schedule for any Custom_Role using the same Shift_Preset options available for standard roles
4. WHEN the HR administrator initiates deletion of a Custom_Role that is assigned to one or more employees, THE System SHALL display a confirmation dialog indicating the number of affected employees before proceeding
5. WHEN a Custom_Role deletion is confirmed, THE System SHALL remove the role assignment from any employee's Mandatory_Attendance_Config that references the deleted role, setting the role field to empty (unassigned)
6. WHEN a Custom_Role deletion is confirmed and the role assignment is removed from affected employees, THE System SHALL retain all other configuration fields (schedule, location, validation method, grace period, custom hourly rate) in those employees' Mandatory_Attendance_Config

### Requirement 12: Backend API for Mandatory Attendance Configuration

**User Story:** As a developer, I want dedicated API endpoints for managing per-employee attendance configurations, so that the frontend can persist and retrieve configuration data.

#### Acceptance Criteria

1. THE System SHALL provide a GET endpoint to retrieve the Mandatory_Attendance_Config for a specific employee, returning the employee's role assignment, weekly schedule (7 days with shift IDs), Geofence_Mode, Validation_Method, grace period in minutes, and Custom_Hourly_Rate
2. THE System SHALL provide a POST/PUT endpoint to create or update the Mandatory_Attendance_Config for a specific employee, validating that: role_id exists in the roles table, schedule contains exactly 7 day entries each referencing a valid Shift_Preset ID or null (off), Geofence_Mode is one of the allowed values (all_branches, specific_outlet, free_gps), Validation_Method is one of the allowed values (selfie_gps, pin), grace_period is a non-negative integer between 0 and 120, and custom_hourly_rate (if provided) is a non-negative numeric value with up to 2 decimal places
3. THE System SHALL provide a GET endpoint to list all active employees (status active, not customer role, not guest) with a boolean field indicating whether a Mandatory_Attendance_Config record exists for each employee
4. THE System SHALL provide a POST endpoint to create a new Custom_Role, validating that the role name is a non-empty string of no more than 100 characters and is unique among existing Custom_Role names
5. THE System SHALL provide a GET endpoint to list all available roles (standard roles from Role Rules and Custom_Role entries), returning each role's ID and display name
6. WHEN an unauthorized user attempts to access the configuration endpoints, THE System SHALL return a 403 forbidden response
7. IF the POST/PUT configuration endpoint receives an employee_id that does not correspond to an existing active Employee record, THEN THE System SHALL return a 422 response with an error message indicating the employee was not found
8. IF the POST/PUT configuration endpoint receives a request that fails validation, THEN THE System SHALL return a 422 response with field-level validation error messages
9. THE System SHALL protect all Mandatory_Attendance_Config endpoints with the `permission:attendance-settings` middleware, consistent with the existing attendance setting endpoints

### Requirement 13: Shift Preset Management

**User Story:** As an HR administrator, I want the system to provide predefined shift options based on the company's operational hours, so that I can quickly assign shifts without manual time entry.

#### Acceptance Criteria

1. THE System SHALL seed the following Shift_Preset records into the attendance_shift_settings table: "Shift 1 Weekday" (start_time: 05:00, end_time: 14:00), "Shift 2 Weekday" (start_time: 12:00, end_time: 21:00), "Shift 1 Weekend" (start_time: 04:00, end_time: 13:00), "Shift 2 Weekend" (start_time: 11:00, end_time: 20:00), "Barista Weekday" (start_time: 08:00, end_time: 15:00), "Barista Weekend" (start_time: 06:00, end_time: 13:00), each with grace_minutes set to 15 and is_active set to true
2. WHEN the seeder is executed and a Shift_Preset record with the same name already exists, THE System SHALL skip that record without creating a duplicate or modifying the existing record
3. WHEN a Shift_Preset is referenced by one or more rows in the attendances table via the shift_setting_id foreign key, THE System SHALL prevent deletion of that Shift_Preset and return an error response indicating the preset is currently in use
4. WHEN a Shift_Preset is not referenced by any row in the attendances table, THE System SHALL allow deletion of that Shift_Preset
