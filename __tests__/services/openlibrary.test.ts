import { afterEach, describe, expect, it, vi } from 'vitest';
import { rechercherOpenLibrary, type TransportOpenLibrary } from '../../services/openlibrary';

afterEach(() => vi.useRealTimers());

describe('service public OpenLibrary', () => {
  it('recherche uniquement par titre et restitue le nombre d’éditions et la première année', async () => {
    const transport = vi.fn<TransportOpenLibrary>().mockResolvedValue(
      new Response(
        JSON.stringify({
          numFound: 27,
          docs: [{ first_publish_year: 1885 }],
        }),
        { status: 200 },
      ),
    );

    const resultat = await rechercherOpenLibrary('Bel Ami & compagnie', { transport });

    expect(resultat).toEqual({ nombreEditions: 27, premiereAnnee: 1885 });
    expect(transport).toHaveBeenCalledOnce();
    expect(transport).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?title=Bel+Ami+%26+compagnie',
      expect.objectContaining({ method: 'GET' }),
    );
    const url = new URL(String(transport.mock.calls[0][0]));
    expect([...url.searchParams.keys()]).toEqual(['title']);
  });

  it('conserve le nombre d’éditions quand le premier résultat ne fournit aucune année', async () => {
    const transport = vi
      .fn<TransportOpenLibrary>()
      .mockResolvedValue(
        new Response(JSON.stringify({ numFound: 3, docs: [{}] }), { status: 200 }),
      );

    await expect(rechercherOpenLibrary('Titre sans année', { transport })).resolves.toEqual({
      nombreEditions: 3,
    });
  });

  it('accepte zéro résultat comme un enrichissement normal', async () => {
    const transport = vi
      .fn<TransportOpenLibrary>()
      .mockResolvedValue(new Response(JSON.stringify({ numFound: 0, docs: [] }), { status: 200 }));

    await expect(rechercherOpenLibrary('Titre inconnu', { transport })).resolves.toEqual({
      nombreEditions: 0,
    });
  });

  it('refuse une réponse HTTP en échec même si son corps ressemble à un succès', async () => {
    const transport = vi.fn<TransportOpenLibrary>().mockResolvedValue(
      new Response(JSON.stringify({ numFound: 4, docs: [] }), {
        status: 503,
      }),
    );

    await expect(
      rechercherOpenLibrary('Service indisponible', { transport }),
    ).rejects.toMatchObject({ type: 'reseau', cause: 'indisponible', statut: 503 });
  });

  it('refuse une réponse dont le contrat externe est invalide', async () => {
    const transport = vi.fn<TransportOpenLibrary>().mockResolvedValue(
      new Response(JSON.stringify({ numFound: '4', docs: [] }), {
        status: 200,
      }),
    );

    await expect(rechercherOpenLibrary('Réponse invalide', { transport })).rejects.toMatchObject({
      type: 'validation',
    });
  });

  it('expire même si la lecture du corps ne coopère pas avec l’annulation', async () => {
    const delaiExpirationAttenduMs = 5_000;
    vi.useFakeTimers();
    let signalTransport: AbortSignal | null | undefined;
    const transport = vi.fn<TransportOpenLibrary>().mockImplementation((_url, initialisation) => {
      signalTransport = initialisation.signal;
      return Promise.resolve(new Response(new ReadableStream()));
    });

    const requete = expect(
      rechercherOpenLibrary('Recherche trop lente', { transport }),
    ).rejects.toMatchObject({ type: 'reseau', cause: 'expiration' });
    await vi.advanceTimersByTimeAsync(delaiExpirationAttenduMs);

    expect(signalTransport?.aborted).toBe(true);
    await requete;
  });

  it('propage une annulation devenue inutile au transport', async () => {
    const controleur = new AbortController();
    let signalTransport: AbortSignal | null | undefined;
    const transport = vi.fn<TransportOpenLibrary>().mockImplementation((_url, initialisation) => {
      signalTransport = initialisation.signal;
      return new Promise((_resolve, reject) => {
        signalTransport?.addEventListener('abort', () => reject(new Error('annulation')), {
          once: true,
        });
      });
    });
    const requete = expect(
      rechercherOpenLibrary('Ancien titre', { signal: controleur.signal, transport }),
    ).rejects.toMatchObject({ type: 'reseau', cause: 'annulation' });

    controleur.abort();

    expect(signalTransport?.aborted).toBe(true);
    await requete;
  });
});
