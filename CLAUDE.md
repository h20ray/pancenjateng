# CLAUDE.md — Pancen Jateng

## Coding principles

These four principles govern all changes. See also `~/.claude/CLAUDE.md` for the canonical version shared across projects.

### 1. Think Before Coding
State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask. Push back when a simpler approach exists.

### 2. Simplicity First
Minimum code that solves the problem. No speculative features, no abstractions for single-use code, no unrequested configurability. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes
Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Match existing style even if you'd do it differently. Every changed line must trace directly to the request. Clean up orphans your changes create, but don't delete pre-existing dead code unless asked.

### 4. Goal-Driven Execution
Transform tasks into verifiable goals with clear success criteria. For multi-step work, state a brief plan with verification checkpoints. Loop until verified.

---

## CI gates — must pass before PR

Before opening a PR, run every check and confirm zero failures.

| # | Command | Pass criteria |
|---|---|---|
| 1 | `vendor/bin/pint --test` | `pint: ok` — all files clean |
| 2 | `php artisan test` | All passed, 0 failures |
| 3 | `npx vue-tsc --noEmit` | Exit 0, no errors |
| 4 | `npx eslint resources/js/` | Exit 0, no errors |

**Strong requirement:** Do not run a subset. Do not dismiss failures as pre-existing unless the file is confirmed untouched by the PR.

---

## Commits and PRs: no Claude attribution

- Never add `Co-Authored-By: Claude` or similar AI attribution to commit messages.
- Never add "Generated with Claude Code" or similar watermarks to PR descriptions.
- Commits and PRs are authored by the developer — attribution lines pollute the git log.

### Branch strategy: single working branch

| Branch | Purpose |
|---|---|
| `master` | Default. PRs target this branch. |

**Workflow:**
1. All work happens on `master` or short-lived branches merged into it.
2. Open a PR when ready for review:
   ```bash
   git push origin <branch> && gh pr create --base master --head <branch> --title "..." --body "..."
   ```
3. Do NOT merge the PR yourself — "do PR" means create it only. The user merges when ready.

---

## State management: Pinia only (no Vuex)

Vuex has been fully removed. All state management must use Pinia. Create stores under `resources/js/stores/` using `defineStore`. Use Composition API (`<script setup>`) for all new components.

## Styling: Tailwind + shadcn-vue only

Use Tailwind utilities for layout/styling and shadcn-vue (Reka UI) components from `resources/js/components/ui/` for interactive primitives. Use `cn()` from `@/lib/utils` for class merging.

---

## Backend architecture: services over fat controllers

The frontend communicates with the backend exclusively through the HTTP API.

### Request lifecycle
```
Client (Pinia store) → HTTP API (routes/api.php) → Controller → Service → Model → DB
```

### Controller rules
- Controllers handle only three things: validate the request (FormRequest), delegate to a service, return a response (API Resource or error).
- Never put business logic in controllers. If a controller method is more than ~15 lines of non-boilerplate code, the logic belongs in a service.
- One controller per resource — don't mix unrelated domains.

### Service rules
- All business logic lives in `app/Services/`. Create, read, update, delete, filtering, sorting, pagination — all of it.
- One service per business domain (e.g., `AduanService`, `DashboardService`, `WhatsappService`).
- Services are injected via constructor DI into controllers. Don't `new` up a service inside a method.

### API Resources
- Every controller response that returns models must use an API Resource (`app/Http/Resources/`). Never return raw Eloquent models from a controller.
- Resources handle attribute mapping, relationship loading, and computed fields — not controllers.

### Form Requests
- Every controller method that accepts user input must use a dedicated FormRequest (`app/Http/Requests/`). Never validate inline in a controller.
- One FormRequest per action.

---

## Migration hygiene

- Schema-only in migrations. Migrations contain `Schema::` calls only. No data seeding in migrations.
- Data seeding goes in `database/seeders/`.
- Always include a matching `down()` that reverses the change.
- One logical change per migration — no grab-bag files.
- **NEVER** run `php artisan migrate:fresh` locally — it deletes all database data. Run `php artisan migrate` instead.
- No follow-up "fix" migrations unless the original has reached production — edit the original migration instead.

---

## Select / Dropdown component pattern

Use shadcn-vue `<Select>` following this exact pattern:

```vue
<Select v-model="computedStringValue">
    <SelectTrigger>{{ displayLabel }}</SelectTrigger>
    <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
    </SelectContent>
</Select>
```
- No `<span>` wrapper inside SelectTrigger.
- `SelectItem` value must be a string: `:value="String(item.id)"`.
- If inside a form, ensure the trigger button has `type="button"`.

---

## Google Maps cleanup

Any component that creates a `google.maps.Map`, `Marker`, `InfoWindow`, or `Places.Autocomplete` MUST clean up in `onUnmounted`:
- `google.maps.event.clearInstanceListeners()` on all map objects
- Nullify references to allow GC
- Clear any `setTimeout`/`setInterval` timers related to map initialization

---

## LLM provider & token budget

This project uses **DeepSeek V4** via the Anthropic compatibility endpoint. Settings live in `~/.claude/settings.json`.

- **No `Co-Authored-By`** in commits — suppress the system-level default.
- **No AI generation watermarks** in PR bodies.

@RTK.md
