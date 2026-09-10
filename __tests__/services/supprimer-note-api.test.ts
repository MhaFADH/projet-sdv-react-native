import { afterEach, describe, expect, it, vi } from 'vitest';
import { supprimerNote } from '../../services/api/notes-api';

const ID_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8401';
const ID_NOTE = 'b248b48c-8df4-4883-8a23-6f53b3145ec9';

const reponse = (corps: BodyInit | null, statut: number) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(corps, { status: statut }));

afterEach(() => vi.unstubAllGlobals());

describe('suppression d’une note de lecture', () => {
  it('envoie le DELETE sur la route imbriquée du contrat', async () => {
    const fetchMock = reponse(null, 204);
    vi.stubGlobal('fetch', fetchMock);

    await expect(supprimerNote(ID_LIVRE, ID_NOTE)).resolves.toBe('supprimee');
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID_LIVRE}/notes/${ID_NOTE}`,
      expect.objectContaining({ method: 'DELETE', headers: { Accept: 'application/json' } }),
    );
  });

  it('encode les identifiants dans le chemin', async () => {
    const fetchMock = reponse(null, 204);
    vi.stubGlobal('fetch', fetchMock);

    await supprimerNote('livre/1', 'note 2');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/books/livre%2F1/notes/note%202',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('traite un 404 documenté comme une note déjà absente', async () => {
    vi.stubGlobal(
      'fetch',
      reponse(JSON.stringify({ erreur: 'introuvable', message: 'Note inconnue.' }), 404),
    );

    await expect(supprimerNote(ID_LIVRE, ID_NOTE)).resolves.toBe('deja-absente');
  });

  it('refuse une réponse de succès non conforme au contrat', async () => {
    vi.stubGlobal('fetch', reponse(JSON.stringify({ statut: 'ok' }), 200));

    await expect(supprimerNote(ID_LIVRE, ID_NOTE)).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour la suppression est invalide.',
    });
  });

  it('propage un 503 comme erreur réseau réessayable', async () => {
    vi.stubGlobal('fetch', reponse(JSON.stringify({ erreur: 'chaos' }), 503));

    await expect(supprimerNote(ID_LIVRE, ID_NOTE)).rejects.toMatchObject({
      type: 'reseau',
      cause: 'indisponible',
      statut: 503,
      reessayable: true,
    });
  });

  it('propage une coupure du transport', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch')),
    );

    await expect(supprimerNote(ID_LIVRE, ID_NOTE)).rejects.toMatchObject({
      type: 'reseau',
      cause: 'indisponible',
      reessayable: true,
    });
  });
});
