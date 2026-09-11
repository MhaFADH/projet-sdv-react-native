import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';
import { appliquerLangue } from '../../services/i18n';
import {
  creerEnveloppeNotesAvecPreferences,
  creerTransport,
  ID_AUTRE_LIVRE,
  ID_LIVRE,
  json,
  noteExistante,
  secondeNote,
} from './outils-notes';

const SURFACE_CLAIRE = 'rgb(255, 255, 255)';
const SURFACE_SOMBRE = 'rgb(34, 29, 24)';

const avancer = (duree: number) => act(async () => void (await vi.advanceTimersByTimeAsync(duree)));

const attendreMicrotaches = async () => {
  for (let index = 0; index < 10; index += 1) await Promise.resolve();
};

const rendreParcours = (idInitial: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const contenu = (id: string) => (
    <>
      <PreferencesScreen revenir={vi.fn()} />
      <FicheScreen corriger={vi.fn()} id={id} retour={vi.fn()} />
    </>
  );
  const vue = render(contenu(idInitial), {
    wrapper: creerEnveloppeNotesAvecPreferences(client),
  });
  return { client, naviguer: (id: string) => vue.rerender(contenu(id)) };
};

beforeEach(() => {
  window.localStorage.clear();
  appliquerLangue('fr');
});

afterEach(() => {
  vi.useRealTimers();
  appliquerLangue('fr');
  vi.unstubAllGlobals();
});

describe('adaptation des actions destructives', () => {
  it('garde la note immédiate indépendante du délai bilingue des ouvrages', async () => {
    vi.useFakeTimers({ now: 0 });
    const { compteurs } = creerTransport({ notes: [secondeNote, noteExistante] });
    const { client, naviguer } = rendreParcours(ID_AUTRE_LIVRE);
    await avancer(0);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Germinal' }));
    expect(screen.getByRole('dialog', { name: 'Confirmation de suppression' })).toHaveStyle({
      backgroundColor: SURFACE_CLAIRE,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    await avancer(1_000);
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 4 s');
    naviguer(ID_LIVRE);
    await act(attendreMicrotaches);
    await avancer(1);
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('alert')).toHaveTextContent('1 book to delete in 4 s');
    fireEvent.click(
      screen.getByRole('button', { name: /Delete the note from.*Observation ancienne/ }),
    );
    const confirmationNote = screen.getByRole('dialog', { name: 'Note deletion confirmation' });
    expect(confirmationNote).toHaveTextContent(
      'immediately after confirmation, with no delay and no undo',
    );
    expect(confirmationNote).toHaveStyle({ backgroundColor: SURFACE_SOMBRE });
    fireEvent.click(screen.getByRole('button', { name: 'Delete the note' }));
    await avancer(0);

    expect(compteurs.suppressionsNotes).toBe(1);
    expect(compteurs.suppressionsOuvrages).toBe(0);
    expect(screen.queryByText(noteExistante.contenu)).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('1 book to delete in 4 s');
    fireEvent.click(screen.getByRole('button', { name: 'Undo every deletion' }));
    await avancer(5_000);
    expect(compteurs.suppressionsOuvrages).toBe(0);
    client.clear();
  });

  it('retraduit l’échec temporisé d’une suppression de note', async () => {
    vi.useFakeTimers({ now: 0 });
    const { compteurs } = creerTransport({
      suppressionNote: () =>
        Promise.resolve(json({ erreur: 'chaos', message: 'Service indisponible.' }, 503)),
    });
    const { client } = rendreParcours(ID_LIVRE);
    await avancer(1);

    fireEvent.click(
      screen.getByRole('button', { name: /Supprimer la note du.*Observation ancienne/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note' }));
    await avancer(1_000);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Le service est temporairement indisponible.',
    );
    expect(screen.getByRole('button', { name: 'Réessayer dans 2 s' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('alert')).toHaveTextContent('The service is temporarily unavailable.');
    expect(screen.getByRole('button', { name: 'Retry in 2 s' })).toBeDisabled();
    await avancer(2_000);
    expect(compteurs.suppressionsNotes).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Retry the deletion' }));
    await avancer(0);
    expect(compteurs.suppressionsNotes).toBe(2);
    client.clear();
  });

  it('retraduit le résultat incertain d’une suppression sans retirer la note', async () => {
    vi.useFakeTimers({ now: 0 });
    const { compteurs } = creerTransport({
      suppressionNote: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    const { client } = rendreParcours(ID_LIVRE);
    await avancer(1);

    fireEvent.click(
      screen.getByRole('button', { name: /Supprimer la note du.*Observation ancienne/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note' }));
    await avancer(0);
    expect(screen.getByRole('alert')).toHaveTextContent('la note a peut-être été supprimée');

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('alert')).toHaveTextContent('the note may have been deleted');
    expect(screen.getByRole('button', { name: 'Refresh the notes' })).toBeVisible();
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();
    expect(compteurs.suppressionsNotes).toBe(1);
    client.clear();
  });

  it('conserve les résultats partiels et ne réessaie que les ouvrages en échec', async () => {
    vi.useFakeTimers({ now: 0 });
    let premierEchecGerminal = true;
    const { compteurs } = creerTransport({
      suppressionOuvrage: (id) => {
        if (id !== ID_AUTRE_LIVRE || !premierEchecGerminal) {
          return Promise.resolve(new Response(null, { status: 204 }));
        }
        premierEchecGerminal = false;
        return Promise.resolve(json({ erreur: 'chaos', message: 'Indisponible.' }, 503));
      },
    });
    const { client, naviguer } = rendreParcours(ID_LIVRE);
    await avancer(1);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Bel-Ami' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    naviguer(ID_AUTRE_LIVRE);
    await act(attendreMicrotaches);
    await avancer(1);
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Germinal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await avancer(5_000);

    expect(screen.getByRole('alert')).toHaveTextContent('Some deletions failed');
    expect(screen.getByRole('alert')).toHaveTextContent('Germinal');
    expect(screen.getByRole('alert')).not.toHaveTextContent('Bel-Ami');
    fireEvent.click(screen.getByRole('button', { name: 'Retry deleting 1 book' }));
    const dialogue = screen.getByRole('dialog', { name: 'Deletion confirmation' });
    expect(dialogue).toHaveTextContent('Germinal');
    expect(dialogue).not.toHaveTextContent('Bel-Ami');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm the deletion' }));
    await avancer(5_000);

    expect(compteurs.suppressionsOuvrages).toBe(3);
    expect(screen.queryByText('Some deletions failed')).not.toBeInTheDocument();
    client.clear();
  });
});
