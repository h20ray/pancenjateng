# Dropdown debugging order

**Status:** Active guardrail

## Rule

When a dropdown component (AdminCombobox or any Radix-based dropdown) appears broken (not showing options, clipped, or unresponsive), follow this debugging order before modifying the page component.

## Debugging order

1. **Check if options exist in the DOM after click** — inspect the popover/content container to see if Radix mounted the content.
2. **Check if content is hidden/clipped by CSS** — look for `height`, `max-height`, `overflow: hidden` on the viewport or content wrapper.
3. **Check `z-index` / overlay issues** — the dropdown may be rendered behind another element. AdminCombobox uses `z-[80]`.
4. **Check whether the trigger click changes `aria-expanded`** — confirms Radix state is toggling.
5. **Check for portal destruction** — if the parent is Options API, ensure the component does NOT use `<ComboboxPortal>` or `<SelectPortal>`. Content must be inline with absolute positioning.
6. **Check the click overlay delegation** — if clicking the input area doesn't open the dropdown, verify the transparent overlay div is present and delegates to the chevron trigger.
7. **Check scroll-into-view timing** — if the dropdown opens but doesn't scroll to the selected item, verify the `isOpen` watcher fires the delayed scroll sequence (50ms, 150ms, 300ms, 500ms).
8. **Only then change the page component** — the issue is rarely in the consumer; it's usually in the shared primitive or its CSS.

## Known architectural constraints

| Constraint | Cause | Solution |
|---|---|---|
| Portal destruction | Options API parent re-renders tear down portals | No portals — inline absolute positioning |
| Layout shifting | Inline content expands parent grid cell | `relative` on root + `absolute` on content |
| Scroll reset on input click | Browser mouse-focus overrides scrollIntoView | Transparent overlay with click delegation |
| Native `<option>` unstyled | OS renders native list boxes | Use Radix Combobox with custom DOM items |

## Key files to inspect

- `resources/js/components/admin/components/filters/AdminCombobox.vue` — the primary dropdown component for admin pages
- `resources/js/components/ui/select/SelectContent.vue` — viewport styling (for non-admin contexts)
- `resources/js/components/ui/select/SelectTrigger.vue` — trigger rendering (for non-admin contexts)
- `resources/js/components/ui/popover/PopoverContent.vue` — if using Popover-based dropdowns

## When to use native `<select>` instead

For destructive admin tools or critical paths where reliability matters more than custom styling, prefer native `<select>` elements. Example: the Power Prune page uses native selects for Target and Time Range because it's a destructive operation.
