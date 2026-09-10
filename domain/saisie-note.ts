import { z } from 'zod';
import { LONGUEUR_MAXIMALE_NOTE } from './note-lecture';

export type ChampSaisieNote = 'contenu';

const CHAMP_CONTENU: ChampSaisieNote = 'contenu';

export const saisieNoteSchema = z.object({
  contenu: z
    .string()
    .trim()
    .min(1, 'Le contenu de la note est obligatoire.')
    .pipe(
      z
        .string()
        .max(
          LONGUEUR_MAXIMALE_NOTE,
          `La note ne peut pas dépasser ${LONGUEUR_MAXIMALE_NOTE} caractères.`,
        ),
    ),
});

export type SaisieNote = z.input<typeof saisieNoteSchema>;

export type NoteSaisie = z.output<typeof saisieNoteSchema>;

export const SAISIE_NOTE_VIDE: SaisieNote = { contenu: '' };

/**
 * Le serveur retire les espaces périphériques avant de mesurer le contenu :
 * le compteur affiche donc la longueur réellement envoyée.
 */
export const longueurContenuNote = (contenu: string): number => contenu.trim().length;

export const saisieNoteRenseignee = (contenu: string): boolean => longueurContenuNote(contenu) > 0;

export type RefusServeurNote = {
  parChamp: Partial<Record<ChampSaisieNote, string>>;
  horsFormulaire: string[];
};

export const repartirRefusNote = (champs?: Record<string, string>): RefusServeurNote => {
  const refus: RefusServeurNote = { parChamp: {}, horsFormulaire: [] };

  for (const [cle, message] of Object.entries(champs ?? {})) {
    if (cle === CHAMP_CONTENU) {
      refus.parChamp.contenu = message;
      continue;
    }
    refus.horsFormulaire.push(`${cle} : ${message}`);
  }

  return refus;
};
