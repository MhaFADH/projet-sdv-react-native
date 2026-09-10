import { afterEach, describe, expect, it, vi } from 'vitest';
import { ajouterNote } from '../../services/api/notes-api';

const ID_LIVRE = '33575fa9-7968-45b3-8447-ec994a0b8401';

const note = {
  id: 'b248b48c-8df4-4883-8a23-6f53b3145ec9',
  livreId: ID_LIVRE,
  contenu: 'Une observation récente.',
  createdAt: '2025-01-02T10:30:00.000Z',
};

const reponse = (corps: unknown, statut: number) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(corps), { status: statut }));

afterEach(() => vi.unstubAllGlobals());

describe('ajout d’une note de lecture', () => {
  it('envoie le seul champ contenu par le client HTTP commun', async () => {
    const fetchMock = reponse(note, 201);
    vi.stubGlobal('fetch', fetchMock);

    await expect(ajouterNote(ID_LIVRE, { contenu: 'Une observation récente.' })).resolves.toEqual(
      note,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID_LIVRE}/notes`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ contenu: 'Une observation récente.' }),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      }),
    );
  });

  it.each([
    ['une réponse qui n’est pas une note', { erreur: 'validation' }],
    ['une note dont la date est invalide', { ...note, createdAt: 'hier' }],
    ['une note trop longue', { ...note, contenu: 'x'.repeat(1_001) }],
    ['une note rattachée à un autre ouvrage', { ...note, livreId: note.id }],
  ])('refuse %s', async (_libelle, corps) => {
    vi.stubGlobal('fetch', reponse(corps, 201));

    await expect(ajouterNote(ID_LIVRE, { contenu: 'Une observation.' })).rejects.toMatchObject({
      type: 'validation',
      message: 'La réponse du serveur pour la note ajoutée est invalide.',
    });
  });

  it('traduit un refus 422 en erreur de validation portant le champ concerné', async () => {
    vi.stubGlobal(
      'fetch',
      reponse(
        {
          erreur: 'validation',
          champs: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
        },
        422,
      ),
    );

    await expect(ajouterNote(ID_LIVRE, { contenu: 'Une observation.' })).rejects.toMatchObject({
      type: 'validation',
      champs: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
    });
  });

  it('traduit un 503 en erreur réseau réessayable', async () => {
    vi.stubGlobal(
      'fetch',
      reponse({ erreur: 'indisponible', message: 'Service indisponible.' }, 503),
    );

    await expect(ajouterNote(ID_LIVRE, { contenu: 'Une observation.' })).rejects.toMatchObject({
      type: 'reseau',
      cause: 'indisponible',
      statut: 503,
      reessayable: true,
    });
  });

  it('traduit un 404 en absence de l’ouvrage', async () => {
    vi.stubGlobal('fetch', reponse({ erreur: 'introuvable', message: 'Livre inconnu.' }, 404));

    await expect(ajouterNote(ID_LIVRE, { contenu: 'Une observation.' })).rejects.toMatchObject({
      type: 'introuvable',
      message: 'Livre inconnu.',
    });
  });
});
