import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchBasculeOuvrage } from '../../services/api/books-api';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: true,
  favori: true,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 4,
};

const reponseOuvrage = () => new Response(JSON.stringify(ouvrage), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe('API des bascules d’ouvrage', () => {
  it('envoie uniquement le statut de lecture et conserve la réponse serveur complète', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponseOuvrage());
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      patchBasculeOuvrage({ id: ouvrage.id, champ: 'lu', valeur: true }),
    ).resolves.toEqual(ouvrage);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ lu: true }),
      }),
    );
  });

  it('envoie uniquement le coup de cœur désiré sans les champs non concernés', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(reponseOuvrage());
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      patchBasculeOuvrage({ id: ouvrage.id, champ: 'favori', valeur: true }),
    ).resolves.toMatchObject({ favori: true, version: 4 });
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ favori: true }) }),
    );
  });

  it('transmet le retrait d’un coup de cœur sous forme de valeur fausse', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ ...ouvrage, favori: false }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      patchBasculeOuvrage({ id: ouvrage.id, champ: 'favori', valeur: false }),
    ).resolves.toMatchObject({ favori: false });
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({ body: JSON.stringify({ favori: false }) }),
    );
  });

  it('refuse une réponse PATCH dont un champ serveur est invalide', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...ouvrage, version: '4' }), { status: 200 }),
        ),
    );

    await expect(
      patchBasculeOuvrage({ id: ouvrage.id, champ: 'lu', valeur: true }),
    ).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur après la bascule est invalide.',
    });
  });

  it('refuse une réponse PATCH portant sur un autre ouvrage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ ...ouvrage, id: '7b1f4c0e-2d5a-4e8b-9c31-5a6d8e2f0b14' }), {
          status: 200,
        }),
      ),
    );

    await expect(
      patchBasculeOuvrage({ id: ouvrage.id, champ: 'favori', valeur: true }),
    ).rejects.toMatchObject({ type: 'validation' });
  });
});
