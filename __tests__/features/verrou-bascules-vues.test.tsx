import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSULTATION_FONDS_PAR_DEFAUT,
  type ConsultationFonds,
} from '../../domain/criteres-ouvrages';
import type { Ouvrage } from '../../domain/ouvrage';
import { FicheScreen } from '../../features/books/fiche-screen';
import { FondsScreen } from '../../features/books/fonds-screen';
import {
  appelsPatch,
  attendrePatch,
  belAmi,
  estNotes,
  estPatch,
  germinal,
  reponseNotesVides,
  reponsePage,
  type Transport,
} from '../outils-bascules';
import { creerEnveloppeOuvrages } from '../outils-rendu';

const NON_LUS: ConsultationFonds = { ...CONSULTATION_FONDS_PAR_DEFAUT, lecture: 'nonlu' };

const estListe = (entree: RequestInfo | URL) => String(entree).includes('/books?');

const rendreLesDeuxVues = (consultation: ConsultationFonds = CONSULTATION_FONDS_PAR_DEFAUT) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <>
      <FondsScreen
        ajouterOuvrage={vi.fn()}
        changerConsultation={vi.fn()}
        changerPage={vi.fn()}
        consultationDemandee={consultation}
        ouvrirOuvrage={vi.fn()}
        pageDemandee={1}
      />
      <FicheScreen corriger={vi.fn()} id={belAmi.id} retour={vi.fn()} />
    </>,
    { wrapper: creerEnveloppeOuvrages(client) },
  );
  return client;
};

const creerTransport = (
  gererPatch: () => Promise<Response>,
  itemsListe: (lectures: number) => Ouvrage[],
  ficheLue: (lectures: number) => Ouvrage = () => belAmi,
): Transport => {
  let lecturesListe = 0;
  let lecturesFiche = 0;
  return vi.fn<typeof fetch>().mockImplementation((entree, initialisation) => {
    if (estNotes(entree)) return Promise.resolve(reponseNotesVides());
    if (estPatch(initialisation)) return gererPatch();
    if (!estListe(entree)) {
      lecturesFiche += 1;
      return Promise.resolve(
        new Response(JSON.stringify(ficheLue(lecturesFiche)), { status: 200 }),
      );
    }
    lecturesListe += 1;
    return Promise.resolve(reponsePage(itemsListe(lecturesListe)));
  });
};

const commande = (libelle: string) => screen.getByRole('switch', { name: libelle });

afterEach(() => vi.unstubAllGlobals());

describe('verrou des bascules partagé entre le fonds et la fiche', () => {
  it('verrouille cœur et lecture d’un ouvrage dans ses deux vues, sans bloquer les autres', async () => {
    const transport = creerTransport(
      () => new Promise<Response>(() => {}),
      () => [belAmi, germinal],
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreLesDeuxVues();

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Marquer comme coup de cœur : Bel-Ami' }),
    );

    expect(commande('Retirer le coup de cœur : Bel-Ami')).toHaveAttribute('aria-disabled', 'true');
    expect(commande('Retirer le coup de cœur')).toHaveAttribute('aria-disabled', 'true');
    expect(commande('Marquer comme lu')).toHaveAttribute('aria-disabled', 'true');
    expect(commande('Retirer le coup de cœur : Germinal')).not.toHaveAttribute('aria-disabled');

    fireEvent.click(commande('Retirer le coup de cœur : Germinal'));

    await attendrePatch(transport, 2);
    expect(appelsPatch(transport)[1]?.[0]).toContain(germinal.id);
    client.clear();
  });

  it('libère les commandes des deux vues après la confirmation', async () => {
    let confirmer: ((reponse: Response) => void) | undefined;
    const confirme = { ...belAmi, favori: true, version: 4 };
    const transport = creerTransport(
      () =>
        new Promise<Response>((resoudre) => {
          confirmer = resoudre;
        }),
      (lectures) => [lectures === 1 ? belAmi : confirme],
      (lectures) => (lectures === 1 ? belAmi : confirme),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreLesDeuxVues();

    fireEvent.click(
      await screen.findByRole('switch', { name: 'Marquer comme coup de cœur : Bel-Ami' }),
    );
    await attendrePatch(transport);
    await act(async () => confirmer?.(new Response(JSON.stringify(confirme), { status: 200 })));

    await waitFor(() =>
      expect(commande('Retirer le coup de cœur')).not.toHaveAttribute('aria-disabled'),
    );
    expect(commande('Retirer le coup de cœur : Bel-Ami')).not.toHaveAttribute('aria-disabled');
    expect(commande('Retirer le coup de cœur : Bel-Ami')).toHaveAttribute('aria-checked', 'true');
    client.clear();
  });

  it('conserve la ligne sortant du filtre de lecture puis la retire après succès', async () => {
    let confirmer: ((reponse: Response) => void) | undefined;
    const lu = { ...belAmi, lu: true, version: 4 };
    const transport = creerTransport(
      () =>
        new Promise<Response>((resoudre) => {
          confirmer = resoudre;
        }),
      (lectures) => (lectures === 1 ? [belAmi] : []),
      (lectures) => (lectures === 1 ? belAmi : lu),
    );
    vi.stubGlobal('fetch', transport);
    const client = rendreLesDeuxVues(NON_LUS);

    fireEvent.click(await screen.findByRole('switch', { name: 'Marquer comme lu' }));

    expect(screen.getByRole('button', { name: 'Bel-Ami, Guy de Maupassant, Lu' })).toBeVisible();

    await attendrePatch(transport);
    expect(appelsPatch(transport)[0]?.[1]).toMatchObject({ body: JSON.stringify({ lu: true }) });

    await act(async () => confirmer?.(new Response(JSON.stringify(lu), { status: 200 })));

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /^Bel-Ami, Guy de Maupassant/ }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { name: 'Aucun résultat' })).toBeVisible();
    client.clear();
  });
});
