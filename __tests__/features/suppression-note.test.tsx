import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  boutonSupprimerNote,
  creerTransport,
  differer,
  ID_LIVRE,
  libelleDateNote,
  noteExistante,
  rendreFiche,
  secondeNote,
} from './outils-notes';

const attendreNotes = async () =>
  expect(await screen.findByText(noteExistante.contenu)).toBeVisible();

const confirmer = () => fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note' }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('suppression d’une note de lecture', () => {
  it('identifie la note, avertit de l’absence d’annulation et n’envoie rien si l’on renonce', async () => {
    const { compteurs } = creerTransport();
    const { client } = rendreFiche();
    await attendreNotes();

    const action = boutonSupprimerNote(noteExistante);
    expect(action).toHaveStyle({ minHeight: '44px' });
    fireEvent.click(action);

    const dialogue = screen.getByRole('dialog', { name: 'Confirmation de suppression de note' });
    expect(
      within(dialogue).getByRole('heading', { name: 'Confirmer la suppression de la note' }),
    ).toBeVisible();
    expect(dialogue).toHaveTextContent(`Note du ${libelleDateNote(noteExistante)}`);
    expect(dialogue).toHaveTextContent(noteExistante.contenu);
    expect(dialogue).toHaveTextContent(
      'Cette note part immédiatement après confirmation, sans délai ni annulation. Aucune restauration n’est possible ensuite.',
    );

    fireEvent.click(within(dialogue).getByRole('button', { name: 'Renoncer à la suppression' }));

    expect(
      screen.queryByRole('dialog', { name: 'Confirmation de suppression de note' }),
    ).not.toBeInTheDocument();
    expect(compteurs.suppressionsNotes).toBe(0);
    expect(screen.getByText(noteExistante.contenu)).toBeVisible();
    client.clear();
  });

  it('envoie le DELETE dès la confirmation, sans délai d’annulation', async () => {
    const { fetchMock, compteurs } = creerTransport({ notes: [secondeNote, noteExistante] });
    const { client } = rendreFiche();
    await attendreNotes();

    fireEvent.click(boutonSupprimerNote(noteExistante));
    confirmer();
    await act(async () => {});

    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID_LIVRE}/notes/${noteExistante.id}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(compteurs.suppressionsNotes).toBe(1);
    expect(screen.queryByRole('button', { name: /Annuler/ })).not.toBeInTheDocument();
    expect(screen.queryByText(noteExistante.contenu)).not.toBeInTheDocument();
    expect(screen.getByText(secondeNote.contenu)).toBeVisible();
    expect(compteurs.suppressionsOuvrages).toBe(0);
    client.clear();
  });

  it('affiche l’état vide contextualisé quand la dernière note disparaît', async () => {
    creerTransport();
    const { client } = rendreFiche();
    await attendreNotes();

    fireEvent.click(boutonSupprimerNote(noteExistante));
    confirmer();

    expect(await screen.findByText('Aucune note de lecture pour Bel-Ami.')).toBeVisible();
    expect(
      screen.queryByRole('list', { name: 'Notes de lecture de Bel-Ami' }),
    ).not.toBeInTheDocument();
    client.clear();
  });

  it('montre l’envoi en cours et empêche une seconde suppression de la même note', async () => {
    const differee = differer();
    const { compteurs } = creerTransport({ suppressionNote: () => differee.promesse });
    const { client } = rendreFiche();
    await attendreNotes();

    fireEvent.click(boutonSupprimerNote(noteExistante));
    confirmer();

    await act(async () => {});
    const enCours = boutonSupprimerNote(noteExistante);
    expect(enCours).toBeDisabled();
    expect(enCours).toHaveTextContent('Suppression en cours');
    fireEvent.click(enCours);
    fireEvent.click(enCours);
    expect(compteurs.suppressionsNotes).toBe(1);

    await act(async () => differee.terminer(new Response(null, { status: 204 })));
    expect(await screen.findByText('Aucune note de lecture pour Bel-Ami.')).toBeVisible();
    expect(compteurs.suppressionsNotes).toBe(1);
    client.clear();
  });

  it('expose des commandes focalisables et des cibles de 44 points', async () => {
    creerTransport();
    const { client } = rendreFiche();
    await attendreNotes();

    const action = boutonSupprimerNote(noteExistante);
    expect(action.tagName).toBe('BUTTON');
    expect(action).toHaveAttribute('tabindex', '0');
    action.focus();
    expect(action).toHaveFocus();
    fireEvent.click(action);

    const dialogue = screen.getByRole('dialog', { name: 'Confirmation de suppression de note' });
    for (const nom of ['Renoncer à la suppression', 'Supprimer la note']) {
      const commande = within(dialogue).getByRole('button', { name: nom });
      expect(commande.tagName).toBe('BUTTON');
      expect(commande).toHaveAttribute('tabindex', '0');
      expect(commande).toHaveStyle({ minHeight: '44px' });
    }
    client.clear();
  });
});
