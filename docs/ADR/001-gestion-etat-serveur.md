# ADR 001 — Gestion de l’état serveur

## Statut

Accepté. Implémenté partiellement : ticket #2 pour la consultation paginée, ticket #3 pour la fiche, ticket #4 pour la première mutation et son invalidation.

## Contexte

La liste et la fiche d’un ouvrage présentent les mêmes données serveur, susceptibles de changer après un ajout, une modification ou une suppression. L’API renvoie une liste paginée et assure le tri : le client ne doit pas télécharger les 500 ouvrages pour effectuer ces opérations localement.

`AGENTS.md` impose TanStack Query, des clés de cache structurées et une invalidation ciblée après mutation. Cette contrainte du projet est plus précise que le sujet, qui permet une alternative justifiée.

## Options réellement envisagées

Aucune bibliothèque alternative n’a été comparée pendant cette session. TanStack Query est un choix imposé, pas le résultat d’une étude comparative. Cet ADR trace cette contrainte et la responsabilité confiée à la bibliothèque, sans inventer d’options évaluées.

## Décision

Confier à TanStack Query l’état serveur du lot 1 : lectures, cache, états de requêtes et coordination des mutations.

- Distinguer les clés des listes, comprenant leurs paramètres, et celles des fiches, comprenant l’identifiant de l’ouvrage.
- Consommer des pages de 20 ouvrages, triées par titre croissant côté serveur.
- Après une mutation, invalider de manière ciblée les données concernées pour actualiser liste et fiche.
- Rendre la bascule lu/non lu optimiste, avec restauration et retour visible si elle échoue.
- Faire passer les lectures et écritures par le client HTTP unique de `services/api/`, qui valide les réponses à l’exécution et traduit les erreurs. Les composants et les routes ne connaissent pas directement l’API.
- Transmettre les signaux d’annulation aux requêtes annulables et empêcher une réponse obsolète de remplacer des données plus récentes.

La saisie reste un état de formulaire géré avec React Hook Form et le schéma Zod métier ; elle n’est pas remplacée par le cache serveur. Sa conservation et les créations au résultat incertain relèvent de l’ADR 005.

Ce choix n’annonce ni cache persistant ni rejeu hors ligne pour le lot 1.

## État de l’implémentation

Le ticket #2 livre TanStack Query pour `GET /books`, une clé de liste contenant la page, la limite, le tri et l’ordre, ainsi que la transmission du signal d’annulation au client HTTP. Les réponses sont validées à l’exécution avant leur entrée dans le cache. Le hook et l’arrivée tardive d’une ancienne page sont couverts par des tests avec le transport simulé.

Le ticket #3 ajoute la clé de fiche paramétrée par l’identifiant. Le ticket #4 ajoute la première mutation : la création passe par `useMutation` sans réessai automatique, alimente la clé de la fiche créée avec la réponse validée et invalide les clés de liste par leur préfixe commun `['ouvrages', 'liste']`, sans supposer la page d’arrivée d’un ouvrage dans le tri serveur. Ces comportements sont couverts par les tests du parcours d’ajout avec transport simulé.

La bascule optimiste lu/non lu, les mises à jour et les suppressions restent des décisions prévues pour les tickets suivants. Elles ne sont pas présentées comme disponibles dans l’application actuelle.

## Conséquences

- La liste et la fiche disposent d’un mécanisme commun de cache et de mise à jour, au lieu de copies de l’état serveur gérées indépendamment par chaque écran.
- La cohérence dépend de clés correctes, d’invalidations ciblées et de restaurations optimistes testées ; la bibliothèque ne remplace pas ces règles applicatives.
- Un cache de données consultées ne constitue pas une sauvegarde de formulaire ni une garantie de fonctionnement hors ligne.
- Le hook paginé et la mutation de création sont vérifiés avec un transport simulé ; les mutations suivantes devront apporter leurs propres tests d’invalidation et de restauration.

## Références

- [Instructions du projet](../../AGENTS.md).
- [Cadrage du lot 1](../LOT-1.md), Q1, Q2, Q13 et Q17.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), pagination et routes des ouvrages.
- [ADR 005 — Protection de la saisie](005-protection-saisie.md).
