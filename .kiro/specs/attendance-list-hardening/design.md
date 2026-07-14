# Design Document

## Overview

This design addresses 9 weaknesses in the attendance list page identified through SWOT analysis. The fixes span auto-polling for active workers, pagination UI, DRY cleanup, i18n compliance, row-level loading states, improved clock-out UX, empty states, race condition guards, and geolocation feedback. All changes are scoped to the frontend — no backend API changes are required since the existing endpoints already support the needed functionality.

## Glossary

- **Polling:** Periodic background data refresh without user interaction
- **Row-level loading:** Disabling/loading state scoped to a single table row instead of the full page
- **DRY:** Don't Repeat Yourself — shared logic lives in one place
- **Race condition guard:** Preventing duplicate API calls from rapid repeated clicks
- **Empty state:** UI shown when a data set has zero items, instead of hiding the section entirely

## Bug Details

The attendance list page (`AttendanceListPage.vue`) and its sub-components contain 9 weaknesses identified through SWOT analysis:

1. **Stale active workers** — `live_duration_minutes` never updates without manual refresh
2. **Missing pagination** — Only first 20 records shown, no navigation controls
3. **Duplicated `hasAnyPhoto`** — Re-implemented locally in `AttendanceRecordsTable.vue` instead of using the composable export
4. **Hardcoded English errors** — Fallback error strings bypass i18n
5. **Full-page blocking** — Single-row actions (clock-out, review) block the entire UI
6. **Poor clock-out UX** — Raw file input with no preview, no camera capture, no clear button
7. **Missing empty state** — Active workers section disappears when count is zero
8. **Race conditions** — No guard against double-submission on rapid clicks
9. **Silent geolocation failure** — No user feedback when location capture fails

## Hypothesized Root Cause

These are not regressions but gaps in the original implementation:

- **Bugs 1, 2:** The page was built as a static snapshot with no auto-refresh or pagination UI, even though the backend supports both
- **Bug 3:** `AttendanceRecordsTable` was developed independently and didn't import from the composable
- **Bug 4:** Error handling was added quickly with English literals instead of i18n keys
- **Bug 5:** The `loading` ref was reused for both initial load and row-level mutations
- **Bug 6:** The clock-out file input was a minimal implementation without mobile considerations
- **Bug 7:** `v-if` was used for conditional rendering without considering the zero-item case
- **Bug 8:** No concurrency guard was added at the parent level (only partial in `AttendanceReviewPanel`)
- **Bug 9:** `captureAttendanceLocation` was designed to never block clock-in/out, but forgot to inform the user

## Expected Behavior

See `bugfix.md` section "Expected Behavior (Correct)" items 2.1 through 2.9.

## Correctness Properties

### Property 1: Silent polling
Polling MUST NOT set `loading = true` — only silent background refresh. The full-page overlay is reserved for initial load and manual refresh only.
**Validates: Bug 2.1**

### Property 2: Conditional pagination
Pagination controls MUST NOT render when `last_page <= 1`. When records fit in a single page, no pagination UI is shown.
**Validates: Bug 2.2**

### Property 3: Single hasAnyPhoto source
`hasAnyPhoto` MUST have exactly one implementation (in `useAttendancePhotoModal` composable) used across all components.
**Validates: Bug 2.3**

### Property 4: i18n-only fallbacks
Every `createToast` fallback string MUST use a `t()` call, never a raw English string literal.
**Validates: Bug 2.4**

### Property 5: No full-page block for row actions
`handleClockOut` and `handleReviewComplete` MUST NOT set `loading.value = true`. Row-level state is tracked via `actionInProgress` Set.
**Validates: Bug 2.5**

### Property 6: Object URL cleanup
Object URLs created for image previews MUST be revoked on clear or component scope dispose to prevent memory leaks.
**Validates: Bug 2.6**

### Property 7: Always-visible active workers card
The active workers card MUST always render (no `v-if` on the card wrapper). Empty state is shown inside the card.
**Validates: Bug 2.7**

### Property 8: Idempotent action buttons
A second click on an action button while the first API call is in-flight MUST be a no-op (early return).
**Validates: Bug 2.8**

### Property 9: Backward-compatible geolocation
`captureAttendanceLocation` return shape change MUST be adapted in all callers (`AttendanceListPage`, `AttendanceManualForm`).
**Validates: Bug 2.9**

