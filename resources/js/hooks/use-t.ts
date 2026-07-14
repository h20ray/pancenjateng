import { useIntl } from 'react-intl';

/**
 * Thin wrapper around react-intl's useIntl().formatMessage.
 * Returns a simple `t('namespace.key')` function matching
 * the niskala vue-i18n pattern.
 */
export function useT() {
  const intl = useIntl();

  const t = (key: string): string => {
    const msg = intl.formatMessage({ id: key, defaultMessage: key });
    // If formatMessage returns the key itself, it wasn't found — return key
    return msg || key;
  };

  const te = (key: string): boolean => {
    return intl.messages && key in intl.messages;
  };

  return { t, te };
}
