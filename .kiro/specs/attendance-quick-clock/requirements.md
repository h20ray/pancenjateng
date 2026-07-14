# Requirements Document

## Introduction

Optimasi flow absensi (clock-in/clock-out) karyawan agar hanya membutuhkan 1-2 klik. Saat ini karyawan harus menekan tombol "validasi lokasi" secara manual sebelum bisa melanjutkan. Fitur ini menghilangkan langkah manual tersebut dengan melakukan validasi geolokasi secara otomatis saat halaman dimuat, sehingga karyawan langsung bisa mengambil foto dan submit absensi.

## Glossary

- **Attendance_Page**: Halaman self-service absensi karyawan (`AttendanceSelfComponent.vue`) yang digunakan untuk clock-in dan clock-out
- **Geolocation_Service**: Browser Geolocation API yang menyediakan koordinat GPS perangkat karyawan
- **Location_Validator**: Backend endpoint (`admin/attendance/validate-location`) yang memvalidasi apakah koordinat karyawan berada dalam radius geofence yang diizinkan
- **Geofence**: Area geografis yang ditentukan admin sebagai lokasi kerja yang valid, didefinisikan oleh titik pusat dan radius
- **Camera_Capture**: Komponen UI yang mengakses kamera perangkat untuk mengambil foto bukti kehadiran
- **Quick_Clock_Flow**: Alur absensi yang dioptimasi: page load → auto-validate lokasi → capture foto → submit

## Requirements

### Requirement 1: Auto-validate Geolocation on Page Load

**User Story:** As a karyawan, I want my location to be validated automatically when I open the attendance page, so that I don't have to manually click a "validate location" button.

#### Acceptance Criteria

1. WHEN the Attendance_Page is mounted and the attendance state requires clock-in or clock-out, THE Geolocation_Service SHALL request the device coordinates automatically without user interaction within 500 milliseconds of mount completion
2. WHEN coordinates are obtained, THE Location_Validator SHALL validate the coordinates against the configured Geofence by calling the backend validation endpoint with the action type (clock_in or clock_out), latitude, and longitude
3. WHILE the Geolocation_Service is obtaining coordinates (locationState is "loading"), THE Attendance_Page SHALL display a loading skeleton state indicating location validation is in progress and disable the attendance submission button
4. WHEN the Location_Validator confirms the coordinates are within the Geofence, THE Attendance_Page SHALL transition to the camera-ready state within 1 second of receiving the validation response
5. IF the Geolocation_Service fails to obtain coordinates within 10 seconds or the device does not support geolocation, THEN THE Attendance_Page SHALL transition locationState to "failed" and display an error message indicating the failure reason
6. IF the Location_Validator returns a geofence violation (coordinates outside the configured radius) and enforcement is active for the current action, THEN THE Attendance_Page SHALL transition locationState to "failed", display an error message from the backend response, and prevent attendance submission
7. WHEN locationState is "failed", THE Attendance_Page SHALL display a retry control that allows the karyawan to re-trigger location validation without reloading the page

### Requirement 2: Block Actions When Location is Invalid

**User Story:** As a business owner, I want employees outside the allowed geofence to be blocked from submitting attendance, so that attendance fraud is prevented.

#### Acceptance Criteria

1. WHEN the Location_Validator determines coordinates are outside the Geofence, THE Attendance_Page SHALL display a destructive error state showing the distance from the allowed area in whole meters formatted with Indonesian locale (e.g., "1.250 m")
2. WHILE the location is invalid, THE Attendance_Page SHALL hide the Camera_Capture UI and the submit button so that the employee cannot proceed with attendance submission
3. WHEN the location is invalid, THE Attendance_Page SHALL provide a "Retry" button that re-triggers the Geolocation_Service and Location_Validator, transitioning to the loading skeleton state during re-validation
4. WHEN the Retry validation succeeds and coordinates are within the Geofence, THE Attendance_Page SHALL transition to the camera-ready state within 1 second of receiving the response
5. IF the Geofence setting is inactive (is_active is false), THEN THE Attendance_Page SHALL skip location validation and proceed directly to the camera-ready state without blocking

### Requirement 3: Handle Geolocation Errors Gracefully

**User Story:** As a karyawan, I want clear feedback when my device cannot provide location data, so that I know what action to take.

#### Acceptance Criteria

1. IF the Geolocation_Service is not supported by the browser, THEN THE Attendance_Page SHALL display an error message indicating the browser does not support geolocation and SHALL disable the attendance submit button
2. IF the user denies the geolocation permission prompt, THEN THE Attendance_Page SHALL display an error message with instructions to enable location permissions in device settings and SHALL disable the attendance submit button
3. IF the Geolocation_Service times out after 10 seconds, THEN THE Attendance_Page SHALL display a timeout error message and SHALL present a "Retry" button that re-initiates the geolocation request when pressed
4. IF the Geolocation_Service returns a position unavailable error (GPS disabled or hardware failure), THEN THE Attendance_Page SHALL display an error message indicating the device cannot determine location and SHALL present a "Retry" button that re-initiates the geolocation request when pressed
5. IF the Location_Validator backend request fails due to network error, THEN THE Attendance_Page SHALL display a connection error message and SHALL present a "Retry" button that re-sends the validation request to the backend using the previously captured coordinates
6. WHILE the Attendance_Page is displaying a geolocation error state, THE Attendance_Page SHALL preserve any previously captured photo and camera state so the user does not need to retake their photo after resolving the location issue

### Requirement 4: Streamlined Photo Capture After Valid Location

