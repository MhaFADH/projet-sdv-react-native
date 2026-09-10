import type { SaisieModifiee } from './avertissement-depart';

/**
 * L'avertissement de fermeture reste soumis aux limites du navigateur : il ne
 * sauvegarde rien et peut ne pas être présenté.
 */
export const installerAvertissementDepart = (saisieModifiee: SaisieModifiee): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const avertir = (evenement: BeforeUnloadEvent) => {
    if (!saisieModifiee()) return;
    evenement.preventDefault();
    evenement.returnValue = '';
  };

  window.addEventListener('beforeunload', avertir);
  return () => window.removeEventListener('beforeunload', avertir);
};
