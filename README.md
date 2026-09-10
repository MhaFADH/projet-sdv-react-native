# BookList Pro

BookList Pro numérise le cahier de lecture des Comptoirs du Livre. Cette version livre la consultation, la recherche, les filtres de lecture et de coups de cœur ainsi que les tris serveur du fonds par pages de vingt ouvrages, la fiche détaillée avec ses notes de lecture, leur ajout et leur suppression, l’ajout d’ouvrage protégé contre la perte de saisie, la modification du statut collectif lu/non lu et la suppression différée depuis une fiche ou une sélection de la liste, avec annulation groupée.

## Prérequis

- Node.js 22, conformément à `.nvmrc` ;
- l’API BookList Pro v2 fournie avec le projet ;
- un navigateur récent.

## Lancement en moins de cinq minutes

### 1. Démarrer l’API sans authentification

Depuis le dépôt de l’API :

```bash
npm install
npm run seed:small
npm start
```

L’API doit répondre sur <http://localhost:3000/health>. La commande `npm start` laisse l’authentification désactivée.

### 2. Démarrer le client web

Depuis ce dépôt :

```bash
npm ci
cp .env.example .env.local
npm run web
```

Ouvrir l’URL indiquée par Expo dans le navigateur. `EXPO_PUBLIC_API_URL` est une URL publique intégrée au client, jamais un secret.

Pour tester depuis un appareil mobile, remplacer `localhost` dans `.env.local` par l’adresse IP locale de la machine qui exécute l’API, puis redémarrer Expo.

## Comportement livré

- appel de `GET /books` avec `page`, `limit=20`, `q`, `status`, `favori`, `sort` et `order`, en omettant les filtres inactifs ;
- recherche titre ou auteur appliquée côté serveur 300 ms après la dernière frappe, avec annulation des demandes dépassées ;
- filtres combinables Tous/Lus/Non lus et Tous/Coups de cœur, sans filtrage local du fonds ;
- barre de critères unique avec les zones verticales « Affiner » puis « Trier » sur écran large, remplacée sur petit écran par un panneau « Filtres et tri » avec résumé des choix ; les radios se parcourent avec les flèches du clavier ;
- tris serveur par titre, auteur, année ou notation, dans les sens croissant et décroissant, sans règle locale pour les notations absentes ;
- validation Zod de l’enveloppe paginée et de tous les champs d’un ouvrage ;
- chargement par squelette, erreur avec réessai, fonds vide et liste en succès ;
- pagination « Précédent / Suivant » bornée par les métadonnées serveur ;
- recherche, filtres, tri, ordre et page consultée portés par l’URL de la liste (`/?page=3&q=zola&status=nonlu&favori=true&sort=note&order=desc`) afin d’être restitués et actualisés au retour ;
- statut collectif « Lu » ou « Non lu » indiqué dans la liste, sans action par ligne ;
- cases à cocher limitées aux vingt ouvrages de la page et sélection remise à zéro à chaque changement de page ; l’action compacte « N sélectionnés — Supprimer » apparaît uniquement lorsqu’une sélection existe ;
- confirmation récapitulative avant l’ajout de la sélection au même groupe annulable que la suppression depuis une fiche ;
- ouverture de la fiche d’un ouvrage depuis la liste (`/ouvrages/<identifiant>`) avec `GET /books/:id` validé ;
- bascule accessible depuis la fiche, immédiatement optimiste, envoyée par `PATCH` avec le seul champ `lu` ;
- restauration expliquée et réessai disponible après un refus, avec un réessai automatique temporisé pour une indisponibilité réessayable ;
- sous filtre de lecture, maintien de la ligne pendant la bascule optimiste puis retrait après confirmation et actualisation ; un échec de relecture reste distinct du succès du `PATCH` ;
- validation de la réponse d’écriture, protection contre les réponses obsolètes et actualisation ciblée des caches de fiche et de liste ;
- fiche en squelette, erreur avec réessai, absence contextualisée sur `404` et succès ;
- consultation de `GET /books/:id/notes` dans un cache distinct par ouvrage, avec validation de chaque note, ordre serveur conservé, date et heure françaises, squelette, vide contextualisé et erreur réessayable sans masquer la bibliographie ;
- ajout d’une note depuis la fiche : champ multiligne, compteur sur 1 000 caractères, validation partagée avec le validateur de l’API, `POST /books/:id/notes` validé à l’exécution, champ et soumission verrouillés pendant l’envoi ;
- note ajoutée affichée en tête sans invalider les caches d’ouvrages, champ vidé et confirmation par le même toast de cinq secondes que la création d’ouvrage, qui coexiste avec le bandeau de suppression sans en réinitialiser le compteur ;
- refus `422` reporté sur le champ, `503` réessayable après temporisation, ouvrage disparu (`404`) expliqué sans effacer le texte ;
- absence de réponse présentée comme un résultat incertain : aucun succès annoncé, actualisation des notes pour vérifier, renvoi manuel averti du risque de doublon, sans rejeu automatique ;
- confirmation avant abandon volontaire d’une note non envoyée, depuis « Effacer la saisie » comme depuis le retour au fonds ;
- suppression d’une note depuis la fiche, après confirmation identifiant la note par sa date et un extrait, puis `DELETE /books/:livreId/notes/:noteId` immédiat : aucun délai, aucune annulation, aucune recréation simulant une restauration ;
- état de l’envoi visible sur la note concernée, seconde soumission de la même note écartée, les autres notes restant actionnables ;
- échec avec retour visible attaché à la note et reprise toujours offerte : temporisation sur `503`, reprise immédiate sur un refus concluant ;
- réponse perdue présentée comme un résultat incertain — la note a peut-être été supprimée — avec actualisation des notes pour vérifier, sans annoncer de restauration serveur ;
- `404` traité comme une issue documentée et non comme un blocage : la liste est actualisée et le cas expliqué ;
- notes retirées du seul cache des notes de l’ouvrage, état vide contextualisé si la dernière disparaît, et aucune interaction avec le groupe de suppressions d’ouvrages, son compteur ou son « Annuler tout » ;
- retour au fonds qui retrouve la page consultée et la réactualise, ou affiche la dernière page disponible si elle a disparu ;
- annulation des requêtes obsolètes et ErrorBoundary global ;
- ajout d’un ouvrage depuis le fonds (`/ouvrages/nouveau`) : titre, auteur, éditeur facultatif, année vide à l’ouverture et statut « Non lu » ;
- validation React Hook Form et Zod partagée avec les règles métier, erreurs associées aux champs ;
- création par `POST /books` validée à l’exécution, champs et soumission verrouillés pendant l’envoi ;
- refus `422` reporté sur les champs concernés, indisponibilité `503` réessayable après temporisation, saisie toujours conservée ;
- création au résultat inconnu signalée sans réessai automatique, avec vérification du fonds ou réessai manuel averti du risque de doublon ;
- confirmation avant abandon volontaire d’une saisie modifiée et avertissement de départ du navigateur, sans brouillon persistant ;
- après création confirmée : formulaire vidé, statut remis à « Non lu », toast de cinq secondes contenant le bouton vers la fiche, suspendu au survol ou au focus clavier, et invalidation ciblée des listes ;
- suppression directe depuis une fiche après confirmation nominative ;
- masquage temporaire et groupe global conservé pendant les navigations internes ;
- échéance commune de cinq secondes, remise à cinq secondes à chaque ajout, avec « Annuler tout » ;
- DELETE individuels via le client HTTP partagé, sans promesse de transaction atomique ;
- réaffichage des seuls échecs partiels et réessai ciblé après une nouvelle confirmation et un nouveau délai.

