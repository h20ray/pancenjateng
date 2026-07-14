# Requirements Document

## Introduction

Fix a race condition in the POS cashier session "open shift" flow introduced by the frontend performance optimization (PR #82), and polish the cashier session panel UI to follow shadcn design guidelines — consistent spacing, proper padding/margins, and smart dropdown positioning that stays within the viewport.

## Root Cause (Race Condition)

The POS "open shift" flow uses a decoupled event-based architecture:

1. `PosComponentShadcn` → dispatches `window.CustomEvent("cashier-session:open-action")`
2. `CashierSessionPanelShadcn` (inside `BackendNavbarComponent`) → listens for the event in `mounted()`

After PR #82, `BackendNavbarComponent` loads via `defineAsyncComponent()`. On initial navigation to `/admin/pos`, the POS component mounts and renders the shift gate card before the navbar (and its child `CashierSessionPanelShadcn`) finishes loading. The user clicks "Start Cashier Session", the event fires, but no listener exists yet.

## Glossary

- **Shift Gate**: The UI card shown in the POS cart panel when no active cashier session exists, blocking checkout.
- **CashierSessionPanel**: The popover/dialog component in the admin header that handles open/close/handover/daily-close actions.
- **CustomEvent bridge**: The `window.dispatchEvent(new CustomEvent("cashier-session:open-action"))` pattern used to communicate between the POS page and the navbar panel.
- **Smart positioning**: Dropdown/popover behavior where the panel automatically repositions itself to stay within the visible viewport (no overflow off-screen).

## Requirements

### Requirement 1: Backend layout components must be synchronously available on admin routes

**User Story:** As a POS cashier, I want the admin header controls to be immediately available when I navigate to the POS page, so that session management actions work on first click.

#### Acceptance Criteria

1. WHEN a user navigates to any admin route (non-frontend), THE `BackendNavbarComponent` and `BackendMenuComponent` SHALL be fully mounted before the route's page component renders interactive controls.
2. THE `CashierSessionPanelShadcn` event listener SHALL be registered before the POS page's shift gate card becomes interactive.
3. THE frontend layout components (storefront navbar, footer, cart, etc.) SHALL remain lazy-loaded via `defineAsyncComponent()` to preserve the performance gains for storefront users.

### Requirement 2: The "Start Cashier Session" action must reliably open the session dialog

**User Story:** As a POS cashier, I want the "Start Cashier Session" button to always open the session dialog, even if I click it immediately after the page loads.

#### Acceptance Criteria

1. WHEN the user clicks "Start Cashier Session" on the shift gate card, THE cashier session open dialog SHALL appear within 300ms.
2. IF the CustomEvent is dispatched before `CashierSessionPanelShadcn` is mounted (edge case), THE system SHALL retry the event dispatch until the panel acknowledges it or a 2-second timeout elapses.
3. WHEN the 2-second timeout elapses without acknowledgment, THE system SHALL show an error toast: "Cashier session panel not ready. Please try again."
4. AFTER a successful session open, THE POS page SHALL reactively unlock checkout (shift gate disappears) without requiring a page refresh.

### Requirement 3: No regression in storefront/admin performance

**User Story:** As a storefront customer, I want the page to load quickly without downloading admin-specific code.

#### Acceptance Criteria

1. THE storefront initial JS bundle SHALL NOT increase compared to the current state (frontend layout components remain async).
2. THE admin initial JS bundle MAY increase by the size of `BackendNavbarComponent` + `BackendMenuComponent` (previously lazy-loaded, now sync for admin routes).
3. THE `app.js` entry point size SHALL NOT exceed 400KB (currently 347KB; adding back ~50KB for backend layout is acceptable).

### Requirement 4: Cashier session panel dropdown must use smart viewport-aware positioning

**User Story:** As a POS cashier, I want the cashier session dropdown menu to always appear within the visible screen area, so I can see and interact with all options without scrolling or losing content off-screen.

#### Acceptance Criteria

1. WHEN the cashier session panel dropdown opens, THE dropdown SHALL position itself within the visible viewport boundaries.
2. IF the dropdown would overflow below the viewport bottom, THE dropdown SHALL reposition above the trigger button or constrain its height with internal scrolling.
3. IF the dropdown would overflow to the right of the viewport, THE dropdown SHALL align to the right edge of the trigger (already `right-0`) or shift left to stay visible.
4. THE dropdown SHALL use Radix Vue's `Popover` component (from shadcn-vue) instead of a manually positioned `Card` with `absolute` CSS, to get automatic viewport-aware positioning for free.

### Requirement 5: Consistent spacing and padding following shadcn guidelines

**User Story:** As a POS cashier, I want the cashier session UI to have consistent, comfortable spacing that matches the rest of the admin interface.

#### Acceptance Criteria

1. THE cashier session panel popover content SHALL use `p-4` padding (16px) consistently, with `space-y-3` (12px) between logical sections.
2. THE session summary grid items SHALL use `p-2.5` padding (10px) with `gap-2` (8px) between grid cells.
3. THE action buttons SHALL use `py-2.5 px-3` padding with `gap-2.5` (10px) between the badge and text, and `space-y-1` (4px) between buttons.
4. THE dialog form fields SHALL use `space-y-4` (16px) between field groups, with labels using `text-sm font-medium` and `mb-1.5` margin-bottom.
5. THE shift gate card in the cart panel SHALL use `p-4` padding with `gap-3` between icon and text, and `mt-0` (no extra top margin) to sit flush with the cart panel content.
6. THE dialog card SHALL use consistent `p-5` header padding and `p-5 pt-0` content padding (matching shadcn Dialog conventions).
7. ALL form inputs in the dialog SHALL use the shadcn `Input` component (or matching classes: `h-10 rounded-md border border-input bg-background px-3 py-2 text-sm`) with consistent sizing.
