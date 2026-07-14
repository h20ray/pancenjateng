# Implementation Plan: POS Cashier Session Fix + UI Polish

## Overview

Fix the race condition between `PosComponentShadcn` and `CashierSessionPanelShadcn`, replace the manually positioned dropdown with Radix `Popover` for smart viewport-aware positioning, and normalize spacing/padding to shadcn conventions.

## Tasks

- [x] 1. Restore synchronous imports for backend layout components
  - [x] 1.1 Revert BackendNavbarComponent and BackendMenuComponent to sync imports
    - In `resources/js/components/DefaultComponent.vue`, change `BackendNavbarComponent` from `defineAsyncComponent(() => import(...))` back to a static `import` statement
    - Do the same for `BackendMenuComponent`, `CommandPaletteComponent`, and `AttendanceShiftPillComponent`
    - Keep ALL frontend layout components as `defineAsyncComponent` (FrontendNavbarComponent, FrontendNavbarComponentShadcn, FrontendFooterComponent, FrontendFooterComponentShadcn, FrontendMobileNavBarComponent, FrontendMobileNavBarComponentShadcn, FrontendMobileAccountComponent, FrontendCartComponent, FrontendCookiesComponent, WhatsappSupportComponent)
    - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 2. Replace manual dropdown with Radix Popover in CashierSessionPanelShadcn
  - [x] 2.1 Convert dropdown to Popover component
    - In `resources/js/components/admin/pos/CashierSessionPanelShadcn.vue`:
    - Import `Popover`, `PopoverTrigger`, `PopoverContent` from `../../ui`
    - Replace the outer `<div ref="menuRoot" class="relative">` + `<Card v-if="menuOpen" class="absolute ...">` pattern with `<Popover v-model:open="menuOpen">`
    - Move the trigger `<Button>` inside `<PopoverTrigger as-child>`
    - Move the dropdown content inside `<PopoverContent align="end" :side-offset="8" class="w-80 p-0">`
    - Remove the `handleOutsideClick` method and its `document.addEventListener` in mounted/beforeUnmount (Popover handles outside clicks automatically)
    - Remove `ref="menuRoot"` (no longer needed)
    - Register `Popover, PopoverTrigger, PopoverContent` in the `components` option
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.2 Normalize spacing inside popover content
    - Structure the popover content with clear sections separated by borders:
      - Header section: `p-4 pb-3 border-b` — flow label + title + badge
      - Summary section (if active): `p-4 pb-3` — grid of stats
      - Actions section: `p-4 pt-2 space-y-1` — action buttons
    - Summary grid cells: change `p-2` to `p-2.5`
    - Action buttons: change `gap-3` to `gap-2.5`, change `py-2 px-3` to `py-2.5 px-3`
    - Action button spacing: keep `space-y-1.5` (already good density)
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Normalize dialog spacing
  - [x] 3.1 Update dialog header and content padding
    - In `CashierSessionPanelShadcn.vue`, in the Teleported dialog section:
    - Change dialog `<CardHeader class="p-4">` to `<CardHeader class="p-5">`
    - Change dialog `<CardContent class="p-4 pt-0">` to `<CardContent class="p-5 pt-0">`
    - Change form field spacing from `space-y-3` to `space-y-4`
    - Change label elements to use `text-sm font-medium mb-1.5` consistently
    - Ensure all `<input>` elements use consistent `h-10 rounded-md` sizing
    - _Requirements: 5.4, 5.6, 5.7_

  - [x] 3.2 Update PosShiftGateCardShadcn spacing
    - In `resources/js/components/admin/pos/PosShiftGateCardShadcn.vue`:
    - Change `<CardContent class="p-3 ...">` to `<CardContent class="p-4 ...">` 
    - Change `<CardFooter class="p-3 pt-0">` to `<CardFooter class="px-4 pb-4 pt-0">`
    - Keep `gap-3` between icon and text (already correct)
    - _Requirements: 5.5_

- [x] 4. Add event acknowledgment to CashierSessionPanelShadcn
  - [x] 4.1 Dispatch ack event in handleExternalAction
    - In `CashierSessionPanelShadcn.vue`, modify `handleExternalAction(event)`:
    - Extract `_requestId` from `event.detail`
    - After extracting action and branch_id, dispatch `window.CustomEvent("cashier-session:open-action-ack", { detail: { _requestId } })`
    - Only dispatch ack if `_requestId` is truthy (backward compat)
    - _Requirements: 2.1, 2.2_

- [x] 5. Add retry logic to POS openCashierShiftFlow
  - [x] 5.1 Implement retry with ack pattern in PosComponentShadcn
    - In `resources/js/components/admin/pos/PosComponentShadcn.vue`, replace `openCashierShiftFlow`:
    - Generate unique `_requestId` per invocation (timestamp + random)
    - Listen for `cashier-session:open-action-ack` with matching `_requestId`
    - If ack not received within 500ms, retry dispatch (max 4 attempts = 2s total)
    - If all attempts exhausted, show error toast via `alertService.error()`
    - Clean up listener after ack or timeout
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.2 Apply same fix to PosComponent.vue (legacy)
    - In `resources/js/components/admin/pos/PosComponent.vue`, apply identical `openCashierShiftFlow` changes
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Verify build and tests
  - [x] 6.1 Run build and verify bundle size
    - Run `npm run build` — confirm `app.js` < 400KB
    - Run `npm run lint` — confirm 0 errors
    - Run `npm run typecheck` — confirm 0 errors
    - _Requirements: 3.3_

  - [x] 6.2 Run backend tests
    - Run `php artisan test --filter=CashierSession` — expect 23 passing
    - Run `php artisan test --filter=PosCheckout` — expect 19 passing
    - Run `php artisan test` — expect all 152 passing
    - _Requirements: 2.4_

## Notes

- The backend is fully correct — all 42 POS/cashier tests pass. This is purely a frontend fix.
- The Radix `Popover` component is already available in `resources/js/components/ui/popover/` and exported from `resources/js/components/ui/index.ts`.
- The event ack pattern is backward-compatible: old callers without `_requestId` still work.
- The retry mechanism is lightweight: a single `setTimeout` chain with early termination on ack.
- After this fix, the dropdown will automatically flip above the trigger if there's not enough space below, and shift horizontally to stay within the viewport.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "3.2", "4.1"] },
    { "id": 2, "tasks": ["5.1", "5.2"] },
    { "id": 3, "tasks": ["6.1", "6.2"] }
  ]
}
```
