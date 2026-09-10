import { afterEach, describe, expect, it, vi } from 'vitest';
import { deleteBook } from '../../services/api/books-api';

const ID = '33575fa9-7968-45b3-8447-ec994a0b8402';

afterEach(() => vi.unstubAllGlobals());

describe('API de suppression d’un ouvrage', () => {
  it('envoie un DELETE par le client HTTP partagé et accepte uniquement la réponse 204 vide', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteBook(ID)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID}`,
      expect.objectContaining({ headers: { Accept: 'application/json' }, method: 'DELETE' }),
    );
  });

  it('traduit un refus du serveur en erreur visible par le parcours', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
          status: 503,
        }),
      ),
    );

    await expect(deleteBook(ID)).rejects.toMatchObject({
      type: 'reseau',
      message: 'Service indisponible.',
      reessayable: true,
    });
  });

  it('refuse une réponse de suppression non conforme au contrat', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 200 })),
    );

    await expect(deleteBook(ID)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour la suppression est invalide.',
    });
  });
});
