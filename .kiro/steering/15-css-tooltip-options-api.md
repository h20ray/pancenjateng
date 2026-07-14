# CSS group-hover tooltips over Radix Tooltip in Options API

**Status:** Active guardrail — Radix `Tooltip` uses `<TooltipPortal>`, which suffers the same Options API portal destruction as `<Select>`.

## Rule

In **Options API** components (`export default {}`), do **not** use the shadcn `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` components. Use the CSS `group-hover` pattern instead.

## Why

The admin panel's `DefaultComponent.vue` is written in the Options API. Any parent re-render tears down and reconstructs child portals, destroying Radix-Vue's internal state. This is documented in CLAUDE.md for `<Select>` — `<Tooltip>` uses `<TooltipPortal>` internally and has the same failure mode.

CSS tooltips have no portals, no Radix state, and no JavaScript dependency — they work regardless of parent re-renders.

## Pattern

```html
<Button
    variant="ghost"
    size="icon"
    class="group relative h-8 w-8"
    :aria-label="$t('button.view')"
>
    <AdminIcon name="eye" :size="16" />
    <span class="pointer-events-none invisible absolute left-1/2 -top-1.5 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-background opacity-0 shadow transition group-hover:visible group-hover:opacity-100">
        {{ $t('button.view') }}
    </span>
</Button>
```

For link buttons (wrapping `<router-link>`), add `as-child`:

```html
<Button
    as-child
    variant="ghost"
    size="icon"
    class="group relative h-8 w-8"
>
    <router-link :to="{ name: '...', params: { id: item.id } }">
        <AdminIcon name="eye" :size="16" />
        <span class="... group-hover:visible group-hover:opacity-100">
            {{ $t('button.view') }}
        </span>
    </router-link>
</Button>
```

## Key classes explained

| Class | Purpose |
|---|---|
| `group` | Marks the button as the hover target |
| `relative` | Creates positioning context for the tooltip |
| `-top-1.5` | Offsets tooltip 6px above the button (creates breathing room) |
| `-translate-y-full` | Shifts tooltip up by its own height |
| `invisible group-hover:visible` | Hidden by default, visible on group hover |
| `opacity-0 group-hover:opacity-100` | Fades in on hover |
| `pointer-events-none` | Tooltip doesn't block clicks on elements below |
| `bg-foreground text-background` | Semantic tokens — dark tooltip in light mode, light in dark mode |
| `text-[10px]` | Compact tooltip font size |
| `transition` | Smooth fade animation |

## When Radix Tooltip IS safe

- **Composition API** (`<script setup>`) components where no Options API ancestor will re-render while the tooltip is open.
- **Non-admin surfaces** (storefront, POS) that don't mount under `DefaultComponent.vue`.

## Spacing rule

Always use `-top-1.5` (not `top-0`) to leave a 6px gap between the tooltip bottom edge and the button top edge. The old `SmIconViewComponent` / `SmIconDeleteComponent` used `top-0` which left zero gap — this was too tight.
