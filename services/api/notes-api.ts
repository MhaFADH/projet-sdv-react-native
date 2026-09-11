import { z } from 'zod';
import { LONGUEUR_MAXIMALE_NOTE, type NoteLecture } from '@/domain/note-lecture';
import type { NoteSaisie } from '@/domain/saisie-note';
import { traduire } from '@/services/i18n';
import { clientHttp } from './client-http';
import { creerErreurValidation, estErreurApplication } from './erreurs';

const schemaNoteLecture = z.object({
  id: z.string(),
  livreId: z.string(),
  contenu: z.string().max(LONGUEUR_MAXIMALE_NOTE),
  createdAt: z.string().datetime({ local: true }),
});

const schemaNotesLecture = z.array(schemaNoteLecture);

const cheminNotes = (livreId: string): string => `/books/${encodeURIComponent(livreId)}/notes`;

export const recupererNotes = async (
  livreId: string,
  signal?: AbortSignal,
): Promise<NoteLecture[]> => {
  const corps = await clientHttp.get(cheminNotes(livreId), { signal });
  const resultat = schemaNotesLecture.safeParse(corps);
  if (!resultat.success || resultat.data.some((note) => note.livreId !== livreId)) {
    throw creerErreurValidation(traduire('erreursHttp.reponseNotes'));
  }
  return resultat.data;
};

export const ajouterNote = async (livreId: string, saisie: NoteSaisie): Promise<NoteLecture> => {
  const corps = await clientHttp.post(cheminNotes(livreId), { contenu: saisie.contenu });
  const resultat = schemaNoteLecture.safeParse(corps);
  if (!resultat.success || resultat.data.livreId !== livreId) {
    throw creerErreurValidation(traduire('erreursHttp.reponseNoteAjoutee'));
  }
  return resultat.data;
};

export type IssueSuppressionNote = 'supprimee' | 'deja-absente';

export const supprimerNote = async (
  livreId: string,
  noteId: string,
): Promise<IssueSuppressionNote> => {
  try {
    await clientHttp.supprimer(`${cheminNotes(livreId)}/${encodeURIComponent(noteId)}`);
    return 'supprimee';
  } catch (cause) {
    if (estErreurApplication(cause) && cause.type === 'introuvable') return 'deja-absente';
    throw cause;
  }
};
