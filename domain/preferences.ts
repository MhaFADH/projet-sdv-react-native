import { z } from 'zod';

export const PREFERENCES_THEME = ['systeme', 'clair', 'sombre'] as const;
export const LANGUES = ['fr', 'en'] as const;

export type PreferenceTheme = (typeof PREFERENCES_THEME)[number];
export type Langue = (typeof LANGUES)[number];
export type ApparenceEffective = 'clair' | 'sombre';

export const PREFERENCE_THEME_INITIALE: PreferenceTheme = 'systeme';
export const LANGUE_INITIALE: Langue = 'fr';

const schemaPreferenceTheme = z.enum(PREFERENCES_THEME);
const schemaLangue = z.enum(LANGUES);

const LOCALES: Record<Langue, string> = {
  fr: 'fr-FR',
  en: 'en-US',
};

export const lirePreferenceTheme = (valeur: unknown): PreferenceTheme =>
  schemaPreferenceTheme.safeParse(valeur).data ?? PREFERENCE_THEME_INITIALE;

export const lireLangue = (valeur: unknown): Langue =>
  schemaLangue.safeParse(valeur).data ?? LANGUE_INITIALE;

export const localeDeLangue = (langue: Langue): string => LOCALES[langue];

export const apparenceEffective = (
  preference: PreferenceTheme,
  apparenceSysteme: ApparenceEffective,
): ApparenceEffective => (preference === 'systeme' ? apparenceSysteme : preference);
