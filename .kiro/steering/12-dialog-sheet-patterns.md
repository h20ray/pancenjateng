# Dialog & Sheet layout patterns

**Status:** Active guardrail

---

## Rule

All dialogs (`<Dialog>`) and sheets (`<Sheet>`) must follow the standard spacing and border patterns defined by the shadcn-vue primitives. Do not override the built-in padding with custom values.

---

## Dialog structure

```
Dialog
├── DialogContent  (no padding — gap-0, border border-border, rounded-lg)
│   ├── DialogHeader  (p-4, border-b border-border, flex flex-col space-y-1.5)
│   │   └── DialogTitle
│   ├── Content div   (p-4, space-y-4 — the body slot)
│   └── DialogFooter  (p-4, border-t border-border, flex flex-wrap justify-end gap-3)
```

### Rules

- **DialogContent:** uses `border border-border` — this ensures proper border color in both light and dark mode. Never use `border-slate-*` or `border-gray-*` directly.
- **DialogHeader:** built-in `p-4` and `border-b border-border`. Do NOT add custom padding classes like `px-6 pt-6`.
- **Content body:** wrap in a `<div class="space-y-4 p-4">` between header and footer. This gives consistent spacing.
- **DialogFooter:** built-in `p-4` and `border-t border-border`. Do NOT add custom padding.
- **Mobile:** add `class="flex-col gap-2 sm:flex-row"` to DialogFooter for stacked buttons on small screens.
- **Buttons in footer:** always use `min-h-[44px]` for WCAG touch target compliance. Add `w-full sm:w-auto` for mobile-friendly full-width buttons.
- **Max height:** use `max-h-[90vh] overflow-y-auto` on DialogContent for long dialogs.
- **Responsive width:** use `sm:max-w-md md:max-w-lg` pattern for dialogs that should be narrower on small screens.

### Dark mode border fix

The `DialogFooter` component uses `border-border` (CSS variable) which automatically adapts to dark mode. **Never** use hardcoded border colors like `border-slate-200` — they will appear too bright in dark mode.

---

## Sheet structure (bottom drawer / side panel)

```
Sheet
└── SheetContent  (side="bottom" or side="right")
    ├── SheetHeader
    │   └── SheetTitle
    └── Content (p-4 or p-5)
```

### Rules

- **SheetContent:** for bottom sheets on mobile that become centered modals on desktop, use:
  ```
  class="flex flex-col gap-2.5 w-full h-full max-h-screen rounded-t-none border-t-0 p-5
         md:h-auto md:max-h-[min(88vh,760px)] md:max-w-[640px]
         md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
         md:rounded-2xl md:border md:border-border overflow-auto"
  ```
- **Close button:** always provide a close mechanism (X button or swipe-to-dismiss).

---

## WCAG requirements for dialogs

| Element | Requirement |
|---|---|
| Close button (X) | `min-h-8 min-w-8` (32px), visible focus ring |
| Action buttons | `min-h-[44px]` touch target |
| Focus trap | Automatic via Radix Dialog primitive |
| Escape key | Automatic via Radix Dialog primitive |
| `aria-label` | Not needed when DialogTitle is present |
| Scrollable content | `overflow-y-auto` with `max-h-[90vh]` |

---

## Do not

- Override DialogHeader/DialogFooter padding with custom `px-6`, `pt-6`, etc.
- Use `border-slate-*` or `border-gray-*` on dialog borders — always use `border-border`
- Omit `DialogTitle` (required for accessibility)
- Put content directly in DialogContent without a wrapper div (breaks spacing)
- Use fixed heights on dialogs — use `max-h-[90vh]` with overflow instead
- Forget `min-h-[44px]` on interactive buttons in dialogs

---

## Reference implementations

| Pattern | File |
|---|---|
| Edit Dialog | `resources/js/components/admin/attendance/components/AttendanceEditDialog.vue` |
| Review Dialog | `resources/js/components/admin/attendance/components/AttendanceReviewDialog.vue` |
| Photo Modal | `resources/js/components/admin/attendance/AttendancePhotoModalComponent.vue` |
| Bottom Sheet | `resources/js/components/admin/attendance/AttendanceSelfComponent.vue` (history sheet) |
