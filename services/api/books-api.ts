import { z } from 'zod';
import {
  ANNEE_PUBLICATION_MINIMALE,
  NOMBRE_ANNEES_FUTURES_AUTORISEES,
  OUVRAGES_PAR_PAGE,
  type PageOuvrages,
  TRI_FONDS,
} from '@/domain/ouvrage';
import { clientHttp } from './client-http';
import { creerErreurValidation } from './erreurs';

const ANNEE_PUBLICATION_MAXIMALE = new Date().getFullYear() + NOMBRE_ANNEES_FUTURES_AUTORISEES;
const NOTE_MINIMALE = 0;
const NOTE_MAXIMALE = 5;
const VERSION_MINIMALE = 0;

const ouvrageSchema = z.object({
  id: z.string().uuid(),
  titre: z.string(),
  auteur: z.string(),
  editeur: z.string(),
  annee: z.number().int().min(ANNEE_PUBLICATION_MINIMALE).max(ANNEE_PUBLICATION_MAXIMALE),
  lu: z.boolean(),
  favori: z.boolean(),
  note: z.number().min(NOTE_MINIMALE).max(NOTE_MAXIMALE).nullable(),
  couverture: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.number().int().min(VERSION_MINIMALE),
});

const pageOuvragesSchema = z.object({
  items: z.array(ouvrageSchema).max(OUVRAGES_PAR_PAGE),
  page: z.number().int().positive(),
  limit: z.literal(OUVRAGES_PAR_PAGE),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});

export const fetchBooksPage = async (page: number, signal?: AbortSignal): Promise<PageOuvrages> => {
  const corps = await clientHttp.get('/books', {
    parametres: {
      page,
      limit: OUVRAGES_PAR_PAGE,
      sort: TRI_FONDS.champ,
      order: TRI_FONDS.ordre,
    },
    signal,
  });
  const resultat = pageOuvragesSchema.safeParse(corps);
  if (!resultat.success || resultat.data.page !== page) {
    throw creerErreurValidation('La réponse du serveur pour les ouvrages est invalide.');
  }
  return resultat.data;
};
