import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PageOuvrages } from '../../domain/ouvrage';
import { FicheScreen } from '../../features/books/fiche-screen';
import { SuppressionsProvider } from '../../features/books/suppressions-provider';
import { clesOuvrages } from '../../hooks/cles-ouvrages';

const ID_BEL_AMI = '33575fa9-7968-45b3-8447-ec994a0b8401';
const ID_GERMINAL = '33575fa9-7968-45b3-8447-ec994a0b8402';
const ID_ASSOMMOIR = '33575fa9-7968-45b3-8447-ec994a0b8403';
const titres = new Map([
  [ID_BEL_AMI, 'Bel-Ami'],
  [ID_GERMINAL, 'Germinal'],
  [ID_ASSOMMOIR, 'L’Assommoir'],
]);

const creerOuvrage = (id: string) => ({
  id,
  titre: titres.get(id) ?? 'Ouvrage',
  auteur: 'Auteur',
  editeur: 'Éditeur',
  annee: 1885,
  lu: false,
  favori: false,
  note: null,
  couverture: null,
  createdAt: '2025-01-01T10:00:00.000Z',
  updatedAt: '2025-01-02T10:00:00.000Z',
  version: 1,
});

const rendreFiche = (id: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <SuppressionsProvider>{children}</SuppressionsProvider>
    </QueryClientProvider>
  );
  const vue = render(<FicheScreen id={id} retour={vi.fn()} corriger={vi.fn()} />, { wrapper });
  return {
    client,
    naviguer: (nouvelId: string) =>
      vue.rerender(<FicheScreen id={nouvelId} retour={vi.fn()} corriger={vi.fn()} />),
  };
};

const attendreMicrotaches = async () => {
  for (let index = 0; index < 10; index += 1) await Promise.resolve();
};

const confirmerSuppression = (titre: string) => {
  fireEvent.click(screen.getByRole('button', { name: `Supprimer ${titre}` }));
  expect(screen.getByRole('dialog', { name: 'Confirmation de suppression' })).toHaveTextContent(
    titre,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('parcours de suppression différée', () => {
  it('ne masque ni n’envoie lorsque la confirmation est abandonnée', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation((entree) =>
        Promise.resolve(
          new Response(
            JSON.stringify(String(entree).endsWith('/notes') ? [] : creerOuvrage(ID_BEL_AMI)),
            { status: 200 },
          ),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    const { client } = rendreFiche(ID_BEL_AMI);

    await screen.findByRole('heading', { name: 'Bel-Ami' });
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Bel-Ami' }));
    fireEvent.click(screen.getByRole('button', { name: 'Renoncer à la suppression' }));

    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    client.clear();
  });

  it('conserve le groupe en navigation, repousse l’échéance et annule tous les DELETE', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree) => {
      const url = String(entree);
      const id = url.split('/').at(-1) ?? '';
      const corps = url.endsWith('/notes') ? [] : creerOuvrage(id);
      return Promise.resolve(new Response(JSON.stringify(corps), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client, naviguer } = rendreFiche(ID_BEL_AMI);
    await screen.findByRole('heading', { name: 'Bel-Ami' });
    naviguer(ID_GERMINAL);
    await screen.findByRole('heading', { name: 'Germinal' });
    naviguer(ID_BEL_AMI);
    expect(screen.getByRole('heading', { name: 'Bel-Ami' })).toBeVisible();
    vi.useFakeTimers({ now: 0 });

    confirmerSuppression('Bel-Ami');
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 5 s');
    naviguer(ID_GERMINAL);
    expect(screen.getByRole('heading', { name: 'Germinal' })).toBeVisible();
    await act(async () => void (await vi.advanceTimersByTimeAsync(1_000)));
    confirmerSuppression('Germinal');

    expect(screen.getByRole('alert')).toHaveTextContent('2 ouvrages à supprimer dans 5 s');
    await act(async () => void (await vi.advanceTimersByTimeAsync(4_000)));
    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === 'DELETE')).toHaveLength(
      0,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('dans 1 s');
    fireEvent.click(screen.getByRole('button', { name: 'Annuler toutes les suppressions' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(2_000)));

    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === 'DELETE')).toHaveLength(
      0,
    );
    expect(screen.getByRole('heading', { name: 'Germinal' })).toBeVisible();
    client.clear();
  });

  it('bloque les nouvelles suppressions, garde l’échec partiel et ne réessaie que celui-ci', async () => {
    const resolutionsDelete: Array<(reponse: Response) => void> = [];
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((entree, options) => {
      const url = String(entree);
      const id = url.split('/').at(-1) ?? '';
      if (options?.method === 'DELETE') {
        return new Promise<Response>((resolve) => resolutionsDelete.push(resolve));
      }
      const corps = url.endsWith('/notes') ? [] : creerOuvrage(id);
      return Promise.resolve(new Response(JSON.stringify(corps), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { client, naviguer } = rendreFiche(ID_BEL_AMI);
    client.setQueryData<PageOuvrages>(clesOuvrages.liste(1), {
      items: [creerOuvrage(ID_BEL_AMI), creerOuvrage(ID_GERMINAL), creerOuvrage(ID_ASSOMMOIR)],
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    });
    await screen.findByRole('heading', { name: 'Bel-Ami' });
    naviguer(ID_GERMINAL);
    await screen.findByRole('heading', { name: 'Germinal' });
    naviguer(ID_ASSOMMOIR);
    await screen.findByRole('heading', { name: 'L’Assommoir' });
    naviguer(ID_BEL_AMI);
    vi.useFakeTimers({ now: 0 });
    confirmerSuppression('Bel-Ami');
    naviguer(ID_GERMINAL);
    confirmerSuppression('Germinal');
    naviguer(ID_ASSOMMOIR);

    await act(async () => void (await vi.advanceTimersByTimeAsync(5_000)));
    expect(resolutionsDelete).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Supprimer L’Assommoir' })).toBeDisabled();
    await act(async () => {
      resolutionsDelete[0](new Response(null, { status: 204 }));
      resolutionsDelete[1](
        new Response(JSON.stringify({ erreur: 'chaos', message: 'Indisponible.' }), {
          status: 503,
        }),
      );
      await attendreMicrotaches();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Germinal');
    expect(client.getQueryData<PageOuvrages>(clesOuvrages.liste(1))).toMatchObject({
      items: [{ id: ID_GERMINAL }, { id: ID_ASSOMMOIR }],
      total: 2,
      totalPages: 1,
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Réessayer la suppression de 1 ouvrage',
      }),
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('Germinal');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(4_999)));
    expect(resolutionsDelete).toHaveLength(2);
    await act(async () => void (await vi.advanceTimersByTimeAsync(1)));
    expect(resolutionsDelete).toHaveLength(3);
    resolutionsDelete[2](new Response(null, { status: 204 }));
    await act(attendreMicrotaches);

    const urlsDelete = fetchMock.mock.calls
      .filter(([, options]) => options?.method === 'DELETE')
      .map(([entree]) => String(entree));
    expect(urlsDelete.filter((url) => url.endsWith(ID_BEL_AMI))).toHaveLength(1);
    expect(urlsDelete.filter((url) => url.endsWith(ID_GERMINAL))).toHaveLength(2);
    expect(screen.queryByText('Certaines suppressions ont échoué')).not.toBeInTheDocument();
    client.clear();
  });
});
