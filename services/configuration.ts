import { z } from 'zod';

type ValeurEnvironnement = string | undefined;

const lireEntier = (
  nom: string,
  valeur: ValeurEnvironnement,
  valeurParDefaut: number,
  minimum: number,
): number => {
  if (valeur === undefined || valeur.trim() === '') return valeurParDefaut;

  const resultat = z.coerce.number().int().min(minimum).safeParse(valeur);
  if (!resultat.success) {
    throw new Error(`La variable ${nom} doit être un entier supérieur ou égal à ${minimum}.`);
  }

  return resultat.data;
};

export const configuration = {
  delaiExpirationMs: lireEntier(
    'EXPO_PUBLIC_DELAI_EXPIRATION_MS',
    process.env.EXPO_PUBLIC_DELAI_EXPIRATION_MS,
    10_000,
    1,
  ),
  delaiReessaiMs: lireEntier(
    'EXPO_PUBLIC_DELAI_REESSAI_MS',
    process.env.EXPO_PUBLIC_DELAI_REESSAI_MS,
    1_000,
    0,
  ),
  nombreReessaisAutomatiques: lireEntier(
    'EXPO_PUBLIC_NOMBRE_REESSAIS_AUTOMATIQUES',
    process.env.EXPO_PUBLIC_NOMBRE_REESSAIS_AUTOMATIQUES,
    1,
    0,
  ),
  dureeToastMs: lireEntier(
    'EXPO_PUBLIC_DUREE_TOAST_MS',
    process.env.EXPO_PUBLIC_DUREE_TOAST_MS,
    5_000,
    1,
  ),
  delaiTemporisationMs: lireEntier(
    'EXPO_PUBLIC_DELAI_TEMPORISATION_MS',
    process.env.EXPO_PUBLIC_DELAI_TEMPORISATION_MS,
    3_000,
    1,
  ),
  delaiRechercheMs: lireEntier(
    'EXPO_PUBLIC_DELAI_RECHERCHE_MS',
    process.env.EXPO_PUBLIC_DELAI_RECHERCHE_MS,
    300,
    0,
  ),
} as const;
