# Usage de l’IA

## Intervention

- Outil : pi coding agent.
- Fournisseur : OpenAI Codex.
- Modèle : `gpt-5.6-sol`.
- Périmètre : issue GitHub #2, consultation paginée du fonds.

## Demandes reçues

1. `https://github.com/MhaFADH/projet-sdv-react-native/issues/2`
2. `i commited staged docs, now status is clean`
3. `ok just a thing, i would like only arrow functions, no normal functions, and add it to biome too`

## Actions réalisées avec l’IA

- lecture du ticket, de sa spécification parent, du contrat de l’API et de la documentation Expo SDK 54 ;
- proposition et implémentation des seams de test pour le transport, le hook TanStack Query et la présentation pure ;
- rédaction du client HTTP, de la validation Zod, du parcours paginé et de la documentation ;
- exécution du lint, du typage, des tests, de la couverture et des contrôles Expo.

## Défauts constatés et corrections réelles

- React Native Testing Library chargeait du syntaxe Flow non transformé par la configuration Vitest existante. Les tests de composants ont été déplacés vers Testing Library DOM avec `react-native-web`, conformément à la cible navigateur prioritaire.
- `accessibilityRole="listitem"` n’était pas accepté par les types React Native installés. La prop universelle `role="listitem"` disponible dans React Native 0.81 a été utilisée.
- Le délai d’expiration HTTP était initialement arrêté dès la réception des en-têtes. Son périmètre a été étendu à la lecture du corps de réponse.
- La première revue Spec a relevé que l’année externe n’était validée que comme entier. Les bornes 1450 et année courante + 1 du contrat API ont été ajoutées avec leurs tests.
- La première revue Spec a relevé qu’une page devenue vide avec un total non nul était présentée comme un fonds globalement vide. Un état distinct conserve la pagination et le parcours revient automatiquement à la dernière page serveur, avec un test de non-régression.

Aucun prompt, défaut ou résultat non observé n’est ajouté à ce document.
