import { type ChampSaisieOuvrage, repartirRefusServeur } from '@/domain/saisie-ouvrage';
import type { ErreurApplication } from '@/services/api/erreurs';
import { classerEchecEcriture } from '@/services/api/issue-ecriture';
import type { TextesEcriture } from './textes-ecriture';

export type ResultatEcriture =
  | { type: 'refus'; parChamp: Partial<Record<ChampSaisieOuvrage, string>>; message?: string }
  | { type: 'indisponible'; message: string }
  | { type: 'incertain'; message: string };

const interpreterRefus = (
  erreur: Extract<ErreurApplication, { type: 'validation' }>,
  textes: TextesEcriture,
): ResultatEcriture => {
  const { parChamp, horsFormulaire } = repartirRefusServeur(erreur.champs);
  const champsTraduits = Object.fromEntries(
    Object.keys(parChamp).map((champ) => [
      champ,
      textes.messagesChampsInvalides[champ as ChampSaisieOuvrage],
    ]),
  );

  return {
    type: 'refus',
    parChamp: champsTraduits,
    message:
      horsFormulaire.length > 0 || Object.keys(parChamp).length === 0
        ? textes.messageRefusValidation
        : undefined,
  };
};

export const interpreterEchecEcriture = (
  cause: unknown,
  textes: TextesEcriture,
): ResultatEcriture => {
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

  return { type: 'refus', parChamp: {}, message: textes.messageErreur(classe.erreur) };
};
