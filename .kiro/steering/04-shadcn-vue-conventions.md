# shadcn-vue component conventions

**Status:** Active guardrail — the admin surface migration is complete; POS and storefront surfaces are next.

## Rule

All new UI components **must** use shadcn-vue primitives from `resources/js/components/ui/`. Do **not** introduce new custom CSS component classes (`.db-*`, `.pos-*`, etc.) for patterns already covered by shadcn-vue.

## Available primitives

All live in `resources/js/components/ui/` and are re-exported from `resources/js/components/ui/index.ts`:

| Component | Import |
|---|---|
| AlertDialog | `import { AlertDialog, AlertDialogAction, ... } from "../../ui"` |
| Badge | `import { Badge } from "../../ui"` |
| Breadcrumb | `import { Breadcrumb, BreadcrumbList, ... } from "../../ui"` |
| Button | `import { Button } from "../../ui"` |
| Card | `import { Card, CardHeader, CardTitle, CardContent } from "../../ui"` |
| Checkbox | `import { Checkbox } from "../../ui"` |
| DatePicker | `import { DatePicker } from "../../ui"` |
| Dialog | `import { Dialog, DialogContent, DialogHeader, ... } from "../../ui"` |
| DropdownMenu | `import { DropdownMenu, DropdownMenuTrigger, ... } from "../../ui"` |
| Input | `import { Input } from "../../ui"` |
| Label | `import { Label } from "../../ui"` |
| LoadingOverlay | `import { LoadingOverlay } from "../../ui"` |
| RadioGroup | `import { RadioGroup, RadioGroupItem } from "../../ui"` |
| Select | `import { Select, SelectTrigger, SelectContent, ... } from "../../ui"` |
| Sheet | `import { Sheet, SheetContent, SheetHeader, ... } from "../../ui"` |
| Skeleton | `import { Skeleton } from "../../ui"` |
| Switch | `import { Switch } from "../../ui"` |
| Table | `import { Table, TableHeader, TableBody, TableRow, ... } from "../../ui"` |
| Tabs | `import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui"` |
| Textarea | `import { Textarea } from "../../ui"` |
| Toast | `import { createToast } from "../../ui"` |
| Tooltip | `import { Tooltip, TooltipTrigger, TooltipContent } from "../../ui"` |

## Critical: Options API registration

Components using Options API (`export default {}`) **must** register shadcn imports in `components:`:

```js
import { Card, CardHeader, CardTitle, CardContent } from "../../ui";

export default {
    components: { Card, CardHeader, CardTitle, CardContent },
    // ...
}
```

`<script setup>` auto-registers — no `components:` needed.

## Styling rules

- shadcn-vue components use `cn()` from `@/lib/utils` for class merging
- Pass custom classes via the `class` prop: `<Card class="my-custom-class">`
- Do **not** mix old `.db-*` CSS classes with shadcn components on the same element
- Color tokens use HSL format via CSS variables (see `docs/SHADCN_MIGRATION_PLAN.md` §3)

## What's NOT yet migrated (remaining work)

- Form validation wrappers (FormField, FormItem, FormLabel, FormMessage)
- Custom sidebar component (Sheet mobile + fixed desktop)
- Date picker replacement (completed — now using shadcn DatePicker)
- Command palette / search
- Dark mode token set
- POS surface components
- Storefront surface components
- Token cleanup (remove old `--md-*` RGB variables)

## Adding new shadcn components

1. Scaffold via CLI: `npx shadcn-vue@latest add <component>`
2. Components land in `resources/js/components/ui/<component>/`
3. Re-export from `resources/js/components/ui/index.ts`
4. Customize styles to match project conventions
5. Do **not** scaffold components you aren't actively using
