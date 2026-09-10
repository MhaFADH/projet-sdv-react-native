import { z } from 'zod';
import { LONGUEUR_MAXIMALE_NOTE, type NoteLecture } from '@/domain/note-lecture';
import type { NoteSaisie } from '@/domain/saisie-note';
import { clientHttp } from './client-http';
import { creerErreurValidation } from './erreurs';

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
    throw creerErreurValidation('La réponse du serveur pour les notes est invalide.');
  }
  return resultat.data;
};

/**
 * Volontairement non annulable : abandonner un `POST` en vol produirait
 * exactement le résultat incertain que ce parcours cherche à éviter.
 */
export const ajouterNote = async (livreId: string, saisie: NoteSaisie): Promise<NoteLecture> => {
  const corps = await clientHttp.post(cheminNotes(livreId), { contenu: saisie.contenu });
  const resultat = schemaNoteLecture.safeParse(corps);
  if (!resultat.success || resultat.data.livreId !== livreId) {
    throw creerErreurValidation('La réponse du serveur pour la note ajoutée est invalide.');
  }
  return resultat.data;
};
