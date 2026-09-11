import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Ouvrage } from '../../domain/ouvrage';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import type { ErreurApplication } from '../../services/api/erreurs';
import { appliquerLangue } from '../../services/i18n';
import { ID, ouvrage, rendreFiche, reponseJson } from './outils-notation';

afterEach(() => {
  appliquerLangue('fr');
  vi.unstubAllGlobals();
});

describe('reprise d’une notation depuis la fiche', () => {
  it('restaure la valeur précédente après un refus et permet de réessayer', async () => {
    const confirme = { ...ouvrage, note: 4, version: 4 };
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') {
        const nombreEnvois = transport.mock.calls.filter(
          ([, options]) => options?.method === 'PATCH',
        ).length;
        return Promise.resolve(
          nombreEnvois === 1
            ? reponseJson({ erreur: 'refus', message: 'Modification refusée.' }, 422)
            : reponseJson(confirme),
        );
      }
      return Promise.resolve(reponseJson(confirme));
    });
    transport.mockResolvedValueOnce(reponseJson(ouvrage));
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 4 étoiles' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La notation précédente a été restaurée. Modification refusée.',
    );
    expect(screen.getByText('Aucune notation')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer la notation' }));

    await waitFor(() =>
      expect(
        transport.mock.calls.filter(([, initialisation]) => initialisation?.method === 'PATCH'),
      ).toHaveLength(2),
    );
    expect(await screen.findByText('4 sur 5')).toBeVisible();
    client.clear();
  });

  it('traduit immédiatement la commande et son erreur visible', async () => {
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') {
        return Promise.resolve(
          reponseJson({ erreur: 'refus', message: 'Modification refusée.' }, 422),
        );
      }
      return Promise.resolve(reponseJson(ouvrage));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 1 étoile' }));
    expect(await screen.findByText(/La notation précédente a été restaurée/)).toBeVisible();

    await act(async () => appliquerLangue('en'));

    expect(screen.getByRole('radiogroup', { name: 'Choose a rating' })).toBeVisible();
    expect(screen.getByText(/The previous rating was restored/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retry the rating' })).toBeVisible();
    client.clear();
  });

  it('garde la notation confirmée si sa relecture échoue et propose de reprendre la lecture', async () => {
    const confirme = { ...ouvrage, note: 2, version: 4 };
    const relu = { ...confirme, version: 5 };
    let lectures = 0;
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') return Promise.resolve(reponseJson(confirme));
      lectures += 1;
      if (lectures === 1) return Promise.resolve(reponseJson(ouvrage));
      if (lectures === 2) {
        return Promise.resolve(
          reponseJson({ erreur: 'lecture', message: 'Lecture impossible.' }, 400),
        );
      }
      return Promise.resolve(reponseJson(relu));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 2 étoiles' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La notation a été enregistrée, mais la fiche n’a pas pu être actualisée.',
    );
    expect(screen.getByText('2 sur 5')).toBeVisible();
    expect(screen.queryByText(/a été restaurée/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Réessayer l’actualisation de la fiche' }),
    ).toBeVisible();
    expect(client.getQueryData<Ouvrage>(clesOuvrages.fiche(ID))).toMatchObject({
      note: 2,
      version: 4,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer l’actualisation de la fiche' }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(client.getQueryData<Ouvrage>(clesOuvrages.fiche(ID))).toMatchObject({
      note: 2,
      version: 5,
    });
    expect(
      transport.mock.calls.filter(([, initialisation]) => initialisation?.method === 'PATCH'),
    ).toHaveLength(1);
    client.clear();
  });

  it('ignore une relecture plus ancienne que la réponse confirmée', async () => {
    const confirme = { ...ouvrage, note: 5, version: 4 };
    let lectures = 0;
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method === 'PATCH') return Promise.resolve(reponseJson(confirme));
      lectures += 1;
      return Promise.resolve(reponseJson(ouvrage));
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();
    const notesObservees: Array<number | null> = [];
    const arreterObservation = client.getQueryCache().subscribe(() => {
      const donnee = client.getQueryData<Ouvrage>(clesOuvrages.fiche(ID));
      if (donnee) notesObservees.push(donnee.note);
    });

    fireEvent.click(await screen.findByRole('radio', { name: 'Attribuer 5 étoiles' }));

    await waitFor(() => expect(lectures).toBe(2));
    await waitFor(() =>
      expect(client.getQueryData<Ouvrage>(clesOuvrages.fiche(ID))).toMatchObject({
        note: 5,
        version: 4,
      }),
    );
    expect(screen.getByText('5 sur 5')).toBeVisible();
    const premiereConfirmation = notesObservees.indexOf(5);
    expect(premiereConfirmation).toBeGreaterThanOrEqual(0);
    expect(notesObservees.slice(premiereConfirmation)).toEqual(
      notesObservees.slice(premiereConfirmation).map(() => 5),
    );
    arreterObservation();
    client.clear();
  });

  it('ignore la fin d’une actualisation antérieure à une nouvelle notation', async () => {
    const premiereConfirmation = { ...ouvrage, note: 2, version: 4 };
    const derniereConfirmation = { ...ouvrage, note: 5, version: 5 };
    const transport = vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
      if (String(entree).endsWith('/notes')) return Promise.resolve(reponseJson([]));
      if (initialisation?.method !== 'PATCH') return Promise.resolve(reponseJson(ouvrage));
      return Promise.resolve(
        reponseJson(
          initialisation.body === JSON.stringify({ note: 2 })
            ? premiereConfirmation
            : derniereConfirmation,
        ),
      );
    });
    vi.stubGlobal('fetch', transport);
    const client = rendreFiche();
    await screen.findByRole('radio', { name: 'Attribuer 2 étoiles' });
    let terminerPremiereActualisation: (() => void) | undefined;
    const premiereActualisation = new Promise<void>((resoudre) => {
      terminerPremiereActualisation = resoudre;
    });
    vi.spyOn(client, 'invalidateQueries')
      .mockImplementationOnce(() => premiereActualisation)
      .mockResolvedValue(undefined);

    fireEvent.click(screen.getByRole('radio', { name: 'Attribuer 2 étoiles' }));
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Attribuer 2 étoiles' })).not.toHaveAttribute(
        'aria-disabled',
      ),
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Attribuer 5 étoiles' }));
    await screen.findByText('5 sur 5');

    const requete = client
      .getQueryCache()
      .find<Ouvrage, ErreurApplication>({ queryKey: clesOuvrages.fiche(ID) });
    const erreurObsolete: ErreurApplication = {
      type: 'reseau',
      cause: 'http',
      message: 'Ancienne actualisation impossible.',
      reessayable: false,
    };
    act(() => requete?.setState({ ...requete.state, error: erreurObsolete, status: 'error' }));
    await act(async () => {
      terminerPremiereActualisation?.();
      await Promise.resolve();
    });
    act(() => client.setQueryData(clesOuvrages.fiche(ID), derniereConfirmation));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByText('5 sur 5')).toBeVisible();
    client.clear();
  });
});
