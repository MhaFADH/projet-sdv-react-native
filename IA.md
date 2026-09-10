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

## Intervention — issue #4

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5` (contexte 1M).
- Périmètre : issue GitHub #4, ajout d’un ouvrage sans perte de saisie.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/4 tu as accès au CLI de GitHub pour consulter l’issue.`

### Actions réalisées avec l’IA

- lecture du ticket #4, de la spécification parent #1, des ADR 001 et 005, du README de l’API et de son validateur `src/livres.js` ;
- ajout des dépendances `react-hook-form` et `@hookform/resolvers` ;
- écriture du schéma de saisie `domain/saisie-ouvrage.ts` et de ses tests avant implémentation ;
- extension du client HTTP à `POST`, ajout de `createBook`, de la distinction d’un résultat incertain dans `services/api/erreurs.ts` et de leurs tests de service ;
- ajout des hooks de mutation, de toast et de temporisation, de l’avertissement de départ derrière `services/plateforme/`, du formulaire et de ses composants purs, de la route `/ouvrages/nouveau` et de l’accès depuis l’en-tête du fonds ;
- exécution du formatage, du lint, du typage, des tests, de la couverture et de `knip`, puis recette navigateur ;
- mise à jour du README, de `docs/ARCHITECTURE.md` et des ADR 001 et 005.

### Défauts constatés et corrections réelles

- Le message d’année vide était masqué par le contrôle de format : Zod 4 collecte les deux problèmes du même champ. Les contrôles ont été enchaînés par `pipe` pour que le message « obligatoire » reste seul sur un champ vide.
- Le paramètre de message dynamique du `refine` avait été écrit dans la forme de Zod 3 et produisait « Invalid input ». Il a été remplacé par `{ error: () => … }`.
- Le décompte de temporisation n’avançait que d’une seconde par avance d’horloge : les `setTimeout` enchaînés replanifiaient après la fenêtre avancée. Un `setInterval` unique a remplacé la chaîne.
- `knip` a signalé quatre exports inutilisés introduits par cette itération (`CHAMPS_SAISIE_OUVRAGE`, `DELAI_TEMPORISATION_MS`, `DUREE_TOAST_MS`, `ToastCreation`). Ils ont été rendus locaux à leur module.
- La protection contre l’abandon cessait de fonctionner après la première création : `reset` appelé depuis la soumission laissait React Hook Form ignorer les saisies suivantes, dont `isDirty` restait faux. La remise à vide a été déplacée dans un effet déclenché par une création confirmée, avec un test de non-régression. Défaut trouvé par une sonde de diagnostic, puis confirmé par la revue Spec.
- La revue Standards a relevé qu’un refus `422` portant sur `lu` était perdu : la bascule n’affiche pas d’erreur. Le statut de lecture a été retiré des champs porteurs de message ; un tel refus rejoint désormais le message général visible, avec son test.
- La revue Standards a relevé qu’une exception inattendue, convertie par une assertion de type en `ErreurApplication`, produisait un message vide. `interpreterEchecCreation` accepte maintenant `unknown` et vérifie la forme de l’erreur ; tout autre jet est traité comme un sort inconnu.
- La revue Standards a relevé l’absence d’état accessible sur un champ en erreur. Les attributs `aria-invalid` et `aria-describedby`, transmis au DOM par `react-native-web`, ont été ajoutés avec l’identifiant du message.
- La revue Spec a relevé qu’une panne serveur `500` était présentée comme une indisponibilité, donc comme une absence de création. Seul un `503` propose désormais un réessai ; les autres échecs sans réponse exploitable sont présentés comme un sort inconnu, avec leurs tests.
- La revue Spec a relevé que « Vérifier dans le fonds » quittait le formulaire sans confirmation, en perdant la saisie conservée. Ce départ et celui du bouton du toast passent maintenant par la même confirmation d’abandon.
- La revue Spec a relevé que « Retour au fonds » était verrouillé pendant l’envoi, alors que la spécification ne verrouille que les champs et la soumission. Le verrou a été retiré de ce bouton.
- La revue Standards a relevé la duplication de l’union de résultat et une cascade de correspondance lossy entre `resultat-creation.ts` et la vue, ainsi que le fil de la propriété `ajouterOuvrage` à travers cinq composants du fonds. L’union a été réduite à trois cas et `FondsView` compose désormais un cadre et un contenu, comme `FicheView`.

### Vérification navigateur

Réalisée avec Chrome piloté depuis la session, contre `npx expo start --web` et l’API locale sans authentification, base de 500 livres :

- « Ajouter un ouvrage » est présent dans l’en-tête du fonds et ouvre `/ouvrages/nouveau` avec une année vide et le statut « Non lu » ;
- une soumission vide affiche « Le titre est obligatoire. », « L’auteur est obligatoire. » et « L’année de publication est obligatoire. » sans requête réseau ;
- une saisie valide sans éditeur crée l’ouvrage : `GET /books?q=…` sur l’API montre l’enregistrement avec `editeur` à chaîne vide, `annee` numérique et `lu` à `false` ;
- après succès, le formulaire est vidé, le statut revient à « Non lu », aucune redirection n’a lieu et le toast affiche « Ouvrir la fiche » ;
- le toast reste affiché après neuf secondes de survol continu, puis disparaît dans les cinq secondes qui suivent la sortie du curseur ;
- une saisie modifiée puis « Retour au fonds » affiche la confirmation d’abandon en conservant les valeurs ; « Abandonner la saisie » revient au fonds, et le retour depuis `/?page=3` conserve cette page ;
- transport simulé dans la page pour le seul `POST` : une réponse `503` affiche « Service temporairement indisponible. Votre saisie est conservée. » avec un réessai temporisé, et une requête rejetée affiche l’avertissement de création peut-être effectuée avec « Vérifier dans le fonds » et « Réessayer malgré le risque de doublon », valeurs conservées ;
- une navigation demandée pendant une saisie modifiée a été bloquée par la boîte « Leave site? » du navigateur, ce qui confirme l’avertissement de départ ;
- aucune erreur ni exception dans la console.

Après les corrections issues des revues, la vérification a été refaite : une saisie commencée après une création confirmée déclenche de nouveau la confirmation d’abandon.

Trois ouvrages de recette créés pendant ces vérifications restent dans la base locale de l’API : « Recette Navigateur Lot 1 », « Recette Toast Survol » et « Recette Reprise Saisie ».

