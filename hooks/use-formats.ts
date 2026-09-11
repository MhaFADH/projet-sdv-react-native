import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { lireLangue, localeDeLangue } from '@/domain/preferences';
import '@/services/i18n';

export type Formats = {
  locale: string;
  nombre: (valeur: number) => string;
};

export const useFormats = (): Formats => {
  const { i18n } = useTranslation();
  const locale = localeDeLangue(lireLangue(i18n.language));
  return useMemo(
    () => ({ locale, nombre: (valeur: number) => new Intl.NumberFormat(locale).format(valeur) }),
    [locale],
  );
};
