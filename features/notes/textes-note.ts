import type { Traduire } from '@/hooks/use-traduction';
import type { ErreurApplication } from '@/services/api/erreurs';
import { messageErreurApplication } from './message-erreur-application';

export type TextesNote = {
  libelleChamp: string;
  libelleAjouter: string;
  libelleEnvoiEnCours: string;
  libelleEffacer: string;
  messageSucces: string;
  messageIndisponible: string;
  refusContenuInvalide: string;
  refusValidation: string;
  refusIntrouvable: string;
  incertainSansReponse: string;
  incertainReponseInexploitable: string;
  avertissementDoublon: string;
  libelleVerifier: string;
  libelleRenvoyer: string;
  blocageOuvrageIntrouvable: string;
  blocageOuvrageMasque: string;
  messageErreur: (erreur: ErreurApplication) => string;
};

export const creerTextesNote = (t: Traduire): TextesNote => ({
  libelleChamp: t('notes.champ'),
  libelleAjouter: t('notes.ajouter'),
  libelleEnvoiEnCours: t('notes.envoiEnCours'),
  libelleEffacer: t('notes.effacer'),
  messageSucces: t('notes.succes'),
  messageIndisponible: t('erreursHttp.indisponible'),
  refusContenuInvalide: t('validation.noteInvalide'),
  refusValidation: t('erreursHttp.validation'),
  refusIntrouvable: t('notes.refusIntrouvable'),
  incertainSansReponse: t('notes.incertainSansReponse'),
  incertainReponseInexploitable: t('notes.incertainReponseInexploitable'),
  avertissementDoublon: t('notes.avertissementDoublon'),
  libelleVerifier: t('notes.verifier'),
  libelleRenvoyer: t('notes.renvoyer'),
  blocageOuvrageIntrouvable: t('notes.blocageOuvrageIntrouvable'),
  blocageOuvrageMasque: t('notes.blocageOuvrageMasque'),
  messageErreur: (erreur) => messageErreurApplication(erreur, t),
});
