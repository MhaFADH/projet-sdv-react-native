import { construireUrlApi } from './api/url-api';

const LARGEUR_REPLI = 160;
const HAUTEUR_REPLI = 240;
const URL_REPLI = 'https://picsum.photos/seed';
const PROTOCOLES_IMAGES = new Set(['http:', 'https:']);
const SCHEMA_URL = /^[a-z][a-z\d+.-]*:/i;

export type CouvertureResolue = { type: 'distante'; url: string } | { type: 'locale' };

const creerUrlRepli = (identifiant: string): string =>
  `${URL_REPLI}/${encodeURIComponent(identifiant)}/${LARGEUR_REPLI}/${HAUTEUR_REPLI}`;

export const resoudreCouverture = (
  valeur: string | null,
  identifiant: string,
): CouvertureResolue => {
  if (valeur === null) return { type: 'distante', url: creerUrlRepli(identifiant) };

  const couverture = valeur.trim();
  if (couverture === '') return { type: 'locale' };

  if (SCHEMA_URL.test(couverture)) {
    try {
      const url = new URL(couverture);
      return PROTOCOLES_IMAGES.has(url.protocol)
        ? { type: 'distante', url: couverture }
        : { type: 'locale' };
    } catch {
      return { type: 'locale' };
    }
  }

  const chemin = couverture.startsWith('/') ? couverture : `/${couverture}`;
  return { type: 'distante', url: construireUrlApi(chemin) };
};
