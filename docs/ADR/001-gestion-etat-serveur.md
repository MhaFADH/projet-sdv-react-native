# ADR 001 — Gestion de l’état serveur

## Statut

Accepté. Implémenté pour les consultations et écritures livrées dans les lots 1 et 2.

## Contexte

La liste et la fiche d’un ouvrage présentent les mêmes données serveur, susceptibles de changer après un ajout, une modification ou une suppression. L’API renvoie une liste paginée et assure le tri : le client ne doit pas télécharger les 500 ouvrages pour effectuer ces opérations localement.

`AGENTS.md` impose TanStack Query, des clés de cache structurées et une invalidation ciblée après mutation. Cette contrainte du projet est plus précise que le sujet, qui permet une alternative justifiée.

## Options réellement envisagées

Aucune bibliothèque alternative n’a été comparée pendant cette session. TanStack Query est un choix imposé, pas le résultat d’une étude comparative. Cet ADR trace cette contrainte et la responsabilité confiée à la bibliothèque, sans inventer d’options évaluées.

## Décision

Confier à TanStack Query l’état serveur des lots 1 et 2 : lectures, cache, états de requêtes et coordination des mutations.

- Distinguer les clés des listes, comprenant page, recherche, filtres et tri, celles des fiches, comprenant l’identifiant de l’ouvrage, et celles des notes de chaque ouvrage.
- Consommer des pages de 20 ouvrages recherchées, filtrées et triées côté serveur.
- Après une mutation, mettre à jour ou invalider uniquement les familles de données concernées.
- Rendre les bascules de lecture et de coup de cœur optimistes par superposition de l’intention locale, avec restauration ciblée et retour visible si elles échouent.
- Faire passer les lectures et écritures par le client HTTP unique de `services/api/`, qui valide les réponses à l’exécution et traduit les erreurs. Les composants et les routes ne connaissent pas directement l’API.
- Transmettre les signaux d’annulation aux lectures annulables et empêcher une réponse obsolète de remplacer des données plus récentes.

La saisie reste un état de formulaire géré avec React Hook Form et le schéma Zod métier ; elle n’est pas remplacée par le cache serveur. Sa conservation et les créations au résultat incertain relèvent de l’ADR 005.

Ce choix n’annonce ni cache persistant ni rejeu hors ligne pour les lots 1 et 2.

## État de l’implémentation

Les tickets #2, #3, #16 et #18 livrent les lectures des ouvrages. `GET /books` utilise une clé contenant `page`, `limit`, `q`, `status`, `favori`, `sort` et `order` ; `GET /books/:id` utilise une clé de fiche par identifiant. Les réponses sont validées avant leur entrée dans le cache, les lectures reçoivent un `AbortSignal` et les anciennes combinaisons de critères ne peuvent pas remplacer la consultation courante.

Les tickets #4 et #5 livrent la création et la correction. La création n’est jamais rejouée automatiquement, alimente la fiche créée et invalide les listes. La correction envoie uniquement les champs modifiés, conserve le formulaire indépendamment des relectures et met à jour la fiche concernée avant l’invalidation des listes.

Les tickets #7 et #8 coordonnent les suppressions d’ouvrages dans un provider racine. Les intentions restent hors du cache pendant les cinq secondes d’annulation. Après les DELETE, seules les fiches supprimées sont retirées et les listes sont invalidées ; les échecs partiels restent ciblés.

Les tickets #15, #17 et #19 ajoutent une clé de notes par ouvrage. La lecture, l’ajout et la suppression ne touchent que cette clé. Le POST d’ajout et le DELETE de suppression ne sont pas rejoués automatiquement lorsqu’une réponse manque ; la saisie et les possibilités de vérification restent dans l’interface.

Le ticket #20 remplace le mécanisme local du ticket #6 par `BasculesProvider`, commun aux cœurs et aux statuts. Une intention est superposée aux ouvrages lus dans les caches sans y écrire d’instantané optimiste. Le verrou porte sur un identifiant dans toutes ses vues, tandis que les autres ouvrages restent disponibles. Un refus retire seulement cette intention ; un succès validé remplace l’ouvrage dans les fiches et pages déjà en cache avant leur invalidation ciblée. Chaque envoi garde sa propre séquence et les indisponibilités réessayables reçoivent un unique réessai après une seconde.

## Conséquences

- La liste et la fiche disposent d’un mécanisme commun de cache et de mise à jour, au lieu de copies de l’état serveur gérées indépendamment par chaque écran.
- La cohérence dépend de clés correctes, d’invalidations ciblées et de restaurations optimistes testées ; la bibliothèque ne remplace pas ces règles applicatives.
- Un cache de données consultées ne constitue pas une sauvegarde de formulaire ni une garantie de fonctionnement hors ligne.
- Les consultations, créations, corrections, suppressions, notes et bascules sont vérifiées avec TanStack Query réel et un transport simulé aux frontières HTTP.

## Références

- [Instructions du projet](../../AGENTS.md).
- [Cadrage du lot 1](../LOT-1.md), Q1, Q2, Q13 et Q17.
- [Cadrage du lot 2](../LOT-2.md), recherche, notes et bascules collectives.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), pagination et routes des ouvrages et des notes.
- [ADR 005 — Protection de la saisie](005-protection-saisie.md).
