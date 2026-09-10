# Lot 2 — Le cahier de lecture enrichi

## Problem Statement

Les libraires peuvent consulter le fonds et, une fois le lot 1 terminé, tenir ses fiches à jour. Ils ne peuvent pas encore y consigner leurs observations de lecture, distinguer les recommandations de l’équipe ni retrouver rapidement les ouvrages selon leurs critères.

Avec un réseau lent et instable, une action sans retour clair laisse planer le doute : une note a-t-elle été enregistrée ? Un coup de cœur a-t-il réellement changé ? Une recherche affiche-t-elle encore les résultats précédents ? Le libraire doit pouvoir poursuivre son travail sans perdre silencieusement sa saisie ni confondre une intention locale avec un enregistrement confirmé.

## Solution

Enrichir le cahier commun avec des notes de lecture textuelles sur chaque fiche et des coups de cœur collectifs, indépendants du statut de lecture. Permettre de rechercher, filtrer et trier le fonds côté serveur en conservant la pagination de vingt ouvrages.

Les bascules répondent immédiatement, mais leur échec restaure visiblement la valeur précédente. L’ajout d’une note conserve la saisie tant que le serveur n’a pas confirmé son enregistrement. La suppression d’une note demande confirmation puis part immédiatement, sans annulation ; les suppressions d’ouvrages conservent intégralement les règles du lot 1.

Ce lot reste en français, en thème clair, utilisable au clavier et adapté aux petits écrans. Il ne fournit ni authentification, ni sauvegarde durable de brouillons, ni synchronisation hors ligne.

## User Stories

