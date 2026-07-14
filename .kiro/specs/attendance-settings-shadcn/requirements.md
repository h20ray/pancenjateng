# Requirements Document

## Introduction

Migrate the `AttendanceSettingsComponent.vue` from Options API with custom CSS to Composition API (`<script setup>`) using shadcn-vue primitives and Tailwind CSS utilities. The component manages attendance configuration including role-based attendance rules, late penalty settings, geofence location enforcement, and overtime rules. All existing functionality must be preserved while adopting the project's modern UI conventions.

## Glossary

- **Settings_Page**: The `AttendanceSettingsComponent.vue` component that renders the attendance configuration interface
- **Role_Rule_Card**: A card displaying a single employee role's attendance configuration (schedule, rate, status)
- **Geofence_Form**: The form section for configuring location-based clock-in/clock-out enforcement
- **Penalty_Form**: The form section for configuring late arrival penalty rules
- **Overtime_Form**: The form section for configuring overtime calculation rules
- **Schedule_Editor**: The dialog-based interface for editing per-day work schedules for a role
- **Summary_Bar**: The row of metric cards showing attendance configuration overview stats
- **Settings_Store**: The Pinia store (`useAttendanceSettingsStore`) that manages attendance settings state and API calls
- **shadcn_Primitive**: A UI component from `resources/js/components/ui/` (Card, Button, Switch, Input, Label, Select, Dialog, Tabs, Badge)

## Requirements

### Requirement 1: Composition API Migration

**User Story:** As a developer, I want the attendance settings component rewritten using `<script setup>` Composition API, so that it follows the project's modern Vue conventions and is easier to maintain.

#### Acceptance Criteria

1. THE Settings_Page SHALL use `<script setup>` syntax with no Options API (`export default {}`) block
2. THE Settings_Page SHALL use `ref()` and `computed()` from Vue for reactive state management
3. THE Settings_Page SHALL access the Settings_Store directly via `useAttendanceSettingsStore()` composable pattern
4. THE Settings_Page SHALL use `watch()` from Vue to synchronize local form state with store data
5. THE Settings_Page SHALL use `onMounted()` lifecycle hook to trigger initial data fetch

### Requirement 2: shadcn-vue Component Adoption

**User Story:** As a developer, I want all form controls and layout containers to use shadcn-vue primitives, so that the page is visually consistent with the rest of the admin panel.

#### Acceptance Criteria

1. THE Settings_Page SHALL use Card, CardHeader, CardTitle, and CardContent for all panel containers
2. THE Settings_Page SHALL use Button from shadcn-vue for all interactive buttons (submit, edit, schedule tools)
3. THE Settings_Page SHALL use Input and Label from shadcn-vue for all text and number fields
4. THE Settings_Page SHALL use Switch from shadcn-vue for all boolean toggle controls
5. THE Settings_Page SHALL use Tabs, TabsList, TabsTrigger, and TabsContent for the settings navigation
6. THE Settings_Page SHALL use Dialog, DialogContent, DialogHeader, and DialogTitle for the role rule editor modal
7. THE Settings_Page SHALL use Badge from shadcn-vue for status indicators (active/off pills)
8. THE Settings_Page SHALL use Checkbox from shadcn-vue for day-of-week toggles in the Schedule_Editor
9. THE Settings_Page SHALL import all shadcn-vue components from `"../../ui"` barrel export

### Requirement 3: Custom CSS Elimination

**User Story:** As a developer, I want all custom CSS removed and replaced with Tailwind utilities, so that the component has zero scoped style blocks and follows the project's styling conventions.

#### Acceptance Criteria

1. THE Settings_Page SHALL contain no `<style>` block (scoped or unscoped)
2. THE Settings_Page SHALL use Tailwind CSS utility classes for all spacing, typography, colors, and layout
3. THE Settings_Page SHALL use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoint-based layout changes
4. THE Settings_Page SHALL use CSS variables from the project's design tokens (e.g., `hsl(var(--primary))`) only via Tailwind's theme integration (e.g., `text-primary`, `bg-muted`)

### Requirement 4: Summary Bar Display

**User Story:** As an admin, I want to see a quick overview of attendance configuration status at the top of the page, so that I can assess the current setup at a glance.

#### Acceptance Criteria

1. THE Summary_Bar SHALL display four metric cards: required roles count, active schedules count, late penalty status, and geofence status
2. THE Summary_Bar SHALL use a responsive grid layout that shows 4 columns on desktop, 2 columns on tablet, and 1 column on mobile
3. WHEN attendance data is loading, THE Summary_Bar SHALL display Skeleton placeholders for each metric card
4. THE Summary_Bar SHALL use Card components for each metric item

### Requirement 5: Role Rules Tab

**User Story:** As an admin, I want to view and edit attendance rules per employee role, so that I can configure which roles require attendance tracking and their schedules.

#### Acceptance Criteria

