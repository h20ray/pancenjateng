# i18n keys must exist before using them

**Status:** Active guardrail

## Rule

When creating or modifying Vue components that use `t("key")`, `$t("key")`, or any i18n translation function, you **must** also add the corresponding keys to **both** locale files:

- `resources/js/languages/en.json`
- `resources/js/languages/id.json`

## Process

1. Before using any `t("attendance.some_key")` in a component, check if the key exists in both locale files.
2. If the key does NOT exist, add it to both `en.json` and `id.json` in the same task/change.
3. Never invent translation keys without adding them to the locale files.

## How to check

```bash
grep -c "some_key" resources/js/languages/en.json
```

If the count is 0, the key is missing and must be added.

## Locale file structure

Keys are nested by module. Attendance keys live under the `"attendance"` object in both JSON files. Example:

```json
{
    "attendance": {
        "existing_key": "English value",
        "new_key": "New English value"
    }
}
```

## No exceptions

Every `t()` call must resolve to an existing key. Missing keys cause runtime warnings and show raw key strings to users.
