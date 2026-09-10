# ADR 005 — Protection de la saisie et créations au résultat incertain

## Statut

Accepté lors du cadrage du lot 1. Implémenté pour la création d’un ouvrage par le ticket #4, pour sa correction par le ticket #5 et étendu à l’ajout d’une note de lecture par le ticket #17.

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
- Les tests couvrent, pour la création, les limites des champs, le succès, le refus `422` par champ, l’indisponibilité `503` avec temporisation, la coupure et le délai d’expiration dépassé, l’absence de réessai automatique, le verrouillage pendant l’envoi, la double soumission empêchée, l’abandon confirmé, la remise à vide après création seulement et le toast avec ses suspensions sous horloge contrôlée.

## État de l’implémentation

Le ticket #4 livre ces décisions pour la création :

- schéma `domain/saisie-ouvrage.ts` partagé entre React Hook Form et les règles métier ;
- champs et soumission verrouillés pendant l’envoi, avec un verrou de rendu contre la double soumission ;
- refus `422` reportés sur les champs, `503` réessayable après temporisation, valeurs jamais effacées ;
- résultat inconnu — coupure ou délai d’expiration sans statut HTTP — présenté comme tel, avec vérification du fonds ou réessai manuel averti du risque de doublon ;
- confirmation avant abandon volontaire et avertissement `beforeunload` via `services/plateforme/avertissement-depart`, sans brouillon persistant ni récupération après arrêt brutal ;
- après création confirmée : maintien dans le formulaire, champs vidés, statut remis à « Non lu », aucune redirection automatique.

Le ticket #5 livre ces décisions pour la correction, en réutilisant le même formulaire par `features/books/use-saisie-ouvrage.ts` :

- préremplissage depuis `GET /books/:id`, avec chargement, échec de lecture et ouvrage introuvable traités sans proposer de création ;
- envoi partiel en `PATCH /books/:id` des seuls champs modifiés, afin de ne pas écraser les champs serveur non concernés ;
- champs et soumission verrouillés pendant l’envoi, protections d’abandon et de double soumission inchangées ;
- refus `422` par champ, `503` réessayable après temporisation, résultat inconnu conservant la saisie ; un réessai rejoue la même correction sur le même ouvrage et ne peut pas créer de doublon ;
- après correction confirmée : maintien dans le formulaire avec les valeurs enregistrées, sans changements en attente, sans vidage ni retour arbitraire à « Non lu » ;
- une réactualisation de la fiche ne réécrit pas les champs et son échec ne remplace pas le formulaire : celui-ci est monté une fois par identifiant et garde la saisie du libraire ;
- une soumission identique à la fiche n’envoie aucune écriture et l’annonce, plutôt que d’écrire une représentation vide ou de simuler un succès.

Le ticket #17 étend ces décisions à l’ajout d’une note de lecture, sans créer de second socle d’écriture :

- schéma `domain/saisie-note.ts` partagé entre React Hook Form et les règles métier, aligné sur le validateur de l’API : contenu obligatoire après retrait des espaces périphériques et 1 000 caractères au maximum ;
- compteur de caractères mesurant la longueur réellement envoyée, donc le contenu normalisé et non la frappe brute ;
- `POST /books/:id/notes` n’étant pas idempotent, aucun réessai automatique : la mutation est déclarée `retry: false` comme la création d’ouvrage ;
- champ et soumission verrouillés pendant l’envoi, verrou de rendu contre la double soumission ;
- refus `422` reporté sur le champ `contenu`, `503` réessayable après temporisation, saisie jamais effacée ;
- un `404` sur la fiche est une réponse concluante : l’envoi est bloqué et expliqué, mais le texte reste affiché pour être recopié ;
- coupure ou délai d’expiration dépassé présentés comme un résultat incertain, avec actualisation des notes pour vérifier et renvoi manuel averti du risque de doublon ; l’avertissement précise qu’une note au contenu identique ne prouve pas que le premier envoi a abouti et que son absence ne prouve pas un refus ;
- après ajout confirmé : maintien sur la fiche, champ vidé, nouvelle note affichée en tête et confirmation par le même toast de cinq secondes que le lot 1 ;
- confirmation avant abandon volontaire, que le départ vienne du bouton « Effacer la saisie » ou du retour au fonds, et avertissement `beforeunload` par la même interface de plateforme ; la section des notes reste montée dans tous les états où une saisie peut exister, sans quoi cette confirmation serait démontée et le retour au fonds resterait sans effet visible ;
- l'abandon d'une note se décide sur un contenu réellement renseigné, et non sur `formState.isDirty` comme pour les ouvrages : une note tapée puis entièrement effacée ne déclenche plus de confirmation, puisqu'il n'y a plus rien à perdre. Le contenu est de toute façon observé en continu pour le compteur de caractères ;
- la saisie est détenue par l’écran de la fiche : ni une actualisation des notes, ni un échec de lecture, ni le masquage d’un ouvrage en attente de suppression ne la remplace ou ne l’efface. Dans les deux cas où l’envoi est suspendu — ouvrage disparu, ouvrage masqué jusqu’au résultat de sa suppression — le texte reste affiché et modifiable, et la raison est énoncée ; seule la soumission est désactivée.

Les limites du lot 1 restent inchangées : aucun brouillon persistant, aucune récupération après arrêt brutal, aucune écriture synchronisée hors ligne.

## Références

- [Cadrage du lot 1](../LOT-1.md), Q4, Q8, Q10, Q11 et Q12.
- [Instructions du projet](../../AGENTS.md), formulaire, validation et gestion des erreurs.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), création, notes et erreurs 422/503.
- [Routes effectives de l’API](../../../api-books-v2-/api-books-v2/src/routes-livres.js), création et `POST /books/:id/notes` sans contrôle de doublon.
- [MDN — beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event), limites des avertissements de fermeture.
