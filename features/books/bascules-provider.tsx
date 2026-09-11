import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import {
  appliquerIntention,
  type ChampBascule,
  type IntentionBascule,
  remplacerOuvrageDansPage,
} from '@/domain/bascule-ouvrage';
import type { Ouvrage, PageOuvrages } from '@/domain/ouvrage';
import { clesOuvrages } from '@/hooks/cles-ouvrages';
import { patchBasculeOuvrage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import {
  autoriserReessai,
  DELAI_REESSAI_MS,
  MODE_RESEAU_BASCULE,
} from '@/services/api/politique-reessai';
import { BasculesContext, type ContexteBascules } from './contexte-bascules';
import { avisEchecActualisation, avisEchecBascule } from './textes-bascule';

type EnvoiBascule = { intention: IntentionBascule; sequence: number };
type EchecBascule = { intention: IntentionBascule; erreur: ErreurApplication };
type EchecActualisation = { champ: ChampBascule; erreur: ErreurApplication };

type EtatBascules = {
  envois: Record<string, EnvoiBascule>;
  echecs: Record<string, EchecBascule>;
  echecsActualisation: Record<string, EchecActualisation>;
};

const ETAT_INITIAL: EtatBascules = { envois: {}, echecs: {}, echecsActualisation: {} };

const sansCle = <Valeur,>(entrees: Record<string, Valeur>, cle: string): Record<string, Valeur> =>
  Object.fromEntries(Object.entries(entrees).filter(([courante]) => courante !== cle));

export const BasculesProvider = ({ children }: PropsWithChildren) => {
  const client = useQueryClient();
  const [etat, setEtat] = useState<EtatBascules>(ETAT_INITIAL);
  const envoisEnCours = useRef<Record<string, EnvoiBascule>>(ETAT_INITIAL.envois);
  const dernieresSequences = useRef<Record<string, number>>({});
  const compteurSequences = useRef(0);
  envoisEnCours.current = etat.envois;

  const { mutateAsync } = useMutation<Ouvrage, ErreurApplication, IntentionBascule>({
    mutationFn: patchBasculeOuvrage,
    networkMode: MODE_RESEAU_BASCULE,
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });

  const actualiser = useCallback(
    async (id: string, champ: ChampBascule) => {
      setEtat((courant) => ({
        ...courant,
        echecsActualisation: sansCle(courant.echecsActualisation, id),
      }));
      await Promise.all([
        client.invalidateQueries({ queryKey: clesOuvrages.fiche(id) }),
        client.invalidateQueries({ queryKey: clesOuvrages.listes() }),
      ]);
      const fiche = client
        .getQueryCache()
        .find<Ouvrage, ErreurApplication>({ queryKey: clesOuvrages.fiche(id) });
      const erreur = fiche?.isActive() ? fiche.state.error : undefined;
      if (!erreur) return;
      setEtat((courant) => ({
        ...courant,
        echecsActualisation: { ...courant.echecsActualisation, [id]: { champ, erreur } },
      }));
    },
    [client],
  );

  const confirmer = useCallback(
    (ouvrage: Ouvrage, intention: IntentionBascule) => {
      client.setQueryData<Ouvrage>(clesOuvrages.fiche(ouvrage.id), ouvrage);
      client.setQueriesData<PageOuvrages>({ queryKey: clesOuvrages.listes() }, (page) =>
        page ? remplacerOuvrageDansPage(page, ouvrage) : page,
      );
      setEtat((courant) => ({ ...courant, envois: sansCle(courant.envois, intention.id) }));
      void actualiser(intention.id, intention.champ);
    },
    [actualiser, client],
  );

  const envoyer = useCallback(
    (intention: IntentionBascule) => {
      compteurSequences.current += 1;
      const sequence = compteurSequences.current;
      dernieresSequences.current[intention.id] = sequence;
      setEtat((courant) => ({
        envois: { ...courant.envois, [intention.id]: { intention, sequence } },
        echecs: sansCle(courant.echecs, intention.id),
        echecsActualisation: sansCle(courant.echecsActualisation, intention.id),
      }));
      const obsolete = () => dernieresSequences.current[intention.id] !== sequence;

      void mutateAsync(intention).then(
        (ouvrage) => {
          if (obsolete()) return;
          confirmer(ouvrage, intention);
        },
        (erreur: ErreurApplication) => {
          if (obsolete()) return;
          setEtat((courant) => ({
            ...courant,
            envois: sansCle(courant.envois, intention.id),
            echecs: { ...courant.echecs, [intention.id]: { intention, erreur } },
          }));
        },
      );
    },
    [confirmer, mutateAsync],
  );

  const basculer = useCallback(
    (intention: IntentionBascule) => {
      if (envoisEnCours.current[intention.id]) return;
      envoyer(intention);
    },
    [envoyer],
  );

  const contexte = useMemo<ContexteBascules>(
    () => ({
      basculer,
      basculeEnCours: (id) => etat.envois[id] !== undefined,
      appliquerBasculeEnCours: (ouvrage) => {
        const envoi = etat.envois[ouvrage.id];
        return envoi ? appliquerIntention(ouvrage, envoi.intention) : ouvrage;
      },
      erreurBascule: (id) => {
        const echec = etat.echecs[id];
        if (!echec) return undefined;
        return avisEchecBascule(echec.intention.champ, echec.erreur.message, () =>
          basculer(echec.intention),
        );
      },
      erreurActualisation: (id) => {
        const echec = etat.echecsActualisation[id];
        if (!echec) return undefined;
        return avisEchecActualisation(echec.champ, echec.erreur.message, () => {
          void actualiser(id, echec.champ);
        });
      },
    }),
    [actualiser, basculer, etat],
  );

  return <BasculesContext.Provider value={contexte}>{children}</BasculesContext.Provider>;
};
