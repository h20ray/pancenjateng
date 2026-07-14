# Dropdown Modernization and Focus/Scroll Synchronization Recipe

**Status:** Active guardrail

This document outlines the technical challenges and solutions for replacing "Windows 95 style" native selects with highly polished, modern custom dropdowns in Vue applications (particularly those with Options API parent layouts). Use this as a reference/skill for LLM reasoning.

---

## 1. Architectural Challenges

### Problem A: Native `<select>` Option Styling

* **Symptom:** Dropdowns look like classic OS controls ("Win 95 style").
* **Cause:** Browser engines render native `<option>` list boxes using the operating system's native window manager. They cannot be styled using standard CSS/Tailwind.
* **Solution:** Replace native selects with custom DOM-rendered listboxes (e.g., Radix Vue `Combobox` or `Select` primitives).

### Problem B: Options API Parent Re-render (Portal Destruction)

* **Symptom:** Radix Vue `<Select>` dropdowns close immediately, fail to render options, or break portal positioning.
* **Cause:** The parent dashboard layout is built using the Vue Options API. When the parent re-renders, it tears down and reconstructs child portals.
* **Solution:** **Do NOT use portals.** Mount the dropdown content inline within the local component tree (omit `<ComboboxPortal>` or `<SelectPortal>`).

### Problem C: Layout Shifting (Inline Rendering)

* **Symptom:** Opening the dropdown pushes all page content below it down.
* **Cause:** Because portals are disabled, the dropdown list (`ComboboxContent`) is rendered in-flow in the local DOM, expanding the height of the parent grid cell.
* **Solution:** Position the elements absolutely relative to a localized boundary wrapper:
  1. Add `class="relative w-full"` to the root wrapper (`ComboboxRoot`).
  2. Add `class="absolute z-[80] left-0 mt-1 w-full max-h-64 overflow-y-auto"` to the list container (`ComboboxContent`).

---

## 2. Event Synchronisation & Scroll Overrides

### Problem D: Pointer-Focus Scroll Override Mismatch

* **Symptom:** Clicking the chevron trigger auto-scrolls to the selected item successfully, but clicking the text input field resets the scroll position to the top (`--` or index 0) on the first click.
* **Cause:** Clicking inside an input text box triggers a native browser mouse-focus and text cursor positioning sequence. Radix Vue's internal focus manager catches this pointer focus and programmatically shifts focus to the active descendant (the first option), resetting the scroll. Because this happens inside browser microtasks, it overrides custom `.scrollIntoView()` triggers.
* **Solution:** **Direct Event Delegation (Click Overlay).**
  1. Make the input `readonly` (prevents blinking cursor and keyboard popups on mobile).
  2. Overlay a transparent `div` covering the input text area (leaving the chevron button clickable).
  3. Intercept events on the overlay with `@click.stop` and `@mousedown.stop.prevent` to prevent browser mouse-focus.
  4. Programmatically delegate the click to the chevron button trigger (`trigger.click()`) to guarantee both interactions execute the exact same state transitions, focus queues, and timing.

---

## 3. The Implementation Blueprint (`AdminCombobox.vue`)

Below is the complete, robust component pattern:

