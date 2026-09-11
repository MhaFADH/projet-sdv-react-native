import { z } from 'zod';
import {
  ANNEE_PUBLICATION_MINIMALE,
  NOMBRE_ANNEES_FUTURES_AUTORISEES,
  type Ouvrage,
} from './ouvrage';

export const LONGUEUR_MAXIMALE_TEXTE = 200;

const CHAMPS_SAISIE_OUVRAGE = ['titre', 'auteur', 'editeur', 'annee'] as const;

export type ChampSaisieOuvrage = (typeof CHAMPS_SAISIE_OUVRAGE)[number];

export const anneeMaximaleAutorisee = (): number =>
  new Date().getFullYear() + NOMBRE_ANNEES_FUTURES_AUTORISEES;

export type MessagesSaisieOuvrage = {
  libelleTitre: string;
  libelleAuteur: string;
  libelleEditeur: string;
  obligatoire: (libelle: string) => string;
  longueurMaximale: (libelle: string, maximum: number) => string;
  anneeObligatoire: string;
  anneeEntiere: string;
  anneeBornes: (minimum: number, maximum: number) => string;
};

const texteNormalise = (libelle: string, messages: MessagesSaisieOuvrage) =>
  z
    .string()
    .trim()
    .max(LONGUEUR_MAXIMALE_TEXTE, messages.longueurMaximale(libelle, LONGUEUR_MAXIMALE_TEXTE));

const texteObligatoire = (libelle: string, messages: MessagesSaisieOuvrage) =>
  z.string().trim().min(1, messages.obligatoire(libelle)).pipe(texteNormalise(libelle, messages));

const anneeSaisie = (messages: MessagesSaisieOuvrage) =>
  z
    .string()
    .trim()
    .min(1, messages.anneeObligatoire)
    .pipe(z.string().regex(/^\d+$/, messages.anneeEntiere))
    .transform((valeur) => Number.parseInt(valeur, 10))
    .refine((annee) => annee >= ANNEE_PUBLICATION_MINIMALE && annee <= anneeMaximaleAutorisee(), {
      error: () => messages.anneeBornes(ANNEE_PUBLICATION_MINIMALE, anneeMaximaleAutorisee()),
    });

export const creerSaisieOuvrageSchema = (messages: MessagesSaisieOuvrage) =>
  z.object({
    titre: texteObligatoire(messages.libelleTitre, messages),
    auteur: texteObligatoire(messages.libelleAuteur, messages),
    editeur: texteNormalise(messages.libelleEditeur, messages),
    annee: anneeSaisie(messages),
    lu: z.boolean(),
  });

type SchemaSaisieOuvrage = ReturnType<typeof creerSaisieOuvrageSchema>;

export type SaisieOuvrage = z.input<SchemaSaisieOuvrage>;

export type OuvrageSaisi = z.output<SchemaSaisieOuvrage>;

export const SAISIE_OUVRAGE_VIDE: SaisieOuvrage = {
  titre: '',
  auteur: '',
  editeur: '',
  annee: '',
  lu: false,
};

export type CreationOuvrage = {
  saisie: OuvrageSaisi;
  couverture: string;
};

export type CorrectionOuvrage = Partial<OuvrageSaisi>;

type OuvrageEditable = Pick<Ouvrage, 'titre' | 'auteur' | 'editeur' | 'annee' | 'lu'>;

export const referenceDepuisOuvrage = (ouvrage: OuvrageEditable): OuvrageSaisi => ({
  titre: ouvrage.titre,
  auteur: ouvrage.auteur,
  editeur: ouvrage.editeur,
  annee: ouvrage.annee,
  lu: ouvrage.lu,
});

export const saisieDepuisOuvrage = (ouvrage: OuvrageEditable): SaisieOuvrage => ({
  ...referenceDepuisOuvrage(ouvrage),
  annee: String(ouvrage.annee),
});

export const correctionOuvrage = (
  reference: OuvrageSaisi,
  valeurs: OuvrageSaisi,
): CorrectionOuvrage => {
  const correction: CorrectionOuvrage = {};

  if (valeurs.titre !== reference.titre) correction.titre = valeurs.titre;
  if (valeurs.auteur !== reference.auteur) correction.auteur = valeurs.auteur;
  if (valeurs.editeur !== reference.editeur) correction.editeur = valeurs.editeur;
  if (valeurs.annee !== reference.annee) correction.annee = valeurs.annee;
  if (valeurs.lu !== reference.lu) correction.lu = valeurs.lu;

  return correction;
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
