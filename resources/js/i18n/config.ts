import { toAbsoluteUrl } from '@/lib/helpers';
import { type Language } from './types';

// ── Critical namespaces — eagerly loaded, always in main bundle ──
// These power the admin shell (sidebar, header, common buttons/labels).
import enMenu from './messages/en/menu.json';
import enButton from './messages/en/button.json';
import enLabel from './messages/en/label.json';
import enNotification from './messages/en/notification.json';

// ── Lazy namespaces — loaded in background after initial render ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enLazyModules = import.meta.glob<any>('./messages/en/*.json');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idModules = import.meta.glob<any>('./messages/id/*.json');

const CRITICAL = new Set(['menu', 'button', 'label', 'notification']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadLazyLocale(
  modules: Record<string, () => Promise<any>>,
  criticalEntries: Record<string, Record<string, string>>,
): Promise<Record<string, Record<string, string>>> {
  const entries: Record<string, Record<string, string>> = { ...criticalEntries };

  const promises = Object.entries(modules).map(async ([path, loader]) => {
    const ns = path.replace('./messages/en/', '').replace('./messages/id/', '').replace('.json', '');
    if (CRITICAL.has(ns)) return;
    const mod = await loader();
    entries[ns] = (mod.default ?? mod) as Record<string, string>;
  });

  await Promise.all(promises);
  return entries;
}

// Merge namespace objects into flat { "namespace.key": "value" } for react-intl
function flattenMessages(nsMessages: Record<string, Record<string, string>>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [ns, keys] of Object.entries(nsMessages)) {
    for (const [key, value] of Object.entries(keys)) {
      flat[`${ns}.${key}`] = value;
    }
  }
  return flat;
}

// ── Critical messages (eager, for default locale id) ──
const idCriticalEntries: Record<string, Record<string, string>> = {};
// Indonesian critical are also lazy — we eagerly ship the default locale only

const enCriticalEntries: Record<string, Record<string, string>> = {
  menu: enMenu,
  button: enButton,
  label: enLabel,
  notification: enNotification,
};

const enCriticalFlat = flattenMessages(enCriticalEntries);

// ── Language list ──
const I18N_CONFIG_KEY = 'i18nConfig';

const I18N_LANGUAGES: Language[] = [
  {
    label: 'English',
    code: 'en',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/united-states.svg'),
    messages: enCriticalFlat,
  },
  {
    label: 'Indonesia',
    code: 'id',
    direction: 'ltr',
    flag: toAbsoluteUrl('/media/flags/indonesia.svg'),
    messages: {},
  },
];

// Default is Indonesian — its critical messages are loaded lazily on boot
const I18N_DEFAULT_LANGUAGE: Language = I18N_LANGUAGES[1];

export {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
  enCriticalEntries,
  enLazyModules,
  idModules,
  loadLazyLocale,
  flattenMessages,
  CRITICAL,
};
