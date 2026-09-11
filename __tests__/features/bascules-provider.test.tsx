import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import {
  AUTRE_ID,
  autreOuvrage,
  creerEnvironnement,
  ID,
  lireOuvrage,
  ouvrage,
} from './outils-bascules-provider';

afterEach(() => vi.unstubAllGlobals());

describe('coordination des bascules d’ouvrage', () => {
  it('affiche l’intention avant la réponse puis conserve les données serveur confirmées', async () => {
    let confirmerPatch: ((reponse: Response) => void) | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resoudre) => {
          confirmerPatch = resoudre;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { client, result } = creerEnvironnement();

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));

    await waitFor(() => expect(result.current.modificationEnCours(ID)).toBe(true));
    expect(result.current.appliquerModificationEnCours(ouvrage).favori).toBe(true);
    expect(lireOuvrage(client, ID)?.favori).toBe(false);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ favori: true }),
    });

    await act(async () =>
      confirmerPatch?.(
        new Response(JSON.stringify({ ...ouvrage, favori: true, version: 4 }), { status: 200 }),
      ),
    );

    await waitFor(() => expect(result.current.modificationEnCours(ID)).toBe(false));
    expect(lireOuvrage(client, ID)).toMatchObject({ favori: true, version: 4, titre: 'Bel-Ami' });
    expect(client.getQueryData(clesOuvrages.fiche(ID))).toMatchObject({ favori: true, version: 4 });
    expect(client.getQueryState(clesOuvrages.liste(1))?.isInvalidated).toBe(true);
    client.clear();
  });

  it('verrouille le même ouvrage pendant l’envoi et laisse les autres disponibles', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const { client, result } = creerEnvironnement([ouvrage, autreOuvrage]);

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));
    await waitFor(() => expect(result.current.modificationEnCours(ID)).toBe(true));

    act(() => result.current.basculer({ id: ID, champ: 'lu', valeur: true }));
    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: false }));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.current.appliquerModificationEnCours(ouvrage)).toMatchObject({
      favori: true,
      lu: false,
    });
    expect(result.current.modificationEnCours(AUTRE_ID)).toBe(false);

    act(() => result.current.basculer({ id: AUTRE_ID, champ: 'favori', valeur: true }));
    await waitFor(() => expect(result.current.modificationEnCours(AUTRE_ID)).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('restaure la valeur précédente après un refus et permet de réessayer', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ erreur: 'refus', message: 'Modification refusée.' }), {
          status: 422,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ...ouvrage, favori: true, version: 4 }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const { client, result } = creerEnvironnement();

    act(() => result.current.basculer({ id: ID, champ: 'favori', valeur: true }));

    await waitFor(() => expect(result.current.erreurModification(ID)).toBeDefined());
    expect(result.current.modificationEnCours(ID)).toBe(false);
    expect(result.current.appliquerModificationEnCours(ouvrage).favori).toBe(false);
    expect(result.current.erreurModification(ID)?.message).toBe(
      'Le coup de cœur précédent a été restauré. Modification refusée.',
    );

    act(() => result.current.erreurModification(ID)?.reessayer());

    await waitFor(() => expect(lireOuvrage(client, ID)?.favori).toBe(true));
    expect(result.current.erreurModification(ID)).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('conserve le succès d’un ouvrage lorsque la bascule d’un autre échoue ensuite', async () => {
    const reponses = new Map<string, (reponse: Response) => void>();
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        (entree) =>
          new Promise<Response>((resoudre) => {
            reponses.set(String(entree).includes(AUTRE_ID) ? AUTRE_ID : ID, resoudre);
          }),
      ),
    );
    const { client, result } = creerEnvironnement([ouvrage, autreOuvrage]);

    act(() => {
      result.current.basculer({ id: ID, champ: 'favori', valeur: true });
      result.current.basculer({ id: AUTRE_ID, champ: 'favori', valeur: true });
    });
    await waitFor(() => expect(reponses.size).toBe(2));

    await act(async () =>
      reponses.get(ID)?.(
        new Response(JSON.stringify({ ...ouvrage, favori: true, version: 4 }), { status: 200 }),
      ),
    );
    await waitFor(() => expect(lireOuvrage(client, ID)?.favori).toBe(true));

    await act(async () =>
      reponses.get(AUTRE_ID)?.(
        new Response(JSON.stringify({ erreur: 'refus', message: 'Modification refusée.' }), {
          status: 422,
        }),
      ),
    );

    await waitFor(() => expect(result.current.erreurModification(AUTRE_ID)).toBeDefined());
    expect(lireOuvrage(client, ID)?.favori).toBe(true);
    expect(lireOuvrage(client, AUTRE_ID)?.favori).toBe(false);
    expect(result.current.erreurModification(ID)).toBeUndefined();
    client.clear();
  });
});
