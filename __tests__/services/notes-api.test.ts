import { afterEach, describe, expect, it, vi } from 'vitest';
import { recupererNotes } from '../../services/api/notes-api';

const ID_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8401';
const notes = [
  {
    id: 'b248b48c-8df4-4883-8a23-6f53b3145ec9',
    livreId: ID_LIVRE,
    contenu: 'Une observation récente.',
    createdAt: '2025-01-02T10:30:00.000Z',
  },
  {
    id: '03c36090-9281-40c4-8cf2-4e36c18304c6',
    livreId: ID_LIVRE,
    contenu: 'Une observation plus ancienne.',
    createdAt: '2025-01-01T09:15:00.000Z',
  },
];

afterEach(() => vi.unstubAllGlobals());

describe('API des notes de lecture', () => {
  it('lit le tableau sans modifier l’ordre du serveur', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(notes), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(recupererNotes(ID_LIVRE)).resolves.toEqual(notes);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID_LIVRE}/notes`,
      expect.objectContaining({ headers: { Accept: 'application/json' }, method: 'GET' }),
    );
  });

  it('accepte les identifiants chaîne qui ne sont pas des UUID', async () => {
    const livreId = 'livre-bel-ami';
    const note = { ...notes[0], id: 'note-lecture-1', livreId };
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify([note]), { status: 200 })),
    );

    await expect(recupererNotes(livreId)).resolves.toEqual([note]);
  });

  it.each([
    ['une réponse qui n’est pas un tableau', { items: notes }],
    ['une note invalide', [{ ...notes[0], createdAt: 'hier' }]],
    ['une note trop longue', [{ ...notes[0], contenu: 'x'.repeat(1_001) }]],
    ['une note rattachée à un autre ouvrage', [{ ...notes[0], livreId: notes[0].id }]],
  ])('refuse %s', async (_libelle, corps) => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(corps), { status: 200 })),
    );

    await expect(recupererNotes(ID_LIVRE)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour les notes est invalide.',
    });
  });

  it('transmet l’annulation au transport', async () => {
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

    const requete = recupererNotes(ID_LIVRE, controleur.signal);
    controleur.abort();

    await expect(requete).rejects.toMatchObject({ type: 'reseau', cause: 'annulation' });
    expect(signalTransport?.aborted).toBe(true);
  });
});
