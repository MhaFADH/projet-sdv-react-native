import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Enveloppe HTML de la version web. Elle n'est rendue que côté serveur, au
 * moment de la génération du document : les composants de l'application n'y
 * sont pas montés. Son rôle ici est de déclarer la langue du document, car
 * toutes les chaînes visibles du lot 1 sont en français et les technologies
 * d'assistance s'appuient sur cet attribut pour la prononciation.
 */
const Document = ({ children }: PropsWithChildren) => (
  <html lang="fr">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <ScrollViewStyleReset />
    </head>
    <body>{children}</body>
  </html>
);

export default Document;
