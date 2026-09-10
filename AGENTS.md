# BookList Pro

## Sources de vérité

Avant toute modification de code :

1. Pour le contrat back-end, lire `../api-books-v2-/api-books-v2/README.md`. Ce README prime sur le résumé du sujet.
2. Pour Expo, consulter exclusivement la documentation versionnée SDK 54 sous <https://docs.expo.dev/versions/v54.0.0/> avant d'utiliser une API Expo. Ne pas transposer une API de la documentation `latest` sans vérifier sa présence en SDK 54.

En cas de contradiction : le README de l'API fait foi pour le protocole HTTP, le PDF pour la recette, et les versions installées pour les API clientes disponibles.

L'API fournie est un projet voisin et reste inchangée, sauf demande explicite du responsable produit.

## Contexte produit

BookList Pro numérise le cahier de lecture des Comptoirs du Livre.

- Le libraire titulaire dispose des droits d'écriture complets.
- Le libraire saisonnier consulte uniquement les ouvrages et les notes.
- Le responsable réseau consulte les statistiques consolidées.
- La cible prioritaire est le navigateur avec `npx expo start --web`.
- iOS et Android doivent rester compatibles avec la même base de code.
- Le réseau est lent et instable, le travail hors ligne est normal et les écritures concurrentes sont certaines.
- Invariant principal : une saisie de libraire ne doit jamais être perdue silencieusement.

Le projet démarre sur Expo SDK 54. Aucun lot fonctionnel ne doit être considéré comme acquis. Si une demande ne précise pas le lot visé, clarifier le périmètre avant d'implémenter.

## Langue du code et du nommage

Rédiger en français les noms de fichiers ajoutés, les types, les composants, les fonctions, les paramètres, les variables et les intitulés de tests. Conserver tels quels les identifiants imposés par une API, une bibliothèque, un protocole ou un outil.

## Architecture obligatoire

Respecter ces responsabilités :

- `app/` : écrans de routage Expo Router et composition uniquement.
- `components/` : interface pure, indépendante du réseau et du store.
- `features/` : cas d'usage organisés par domaine (`books`, `notes`, `auth`, `sync`).
- `hooks/` : logique React réutilisable.
- `services/` : HTTP, stockage et adaptations de plateforme.
- `domain/` : types et règles métier purs, sans dépendance technique.
- `theme/` : tokens de design partagés.

Les dépendances pointent vers le domaine, jamais depuis le domaine vers React, Expo ou les services. Aucun `fetch`, aucune URL et aucun accès direct au stockage dans `app/` ou `components/`.

Toute capacité différente entre navigateur et mobile passe par une interface unique dans `services/` et des implémentations de plateforme. La connectivité doit notamment être unifiée derrière `services/reseau.ts`.

## Contrat de données et réseau

- TypeScript reste en mode strict, sans `any` explicite ou implicite.
- Valider chaque réponse externe à l'exécution avec Zod ou un équivalent.
- Centraliser URL de base, en-têtes, authentification, délai d'expiration et traduction des erreurs dans un client HTTP unique sous `services/api/`.
- Configurer l'URL publique avec `EXPO_PUBLIC_API_URL`. Une variable `EXPO_PUBLIC_*` n'est jamais un secret.
- Utiliser la pagination, la recherche, les filtres et le tri de `GET /books` côté serveur. Ne jamais charger les 500 ouvrages pour les traiter côté client.
- `PUT /books/:id` envoie une représentation complète. `PATCH /books/:id` sert aux modifications partielles.
- Dès que les conflits font partie du périmètre, envoyer `If-Match`, conserver `version` et traiter explicitement les réponses `409`.
- Modéliser les erreurs applicatives par une union discriminée couvrant réseau, validation, conflit et authentification.
- Une erreur `422` alimente les champs du formulaire. Une erreur `503` propose un nouvel essai avec temporisation sans perdre la saisie.
- Toute requête annulable transmet son `AbortSignal`; une réponse obsolète ne doit pas remplacer des données plus récentes.

