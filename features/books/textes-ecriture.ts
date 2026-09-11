import type { Traduire } from '@/hooks/use-traduction';

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
  messageSucces: (titre: string) => string;
};

export const creerTextesCreation = (t: Traduire): TextesEcriture => ({
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