Les intentions non envoyées ne sont pas persistées : fermer ou recharger les abandonne. Une requête déjà partie ne peut pas être annulée avec garantie côté serveur. L’authentification et le mode hors ligne ne font pas partie de ces tickets.

## Vérifications

```bash
npm run check
npm run typecheck
npm test
npm run test:coverage
npm run knip
npx expo install --check
```

## Organisation

- `app/` compose les routes et les providers ;
- `components/` contient la présentation pure ;
- `features/books/` compose les parcours de consultation du fonds, de la fiche et d’ajout d’un ouvrage ;
- `features/notes/` compose la saisie et la suppression d’une note de lecture, et les états de présentation des notes ;
- `hooks/` porte l’intégration React avec TanStack Query ;
- `services/api/` centralise HTTP, validation et erreurs ;
- `services/plateforme/` porte les capacités dépendant de la plateforme derrière une interface unique ;
- `domain/` contient les types et constantes métier purs ;
- `theme/` centralise les tokens visuels.

Le détail du flux est décrit dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), la décision TanStack Query dans [`docs/ADR/001-gestion-etat-serveur.md`](docs/ADR/001-gestion-etat-serveur.md), la suppression différée et l’exception validée des notes dans [`docs/ADR/004-suppression-differee.md`](docs/ADR/004-suppression-differee.md) et la protection de la saisie, y compris pour l’ajout d’une note, dans [`docs/ADR/005-protection-saisie.md`](docs/ADR/005-protection-saisie.md).

Le compte rendu de recette du lot 1, avec ce qui est automatisé, vérifié manuellement ou non vérifié, est dans [`docs/RECETTE-LOT-1.md`](docs/RECETTE-LOT-1.md).
