# Admin settings page card layout

**Status:** Active guardrail

---

## Rule

Every admin settings page must use one of the three card layout patterns below. No custom wrappers, no raw `<div>` containers, no ad-hoc layouts.

---

## Pattern 1: List Card (CRUD table)

For pages that display a collection of items with create/edit/delete actions.

```
Card
├── CardHeader  (title + description + create button)
├── Table       (edge-to-edge, no CardContent wrapper)
└── Footer div  (pagination, border-t separator)
```

```vue
<Card>
    <CardHeader class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <CardTitle>{{ $t("menu.pages") }}</CardTitle>
            <CardDescription>Short explanation of what this list manages.</CardDescription>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <TableLimitComponent ... />
            <CreateComponent ... />
        </div>
    </CardHeader>

    <Table>
        <!-- TableHeader + TableBody directly inside Card (no CardContent) -->
    </Table>

    <div class="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3"
        v-if="items.length > 0">
        <!-- Pagination -->
    </div>
</Card>
```

### Rules

- **Header right-side:** only "new/create" actions or table limit controls
- **Table:** directly inside `<Card>`, never wrapped in `<CardContent>` — this gives edge-to-edge styling
- **Pagination footer:** always uses `border-t border-border bg-muted/20 px-4 py-3`, conditionally rendered when items exist

---

## Pattern 2: Form Card (settings/config)

For pages that display a form with fields and a save action.

```
Card
├── CardHeader  (title + description, NO action button)
└── CardContent (form fields only)
Save button       (outside Card, right-aligned, mt-6)
```

```vue
<Card>
    <CardHeader class="space-y-1 border-b border-border">
        <CardTitle>{{ $t("menu.site") }}</CardTitle>
        <CardDescription>Short explanation of what these settings control.</CardDescription>
    </CardHeader>
    <CardContent class="pt-6">
        <form class="space-y-6" @submit.prevent="save">
            <div class="grid grid-cols-12 gap-4">
                <!-- Form fields -->
            </div>
        </form>
    </CardContent>
</Card>

<div class="flex justify-end mt-6">
    <Button type="submit" class="gap-2" form="form-id">
        <Save class="h-4 w-4" aria-hidden="true" />
        <span>{{ $t("button.save") }}</span>
    </Button>
</div>
```

### Rules

- **Header:** title + description only — no action buttons in the header
- **CardContent:** always add `class="pt-6"` — the default `pt-0` is designed for non-bordered headers; the border-b divider needs explicit top padding
- **Save button:** outside the Card, right-aligned via `flex justify-end mt-6`, connected to the form via `form` attribute matching the form's `id`
- **Form wrapper:** `<CardContent>` wraps the entire `<form>` — button is outside both

---

## Pattern 3: Tabbed Card (multi-provider/multi-section)

For pages that group multiple providers or sections under tabs (e.g., payment gateways, SMS gateways).

```
Card (optional outer wrapper)
├── Tabs
│   ├── TabsList  (provider/section selector)
│   └── TabsContent (each tab follows Pattern 2 internally)
```

Each `TabsContent` panel should follow the Form Card pattern internally (fields + save button at bottom).

---

## Pattern 4: Report Card (data display with filters)

For pages that display reports, analytics, or read-only data with filter controls.

```
Card
├── CardHeader  (title + description + export/filter actions)
├── CardContent (filter controls + table/chart)
└── Footer div  (pagination if applicable)
```

### Rules

- **Header right-side:** export buttons, filter toggles, or date range selectors
- **Never** put save/submit buttons in the header — those belong in Form Cards only

---

## Required elements

| Element | Required | Notes |
|---|---|---|
| `CardTitle` | Always | Use i18n key from `menu.*` namespace |
| `CardDescription` | Always | One-line explanation of what the page does |
| `LoadingComponent` | Always | Placed before the `<Card>`, never inside it |

---

## CardHeader layout classes

| Page type | CardHeader class |
|---|---|
| List (with actions) | `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` |
| Form (no actions) | `space-y-1 border-b border-border` |
| Report (with export) | `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` |

---

## Divider rule

| Content after header | Divider on CardHeader? | Reason |
|---|---|---|
| `<Table>` directly in Card | **No** | The table header row creates a natural visual boundary |
| `<CardContent>` (form, grid, custom) | **Yes** — add `border-b border-border` to CardHeader | No natural separator between header and content |

When the content is a `<Table>` placed directly inside `<Card>` (list pattern), the table's own header row provides visual separation. When the content is wrapped in `<CardContent>` (forms, card-grids, reports), add `border-b border-border` to `<CardHeader>` to create a clear divider.

---

## Do not

- Use raw `<div id="...">` as page container — always use `<Card>`
- Put save/submit buttons in `CardHeader`
- Wrap `<Table>` in `<CardContent>` (breaks edge-to-edge styling)
- Omit `CardDescription` (every page needs context)
- Use custom footer styling — always use the standard `border-t border-border bg-muted/20 px-4 py-3` pattern
- Add extra border/shadow classes to `<Card>` — the default Card styling is sufficient

---

## Reference implementations

