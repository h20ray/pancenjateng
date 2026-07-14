# Checkbox / multi-select state management

**Status:** Active guardrail

## Rule

Do not keep separate checked/disabled/form arrays for any checkbox or multi-select UI. Use one source of truth, preferably a `Set` of selected IDs. Derive all checkbox visual state from that Set. Implement parent/child toggle rules as pure helper functions and test them before touching UI. Avoid mutating arrays while looping and avoid using stale backend fields for live UI state.

This applies to **all** components with hierarchical or grouped checkboxes — permissions, role assignment, category selection, feature toggles, bulk selection, etc.

## Context

A previous permission checkbox bug came from bad state design where three separate states tried to represent the same thing:

```js
form: []
disabledStatue: {}
checkedStatue: {}
```

Problems with that approach:
- Backend `access` field was used for parent checked state, but `checkedStatue` was used for children
- Parent toggles flipped `disabledStatue` instead of deriving it from selected items
- `form` could get duplicate IDs
- Removing IDs used manual array loops while mutating the same array
- Child toggles did not reliably sync parent state
- The UI mixed backend-loaded flags with local interactive state, so after clicking the visual state could be stale or inconsistent

## Correct pattern

One source of truth:

```js
const selectedIds = reactive(new Set())
const initialIds = reactive(new Set()) // for dirty checking / reset
```

All checkbox state is derived:

```js
const isSelected = (id) => selectedIds.has(id)
const isIndeterminate = (parentId, childIds) =>
    childIds.some(id => selectedIds.has(id)) && !childIds.every(id => selectedIds.has(id))
```

## Toggle rules (for hierarchical checkboxes)

- **Parent ON:** add parent ID + all child IDs
- **Parent OFF:** remove parent ID + all child IDs
- **Child ON:** add child ID + parent ID
- **Child OFF:** remove only child ID, keep parent ID (or remove parent if no children remain — depends on business rule)
- **Save payload:** convert the Set to a sorted unique array

## Implementation requirements

1. Keep toggle logic in a dedicated helper or composable file
2. Write unit tests for the toggle functions before modifying UI
3. Never derive checkbox visual state from backend response fields after initial load — use the local Set
4. Never mutate an array while iterating over it to remove items
5. For flat (non-hierarchical) multi-select, still use a Set — no parallel arrays

## Applies to

- Permission assignment (`resources/js/components/admin/settings/Permission/`)
- Any role/permission matrix UI
- Category tree selection
- Bulk action checkboxes (select all / deselect all)
- Feature flag toggles with dependencies
- Any future component with grouped or hierarchical checkboxes