1. THE Settings_Page SHALL display role rules in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
2. WHEN no role rules exist, THE Settings_Page SHALL display an empty state message inside a Card
3. WHEN the admin clicks the edit button on a Role_Rule_Card, THE Settings_Page SHALL open the Schedule_Editor dialog pre-filled with that role's data
4. THE Role_Rule_Card SHALL display: role name, attendance requirement status (Badge), hourly rate, today's schedule, and active work days count
5. THE Role_Rule_Card SHALL use Card component with hover state styling via Tailwind classes

### Requirement 6: Schedule Editor Dialog

**User Story:** As an admin, I want to edit a role's weekly schedule in a modal dialog, so that I can configure start/end times and grace periods per day.

#### Acceptance Criteria

1. THE Schedule_Editor SHALL display one row per day of the week with: day toggle (Checkbox), day name, start time (Input type time), end time (Input type time), and grace minutes (Input type number)
2. THE Schedule_Editor SHALL provide bulk action buttons: copy Monday to weekdays, copy Monday to all days, and disable weekend
3. WHEN a day is toggled off, THE Schedule_Editor SHALL disable the time and grace inputs for that day
4. THE Schedule_Editor SHALL include switches for "Rule Active" and "Required Attendance" toggles
5. THE Schedule_Editor SHALL include an hourly rate input field
6. WHEN the admin submits the Schedule_Editor form, THE Settings_Page SHALL call the Settings_Store saveRoleRule action and show a success or error toast
7. THE Schedule_Editor SHALL use Dialog component with a max-width constraint and scrollable content area

### Requirement 7: Late Penalty Form

**User Story:** As an admin, I want to configure late arrival penalty rules, so that employees are penalized consistently for tardiness.

#### Acceptance Criteria

1. THE Penalty_Form SHALL include fields for: rule name, late threshold minutes, initial penalty amount, cap threshold minutes, cap penalty amount, and active toggle
2. WHEN the admin submits the Penalty_Form, THE Settings_Page SHALL call the Settings_Store savePenalty action and show a success or error toast
3. THE Penalty_Form SHALL use a two-column grid layout on desktop that collapses to single column on mobile
4. THE Penalty_Form SHALL pre-populate with existing penalty data from the Settings_Store

### Requirement 8: Geofence Location Form

**User Story:** As an admin, I want to configure location-based attendance enforcement, so that employees can only clock in/out within a defined radius.

#### Acceptance Criteria

1. THE Geofence_Form SHALL include fields for: radius in meters (Input type number), enforce clock-in toggle (Switch), enforce clock-out toggle (Switch), and active toggle (Switch)
2. WHEN the admin submits the Geofence_Form, THE Settings_Page SHALL call the Settings_Store saveGeofenceSetting action and show a success or error toast
3. THE Geofence_Form SHALL pre-populate with existing geofence data from the Settings_Store

### Requirement 9: Overtime Form

**User Story:** As an admin, I want to configure overtime calculation rules, so that extra work hours are tracked correctly.

#### Acceptance Criteria

1. THE Overtime_Form SHALL include fields for: active toggle (Switch), rule name (Input), and overtime start threshold in minutes (Input type number)
2. WHEN the admin submits the Overtime_Form, THE Settings_Page SHALL call the Settings_Store saveOvertime action and show a success or error toast
3. THE Overtime_Form SHALL pre-populate with existing overtime data from the Settings_Store

### Requirement 10: Loading and Error States

**User Story:** As an admin, I want clear feedback when data is loading or when a save operation fails, so that I understand the system state.

#### Acceptance Criteria

1. WHILE data is being fetched, THE Settings_Page SHALL display a LoadingOverlay component
2. IF a save operation fails, THEN THE Settings_Page SHALL display an error toast with the server error message
3. WHEN a save operation succeeds, THE Settings_Page SHALL display a success toast confirmation

### Requirement 11: Accessibility and Touch Targets

**User Story:** As a user on a mobile device, I want all interactive elements to be easily tappable, so that I can use the settings page without mis-taps.

#### Acceptance Criteria

1. THE Settings_Page SHALL ensure all interactive elements (buttons, switches, checkboxes, tab triggers) have a minimum touch target of 44px height
2. THE Settings_Page SHALL use semantic HTML elements (form, fieldset, label associations) for screen reader compatibility
3. THE Settings_Page SHALL provide aria-label attributes on time inputs and number inputs that lack visible adjacent labels
4. THE Settings_Page SHALL maintain logical tab order through all form sections

### Requirement 12: Mobile-First Responsive Layout

**User Story:** As an admin using a mobile device, I want the settings page to be fully usable on small screens, so that I can manage attendance settings from any device.

#### Acceptance Criteria

1. THE Settings_Page SHALL use a mobile-first approach where the base layout is single-column
2. THE Settings_Page SHALL expand to multi-column layouts at `md:` (768px) and `lg:` (1024px) breakpoints
3. WHILE the viewport is below 640px, THE Settings_Page SHALL stack form action buttons vertically at full width
4. WHILE the viewport is below 768px, THE Schedule_Editor SHALL display schedule rows in a stacked single-column layout
