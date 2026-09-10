import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FicheScreen } from '../../features/books/fiche-screen';
import {
  boutonAjouter,
  champNote,
  creerTransport,
  ID_AUTRE_LIVRE,
  ID_LIVRE,
  json,
  rendreFiche,
  saisirNote,
} from './outils-notes';

const DELAI_TEMPORISATION_MS = 3_000;
const SAISIE = 'Une observation à ne pas perdre.';

const avancer = (duree: number) => act(async () => void (await vi.advanceTimersByTimeAsync(duree)));

const envoyer = () => fireEvent.click(boutonAjouter());

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('échecs de l’ajout d’une note', () => {
  it('alimente le champ concerné après un 422 et conserve la saisie', async () => {
    vi.useFakeTimers();
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
    const { client } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    envoyer();
    await avancer(0);

    expect(screen.getByText('contenu obligatoire, 1000 caracteres maximum')).toBeVisible();
    expect(champNote()).toHaveValue(SAISIE);
    expect(champNote()).not.toHaveAttribute('readonly');
    expect(screen.queryByTestId('toast-succes')).not.toBeInTheDocument();
    client.clear();
  });

  it('temporise le réessai après un 503 sans rejouer le POST automatiquement', async () => {
    vi.useFakeTimers();
    const { compteurs } = creerTransport({
      post: () => Promise.resolve(json({ erreur: 'chaos', message: 'Service indisponible.' }, 503)),
    });
    const { client } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    envoyer();
    await avancer(0);

    expect(screen.getByRole('button', { name: 'Réessayer dans 3 s' })).toBeDisabled();
    expect(champNote()).toHaveValue(SAISIE);
    await avancer(DELAI_TEMPORISATION_MS);
    expect(compteurs.post).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Réessayer l’enregistrement' }));
    await avancer(0);

    expect(compteurs.post).toBe(2);
    expect(champNote()).toHaveValue(SAISIE);
    client.clear();
  });

  it('présente une coupure comme un résultat incertain, jamais comme un refus', async () => {
    vi.useFakeTimers();
    const { compteurs } = creerTransport({
      post: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    const { client } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    envoyer();
    await avancer(0);

    expect(
      screen.getByText(
        'Aucune réponse du serveur : la note a peut-être été enregistrée. Actualisez les notes pour vérifier avant de renvoyer.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Un nouvel envoi peut créer une seconde note : une note au contenu identique ne prouve pas que le premier envoi a abouti, et son absence ne prouve pas qu’il a été refusé.',
      ),
    ).toBeVisible();
    expect(screen.queryByTestId('toast-succes')).not.toBeInTheDocument();
    expect(champNote()).toHaveValue(SAISIE);
    expect(compteurs.post).toBe(1);
    client.clear();
  });

  it('actualise les notes pour vérifier sans effacer la saisie ni l’avertissement', async () => {
    vi.useFakeTimers();
    const { compteurs } = creerTransport({
      post: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    const { client } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    envoyer();
    await avancer(0);
    const lecturesAvant = compteurs.lecturesNotes;

    fireEvent.click(screen.getByRole('button', { name: 'Actualiser les notes' }));
    await avancer(0);

    expect(compteurs.lecturesNotes).toBe(lecturesAvant + 1);
    expect(compteurs.post).toBe(1);
    expect(champNote()).toHaveValue(SAISIE);
    expect(
      screen.getByRole('button', { name: 'Renvoyer malgré le risque de doublon' }),
    ).toBeVisible();
    client.clear();
  });

  it('ne renvoie la note que sur demande explicite après un résultat incertain', async () => {
    vi.useFakeTimers();
    const { compteurs } = creerTransport({
      post: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    const { client } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    envoyer();
    await avancer(0);

    fireEvent.click(screen.getByRole('button', { name: 'Renvoyer malgré le risque de doublon' }));
    await avancer(0);

    expect(compteurs.post).toBe(2);
    client.clear();
  });
});

describe('abandon d’une saisie de note', () => {
  it('demande confirmation avant d’effacer et avant de quitter la fiche', async () => {
    vi.useFakeTimers();
    creerTransport();
    const { client, retour } = rendreFiche();
    await avancer(0);

    saisirNote(SAISIE);
    fireEvent.click(screen.getByRole('button', { name: 'Retour au fonds' }));

    expect(screen.getByRole('heading', { name: 'Abandonner cette saisie ?' })).toBeVisible();
    expect(retour).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Poursuivre la saisie' }));
    expect(champNote()).toHaveValue(SAISIE);

    fireEvent.click(screen.getByRole('button', { name: 'Effacer la saisie' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abandonner la saisie' }));

    expect(champNote()).toHaveValue('');
    expect(retour).not.toHaveBeenCalled();
    client.clear();
  });

  it('avertit le navigateur d’un départ avec une saisie non envoyée', async () => {
    vi.useFakeTimers();
    creerTransport();
    const { client } = rendreFiche();
    await avancer(0);

    const sansSaisie = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(sansSaisie);
    expect(sansSaisie.defaultPrevented).toBe(false);

    saisirNote(SAISIE);
    const avecSaisie = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(avecSaisie);

    expect(avecSaisie.defaultPrevented).toBe(true);
    client.clear();
  });
});

describe('coexistence avec les suppressions d’ouvrages', () => {
  it('laisse la confirmation de note et le bandeau de suppression côte à côte', async () => {
    vi.useFakeTimers({ now: 0 });
    creerTransport();
    const { client, rerender } = rendreFiche(ID_AUTRE_LIVRE);
    await avancer(0);

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer Germinal' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la suppression' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 5 s');

    rerender(<FicheScreen corriger={vi.fn()} id={ID_LIVRE} retour={vi.fn()} />);
    await avancer(1_000);
    saisirNote(SAISIE);
    envoyer();
    await avancer(0);

    expect(screen.getByTestId('toast-succes')).toHaveTextContent(
      'La note a été ajoutée à cette fiche.',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('1 ouvrage à supprimer dans 4 s');
    expect(screen.getByRole('button', { name: 'Annuler toutes les suppressions' })).toBeVisible();
    client.clear();
  });
});
