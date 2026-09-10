import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  creerCriteresOuvrages as creerCriteres,
} from '../../domain/criteres-ouvrages';
import { fetchBooksPage } from '../../services/api/books-api';

const creerCriteresOuvrages = (page: number, recherche: string) =>
  creerCriteres(page, { ...CONSULTATION_FONDS_PAR_DEFAUT, recherche });

const bookPageResponse = {
  items: [
    {
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
    },
  ],
  page: 2,
  limit: 20,
  total: 41,
  totalPages: 3,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('API des ouvrages', () => {
  it('demande au serveur une page de vingt ouvrages triés par titre croissant', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(bookPageResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchBooksPage(creerCriteresOuvrages(2, ''));

    expect(result).toEqual(bookPageResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/books?page=2&limit=20&sort=titre&order=asc',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        method: 'GET',
      }),
    );
  });

  it.each([
    ['lu', 'lu'],
    ['nonlu', 'nonlu'],
  ] as const)('envoie le filtre de lecture %s au serveur', async (_libelle, lecture) => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(bookPageResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchBooksPage(creerCriteres(2, { ...CONSULTATION_FONDS_PAR_DEFAUT, lecture }));

    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get('status')).toBe(lecture);
  });

  it('valide les champs serveur sensibles au lieu de fabriquer des données', async () => {
    const anneeTropFuture = new Date().getFullYear() + 2;
    const ouvragesInvalides = [
      { ...bookPageResponse.items[0], id: 'identifiant-invalide' },
      { ...bookPageResponse.items[0], createdAt: 'date-invalide' },
      { ...bookPageResponse.items[0], version: '3' },
      { ...bookPageResponse.items[0], annee: 1449 },
      { ...bookPageResponse.items[0], annee: anneeTropFuture },
    ];
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    for (const ouvrageInvalide of ouvragesInvalides) {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ...bookPageResponse, items: [ouvrageInvalide], page: 1 }), {
          status: 200,
        }),
      );
      await expect(fetchBooksPage(creerCriteresOuvrages(1, ''))).rejects.toMatchObject({
        type: 'validation',
        message: 'La réponse du serveur pour les ouvrages est invalide.',
      });
    }
  });

  it('traduit un échec du transport en erreur réseau réessayable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(fetchBooksPage(creerCriteresOuvrages(1, ''))).rejects.toMatchObject({
      type: 'reseau',
      cause: 'indisponible',
      reessayable: true,
    });
  });

  it('traduit une indisponibilité 503 en erreur réessayable', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ erreur: 'chaos', message: 'Service temporairement indisponible.' }),
            { status: 503 },
          ),
        ),
    );

    await expect(fetchBooksPage(creerCriteresOuvrages(1, ''))).rejects.toMatchObject({
      type: 'reseau',
      cause: 'indisponible',
      message: 'Service temporairement indisponible.',
      reessayable: true,
      statut: 503,
    });
  });

  it("interrompt le transport lorsque le délai d'attente est dépassé", async () => {
    const delaiExpirationAttenduMs = 10_000;
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      const signal = initialisation?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const requete = expect(fetchBooksPage(creerCriteresOuvrages(1, ''))).rejects.toMatchObject({
      type: 'reseau',
      cause: 'expiration',
      reessayable: true,
    });
    await vi.advanceTimersByTimeAsync(delaiExpirationAttenduMs);

    await requete;
  });

  it("transmet l'annulation au transport", async () => {
    const controleur = new AbortController();
    let signalTransport: AbortSignal | null | undefined;
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      signalTransport = initialisation?.signal;
      return new Promise((_resolve, reject) => {
        signalTransport?.addEventListener('abort', () => reject(new Error('aborted')), {
          once: true,
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const requete = fetchBooksPage(creerCriteresOuvrages(1, ''), controleur.signal);
    controleur.abort();

    await expect(requete).rejects.toMatchObject({
      type: 'reseau',
      cause: 'annulation',
      reessayable: false,
    });
    expect(signalTransport?.aborted).toBe(true);
  });
});
