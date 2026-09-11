import { classerEchecEcriture } from '@/services/api/issue-ecriture';
import type { TextesSuppressionNote } from './textes-suppression-note';

export type ResultatSuppressionNote =
  | { type: 'echec'; message: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

export const interpreterEchecSuppressionNote = (
  cause: unknown,
  textes: TextesSuppressionNote,
): ResultatSuppressionNote => {
  const classe = classerEchecEcriture(cause, {
    sansReponse: textes.incertainSansReponse,
    reponseInexploitable: textes.incertainReponseInexploitable,
  });

  if (classe.classe === 'indisponible') {
    return { type: 'indisponible', message: classe.message };
  }

  if (classe.classe === 'incertain') {
    return { type: 'incertain', message: classe.message };
  }

  if (classe.erreur.type === 'validation') {
    return { type: 'incertain', message: textes.incertainReponseInexploitable };
  }

  return { type: 'echec', message: classe.erreur.message };
};
