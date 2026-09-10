# BookList Pro

BookList Pro numérise le cahier de lecture des Comptoirs du Livre. Cette version livre la consultation du fonds par pages de vingt ouvrages triées par titre croissant par l’API, la fiche détaillée, l’ajout protégé contre la perte de saisie et la modification du statut collectif lu/non lu.

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

- appel de `GET /books?page=…&limit=20&sort=titre&order=asc` ;
- validation Zod de l’enveloppe paginée et de tous les champs d’un ouvrage ;
- chargement par squelette, erreur avec réessai, fonds vide et liste en succès ;
- pagination « Précédent / Suivant » bornée par les métadonnées serveur ;
- page consultée portée par l’URL de la liste (`/?page=3`) afin d’être restituée au retour ;
- statut collectif « Lu » ou « Non lu » indiqué dans la liste, sans action par ligne ;
- ouverture de la fiche d’un ouvrage depuis la liste (`/ouvrages/<identifiant>`) avec `GET /books/:id` validé ;
- bascule accessible depuis la fiche, immédiatement optimiste, envoyée par `PATCH` avec le seul champ `lu` ;
- restauration expliquée et réessai disponible après un refus, avec un réessai automatique temporisé pour une indisponibilité réessayable ;
- validation de la réponse d’écriture, protection contre les réponses obsolètes et actualisation ciblée des caches de fiche et de liste ;
- fiche en squelette, erreur avec réessai, absence contextualisée sur `404` et succès ;
- retour au fonds qui retrouve la page consultée et la réactualise, ou affiche la dernière page disponible si elle a disparu ;
- annulation des requêtes obsolètes et ErrorBoundary global ;
- ajout d’un ouvrage depuis le fonds (`/ouvrages/nouveau`) : titre, auteur, éditeur facultatif, année vide à l’ouverture et statut « Non lu » ;
- validation React Hook Form et Zod partagée avec les règles métier, erreurs associées aux champs ;
- création par `POST /books` validée à l’exécution, champs et soumission verrouillés pendant l’envoi ;
- refus `422` reporté sur les champs concernés, indisponibilité `503` réessayable après temporisation, saisie toujours conservée ;
- création au résultat inconnu signalée sans réessai automatique, avec vérification du fonds ou réessai manuel averti du risque de doublon ;
- confirmation avant abandon volontaire d’une saisie modifiée et avertissement de départ du navigateur, sans brouillon persistant ;
- après création confirmée : formulaire vidé, statut remis à « Non lu », toast de cinq secondes contenant le bouton vers la fiche, suspendu au survol ou au focus clavier, et invalidation ciblée des listes.

La correction bibliographique, la suppression, l’authentification et le mode hors ligne ne font pas partie de ces tickets.

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
- `hooks/` porte l’intégration React avec TanStack Query ;
- `services/api/` centralise HTTP, validation et erreurs ;
- `services/plateforme/` porte les capacités dépendant de la plateforme derrière une interface unique ;
- `domain/` contient les types et constantes métier purs ;
- `theme/` centralise les tokens visuels.

Le détail du flux est décrit dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), la décision TanStack Query dans [`docs/ADR/001-gestion-etat-serveur.md`](docs/ADR/001-gestion-etat-serveur.md) et la protection de la saisie dans [`docs/ADR/005-protection-saisie.md`](docs/ADR/005-protection-saisie.md).
