import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  type ConsultationFonds,
} from '../../domain/criteres-ouvrages';
import { FondsScreen } from '../../features/books/fonds-screen';
import {
  appelsPatch,
  attendrePatch,
  belAmi,
  estPatch,
  germinal,
  reponsePage,
  reponseRefus,
  type Transport,
} from '../outils-bascules';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const FAVORIS: ConsultationFonds = { ...CONSULTATION_FONDS_PAR_DEFAUT, recommandation: 'favoris' };

const rendreFonds = (
  consultation: ConsultationFonds = CONSULTATION_FONDS_PAR_DEFAUT,
  ouvrirOuvrage = vi.fn(),
) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <FondsScreen
      ajouterOuvrage={vi.fn()}
      changerConsultation={vi.fn()}
      changerPage={vi.fn()}
      consultationDemandee={consultation}
      ouvrirOuvrage={ouvrirOuvrage}
      ouvrirPreferences={vi.fn()}
      pageDemandee={1}
    />,
    { wrapper: creerEnveloppeOuvrages(client) },
  );
  return { client, ouvrirOuvrage };
};

const coeur = (libelle: string) => screen.getByRole('switch', { name: libelle });
afterEach(() => vi.unstubAllGlobals());

describe('coups de cœur depuis le fonds', () => {
  it('applique l’intention avant la réponse, envoie un PATCH partiel puis confirme', async () => {
    let confirmer: ((reponse: Response) => void) | undefined;
    let lectures = 0;
    const confirme = { ...belAmi, favori: true, version: 4 };
    const transport = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      if (estPatch(initialisation)) {
        return new Promise<Response>((resoudre) => {
          confirmer = resoudre;
        });
      }
      lectures += 1;
      return Promise.resolve(reponsePage([lectures === 1 ? belAmi : confirme, germinal]));
    });
    vi.stubGlobal('fetch', transport);
    const { client } = rendreFonds();

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Marquer comme coup de cœur : Bel-Ami' }),
    );

    const enCours = coeur('Retirer le coup de cœur : Bel-Ami');
    expect(enCours).toHaveAttribute('aria-checked', 'true');
    expect(enCours).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Enregistrement du coup de cœur en cours')).toBeVisible();
    expect(coeur('Retirer le coup de cœur : Germinal')).not.toHaveAttribute('aria-disabled');

    await attendrePatch(transport);
    expect(appelsPatch(transport)[0]?.[1]).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ favori: true }),
    });

    await act(async () => confirmer?.(new Response(JSON.stringify(confirme), { status: 200 })));

    await waitFor(() => expect(lectures).toBe(2));
    const apres = coeur('Retirer le coup de cœur : Bel-Ami');
    expect(apres).toHaveAttribute('aria-checked', 'true');
    expect(apres).not.toHaveAttribute('aria-disabled');
    client.clear();
  });

  it('ne déclenche ni l’ouverture de la fiche ni la sélection de suppression', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockImplementation((_entree, initialisation) =>
          estPatch(initialisation)
            ? new Promise<Response>(() => {})
            : Promise.resolve(reponsePage([belAmi])),
        ),
    );
    const { client, ouvrirOuvrage } = rendreFonds();

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Marquer comme coup de cœur : Bel-Ami' }),
    );

    expect(ouvrirOuvrage).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Sélectionner Bel-Ami' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    client.clear();
  });

  it('restaure le cœur après un refus et le réessaie depuis la ligne concernée', async () => {
    const transport: Transport = vi
      .fn<typeof fetch>()
      .mockImplementation((_entree, initialisation) =>
        estPatch(initialisation)
          ? Promise.resolve(
              appelsPatch(transport).length === 1
                ? reponseRefus()
                : new Response(JSON.stringify({ ...belAmi, favori: true, version: 4 }), {
                    status: 200,
                  }),
            )
          : Promise.resolve(reponsePage([belAmi])),
      );
    vi.stubGlobal('fetch', transport);
    const { client } = rendreFonds();

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Marquer comme coup de cœur : Bel-Ami' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le coup de cœur précédent a été restauré. Modification refusée.',
    );
    expect(coeur('Marquer comme coup de cœur : Bel-Ami')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Réessayer la modification du coup de cœur : Bel-Ami',
      }),
    );

    await waitFor(() =>
      expect(coeur('Retirer le coup de cœur : Bel-Ami')).toHaveAttribute('aria-checked', 'true'),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    client.clear();
  });

  it('conserve la ligne sortant du filtre pendant l’envoi puis la retire après succès', async () => {
    let confirmer: ((reponse: Response) => void) | undefined;
    let lectures = 0;
    const transport = vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
      if (estPatch(initialisation)) {
        return new Promise<Response>((resoudre) => {
          confirmer = resoudre;
        });
      }
      lectures += 1;
      return Promise.resolve(reponsePage(lectures === 1 ? [germinal] : []));
    });
    vi.stubGlobal('fetch', transport);
    const { client } = rendreFonds(FAVORIS);

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Retirer le coup de cœur : Germinal' }),
    );

    expect(screen.getByText('Germinal')).toBeVisible();
    expect(coeur('Marquer comme coup de cœur : Germinal')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('♡')).toBeVisible();
    expect(screen.getByLabelText('Enregistrement du coup de cœur en cours')).toBeVisible();

    await attendrePatch(transport);
    expect(appelsPatch(transport)[0]?.[1]).toMatchObject({
      body: JSON.stringify({ favori: false }),
    });
    await act(async () =>
      confirmer?.(
        new Response(JSON.stringify({ ...germinal, favori: false, version: 4 }), { status: 200 }),
      ),
    );

    await waitFor(() => expect(screen.queryByText('Germinal')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Aucun résultat' })).toBeVisible();
    expect(lectures).toBe(2);
    client.clear();
  });

  it('restaure le cœur sous filtre sans faire disparaître puis réapparaître la ligne', async () => {
    let lectures = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_entree, initialisation) => {
        if (estPatch(initialisation)) return Promise.resolve(reponseRefus());
        lectures += 1;
        return Promise.resolve(reponsePage([germinal]));
      }),
    );
    const { client } = rendreFonds(FAVORIS);

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Retirer le coup de cœur : Germinal' }),
    );
    expect(screen.getByText('Germinal')).toBeVisible();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le coup de cœur précédent a été restauré.',
    );
    expect(screen.getByText('Germinal')).toBeVisible();
    expect(coeur('Retirer le coup de cœur : Germinal')).toHaveAttribute('aria-checked', 'true');
    expect(lectures).toBe(1);
    client.clear();
  });

  it('expose un cœur focalisable de 44 points, activable au clavier', async () => {
    const transport = vi
      .fn<typeof fetch>()
      .mockImplementation((_entree, initialisation) =>
        estPatch(initialisation)
          ? new Promise<Response>(() => {})
          : Promise.resolve(reponsePage([belAmi])),
      );
    vi.stubGlobal('fetch', transport);
    const { client } = rendreFonds();

    const bouton = await screen.findByRole('switch', {
      name: 'Marquer comme coup de cœur : Bel-Ami',
    });
    expect(bouton).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
    expect(bouton).toHaveAttribute('tabindex', '0');
    bouton.focus();
    expect(bouton).toHaveFocus();

    fireEvent.keyDown(bouton, { key: ' ' });

    await attendrePatch(transport);
    client.clear();
  });
});
