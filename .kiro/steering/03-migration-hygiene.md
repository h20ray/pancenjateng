# Migration hygiene

**Status:** Active guardrail (Phase 0 of the modernization roadmap — see `docs/ROADMAP.md`).

## Context

`database/migrations/` currently holds ~99 files, including several corrective migrations such as:

- `ensure_print_templates_schema_columns`
- `drop_legacy_print_templates_unique_index`
- `cleanup_role_labels_and_station_permissions`
- `migrate_orders_to_pos_payment_method_id`

These run on every fresh install and make `migrate:fresh` both slow and fragile. Phase 3 of the roadmap will squash pre-2026 migrations into a `schema:dump` baseline. Until then, follow the rules below.

## Rules

### 1. Write migrations correctly the first time
- Think through column types, nullability, indexes, and foreign keys **before** committing.
- Always include a matching `down()` that reverses the change. `down()` must not throw on a clean state.
- Use explicit names for indexes and foreign keys when a table has multiple.

### 2. Avoid follow-up "fix" or "cleanup" migrations
Do **not** add migrations whose purpose is to patch a previous migration in the same repository (e.g. `ensure_*_schema_columns`, `fix_*`, `cleanup_*`) unless one of the exceptions below applies:

- The flawed migration has **already been deployed to production**, and editing it in place would cause divergence between environments.
- You are correcting data (not schema) — document the data correction in the PR.

If the flawed migration has **not** yet reached production, edit the original migration instead and note `BREAKING: in-place migration edit` in the PR description.

### 3. No destructive operations without a data-preservation plan
- `dropColumn`, `dropTable`, `renameColumn`, and backfill migrations must include a short explanation in the migration docblock of what happens to existing data.
- For data backfills, prefer a queued job triggered by a lightweight migration over doing heavy work inside `up()`.

### 4. One logical change per migration
Each migration file should represent **one** atomic change (e.g. "add `customer_name` to `orders`"), not a grab-bag of unrelated schema changes.

### 5. Test against a fresh DB before opening a PR
Run `php artisan migrate:fresh --seed` locally on a clean database before pushing. If it fails, the migration chain is broken.

## Allowed exceptions

Any deviation must be documented in the PR body with the phrase `migration hygiene exception:` followed by the rationale.
