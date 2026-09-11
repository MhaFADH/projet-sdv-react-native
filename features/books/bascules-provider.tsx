import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import {
  appliquerIntention,
  type ChampBascule,
  type IntentionBascule,
  remplacerOuvrageDansPage,
} from '@/domain/bascule-ouvrage';
import { appliquerNotation, type IntentionNotation } from '@/domain/notation-ouvrage';
import type { Ouvrage, PageOuvrages } from '@/domain/ouvrage';
import { clesOuvrages } from '@/hooks/cles-ouvrages';
import { patchBasculeOuvrage, patchNotationOuvrage } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import {
  autoriserReessai,
  DELAI_REESSAI_MS,
  MODE_RESEAU_BASCULE,
} from '@/services/api/politique-reessai';
import { BasculesContext, type ContexteBascules } from './contexte-bascules';
import { avisEchecActualisation, avisEchecBascule } from './textes-bascule';

type IntentionModification = IntentionBascule | (IntentionNotation & { champ: 'note' });
type ChampModification = ChampBascule | 'note';
type EnvoiModification = { intention: IntentionModification; sequence: number };
type EchecModification = { intention: IntentionModification; erreur: ErreurApplication };
type EchecActualisation = {
  champ: ChampModification;
  erreur: ErreurApplication;
  ouvrageConfirme: Ouvrage;
  sequence: number;
};

type EtatModifications = {
  envois: Record<string, EnvoiModification>;
  echecs: Record<string, EchecModification>;
  echecsActualisation: Record<string, EchecActualisation>;
};

const ETAT_INITIAL: EtatModifications = { envois: {}, echecs: {}, echecsActualisation: {} };

const sansCle = <Valeur,>(entrees: Record<string, Valeur>, cle: string): Record<string, Valeur> =>
  Object.fromEntries(Object.entries(entrees).filter(([courante]) => courante !== cle));

export const BasculesProvider = ({ children }: PropsWithChildren) => {
  const client = useQueryClient();
  const [etat, setEtat] = useState<EtatModifications>(ETAT_INITIAL);
  const envoisEnCours = useRef<Record<string, EnvoiModification>>(ETAT_INITIAL.envois);
  const dernieresSequences = useRef<Record<string, number>>({});
  const compteurSequences = useRef(0);
  envoisEnCours.current = etat.envois;

  const { mutateAsync } = useMutation<Ouvrage, ErreurApplication, IntentionModification>({
    mutationFn: (intention) =>
      intention.champ === 'note' ? patchNotationOuvrage(intention) : patchBasculeOuvrage(intention),
    networkMode: MODE_RESEAU_BASCULE,
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
  });

  const conserverDonneesLesPlusRecentes = useCallback(
    (ouvrage: Ouvrage, listesActivesUniquement = false) => {
      client.setQueryData<Ouvrage>(clesOuvrages.fiche(ouvrage.id), (courant) =>
        courant && courant.version > ouvrage.version ? courant : ouvrage,
      );
      client.setQueriesData<PageOuvrages>(
        {
          queryKey: clesOuvrages.listes(),
          type: listesActivesUniquement ? 'active' : 'all',
        },
        (page) => {
          const courant = page?.items.find(({ id }) => id === ouvrage.id);
          return !page || (courant && courant.version > ouvrage.version)
            ? page
            : remplacerOuvrageDansPage(page, ouvrage);
        },
      );
    },
    [client],
  );

  const actualiser = useCallback(
    async (id: string, champ: ChampModification, ouvrageConfirme: Ouvrage, sequence: number) => {
      if (dernieresSequences.current[id] !== sequence) return;
      setEtat((courant) => ({
        ...courant,
        echecsActualisation: sansCle(courant.echecsActualisation, id),
      }));
      await Promise.all([
        client.invalidateQueries({ queryKey: clesOuvrages.fiche(id) }),
        client.invalidateQueries({ queryKey: clesOuvrages.listes() }),
      ]);
      if (dernieresSequences.current[id] !== sequence) return;
      const fiche = client
        .getQueryCache()
        .find<Ouvrage, ErreurApplication>({ queryKey: clesOuvrages.fiche(id) });
      const erreur = fiche?.isActive() ? fiche.state.error : undefined;
      if (!erreur) {
        conserverDonneesLesPlusRecentes(ouvrageConfirme, true);
        return;
      }
      setEtat((courant) => ({
        ...courant,
        echecsActualisation: {
          ...courant.echecsActualisation,
          [id]: { champ, erreur, ouvrageConfirme, sequence },
        },
      }));
    },
    [client, conserverDonneesLesPlusRecentes],
  );

  const confirmer = useCallback(
    (ouvrage: Ouvrage, intention: IntentionModification, sequence: number) => {
      conserverDonneesLesPlusRecentes(ouvrage);
      setEtat((courant) => ({ ...courant, envois: sansCle(courant.envois, intention.id) }));
      void actualiser(intention.id, intention.champ, ouvrage, sequence);
    },
    [actualiser, conserverDonneesLesPlusRecentes],
  );

  const envoyer = useCallback(
    (intention: IntentionModification) => {
      compteurSequences.current += 1;
      const sequence = compteurSequences.current;
      dernieresSequences.current[intention.id] = sequence;
      const envoi = { intention, sequence };
      envoisEnCours.current = { ...envoisEnCours.current, [intention.id]: envoi };
      setEtat((courant) => ({
        envois: { ...courant.envois, [intention.id]: envoi },
        echecs: sansCle(courant.echecs, intention.id),
        echecsActualisation: sansCle(courant.echecsActualisation, intention.id),
      }));
      const obsolete = () => dernieresSequences.current[intention.id] !== sequence;

      void mutateAsync(intention).then(
        (ouvrage) => {
          if (obsolete()) return;
          confirmer(ouvrage, intention, sequence);
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

  const modifier = useCallback(
    (intention: IntentionModification) => {
      if (envoisEnCours.current[intention.id]) return;
      envoyer(intention);
    },
    [envoyer],
  );

  const basculer = useCallback((intention: IntentionBascule) => modifier(intention), [modifier]);

  const noter = useCallback(
    (intention: IntentionNotation) => modifier({ ...intention, champ: 'note' }),
    [modifier],
  );

  const contexte = useMemo<ContexteBascules>(
    () => ({
      basculer,
      noter,
      modificationEnCours: (id) => etat.envois[id] !== undefined,
      appliquerModificationEnCours: (ouvrage) => {
        const envoi = etat.envois[ouvrage.id];
        if (!envoi) return ouvrage;
        return envoi.intention.champ === 'note'
          ? appliquerNotation(ouvrage, envoi.intention)
          : appliquerIntention(ouvrage, envoi.intention);
      },
      erreurModification: (id) => {
        const echec = etat.echecs[id];
        if (!echec) return undefined;
        return avisEchecBascule(echec.intention.champ, echec.erreur.message, () =>
          modifier(echec.intention),
        );
      },
      erreurActualisation: (id) => {
        const echec = etat.echecsActualisation[id];
        if (!echec) return undefined;
        return avisEchecActualisation(echec.champ, echec.erreur.message, () => {
          void actualiser(id, echec.champ, echec.ouvrageConfirme, echec.sequence);
        });
      },
    }),
    [actualiser, basculer, etat, modifier, noter],
  );

  return <BasculesContext.Provider value={contexte}>{children}</BasculesContext.Provider>;
};
