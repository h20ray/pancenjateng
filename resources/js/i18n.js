import { createI18n } from "vue-i18n";

// ── Indonesian critical namespaces (eagerly loaded — always in main bundle) ──
import idMenu from "./languages/id/menu.json";
import idLabel from "./languages/id/label.json";
import idButton from "./languages/id/button.json";
import idNotification from "./languages/id/notification.json";
import idMessage from "./languages/id/message.json";

const idMessages = {
    menu: idMenu,
    label: idLabel,
    button: idButton,
    notification: idNotification,
    message: idMessage,
};

const i18n = createI18n({
    legacy: false,
    locale: "id",
    fallbackLocale: "id",
    messages: { id: idMessages },
});

// ── Indonesian non-critical namespaces (lazy-loaded in background) ───────────
const CRITICAL = new Set([
    "menu", "label", "button", "notification", "message",
]);
const idLazyModules = import.meta.glob("./languages/id/*.json");
const idLazyLoaders = Object.entries(idLazyModules).filter(([path]) => {
    const ns = path.replace(/^.*[\\/]/, "").replace(/\.json$/, "");
    return !CRITICAL.has(ns);
});
if (idLazyLoaders.length > 0) {
    Promise.all(
        idLazyLoaders.map(async ([path, loader]) => {
            const mod = await loader();
            const ns = path.replace(/^.*[\\/]/, "").replace(/\.json$/, "");
            return [ns, mod.default];
        })
    ).then((entries) => {
        i18n.global.mergeLocaleMessage("id", Object.fromEntries(entries));
    }).catch(() => {});
}

// ── English locale (lazy-loaded in the background) ──────────────────
const enModules = import.meta.glob("./languages/en/*.json");
const enLoaders = Object.entries(enModules);
if (enLoaders.length > 0) {
    Promise.allSettled(
        enLoaders.map(async ([path, loader]) => {
            const mod = await loader();
            const namespace = path.replace(/^.*[\\/]/, "").replace(/\.json$/, "");
            return { namespace, messages: mod.default };
        })
    ).then((results) => {
        const entries = {};
        for (const result of results) {
            if (result.status === 'fulfilled') {
                entries[result.value.namespace] = result.value.messages;
            }
        }
        if (Object.keys(entries).length > 0) {
            i18n.global.setLocaleMessage("en", entries);
        }
    }).catch(() => {});
}

export default i18n;
