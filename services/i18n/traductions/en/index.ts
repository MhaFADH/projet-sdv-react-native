import type { fr } from '../fr';
import { communsEn } from './communs';
import { ecritureEn } from './ecriture';
import { ficheEn } from './fiche';
import { fondsEn } from './fonds';
import { notesEn } from './notes';
import { preferencesEn } from './preferences';

type MemeStructure<Modele> = {
  [Cle in keyof Modele]: Modele[Cle] extends string ? string : MemeStructure<Modele[Cle]>;
};

export const en: MemeStructure<typeof fr> = {
  ...preferencesEn,
  ...fondsEn,
  ...ficheEn,
  ...ecritureEn,
  ...notesEn,
  ...communsEn,
};
