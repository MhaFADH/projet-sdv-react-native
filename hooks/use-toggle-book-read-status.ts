import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import type { Ouvrage, PageOuvrages } from '@/domain/ouvrage';
import { patchBookReadStatus } from '@/services/api/books-api';
import type { ErreurApplication } from '@/services/api/erreurs';
import { autoriserReessai, DELAI_REESSAI_MS } from '@/services/api/politique-reessai';
import { clesOuvrages } from './cles-ouvrages';

type VariablesBascule = {
  id: string;
  lu: boolean;
};

type ContexteBascule = {
  sequence: number;
  fichePrecedente: Ouvrage | undefined;
  listesPrecedentes: Array<[QueryKey, PageOuvrages | undefined]>;
};

const actualiserPage = (
  page: PageOuvrages | undefined,
  id: string,
  actualiser: (ouvrage: Ouvrage) => Ouvrage,
): PageOuvrages | undefined => {
  if (!page?.items.some((ouvrage) => ouvrage.id === id)) return page;
  return {
    ...page,
    items: page.items.map((ouvrage) => (ouvrage.id === id ? actualiser(ouvrage) : ouvrage)),
  };
};

export const useToggleBookReadStatus = (id: string) => {
  const client = useQueryClient();
  const derniereSequence = useRef(0);
  const [erreurActualisation, setErreurActualisation] = useState<ErreurApplication>();
  const actualiserApresConfirmation = async () => {
    setErreurActualisation(undefined);
    await Promise.all([
      client.invalidateQueries({ queryKey: clesOuvrages.fiche(id) }),
      client.invalidateQueries({ queryKey: clesOuvrages.listes() }),
    ]);
    const erreur = client.getQueryState<Ouvrage, ErreurApplication>(clesOuvrages.fiche(id))?.error;
    if (erreur) setErreurActualisation(erreur);
  };
  const mutation = useMutation<Ouvrage, ErreurApplication, VariablesBascule, ContexteBascule>({
    mutationFn: (variables) => patchBookReadStatus(variables.id, variables.lu),
    retry: autoriserReessai,
    retryDelay: DELAI_REESSAI_MS,
    onMutate: async (variables) => {
      setErreurActualisation(undefined);
      const sequence = derniereSequence.current + 1;
      derniereSequence.current = sequence;
      await Promise.all([
        client.cancelQueries({ queryKey: clesOuvrages.fiche(variables.id) }),
        client.cancelQueries({ queryKey: clesOuvrages.listes() }),
      ]);
      const fichePrecedente = client.getQueryData<Ouvrage>(clesOuvrages.fiche(variables.id));
      const listesPrecedentes = client.getQueriesData<PageOuvrages>({
        queryKey: clesOuvrages.listes(),
      });

      client.setQueryData<Ouvrage>(clesOuvrages.fiche(variables.id), (ouvrage) =>
        ouvrage ? { ...ouvrage, lu: variables.lu } : ouvrage,
      );
      client.setQueriesData<PageOuvrages>({ queryKey: clesOuvrages.listes() }, (page) =>
        actualiserPage(page, variables.id, (ouvrage) => ({ ...ouvrage, lu: variables.lu })),
      );
      return { sequence, fichePrecedente, listesPrecedentes };
    },
    onError: (_erreur, variables, contexte) => {
      if (!contexte || contexte.sequence !== derniereSequence.current) return;
      client.setQueryData(clesOuvrages.fiche(variables.id), contexte.fichePrecedente);
      for (const [cle, page] of contexte.listesPrecedentes) client.setQueryData(cle, page);
    },
    onSuccess: async (ouvrage, _variables, contexte) => {
      if (!contexte || contexte.sequence !== derniereSequence.current) return;
      client.setQueryData(clesOuvrages.fiche(ouvrage.id), ouvrage);
      client.setQueriesData<PageOuvrages>({ queryKey: clesOuvrages.listes() }, (page) =>
        actualiserPage(page, ouvrage.id, () => ouvrage),
      );
      await actualiserApresConfirmation();
    },
  });

  const reessayer = () => {
    if (mutation.variables) mutation.mutate(mutation.variables);
  };

  return {
    basculer: (lu: boolean) => mutation.mutate({ id, lu }),
    enCours: mutation.isPending,
    erreurActualisation: erreurActualisation
      ? {
          message: `Le statut a été enregistré, mais la fiche n’a pas pu être actualisée. ${erreurActualisation.message}`,
          reessayer: () => void actualiserApresConfirmation(),
        }
      : undefined,
    erreur: mutation.error
      ? {
          message: `Le statut précédent a été restauré. ${mutation.error.message}`,
          reessayer,
        }
      : undefined,
  };
};
