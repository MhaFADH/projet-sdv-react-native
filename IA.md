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

## Intervention — issue #3

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5`.
- Périmètre : issue GitHub #3, consultation d’une fiche et retour à la page consultée.

### Demandes reçues

1. `https://github.com/MhaFADH/projet-sdv-react-native/issues/3 tu as accès à GitHub CLI.`

### Actions réalisées avec l’IA

- lecture du ticket #3, du cadrage du lot 1 et du contrat `GET /books/:id` du README de l’API ;
- ajout du cas d’erreur `introuvable` pour les réponses `404`, de `fetchBook` et de ses tests de service ;
- extraction des clés de cache et de la politique de réessai partagées, ajout du hook `useBook` et de sa couverture (clé dédiée, réponses obsolètes, annulation, absence) ;
- ajout de la route `/ouvrages/[id]`, de `FicheScreen`, de `FicheView` et du passage de la page consultée dans l’URL de la route racine ;
- exécution du lint, du typage, des tests, de la couverture, de `knip`, puis vérification navigateur.

### Défauts constatés et corrections réelles

- Le premier test de réessai manuel de la fiche échouait : le réessai automatique d’une seconde consommait la réponse de succès prévue pour l’action « Réessayer ». Le test a été corrigé pour épuiser d’abord le réessai automatique.
- `knip` a signalé deux exports inutilisés introduits par cette itération (`EDITEUR_NON_RENSEIGNE`, `EtatFiche`). Ils ont été rendus locaux à leur module.
- La fiche présentait à la fois une pastille de statut et une ligne « Statut de lecture », doublon retiré au profit de la seule ligne libellée.
- La revue Standards et la revue Spec ont relevé quatre défauts réels, corrigés avec leurs tests : réactualisation déclenchée à chaque changement de page et non au seul retour, absence de contrôle d’identité sur la fiche reçue, identifiant de route vide traité en erreur réessayable plutôt qu’en absence, et duplication des états de chargement, d’erreur et d’absence entre les deux écrans, désormais extraits dans `components/etats-donnees.tsx`. La politique de réessai a été déplacée de `hooks/` vers `services/api/`, qui porte les règles liées au transport.

### Vérification navigateur

Réalisée avec Chrome sans interface piloté par le protocole DevTools, contre `npx expo start --web` et l’API locale sans authentification, base de 500 livres :

- `/?page=2` affiche « Page 2 sur 25 · 500 ouvrages » et vingt éléments de liste ;
- chaque ouvrage est un `button` focusable au clavier portant son libellé accessible ;
- l’ouverture d’un ouvrage affiche titre, auteur, éditeur, année et statut, à l’URL `/ouvrages/<identifiant>` ;
- `/ouvrages/inconnu-123` affiche « Cette fiche n’est plus disponible » et le message serveur, sans chargement infini ;
- le retour navigateur ramène à `?page=2` depuis une fiche ouverte à cette page ;
- dans un second passage parti de `?page=3`, le bouton « Retour au fonds » ramène à `?page=3` et déclenche une nouvelle requête `GET /books?…` (deux requêtes observées pour un aller-retour) ;
- après correction de la réactualisation, deux clics successifs sur « Suivant » produisent exactement les pages `1,2,3`, sans requête en double.

Ces observations ont été refaites après l’extraction des états partagés.
