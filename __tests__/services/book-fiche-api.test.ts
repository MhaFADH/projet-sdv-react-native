import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBook } from '../../services/api/books-api';

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
  version: 3,
};

afterEach(() => vi.unstubAllGlobals());

describe('API de la fiche d’un ouvrage', () => {
  it('demande la fiche par identifiant et conserve les champs serveur', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrage), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const resultat = await fetchBook(ouvrage.id);

    expect(resultat).toEqual(ouvrage);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ouvrage.id}`,
      expect.objectContaining({ headers: { Accept: 'application/json' }, method: 'GET' }),
    );
  });

  it('accepte un éditeur vide sur une fiche', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ ...ouvrage, editeur: '' }), {
          status: 200,
        }),
      ),
    );

    await expect(fetchBook(ouvrage.id)).resolves.toMatchObject({ editeur: '' });
  });

  it('traduit une fiche absente en erreur introuvable non réessayable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ erreur: 'introuvable', message: 'Livre inconnu.' }), {
          status: 404,
        }),
      ),
    );

    await expect(fetchBook(ouvrage.id)).rejects.toMatchObject({
      type: 'introuvable',
      message: 'Livre inconnu.',
    });
  });

  it('refuse une fiche dont les champs serveur sont invalides', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ ...ouvrage, version: '3' }), {
          status: 200,
        }),
      ),
    );

    await expect(fetchBook(ouvrage.id)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour cette fiche est invalide.',
    });
  });

  it("transmet l'annulation de la fiche au transport", async () => {
    const controleur = new AbortController();
    let signalTransport: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
        signalTransport = initialisation?.signal;
        return new Promise((_resolve, reject) => {
          signalTransport?.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          });
        });
      }),
    );

    const requete = fetchBook(ouvrage.id, controleur.signal);
    controleur.abort();

    await expect(requete).rejects.toMatchObject({ type: 'reseau', cause: 'annulation' });
    expect(signalTransport?.aborted).toBe(true);
  });

  it("refuse une fiche dont l'identifiant ne correspond pas à celui demandé", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(
          JSON.stringify({
            ...ouvrage,
            id: 'ac6a1e2f-2f2c-4c54-9f0e-0d0c2a3b4c5d',
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(fetchBook(ouvrage.id)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour cette fiche est invalide.',
    });
  });
});
