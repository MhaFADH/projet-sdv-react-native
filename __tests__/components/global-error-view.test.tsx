import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalErrorView } from '../../components/global-error-view';

vi.mock('expo-router', () => ({ Stack: Object.assign(() => null, { Screen: () => null }) }));
vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('react-native-reanimated', () => ({}));
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'div' }));
vi.mock('@react-navigation/native', () => ({
  DarkTheme: {},
  DefaultTheme: {},
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));

const { ErrorBoundary } = await import('../../app/_layout');

const FOND_SOMBRE = 'rgb(22, 19, 15)';

beforeEach(() => window.localStorage.clear());

describe("écran global d'erreur", () => {
  it("explique l'erreur de rendu et permet une reprise", () => {
    const retry = vi.fn();
    render(<GlobalErrorView retry={retry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Une erreur inattendue est survenue');
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('restaure le thème et la langue actifs dans la frontière racine', async () => {
    window.localStorage.setItem('booklist-pro.preferences.theme', 'sombre');
    window.localStorage.setItem('booklist-pro.preferences.langue', 'en');

    render(<ErrorBoundary retry={vi.fn()} error={new Error('rendu')} />);

    expect(await screen.findByText('An unexpected error occurred')).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveStyle({ backgroundColor: FOND_SOMBRE }),
    );
  });
});
