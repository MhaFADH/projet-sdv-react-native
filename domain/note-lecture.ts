export const LONGUEUR_MAXIMALE_NOTE = 1_000;

export type NoteLecture = {
  id: string;
  livreId: string;
  contenu: string;
  createdAt: string;
};

const OPTIONS_DATE_NOTE: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const formatteursParLocale = new Map<string, Intl.DateTimeFormat>();

const formatteurDateNote = (locale: string): Intl.DateTimeFormat => {
  const existant = formatteursParLocale.get(locale);
  if (existant) return existant;
  const formatteur = new Intl.DateTimeFormat(locale, OPTIONS_DATE_NOTE);
  formatteursParLocale.set(locale, formatteur);
  return formatteur;
};

export const formaterDateNote = (createdAt: string, locale: string): string =>
  formatteurDateNote(locale).format(new Date(createdAt));

const LONGUEUR_EXTRAIT_NOTE = 80;

export const extraitNote = (contenu: string): string =>
  contenu.length <= LONGUEUR_EXTRAIT_NOTE
    ? contenu
    : `${contenu.slice(0, LONGUEUR_EXTRAIT_NOTE).trimEnd()}…`;
