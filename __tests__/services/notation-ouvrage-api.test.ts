import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchNotationOuvrage } from '../../services/api/books-api';

const ouvrage = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Victor Havard',
  annee: 1885,
  lu: true,
  favori: true,
  note: 3,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 4,
};

afterEach(() => vi.unstubAllGlobals());

describe('API de notation d’un ouvrage', () => {
  it('envoie uniquement la notation numérique et conserve la réponse serveur complète', async () => {
    const transportSimule = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrage), { status: 200 }));
    vi.stubGlobal('fetch', transportSimule);

    await expect(patchNotationOuvrage({ id: ouvrage.id, valeur: 3 })).resolves.toEqual(ouvrage);
    expect(transportSimule).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 3 }),
      }),
    );
  });

  it('refuse une réponse incomplète ou portant une version invalide', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...ouvrage, version: '4' }), { status: 200 }),
        ),
    );

    await expect(patchNotationOuvrage({ id: ouvrage.id, valeur: 3 })).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur après la notation est invalide.',
    });
  });
});
