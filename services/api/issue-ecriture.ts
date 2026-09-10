import {
  type ErreurApplication,
  estErreurApplication,
  STATUT_ERREUR_SERVEUR_MINIMALE,
  STATUT_INDISPONIBLE,
} from './erreurs';

export type ClasseEchecEcriture =
  | { classe: 'indisponible'; message: string }
  | { classe: 'incertain'; message: string }
  | { classe: 'concluant'; erreur: ErreurApplication };

export type TextesIncertitude = {
  sansReponse: string;
  reponseInexploitable: string;
};

export const classerEchecEcriture = (
  cause: unknown,
  textes: TextesIncertitude,
): ClasseEchecEcriture => {
  if (!estErreurApplication(cause)) {
    return { classe: 'incertain', message: textes.reponseInexploitable };
  }

  if (cause.type === 'reseau') {
    if (cause.statut === STATUT_INDISPONIBLE) {
      return { classe: 'indisponible', message: cause.message };
    }
    if (cause.statut === undefined || cause.statut >= STATUT_ERREUR_SERVEUR_MINIMALE) {
      return { classe: 'incertain', message: textes.sansReponse };
    }
  }

  return { classe: 'concluant', erreur: cause };
};
