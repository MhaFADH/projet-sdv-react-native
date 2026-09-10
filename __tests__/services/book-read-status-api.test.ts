import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchBookReadStatus } from '../../services/api/books-api';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: true,
  favori: false,
  note: 4,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 4,
};

afterEach(() => vi.unstubAllGlobals());

describe('API du statut de lecture', () => {
  it('envoie uniquement le statut dans un PATCH et conserve la réponse serveur complète', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrage), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(patchBookReadStatus(ouvrage.id, true)).resolves.toEqual(ouvrage);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ lu: true }),
      }),
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

    await expect(patchBookReadStatus(ouvrage.id, true)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur après modification du statut est invalide.',
    });
  });
});
