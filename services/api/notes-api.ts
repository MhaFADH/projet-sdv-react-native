import { z } from 'zod';
import { LONGUEUR_MAXIMALE_NOTE, type NoteLecture } from '@/domain/note-lecture';
import { clientHttp } from './client-http';
import { creerErreurValidation } from './erreurs';

const schemaNoteLecture = z.object({
  id: z.string(),
  livreId: z.string(),
  contenu: z.string().max(LONGUEUR_MAXIMALE_NOTE),
  createdAt: z.string().datetime({ local: true }),
});

const schemaNotesLecture = z.array(schemaNoteLecture);

export const recupererNotes = async (
  livreId: string,
  signal?: AbortSignal,
): Promise<NoteLecture[]> => {
  const corps = await clientHttp.get(`/books/${encodeURIComponent(livreId)}/notes`, { signal });
  const resultat = schemaNotesLecture.safeParse(corps);
  if (!resultat.success || resultat.data.some((note) => note.livreId !== livreId)) {
    throw creerErreurValidation('La réponse du serveur pour les notes est invalide.');
  }
  return resultat.data;
};
