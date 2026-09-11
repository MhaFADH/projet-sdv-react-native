import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import {
  boutonSupprimerNote,
  creerTransport,
  ID_AUTRE_LIVRE,
  ID_LIVRE,
  json,
  noteExistante,
  rendreFiche,
  secondeNote,
} from './outils-notes';

const DELAI_TEMPORISATION_MS = 3_000;

const avancer = (duree: number) => act(async () => void (await vi.advanceTimersByTimeAsync(duree)));

const confirmer = () => fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note' }));

const supprimerPremiereNote = () => {
  fireEvent.click(boutonSupprimerNote(noteExistante));
  confirmer();
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('échecs d’une suppression de note', () => {
  it('temporise après un 503, sans rejeu automatique, puis permet de réessayer', async () => {
    let appels = 0;
    const { compteurs } = creerTransport({
      suppressionNote: () => {
        appels += 1;
        if (appels === 1) {
          return Promise.resolve(json({ erreur: 'chaos', message: 'Service indisponible.' }, 503));
        }
        return Promise.resolve(new Response(null, { status: 204 }));
      },
    });
    const { client } = rendreFiche();
    expect(await screen.findByText(noteExistante.contenu)).toBeVisible();

    vi.useFakeTimers();
    supprimerPremiereNote();
    await avancer(0);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Le service est temporairement indisponible.',
    );
    expect(screen.getByRole('button', { name: 'Réessayer dans 3 s' })).toBeDisabled();
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();

    await avancer(DELAI_TEMPORISATION_MS);

    const reprise = screen.getByRole('button', { name: 'Réessayer la suppression' });
    expect(reprise).toBeEnabled();
    expect(compteurs.suppressionsNotes).toBe(1);
    fireEvent.click(reprise);
    await avancer(0);

    expect(screen.getByText('Aucune note de lecture pour Bel-Ami.')).toBeVisible();
    expect(compteurs.suppressionsNotes).toBe(2);
    client.clear();
  });

  it('présente un refus concluant avec une reprise immédiate', async () => {
    creerTransport({
      suppressionNote: () =>
        Promise.resolve(json({ erreur: 'interdit', message: 'Droits insuffisants.' }, 403)),
    });
    const { client } = rendreFiche();
    expect(await screen.findByText(noteExistante.contenu)).toBeVisible();

    supprimerPremiereNote();

    expect(await screen.findByRole('alert')).toHaveTextContent('Authentification requise.');
    const reprise = screen.getByRole('button', { name: 'Réessayer la suppression' });
    expect(reprise).toBeEnabled();
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Actualiser les notes' })).not.toBeInTheDocument();
    client.clear();
  });

  it('présente une réponse perdue comme incertaine, sans affirmer que rien n’a été supprimé', async () => {
    const { compteurs } = creerTransport({
      suppressionNote: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    const { client } = rendreFiche();
    expect(await screen.findByText(noteExistante.contenu)).toBeVisible();

    supprimerPremiereNote();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Aucune réponse du serveur : la note a peut-être été supprimée. Actualisez les notes pour vérifier avant de réessayer.',
    );
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();
    const lecturesAvant = compteurs.lecturesNotes;

    fireEvent.click(screen.getByRole('button', { name: 'Actualiser les notes' }));
    await act(async () => {});

    expect(compteurs.lecturesNotes).toBe(lecturesAvant + 1);
    expect(compteurs.suppressionsNotes).toBe(1);
    expect(screen.getByRole('button', { name: 'Réessayer la suppression' })).toBeEnabled();
    client.clear();
  });

  it('traite une note déjà absente comme une issue, pas comme un blocage', async () => {
    const { compteurs } = creerTransport({
      suppressionNote: () =>
        Promise.resolve(json({ erreur: 'introuvable', message: 'Note inconnue.' }, 404)),
    });
    const { client } = rendreFiche();
    expect(await screen.findByText(noteExistante.contenu)).toBeVisible();
    const lecturesAvant = compteurs.lecturesNotes;

    supprimerPremiereNote();

    expect(
      await screen.findByText(
        'Cette note n’est plus sur le serveur : elle avait peut-être déjà été supprimée.',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(compteurs.lecturesNotes).toBeGreaterThan(lecturesAvant);
    client.clear();
  });
});

describe('indépendance des notes pendant un échec', () => {
  it('ne laisse pas la suppression d’une note annuler la temporisation d’une autre', async () => {
    const { compteurs } = creerTransport({
      notes: [secondeNote, noteExistante],
      suppressionNote: (noteId) =>
        Promise.resolve(
          noteId === noteExistante.id
            ? json({ erreur: 'chaos', message: 'Service indisponible.' }, 503)
            : new Response(null, { status: 204 }),
        ),
    });
    const { client } = rendreFiche();
    expect(await screen.findByText(noteExistante.contenu)).toBeVisible();

    vi.useFakeTimers();
    supprimerPremiereNote();
    await avancer(0);
    expect(screen.getByRole('button', { name: 'Réessayer dans 3 s' })).toBeDisabled();

    fireEvent.click(boutonSupprimerNote(secondeNote));
    confirmer();
    await avancer(0);

    expect(screen.queryByText(secondeNote.contenu)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réessayer dans \d s/ })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Réessayer la suppression' }),
    ).not.toBeInTheDocument();
    expect(compteurs.suppressionsNotes).toBe(2);
    client.clear();
  });
});

describe('coexistence avec les suppressions d’ouvrages', () => {
  it('laisse le groupe d’ouvrages intact quand une note d’un autre ouvrage est supprimée', async () => {
    vi.useFakeTimers({ now: 0 });
    const { compteurs } = creerTransport({ notes: [secondeNote, noteExistante] });
    const { client, rerender } = rendreFiche(ID_AUTRE_LIVRE);
    await avancer(0);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Germinal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 5 s');

    rerender(<FicheScreen corriger={vi.fn()} id={ID_LIVRE} retour={vi.fn()} />);
    await avancer(1_000);
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 4 s');

    supprimerPremiereNote();
    await avancer(0);

    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 4 s');
    expect(screen.getByRole('button', { name: 'Annuler toutes les suppressions' })).toBeVisible();
    expect(compteurs.suppressionsNotes).toBe(1);
    expect(compteurs.suppressionsOuvrages).toBe(0);
    expect(screen.queryByText(noteExistante.contenu)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Annuler toutes les suppressions' }));
    await avancer(0);

    expect(screen.queryByText(noteExistante.contenu)).not.toBeInTheDocument();
    expect(screen.getByText(secondeNote.contenu)).toBeVisible();
    expect(compteurs.suppressionsOuvrages).toBe(0);
    client.clear();
  });
});
