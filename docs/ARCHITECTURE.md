# Architecture de BookList Pro

## Couches

Les dépendances vont de la composition vers le domaine et les services. Le domaine ne dépend ni de React, ni d’Expo, ni du réseau.

| Couche | Responsabilité livrée dans les tickets #2 et #3 |
| --- | --- |
| `app/` | Compose Expo Router, TanStack Query, le thème clair et l’ErrorBoundary global. Détient la page consultée dans l’URL et déclenche les navigations. |
| `features/books/` | Transforme l’état des hooks en états de présentation, pour le fonds paginé comme pour la fiche. |
| `hooks/` | Décrit les requêtes TanStack Query, leurs clés de cache, leur annulation, leur réessai temporisé et la réactualisation au retour. |
| `components/` | Affiche des props sans connaître le réseau ni le cache. Les états de chargement, d’erreur et d’absence sont mutualisés dans `components/etats-donnees.tsx`. |
| `services/api/` | Construit les requêtes, applique les en-têtes et le délai d’expiration, traduit les erreurs, valide les réponses et porte la politique de réessai. |
| `domain/` | Définit l’ouvrage, l’enveloppe paginée et les constantes métier sans dépendance technique. |
| `theme/` | Centralise couleurs, espacements, typographie et dimensions accessibles. |

## Parcours de consultation livré

1. `app/index.tsx` compose `FondsScreen` sans appel réseau : il lit la page demandée dans l’URL et fournit les navigations.
2. `FondsScreen` traduit l’état de `useBooksPage` en états de présentation et demande un changement de page à la route.
3. Le hook crée une clé de cache contenant la page, la limite de vingt, le champ de tri et l’ordre.
4. TanStack Query fournit un `AbortSignal` à `fetchBooksPage`. Un changement de page annule la requête devenue inutile et chaque page conserve une entrée de cache distincte.
5. `clientHttp` lit `EXPO_PUBLIC_API_URL`, ajoute les en-têtes communs, construit les paramètres et applique un délai d’expiration de dix secondes.
6. `books-api.ts` valide avec Zod l’enveloppe, les ouvrages, les identifiants, les dates, les versions et les autres champs serveur.
7. Une réponse valide rejoint le cache de sa clé. Une réponse invalide ou une erreur HTTP devient une erreur applicative discriminée, jamais une donnée fictive.
8. `FondsView` reçoit un état de chargement, d’erreur ou de succès. Il réserve l’état « fonds vide » à un total serveur nul et borne les commandes avec les métadonnées serveur.
9. Si une écriture concurrente fait disparaître la page demandée, `FondsScreen` revient à la dernière page indiquée par le serveur. L’état transitoire conserve une commande « Précédent » au lieu de présenter tout le fonds comme vide.

Une réponse de page ancienne ne remplace pas la page actuellement demandée : les clés sont distinctes et TanStack Query annule l’observation précédente.

## Parcours de la fiche livré

1. Chaque ouvrage de la liste est un bouton accessible. `app/index.tsx` reçoit son identifiant et pousse `/ouvrages/[id]`.
2. `app/ouvrages/[id].tsx` lit l’identifiant de route et compose `FicheScreen`, sans URL ni appel réseau.
3. `useBook` interroge `GET /books/:id` sous la clé `['ouvrages', 'fiche', id]`, distincte des clés de liste et paramétrée par l’identifiant. Les clés vivent dans `hooks/cles-ouvrages.ts`.
4. `fetchBook` valide la réponse avec le même schéma Zod que les éléments de liste et refuse une fiche dont l’identifiant n’est pas celui demandé : identifiant, dates, `version`, `favori`, `note` et `couverture` traversent l’adaptation sans être perdus, et un éditeur vide accepté par le contrat reste valide.
5. Un changement rapide de fiche annule la requête précédente par son `AbortSignal`. Chaque identifiant conservant sa propre entrée de cache, une réponse ancienne ne peut pas remplacer la fiche courante.
6. Un identifiant de route vide n’engage aucune requête et présente directement l’absence. Un `404` devient l’erreur applicative `introuvable`. La fiche présente alors une absence contextualisée, sans chargement infini, sans réessai automatique et sans succès fictif.
7. Les autres échecs restent des erreurs réseau ou de validation : un seul réessai automatique temporisé, puis une action « Réessayer » visible.

## Retour au fonds

La page consultée est portée par le paramètre d’URL `page` de la route racine, lu par `lireNumeroPage` dans `domain/`. Une valeur inutilisable retombe sur la première page.

Le retour depuis une fiche ne démonte pas l’écran du fonds : `useRafraichirFondsAuFocus` invalide la clé de la page consultée à chaque nouveau focus, jamais au premier affichage. La page revient donc actualisée. Si le fonds a diminué au point de faire disparaître cette page, `FondsScreen` demande la dernière page annoncée par le serveur, comme lors d’une pagination classique.


## Erreurs et reprise

L’union `ErreurApplication` couvre les catégories réseau, validation, introuvable, conflit et authentification. Les tickets #2 et #3 utilisent effectivement les erreurs réseau, de validation et d’absence. Les catégories conflit et authentification ne déclenchent encore aucun parcours fonctionnel.

Une erreur réseau réessayable reçoit un seul nouvel essai automatique après une seconde. Si elle persiste, l’interface expose « Réessayer ». Une erreur de rendu React remonte à l’ErrorBoundary exporté par la racine Expo Router, qui présente également une action de reprise.

## Parcours d’une écriture

Aucune écriture n’est livrée dans les tickets #2 et #3. La fiche est en lecture seule, les formulaires ne sont pas simulés et aucun composant ne déclenche POST, PUT, PATCH ou DELETE.

Pour les tickets qui introduiront ces capacités, le chemin imposé sera : route de composition → cas d’usage dans `features/` → mutation TanStack Query → service `services/api/` → API. La validation métier précédera l’appel, la réponse externe sera validée à son retour et l’invalidation du cache restera ciblée. Ce paragraphe décrit une contrainte d’architecture future, pas un fonctionnement actuel.

## Adaptation de plateforme

Les parcours livrés utilisent les interfaces communes de React Native, le transport `fetch` et le routage Expo Router. La page consultée voyageant dans l’URL, le retour navigateur et le retour de pile mobile aboutissent au même état. Aucune capacité spécifique à une plateforme n’est nécessaire dans ces tickets. Toute divergence future passera par une interface sous `services/`, conformément aux consignes du projet.
