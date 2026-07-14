# No monolith components & DRY principle

**Status:** Active guardrail

## Rule: No monolith components

Vue components must stay focused and small. If a component exceeds ~200 lines of template or ~300 lines total, decompose it into sub-components.

**Signs a component is too large:**
- Multiple unrelated sections in the template (e.g., header + form + table + modal all in one file)
- More than 3 distinct "panels" or "sections" rendered inline
- Repeated template patterns that could be extracted

**What to do:**
- Extract logical sections into child components (e.g., `KpiPanel.vue`, `FilterPanel.vue`, `RecordsTable.vue`)
- Page-level components should orchestrate sub-components, not contain all the markup
- Each component should have a single responsibility

## Rule: DRY (Don't Repeat Yourself)

Do not duplicate logic, patterns, or markup across files.

**Common violations:**
- Same formatting function written inline in multiple components → extract to `utils/`
- Same status-to-class mapping repeated → create a shared utility
- Same API call pattern duplicated → use the Pinia store action
- Same toast/error handling boilerplate → use a shared composable or helper
- Same i18n key values hardcoded in tests instead of referencing a shared mock

**What to do:**
1. Before writing a utility function, check if one already exists in `resources/js/utils/`
2. Before writing a composable, check `resources/js/composables/` and component-level `composables/` folders
3. Shared UI patterns (status badges, loading states, error handling) should be extracted into reusable components or utilities
4. If you find yourself copying code from one component to another, stop and extract it

## Practical guidelines

| Pattern | Wrong | Right |
|---|---|---|
| Duration formatting | Inline `Math.floor(m/60) + 'j'` in 3 files | `formatMinutesToHours()` from `utils/attendanceFormat.js` |
| Status badge colors | Repeated switch/if in each component | `attendanceStatusBadge()` from `utils/attendanceStatus.js` |
| Error toast handling | Same try/catch + createToast in every action | Shared pattern via store or composable |
| API calls | Direct axios in components | Pinia store actions |
| Form validation | Same checks duplicated | Extract validation logic or use a composable |

## No exceptions

Every new piece of logic should have exactly one source of truth. If it's used in more than one place, it belongs in a shared module.
