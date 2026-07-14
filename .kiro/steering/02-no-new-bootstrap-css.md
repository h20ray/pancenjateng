# No Bootstrap (removed)

**Status:** Completed — Bootstrap CSS and JS have been fully removed from the project.

## Rule

Do **not** introduce Bootstrap CSS classes, Bootstrap JS utilities, or the `bootstrap` npm package. The project uses **Tailwind CSS** with **shadcn-vue** components exclusively.

## Context

Bootstrap was fully removed in Phase 2a of the modernization roadmap. The `bootstrap` package is no longer in `package.json`. All UI components now use:

- **Tailwind CSS** utilities for layout and styling
- **shadcn-vue** (Radix Vue) components in `resources/js/components/ui/` for interactive primitives (Dialog, DropdownMenu, Sheet, Tabs, etc.)
- **CSS namespace conventions** per `docs/CSS_ARCHITECTURE_GUIDE.md` (`db-*`, `pos-*`, `admin-*`, `attendance-*`, `kds-*`, `frontend-*`)

## What to do instead

- **Layout & utilities:** Tailwind utilities (`flex`, `grid`, `p-4`, `text-sm`, etc.)
- **Modals:** `<Dialog>` from `resources/js/components/ui/dialog/`
- **Dropdowns:** `<DropdownMenu>` from `resources/js/components/ui/dropdown-menu/`
- **Drawers/Sidebars:** `<Sheet>` from `resources/js/components/ui/sheet/`
- **Tooltips:** `<Tooltip>` from `resources/js/components/ui/tooltip/`
- **Cards:** `<Card>` from `resources/js/components/ui/card/`
- **Tabs:** `<Tabs>` from `resources/js/components/ui/tabs/`

## Important: Options API component registration

When using shadcn-vue components in Options API components, you **must** register them in the `components:` option:

```js
import { Card, CardHeader, CardTitle, CardContent } from "../../ui";

export default {
    name: "MyComponent",
    components: { Card, CardHeader, CardTitle, CardContent },
    // ...
}
```

`<script setup>` components auto-register imports — no `components:` needed there.

## No exceptions

Bootstrap is gone. There is nothing to extend or maintain.