## Fix Implementation

### Fix 1: Auto-polling for Active Workers (Bug 2.1)

**New file:** `resources/js/components/admin/attendance/composables/usePolling.js`

```js
import { ref, onScopeDispose } from "vue";

export function usePolling(callback, intervalMs = 60_000) {
    const isPolling = ref(false);
    let timerId = null;

    function start() {
        if (timerId !== null) return;
        isPolling.value = true;
        timerId = window.setInterval(async () => {
            try { await callback(); } catch { /* silent */ }
        }, intervalMs);
    }

    function stop() {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
        isPolling.value = false;
    }

    onScopeDispose(stop);
    return { start, stop, isPolling };
}
```

**Integration in `AttendanceListPage.vue`:**

```js
const polling = usePolling(async () => {
    await Promise.all([
        attendanceStore.fetchActiveWorkers(activeWorkerFilters),
        attendanceStore.fetchLists(filters),
        attendanceStore.fetchReviews(reviewFilters),
    ]);
}, 60_000);

onMounted(async () => {
    // ... existing fetch logic ...
    polling.start();
});
```

---

### Fix 2: Pagination UI (Bug 2.2)

**Store change in `useAttendanceStore.js` — update `fetchLists`:**

```js
this.page = res.data.meta
  ? {
      current_page: res.data.meta.current_page,
      from: res.data.meta.from,
      last_page: res.data.meta.last_page,
      to: res.data.meta.to,
      total: res.data.meta.total,
    }
  : {};
```

**Template in `AttendanceListPage.vue` (inside the Records Card, after `AttendanceRecordsTable`):**

```vue
<div v-if="page.last_page > 1" class="flex flex-col items-center gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
    <span class="text-sm text-muted-foreground order-2 sm:order-1">
        {{ page.from || 0 }}–{{ page.to || 0 }} / {{ page.total || 0 }}
    </span>
    <div class="flex gap-2 order-1 sm:order-2">
        <Button variant="outline" size="sm" class="min-h-[44px] min-w-[44px]"
            :disabled="page.current_page <= 1" @click="goToPage(page.current_page - 1)">
            {{ t("button.prev") }}
        </Button>
        <Button variant="outline" size="sm" class="min-h-[44px] min-w-[44px]"
            :disabled="page.current_page >= page.last_page" @click="goToPage(page.current_page + 1)">
            {{ t("button.next") }}
        </Button>
    </div>
</div>
```

**Script:**

```js
const page = computed(() => attendanceStore.page)

async function goToPage(pageNum) {
    filters.page = pageNum;
    loading.value = true;
    try {
        await attendanceStore.fetchLists(filters);
    } catch (err) {
        createToast(err?.response?.data?.message || t("attendance.error_load"), { type: "destructive" });
    } finally {
        loading.value = false;
    }
}
```

---

### Fix 3: DRY — Remove Duplicated `hasAnyPhoto` (Bug 2.3)

**In `AttendanceListPage.vue`:** Pass `hasAnyPhoto` as a prop:

```vue
<AttendanceRecordsTable :records="attendances" :has-any-photo="hasAnyPhoto" ... />
```

**In `AttendanceRecordsTable.vue`:** Add prop, remove local function:

```js
const props = defineProps({
    records: { type: Array, required: true },
    hasAnyPhoto: { type: Function, required: true },
});
// DELETE: function hasAnyPhoto(item) { ... }
```

---

### Fix 4: i18n Fallback Error Messages (Bug 2.4)

**New keys in `en.json` and `id.json`:**

| Key | EN | ID |
|-----|----|----|
| `attendance.error_load` | Failed to load attendance data. | Gagal memuat data kehadiran. |
| `attendance.error_refresh` | Failed to refresh attendance data. | Gagal memperbarui data kehadiran. |
| `attendance.error_clock_out` | Failed to clock out. | Gagal melakukan clock out. |
| `attendance.error_review` | Failed to complete attendance review. | Gagal menyelesaikan review kehadiran. |
| `attendance.location_not_captured` | Location could not be captured. Proceeding without location data. | Lokasi tidak dapat ditangkap. Melanjutkan tanpa data lokasi. |
| `attendance.no_active_workers` | No one is currently working. | Tidak ada karyawan yang sedang bekerja. |