```vue
<template>
<ComboboxRoot
    :model-value="selectedOption"
    :display-value="displayValue"
    :filter-function="filterOptions"
    :reset-search-term-on-blur="false"
    :reset-search-term-on-select="true"
    class="relative w-full"
    v-model:open="isOpen"
    @update:model-value="updateValue"
    @update:search-term="updateSearch"
>
    <ComboboxAnchor class="relative block min-w-0">
        <!-- 1. Readonly Input (Handles accessibility & keyboard tab focus) -->
        <ComboboxInput
            ref="input"
            :id="id"
            :class="[
                'block h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground transition placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 rtl:pl-9 rtl:pr-3',
                triggerClass
            ]"
            :placeholder="placeholder"
            readonly
        />

        <!-- 2. Transparent Overlay (Prevents browser pointer-focus override, delegates click) -->
        <div
            class="absolute inset-y-0 left-0 right-9 cursor-pointer rtl:left-9 rtl:right-0"
            @click.stop="focusAndToggle"
            @mousedown.stop.prevent
        ></div>

        <!-- 3. Chevron Trigger -->
        <ComboboxTrigger
            ref="trigger"
            class="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground transition hover:text-foreground rtl:left-0 rtl:right-auto rtl:rounded-l-md rtl:rounded-r-none"
            type="button"
            aria-label="Open options"
        >
            <ChevronDown class="h-4 w-4" aria-hidden="true" />
        </ComboboxTrigger>
    </ComboboxAnchor>

    <!-- 4. Absolute positioned inline overlay (No Portals) -->
    <ComboboxContent
        class="absolute z-[80] left-0 mt-1 max-h-64 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
    >
        <ComboboxViewport ref="viewport" class="max-h-64 overflow-y-auto p-1">
            <!-- 5. Bind data-selected to track selection in DOM -->
            <ComboboxItem
                class="cursor-pointer rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                :value="emptyOption"
                :data-selected="modelValue === null || modelValue === undefined || modelValue === ''"
            >
                {{ placeholder }}
            </ComboboxItem>

            <ComboboxItem
                v-for="option in options"
                :key="String(option[valueKey])"
                class="cursor-pointer rounded-sm px-3 py-2 text-sm text-popover-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                :value="option"
                :data-selected="String(option[valueKey]) === String(modelValue)"
            >
                {{ option[labelKey] }}
            </ComboboxItem>

            <ComboboxEmpty class="px-3 py-2 text-sm text-muted-foreground">
                {{ emptyLabel }}
            </ComboboxEmpty>
        </ComboboxViewport>
    </ComboboxContent>
</ComboboxRoot>
</template>

<script>
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxRoot,
    ComboboxTrigger,
    ComboboxViewport,
} from "radix-vue";
import { ChevronDown } from "@lucide/vue";

export default {
    name: "AdminCombobox",
    components: {
        ComboboxAnchor,
        ComboboxContent,
        ComboboxEmpty,
        ComboboxInput,
        ComboboxItem,
        ComboboxRoot,
        ComboboxTrigger,
        ComboboxViewport,
        ChevronDown,
    },
    props: {
        id: { type: String, default: null },
        modelValue: { type: [Number, String], default: null },
        options: { type: Array, default: () => [] },
        labelKey: { type: String, default: "name" },
        valueKey: { type: String, default: "id" },
        placeholder: { type: String, default: "--" },
        emptyLabel: { type: String, default: "No results found." },
        triggerClass: { type: [String, Array, Object], default: "" },
    },
    emits: ["update:modelValue", "search-change"],
    data() {
        return {
            isOpen: false,
            emptyOption: {
                __empty: true,
                id: "__none",
                name: this.placeholder,
            },
        };
    },
    computed: {
        selectedOption() {
            if (this.modelValue === null || this.modelValue === undefined) {
                return this.emptyOption;
            }
            return this.options.find(
                (option) => String(option[this.valueKey]) === String(this.modelValue)
            ) || this.emptyOption;
        },
    },
    watch: {
        // 6. Asynchronous Scroll-Into-View Watcher
        isOpen(val) {
            if (val) {
                const scroll = () => {
                    const viewport = this.$refs.viewport?.$el || this.$refs.viewport;
                    if (viewport) {
                        const selectedEl = viewport.querySelector('[data-selected="true"]');
                        if (selectedEl) {
                            selectedEl.scrollIntoView({ block: 'nearest' });
                        }
                    }
                };
                // Fire multiple times to account for DOM render cycles and delayed library focus events
                this.$nextTick(scroll);
                setTimeout(scroll, 50);
                setTimeout(scroll, 150);
                setTimeout(scroll, 300);
                setTimeout(scroll, 500);
            }
        },
    },
    methods: {
        // 7. Click Delegation method
        focusAndToggle() {
            const trigger = this.$refs.trigger?.$el || this.$refs.trigger;
            if (trigger) {
                trigger.click();
            }
        },
        displayValue(option) {
            if (!option || option.__empty) return "";
            return String(option[this.labelKey] || "");
        },
        filterOptions(options, term) {
            if (!term) return options;
            const normalizedTerm = String(term).toLowerCase();
            return options.filter((option) => {
                if (option.__empty) return true;
                return String(option[this.labelKey] || "")
                    .toLowerCase()
                    .includes(normalizedTerm);
            });
        },
        updateSearch(term) {
            this.$emit("search-change", term);
        },
        updateValue(option) {
            if (!option || option.__empty) {
                this.$emit("update:modelValue", null);
                return;
            }
            this.$emit("update:modelValue", option[this.valueKey]);
        },
    },
};
</script>
```

---

## 4. Summary of Completed Work

- **Dropdown Upgrades in Site Settings:** Upgraded the Date Format, Default Language, and Default Timezone fields in `SiteComponent.vue` to use the modern styled dropdown.
- **Keyboard Type-Ahead (Blind Typing):** Built a custom type-ahead logic in `AdminCombobox.vue` that intercepts keypresses, buffers them, matches option names (by "starts with" and "includes" heuristics), and selects the corresponding option.
- **Auto-Scroll on Keypress:** Connected a watcher to `modelValue` inside `AdminCombobox.vue` so that when a selection is matched and updated via keyboard typing, the viewport instantly scrolls to center it.
- **Build Verification:** Recompiled all assets successfully with Vite with no compiler errors.

---

## 5. Usage in Admin Pages

For all admin pages/forms, use `AdminCombobox` instead of native selects or raw shadcn `<Select>`:

```vue
<AdminCombobox
    v-model="form.timezone"
    :options="timezones"
    label-key="name"
    value-key="name"
    placeholder="Select timezone..."
/>
```

**Key file:** `resources/js/components/admin/components/filters/AdminCombobox.vue`

## When to still use native `<select>`

For destructive admin tools or critical paths where reliability matters more than custom styling, prefer native `<select>` elements. Example: the Power Prune page uses native selects for Target and Time Range because it's a destructive operation.
