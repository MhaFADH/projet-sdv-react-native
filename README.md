# BookList Pro

BookList Pro numérise le cahier de lecture des Comptoirs du Livre. Cette version livre la consultation du fonds par pages de vingt ouvrages, triées par titre croissant par l’API, et la consultation de la fiche d’un ouvrage.

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
- statut collectif « Lu » ou « Non lu » affiché sans action de modification ;
- ouverture de la fiche d’un ouvrage depuis la liste (`/ouvrages/<identifiant>`) avec `GET /books/:id` validé ;
- fiche en squelette, erreur avec réessai, absence contextualisée sur `404` et succès ;
- retour au fonds qui retrouve la page consultée et la réactualise, ou affiche la dernière page disponible si elle a disparu ;
- annulation des requêtes obsolètes et ErrorBoundary global.

L’ajout, la modification, la suppression, la bascule du statut de lecture, l’authentification et le mode hors ligne ne font pas partie de ces tickets.

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
- `features/books/` compose les parcours de consultation du fonds et de la fiche ;
- `hooks/` porte l’intégration React avec TanStack Query ;
- `services/api/` centralise HTTP, validation et erreurs ;
- `domain/` contient les types et constantes métier purs ;
- `theme/` centralise les tokens visuels.

Le détail du flux est décrit dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) et la décision TanStack Query dans [`docs/ADR/001-gestion-etat-serveur.md`](docs/ADR/001-gestion-etat-serveur.md).
