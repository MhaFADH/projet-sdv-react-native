import { z } from 'zod';
import type { IntentionBascule } from '@/domain/bascule-ouvrage';
import type { CriteresOuvrages } from '@/domain/criteres-ouvrages';
import type { IntentionNotation } from '@/domain/notation-ouvrage';
import {
  ANNEE_PUBLICATION_MINIMALE,
  NOMBRE_ANNEES_FUTURES_AUTORISEES,
  OUVRAGES_PAR_PAGE,
  type Ouvrage,
  type PageOuvrages,
} from '@/domain/ouvrage';
import type { CorrectionOuvrage, CreationOuvrage } from '@/domain/saisie-ouvrage';
import { traduire } from '@/services/i18n';
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

export const fetchBooksPage = async (
  criteres: CriteresOuvrages,
  signal?: AbortSignal,
): Promise<PageOuvrages> => {
  const corps = await clientHttp.get('/books', {
    parametres: {
      page: criteres.page,
      limit: criteres.limit,
      q: criteres.q === '' ? undefined : criteres.q,
      status: criteres.status,
      favori: criteres.favori,
      sort: criteres.sort,
      order: criteres.order,
    },
    signal,
  });
  const resultat = pageOuvragesSchema.safeParse(corps);
  if (!resultat.success || resultat.data.page !== criteres.page) {
    throw creerErreurValidation(traduire('erreursHttp.reponseOuvrages'));
  }
  return resultat.data;
};

export const fetchBook = async (id: string, signal?: AbortSignal): Promise<Ouvrage> => {
  const corps = await clientHttp.get(`/books/${encodeURIComponent(id)}`, {
    signal,
  });
  const resultat = ouvrageSchema.safeParse(corps);
  if (!resultat.success || resultat.data.id !== id) {
    throw creerErreurValidation(traduire('erreursHttp.reponseFiche'));
  }
  return resultat.data;
};

export const createBook = async ({ saisie, couverture }: CreationOuvrage): Promise<Ouvrage> => {
  const corps = await clientHttp.post('/books', {
    titre: saisie.titre,
    auteur: saisie.auteur,
    editeur: saisie.editeur,
    annee: saisie.annee,
    lu: saisie.lu,
    couverture,
  });
  const resultat = ouvrageSchema.safeParse(corps);
  if (!resultat.success) {
    throw creerErreurValidation(traduire('erreursHttp.reponseCreation'));
  }
  return resultat.data;
};

export const patchBasculeOuvrage = async ({
  id,
  champ,
  valeur,
}: IntentionBascule): Promise<Ouvrage> => {
  const corps = await clientHttp.patch(`/books/${encodeURIComponent(id)}`, { [champ]: valeur });
  const resultat = ouvrageSchema.safeParse(corps);
  if (!resultat.success || resultat.data.id !== id) {
    throw creerErreurValidation(traduire('erreursHttp.reponseBascule'));
  }
  return resultat.data;
};

export const patchNotationOuvrage = async ({ id, valeur }: IntentionNotation): Promise<Ouvrage> => {
  const corps = await clientHttp.patch(`/books/${encodeURIComponent(id)}`, { note: valeur });
  const resultat = ouvrageSchema.safeParse(corps);
  if (!resultat.success || resultat.data.id !== id) {
    throw creerErreurValidation(traduire('erreursHttp.reponseNotation'));
  }
  return resultat.data;
};

export const deleteBook = async (id: string, signal?: AbortSignal): Promise<void> =>
  clientHttp.supprimer(`/books/${encodeURIComponent(id)}`, { signal });

export const patchBook = async (id: string, correction: CorrectionOuvrage): Promise<Ouvrage> => {
  const corps = await clientHttp.patch(`/books/${encodeURIComponent(id)}`, correction);
  const resultat = ouvrageSchema.safeParse(corps);
  if (!resultat.success || resultat.data.id !== id) {
    throw creerErreurValidation(traduire('erreursHttp.reponseCorrection'));
  }
  return resultat.data;
};