1. En tant que libraire, je veux consulter les notes de lecture d’un ouvrage sur sa fiche, afin de retrouver les observations de l’équipe.
2. En tant que libraire, je veux que les notes concernent l’édition recensée, afin de ne pas confondre deux éditions distinctes.
3. En tant que libraire, je veux voir les notes les plus récentes en premier, afin d’accéder rapidement aux dernières observations.
4. En tant que libraire, je veux voir la date et l’heure de chaque note, afin de situer l’observation dans le temps.
5. En tant que libraire, je veux un état vide contextualisé lorsqu’un ouvrage n’a aucune note, afin de comprendre que je peux ajouter la première.
6. En tant que libraire, je veux distinguer le chargement des notes d’un échec de lecture, afin de savoir si je dois attendre ou réessayer.
7. En tant que libraire, je veux rédiger une note dans un champ multiligne directement sur la fiche, afin de rester dans le contexte de l’ouvrage.
8. En tant que libraire, je veux connaître la limite de 1 000 caractères et disposer d’un compteur, afin d’adapter ma rédaction avant l’envoi.
9. En tant que libraire, je veux soumettre ma note avec une action explicite, afin de décider quand elle est prête à être enregistrée.
10. En tant que libraire, je veux que la saisie et le bouton d’ajout soient verrouillés pendant l’envoi, afin d’éviter les doubles soumissions et l’effacement d’une saisie plus récente.
11. En tant que libraire, je veux voir ma nouvelle note et une confirmation après un succès serveur, afin de savoir qu’elle est enregistrée.
12. En tant que libraire, je veux que le champ soit vidé uniquement après un ajout confirmé, afin de pouvoir rédiger la note suivante sans perdre celle qui attend une réponse.
13. En tant que libraire, je veux retrouver tout mon texte après un échec, afin de pouvoir le corriger ou le renvoyer sans ressaisie.
14. En tant que libraire, je veux voir les erreurs de validation sur le champ concerné, afin de comprendre ce que je dois corriger.
15. En tant que libraire, je veux pouvoir réessayer après une indisponibilité avec temporisation, afin de poursuivre sans multiplier les demandes pendant la panne.
16. En tant que libraire, je veux être averti avant d’abandonner volontairement une note en cours, afin de ne pas perdre mon texte par inadvertance.
17. En tant que libraire, je veux connaître l’absence de sauvegarde durable du brouillon, afin de ne pas croire qu’un rechargement ou un arrêt brutal permettra de le récupérer.
18. En tant que libraire, je veux être averti lorsqu’un ajout a un résultat incertain, afin de ne pas confondre une réponse perdue avec un refus d’enregistrement.
19. En tant que libraire, je veux pouvoir rafraîchir les notes pour vérifier un ajout incertain sans effacer mon texte, afin de décider si un nouvel envoi est nécessaire.
20. En tant que libraire, je veux un avertissement sur le risque de doublon avant de réessayer manuellement un ajout incertain, afin de choisir en connaissance de cause.
21. En tant que libraire, je veux confirmer la suppression d’une note avant son envoi immédiat, afin d’éviter une suppression accidentelle tout en gardant une interaction simple.
22. En tant que libraire, je veux un retour visible et une possibilité de réessayer une suppression en échec, afin de savoir que la note n’a pas été supprimée de façon confirmée.
23. En tant que libraire, je veux conserver l’annulation des suppressions d’ouvrages du lot 1, afin que l’exception des notes ne dégrade pas cette protection.
24. En tant que libraire, je veux marquer ou retirer un coup de cœur depuis la liste ou la fiche, afin de partager les recommandations de l’équipe sans parcours supplémentaire.
25. En tant que libraire, je veux pouvoir recommander un ouvrage non lu, afin de distinguer la recommandation collective du statut de lecture.
26. En tant que libraire, je veux voir le cœur ou le statut changer immédiatement, afin de percevoir que mon action a été prise en compte localement.
27. En tant que libraire, je veux voir la valeur précédente restaurée et une erreur avec réessai si la bascule échoue, afin de ne pas prendre une intention refusée pour une écriture enregistrée.
28. En tant que libraire, je veux que les bascules d’un même ouvrage soient temporairement verrouillées dans toutes ses vues pendant un envoi, afin d’éviter des actions concurrentes ambiguës.
29. En tant que libraire, je veux continuer à consulter et à agir sur les autres ouvrages pendant cet envoi, afin qu’une requête lente ne bloque pas tout le fonds.
30. En tant que libraire, je veux conserver la modification du statut de lecture sur la fiche et dans le formulaire, afin de retrouver le parcours du lot 1 sans ajouter de bascule dans la liste.
31. En tant que libraire, je veux rechercher un titre ou un auteur dans une barre commune, afin de retrouver un ouvrage sans connaître son emplacement dans le fonds.
32. En tant que libraire, je veux une recherche insensible aux accents, afin de retrouver les mêmes ouvrages quelle que soit ma saisie des accents.
33. En tant que libraire, je veux que la recherche attende 300 ms après ma dernière frappe, afin de ne pas lancer une requête pour chaque caractère.
34. En tant que libraire, je veux que les recherches dépassées soient annulées et leurs réponses tardives ignorées, afin de voir les résultats de mon choix actuel.
35. En tant que libraire, je veux filtrer Tous, Lus ou Non lus, afin de consulter le fonds selon son statut collectif de lecture.
36. En tant que libraire, je veux filtrer Tous ou Coups de cœur, afin de retrouver les recommandations de l’équipe.
37. En tant que libraire, je veux cumuler recherche, statut et coups de cœur, afin de préciser ma consultation sans choisir entre ces critères.
38. En tant que libraire, je veux trier par titre, auteur, année ou notation, dans les deux sens, afin de parcourir les résultats dans l’ordre utile à mon travail.
39. En tant que libraire, je veux que le serveur recherche, filtre, trie et pagine l’ensemble du fonds, afin de ne pas être limité aux vingt ouvrages déjà affichés.
40. En tant que libraire, je veux conserver vingt ouvrages par page, les boutons Précédent/Suivant, le numéro de page et le total correspondant aux critères, afin de me repérer dans les résultats.
41. En tant que libraire, je veux revenir à la première page et vider ma sélection de suppression lorsque je change de critères, afin de ne pas agir sur une sélection issue d’un autre résultat.
42. En tant que libraire, je veux distinguer le chargement initial de celui d’une autre page, afin de comprendre ce qui change sans confondre l’attente avec un fonds vide.
43. En tant que libraire, je veux un message adapté lorsqu’aucun ouvrage ne correspond aux critères, afin de distinguer une recherche sans résultat d’un fonds vide.
44. En tant que libraire, je veux retrouver mes critères et ma page actualisée au retour d’une fiche, afin de reprendre ma consultation là où je l’ai laissée.
45. En tant que libraire, je veux être ramené à la dernière page disponible si ma page a disparu, afin de ne pas rester sur une page devenue invalide.
46. En tant que libraire, je veux qu’un ouvrage sortant d’un filtre reste visible pendant sa bascule, puis disparaisse après confirmation et actualisation serveur, afin d’éviter une disparition suivie d’une réapparition en cas d’échec.
47. En tant que libraire utilisant le clavier ou une aide technique, je veux des commandes accessibles avec rôle, libellé et état, afin de réaliser les mêmes parcours.
48. En tant que libraire sur petit écran, je veux des cibles tactiles d’au moins 44 points et une présentation adaptée, afin de consulter et saisir sans commandes difficiles à atteindre.
49. En tant que libraire, je veux une saisie de recherche fluide sans nouveau rendu de toute la liste à chaque frappe, afin de travailler confortablement même avec un fonds important.
50. En tant que membre de l’équipe de développement, je veux un découpage permettant à deux personnes de travailler en parallèle sur des parcours vérifiables, afin de ne pas reproduire une chaîne de tickets qui immobilise l’une des deux.

