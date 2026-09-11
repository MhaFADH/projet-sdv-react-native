import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUE_INITIALE, type Langue } from '@/domain/preferences';
import { en } from './traductions/en';
import { fr } from './traductions/fr';

export const ESPACE_TRADUCTION = 'interface';

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources: {
      fr: { [ESPACE_TRADUCTION]: fr },
      en: { [ESPACE_TRADUCTION]: en },
    },
    lng: LANGUE_INITIALE,
    fallbackLng: LANGUE_INITIALE,
    defaultNS: ESPACE_TRADUCTION,
    ns: [ESPACE_TRADUCTION],
    interpolation: { escapeValue: false },
  });
}

export const traduire = i18next.t;

export const appliquerLangue = (langue: Langue): void => {
  void i18next.changeLanguage(langue);
};
