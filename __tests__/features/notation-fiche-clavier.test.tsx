import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ID, ouvrage, rendreFiche, reponseJson } from './outils-notation';

afterEach(() => vi.unstubAllGlobals());

describe('navigation clavier de la notation', () => {
  it.each([
    ['ArrowRight', 3, 'Attribuer 3 étoiles'],
    ['Home', 0, 'Attribuer zéro étoile'],
    ['End', 5, 'Attribuer 5 étoiles'],
  ] as const)('remplace la note existante avec %s', async (touche, note, libelle) => {
    const initial = { ...ouvrage, note: 2 };
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, options) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (options?.method === 'PATCH') return new Promise<Response>(() => undefined);
      return Promise.resolve(reponseJson(initial));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();
    const selection = await screen.findByRole('radio', { name: 'Attribuer 2 étoiles' });

    selection.focus();
    fireEvent.keyDown(selection, { key: touche });

    expect(screen.getByText(`${note} sur 5`)).toBeVisible();
    expect(screen.getByRole('radio', { name: libelle })).toHaveFocus();
    await waitFor(() =>
      expect(transport).toHaveBeenCalledWith(
        `http://localhost:3000/books/${ID}`,
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ note }) }),
      ),
    );
    client.clear();
  });
});
