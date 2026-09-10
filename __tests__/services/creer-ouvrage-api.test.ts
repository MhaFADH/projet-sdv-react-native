import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBook } from '../../services/api/books-api';

const DELAI_EXPIRATION_MS = 10_000;

const saisie = {
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: '',
  annee: 1885,
  lu: false,
};

const ouvrageCree = {
  id: '33575fa9-7968-45b3-8447-ec994a0b8402',
  titre: 'Bel-Ami',
  auteur: 'Guy de Maupassant',
  editeur: '',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-01T10:00:00.000Z',
  version: 1,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('création d’un ouvrage', () => {
  it('envoie les champs du lot 1 en POST et valide la réponse du serveur', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrageCree), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const ouvrage = await createBook(saisie);

    expect(ouvrage).toEqual(ouvrageCree);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/books',
      expect.objectContaining({
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(saisie),
      }),
    );
  });

  it('transmet un éditeur vide sans le remplacer par null', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(ouvrageCree), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await createBook(saisie);

    const corps = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(corps.editeur).toBe('');
    expect(corps.lu).toBe(false);
    expect(corps.annee).toBe(1885);
  });

  it('refuse une réponse de création invalide au lieu de fabriquer un ouvrage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ ...ouvrageCree, id: 'identifiant-invalide' }), {
          status: 201,
        }),
      ),
    );

    await expect(createBook(saisie)).rejects.toMatchObject({ type: 'validation' });
  });

  it('traduit un refus 422 en erreurs par champ, même sans message général', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ erreur: 'validation', champs: { titre: 'ne peut pas etre vide' } }),
            { status: 422 },
          ),
        ),
    );

    const erreur = await createBook(saisie).catch((cause: unknown) => cause);

    expect(erreur).toMatchObject({
      type: 'validation',
      champs: { titre: 'ne peut pas etre vide' },
    });
  });

  it('conserve le statut 503 renvoyé par le serveur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ erreur: 'chaos', message: 'Service indisponible.' }), {
          status: 503,
        }),
      ),
    );

    const erreur = await createBook(saisie).catch((cause: unknown) => cause);

    expect(erreur).toMatchObject({ type: 'reseau', cause: 'indisponible', statut: 503 });
  });

  it('ne rapporte aucun statut lorsque la requête n’obtient aucune réponse', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    const erreur = await createBook(saisie).catch((cause: unknown) => cause);

    expect(erreur).toMatchObject({ type: 'reseau', cause: 'indisponible' });
    expect(erreur).not.toHaveProperty('statut');
  });

  it('signale un délai d’expiration dépassé sans statut serveur', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        (_entree, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      ),
    );

    const promesse = createBook(saisie).catch((cause: unknown) => cause);
    await vi.advanceTimersByTimeAsync(DELAI_EXPIRATION_MS);
    const erreur = await promesse;

    expect(erreur).toMatchObject({ type: 'reseau', cause: 'expiration' });
    expect(erreur).not.toHaveProperty('statut');
  });
});