| Pattern | File |
|---|---|
| List Card | `resources/js/components/admin/settings/Page/PageListComponent.vue` |
| Form Card | `resources/js/components/admin/settings/PowerPrune/PowerPruneComponent.vue` |
| Tabbed Card | `resources/js/components/admin/settings/PaymentGateway/PaymentGatewayComponent.vue` |
| Report Card | `resources/js/components/admin/ingredient/HppReportPage.vue` |

---

## Pattern 5: Responsive Table Cards (mobile)

For any list/table that needs to be readable on mobile. The desktop table is hidden and replaced with stacked cards on small screens.

---

### Structure

```
<!-- Desktop: standard table (hidden on mobile) -->
<div class="hidden md:block">
    <Table>...</Table>
</div>

<!-- Mobile: card stack (hidden on desktop) -->
<div class="flex flex-col gap-3 md:hidden">
    <article class="rounded-lg border border-border p-4 space-y-3">
        <!-- Row 1: Primary info + Status badge -->
        <!-- Row 2: Secondary metadata -->
        <!-- Row 3: Pills / tags -->
        <!-- Row 4 (optional): Actions with border-t separator -->
    </article>
</div>
```

---

### Card article rules

| Element | Class | Notes |
|---|---|---|
| Card wrapper | `rounded-lg border border-border p-4 space-y-3` | Standard card. Never use `shadow-*` — border is enough |
| Conditional highlight | `:class="{ 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30': condition }"` | Always include dark variant |
| Gap between cards | `gap-3` on the parent `flex flex-col` | Consistent spacing |
| Inner padding | `p-4` | Same as desktop table cell padding feel |
| Section spacing | `space-y-3` inside the article | Between logical rows |

---

### Row layout conventions

| Row type | Pattern |
|---|---|
| Primary info + badge | `<div class="flex items-start justify-between gap-2">` — name/title on left, status badge on right |
| Metadata line | `<div class="text-xs text-muted-foreground">` — use `·` separator between inline items |
| Pills / tags | `<div class="flex flex-wrap items-center gap-1.5">` — use `<Badge>` components |
| Action row | `<div class="flex flex-wrap items-center gap-2 pt-1 border-t border-border">` — always separated with top border |

---

### Badge sizing in cards

- Status badges: `text-[10px]` with `shrink-0` to prevent wrapping
- Info pills (time, device, station): `text-xs` with appropriate variant
- Use `variant="secondary"` for neutral info, `variant="outline"` for metadata
- Custom colored badges must include both light and dark classes:
  ```
  class="bg-sky-100 text-sky-700 border-transparent dark:bg-sky-900/50 dark:text-sky-200"
  ```

---

### Color and dark mode rules

- **Always** use semantic color tokens for text: `text-foreground`, `text-muted-foreground`
- **Always** use `border-border` for card borders — never `border-slate-*` or `border-gray-*`
- **Always** use `bg-muted` or `bg-muted/50` for subtle backgrounds — never hardcoded grays
- Colored backgrounds must have dark variants:
  - Light: `bg-emerald-50/50`, Dark: `dark:bg-emerald-950/10`
  - Light: `border-amber-200`, Dark: `dark:border-amber-800`
- **Never** use raw color values without a `dark:` counterpart

---

### WCAG requirements for mobile cards

| Element | Requirement |
|---|---|
| Interactive buttons | `min-h-[36px]` touch target (44px preferred for primary actions) |
| Tap targets | Minimum `gap-2` between adjacent interactive elements |
| Text contrast | Use `text-foreground` (not `text-muted-foreground`) for primary content |
| Secondary text | `text-muted-foreground` only for labels and metadata — never for actionable content |
| Focus indicators | Buttons must have visible focus ring (inherited from shadcn Button) |
| Font size | Never below `text-xs` (12px) for any readable content |

---

### Empty state (mobile)

```vue
<div v-if="!items.length" class="py-8 text-center text-sm text-muted-foreground">
    {{ $t("message.no_data_available") }}
</div>
```

Or with an icon for richer empty states:

```vue
<div v-if="!items.length" class="py-12 text-center">
    <IconComponent class="mx-auto h-10 w-10 text-muted-foreground/30" aria-hidden="true" />
    <p class="mt-3 text-sm font-medium text-foreground">{{ $t("message.no_data_available") }}</p>
    <p class="mt-1 text-xs text-muted-foreground">{{ $t("some.helpful_hint") }}</p>
</div>
```

---

### Do not

- Use `<Table>` on mobile — it causes horizontal scroll and tiny unreadable text
- Use hardcoded colors without dark mode variants
- Put more than 2 action buttons in a card row without wrapping (`flex-wrap`)
- Use `text-[9px]` or smaller — minimum is `text-[10px]` for badges, `text-xs` for content
- Forget `aria-hidden="true"` on decorative icons inside cards
- Use `shadow-*` on individual cards in a list — borders provide enough separation

---

### Reference implementations

| Pattern | File |
|---|---|
| Attendance records | `resources/js/components/admin/attendance/list/AttendanceRecordsTable.vue` |
| Item list | `resources/js/components/admin/items/ItemListComponent.vue` |
| Transaction list | `resources/js/components/admin/transactions/TransactionListComponent.vue` |
| Credit balance report | `resources/js/components/admin/creditBalanceReport/CreditBalanceReportComponent.vue` |
| Android debug log | `resources/js/components/admin/settings/Printer/components/AndroidLogTab.vue` |
