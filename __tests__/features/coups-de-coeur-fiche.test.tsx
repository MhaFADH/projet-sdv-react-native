import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import {
  appelsPatch,
  attendrePatch,
  belAmi,
  estNotes,
  estPatch,
  reponseNotesVides,
  reponseRefus,
  type Transport,
} from '../outils-bascules';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const confirme = { ...belAmi, favori: true, version: 4 };

const rendreFiche = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<FicheScreen corriger={vi.fn()} id={belAmi.id} retour={vi.fn()} />, {
    wrapper: creerEnveloppeOuvrages(client),
  });
  return client;
};

const creerTransport = (
  gererPatch: () => Promise<Response>,
  gererLecture: (lectures: number) => Response,
): Transport => {
  let lectures = 0;
  return vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
    if (estNotes(entree)) return Promise.resolve(reponseNotesVides());
    if (estPatch(initialisation)) return gererPatch();
    lectures += 1;
    return Promise.resolve(gererLecture(lectures));
  });
};

const coeur = (libelle: string) => screen.getByRole('switch', { name: libelle });

afterEach(() => vi.unstubAllGlobals());

describe('coups de cœur depuis la fiche', () => {
  it('applique l’intention, envoie un PATCH partiel et conserve la version confirmée', async () => {
    let confirmer: ((reponse: Response) => void) | undefined;
    const transport = creerTransport(
      () =>
        new Promise<Response>((resoudre) => {
          confirmer = resoudre;
        }),
      (lectures) =>
        new Response(JSON.stringify(lectures === 1 ? belAmi : confirme), { status: 200 }),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    expect(await screen.findByText('Pas un coup de cœur')).toBeVisible();
    fireEvent.click(coeur('Marquer comme coup de cœur'));

    expect(screen.getByText('Coup de cœur')).toBeVisible();
    expect(coeur('Retirer le coup de cœur')).toHaveAttribute('aria-disabled', 'true');

    await attendrePatch(transport);
    expect(appelsPatch(transport)[0]?.[1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ favori: true }),
    });

    await act(async () => confirmer?.(new Response(JSON.stringify(confirme), { status: 200 })));

    await waitFor(() =>
      expect(coeur('Retirer le coup de cœur')).not.toHaveAttribute('aria-disabled'),
    );
    expect(client.getQueryData(['ouvrages', 'fiche', belAmi.id])).toMatchObject({
      favori: true,
      version: 4,
    });
    client.clear();
  });

  it('verrouille aussi la bascule de lecture du même ouvrage pendant l’envoi', async () => {
    const transport = creerTransport(
      () => new Promise<Response>(() => {}),
      () => new Response(JSON.stringify(belAmi), { status: 200 }),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme coup de cœur' }));

    expect(coeur('Retirer le coup de cœur')).toHaveAttribute('aria-disabled', 'true');
    expect(coeur('Marquer comme lu')).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(coeur('Marquer comme lu'));

    await attendrePatch(transport);
    expect(appelsPatch(transport)[0]?.[1]).toMatchObject({
      body: JSON.stringify({ favori: true }),
    });
    client.clear();
  });

  it('restaure le cœur après un refus et le réessaie depuis la fiche', async () => {
    const transport = creerTransport(
      () => Promise.resolve(reponseRefus()),
      () => new Response(JSON.stringify(belAmi), { status: 200 }),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme coup de cœur' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le coup de cœur précédent a été restauré. Certaines données sont invalides.',
    );
    expect(screen.getByText('Pas un coup de cœur')).toBeVisible();
    expect(coeur('Marquer comme coup de cœur')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(
      screen.getByRole('button', { name: 'Réessayer la modification du coup de cœur' }),
    );

    await attendrePatch(transport, 2);
    client.clear();
  });

  it('distingue l’échec de la relecture d’un refus du PATCH confirmé', async () => {
    const transport = creerTransport(
      () => Promise.resolve(new Response(JSON.stringify(confirme), { status: 200 })),
      (lectures) =>
        lectures === 1
          ? new Response(JSON.stringify(belAmi), { status: 200 })
          : new Response(JSON.stringify({ erreur: 'lecture', message: 'Lecture impossible.' }), {
              status: 400,
            }),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme coup de cœur' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le coup de cœur a été enregistré, mais la fiche n’a pas pu être actualisée. La requête a échoué.',
    );
    expect(screen.getByText('Coup de cœur')).toBeVisible();
    expect(coeur('Retirer le coup de cœur')).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText(/a été restauré/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Réessayer l’actualisation de la fiche' }),
    ).toBeVisible();
    client.clear();
  });
});
