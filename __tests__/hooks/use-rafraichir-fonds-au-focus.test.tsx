import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type PropsWithChildren, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clesOuvrages } from '../../hooks/cles-ouvrages';
import { useRafraichirFondsAuFocus } from '../../hooks/use-rafraichir-fonds-au-focus';

let rappelFocus: (() => void) | undefined;

/** Imite `useFocusEffect` : le rappel est rejoué si son identité change pendant le focus. */
vi.mock('expo-router', () => ({
  useFocusEffect: (rappel: () => void) => {
    rappelFocus = rappel;
    useEffect(() => rappel(), [rappel]);
  },
}));

const creerEnvironnement = () => {
  const client = new QueryClient();
  const invalider = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, invalider, wrapper };
};

beforeEach(() => {
  rappelFocus = undefined;
});

describe('retour au fonds', () => {
  it('réactualise la recherche et la page consultées au retour, jamais au premier affichage', () => {
    const { client, invalider, wrapper } = creerEnvironnement();

    renderHook(() => useRafraichirFondsAuFocus(3, 'zola'), { wrapper });
    expect(invalider).not.toHaveBeenCalled();

    act(() => rappelFocus?.());

    expect(invalider).toHaveBeenCalledExactlyOnceWith({
      queryKey: clesOuvrages.liste(3, 'zola'),
    });
    client.clear();
  });

  it('ne redemande pas la page au serveur lors d’un simple changement de page', () => {
    const { client, invalider, wrapper } = creerEnvironnement();

    const { rerender } = renderHook(({ page }) => useRafraichirFondsAuFocus(page), {
      initialProps: { page: 1 },
      wrapper,
    });
    rerender({ page: 2 });
    rerender({ page: 3 });

    expect(invalider).not.toHaveBeenCalled();

    act(() => rappelFocus?.());

    expect(invalider).toHaveBeenCalledExactlyOnceWith({ queryKey: clesOuvrages.liste(3) });
    client.clear();
  });
});
