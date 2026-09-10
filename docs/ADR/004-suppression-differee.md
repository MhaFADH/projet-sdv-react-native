# ADR 004 — Suppression différée et annulation groupée

## Statut

Accepté et implémenté pour la suppression directe depuis les fiches dans le ticket #7. La sélection depuis la liste reste hors de ce ticket.

## Contexte

Le sujet exige une confirmation et cinq secondes d’annulation. L’API supprime immédiatement un ouvrage lorsqu’elle traite son DELETE et ne fournit pas de restauration. Recréer une fiche après suppression ne restituerait pas son identité et ses relations à l’identique.

Le parcours retenu doit permettre plusieurs suppressions successives tout en conservant un seul compte à rebours visible. La navigation interne ne doit pas faire disparaître l’accès à l’annulation.

## Options réellement envisagées

- Supprimer immédiatement puis recréer pour annuler : écarté, car ce n’est pas une restauration de la même ressource.
- N’autoriser qu’une suppression en attente à la fois : proposé, puis remplacé par le fonctionnement groupé.
- Envoyer immédiatement les suppressions précédentes lorsqu’une nouvelle arrive : écarté, car cela raccourcit leur fenêtre d’annulation sous les cinq secondes exigées.
- Conserver des délais et des annulations indépendants par ouvrage : non retenu au profit d’un compteur commun.
- Regrouper les suppressions non envoyées et remettre leur délai commun à cinq secondes à chaque ajout : retenu.
- Proposer un bouton de suppression par ligne : remplacé par une sélection avec action groupée, plus cohérente avec ce fonctionnement.

## Décision

Le ticket #7 conserve une action directe sur la fiche détaillée, mais aucune action de suppression dans le formulaire. La sélection groupée depuis la liste sera livrée séparément et n’est pas annoncée comme disponible ici.

Une confirmation récapitule les ouvrages concernés. Après confirmation, les masquer temporairement et les ajouter au groupe en attente. Chaque ajout confirmé remet le compteur commun à cinq secondes ; les premiers ouvrages peuvent donc rester annulables plus longtemps, jamais moins de cinq secondes.

Un bandeau global non bloquant indique le nombre d’ouvrages concernés, le délai, le warning et l’action « Annuler tout ». Cette action abandonne toutes les suppressions non envoyées du groupe et restaure leur affichage. Le bandeau reste accessible lors d’une navigation interne et n’est pas remplacé par un toast de succès.

À expiration du délai commun, envoyer le DELETE de chaque ouvrage. Le groupe est une coordination côté client, pas une transaction atomique fournie par l’API. Désactiver les nouvelles suppressions jusqu’au résultat du groupe, en laissant la consultation et les autres actions disponibles.

En cas d’échec partiel, conserver les suppressions réussies, réafficher uniquement les ouvrages en échec et présenter un message persistant avec leurs titres et une action de réessai. Le réessai repasse par la confirmation et le délai d’annulation. Ne pas simuler le retour arrière d’une suppression serveur déjà réalisée.

Fermer ou recharger le document avant l’envoi abandonne les intentions non envoyées. Ne pas forcer leur envoi au départ du navigateur. Une fois une requête partie, son annulation côté client ne garantit pas l’annulation de la suppression côté serveur ; le warning du bandeau explicite cette limite.

## Conséquences

- L’annulation précède l’écriture irréversible ; elle ne nécessite aucune recréation ni modification de l’API.
- Une nouvelle suppression prolonge l’attente des ouvrages précédents. L’action d’annulation porte sur le groupe entier, pas uniquement sur le dernier ouvrage.
- Les intentions non envoyées ne survivent pas à un rechargement ; ce mécanisme n’est pas une file de mutations persistante ou hors ligne.
- Les DELETE peuvent produire des résultats différents au sein du groupe. Aucun retour arrière atomique du groupe n’est promis.
- Les règles pures et le parcours avec transport simulé vérifient le délai commun, sa remise à cinq secondes, l’annulation totale, l’absence d’envoi anticipé, les résultats partiels et le réessai ciblé.
- Le groupe vit uniquement dans le provider React racine : la navigation interne le conserve, tandis qu’une fermeture ou un rechargement l’abandonne sans forcer de DELETE.

## Références

- [Cadrage du lot 1](../LOT-1.md), Q3, Q9, Q16 et Q18 à Q20.
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), route DELETE des ouvrages.
- [Routes effectives de l’API](../../../api-books-v2-/api-books-v2/src/routes-livres.js), suppression et absence de restauration.
- [MDN — beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event), événement non garanti et dialogue annulable.
- [MDN — Request.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive), maintien d’une requête déjà initiée, sans garantie de résultat serveur.
