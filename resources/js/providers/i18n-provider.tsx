import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
  CRITICAL,
  enLazyModules,
  idModules,
  loadLazyLocale,
  flattenMessages,
} from '@/i18n/config';
import { I18nProviderProps, type Language } from '@/i18n/types';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
import { IntlProvider } from 'react-intl';
import { getData, setData } from '@/lib/storage';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/id';

const getInitialLanguage = () => {
  const stored = getData(I18N_CONFIG_KEY) as Language | undefined;
  return stored ?? I18N_DEFAULT_LANGUAGE;
};

const initialProps: I18nProviderProps = {
  currentLanguage: getInitialLanguage(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeLanguage: (_: Language) => {},
  isRTL: () => false,
};

const TranslationsContext = createContext<I18nProviderProps>(initialProps);
const useLanguage = () => useContext(TranslationsContext);

const I18nProvider = ({ children }: PropsWithChildren) => {
  const [currentLanguage, setCurrenLanguage] = useState(
    initialProps.currentLanguage,
  );
  const [lazyMessages, setLazyMessages] = useState<
    Record<string, Record<string, string>>
  >({});

  // Boot: load non-critical messages for current locale in background
  useEffect(() => {
    let cancelled = false;

    if (currentLanguage.code === 'en') {
      loadLazyLocale(enLazyModules, {})
        .then((messages) => {
          if (!cancelled) setLazyMessages(messages);
        })
        .catch(() => {
          // Lazy messages are non-critical — silently ignore load failures
        });
    } else {
      const loadAll = async () => {
        const raw: Record<string, Record<string, string>> = {};
        const promises = Object.entries(idModules).map(async ([path, loader]) => {
          const ns = path.replace('./messages/id/', '').replace('.json', '');
          if (CRITICAL.has(ns)) return;
          try {
            const mod = await loader();
            raw[ns] = mod.default ?? mod;
          } catch {
            // Skip individual module failures
          }
        });
        await Promise.all(promises);
        if (!cancelled) setLazyMessages(raw);
      };
      loadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [currentLanguage.code]);

  const changeLanguage = (language: Language) => {
    setData(I18N_CONFIG_KEY, language);
    setCurrenLanguage(language);
    setLazyMessages({});
  };

  const isRTL = () => {
    return currentLanguage.direction === 'rtl';
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', currentLanguage.direction);
  }, [currentLanguage]);

  // Compose messages: base (critical) + lazy-loaded
  const messages = {
    ...currentLanguage.messages,
    ...flattenMessages(lazyMessages),
  } as Record<string, string>;

  return (
    <TranslationsContext.Provider
      value={{
        isRTL,
        currentLanguage,
        changeLanguage,
      }}
    >
      <IntlProvider
        messages={messages}
        locale={currentLanguage.code}
        defaultLocale={I18N_DEFAULT_LANGUAGE.code}
      >
        <RadixDirectionProvider dir={currentLanguage.direction}>
          {children}
        </RadixDirectionProvider>
      </IntlProvider>
    </TranslationsContext.Provider>
  );
};

export { I18nProvider, useLanguage };
