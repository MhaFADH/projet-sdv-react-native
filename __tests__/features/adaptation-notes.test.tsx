import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';
import { appliquerLangue } from '../../services/i18n';
import {
  creerEnveloppeNotesAvecPreferences,
  creerTransport,
  differer,
  json,
  noteCreee,
  noteExistante,
} from './outils-notes';

const TEXTE_CLAIR = 'rgb(31, 41, 51)';
const TEXTE_SOMBRE = 'rgb(244, 240, 234)';
const FOND_ERREUR_CLAIR = 'rgb(251, 233, 231)';
const FOND_ERREUR_SOMBRE = 'rgb(62, 33, 29)';
const SURFACE_SOMBRE = 'rgb(34, 29, 24)';

const rendreParcours = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <>
      <PreferencesScreen revenir={vi.fn()} />
      <FicheScreen corriger={vi.fn()} id={noteExistante.livreId} retour={vi.fn()} />
    </>,
    { wrapper: creerEnveloppeNotesAvecPreferences(client) },
  );
  return client;
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

describe('adaptation des notes aux préférences', () => {
  it('reformate les dates et nombres sans perdre la saisie ni traduire le contenu', async () => {
    creerTransport();
    const client = rendreParcours();

    const champ = await screen.findByRole('textbox', { name: 'Note de lecture' });
    await screen.findByText(noteExistante.contenu);
    expect(screen.getByText('1 janvier 2025 à 09:15')).toBeVisible();
    expect(screen.getByRole('status', { name: /utilisés/ })).toHaveTextContent(
      '0 / 1 000 caractères',
    );
    fireEvent.change(champ, { target: { value: 'Texte à préserver.' } });

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(await screen.findByRole('textbox', { name: 'Reading note' })).toHaveValue(
      'Texte à préserver.',
    );
    expect(screen.getByText('January 1, 2025 at 09:15 AM')).toBeVisible();
    expect(screen.getByText('18 / 1,000 characters')).toBeVisible();
    expect(screen.getByText(noteExistante.contenu)).toHaveStyle({ color: TEXTE_SOMBRE });
    expect(screen.getByText(noteExistante.contenu)).not.toHaveStyle({ color: TEXTE_CLAIR });
    client.clear();
  });

  it('traduit une indisponibilité en cours sans réinitialiser sa temporisation', async () => {
    vi.useFakeTimers({ now: 0 });
    const { compteurs } = creerTransport({
      post: () => Promise.resolve(json({ erreur: 'chaos', message: 'Service indisponible.' }, 503)),
    });
    const client = rendreParcours();
    await act(async () => void (await vi.advanceTimersByTimeAsync(0)));

    fireEvent.change(screen.getByRole('textbox', { name: 'Note de lecture' }), {
      target: { value: 'Saisie en attente.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }));
    await act(async () => void (await vi.advanceTimersByTimeAsync(0)));
    await act(async () => void (await vi.advanceTimersByTimeAsync(1_000)));
    expect(screen.getByRole('button', { name: 'Réessayer dans 2 s' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveStyle({ backgroundColor: FOND_ERREUR_CLAIR });

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The service is temporarily unavailable. Your entry is preserved.',
    );
    expect(screen.getByRole('button', { name: 'Retry in 2 s' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveStyle({ backgroundColor: FOND_ERREUR_SOMBRE });
    expect(screen.getByRole('textbox', { name: 'Reading note' })).toHaveValue('Saisie en attente.');
    await act(async () => void (await vi.advanceTimersByTimeAsync(2_000)));
    expect(compteurs.post).toBe(1);
    expect(screen.getByRole('button', { name: 'Retry saving' })).toBeEnabled();
    client.clear();
  });

  it('retraduit une validation déjà affichée au changement de langue', async () => {
    creerTransport();
    const client = rendreParcours();
    await screen.findByRole('textbox', { name: 'Note de lecture' });

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }));
    expect(await screen.findByText('Le contenu de la note est obligatoire.')).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));

    expect(await screen.findByText('The note content is required.')).toBeVisible();
    expect(screen.queryByText('Le contenu de la note est obligatoire.')).not.toBeInTheDocument();
    client.clear();
  });

  it('présente un refus serveur par champ dans la langue active', async () => {
    creerTransport({
      post: () =>
        Promise.resolve(
          json(
            {
              erreur: 'validation',
              champs: { contenu: 'contenu obligatoire, 1000 caracteres maximum' },
            },
            422,
          ),
        ),
    });
    const client = rendreParcours();
    const champ = await screen.findByRole('textbox', { name: 'Note de lecture' });

    fireEvent.change(champ, { target: { value: 'Texte refusé.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }));

    expect(await screen.findByText('Le contenu de la note est invalide.')).toBeVisible();
    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    expect(await screen.findByText('The note content is invalid.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Reading note' })).toHaveValue('Texte refusé.');

    fireEvent.change(screen.getByRole('textbox', { name: 'Reading note' }), {
      target: { value: 'Texte corrigé.' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'French' }));

    expect(screen.queryByText('Le contenu de la note est invalide.')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Note de lecture' })).toHaveValue('Texte corrigé.');
    client.clear();
  });

  it('retraduit un échec de consultation sans masquer le formulaire', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree) =>
      Promise.resolve(
        String(entree).endsWith('/notes')
          ? json({ erreur: 'chaos', message: 'Notes indisponibles.' }, 503)
          : json({
              id: noteExistante.livreId,
              titre: 'Bel-Ami',
              auteur: 'Guy de Maupassant',
              editeur: 'Victor Havard',
              annee: 1885,
              lu: false,
              favori: false,
              note: null,
              couverture: null,
              createdAt: '2025-01-01T10:00:00.000Z',
              updatedAt: '2025-01-02T10:00:00.000Z',
              version: 3,
            }),
      ),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreParcours();

    expect(await screen.findByRole('alert', undefined, { timeout: 4_000 })).toHaveTextContent(
      'Le service est temporairement indisponible.',
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));

    expect(screen.getByRole('alert')).toHaveTextContent('The service is temporarily unavailable.');
    expect(screen.getByRole('textbox', { name: 'Reading note' })).toBeVisible();
    client.clear();
  });

  it('retraduit un résultat incertain et sa confirmation d’abandon sans perdre le texte', async () => {
    creerTransport({ post: () => Promise.reject(new TypeError('Failed to fetch')) });
    const client = rendreParcours();
    const champ = await screen.findByRole('textbox', { name: 'Note de lecture' });

    fireEvent.change(champ, { target: { value: 'Brouillon non traduit.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }));
    expect(await screen.findByText(/la note a peut-être été enregistrée/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));
    expect(screen.getByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByText(/the note may have been saved/)).toBeVisible();
    expect(screen.getByText(/Sending again may create a second note/)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Discard this entry?' }).parentElement).toHaveStyle({
      backgroundColor: SURFACE_SOMBRE,
    });
    expect(screen.getByRole('textbox', { name: 'Reading note' })).toHaveValue(
      'Brouillon non traduit.',
    );
    client.clear();
  });

  it('laisse une mutation partie finir une seule fois après changement de préférences', async () => {
    const reponse = differer();
    const { compteurs } = creerTransport({ post: () => reponse.promesse });
    const client = rendreParcours();
    const champ = await screen.findByRole('textbox', { name: 'Note de lecture' });

    fireEvent.change(champ, { target: { value: 'Observation envoyée.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter la note' }));
    expect(await screen.findByRole('button', { name: 'Envoi de la note…' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByRole('textbox', { name: 'Reading note' })).toHaveValue(
      'Observation envoyée.',
    );
    expect(screen.getByRole('button', { name: 'Sending the note…' })).toBeDisabled();
    await act(async () => reponse.terminer(json(noteCreee('Observation envoyée.'), 201)));

    expect(await screen.findByText('The note was added to this record.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Reading note' })).toHaveValue('');
    expect(compteurs.post).toBe(1);
    client.clear();
  });
});
