import type { Traduire } from '@/hooks/use-traduction';
import type { ErreurApplication } from '@/services/api/erreurs';
import { messageErreurApplication } from './message-erreur-application';

export type TextesSuppressionNote = {
  titreConfirmation: string;
  avertissementSansAnnulation: string;
  libelleRenoncer: string;
  libelleConfirmer: string;
  libelleSupprimer: string;
  libelleEnvoiEnCours: string;
  messageDejaAbsente: string;
  incertainSansReponse: string;
  incertainReponseInexploitable: string;
  libelleVerifier: string;
  libelleReessayer: string;
  messageIndisponible: string;
  messageErreur: (erreur: ErreurApplication) => string;
};

export const creerTextesSuppressionNote = (t: Traduire): TextesSuppressionNote => ({
  titreConfirmation: t('suppressionNote.titreConfirmation'),
  avertissementSansAnnulation: t('suppressionNote.avertissementSansAnnulation'),
  libelleRenoncer: t('suppressionNote.renoncer'),
  libelleConfirmer: t('suppressionNote.confirmer'),
  libelleSupprimer: t('suppressionNote.supprimer'),
  libelleEnvoiEnCours: t('suppressionNote.envoiEnCours'),
  messageDejaAbsente: t('suppressionNote.dejaAbsente'),
  incertainSansReponse: t('suppressionNote.incertainSansReponse'),
  incertainReponseInexploitable: t('suppressionNote.incertainReponseInexploitable'),
  libelleVerifier: t('suppressionNote.verifier'),
  libelleReessayer: t('suppressionNote.reessayer'),
  messageIndisponible: t('erreursHttp.indisponible'),
  messageErreur: (erreur) => messageErreurApplication(erreur, t),
});
