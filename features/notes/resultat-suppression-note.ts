import { classerEchecEcriture } from '@/services/api/issue-ecriture';
import { TEXTES_SUPPRESSION_NOTE } from './textes-suppression-note';

export type ResultatSuppressionNote =
  | { type: 'echec'; message: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

export const interpreterEchecSuppressionNote = (cause: unknown): ResultatSuppressionNote => {
  const classe = classerEchecEcriture(cause, {
    sansReponse: TEXTES_SUPPRESSION_NOTE.incertainSansReponse,
    reponseInexploitable: TEXTES_SUPPRESSION_NOTE.incertainReponseInexploitable,
  });

  if (classe.classe === 'indisponible') {
    return { type: 'indisponible', message: classe.message };
  }

  if (classe.classe === 'incertain') {
    return { type: 'incertain', message: classe.message };
  }

  if (classe.erreur.type === 'validation') {
    return { type: 'incertain', message: TEXTES_SUPPRESSION_NOTE.incertainReponseInexploitable };
  }

  return { type: 'echec', message: classe.erreur.message };
};
