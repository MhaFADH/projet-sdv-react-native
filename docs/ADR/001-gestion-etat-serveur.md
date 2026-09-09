# ADR 001 — Gestion de l’état serveur

## Statut

Accepté lors du cadrage du lot 1, non implémenté. Ce document ne vaut pas autorisation de démarrer l’implémentation.

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

## Conséquences

- La liste et la fiche disposent d’un mécanisme commun de cache et de mise à jour, au lieu de copies de l’état serveur gérées indépendamment par chaque écran.
- La cohérence dépend de clés correctes, d’invalidations ciblées et de restaurations optimistes testées ; la bibliothèque ne remplace pas ces règles applicatives.
- Un cache de données consultées ne constitue pas une sauvegarde de formulaire ni une garantie de fonctionnement hors ligne.
- L’implémentation devra être vérifiée notamment par un hook de données testé avec une API simulée. Aucun test métier de ce comportement n’existe encore à la rédaction de cet ADR.

## Références

- [Instructions du projet](../../AGENTS.md).
- [Cadrage du lot 1](../LOT-1.md), Q1, Q2, Q13 et Q17.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), pagination et routes des ouvrages.
- [ADR 005 — Protection de la saisie](005-protection-saisie.md).
