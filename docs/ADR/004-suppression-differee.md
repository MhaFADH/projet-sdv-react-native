# ADR 004 — Suppression différée et annulation groupée

## Statut

Accepté et implémenté pour la suppression directe depuis les fiches dans le ticket #7 et pour la sélection depuis la liste dans le ticket #8. Le ticket #19 ajoute une exception explicitement validée pour les notes de lecture, sans modifier ce mécanisme.

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

Le ticket #7 conserve une action directe sur la fiche détaillée, mais aucune action de suppression dans le formulaire. Le ticket #8 ajoute dans la liste une case à cocher par ouvrage et une barre « N sélectionnés — Supprimer ». Cette sélection contient uniquement les ouvrages visibles de la page, vingt au maximum, et revient à zéro à chaque changement de page. Son action est indisponible sans sélection et pendant l’envoi du groupe.

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
- La sélection de liste reste locale à `FondsScreen` et ne traverse jamais une page ; seule sa confirmation transmet les ouvrages au groupe global existant.

## Exception validée pour les notes de lecture

Le lot 2 arbitre différemment la suppression d'une note. Cette exception est un choix produit explicitement validé, décrit dans [le cadrage du lot 2](../LOT-2.md) ; elle ne change rien aux suppressions d'ouvrages.

- Une note demande confirmation, puis son DELETE part immédiatement. Aucun délai de cinq secondes, aucune action d'annulation, aucune recréation destinée à simuler une restauration serveur. La confirmation le dit explicitement avant l'envoi.
- La confirmation identifie la note par sa date et un extrait de son contenu. La date seule ne suffit pas : deux notes d'un même ouvrage peuvent partager la même minute.
- Les notes n'entrent jamais dans le groupe global des ouvrages. Elles ne remettent pas son échéance commune à cinq secondes, ne modifient pas son compteur, et « Annuler tout » ne les restaure pas. Le bandeau et les suppressions d'ouvrages déjà programmées conservent intégralement leur fonctionnement.
- L'état de l'envoi est visible sur la note concernée et une seconde soumission de la même note est écartée ; les autres notes restent actionnables pendant un envoi lent.
- Un échec produit un retour visible attaché à la note, avec une reprise toujours offerte : temporisation avant réessai sur `503`, reprise immédiate sur un refus concluant. Une action en échec n'est jamais laissée bloquée. Chaque note a sa propre temporisation : supprimer une note ne raccourcit ni n'annule le compte à rebours d'une autre.
- Une réponse perdue reste un résultat incertain : la note a peut-être été supprimée. L'interface ne prétend pas que le serveur n'a rien supprimé et n'annonce aucune restauration sans preuve ; elle propose d'actualiser les notes pour vérifier avant tout nouvel envoi.
- Le contrat documentant `204 | 404` pour cette route, un `404` est traité comme une issue et non comme un échec : l'intention est satisfaite, la liste est actualisée et l'action ne devient pas un blocage permanent.

### Pourquoi cette différence est tenable

Une note est une observation textuelle courte et collective, dont le contenu peut être ressaisi après confirmation. Elle ne porte ni auteur, ni version, ni relations documentées au-delà de son ouvrage, contrairement à la fiche d’un ouvrage qui porte identité, version et données bibliographiques. Le coût d’une suppression accidentelle est donc borné par la confirmation seule, là où un ouvrage justifie la fenêtre d’annulation du lot 1.

## Références

- [Cadrage du lot 1](../LOT-1.md), Q3, Q9, Q16 et Q18 à Q20.
- [Cadrage du lot 2](../LOT-2.md), section « Suppression des notes : exception validée ».
- [Contrat de l’API](../../../api-books-v2-/api-books-v2/README.md), routes DELETE des ouvrages et des notes.
- [Routes effectives de l’API](../../../api-books-v2-/api-books-v2/src/routes-livres.js), suppression et absence de restauration.
- [MDN — beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event), événement non garanti et dialogue annulable.
- [MDN — Request.keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive), maintien d’une requête déjà initiée, sans garantie de résultat serveur.
