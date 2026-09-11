import type { ESPACE_TRADUCTION } from './index';
import type { fr } from './traductions/fr';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof ESPACE_TRADUCTION;
    resources: { [Espace in typeof ESPACE_TRADUCTION]: typeof fr };
  }
}