## Implementation Decisions

### Frontière avec le lot 1 et responsabilités

- Le lot 1 est figé. Cette spécification le complète ; elle ne modifie ni ses tickets ni son contrat. Si son implémentation évolue, adapter le lot 2 et faire revalider les impacts plutôt que rouvrir implicitement le lot 1.
- Réutiliser les modules de consultation du fonds et de fiche, les hooks de données, les clés structurées, le client HTTP, la traduction d’erreurs et les composants de présentation existants. Ajouter le domaine des notes de lecture et son parcours de fiche sans dupliquer le transport ou le cache.
- Les routes composent les écrans ; les composants restent indépendants du réseau et du store ; les cas d’usage coordonnent les services et le domaine. Le domaine reste pur et typé. Les différences de plateforme restent derrière les adaptations de services.
- TanStack Query porte l’état serveur, React Hook Form porte la saisie avec le même schéma Zod que la validation métier. Valider les réponses externes avant leur utilisation. Conserver TypeScript strict et l’absence de types non contrôlés.
- Respecter les décisions existantes sur l’état serveur, la suppression différée des ouvrages et la protection des saisies. Leur réutilisation ne prouve pas que tous les parcours du lot 1 sont déjà implémentés.

### Vocabulaire et contrat des notes

- Une note de lecture est une observation textuelle collective rattachée à un ouvrage, donc à une édition. Elle n’est pas attribuée à une personne. Un coup de cœur est une recommandation collective, indépendante du statut de lecture. La notation numérique de zéro à cinq est un concept distinct, dont la saisie reste au lot 3.
- Le contrat documente une note avec identifiant, identifiant d’ouvrage, contenu limité à 1 000 caractères et date de création. Il ne documente ni auteur de note, ni version, ni édition du texte après création.
- Lire les notes avec `GET /books/:id/notes` : tableau non paginé, plus récentes d’abord. Ajouter avec `POST /books/:id/notes`, corps contenant `contenu` : succès 201 avec la note créée ; validation 422. Supprimer avec `DELETE /books/:livreId/notes/:noteId` : succès 204 ou absence 404. Aucune extension de l’API n’est requise ni autorisée par cette spec.
- Distinguer le cache des notes de chaque ouvrage du cache de ses données bibliographiques et des listes. Après écriture, mettre à jour ou invalider les données concernées, sans vider indistinctement tout le cache.

### Rédaction et résultat incertain

- Placer sur la fiche un champ multiligne, un compteur sur 1 000 caractères et un bouton « Ajouter la note ». Afficher les notes dessous avec date et heure lisibles, dans l’ordre fourni par le serveur.
- Verrouiller champ et soumission pendant l’envoi. Après ajout confirmé, rester sur la fiche, vider le champ, afficher la note créée et un retour de succès cohérent avec les notifications du lot 1. Une confirmation de succès ne remplace pas le bandeau d’annulation d’ouvrages.
- Conserver intégralement le texte après erreur ou résultat incertain et rendre la saisie à nouveau modifiable. Les erreurs 422 alimentent le champ ; une erreur 503 propose un réessai temporisé. Chaque échec reste visible et actionnable.
- Demander confirmation avant l’abandon volontaire d’une saisie. L’avertissement de fermeture du navigateur reste soumis aux limites de la plateforme : il ne constitue pas une sauvegarde et ne garantit pas la récupération après rechargement ou arrêt brutal.
- Un ajout dont la réponse manque n’est ni un succès confirmé ni une preuve de refus. Aucun réessai automatique du POST ; conserver le texte, expliquer la possibilité d’un enregistrement et proposer le rafraîchissement des notes pour vérifier, sans effacer le brouillon.
- Un réessai manuel après résultat incertain avertit du risque de doublon. Deux contenus identiques ne permettent pas de déterminer avec certitude si l’ajout précédent a réussi. Ne promettre ni idempotence du POST ni détection automatique des doublons.

