import type { Ouvrage, PageOuvrages } from './ouvrage';

export type ChampBascule = 'lu' | 'favori';

export type IntentionBascule = {
  id: string;
  champ: ChampBascule;
  valeur: boolean;
};

export const appliquerIntention = (ouvrage: Ouvrage, intention: IntentionBascule): Ouvrage => {
  if (ouvrage.id !== intention.id) return ouvrage;
  return intention.champ === 'lu'
    ? { ...ouvrage, lu: intention.valeur }
    : { ...ouvrage, favori: intention.valeur };
};

export const remplacerOuvrageDansPage = (page: PageOuvrages, ouvrage: Ouvrage): PageOuvrages =>
  page.items.some(({ id }) => id === ouvrage.id)
    ? {
        ...page,
        items: page.items.map((courant) => (courant.id === ouvrage.id ? ouvrage : courant)),
      }
    : page;

export const libelleCoupDeCoeur = (favori: boolean): string =>
  favori ? 'Coup de cœur' : 'Pas un coup de cœur';

export const libelleActionCoupDeCoeur = (favori: boolean, titre?: string): string => {
  const action = favori ? 'Retirer le coup de cœur' : 'Marquer comme coup de cœur';
  return titre === undefined ? action : `${action} : ${titre}`;
};
