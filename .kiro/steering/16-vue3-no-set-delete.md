# Vue 3 reactivity: no `this.$set`, `Vue.set`, or `this.$delete`

**Status:** Active guardrail — this project runs Vue 3, not Vue 2. Vue 3 uses JavaScript Proxies for reactivity, making the old `$set` / `$delete` APIs unnecessary and non-existent.

## Rule

**Never** use `this.$set()`, `Vue.set()`, or `this.$delete()` in any component. Vue 3's Proxy-based reactivity detects new property additions and deletions automatically — assign directly.

## Why

Vue 2's reactivity was based on `Object.defineProperty`, which couldn't detect new property additions. `Vue.set()` / `this.$set()` were required to make new properties reactive. Vue 3 replaced this with ES6 Proxies, which intercept all property access — `$set` was removed.

Calling `this.$set()` in Vue 3 throws:
```
TypeError: this.$set is not a function
```

## Before (Vue 2 — wrong in this project)

```js
this.$set(widget, 'config', { item_type_ids: [] });
this.$set(widget.config, 'item_type_ids', []);
this.$delete(someObject, 'key');
```

## After (Vue 3 — correct)

```js
widget.config = { item_type_ids: [] };
widget.config.item_type_ids = [];
delete someObject.key;
```

## Common pitfall: reactive arrays

When assigning arrays to objects that may not have been in the initial data, Vue 3 handles it fine. The old pattern of pre-declaring empty values in `data()` to make them reactive is also unnecessary:

```js
// Vue 2 (unnecessary in Vue 3)
data() { return { widgetConfigOpen: null, itemTypes: [] }; }
```

```js
// Vue 3 — still declare in data() for clarity, but new properties added
// later (like widget.config = { item_type_ids: [] }) are automatically reactive.
```

## Related

- [[01-no-new-vuex-stores]] — Vuex is removed; use Pinia
- [[04-shadcn-vue-conventions]] — shadcn-vue / Radix Vue conventions
- [[07-select-component-pattern]] — Options API portal destruction issue (related: Radix components use portals)
