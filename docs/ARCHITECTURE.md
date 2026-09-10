# Architecture de BookList Pro

## Couches

Les dépendances vont de la composition vers le domaine et les services. Le domaine ne dépend ni de React, ni d’Expo, ni du réseau.

| Couche | Responsabilité livrée dans le ticket #2 |
| --- | --- |
| `app/` | Compose Expo Router, TanStack Query, le thème clair et l’ErrorBoundary global. |
| `features/books/` | Transforme l’état du hook en états de présentation et pilote le numéro de page demandé. |
| `hooks/` | Décrit la requête TanStack Query, sa clé paramétrée, son annulation et son réessai temporisé. |
| `components/` | Affiche des props sans connaître le réseau ni le cache. |
| `services/api/` | Construit les requêtes, applique les en-têtes et le délai d’expiration, traduit les erreurs et valide les réponses. |
| `domain/` | Définit l’ouvrage, l’enveloppe paginée et les constantes métier sans dépendance technique. |
| `theme/` | Centralise couleurs, espacements, typographie et dimensions accessibles. |

## Parcours de consultation livré

1. `app/index.tsx` compose `FondsScreen` sans URL ni appel réseau.
2. `FondsScreen` conserve uniquement la page demandée et appelle `useBooksPage`.
3. Le hook crée une clé de cache contenant la page, la limite de vingt, le champ de tri et l’ordre.
4. TanStack Query fournit un `AbortSignal` à `fetchBooksPage`. Un changement de page annule la requête devenue inutile et chaque page conserve une entrée de cache distincte.
5. `clientHttp` lit `EXPO_PUBLIC_API_URL`, ajoute les en-têtes communs, construit les paramètres et applique un délai d’expiration de dix secondes.
6. `books-api.ts` valide avec Zod l’enveloppe, les ouvrages, les identifiants, les dates, les versions et les autres champs serveur.
7. Une réponse valide rejoint le cache de sa clé. Une réponse invalide ou une erreur HTTP devient une erreur applicative discriminée, jamais une donnée fictive.
8. `FondsView` reçoit un état de chargement, d’erreur ou de succès. Il réserve l’état « fonds vide » à un total serveur nul et borne les commandes avec les métadonnées serveur.
9. Si une écriture concurrente fait disparaître la page demandée, `FondsScreen` revient à la dernière page indiquée par le serveur. L’état transitoire conserve une commande « Précédent » au lieu de présenter tout le fonds comme vide.

Une réponse de page ancienne ne remplace pas la page actuellement demandée : les clés sont distinctes et TanStack Query annule l’observation précédente.

## Erreurs et reprise

L’union `ErreurApplication` couvre les catégories réseau, validation, conflit et authentification prévues par le contrat qualité. Le ticket #2 utilise effectivement les erreurs réseau et de validation. Les catégories conflit et authentification ne déclenchent encore aucun parcours fonctionnel.

Une erreur réseau réessayable reçoit un seul nouvel essai automatique après une seconde. Si elle persiste, l’interface expose « Réessayer ». Une erreur de rendu React remonte à l’ErrorBoundary exporté par la racine Expo Router, qui présente également une action de reprise.

## Parcours d’une écriture

Aucune écriture n’est livrée dans le ticket #2. La fiche et les formulaires ne sont pas simulés et aucun composant ne déclenche POST, PUT, PATCH ou DELETE.

Pour les tickets qui introduiront ces capacités, le chemin imposé sera : route de composition → cas d’usage dans `features/` → mutation TanStack Query → service `services/api/` → API. La validation métier précédera l’appel, la réponse externe sera validée à son retour et l’invalidation du cache restera ciblée. Ce paragraphe décrit une contrainte d’architecture future, pas un fonctionnement actuel.

## Adaptation de plateforme

Le parcours livré utilise les interfaces communes de React Native et le transport `fetch`. Aucune capacité spécifique au navigateur ou au mobile n’est nécessaire dans ce ticket. Toute divergence future passera par une interface sous `services/`, conformément aux consignes du projet.
