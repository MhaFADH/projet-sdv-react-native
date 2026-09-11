import { type ChampSaisieNote, repartirRefusNote } from '@/domain/saisie-note';
import type { ErreurApplication } from '@/services/api/erreurs';
import { classerEchecEcriture } from '@/services/api/issue-ecriture';
import type { TextesNote } from './textes-note';

export type ResultatAjoutNote =
  | { type: 'refus'; parChamp: Partial<Record<ChampSaisieNote, string>>; message?: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

const interpreterRefus = (
  erreur: Extract<ErreurApplication, { type: 'validation' }>,
  textes: TextesNote,
): ResultatAjoutNote => {
  const { parChamp, horsFormulaire } = repartirRefusNote(erreur.champs);
  if (parChamp.contenu !== undefined) parChamp.contenu = textes.refusContenuInvalide;
  const message =
    horsFormulaire.length > 0 || parChamp.contenu === undefined
      ? textes.refusValidation
      : undefined;

  return {
    type: 'refus',
    parChamp,
    message,
  };
};

export const interpreterEchecAjoutNote = (
  cause: unknown,
  textes: TextesNote,
): ResultatAjoutNote => {
  const classe = classerEchecEcriture(cause, {
    sansReponse: textes.incertainSansReponse,
    reponseInexploitable: textes.incertainReponseInexploitable,
  });

  if (classe.classe === 'indisponible') {
    return { type: 'indisponible', message: textes.messageIndisponible };
  }

  if (classe.classe === 'incertain') {
    return { type: 'incertain', message: classe.message };
  }

  if (classe.erreur.type === 'validation') {
    if (classe.erreur.champs === undefined) {
      return { type: 'incertain', message: textes.incertainReponseInexploitable };
    }
    return interpreterRefus(classe.erreur, textes);
  }

  if (classe.erreur.type === 'introuvable') {
    return { type: 'refus', parChamp: {}, message: textes.refusIntrouvable };
  }

  return { type: 'refus', parChamp: {}, message: textes.messageErreur(classe.erreur) };
};
