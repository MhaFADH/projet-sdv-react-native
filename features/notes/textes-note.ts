import type { Traduire } from '@/hooks/use-traduction';

export type TextesNote = {
  libelleChamp: string;
  libelleAjouter: string;
  libelleEnvoiEnCours: string;
  libelleEffacer: string;
  messageSucces: string;
  refusIntrouvable: string;
  incertainSansReponse: string;
  incertainReponseInexploitable: string;
  avertissementDoublon: string;
  libelleVerifier: string;
  libelleRenvoyer: string;
  blocageOuvrageIntrouvable: string;
  blocageOuvrageMasque: string;
};

export const creerTextesNote = (t: Traduire): TextesNote => ({
  libelleChamp: t('notes.champ'),
  libelleAjouter: t('notes.ajouter'),
  libelleEnvoiEnCours: t('notes.envoiEnCours'),
  libelleEffacer: t('notes.effacer'),
  messageSucces: t('notes.succes'),
  refusIntrouvable: t('notes.refusIntrouvable'),
  incertainSansReponse: t('notes.incertainSansReponse'),
  incertainReponseInexploitable: t('notes.incertainReponseInexploitable'),
  avertissementDoublon: t('notes.avertissementDoublon'),
  libelleVerifier: t('notes.verifier'),
  libelleRenvoyer: t('notes.renvoyer'),
  blocageOuvrageIntrouvable: t('notes.blocageOuvrageIntrouvable'),
  blocageOuvrageMasque: t('notes.blocageOuvrageMasque'),
});
