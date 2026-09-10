# Lot 1 — Cadrage

Statut : cadrage du lot 1 validé, session de grilling close. Tous les points discutés sont tranchés. Les comportements décrits restent à implémenter ; ce document n’autorise pas le démarrage de l’implémentation.

## Périmètre

Cette session concerne uniquement le lot 1 : liste paginée des ouvrages, fiche détaillée, ajout, modification, suppression et statut lu/non lu. Le contrat de qualité transversal reste applicable.

Sources : `AGENTS.md`, `../api-books-v2-/Sujet-BookList-Pro-React-Native-1.pdf` et `../api-books-v2-/api-books-v2/README.md`. Le README de l’API fait foi pour le contrat HTTP, le sujet pour la recette.

## Spécification publiée sur GitHub

La spécification parent est publiée dans l’[issue #1 — Le cahier de lecture](https://github.com/MhaFADH/projet-sdv-react-native/issues/1), avec les labels `lot:1` et `ready-for-agent`.

Elle sert de référence au découpage en tickets, pas à une implémentation du lot d’un bloc. Le découpage en huit tickets et leur publication ont été validés par l’utilisateur. Tous portent `lot:1` et `ready-for-agent`.

## Tickets publiés

| Ticket | Parcours livré | Bloqué par |
| --- | --- | --- |
| [#2](https://github.com/MhaFADH/projet-sdv-react-native/issues/2) | Parcourir le fonds paginé | Aucun |
| [#3](https://github.com/MhaFADH/projet-sdv-react-native/issues/3) | Consulter une fiche et retrouver sa page | #2 |
| [#4](https://github.com/MhaFADH/projet-sdv-react-native/issues/4) | Créer un ouvrage sans perdre sa saisie | #3 |
| [#5](https://github.com/MhaFADH/projet-sdv-react-native/issues/5) | Corriger un ouvrage existant | #4 |
| [#6](https://github.com/MhaFADH/projet-sdv-react-native/issues/6) | Basculer le statut de lecture depuis la fiche | #3 |
| [#7](https://github.com/MhaFADH/projet-sdv-react-native/issues/7) | Supprimer depuis les fiches avec annulation groupée | #3 |
| [#8](https://github.com/MhaFADH/projet-sdv-react-native/issues/8) | Supprimer une sélection depuis la liste | #7 |
| [#9](https://github.com/MhaFADH/projet-sdv-react-native/issues/9) | Recetter le parcours complet et transmettre le projet | #5, #6, #8 |

Les neuf liens de blocage natifs GitHub, les contenus et les labels ont été vérifiés. L’issue parent #1 n’a été ni modifiée ni fermée. Chaque ticket la référence dans son corps, sans changement de ses relations natives. Le premier ticket disponible est #2 ; les autres attendent leurs bloqueurs. Aucune implémentation n’a été lancée par cette publication.

## Décisions validées — Tour 1

### Q1 — Pagination

Afficher 20 ouvrages par page, avec les boutons « Précédent » et « Suivant », le numéro de page et le total. Le tri initial est alphabétique par titre, croissant, effectué côté serveur.

### Q2 — Statut de lecture

Permettre la bascule lu/non lu depuis la fiche et proposer le champ dans le formulaire. La liste affiche uniquement le statut. La bascule sur la fiche est optimiste, avec restauration et retour visible en cas d’échec.

### Q3 — Suppression

Demander une confirmation récapitulant les ouvrages concernés, puis les masquer temporairement et offrir au moins cinq secondes d’annulation. Les suppressions successives partagent le délai défini en Q16. Envoyer le DELETE de chaque ouvrage uniquement à l’expiration de ce délai commun. En cas d’échec, restaurer l’affichage concerné et proposer un réessai. Ne pas simuler l’annulation en recréant un ouvrage supprimé. La navigation interne conserve ce délai. Les limites au départ du navigateur et la présentation du warning sont précisées en Q9.

### Q4 — Protection de la saisie

Conserver tous les champs après une erreur et demander confirmation avant un abandon volontaire de saisie. Les brouillons persistants et l’acceptation d’écritures hors ligne ne font pas partie de ce lot. La récupération après fermeture involontaire ou arrêt brutal n’est pas garantie.

### Q5 — Présentation

Interface sobre et fonctionnelle, en français et en thème clair. Liste lisible sur ordinateur et disposition adaptée aux petits écrans. Pas de couvertures ni d’enrichissements hors lot 1.

## Décisions validées — Tour 2

### Q6 — Vocabulaire métier

Un ouvrage correspond à une édition, et non à un exemplaire physique ou à une gestion de stock. Deux éditions peuvent avoir deux fiches distinctes. Le fonds rassemble les ouvrages ; le statut de lecture est collectif. Ces termes sont définis dans `CONTEXT.md`.

### Q7 — Champs et valeurs initiales

Éditeur facultatif ; titre, auteur et année obligatoires. À la création, le statut est « Non lu » et l’année reste vide. Les validations suivent les limites du serveur.

La demande de source sur l’éditeur vide est étayée par `../api-books-v2-/api-books-v2/src/livres.js` : ligne 41, `texte('editeur', false)` ; ligne 28, rejet du texte vide uniquement si le champ est obligatoire ; ligne 78, valeur initiale vide si l’éditeur est omis. Un appel local au validateur confirme que les chaînes vide et composée d’espaces sont acceptées et normalisées en chaîne vide, tandis que `null` est refusé. Le serveur n’a pas été lancé et l’API n’a pas été modifiée.

### Q10 — Création au résultat incertain

Ne pas réessayer automatiquement une création. En l’absence de réponse concluante, conserver la saisie et signaler que l’ouvrage a peut-être été créé. Proposer une vérification ou un réessai manuel avec avertissement explicite du risque de doublon. Une absence de réponse ne prouve pas l’absence d’enregistrement.

## Décisions validées — Suites de l’entretien

### Q8 — Rester dans le formulaire après succès

Aucune redirection automatique vers la fiche après enregistrement. Après création confirmée, vider les champs et remettre le statut à « Non lu ». Afficher un toast de validation et proposer un bouton vers l’ouvrage enregistré.

Le vidage s’applique uniquement à la création. Après modification, rester dans le formulaire avec les valeurs enregistrées, sans changements en attente, avec toast et bouton vers la fiche. Ne rien vider sur erreur ou résultat incertain.

### Q11 — Doublons bibliographiques

Ne pas bloquer les fiches partageant les mêmes titre, auteur, éditeur et année. Empêcher les doubles soumissions accidentelles pendant l’envoi. Ne pas prétendre détecter les doublons du fonds en comparant uniquement les vingt ouvrages affichés.

### Q12 — Saisie pendant l’envoi

Verrouiller les champs et le bouton d’enregistrement pendant l’envoi, jusqu’au succès ou à l’erreur, afin que le vidage après création ne puisse pas effacer une nouvelle saisie commencée pendant la requête. En cas d’erreur, rendre les champs modifiables sans perdre leur contenu.

### Q13 — Retour à la liste

Retrouver la page précédemment consultée, actualisée. Si elle n’existe plus après une suppression, afficher la dernière page disponible. Un ouvrage créé conserve sa place dans le tri alphabétique ; ne pas le déplacer artificiellement en tête de liste.

### Q14 — Accès à l’ouvrage créé

Le bouton vers l’ouvrage créé est intégré au toast de succès et disparaît avec lui. Aucun bouton persistant n’est ajouté dans le formulaire.

### Q15 — Durée du toast de succès

Afficher le toast pendant cinq secondes. Suspendre sa disparition tant qu’il est survolé ou que son bouton possède le focus clavier. Une nouvelle réussite remplace le toast de succès précédent, mais ne remplace jamais le bandeau d’annulation d’une suppression.

### Q17 — ADR limités au lot 1

Trois ADR ont été rédigés sur les décisions réellement discutées dans ce lot :

- `docs/ADR/001-gestion-etat-serveur.md` : TanStack Query, honnêtement identifié comme choix imposé par `AGENTS.md`, sans inventer de comparaison de bibliothèques.
- `docs/ADR/004-suppression-differee.md` : suppression différée plutôt que suppression immédiate suivie d’une recréation. Le groupe avec délai commun, le blocage des nouvelles suppressions pendant l’envoi et le parcours de réessai après échec partiel sont retenus.
- `docs/ADR/005-protection-saisie.md` : protection de la saisie et traitement des créations au résultat incertain, avec les limites acceptées.

Les numéros `002` et `003` restent réservés aux documents prévus ultérieurement. Aucune stratégie des autres lots n’est décidée dans cette session. Les ADR distinguent décisions de cadrage et état réel de l’implémentation.

### Q9 — Bandeau de suppression et départ de la page

Après la confirmation préalable validée en Q3, afficher un bandeau global non bloquant pendant le délai commun de cinq secondes depuis la dernière suppression ajoutée au groupe. Il contient le nombre d’ouvrages concernés, le warning et l’action « Annuler tout ». La correction du terme « modale » concerne la présentation du compte à rebours : aucune modale bloquante n’est maintenue pendant ces cinq secondes.

La navigation interne conserve le délai et l’accès à l’annulation. Fermer ou recharger le document avant l’envoi abandonne l’intention de suppression non envoyée. Ne pas forcer l’envoi au départ et ne pas annoncer l’annulation serveur d’une requête déjà partie.

Warning proposé pour le bandeau : « Les suppressions seront envoyées à la fin du délai. Fermer ou recharger l’application avant l’envoi les abandonnera. Une fois envoyées, elles ne pourront plus être annulées. »

#### Limites navigateur vérifiées

- [`beforeunload`](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event) n’est pas déclenché de façon fiable dans tous les scénarios, notamment sur mobile. Son dialogue est générique, exige une interaction préalable et peut être annulé : le déclenchement ne prouve pas un départ effectif.
- [`fetch` avec `keepalive`](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive) permet de maintenir une requête déjà initiée lors du déchargement et accepte des méthodes autres que POST, dont DELETE. Cela ne garantit ni le déclenchement de cette requête ni la suppression effective côté serveur.
- [`sendBeacon`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) envoie uniquement un POST ; il ne remplace pas directement la route DELETE de l’API.
- Une navigation interne qui conserve le document doit être distinguée de son déchargement. Les sources ci-dessus ne documentent pas le comportement d’un routeur particulier.

La promesse « toute fermeture ou recharge provoque la suppression serveur » ne peut donc pas être garantie par un simple gestionnaire de départ. Ces constats sont issus de la lecture des trois sources MDN, et non d’un test navigateur de l’application, qui reste un starter.

### Q16 — Suppressions successives groupées

Les suppressions successives rejoignent un groupe en attente. Chaque nouvelle suppression confirmée remet son unique compte à rebours à cinq secondes. Le bandeau indique le nombre de suppressions en attente et propose « Annuler tout ».

À expiration, envoyer les suppressions des ouvrages du groupe. Avant l’envoi, « Annuler tout » restaure tous les ouvrages du groupe. Les premières suppressions peuvent attendre plus longtemps, jamais moins de cinq secondes.

L’envoi anticipé des suppressions précédentes lorsqu’une nouvelle arrive est écarté, car il raccourcirait leur fenêtre d’annulation. Les délais et annulations indépendants par ouvrage n’ont pas été retenus.

Le groupe est une présentation côté client, pas une transaction atomique du serveur : chaque ouvrage utilise sa propre requête DELETE. Les règles d’envoi et d’échec partiel sont précisées en Q18 et Q19. La sélection et l’action groupée de suppression dans la liste sont définies en Q20.

## Décisions complémentaires après l’arrêt du grilling

### Q18 — Nouveau groupe pendant l’envoi

Désactiver uniquement les nouvelles suppressions jusqu’au résultat du groupe en cours d’envoi. La consultation et les autres actions restent disponibles. Ne pas mélanger un groupe encore annulable et le groupe déjà envoyé.

### Q19 — Échec partiel d’un groupe

Conserver les suppressions réussies, réafficher uniquement les ouvrages en échec et présenter un message persistant avec leurs titres et une action de réessai. Le réessai repasse par la confirmation et le délai d’annulation. Les suppressions serveur déjà réalisées restent irréversibles ; ne pas simuler leur retour arrière.

### Q20 — Sélection et actions de suppression

Dans la liste, proposer des cases à cocher et une barre « N sélectionnés — Supprimer », plutôt qu’un bouton de suppression par ligne. La sélection est limitée à la page affichée et remise à zéro au changement de page.

Une confirmation récapitule les ouvrages sélectionnés avant leur ajout au groupe annulable, avec le délai commun de cinq secondes et « Annuler tout ». Aucune autre action de masse n’est ajoutée au lot 1.

Conserver l’action directe de suppression sur la fiche détaillée, avec confirmation. Ne pas proposer de suppression dans le formulaire.

## État du travail à la clôture du cadrage

Le présent cadrage, le glossaire `CONTEXT.md` et les trois ADR de Q17 ont été ajoutés au projet. Leur création ne constitue pas une implémentation des comportements décrits. Aucun code applicatif ni fichier de l’API voisine n’a été modifié. Aucun autre lot n’a été cadré.