### Suppression des notes : exception validée

- La suppression d’une note demande confirmation, puis envoie immédiatement le DELETE. Aucun délai de cinq secondes, aucune action d’annulation, aucune recréation destinée à simuler une restauration.
- Les notes ne rejoignent pas le groupe global de suppressions d’ouvrages. Elles ne remettent pas son compteur à zéro et ne sont pas concernées par son action « Annuler tout ».
- Afficher un retour visible en cas d’échec et une possibilité de réessayer. Une réponse perdue ne permet pas d’affirmer que la suppression serveur n’a pas eu lieu ; ne pas annoncer une restauration serveur sans preuve.
- Cette exception est un arbitrage produit explicitement validé. La règle générale du projet est alignée pour les notes seulement ; la confirmation, l’annulation et les échecs partiels des suppressions d’ouvrages restent inchangés.

### Recherche, filtres, tri et pagination

- Une barre « Rechercher un titre ou un auteur » utilise `q`, qui recherche titre et auteur ensemble, sans tenir compte des accents. Pas de champs séparés ni de sémantique inventée pour un paramètre de titre.
- Appliquer un anti-rebond de 300 ms après la dernière frappe. Transmettre l’annulation à la requête précédente devenue inutile et empêcher toute réponse obsolète de remplacer les résultats actuels.
- Séparer la saisie immédiate de la recherche appliquée aux données : la frappe ne doit pas entraîner le nouveau rendu de toute la liste. La preuve au profileur fait partie de la recette, pas d’une promesse déduite du choix d’une bibliothèque.
- Combiner les filtres lecture Tous / Lus / Non lus et recommandations Tous / Coups de cœur. Tous omet le filtre concerné ; utiliser `status=lu` ou `status=nonlu` et `favori=true` lorsqu’ils sont actifs.
- Proposer `sort=titre`, `auteur`, `annee` ou `note`, avec `order=asc` ou `desc`. Conserver titre croissant par défaut. Le serveur détermine l’ordre, y compris celui des notations absentes ; aucun retri local ni règle d’ordre des valeurs nulles non documentée.
- Interroger `GET /books` avec recherche, filtres, tri, ordre, page et limite de vingt. Le total et le nombre de pages sont ceux de cette réponse serveur ; ne pas télécharger tout le fonds pour calculer les résultats dans le client.
- Inclure tous les paramètres effectifs dans les clés de liste. Changer recherche appliquée, filtre ou tri ramène à la première page et vide la sélection de suppression. Le changement de page continue de vider la sélection comme au lot 1.
- Conserver Précédent/Suivant, le numéro de page et le total. Distinguer le squelette initial de l’indicateur de chargement d’une autre page ; traiter explicitement erreur avec réessai, fonds vide, absence de résultats et succès.
- Au retour d’une fiche, retrouver recherche, filtres, tri et page, puis actualiser les données. Si la page n’existe plus, reprendre la dernière page disponible. Aucun ouvrage créé n’est artificiellement placé en tête.

### Coups de cœur, lecture et concurrence locale

- Proposer un cœur interactif dans chaque ligne du fonds et sur la fiche. Le statut lu/non lu reste modifiable sur la fiche et dans le formulaire du lot 1, sans nouvelle bascule sur la liste et sans nouvelle action de masse.
- Envoyer les changements de cœur et les bascules de lecture avec un PATCH partiel, en préservant les champs non concernés et les données serveur utiles, dont la version.
- Appliquer immédiatement la valeur optimiste dans les vues concernées. Une seule bascule peut être en cours par ouvrage : verrouiller ses commandes cœur et lecture dans toutes les vues jusqu’au résultat. Les autres ouvrages restent interactifs.
- En cas d’échec de la bascule, restaurer la valeur précédente sans écraser une réponse plus récente ou l’état d’un autre ouvrage. Montrer une erreur et une possibilité de réessayer. Ne pas laisser une actualisation concurrente rendre invisible la mutation en cours.
- Si l’ouvrage ne correspond plus au filtre après une bascule, conserver temporairement sa ligne pendant l’envoi tout en montrant la nouvelle valeur. Après succès, actualiser la page depuis le serveur et retirer l’ouvrage concerné. Après échec, restaurer la valeur, sans disparition puis réapparition de la ligne pendant la requête.
- Distinguer l’échec d’un PATCH de l’échec d’une lecture d’actualisation après PATCH confirmé : une lecture en échec ne prouve pas que l’écriture confirmée a été annulée. Montrer le problème d’actualisation et permettre de réessayer la lecture.
- Le verrouillage traite la concurrence locale des bascules, pas les écritures de plusieurs libraires sur le serveur. La résolution des conflits et le contrôle de version obligatoire restent hors de ce lot.

