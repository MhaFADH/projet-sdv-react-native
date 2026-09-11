import { onlineManager } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { creerEnvironnement, ID, ouvrage } from './outils-bascules-provider';

afterEach(() => {
  onlineManager.setOnline(true);
  vi.unstubAllGlobals();
});

describe('reprise des bascules après un échec', () => {
  it('temporise un unique réessai automatique après une réponse 503', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { client, result } = creerEnvironnement();

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await new Promise((resoudre) => setTimeout(resoudre, 100));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.current.modificationEnCours(ID)).toBe(true);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2), { timeout: 2_000 });
    await waitFor(() => expect(result.current.erreurModification(ID)).toBeDefined());
    expect(result.current.appliquerModificationEnCours(ouvrage).favori).toBe(false);
    client.clear();
  });

  it('expose l’échec et libère le verrou même si la connectivité est jugée absente', async () => {
    onlineManager.setOnline(false);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
        status: 503,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { client, result } = creerEnvironnement();

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));

    await waitFor(() => expect(result.current.erreurModification(ID)).toBeDefined(), {
      timeout: 4_000,
    });
    expect(result.current.modificationEnCours(ID)).toBe(false);
    expect(result.current.appliquerModificationEnCours(ouvrage).favori).toBe(false);
    expect(result.current.erreurModification(ID)?.message).toContain(
      'Le coup de cœur précédent a été restauré.',
    );
    client.clear();
  });

  it('n’annonce pas un échec d’actualisation à partir d’une fiche non observée', async () => {
    const { client, result } = creerEnvironnement();
    await client
      .fetchQuery({
        queryKey: clesOuvrages.fiche(ID),
        queryFn: () => Promise.reject({ type: 'reseau', message: 'Lecture précédente échouée.' }),
        retry: false,
      })
      .catch(() => undefined);
    expect(client.getQueryState(clesOuvrages.fiche(ID))?.error).toBeDefined();

    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...ouvrage, favori: true, version: 4 }), { status: 200 }),
        ),
    );

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));

    await waitFor(() => expect(result.current.modificationEnCours(ID)).toBe(false));
    expect(result.current.erreurActualisation(ID)).toBeUndefined();
    expect(result.current.erreurModification(ID)).toBeUndefined();
    client.clear();
  });
});
