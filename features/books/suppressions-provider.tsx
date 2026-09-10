import { useQueryClient } from '@tanstack/react-query';
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BandeauSuppressions } from '@/components/books/bandeau-suppressions';
import { ConfirmationSuppression } from '@/components/books/confirmation-suppression';
import {
  ajouterAuGroupe,
  annulerGroupe,
  creerEtatGroupeSuppressions,
  demarrerEnvoi,
  type OuvrageASupprimer,
  secondesRestantes,
  terminerEnvoi,
} from '@/domain/groupe-suppressions';
import type { PageOuvrages } from '@/domain/ouvrage';
import { clesOuvrages } from '@/hooks/cles-ouvrages';
import { useDeleteBooksGroup } from '@/hooks/use-delete-books-group';
import { SuppressionsContext } from './contexte-suppressions';

const FREQUENCE_COMPTEUR_MS = 250;

const retirerOuvragesSupprimes = (
  page: PageOuvrages | undefined,
  idsSupprimes: Set<string>,
): PageOuvrages | undefined => {
  if (!page) return page;
  const total = Math.max(0, page.total - idsSupprimes.size);
  return {
    ...page,
    items: page.items.filter(({ id }) => !idsSupprimes.has(id)),
    total,
    totalPages: Math.max(1, Math.ceil(total / page.limit)),
  };
};

export const SuppressionsProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const { mutateAsync: supprimerGroupe } = useDeleteBooksGroup();
  const [etat, setEtat] = useState(creerEtatGroupeSuppressions);
  const [maintenant, setMaintenant] = useState(Date.now);
  const [confirmationReessaiVisible, setConfirmationReessaiVisible] = useState(false);
  const envoiActif = useRef<string | null>(null);

  useEffect(() => {
    if (etat.phase !== 'attente' || etat.echeance === null) return;
    setMaintenant(Date.now());
    const attente = Math.max(0, etat.echeance - Date.now());
    const depart = setTimeout(() => {
      setEtat((courant) => demarrerEnvoi(courant, Date.now()));
    }, attente);
    const compteur = setInterval(() => setMaintenant(Date.now()), FREQUENCE_COMPTEUR_MS);
    return () => {
      clearTimeout(depart);
      clearInterval(compteur);
    };
  }, [etat.echeance, etat.phase]);

  useEffect(() => {
    if (etat.phase !== 'envoi') {
      envoiActif.current = null;
      return;
    }
    const signature = etat.ouvrages.map(({ id }) => id).join('|');
    if (envoiActif.current === signature) return;
    envoiActif.current = signature;
    const ouvragesEnvoyes = etat.ouvrages;

    void supprimerGroupe(ouvragesEnvoyes).then((resultats) => {
      const idsEnEchec = resultats.filter(({ succes }) => !succes).map(({ id }) => id);
      const idsSupprimes = new Set(resultats.filter(({ succes }) => succes).map(({ id }) => id));
      for (const id of idsSupprimes) {
        queryClient.removeQueries({ queryKey: clesOuvrages.fiche(id) });
      }
      queryClient.setQueriesData<PageOuvrages>({ queryKey: clesOuvrages.listes() }, (page) =>
        retirerOuvragesSupprimes(page, idsSupprimes),
      );
      void queryClient.invalidateQueries({ queryKey: clesOuvrages.listes() });
      setEtat((courant) => terminerEnvoi(courant, idsEnEchec));
    });
  }, [etat, queryClient, supprimerGroupe]);

  const confirmerSuppressions = useCallback((ouvrages: OuvrageASupprimer[]) => {
    setEtat((courant) => ajouterAuGroupe(courant, ouvrages, Date.now()));
  }, []);
  const idsMasques = useMemo(() => new Set(etat.ouvrages.map(({ id }) => id)), [etat.ouvrages]);
  const estMasque = useCallback((id: string) => idsMasques.has(id), [idsMasques]);
  const echecsDisponibles = etat.echecs.filter(({ id }) => !idsMasques.has(id));
  const confirmerReessai = () => {
    confirmerSuppressions(echecsDisponibles);
    setConfirmationReessaiVisible(false);
  };
  const contexte = useMemo(
    () => ({ confirmerSuppressions, estMasque, suppressionDesactivee: etat.phase === 'envoi' }),
    [confirmerSuppressions, estMasque, etat.phase],
  );

  return (
    <SuppressionsContext.Provider value={contexte}>
      {children}
      <BandeauSuppressions
        annulerTout={() => setEtat(annulerGroupe)}
        echecs={echecsDisponibles}
        envoi={etat.phase === 'envoi'}
        nombreEnAttente={etat.ouvrages.length}
        reessayer={() => setConfirmationReessaiVisible(true)}
        secondes={secondesRestantes(etat, maintenant)}
      />
      <ConfirmationSuppression
        annuler={() => setConfirmationReessaiVisible(false)}
        confirmer={confirmerReessai}
        ouvrages={echecsDisponibles}
        visible={confirmationReessaiVisible && echecsDisponibles.length > 0}
      />
    </SuppressionsContext.Provider>
  );
};