### Accessibilité et présentation

- Conserver une interface sobre en français et en thème clair, avec couleurs centralisées, disposition adaptée aux petits écrans et messages d’état contextualisés.
- Chaque élément interactif expose rôle, libellé et état pertinent : cœur actif, filtre sélectionné, commande désactivée ou en cours. Les cibles atteignent au moins 44 points et les parcours restent utilisables au clavier.
- Un chargement des notes ou de la page suivante n’est pas présenté comme un écran initial vide. Les erreurs de données et d’actions sont visibles et proposent le réessai adapté sans perte de saisie.

## Testing Decisions

### Point d’entrée principal validé

Tester les parcours du fonds et de la fiche avec Testing Library, TanStack Query réel et seul le transport HTTP simulé. Réutiliser les tests de parcours existants plutôt que remplacer leurs hooks, services ou composants internes par des mocks. Un bon test observe ce que le libraire voit et peut faire, ainsi que le contrat HTTP sortant ; il ne dépend pas de noms de fonctions privés ni de l’organisation interne du cache.

Utiliser des réponses différées, des erreurs réseau simulées et une horloge contrôlée pour reproduire les courses et les temporisations de façon déterministe. Les assertions sur le transport doivent établir un contrat utile, comme le filtre envoyé ou l’annulation propagée, pas figer une séquence interne arbitraire.

### Comportements à couvrir

- Notes : chargement, vide contextualisé, ordre et horodatage, ajout confirmé, compteur et limite de contenu, verrouillage pendant envoi, conservation sur 422/503/erreur réseau, abandon volontaire, aucun vidage ni rejeu automatique après résultat incertain, vérification sans effacement et réessai manuel averti.
- Suppression d’une note : aucune requête avant confirmation ; envoi après confirmation sans délai d’annulation ; erreur visible et réessai ; absence d’inscription dans le groupe d’ouvrages et de modification de son compteur. Conserver les tests d’annulation des ouvrages.
- Recherche : pas de nouvelle recherche avant 300 ms, seule la dernière saisie appliquée est utilisée, annulation propagée, ancienne réponse sans effet sur les résultats récents, critères effectivement transmis au serveur.
- Filtres, tri et pagination : critères combinés, deux sens de tri, retour page une et sélection vidée au changement de critères, vingt ouvrages par page, états de chargement distincts, total filtré, vide contextualisé, critères conservés au retour de fiche et repli après disparition d’une page.
- Bascules : effet immédiat avant réponse, PATCH partiel, succès, restauration visible sur refus, réessai, verrouillage par ouvrage partagé entre vues, autres ouvrages non bloqués, réponses concurrentes sans écrasement indu et maintien temporaire de la ligne sous filtre.
- Actualisation après écriture : vérifier séparément le succès de l’écriture et l’échec éventuel de sa lecture de confirmation, sans annuler fictivement une écriture déjà confirmée.
- Accessibilité : utiliser les rôles et libellés pour les interactions ; vérifier les états sélectionné, actif et désactivé et l’accès clavier aux commandes nouvelles.

### Compléments ciblés et précédents existants

- Domaine et services : tests ciblés du schéma de note, des limites contractuelles et de la validation des réponses externes, selon les précédents des tests d’ouvrage et d’API de liste/fiche. Les contraintes non détaillées par le README doivent être vérifiées contre le validateur fourni avant de les coder, sans inventer de règles métier.
- Hooks de données : prolonger les tests existants d’annulation, de réponses arrivant dans le désordre et de réessai temporisé. Garder ces compléments lorsque le comportement de concurrence ne peut pas être couvert clairement au niveau du parcours.
- Navigateur : vérifier les parcours au clavier, les cibles et la disposition sur petit écran, puis démontrer en mode chaos une bascule immédiate suivie d’une restauration visible sur échec. Vérifier qu’une note reste saisie après échec.
- React DevTools : enregistrer une preuve au profileur montrant que la frappe dans la recherche ne fait pas re-rendre toute la liste avant l’application des nouveaux critères. Le contrôle fonctionnel des 300 ms ne remplace pas cette preuve de rendu.
- Avant de déclarer le lot livré, exécuter lint, vérification TypeScript et tests ; maintenir les tests de composants et d’au moins un hook avec réseau simulé, et viser au moins 40 % de couverture sur le domaine et les services. Les vérifications de la branche documentaire ne constituent pas la recette des fonctionnalités futures.

