# No Vuex (removed)

**Status:** Completed — Vuex has been fully removed from the project.

## Rule

Do **not** add Vuex or any Vuex-like store pattern. All state management **must** use Pinia.

## Context

The Vuex → Pinia migration (Phase 2b) is complete. The `resources/js/store/` directory and the `vuex` dependency no longer exist. Pinia is the sole state management solution.

## What to do

1. Create new stores under `resources/js/stores/` using `defineStore`:
   ```js
   // resources/js/stores/useExampleStore.js
   import { defineStore } from 'pinia'

   export const useExampleStore = defineStore('example', {
     state: () => ({ /* ... */ }),
     getters: { /* ... */ },
     actions: { /* ... */ },
   })
   ```
2. Use Composition API (`<script setup>`) for new components where practical.
3. Access stores via composable pattern: `const store = useExampleStore()`.

## No exceptions

Vuex is gone. There is nothing to extend or maintain. Any state management must use Pinia.