**User Story:** As a karyawan, I want the camera to be ready immediately after my location is validated, so that I can complete attendance in minimal steps.

#### Acceptance Criteria

1. WHEN the location validation returns locationState "ready", THE Attendance_Page SHALL automatically invoke the camera initialization (equivalent to startAttendanceCamera) within 500 milliseconds without requiring the user to tap a separate "Open Camera" button
2. WHEN the Camera_Capture is active and cameraState is "ready", THE Attendance_Page SHALL display a single "Capture" button to take the attendance photo
3. WHEN a photo is captured successfully, THE Attendance_Page SHALL display the photo preview with a "Submit" button and a "Retake" button, and SHALL hide the video feed
4. THE Camera_Capture SHALL request the front-facing camera (facingMode: "user") by default
5. IF the front-facing camera is unavailable or camera permission is denied after automatic initialization, THEN THE Attendance_Page SHALL display the camera area in idle state with a manual "Open Camera" button and show an error notification indicating the failure reason
6. IF camera initialization does not produce a video stream within 10 seconds of being invoked, THEN THE Attendance_Page SHALL stop the initialization attempt, set cameraState to "failed", and display an error notification to the user

### Requirement 5: One-Tap Submit After Photo Capture

**User Story:** As a karyawan, I want to submit my attendance with a single tap after taking my photo, so that the entire flow takes 1-2 clicks maximum.

#### Acceptance Criteria

1. WHEN a photo is captured and location has been successfully acquired (GPS coordinates obtained and geofence validation passed, if enforced), THE Attendance_Page SHALL enable the submit button without requiring additional user interaction
2. WHEN the submit button is pressed, THE Attendance_Page SHALL send the captured photo and the validated GPS coordinates (latitude and longitude) to the clock-in endpoint if the user has not yet clocked in today, or to the clock-out endpoint if the user is currently clocked in
3. WHILE the submission is in progress, THE Attendance_Page SHALL display a loading indicator on the submit button and disable all buttons and navigation links on the page to prevent duplicate submissions
4. WHEN the submission succeeds, THE Attendance_Page SHALL display a success message indicating whether clock-in or clock-out was recorded, and navigate to the admin dashboard if the user has dashboard access permission, or to the home page otherwise
5. IF the submission fails due to a network error or server rejection, THEN THE Attendance_Page SHALL display an error message indicating the failure reason, re-enable the submit button, and preserve the captured photo and location so the user can retry without recapturing
6. IF the submission fails because the attendance state has changed on the server (e.g., shift already completed or clock-out no longer available), THEN THE Attendance_Page SHALL refresh the current attendance state from the server and display the updated status to the user

### Requirement 6: Mobile-First UI with shadcn-vue Components

**User Story:** As a karyawan using a phone, I want the attendance page to be clean and easy to use on mobile, so that I can clock in quickly without confusion.

#### Acceptance Criteria

1. THE Attendance_Page SHALL use shadcn-vue Card, Button, and Badge components from `resources/js/components/ui/` for all panel containers, action triggers, and status indicators respectively
2. THE Attendance_Page SHALL use Tailwind CSS utility classes for spacing and layout, applying styles at the default (mobile) breakpoint first and adding responsive overrides via `sm:` (640px) and `md:` (768px) prefixes for larger viewports
3. WHEN the attendance state is loading, THE Attendance_Page SHALL display a Skeleton placeholder in place of the main content panel; WHEN location is validated successfully, THE Attendance_Page SHALL display a Badge with variant "success"; WHEN location validation fails, THE Attendance_Page SHALL display a Badge with variant "destructive"; WHEN a system error occurs during state fetch, THE Attendance_Page SHALL display a Card with variant "destructive" containing an error message indicating the failure reason
4. THE Attendance_Page SHALL maintain a maximum content width of 720px centered horizontally on screen, with a minimum horizontal padding of 16px on viewports narrower than 768px
5. THE Attendance_Page SHALL ensure all interactive elements (buttons, links, and tappable controls) have a minimum touch target size of 44×44 CSS pixels for accessibility compliance
6. THE Attendance_Page SHALL render all body text at a minimum font size of 16px on viewports narrower than 768px to ensure readability without user zooming
7. WHEN the Attendance_Page is rendered on a viewport narrower than 768px, THE Attendance_Page SHALL display all primary action elements in a single-column stacked layout with a minimum vertical gap of 12px between interactive elements

### Requirement 7: Preserve Clock-Out Mode Behavior

**User Story:** As a karyawan who is clocking out, I want the same streamlined flow to apply for clock-out, so that ending my shift is equally fast.

#### Acceptance Criteria

1. WHEN the user captures location while the attendance state indicates clock-out mode (can_clock_out is true), THE Attendance_Page SHALL validate location by sending the "clock_out" action parameter to the location validation endpoint
2. WHILE the attendance state indicates clock-out mode, THE Attendance_Page SHALL display the live shift duration (formatted as hours and minutes) and the clock-in time above the Camera_Capture UI
3. WHEN clock-out submission succeeds, THE Attendance_Page SHALL display a success feedback message that includes the recorded shift duration
4. WHEN the user initiates clock-out submission, THE Attendance_Page SHALL re-fetch the latest attendance state and proceed only if the re-fetched state confirms can_clock_out is true
5. IF the re-fetched attendance state no longer permits clock-out (can_clock_out is false or attendance ID is invalid), THEN THE Attendance_Page SHALL cancel the submission and display an error message indicating the shift state has changed
