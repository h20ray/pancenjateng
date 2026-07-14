# Metric card color system

**Status:** Active guardrail

---

## Rule

All metric cards — whether KPI panels, summary stats, dashboard highlights, or analytic overview cards — must use the `AdminMetricCard` component with a contextual `tone` that applies a colored background. No plain white/unstyled metric cards. The tone must reflect the semantic meaning of the data being displayed.

---

## Component

```
resources/js/components/admin/components/AdminMetricCard.vue
```

Use this single component for **all** numeric/stat displays across the admin panel. This includes:
- KPI panels (attendance, print log, reports)
- Dashboard summary cards (total sales, total orders, etc.)
- Analytic overview cards (visitors, page views, bounce rate)
- Finance summary cards (revenue, expenses, profit)
- Any card whose primary purpose is displaying a single metric value

---

## Tone palette

| Tone | Semantic meaning | Light mode | Dark mode | Title text |
|---|---|---|---|---|
| `default` | Neutral info — totals, counts, averages | `bg-slate-50` | `dark:bg-slate-950/40` | `text-slate-700` / `dark:text-slate-300` |
| `primary` | Primary/active metric — currently active, main KPI, in-progress | `bg-sky-50` | `dark:bg-sky-950/40` | `text-sky-700` / `dark:text-sky-300` |
| `success` | Positive outcome — completed, revenue, success rate, profit | `bg-emerald-50` | `dark:bg-emerald-950/40` | `text-emerald-700` / `dark:text-emerald-300` |
| `warning` | Needs attention — pending, stuck, needs review, expenses | `bg-amber-50` | `dark:bg-amber-950/40` | `text-amber-700` / `dark:text-amber-300` |
| `danger` | Problem — failed, errors, void, overdue | `bg-rose-50` | `dark:bg-rose-950/40` | `text-rose-700` / `dark:text-rose-300` |

### Value text

The large numeric value always uses `text-foreground` (high contrast) regardless of tone. Only the card background and title/icon get the tone color.

---

## Tone assignment guide

### By context

| Data type | Tone | Examples |
|---|---|---|
| Revenue, sales, profit, completed | `success` | Total Sales, Net Profit, Completed Today, Success Rate |
| Currently active, in-progress, primary count | `primary` | Currently Working, Total Orders, Active Sessions, Page Views |
| Pending, needs review, stuck, expenses | `warning` | Needs Review, Stuck Jobs, Pending Orders, Cash Out |
| Failed, errors, void, overdue | `danger` | Total Void, Failed Jobs, Error Count, Overdue |
| Generic totals, averages, neutral stats | `default` | Total Items Sold, Avg Attempts, Delivery Charges, Bounce Rate |

### Dashboard / Analytics cards

Dashboard and analytics overview cards are **not KPIs** in the operational sense, but they still use `AdminMetricCard`. Assign tones based on what the number represents:

| Card | Tone | Reason |
|---|---|---|
| Total Sales | `success` | Revenue = positive outcome |
| Total Orders / Customers | `primary` | Primary business metric |
| Total Void | `danger` | Negative event |
| Total Items Sold | `default` | Neutral count |
| Visitors / Page Views | `primary` | Engagement metric |
| Bounce Rate | `warning` | Metric to watch/improve |
| Conversion Rate | `success` | Positive performance indicator |

---

## Layout

Metric cards are always displayed in a responsive grid:

```vue
<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <AdminMetricCard title="..." value="..." tone="success" icon="dollar" />
    <AdminMetricCard title="..." value="..." tone="primary" icon="users" />
    <AdminMetricCard title="..." value="..." tone="warning" icon="clock" />
    <AdminMetricCard title="..." value="..." tone="danger" icon="alert" />
</div>
```

### Grid column rules

| Number of cards | Grid |
|---|---|
| 3 cards | `grid-cols-1 md:grid-cols-3` |
| 4 cards | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| 5+ cards | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5` |

---

## Loading state

When data is loading, show skeleton placeholders inside the card:

```vue
<AdminMetricCard title="Total Sales" :loading="true" tone="success" icon="dollar" />
```

The component handles the skeleton internally — a pulsing placeholder for the value area.

---

## Interactive cards

Some metric cards are clickable (e.g., "Total Void" opens a detail sheet). Use the `interactive` prop:

```vue
<AdminMetricCard
    title="Total Void"
    :value="totals.void"
    tone="danger"
    icon="alert"
    interactive
    @click="openVoidDetails"
/>
```

Interactive cards get:
- `cursor-pointer`
- Hover: `hover:border-primary/40 hover:shadow-md`
- Focus: `focus:ring-2 focus:ring-ring`
- `role="button"` and `tabindex="0"` for accessibility

---

## Do not

- Use plain `<Card>` with inline metric styling — always use `AdminMetricCard`
- Leave `tone` as `default` when the data has clear semantic meaning (success/warning/danger)
- Use the same tone for all cards in a panel — differentiate by meaning
- Hardcode background colors on metric cards — use the `tone` prop
- Create one-off KPI card components per page (e.g., `PrintLogKpiCards`, `AttendanceKpiPanel`) — use `AdminMetricCard` directly
- Use `text-muted-foreground` for the large value number — it must be `text-foreground` for readability
- Forget dark mode variants — the tone palette handles this automatically

---

## Migration plan

These components should be migrated to use `AdminMetricCard` with proper tones:

| Current component | Location | Status |
|---|---|---|
| `AttendanceKpiPanel` | `resources/js/components/admin/attendance/list/AttendanceKpiPanel.vue` | Planned |
| `PrintLogKpiCards` | `resources/js/components/admin/printers/PrintLogKpiCards.vue` | Planned |
| Dashboard metrics | `resources/js/components/admin/dashboard/DashboardComponentShadcn.vue` | Uses AdminMetricCard but tone is no-op |
| Sales Report metrics | `resources/js/components/admin/salesReport/SalesReportListComponent.vue` | Uses AdminMetricCard but tone is no-op |
| Finance metrics | `resources/js/components/admin/finance/FinanceSummaryComponent.vue` | Uses AdminMetricCard but tone is no-op |
| Finance cashbook | `resources/js/components/admin/finance/FinanceCashbookComponent.vue` | Uses AdminMetricCard but tone is no-op |

**First step:** Update `AdminMetricCard.vue` to actually apply the tone palette colors (currently the `toneClass` computed maps everything to `text-muted-foreground`).

---

## Applies to

- Dashboard page
- Attendance list page
- Print Log (Server Log tab)
- Sales Report
- Finance Summary & Cashbook
- HPP Report
- Any future page displaying numeric summary metrics