**Code:** Replace all hardcoded English strings with `t("attendance.error_*")` calls.

---

### Fix 5: Row-Level Loading (Bug 2.5)

**In `AttendanceListPage.vue`:**

```js
const actionInProgress = reactive(new Set())

async function handleClockOut(payload) {
    const key = `clockout-${payload.id}`;
    if (actionInProgress.has(key)) return;
    actionInProgress.add(key);
    try {
        const { payload: locationPayload, locationCaptured } = await captureAttendanceLocation("clock_out");
        if (!locationCaptured) {
            createToast(t("attendance.location_not_captured"), { type: "default" });
        }
        await attendanceStore.clockOut({ id: payload.id, image: payload.image, ...locationPayload });
        createToast(t("attendance.clock_out_success"), { type: "default" });
        await Promise.all([
            attendanceStore.fetchLists(filters),
            attendanceStore.fetchActiveWorkers(activeWorkerFilters),
        ]);
    } catch (err) {
        createToast(err?.response?.data?.message || t("attendance.error_clock_out"), { type: "destructive" });
    } finally {
        actionInProgress.delete(key);
    }
}
```

Same pattern for `handleReviewComplete`. Pass `actionInProgress` as prop to child components for button disable state.

---

### Fix 6: Improved Clock-Out UX (Bug 2.6)

**In `AttendanceRecordsTable.vue`:**

- Add `capture="environment"` to file input
- Add image preview thumbnail (`<img>` with Object URL)
- Add clear button (✕) to reset file selection
- Revoke Object URLs on clear and on component scope dispose
- Disable clock-out button while `actionInProgress` contains the row key

---

### Fix 7: Empty State for Active Workers (Bug 2.7)

**In `AttendanceListPage.vue`:** Remove `v-if="activeWorkers.length"` from the Card wrapper — always show the card.

**In `AttendanceActiveWorkers.vue`:** Add empty state:

```vue
<template>
  <div v-if="workers.length" class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
    <!-- existing cards -->
  </div>
  <div v-else class="flex items-center justify-center rounded-lg border border-dashed p-6">
    <p class="text-sm text-muted-foreground">{{ t('attendance.no_active_workers') }}</p>
  </div>
</template>
```

---

### Fix 8: Race Condition Guards (Bug 2.8)

Addressed by Fix 5's `actionInProgress` Set pattern. The `if (actionInProgress.has(key)) return` guard at the top of each handler prevents duplicate API calls.

---

### Fix 9: Geolocation Feedback (Bug 2.9)

**In `geolocationCapture.js`:** Change return shape:

```js
export function captureAttendanceLocation(mode) {
    return captureCoordinates()
        .then(({ latitude, longitude }) => {
            const payload = mode === "clock_in"
                ? { clock_in_latitude: latitude, clock_in_longitude: longitude }
                : { clock_out_latitude: latitude, clock_out_longitude: longitude };
            return { payload, locationCaptured: true };
        })
        .catch(() => ({ payload: {}, locationCaptured: false }));
}
```

**All callers** (`AttendanceListPage.vue`, `AttendanceManualForm.vue`) destructure the new shape and show a warning toast when `locationCaptured === false`.

---

## File Changes Summary

| File | Change | Bug(s) |
|------|--------|--------|
| `composables/usePolling.js` | NEW | 2.1 |
| `AttendanceListPage.vue` | MODIFY | 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9 |
| `list/AttendanceRecordsTable.vue` | MODIFY | 2.3, 2.5, 2.6 |
| `list/AttendanceActiveWorkers.vue` | MODIFY | 2.7 |
| `stores/useAttendanceStore.js` | MODIFY | 2.2 |
| `utils/geolocationCapture.js` | MODIFY | 2.9 |
| `list/AttendanceManualForm.vue` | MODIFY | 2.9 |
| `languages/en.json` | MODIFY | 2.4 |
| `languages/id.json` | MODIFY | 2.4 |

## Testing Strategy

- **Unit tests:** `usePolling` composable (start/stop/cleanup on scope dispose)
- **Integration test updates:** Verify pagination renders when `page.last_page > 1`, empty state shows when `activeWorkers = []`, `actionInProgress` prevents double-clicks
- **Manual verification:** Polling behavior, pagination navigation, geolocation denial toast, clock-out preview on mobile
