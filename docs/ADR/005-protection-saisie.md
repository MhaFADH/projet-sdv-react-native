# ADR 005 — Protection de la saisie et créations au résultat incertain

## Statut

Accepté lors du cadrage du lot 1, non implémenté. Ce document ne vaut pas autorisation de démarrer l’implémentation.

## Contexte

Le réseau peut échouer pendant l’enregistrement d’un ouvrage. Une absence de réponse ne prouve pas que le serveur n’a rien enregistré. La route POST de création ne fournit pas de mécanisme d’idempotence : deux requêtes identiques peuvent créer deux fiches distinctes.

Le principe métier interdit de perdre silencieusement la saisie. Pour le lot 1, l’utilisateur a retenu sa conservation sur erreur et un avertissement avant abandon volontaire, sans demander de brouillons persistants. Il souhaite rester dans le formulaire après succès et le vider uniquement après une création.

## Options réellement envisagées

- Persister des brouillons pour retrouver la saisie après fermeture ou rechargement : non retenu pour le lot 1.
- Conserver la saisie dans le formulaire et avertir avant un abandon volontaire : retenu, avec une limite explicite après fermeture involontaire ou arrêt brutal.
- Réessayer automatiquement une création dont le résultat est inconnu : non retenu en raison du risque de doublon ; un réessai manuel averti reste possible.
- Rediriger automatiquement vers la fiche après succès : non retenu ; rester dans le formulaire.
- Vider aussi le formulaire après modification : non retenu ; vider uniquement après création confirmée.

## Décision

Gérer le formulaire avec React Hook Form et le même schéma Zod que la validation métier. Conserver tous les champs après une erreur ou un résultat incertain.

- Afficher les erreurs 422 sur les champs concernés. Pour une indisponibilité 503, proposer un réessai temporisé sans effacer la saisie.
- Verrouiller les champs et la soumission pendant l’envoi, jusqu’au succès ou à l’erreur. Cela évite qu’une réponse tardive déclenche le vidage d’une nouvelle saisie commencée pendant la requête.
- Après création confirmée, rester dans le formulaire, vider les champs et remettre le statut à « Non lu ».
- Après modification confirmée, rester avec les valeurs enregistrées, sans changements en attente.
- Demander confirmation avant un abandon volontaire de saisie. Sur navigateur, l’avertissement de fermeture reste soumis aux limites de la plateforme ; il ne constitue pas une sauvegarde.

Pour une création au résultat incertain, ne pas déclencher de réessai automatique. Conserver les valeurs, expliquer que l’ouvrage a peut-être été créé et proposer une vérification ou un réessai manuel averti du risque de doublon. Ne jamais présenter l’absence de réponse comme une preuve d’absence d’enregistrement.

Aucun brouillon persistant ni acceptation d’écriture hors ligne n’est prévu dans ce lot.

## Conséquences

- Une erreur ne force pas le libraire à ressaisir son formulaire et n’est pas confondue avec un succès.
- Le verrouillage pendant l’envoi suspend temporairement la saisie, mais évite les doubles soumissions et le vidage de modifications plus récentes.
- La récupération après fermeture involontaire, rechargement sans protection effective ou arrêt brutal n’est pas garantie. Cette limite est acceptée ; aucune promesse de conservation durable n’est faite.
- Le réessai manuel d’une création incertaine peut encore produire un doublon. Désactiver le bouton pendant l’envoi ne rend pas le POST idempotent.
- Les tests devront couvrir la conservation des valeurs sur erreur, le verrouillage pendant l’envoi, le vidage après création seulement et l’absence de réessai automatique d’une création incertaine. Ils ne sont pas encore implémentés.

## Références

- [Cadrage du lot 1](../LOT-1.md), Q4, Q8, Q10, Q11 et Q12.
- [Instructions du projet](../../AGENTS.md), formulaire, validation et gestion des erreurs.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), création et erreurs 422/503.
- [Routes effectives de l’API](../../../api-books-v2-/api-books-v2/src/routes-livres.js), création sans contrôle de doublon.
- [MDN — beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event), limites des avertissements de fermeture.
