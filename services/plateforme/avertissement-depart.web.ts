import type { SaisieModifiee } from './avertissement-depart';

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
