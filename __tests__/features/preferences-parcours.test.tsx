import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let apparenceSysteme: 'light' | 'dark' = 'light';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();
  return { ...reactNative, useColorScheme: () => apparenceSysteme };
});

import { PreferencesProvider } from '../../features/preferences/preferences-provider';
import { PreferencesScreen } from '../../features/preferences/preferences-screen';
import { appliquerLangue } from '../../services/i18n';

const TEXTE_CLAIR = 'rgb(31, 41, 51)';
const TEXTE_SOMBRE = 'rgb(244, 240, 234)';

const afficherPreferences = () =>
  render(
    <PreferencesProvider>
      <PreferencesScreen revenir={() => {}} />
    </PreferencesProvider>,
  );

const titre = () => screen.getByRole('heading', { name: 'Préférences' });

beforeEach(() => {
  apparenceSysteme = 'light';
  window.localStorage.clear();
});

afterEach(() => appliquerLangue('fr'));

describe('écran Préférences', () => {
  it('démarre en français avec le thème système sans préférence enregistrée', async () => {
    afficherPreferences();

    expect(await screen.findByRole('radio', { name: 'Système' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Français' })).toHaveAttribute('aria-checked', 'true');
    expect(titre()).toHaveStyle({ color: TEXTE_CLAIR });
  });

  it('suit l’apparence sombre de la plateforme tant que le thème système est choisi', async () => {
    apparenceSysteme = 'dark';
    afficherPreferences();

    expect(await screen.findByRole('radio', { name: 'Système' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(titre()).toHaveStyle({ color: TEXTE_SOMBRE });
  });

  it('cesse de suivre la plateforme dès qu’un thème explicite est choisi', async () => {
    apparenceSysteme = 'dark';
    afficherPreferences();

    fireEvent.click(await screen.findByRole('radio', { name: 'Clair' }));

    expect(titre()).toHaveStyle({ color: TEXTE_CLAIR });
    expect(screen.getByRole('radio', { name: 'Clair' })).toHaveAttribute('aria-checked', 'true');
  });

  it('applique et persiste la langue à chaud sans rechargement', async () => {
    afficherPreferences();

    fireEvent.click(await screen.findByRole('radio', { name: 'Anglais' }));

    expect(await screen.findByRole('heading', { name: 'Preferences' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
    await waitFor(() =>
      expect(window.localStorage.getItem('booklist-pro.preferences.langue')).toBe('en'),
    );
  });

  it('persiste le thème choisi sans écraser la langue déjà enregistrée', async () => {
    window.localStorage.setItem('booklist-pro.preferences.langue', 'en');
    afficherPreferences();

    fireEvent.click(await screen.findByRole('radio', { name: 'Dark' }));

    await waitFor(() =>
      expect(window.localStorage.getItem('booklist-pro.preferences.theme')).toBe('sombre'),
    );
    expect(window.localStorage.getItem('booklist-pro.preferences.langue')).toBe('en');
  });

  it('marque le contrôle qui reçoit le focus', async () => {
    afficherPreferences();

    const sombre = await screen.findByRole('radio', { name: 'Sombre' });
    expect(sombre).not.toHaveStyle({ borderColor: 'rgb(29, 78, 216)' });

    fireEvent.focus(sombre);

    expect(sombre).toHaveStyle({ borderColor: 'rgb(29, 78, 216)' });
  });

  it('restaure les préférences enregistrées au démarrage', async () => {
    window.localStorage.setItem('booklist-pro.preferences.theme', 'sombre');
    window.localStorage.setItem('booklist-pro.preferences.langue', 'en');
    afficherPreferences();

    expect(await screen.findByRole('heading', { name: 'Preferences' })).toHaveStyle({
      color: TEXTE_SOMBRE,
    });
  });

  it('retombe sur les valeurs initiales quand la valeur stockée est invalide', async () => {
    window.localStorage.setItem('booklist-pro.preferences.theme', 'fluo');
    window.localStorage.setItem('booklist-pro.preferences.langue', 'es');
    afficherPreferences();

    expect(await screen.findByRole('radio', { name: 'Système' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Français' })).toHaveAttribute('aria-checked', 'true');
  });

  it('expose des contrôles accessibles et des cibles d’au moins 44 points', async () => {
    afficherPreferences();

    const groupes = await screen.findAllByRole('radiogroup');
    expect(groupes.map((groupe) => groupe.getAttribute('aria-label'))).toEqual(['Thème', 'Langue']);
    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveStyle({ minHeight: '44px', minWidth: '44px' });
    }
    expect(screen.getByRole('button', { name: 'Revenir à l’écran précédent' })).toHaveStyle({
      minHeight: '44px',
    });
  });
});
