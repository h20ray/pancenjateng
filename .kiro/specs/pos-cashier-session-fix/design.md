# Design Document: POS Cashier Session Fix + UI Polish

## Overview

This fix addresses two categories of issues:

1. **Race condition** between `PosComponentShadcn` (dispatches CustomEvent) and `CashierSessionPanelShadcn` (listens for event inside async-loaded `BackendNavbarComponent`)
2. **UI/UX polish** — the cashier session panel uses a manually positioned `Card` with `absolute` CSS that can overflow off-screen. Replace with Radix `Popover` for smart viewport-aware positioning, and normalize spacing/padding to shadcn conventions.

## Architecture

### Part A: Fix Race Condition

**Current (broken) flow:**
```
DefaultComponent renders
  ├── BackendNavbarComponent (ASYNC — may not be ready)
  │     └── CashierSessionPanelShadcn (event listener in mounted())
  └── SidebarInset
        └── <router-view> → PosComponentShadcn (mounts immediately)
              └── PosShiftGateCardShadcn → click → CustomEvent ❌ (no listener)
```

**Fixed flow:**
```
DefaultComponent renders
  ├── BackendNavbarComponent (SYNC — always ready)
  │     └── CashierSessionPanelShadcn (event listener registered)
  └── SidebarInset
        └── <router-view> → PosComponentShadcn (mounts)
              └── PosShiftGateCardShadcn → click → CustomEvent ✅ (listener ready)
```

### Part B: Smart Dropdown Positioning

**Current (broken):**
```html
<!-- Manually positioned Card — can overflow viewport -->
<Card v-if="menuOpen" class="absolute right-0 top-full mt-2 z-50 w-80 shadow-lg">
```

**Fixed:**
```html
<!-- Radix Popover — automatic viewport-aware positioning -->
<Popover v-model:open="menuOpen">
  <PopoverTrigger as-child>
    <Button ...trigger... />
  </PopoverTrigger>
  <PopoverContent align="end" :side-offset="8" class="w-80 p-0">
    <!-- Panel content -->
  </PopoverContent>
</Popover>
```

Radix Vue's `Popover` uses Floating UI under the hood, which automatically:
- Flips the popover above/below based on available space
- Shifts horizontally to stay within viewport
- Handles scroll containers and fixed positioning

## Key Design Decisions

1. **Sync backend, async frontend**: Backend layout components restored to sync imports. Frontend layout components remain async. Admin users always see the navbar — lazy-loading saves nothing for them.

2. **Radix Popover for dropdown**: Replace the manual `absolute` positioned `Card` with shadcn-vue `Popover` + `PopoverContent`. This gives us viewport-aware positioning for free without custom JS calculations.

3. **Event acknowledgment safety net**: Even with sync loading, add a lightweight ack pattern to the CustomEvent bridge to protect against future timing issues.

4. **Spacing normalization**: Align all padding/margins to shadcn's 4px grid system (p-2=8px, p-2.5=10px, p-3=12px, p-4=16px, p-5=20px).

## Components and Interfaces

### Modified Components

| Component | Changes |
|---|---|
| `DefaultComponent.vue` | Restore sync imports for backend layout; keep async for frontend |
| `CashierSessionPanelShadcn.vue` | Replace manual Card dropdown with Popover; normalize spacing; add ack event |
| `PosComponentShadcn.vue` | Add retry logic to `openCashierShiftFlow()` |
| `PosComponent.vue` | Same retry logic (legacy path) |
| `PosShiftGateCardShadcn.vue` | Normalize padding to `p-4` |

### CashierSessionPanelShadcn — Revised Template Structure

```html
<template>
  <div v-if="isPosRoute">
    <Popover v-model:open="menuOpen">
      <PopoverTrigger as-child>
        <Button variant="ghost" size="icon" class="relative h-9 w-9 rounded-xl" ...>
          <!-- icon + status dot -->
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" :side-offset="8" class="w-80 p-0">
        <!-- Header -->
        <div class="p-4 pb-3 border-b">
          <span class="text-xs font-medium uppercase tracking-wider text-primary">...</span>
          <h3 class="text-base font-semibold mt-1">...</h3>
        </div>

        <!-- Session Summary (if active) -->
        <div v-if="hasActiveSession" class="p-4 pb-3">
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg border p-2.5">...</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-4 pt-0 space-y-1">
          <Button variant="ghost" class="w-full justify-start gap-2.5 h-auto py-2.5 px-3">...</Button>
        </div>
      </PopoverContent>
    </Popover>

    <!-- Dialog (Teleported) — unchanged structure, normalized spacing -->
    <Teleport to="body">...</Teleport>
  </div>
</template>
```

### Spacing Reference (shadcn 4px grid)

| Element | Before | After | Rationale |
|---|---|---|---|
| Popover content padding | `p-4` (mixed) | `p-4` sections with `border-b` separators | Consistent section rhythm |
| Summary grid cells | `p-2` | `p-2.5` | More breathing room for label+value |
| Action button padding | `py-2 px-3` | `py-2.5 px-3` | Comfortable touch target |
| Action button gap | `gap-3` | `gap-2.5` | Tighter badge-to-text alignment |
| Button spacing | `space-y-1.5` | `space-y-1` | Denser action list |
| Dialog header | `p-4` | `p-5` | Match shadcn Dialog convention |
| Dialog content | `p-4 pt-0` | `p-5 pt-0` | Match shadcn Dialog convention |
| Dialog form fields | `space-y-3` | `space-y-4` | More separation between fields |
| Shift gate card | `p-3` | `p-4` | Match card padding convention |

### Event Protocol (enhanced)

```
POS → dispatchEvent("cashier-session:open-action", { action, branch_id, _requestId })
Panel ← handles event
Panel → dispatchEvent("cashier-session:open-action-ack", { _requestId })
POS ← receives ack, stops retrying
```

Retry: max 4 attempts, 500ms apart. Timeout toast after 2s.

## Data Models

No changes. Purely frontend UI/timing fix.

## Error Handling

| Scenario | Handling |
|---|---|
| Panel not mounted after 2s | Toast: "Cashier session panel not ready. Please try again." |
| Popover overflows viewport | Radix Floating UI auto-flips/shifts (handled by library) |
| Multiple rapid clicks | `_requestId` deduplication — only latest request tracked |

## Testing Strategy

### Manual Testing Checklist

1. Navigate to `/admin/pos` → shift gate card appears → click "Start Cashier Session" → dialog opens immediately
2. Open session → POS unlocks → place an order → verify `cashier_session_id` on order
3. Click cashier panel button in header → popover appears within viewport (test on small screens)
4. Resize browser to narrow width → popover stays within viewport, doesn't overflow right
5. Scroll down on POS page → open panel → popover still positions correctly
6. Close session → shift gate reappears → checkout blocked
7. Dark mode → verify all panel elements use token colors

### Build Verification

- `npm run build` → `app.js` < 400KB
- `npm run lint` → 0 errors
- `npm run typecheck` → 0 errors
- `php artisan test` → 152 tests pass
