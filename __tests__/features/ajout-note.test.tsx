import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LONGUEUR_MAXIMALE_NOTE } from '../../domain/note-lecture';
import {
  boutonAjouter,
  champNote,
  creerTransport,
  differer,
  ID_LIVRE,
  json,
  noteCreee,
  rendreFiche,
  saisirNote,
} from './outils-notes';

const attendreFiche = async () =>
  expect(await screen.findByRole('heading', { name: 'Bel-Ami' })).toBeVisible();

afterEach(() => vi.unstubAllGlobals());

describe('ajout d’une note de lecture', () => {
  it('propose un champ multiligne, un compteur sur 1 000 caractères et les notes dessous', async () => {
    creerTransport();
    const { client } = rendreFiche();
    await attendreFiche();

    const champ = champNote();
    expect(champ.tagName).toBe('TEXTAREA');
    expect(screen.getByText(`0 / ${LONGUEUR_MAXIMALE_NOTE} caractères`)).toBeVisible();
    expect(boutonAjouter()).toHaveStyle({ minHeight: '44px' });
    expect(await screen.findByText('Observation ancienne.')).toBeVisible();

    saisirNote('Une observation neuve.');
    expect(screen.getByText(`22 / ${LONGUEUR_MAXIMALE_NOTE} caractères`)).toBeVisible();
    client.clear();
  });

  it('refuse une saisie vide et une saisie trop longue sans rien envoyer', async () => {
    const { compteurs } = creerTransport();
    const { client } = rendreFiche();
    await attendreFiche();

    fireEvent.click(boutonAjouter());
    expect(await screen.findByText('Le contenu de la note est obligatoire.')).toBeVisible();

    saisirNote('x'.repeat(LONGUEUR_MAXIMALE_NOTE + 1));
    expect(
      screen.getByText(`${LONGUEUR_MAXIMALE_NOTE + 1} / ${LONGUEUR_MAXIMALE_NOTE} caractères`),
    ).toBeVisible();
    fireEvent.click(boutonAjouter());

    expect(
      await screen.findByText(`La note ne peut pas dépasser ${LONGUEUR_MAXIMALE_NOTE} caractères.`),
    ).toBeVisible();
    expect(compteurs.post).toBe(0);
    client.clear();
  });

  it('envoie le contenu normalisé, affiche la note, vide le champ et confirme', async () => {
    const { fetchMock, compteurs } = creerTransport();
    const { client } = rendreFiche();
    await attendreFiche();

    saisirNote('  Une observation neuve.  ');
    fireEvent.click(boutonAjouter());

    expect(await screen.findByTestId('toast-succes')).toHaveTextContent(
      'La note a été ajoutée à cette fiche.',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/books/${ID_LIVRE}/notes`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ contenu: 'Une observation neuve.' }),
      }),
    );
    const liste = screen.getByRole('list', { name: 'Notes de lecture de Bel-Ami' });
    const elements = within(liste).getAllByRole('listitem');
    expect(elements[0]).toHaveTextContent('Une observation neuve.');
    expect(elements[1]).toHaveTextContent('Observation ancienne.');
    expect(champNote()).toHaveValue('');
    expect(compteurs.post).toBe(1);
    client.clear();
  });

  it('verrouille le champ et la soumission pendant l’envoi, sans double envoi', async () => {
    const differee = differer();
    const { compteurs } = creerTransport({ post: () => differee.promesse });
    const { client } = rendreFiche();
    await attendreFiche();

    saisirNote('Une observation neuve.');
    fireEvent.click(boutonAjouter());

    const enCours = await screen.findByRole('button', { name: 'Envoi de la note…' });
    expect(enCours).toBeDisabled();
    expect(champNote()).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Effacer la saisie' })).toBeDisabled();
    fireEvent.click(enCours);
    fireEvent.click(enCours);
    expect(compteurs.post).toBe(1);

    await act(async () => differee.terminer(json(noteCreee('Une observation neuve.'), 201)));
    expect(await screen.findByTestId('toast-succes')).toBeVisible();
    expect(champNote()).not.toHaveAttribute('readonly');
    expect(compteurs.post).toBe(1);
    client.clear();
  });

  it('ne remplace pas la saisie en cours par une actualisation des notes', async () => {
    const { compteurs } = creerTransport();
    const { client } = rendreFiche();
    await attendreFiche();
    expect(await screen.findByText('Observation ancienne.')).toBeVisible();

    saisirNote('Brouillon en cours de rédaction.');
    await act(async () => {
      await client.refetchQueries();
    });

    await waitFor(() => expect(compteurs.lecturesNotes).toBeGreaterThan(1));
    expect(champNote()).toHaveValue('Brouillon en cours de rédaction.');
    expect(screen.queryByTestId('toast-succes')).not.toBeInTheDocument();
    client.clear();
  });

  it('conserve la saisie et bloque l’envoi si l’ouvrage a disparu', async () => {
    const { compteurs } = creerTransport({
      fiche: () => Promise.resolve(json({ erreur: 'introuvable', message: 'Livre inconnu.' }, 404)),
    });
    const { client } = rendreFiche();

    expect(await screen.findByText('Livre inconnu.')).toBeVisible();
    saisirNote('Brouillon à recopier.');

    expect(
      screen.getByText(
        'Cet ouvrage n’existe pas ou plus : aucune note ne peut lui être ajoutée. Votre texte reste affiché pour être recopié.',
      ),
    ).toBeVisible();
    expect(boutonAjouter()).toBeDisabled();
    expect(champNote()).not.toHaveAttribute('readonly');
    expect(champNote()).toHaveValue('Brouillon à recopier.');
    expect(compteurs.post).toBe(0);
    client.clear();
  });

  it('explique le blocage sans effacer la saisie pendant une suppression en attente', async () => {
    creerTransport();
    const { client } = rendreFiche();
    await attendreFiche();

    saisirNote('Brouillon protégé.');
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Bel-Ami' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));

    expect(await screen.findByText('Suppression en attente')).toBeVisible();
    expect(champNote()).toHaveValue('Brouillon protégé.');
    expect(
      screen.getByText(
        'Cet ouvrage est masqué jusqu’au résultat de sa suppression : l’ajout d’une note est suspendu. Votre texte reste conservé.',
      ),
    ).toBeVisible();
    expect(boutonAjouter()).toBeDisabled();
    expect(
      screen.queryByRole('list', { name: 'Notes de lecture de Bel-Ami' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Annuler toutes les suppressions' }));

    await attendreFiche();
    expect(champNote()).toHaveValue('Brouillon protégé.');
    client.clear();
  });

  it('garde la confirmation d’abandon atteignable pendant une suppression en attente', async () => {
    creerTransport();
    const { client, retour } = rendreFiche();
    await attendreFiche();

    saisirNote('Brouillon protégé.');
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Bel-Ami' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    expect(await screen.findByText('Suppression en attente')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(screen.getByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible();
    expect(retour).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Abandonner la saisie' }));
    expect(retour).toHaveBeenCalledOnce();
    client.clear();
  });
});