## Out of Scope

- Réouverture du cadrage, modification des tickets ou réimplémentation parallèle du lot 1.
- Modification d’une note existante, attribution personnelle des notes, coups de cœur individuels et gestion de comptes dans ce lot.
- Annulation des suppressions de notes, groupe mixte notes/ouvrages et restauration serveur par recréation.
- Brouillons persistants, garantie de récupération après arrêt brutal, cache persistant, acceptation d’écritures hors ligne, file de mutations, synchronisation et idempotence ajoutée au POST de notes.
- Authentification, gestion des jetons, rôles appliqués par l’interface, statistiques et résolution de conflits serveur.
- Saisie d’une notation sur cinq, couvertures, enrichissement externe, thème sombre et internationalisation. Le tri par notation déjà enregistrée reste inclus.
- Défilement infini, recherche séparée par champ, filtre « uniquement non favoris », tri local et nouvelles actions de masse.
- Création des tickets d’implémentation, affectation nominative et démarrage du développement par cette publication.

## Further Notes

### Validation et sources

Le cadrage métier a été validé pendant l’entretien du lot 2, puis les points d’entrée des tests ont été validés séparément avant rédaction. La proposition initiale de groupe de suppression commun aux notes et ouvrages a été rejetée ; seule la suppression de notes confirmée, immédiate et sans annulation est retenue.

Sources : sujet BookList Pro, pages 6–7 pour le lot 2 et ses frontières ; README de l’API v2 pour les modèles, les routes et les erreurs ; glossaire et ADR existants ; [spécification du lot 1, issue #1](https://github.com/MhaFADH/projet-sdv-react-native/issues/1). Le README API prime pour le protocole HTTP. L’exception de suppression des notes est une décision produit, pas une fonctionnalité de restauration fournie par l’API.

À la base documentaire `960733f`, les tickets de fonds paginé #2 et de fiche #3 sont livrés. Les autres parcours du lot 1 restent des dépendances à vérifier à la fin de ce lot, pas des capacités présumées présentes. Les constats historiques des documents du lot 1 ne remplacent pas cette vérification.

### Préparation pour deux personnes

Le futur découpage doit permettre deux parcours de travail simultanés, avec des tickets de comportement testables indépendamment : notes de lecture d’une part, recherche/filtres/coups de cœur d’autre part. Ces axes ne sont pas encore des tickets ni des affectations.

- À l’ouverture du lot 2, après réception du socle minimal du lot 1, identifier au moins deux tickets réellement démarrables, un par axe. Ne pas rendre tous les parcours dépendants d’un unique ticket général d’infrastructure sans nécessité technique.
- Réutiliser le client HTTP et les conventions de cache du lot 1. Identifier les interfaces communes nécessaires aux deux axes et leur état livré avant d’établir des blocages.
- Prévoir un périmètre de fichiers maîtrisé pour chaque personne et une intégration coordonnée des zones partagées, notamment la composition de fiche, les commandes de lecture et les conventions de cache. Deux axes métier ne garantissent pas à eux seuls l’absence de conflits de fichiers.
- Le découpage devra distinguer les blocages techniques réels des simples besoins de coordination, avec critères de recette et possibilités de revue croisée. La recette finale peut rejoindre les deux axes sans bloquer leur travail initial.

### Publication et intégration différées

Issue parent publiée : [#12 — Le cahier de lecture enrichi](https://github.com/MhaFADH/projet-sdv-react-native/issues/12), label `ready-for-agent`.

Cette spec et les ajustements documentaires associés sont préparés dans le worktree de la branche locale `specs/lot-2`, à intégrer par le responsable après la fin du lot 1. Aucun changement de code applicatif ou d’API n’est inclus.

L’issue publiée est une spécification parent portant le label `ready-for-agent`, pas un ticket demandant d’implémenter tout le lot. Le responsable valide son résultat avant de lancer manuellement `to-tickets`. Aucun ticket d’implémentation n’est créé par `to-spec`.

Les changements locaux restent non indexés et non commités par l’agent. La publication de l’issue ne publie pas la branche Git et ne remplace pas sa future intégration par le responsable.
