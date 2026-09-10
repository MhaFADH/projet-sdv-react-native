import { z } from 'zod';
import { ANNEE_PUBLICATION_MINIMALE, NOMBRE_ANNEES_FUTURES_AUTORISEES } from './ouvrage';

export const LONGUEUR_MAXIMALE_TEXTE = 200;

const CHAMPS_SAISIE_OUVRAGE = ['titre', 'auteur', 'editeur', 'annee'] as const;

export type ChampSaisieOuvrage = (typeof CHAMPS_SAISIE_OUVRAGE)[number];

export const anneeMaximaleAutorisee = (): number =>
  new Date().getFullYear() + NOMBRE_ANNEES_FUTURES_AUTORISEES;

const texteNormalise = (libelle: string) =>
  z
    .string()
    .trim()
    .max(
      LONGUEUR_MAXIMALE_TEXTE,
      `${libelle} ne peut pas dépasser ${LONGUEUR_MAXIMALE_TEXTE} caractères.`,
    );

const texteObligatoire = (libelle: string) =>
  z.string().trim().min(1, `${libelle} est obligatoire.`).pipe(texteNormalise(libelle));

const anneeSaisie = z
  .string()
  .trim()
  .min(1, 'L’année de publication est obligatoire.')
  .pipe(z.string().regex(/^\d+$/, 'L’année doit être un nombre entier.'))
  .transform((valeur) => Number.parseInt(valeur, 10))
  .refine((annee) => annee >= ANNEE_PUBLICATION_MINIMALE && annee <= anneeMaximaleAutorisee(), {
    error: () =>
      `L’année doit être comprise entre ${ANNEE_PUBLICATION_MINIMALE} et ${anneeMaximaleAutorisee()}.`,
  });

export const saisieOuvrageSchema = z.object({
  titre: texteObligatoire('Le titre'),
  auteur: texteObligatoire('L’auteur'),
  editeur: texteNormalise('L’éditeur'),
  annee: anneeSaisie,
  lu: z.boolean(),
});

export type SaisieOuvrage = z.input<typeof saisieOuvrageSchema>;

export type OuvrageSaisi = z.output<typeof saisieOuvrageSchema>;

export const SAISIE_OUVRAGE_VIDE: SaisieOuvrage = {
  titre: '',
  auteur: '',
  editeur: '',
  annee: '',
  lu: false,
};

export type RefusServeur = {
  parChamp: Partial<Record<ChampSaisieOuvrage, string>>;
  horsFormulaire: string[];
};

const estChampDuFormulaire = (cle: string): cle is ChampSaisieOuvrage =>
  (CHAMPS_SAISIE_OUVRAGE as readonly string[]).includes(cle);

export const repartirRefusServeur = (champs?: Record<string, string>): RefusServeur => {
  const refus: RefusServeur = { parChamp: {}, horsFormulaire: [] };

  for (const [cle, message] of Object.entries(champs ?? {})) {
    if (estChampDuFormulaire(cle)) {
      refus.parChamp[cle] = message;
      continue;
    }
    refus.horsFormulaire.push(`${cle} : ${message}`);
  }

  return refus;
};
