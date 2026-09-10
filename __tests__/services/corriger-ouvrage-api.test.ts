import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchBook } from '../../services/api/books-api';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';

const ouvrageCorrige = {
  id: ID,
  titre: 'Bel Ami',
  auteur: 'Guy de Maupassant',
  editeur: 'Havard',
  annee: 1885,
  lu: true,
  favori: true,
  note: 4,
  couverture: 'https://exemple.test/couverture.jpg',
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-03T10:00:00.000Z',
  version: 4,
};

afterEach(() => vi.unstubAllGlobals());

describe('correction d’un ouvrage côté service', () => {
  it('envoie uniquement les champs corrigés en PATCH et conserve les champs serveur', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrageCorrige), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const ouvrage = await patchBook(ID, { titre: 'Bel Ami' });

    expect(ouvrage).toEqual(ouvrageCorrige);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre: 'Bel Ami' }),
      }),
    );
  });

  it('refuse une réponse portant un autre identifiant que celui corrigé', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({ ...ouvrageCorrige, id: '00000000-0000-4000-8000-000000000000' }),
          {
            status: 200,
          },
        ),
      ),
    );

    await expect(patchBook(ID, { lu: true })).rejects.toMatchObject({ type: 'validation' });
  });

  it('traduit un refus 422 du serveur en erreur de validation par champ', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({ erreur: 'validation', champs: { annee: 'annee invalide' } }),
          {
            status: 422,
          },
        ),
      ),
    );

    await expect(patchBook(ID, { annee: 12 })).rejects.toMatchObject({
      type: 'validation',
      champs: { annee: 'annee invalide' },
    });
  });
});
