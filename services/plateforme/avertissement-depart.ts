export type SaisieModifiee = () => boolean;

export const installerAvertissementDepart =
  (_saisieModifiee: SaisieModifiee): (() => void) =>
  () => {};
