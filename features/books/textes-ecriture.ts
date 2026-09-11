import type { ChampSaisieOuvrage } from '@/domain/saisie-ouvrage';
import type { Traduire } from '@/hooks/use-traduction';
import type { ErreurApplication } from '@/services/api/erreurs';
import { messageErreurApplication } from '@/services/i18n/message-erreur-application';

export type TextesEcriture = {
  titre: string;
  libelleQuitter: string;
  libelleEnregistrer: string;
  messageSansChangement: string;
  libelleEnvoiEnCours: string;
  incertainSansReponse: string;
  incertainReponseInexploitable: string;
  avertissementReessai: string;
  libelleVerifier: string;
  libelleReessayerIncertain: string;
  libelleOuvrirOuvrage: string;
  messageIndisponible: string;
  messageRefusValidation: string;
  messagesChampsInvalides: Record<ChampSaisieOuvrage, string>;
  messageErreur: (erreur: ErreurApplication) => string;
  messageSucces: (titre: string) => string;
};

const creerTextesPartages = (t: Traduire) => ({
  libelleOuvrirOuvrage: t('ecriture.ouvrirFiche'),
  messageIndisponible: t('erreursHttp.indisponible'),
  messageRefusValidation: t('erreursHttp.validation'),
  messagesChampsInvalides: {
    titre: t('validation.champInvalide', { libelle: t('validation.libelleTitre') }),
    auteur: t('validation.champInvalide', { libelle: t('validation.libelleAuteur') }),
    editeur: t('validation.champInvalide', { libelle: t('validation.libelleEditeur') }),
    annee: t('validation.champInvalide', { libelle: t('validation.libelleAnnee') }),
  },
  messageErreur: (erreur: ErreurApplication) => messageErreurApplication(erreur, t),
});

export const creerTextesCreation = (t: Traduire): TextesEcriture => ({
  ...creerTextesPartages(t),
  titre: t('ecriture.creationTitre'),
  libelleQuitter: t('ecriture.creationQuitter'),
  libelleEnregistrer: t('ecriture.creationEnregistrer'),
  messageSansChangement: t('ecriture.creationSansChangement'),
  libelleEnvoiEnCours: t('ecriture.envoiEnCours'),
  incertainSansReponse: t('ecriture.creationSansReponse'),
  incertainReponseInexploitable: t('ecriture.creationReponseInexploitable'),
  avertissementReessai: t('ecriture.creationAvertissement'),
  libelleVerifier: t('ecriture.creationVerifier'),
  libelleReessayerIncertain: t('ecriture.creationReessayer'),
  messageSucces: (titre) => t('ecriture.creationSucces', { titre }),
});

export const creerTextesCorrection = (t: Traduire): TextesEcriture => ({
  ...creerTextesPartages(t),
  titre: t('ecriture.correctionTitre'),
  libelleQuitter: t('ecriture.correctionQuitter'),
  libelleEnregistrer: t('ecriture.correctionEnregistrer'),
  messageSansChangement: t('ecriture.correctionSansChangement'),
  libelleEnvoiEnCours: t('ecriture.envoiEnCours'),
  incertainSansReponse: t('ecriture.correctionSansReponse'),
  incertainReponseInexploitable: t('ecriture.correctionReponseInexploitable'),
  avertissementReessai: t('ecriture.correctionAvertissement'),
  libelleVerifier: t('ecriture.correctionVerifier'),
  libelleReessayerIncertain: t('ecriture.correctionReessayer'),
  messageSucces: (titre) => t('ecriture.correctionSucces', { titre }),
});
