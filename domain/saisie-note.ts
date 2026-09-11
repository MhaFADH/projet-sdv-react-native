import { z } from 'zod';
import { LONGUEUR_MAXIMALE_NOTE } from './note-lecture';

export type ChampSaisieNote = 'contenu';

const CHAMP_CONTENU: ChampSaisieNote = 'contenu';

export type MessagesSaisieNote = {
  obligatoire: string;
  longueurMaximale: (maximum: number) => string;
};

export const creerSaisieNoteSchema = (messages: MessagesSaisieNote) =>
  z.object({
    contenu: z
      .string()
      .trim()
      .min(1, messages.obligatoire)
      .pipe(
        z.string().max(LONGUEUR_MAXIMALE_NOTE, messages.longueurMaximale(LONGUEUR_MAXIMALE_NOTE)),
      ),
  });

type SchemaSaisieNote = ReturnType<typeof creerSaisieNoteSchema>;

export type SaisieNote = z.input<SchemaSaisieNote>;

export type NoteSaisie = z.output<SchemaSaisieNote>;

export const SAISIE_NOTE_VIDE: SaisieNote = { contenu: '' };

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
