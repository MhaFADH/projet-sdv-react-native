import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { EnrichissementBibliographique } from '@/domain/enrichissement-bibliographique';
import type { ErreurApplication } from '@/services/api/erreurs';
import { configuration } from '@/services/configuration';
import { rechercherOpenLibrary } from '@/services/openlibrary';
import { clesOpenLibrary } from './cles-openlibrary';

const DUREE_FRAICHEUR_OPENLIBRARY_MS = 5 * 60 * 1_000;
const DUREE_CACHE_OPENLIBRARY_MS = 30 * 60 * 1_000;

export const useOpenLibrary = (titre?: string): EnrichissementBibliographique | undefined => {
  const client = useQueryClient();
  const titreDemande = titre ?? '';
  const [titreRecherche, setTitreRecherche] = useState('');

  useEffect(() => {
    if (titreDemande === '') {
      setTitreRecherche('');
      return;
    }
    const attente = setTimeout(
      () => setTitreRecherche(titreDemande),
      configuration.delaiRechercheMs,
    );
    return () => clearTimeout(attente);
  }, [titreDemande]);

  useEffect(() => {
    if (titreRecherche === '' || titreRecherche === titreDemande) return;
    void client.cancelQueries({ queryKey: clesOpenLibrary.recherche(titreRecherche), exact: true });
  }, [client, titreDemande, titreRecherche]);

  const requete = useQuery<EnrichissementBibliographique, ErreurApplication>({
    queryKey: clesOpenLibrary.recherche(titreRecherche),
    queryFn: ({ signal }) => rechercherOpenLibrary(titreRecherche, { signal }),
    enabled: titreRecherche !== '' && titreRecherche === titreDemande,
    retry: false,
    staleTime: DUREE_FRAICHEUR_OPENLIBRARY_MS,
    gcTime: DUREE_CACHE_OPENLIBRARY_MS,
  });

  return titreRecherche === titreDemande ? requete.data : undefined;
};
