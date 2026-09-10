import { type ChampSaisieNote, repartirRefusNote } from '@/domain/saisie-note';
import {
  type ErreurApplication,
  estErreurApplication,
  STATUT_ERREUR_SERVEUR_MINIMALE,
  STATUT_INDISPONIBLE,
} from '@/services/api/erreurs';
import { TEXTES_NOTE } from './textes-note';

export type ResultatAjoutNote =
  | { type: 'refus'; parChamp: Partial<Record<ChampSaisieNote, string>>; message?: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

const interpreterRefus = (
  erreur: Extract<ErreurApplication, { type: 'validation' }>,
): ResultatAjoutNote => {
  const { parChamp, horsFormulaire } = repartirRefusNote(erreur.champs);
  const messages = horsFormulaire.length > 0 ? horsFormulaire : [];
  if (parChamp.contenu === undefined && messages.length === 0) messages.push(erreur.message);

  return {
    type: 'refus',
    parChamp,
    message: messages.length > 0 ? messages.join(' · ') : undefined,
  };
};

/**
 * Une absence de réponse concluante n'est jamais présentée comme un refus :
 * la note a peut-être été enregistrée et la saisie doit être conservée.
 */
export const interpreterEchecAjoutNote = (cause: unknown): ResultatAjoutNote => {
  if (!estErreurApplication(cause)) {
    return { type: 'incertain', message: TEXTES_NOTE.incertainReponseInexploitable };
  }

  if (cause.type === 'validation') {
    if (cause.champs === undefined) {
      return { type: 'incertain', message: TEXTES_NOTE.incertainReponseInexploitable };
    }
    return interpreterRefus(cause);
  }

  if (cause.type === 'introuvable') {
    return { type: 'refus', parChamp: {}, message: TEXTES_NOTE.refusIntrouvable };
  }

  if (cause.type === 'reseau') {
    if (cause.statut === STATUT_INDISPONIBLE) {
      return { type: 'indisponible', message: cause.message };
    }
    if (cause.statut === undefined || cause.statut >= STATUT_ERREUR_SERVEUR_MINIMALE) {
      return { type: 'incertain', message: TEXTES_NOTE.incertainSansReponse };
    }
  }

  return { type: 'refus', parChamp: {}, message: cause.message };
};
