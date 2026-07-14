# Filter bar pattern

**Status:** Active guardrail

---

## Rule

All admin pages with date-based or multi-field filters must use the **quick presets + collapsible advanced filters** pattern. Do not show a wall of filter fields by default. The default view should be clean with only quick-access preset buttons visible.

---

## Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  [Today] [Yesterday] [This Week] [This Month] | [⚙ Filter]      │
└──────────────────────────────────────────────────────────────────┘

  ↓ (expanded when user clicks Filter — 24px gap via !mt-6)

┌──────────────────────────────────────────────────────────────────┐
│  From: [____]  To: [____]  Branch: [____]  Status: [____]        │
│                                              [Clear]  [Search]   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Quick presets

Pill-style buttons shown by default. One is always active.

```vue
<div class="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
    <Button
        v-for="preset in presets"
        :key="preset.key"
        size="sm"
        :variant="activePreset === preset.key ? 'default' : 'outline'"
        class="shrink-0"
        @click="applyPreset(preset.key)"
    >
        {{ preset.label }}
    </Button>
</div>
```

### Standard date presets

| Key | Label (en) | Label (id) | Date logic |
|---|---|---|---|
| `today` | Today | Hari Ini | `date_from = date_to = today` |
| `yesterday` | Yesterday | Kemarin | `date_from = date_to = yesterday` |
| `this_week` | This Week | Minggu Ini | `date_from = startOfWeek, date_to = today` |
| `this_month` | This Month | Bulan Ini | `date_from = startOfMonth, date_to = today` |

### Rules

- **Default active preset:** `today` unless the page has a different sensible default
- **Active state:** `variant="default"` (filled primary color)
- **Inactive state:** `variant="outline"`
- Clicking a preset immediately applies the filter (no "Apply" button needed)
- When a custom date range is set via the advanced panel, all presets deselect (none active)

---

## Filter toggle button

Positioned inline after the presets, separated by a thin vertical divider.

```vue
<span class="mx-1 h-5 w-px bg-border shrink-0" aria-hidden="true"></span>

<Button
    variant="outline"
    size="sm"
    class="gap-2 shrink-0"
    :aria-expanded="filtersVisible"
    @click="showFilters = !showFilters"
>
    <SlidersHorizontal class="h-4 w-4" aria-hidden="true" />
    <span class="hidden sm:inline">{{ $t("button.filter") }}</span>
    <span
        v-if="hasActiveFilters"
        class="h-2 w-2 rounded-full bg-primary"
        aria-label="Filters active"
    ></span>
</Button>
```

### Rules

- Icon: `SlidersHorizontal` from Lucide
- Sits directly after the preset buttons, separated by a `w-px h-5 bg-border` vertical divider
- Shows a small dot indicator (`h-2 w-2 rounded-full bg-primary`) when custom filters are active
- Label hidden on mobile: `<span class="hidden sm:inline">Filter</span>`
- `aria-expanded` should reflect the panel state for accessibility
- Extra action buttons (export, etc.) go in the `#actions` slot which is pushed to the far right via `ml-auto`

---

## Advanced filter panel

Collapsible panel that slides open below the presets row.

```vue
<div v-show="showFilters" class="!mt-6 rounded-lg border border-border bg-muted/30 p-4 space-y-4">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <!-- Filter fields -->
    </div>
    <div class="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" @click="resetFilters">
            {{ $t("filter.reset") }}
        </Button>
        <Button size="sm" @click="applyFilters">
            {{ $t("filter.apply") }}
        </Button>
    </div>
</div>
```

### Rules

- **Container:** `rounded-lg border border-border bg-muted/30 p-4` — subtle background to distinguish from page content
- **Top spacing:** `!mt-6` (24px) — overrides the parent `space-y-4` to give proper breathing room between the presets row and the filter panel. This prevents the panel from feeling cramped against the buttons above.
- **Visibility:** use `v-show` (not `v-if`) to preserve field state when toggling
- **Grid:** responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with `items-end` for aligned buttons
- **Actions:** right-aligned with Reset (ghost) + Apply (default) buttons
- **Apply button:** submits the custom filter and deselects all presets
- **Reset button:** clears all custom fields and reverts to the default preset (usually "Today")

---

## Active filter indicator logic

```js
computed: {
    hasActiveFilters() {
        // True when user has custom filters that differ from the active preset
        return this.activePreset === null || this.hasNonDefaultBranch || this.hasNonDefaultStatus;
    },
}
```

When `hasActiveFilters` is true:
- The filter button shows the dot indicator
- Presets may all be deselected (if custom date range)
- A "Reset" action is available

---

## Mobile behavior

- **Presets row:** horizontal scroll with `overflow-x-auto`, `flex-nowrap` implicit via no `flex-wrap`, and `scrollbar-none` on small screens
- **Preset buttons:** `shrink-0` to prevent compression
- **Filter button:** always visible (icon-only on very small screens via `hidden sm:inline` on label)
- **Filter panel:** fields stack vertically (`grid-cols-1`)
- **Touch targets:** all preset buttons and filter controls must be `min-h-[36px]` (shadcn `size="sm"` satisfies this)

```vue
<!-- Mobile-friendly presets row -->
<div class="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
    <!-- preset buttons (shrink-0) -->
    <!-- filter toggle (ml-auto shrink-0) -->
</div>
```

---

## Shared component (future)

When implementing, create a reusable `AdminFilterBar` component:

```
resources/js/components/admin/components/filters/AdminFilterBar.vue
```

Props:
- `presets` — array of `{ key, label }` objects
- `modelValue` — active preset key (or `null` for custom)
- `hasActiveFilters` — boolean for dot indicator

Slots:
- `#filters` — custom filter fields per page

Events:
- `@preset-change` — emitted when a preset is clicked
- `@apply` — emitted when Apply is clicked in advanced panel
- `@reset` — emitted when Reset is clicked

---

## i18n keys required

Add to both `en.json` and `id.json` under a `"filter"` namespace:

| Key | English | Indonesian |
|---|---|---|
| `filter.filter` | Filter | Filter |
| `filter.apply` | Apply | Terapkan |
| `filter.reset` | Reset | Reset |
| `filter.today` | Today | Hari Ini |
| `filter.yesterday` | Yesterday | Kemarin |
| `filter.this_week` | This Week | Minggu Ini |
| `filter.this_month` | This Month | Bulan Ini |

---

## Do not

- Show all filter fields expanded by default — presets handle the common cases
- Use native `<select>` for filter dropdowns — use `AdminCombobox`
- Forget the active filter indicator on the toggle button
- Put the Apply/Reset buttons inline with the filter fields — they go in their own row, right-aligned
- Use `v-if` on the filter panel — use `v-show` to preserve user input when toggling
- Make preset buttons smaller than `size="sm"` — they need to be tappable on mobile
- Hardcode date calculations — use `date-fns` helpers (`startOfWeek`, `startOfMonth`, `subDays`)

---

## Applies to

- Print Log (Server Log tab)
- Attendance Report
- Sales Report
- HPP Report
- Transaction list
- POS Order list
- Any future page with date-range + additional filters

---

## Reference implementations

| Pattern | File | Status |
|---|---|---|
| AdminFilterBar component | `resources/js/components/admin/components/filters/AdminFilterBar.vue` | Done |
| Server Log (first adopter) | `resources/js/components/admin/settings/Printer/components/ServerLogTab.vue` | Done |
