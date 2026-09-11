import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();
  return { ...reactNative, useColorScheme: () => 'light' };
});

import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';
import { appliquerLangue } from '../../services/i18n';

const MESSAGE_ECHEC =
  'Vos choix sont appliqués, mais ils n’ont pas pu être lus ou enregistrés sur cet appareil.';

const afficherPreferences = () =>
  render(
    <PreferencesProvider>
      <PreferencesScreen revenir={() => {}} />
    </PreferencesProvider>,
  );

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  appliquerLangue('fr');
});

describe('stockage des préférences indisponible', () => {
  it('n’empêche pas l’application de démarrer quand la lecture échoue', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('stockage bloqué');
    });
    afficherPreferences();

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGE_ECHEC);
    expect(screen.getByRole('radio', { name: 'Système' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Français' })).toHaveAttribute('aria-checked', 'true');
  });

  it('applique le choix, signale l’échec d’enregistrement et permet de réessayer', async () => {
    const ecrire = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota dépassé');
    });
    afficherPreferences();

    fireEvent.click(await screen.findByRole('radio', { name: 'Sombre' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(MESSAGE_ECHEC);
    expect(screen.getByRole('radio', { name: 'Sombre' })).toHaveAttribute('aria-checked', 'true');

    ecrire.mockRestore();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer l’enregistrement' }));

    await waitFor(() =>
      expect(window.localStorage.getItem('booklist-pro.preferences.theme')).toBe('sombre'),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
