import { type MessageFormatElement } from 'react-intl';

export type LanguageCode = 'en' | 'id';

export type LanguageDirection = 'ltr' | 'rtl';

export interface Language {
  label: string;
  code: LanguageCode;
  direction: LanguageDirection;
  flag: string;
  messages: Record<string, string> | Record<string, MessageFormatElement[]>;
}

export interface I18nProviderProps {
  currentLanguage: Language;
  isRTL: () => boolean;

  changeLanguage: (lang: Language) => void;
}
