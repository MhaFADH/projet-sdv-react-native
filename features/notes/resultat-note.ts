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

export const interpreterEchecAjoutNote = (
  cause: unknown,
  textes: TextesNote,
): ResultatAjoutNote => {
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
    if (classe.erreur.champs === undefined) {
      return { type: 'incertain', message: textes.incertainReponseInexploitable };
    }
    return interpreterRefus(classe.erreur);
  }

  if (classe.erreur.type === 'introuvable') {
    return { type: 'refus', parChamp: {}, message: textes.refusIntrouvable };
  }

  return { type: 'refus', parChamp: {}, message: classe.erreur.message };
};