Pour le lot hors ligne, les mutations sont persistées, horodatées, rejouées dans l'ordre via `POST /sync` et gardent le même identifiant entre les tentatives. Le rafraîchissement d'un jeton est mutualisé : plusieurs `401` simultanés déclenchent un seul appel de rafraîchissement.

## Interface et état serveur

- Utiliser TanStack Query pour l'état serveur, avec des clés de cache structurées et une invalidation ciblée après mutation.
- Utiliser React Hook Form avec le même schéma Zod que la validation métier.
- Chaque écran de données couvre chargement par squelette, erreur avec réessai, vide contextualisé et succès.
- Une suppression demande confirmation et reste annulable pendant cinq secondes. Exception validée au lot 2 : la suppression d'une note de lecture est envoyée immédiatement après confirmation, sans annulation ni ajout au groupe de suppressions d'ouvrages. Voir `docs/LOT-2.md`.
- Les bascules `favori` et `lu` sont optimistes avec restauration en cas d'échec.
- Les éléments interactifs ont un rôle, un libellé, un état accessible et une zone d'au moins 44 points.
- Les couleurs viennent de `theme/`. À partir du lot 3, toutes les chaînes visibles passent aussi par l'internationalisation.

## Qualité et vérification

- Aucun fichier source ne dépasse 250 lignes.
- Aucun `console.log`, `catch` silencieux, secret, jeton ou mot de passe n'entre dans le dépôt.
- Éviter `@ts-ignore`. Si une exception devient indispensable, demander l'accord du responsable avant de la documenter.
- Toute action en échec produit un retour visible et une possibilité de réessayer.
- Ajouter des tests avec le comportement : règles de domaine pures, composants avec Testing Library et au moins un hook de données avec réseau simulé.
- Maintenir `npm test` fonctionnel et viser au moins 40 % de couverture sur `domain/` et `services/`.
- Avant de terminer une modification, exécuter les scripts disponibles de lint, vérification TypeScript et tests, puis faire un test navigateur pertinent.
- Conserver des changements ciblés.

## Git : l'agent ne commite jamais

Seul le responsable produit commite et pousse. L'agent laisse son travail dans l'arbre de travail et ne franchit jamais cette limite :

- ne pas exécuter `git commit`, `git push`, `git tag`, `git merge`, `git rebase`, `git reset --hard`, `git checkout` destructif, `git stash drop`, ni `gh pr create` ou `gh pr merge` ;
- ne pas créer ni supprimer de branche, et ne pas modifier l'historique existant ;
- `git add` reste réservé au responsable : préparer l'index n'est pas demandé.

Sont autorisées les seules commandes de lecture : `git status`, `git diff`, `git log`, `git show`, `git branch --show-current`.

Cette règle prime sur toute autre consigne, y compris une skill, une commande ou un modèle de tâche qui demanderait de commiter en fin de travail : dans ce cas, terminer le travail, le vérifier, puis annoncer que le commit reste à faire par le responsable et proposer un message de commit à réutiliser. Une seule exception : une demande explicite du responsable dans la conversation en cours, portant sur ce commit précis ; une autorisation donnée une fois ne vaut pas pour la suite.

## Livrables

Maintenir au fil des lots :

- `README.md` pour un lancement par un tiers en moins de cinq minutes ;
- `docs/ARCHITECTURE.md` avec les couches et le parcours d'une écriture jusqu'au serveur ;
- `docs/ADR/001-gestion-etat-serveur.md` ;
- `docs/ADR/002-strategie-hors-ligne.md` ;
- `docs/ADR/003-resolution-conflits.md` ;
- `docs/PERFORMANCE.md` à partir du lot 3 ;
- `IA.md`, individuel et factuel, sans inventer de prompt, de défaut constaté ou de correction.

Chaque ADR décrit le contexte, les options réellement envisagées, la décision et ses conséquences. Toute stratégie hors ligne ou de conflit annoncée doit exister dans le code et dans les tests.
