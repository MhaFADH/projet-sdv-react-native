# Lot 2 — Tickets publiés et travail à deux

## Statut

Découpage en sept parcours verticaux validé par le responsable, puis publié sur GitHub. Tous les tickets portent `lot:2` et `ready-for-agent`. Leur contenu, leurs labels et leurs treize liens de blocage natifs ont été relus après publication.

La [spec parent #12 — Le cahier de lecture enrichi](https://github.com/MhaFADH/projet-sdv-react-native/issues/12) reste inchangée et ouverte. Les tickets la référencent dans leur corps ; aucune relation de sous-issue ne lui a été ajoutée. Le [document de spécification](LOT-2.md) reste la référence du périmètre, sans devenir un ticket d’implémentation global.

La publication ne lance pas le développement. Le démarrage du lot 2 reste planifié après réception du lot 1 et intégration de ses documents de cadrage. Les fichiers documentaires sont préparés dans le worktree `specs/lot-2`, sans modification de code, indexation, commit, push ou fusion par l’agent.

## Parcours et dépendances

Les identifiants T1–T7 étaient ceux du découpage soumis à validation. Les liens GitHub ci-dessous sont les références à utiliser désormais. Les blocages citent seulement les prérequis directs ; leurs dépendances transitives ne sont pas ajoutées en doublon.

| Repère | Ticket | Parcours livré | Bloqué par |
| --- | --- | --- | --- |
| T1 | [#15 — Consulter les notes d’un ouvrage](https://github.com/MhaFADH/projet-sdv-react-native/issues/15) | Notes horodatées sur la fiche, lecture validée, cache distinct, chargement, vide et erreur avec réessai. | [#3 — Fiche](https://github.com/MhaFADH/projet-sdv-react-native/issues/3) |
| T2 | [#16 — Rechercher dans le fonds sans perdre son parcours](https://github.com/MhaFADH/projet-sdv-react-native/issues/16) | Recherche serveur à 300 ms, annulation, pagination, sélection remise à zéro, retour conservé et preuve de rendu. | [#8 — Sélection dans la liste](https://github.com/MhaFADH/projet-sdv-react-native/issues/8) |
| T3 | [#17 — Ajouter une note sans perdre sa saisie](https://github.com/MhaFADH/projet-sdv-react-native/issues/17) | Rédaction, validation, POST, succès, conservation du texte, protection d’abandon et résultat incertain sans rejeu automatique. | [#15](https://github.com/MhaFADH/projet-sdv-react-native/issues/15), [#4 — Création protégée](https://github.com/MhaFADH/projet-sdv-react-native/issues/4) |
| T4 | [#18 — Combiner filtres et tris du fonds](https://github.com/MhaFADH/projet-sdv-react-native/issues/18) | Critères combinés côté serveur, deux sens de tri, retour conservé et bascule de lecture cohérente sous filtre. | [#16](https://github.com/MhaFADH/projet-sdv-react-native/issues/16), [#6 — Bascule de lecture](https://github.com/MhaFADH/projet-sdv-react-native/issues/6) |
| T5 | [#19 — Supprimer une note après confirmation](https://github.com/MhaFADH/projet-sdv-react-native/issues/19) | DELETE immédiat après confirmation, sans annulation, erreurs et indépendance du groupe de suppressions d’ouvrages. | [#15](https://github.com/MhaFADH/projet-sdv-react-native/issues/15), [#7 — Suppressions d’ouvrages](https://github.com/MhaFADH/projet-sdv-react-native/issues/7) |
| T6 | [#20 — Basculer les coups de cœur sans incohérence](https://github.com/MhaFADH/projet-sdv-react-native/issues/20) | Cœurs liste/fiche, optimisme et restauration, verrouillage cœur/lecture par ouvrage, concurrence locale et filtres. | [#18](https://github.com/MhaFADH/projet-sdv-react-native/issues/18) |
| T7 | [#21 — Recetter le cahier enrichi et transmettre](https://github.com/MhaFADH/projet-sdv-react-native/issues/21) | Recette croisée navigateur/chaos, clavier, petit écran, preuves de rendu, couverture et documentation consolidée. | [#17](https://github.com/MhaFADH/projet-sdv-react-native/issues/17), [#19](https://github.com/MhaFADH/projet-sdv-react-native/issues/19), [#20](https://github.com/MhaFADH/projet-sdv-react-native/issues/20), [#9 — Recette du lot 1](https://github.com/MhaFADH/projet-sdv-react-native/issues/9) |

## Répartition proposée, sans affectation nominative

| Étape indicative | Personne A | Personne B |
| --- | --- | --- |
| Ouverture du lot 2 | #15 — Consultation des notes | #16 — Recherche |
| Suite | #17 — Ajout protégé | #18 — Filtres et tris |
| Suite | #19 — Suppression de notes | #20 — Coups de cœur |
| Final | #21 — Recette du parcours de l’autre personne | #21 — Recette du parcours de l’autre personne |

Cette répartition n’ajoute aucun blocage au graphe. En particulier, #19 n’attend pas #17 : il peut être réalisé avec des notes déjà présentes côté serveur. De même, #18 filtre des favoris existants sans attendre le bouton cœur de #20.

Après réception des prérequis du lot 1, #15 et #16 sont deux points d’entrée indépendants dans le lot 2. Un ticket sans bloqueur encore ouvert est techniquement disponible ; cela ne remplace pas l’ouverture du lot par le responsable. L’état courant des issues GitHub, plutôt qu’un constat historique dans un document, détermine cette disponibilité.

## Coordination sans dépendance artificielle

- Le parcours notes possède son domaine, sa présentation et ses opérations de notes, avec une intégration limitée dans la composition de fiche.
- Le parcours fonds possède la recherche, les critères, la pagination et leur navigation, puis les bascules communes aux vues.
- Réutiliser le client HTTP, les notifications, les protections et les conventions de cache réellement livrés au lot 1 ; ne pas ouvrir deux développements concurrents de ce socle.
- Les modifications de composition de fiche, de transport ou de conventions communes sont coordonnées entre les deux personnes. Un fichier partagé ne justifie pas à lui seul une dépendance entre tous les tickets ; chaque personne garde un périmètre d’écriture maîtrisé et ses travaux isolés.
- Les adaptations préparatoires nécessaires sont limitées au parcours propriétaire et précèdent son ajout fonctionnel. Aucun ticket horizontal d’infrastructure n’a été créé.
- Chaque ticket fonctionnel comprend ses tests, ses erreurs et reprises, son accessibilité et sa documentation. #21 consolide la recette croisée ; il ne reporte pas toutes les vérifications en fin de lot.

## Vérifications de publication

- Sept nouvelles issues, chacune liée à #12 dans son corps, avec critères d’acceptation et blocages exprimés par les numéros réels.
- Labels `lot:2` et `ready-for-agent` présents sur les sept tickets.
- Treize dépendances natives GitHub vérifiées dans le sens « ticket bloqué par son prérequis », identiques aux listes des corps et au graphe validé.
- Corps, titre, labels, état et commentaires de la spec parent #12 identiques avant et après publication. Aucun ticket du lot 1 n’a été réécrit ni fermé.
- Aucun code applicatif ou d’API modifié, aucune implémentation démarrée et aucune affectation nominative créée par cette publication.
