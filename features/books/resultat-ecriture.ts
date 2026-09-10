import { type ChampSaisieOuvrage, repartirRefusServeur } from '@/domain/saisie-ouvrage';
import {
  type ErreurApplication,
  estErreurApplication,
  STATUT_ERREUR_SERVEUR_MINIMALE,
  STATUT_INDISPONIBLE,
} from '@/services/api/erreurs';
import type { TextesEcriture } from './textes-ecriture';

export type ResultatEcriture =
  | { type: 'refus'; parChamp: Partial<Record<ChampSaisieOuvrage, string>>; message?: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

const interpreterRefus = (
  erreur: Extract<ErreurApplication, { type: 'validation' }>,
): ResultatEcriture => {
  const { parChamp, horsFormulaire } = repartirRefusServeur(erreur.champs);
  const messages = horsFormulaire.length > 0 ? horsFormulaire : [];
  if (Object.keys(parChamp).length === 0 && messages.length === 0) messages.push(erreur.message);

  return {
    type: 'refus',
    parChamp,
    message: messages.length > 0 ? messages.join(' · ') : undefined,
  };
};

export const interpreterEchecEcriture = (
  cause: unknown,
  textes: TextesEcriture,
): ResultatEcriture => {
  if (!estErreurApplication(cause)) {
    return { type: 'incertain', message: textes.incertainReponseInexploitable };
  }

  if (cause.type === 'validation') {
    if (cause.champs === undefined) {
      return { type: 'incertain', message: textes.incertainReponseInexploitable };
    }
    return interpreterRefus(cause);
  }

  if (cause.type === 'reseau') {
    if (cause.statut === STATUT_INDISPONIBLE) {
      return { type: 'indisponible', message: cause.message };
    }
    if (cause.statut === undefined || cause.statut >= STATUT_ERREUR_SERVEUR_MINIMALE) {
      return { type: 'incertain', message: textes.incertainSansReponse };
    }
  }

  return { type: 'refus', parChamp: {}, message: cause.message };
};
