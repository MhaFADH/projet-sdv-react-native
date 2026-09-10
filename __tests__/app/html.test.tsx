import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

/**
 * `expo-router/html` est publié en JSX non transpilé dans un fichier `.js` :
 * Vite refuse de l'analyser. Seule une réinitialisation de style y est exportée,
 * sans incidence sur la langue du document ni sur la place du contenu.
 *
 * L'enveloppe n'est rendue qu'à la génération du document web : elle n'est pas
 * montable dans le DOM de test, on inspecte donc l'arbre d'éléments produit.
 */
vi.mock('expo-router/html', () => ({ ScrollViewStyleReset: () => null }));

const { default: Document } = await import('../../app/+html');

const contenu = <div id="root" />;

const enfantsDe = (element: ReactElement): ReactElement[] => {
  const { children } = element.props as { children?: unknown };
  return (Array.isArray(children) ? children : [children]).filter(isValidElement);
};

describe('enveloppe HTML de la version web', () => {
  it('déclare le français comme langue du document', () => {
    const document = Document({ children: contenu }) as ReactElement;

    expect(document.type).toBe('html');
    expect((document.props as { lang?: string }).lang).toBe('fr');
  });

  it('rend le contenu de l’application dans le corps du document', () => {
    const document = Document({ children: contenu }) as ReactElement;
    const corps = enfantsDe(document).find((enfant) => enfant.type === 'body');

    expect(corps).toBeDefined();
    expect((corps as ReactElement).props).toMatchObject({ children: contenu });
  });
});
