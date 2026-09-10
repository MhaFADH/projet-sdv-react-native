# Architecture de BookList Pro

## Couches

Les dépendances vont de la composition vers le domaine et les services. Le domaine ne dépend ni de React, ni d’Expo, ni du réseau.

| Couche | Responsabilité livrée dans les tickets #2, #3 et #4 |
| --- | --- |
| `app/` | Compose Expo Router, TanStack Query, le thème clair et l’ErrorBoundary global. Détient la page consultée dans l’URL et déclenche les navigations. |
| `features/books/` | Transforme l’état des hooks en états de présentation, pour le fonds paginé, la fiche et le formulaire d’ajout. Interprète l’issue d’une création : refus par champ, indisponibilité ou résultat inconnu. |
| `hooks/` | Décrit les requêtes et mutations TanStack Query, leurs clés de cache, leur annulation, leur réessai temporisé, la réactualisation au retour, la durée du toast de succès et la temporisation d’un réessai manuel. |
| `components/` | Affiche des props sans connaître le réseau ni le cache. Les états de chargement, d’erreur et d’absence sont mutualisés dans `components/etats-donnees.tsx`. |
| `services/api/` | Construit les requêtes de lecture et d’écriture, applique les en-têtes et le délai d’expiration, traduit les erreurs, valide les réponses et porte la politique de réessai. |
| `services/plateforme/` | Expose une interface unique par capacité dépendant de la plateforme, avec une implémentation web et une implémentation par défaut. |
| `domain/` | Définit l’ouvrage, l’enveloppe paginée, les constantes métier et le schéma de saisie sans dépendance technique. |
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

L’union `ErreurApplication` couvre les catégories réseau, validation, introuvable, conflit et authentification. Les tickets #2, #3 et #4 utilisent effectivement les erreurs réseau, de validation et d’absence. Les catégories conflit et authentification ne déclenchent encore aucun parcours fonctionnel.

Une erreur réseau réessayable reçoit un seul nouvel essai automatique après une seconde. Si elle persiste, l’interface expose « Réessayer ». Une erreur de rendu React remonte à l’ErrorBoundary exporté par la racine Expo Router, qui présente également une action de reprise.

## Parcours d’une écriture livré : la création d’un ouvrage

Le ticket #4 livre la première écriture. Les autres verbes d’écriture — `PUT`, `PATCH`, `DELETE` — ne sont déclenchés par aucun composant.

1. `app/index.tsx` pousse `/ouvrages/nouveau` depuis l’en-tête du fonds, présent dans tous ses états, y compris le fonds vide. `app/ouvrages/nouveau.tsx` compose l’écran et fournit le retour au fonds et l’ouverture d’une fiche, sans URL ni appel réseau.
2. `FormulaireOuvrageScreen` tient le formulaire avec React Hook Form et le résolveur du schéma `domain/saisie-ouvrage.ts`. Ce même schéma normalise les espaces périphériques, borne les champs à 200 caractères, impose une année entière entre 1450 et l’année civile suivante et un `lu` booléen strict.
3. La soumission valide produit les valeurs normalisées. L’état de la mutation ferme les champs et la soumission jusqu’au résultat : une réponse tardive ne peut donc pas effacer une saisie commencée entre-temps, et un verrou de rendu écarte une seconde soumission accidentelle.
4. `useCreerOuvrage` déclenche la mutation. Elle n’est jamais réessayée automatiquement : `POST /books` n’est pas idempotent et un second envoi créerait un second ouvrage.
5. `createBook` envoie les cinq champs du lot 1 par le client HTTP commun, éditeur vide inclus comme chaîne et jamais comme `null`, puis valide la réponse `201` avec le même schéma Zod que les lectures.
6. En succès, l’ouvrage validé alimente la clé de sa fiche, les clés de liste sont invalidées de manière ciblée par leur préfixe, le formulaire est vidé, le statut revient à « Non lu » et un toast de cinq secondes propose la fiche créée. Aucune redirection automatique n’a lieu ; l’ouvrage reprend sa place dans le tri serveur au prochain chargement de la liste.
7. En échec, `interpreterEchecCreation` distingue trois issues. Un `422` alimente les champs concernés, même sans message général, sans toucher aux valeurs saisies. Une réponse `503` propose un réessai manuel après temporisation. Une requête sans réponse concluante — coupure ou délai d’expiration dépassé, reconnue par l’absence de statut HTTP — est présentée comme un résultat inconnu : l’ouvrage a peut-être été créé, aucun succès n’est annoncé, et le libraire choisit entre vérifier le fonds et réessayer en étant averti du risque de doublon.

## Protection de la saisie

La saisie vit dans le formulaire, jamais dans le cache serveur. Un abandon volontaire d’une saisie modifiée passe par une confirmation rendue dans l’écran. Le départ du document est signalé par `services/plateforme/avertissement-depart`, dont l’implémentation web écoute `beforeunload` et l’implémentation par défaut ne promet rien. Cet avertissement reste soumis aux limites du navigateur : il ne sauvegarde rien, et aucun brouillon persistant ni acceptation d’écriture hors ligne n’est prévu dans ce lot.

## Adaptation de plateforme

Les parcours livrés utilisent les interfaces communes de React Native, le transport `fetch` et le routage Expo Router. La page consultée voyageant dans l’URL, le retour navigateur et le retour de pile mobile aboutissent au même état.

La seule capacité divergente est l’avertissement de départ du document, propre au navigateur. Elle passe par l’interface unique `services/plateforme/avertissement-depart.ts`, dont Metro sélectionne l’implémentation `.web.ts` sur la cible web. Toute divergence future suivra la même règle.
