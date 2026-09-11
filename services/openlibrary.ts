import { z } from 'zod';
import type { EnrichissementBibliographique } from '@/domain/enrichissement-bibliographique';
import { clientHttp, type TransportHttp } from '@/services/api/client-http';
import { creerErreurValidation } from '@/services/api/erreurs';

const URL_RECHERCHE_OPENLIBRARY = 'https://openlibrary.org/search.json';
const DELAI_EXPIRATION_OPENLIBRARY_MS = 5_000;

const reponseOpenLibrarySchema = z.object({
  numFound: z.number().int().nonnegative(),
  docs: z.array(
    z.object({
      first_publish_year: z.number().int().optional(),
    }),
  ),
});

export type TransportOpenLibrary = TransportHttp;

type OptionsRechercheOpenLibrary = {
  signal?: AbortSignal;
  transport?: TransportOpenLibrary;
};

export const rechercherOpenLibrary = async (
  titre: string,
  { signal, transport }: OptionsRechercheOpenLibrary = {},
): Promise<EnrichissementBibliographique> => {
  const url = new URL(URL_RECHERCHE_OPENLIBRARY);
  url.searchParams.set('title', titre);
  const reponse = await clientHttp.getUrl(url.toString(), {
    delaiExpirationMs: DELAI_EXPIRATION_OPENLIBRARY_MS,
    signal,
    transport,
  });
  const resultat = reponseOpenLibrarySchema.safeParse(reponse);
  if (!resultat.success) throw creerErreurValidation('La réponse OpenLibrary est invalide.');
  const premiereAnnee = resultat.data.docs[0]?.first_publish_year;

  return {
    nombreEditions: resultat.data.numFound,
    ...(premiereAnnee === undefined ? {} : { premiereAnnee }),
  };
};
