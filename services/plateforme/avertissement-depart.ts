export type SaisieModifiee = () => boolean;

/**
 * Interface commune : hors navigateur, aucun événement de départ du document
 * n'existe et aucune protection n'est donc promise.
 */
export const installerAvertissementDepart =
  (_saisieModifiee: SaisieModifiee): (() => void) =>
  () => {};
