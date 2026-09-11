# Recette du lot 2

Compte rendu de la recette d’intégration demandée par l’issue #21, exécutée le
11 septembre 2026 sur `main` au commit `309c7c3`. Les résultats distinguent ce qui
est **automatisé**, **vérifié dans Chrome** et **non vérifié**. Aucun comportement
non observé n’est déclaré réussi.

## Environnement

| Élément | Valeur observée |
| --- | --- |
| Client | Expo SDK 54, Metro sur `http://localhost:8081`, React 19.1 |
| Navigateur | Chrome 153 sans interface, piloté par le protocole DevTools |
| API nominale | v2.0.0 sur `http://localhost:3000`, `authRequise: false`, 473 ouvrages et 351 notes avant et après la recette |
| API dégradée | copie temporaire du projet voisin, 50 ouvrages et 39 notes, lectures sur le port 3001 et écritures sur le port 3002 |
| Chaos | `AUTH_REQUIRED=false`, `CHAOS_LATENCE=450`, `CHAOS_ECHEC=1` sur le port 3002 |
| Profiler | React DevTools 6.1.5 lancé temporairement, sans dépendance ajoutée au projet |
| Petit écran | fenêtre d’affichage 390 × 760 |

L’API fournie n’a pas été modifiée. Les ports 3001, 3002, 8097, 9222 et 9333 et
leurs processus temporaires ont été arrêtés. Les ouvrages et notes jetables ont été
supprimés ; `/health` est revenu à 473 ouvrages et 351 notes.

## Guide de lancement

Les prérequis, `.env.example` et les commandes du README ont été relus. Avec les
dépendances déjà installées, une seconde exécution isolée de
`npx expo start --web --port 8083` a servi le document français en 2,401 s, puis a
été arrêtée. L’API répondait déjà sur `/health` sans authentification. Le temps de
`npm ci` n’a pas été remesuré ; le parcours complet du guide en moins de cinq
minutes reste l’observation consignée lors de la recette du lot 1.

## Consultation enrichie dans Chrome

| Vérification | Observation | Statut |
| --- | --- | --- |
| Pagination serveur | Pages 1 et 2 de vingt lignes ; `GET /books?page=…&limit=20&sort=titre&order=asc` | Vérifié dans Chrome |
| Filtres et tri combinés | `status=lu&favori=true&sort=annee&order=desc` donne 40 ouvrages sur deux pages ; les vingt lignes de la première page sont lues et portent un cœur actif | Vérifié dans Chrome |
| Totaux et sorties de filtre | « Page 1 sur 2 · 40 ouvrages » vient de la réponse serveur ; aucune réduction ou remise en ordre locale | Vérifié dans Chrome et automatisé |
| Retour depuis une fiche | L’URL `/?page=2&status=lu&favori=true&sort=annee&order=desc` est retrouvée à l’identique et un nouveau GET de cette page part au retour | Vérifié dans Chrome |
| Recherche serveur | Saisie `Des` depuis la page 2 : aucun GET à 220 ms, liste inchangée ; un seul GET après le délai, avec `q=Des`, `page=1` et `limit=20` | Vérifié dans Chrome |
| Requête dépassée | Le signal est annulé et une ancienne réponse ne remplace pas les critères récents | Automatisé dans `recherche-fonds.test.tsx`, `use-books-page.test.tsx` et `use-book.test.tsx` |
| Échec d’actualisation | Il reste présenté comme une erreur de lecture, distincte d’un refus de l’écriture confirmée | Automatisé dans `actualisation-statut-fiche.test.tsx` et les parcours de bascule |
| Vocabulaire collectif | La fiche sépare « Recommandation collective », « Statut de lecture collectif », note textuelle et tri par « Notation » | Vérifié dans Chrome et dans `CONTEXT.md` |

La recherche, les filtres, les tris et la pagination observés ont tous traversé
`GET /books`. Aucun chargement des 500 ouvrages ni traitement du fonds côté client
n’a été observé.

## Preuve React DevTools de la recherche

Méthode : démarrer un enregistrement dans l’onglet Profiler, saisir un caractère,
puis comparer une capture arrêtée avant l’application des critères à une capture
laissée au-delà des 300 ms. Le transport est observé séparément par le panneau
Network du protocole DevTools. Les horodatages, commits et composants sont conservés
dans [`preuves/lot-2/profil-recherche.json`](preuves/lot-2/profil-recherche.json).

| Condition | Résultat Profiler | Réseau |
| --- | --- | --- |
| Arrêt observé 122 ms après la saisie de `D` | Deux commits. Le commit utile contient `RechercheFonds` et ses éléments ; aucun commit ne contient `FondsScreen` ou `OuvragesList` | Aucun nouveau GET |
| Arrêt observé 651 ms après la saisie de `De` | Cinq commits. Le dernier contient `FondsScreen`, `OuvragesList`, `FondsRempli` et les lignes actualisées | Un seul `GET /books?page=1&limit=20&q=De&sort=titre&order=asc` |

Le premier rendu mesuré dure 1,5 ms et le rendu de la liste actualisée 11,5 ms sur
cette machine. Ces durées sont des observations, pas des seuils de performance.
La preuve de rendu est distincte du test fonctionnel de la temporisation.

## Notes de lecture et suppressions coexistantes

Deux ouvrages jetables ont servi au parcours croisé afin de ne pas altérer les
notes existantes.

| Étape | Observation | Statut |
| --- | --- | --- |
| Lecture | L’état vide des notes est distinct de la fiche bibliographique | Vérifié dans Chrome |
| Ordre et horodatage | L’ordre serveur est conservé et les dates sont rendues en français ; aucune attribution personnelle n’est ajoutée | Automatisé dans `consultation-notes.test.tsx` et `note-lecture.test.ts` |
| Ajout | Un seul POST avec `{ "contenu": "…" }`, note affichée en tête, champ vidé et toast de succès | Vérifié dans Chrome |
| Groupe d’ouvrages | La suppression de l’autre ouvrage est confirmée et affiche « 1 ouvrage à supprimer dans 5 s » avec « Annuler tout » | Vérifié dans Chrome |
| Toast et groupe | Le toast d’ajout de note et le bandeau sont visibles ensemble ; le compteur reste à un ouvrage | Vérifié dans Chrome |
| Suppression de note | Confirmation par date et extrait, DELETE dès la confirmation, disparition de la note, aucune commande d’annulation de note | Vérifié dans Chrome |
| Coexistence après DELETE | Le compteur d’ouvrages et « Annuler tout » restent présents et inchangés | Vérifié dans Chrome |
| Annulation d’ouvrage | « Annuler tout » n’envoie aucun DELETE d’ouvrage et ne restaure pas la note supprimée | Vérifié dans Chrome |
| Résultat incertain | Une réponse interrompue produit un seul POST, aucun rejeu pendant les deux secondes observées, aucun succès, texte intégral conservé | Vérifié dans Chrome |
| Reprise incertaine | « Actualiser les notes » conserve le texte et l’avertissement ; « Renvoyer malgré le risque de doublon » reste disponible | Vérifié dans Chrome |
| Erreurs et courses | 422, 404, 503, expiration, doubles soumissions, temporisations indépendantes et réponses différées | Automatisé dans les tests `ajout-note*`, `suppression-note*` et `consultation-notes` |

## Mode chaos sans authentification

Les lectures ont été dirigées vers l’instance temporaire nominale pour charger le
parcours ; les écritures visées ont été dirigées par DevTools vers la même API
lancée avec 100 % d’échecs et 450 ms de latence. `/health` a confirmé
`authRequise: false`, `tauxEchec: 1` et `latence: 450`.

| Vérification | Observation | Statut |
| --- | --- | --- |
| Cœur optimiste | `aria-checked` passe immédiatement de vrai à faux et la commande se verrouille | Vérifié dans Chrome |
| Verrou partagé | En naviguant vers la fiche pendant le PATCH, cœur et statut du même ouvrage sont verrouillés ; le cœur d’un autre ouvrage reste disponible | Vérifié dans Chrome |
| Refus du cœur | Deux PATCH `{ "favori": false }` avec le réessai temporisé unique, puis valeur vraie restaurée, commande libérée et alerte visible | Vérifié dans Chrome |
| Refus du statut | Valeur immédiatement inversée, deux PATCH `{ "lu": true }`, puis statut initial restauré avec alerte | Vérifié dans Chrome |
| Filtre coups de cœur | La ligne reste visible avec le cœur déjà retiré pendant l’envoi, puis reste visible avec le cœur restauré après refus | Vérifié dans Chrome |
| Filtre de lecture | Une ligne filtrée « Lu » reste visible comme « Non lu » pendant l’envoi, puis revient visiblement à « Lu » après refus | Vérifié dans Chrome |
| Note en 503 | Un seul POST, texte intégral conservé, aucun faux succès et reprise proposée | Vérifié dans Chrome |
| Deux ouvrages concurrents | Le succès d’un ouvrage n’est pas écrasé par le refus d’un autre | Automatisé dans `bascules-provider.test.tsx` |

## Non-régression du lot 1

Une fiche jetable a été créée, corrigée puis retirée après la recette.

| Vérification | Observation | Statut |
| --- | --- | --- |
| Création protégée | Après un 503, titre et auteur restent intacts et aucun succès n’est annoncé ; le réessai manuel crée l’ouvrage, vide le formulaire et affiche le toast | Vérifié dans Chrome |
| Correction protégée | Après un 503, le titre corrigé reste intact ; le réessai envoie uniquement `{ "titre": "… corrigé" }` et la version serveur passe à 2 | Vérifié dans Chrome |
| Retour paginé | Page et critères sont conservés et réactualisés au retour | Vérifié dans Chrome |
| Suppression d’ouvrage | Après confirmation, « Annuler tout » retire le bandeau ; aucun DELETE n’est observé après 5,2 s et la fiche existe encore | Vérifié dans Chrome |
| Suite lot 1 | Les tests de création, correction, fiche, pagination, toast et suppressions restent verts | Automatisé |

## Clavier, accessibilité et petit écran

La synthèse mesurée est conservée dans
[`preuves/lot-2/reprises-mobile.json`](preuves/lot-2/reprises-mobile.json).

| Vérification | Observation | Statut |
| --- | --- | --- |
| Notes au clavier | Le champ, « Ajouter la note », la suppression, « Renoncer » et la confirmation reçoivent le focus avec `tabIndex=0` ; Entrée ajoute, renonce puis supprime réellement | Vérifié dans Chrome |
| Reprises au clavier | Après réponse perdue, Entrée sur « Actualiser les notes » lance le GET sans effacer le texte, puis Entrée sur le renvoi averti déclenche le second POST ; après 503, Entrée relance la suppression et le cœur | Vérifié dans Chrome |
| Cœur au clavier | Entrée bascule le cœur, les deux 503 restaurent sa valeur, puis le réessai focalisé réussit et permet de revenir à la valeur initiale | Vérifié dans Chrome |
| Radios au clavier | Flèche droite depuis « Tous les statuts » sélectionne et focalise « Lus » | Vérifié dans Chrome |
| Panneau mobile | À 390 px, panneau fermé par défaut avec `aria-expanded=false`, puis groupes radio accessibles après ouverture | Vérifié dans Chrome |
| Fiche mobile | Formulaire, résultat incertain, dialogue et reprise de suppression mesurés à 390 × 760 ; le dialogue occupe 358 px entre 16 et 374 px | Vérifié dans Chrome |
| Cibles | 76 éléments visibles dans le fonds et 7 à 10 selon l’état de la fiche ; aucun contrôle mesuré sous 44 × 44 ou sans nom accessible | Vérifié dans Chrome |
| Disposition | Chaque mesure donne `clientWidth=390` et `scrollWidth=390`, donc aucun débordement horizontal | Vérifié dans Chrome |
| Langue et thème | `<html lang="fr">`, libellés français, thème clair et couleurs issues de `theme/` | Vérifié dans Chrome et par inspection statique |

## Contrôles automatisés

Exécutés sur l’arbre final après la consolidation documentaire :

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | 164 fichiers, aucune erreur |
| `npm run typecheck` | Aucune erreur, TypeScript strict |
| `npm test` | 53 fichiers, 273 tests, tous passants |
| `npm run test:coverage` | Lignes 95,79 %, instructions 94,54 %, branches 91,05 %, fonctions 93,61 % |
| `npm run knip` | Aucun signalement |
| `npx expo install --check` | Dépendances à jour |
| `npx expo export --platform web --output-dir /tmp/booklist-web-export` | Export réussi, six routes statiques et 27 fichiers |
| Taille des sources | Maximum observé : 229 lignes dans `components/books/fonds-view.tsx` |

Couverture des couches soumises à l’objectif de 40 % :

| Couche | Lignes | Branches |
| --- | --- | --- |
| `domain/` | 100 % | 94,68 % |
| `services/api/` | 97,26 % | 89,56 % |
| `services/plateforme/` | 93,10 % | 72,22 % |

La suite comprend des règles de domaine, des services HTTP, plus de trois composants
et plusieurs hooks avec transport simulé. Aucun seuil n’a été abaissé. Le contrôle
CI `diff-cover` n’est pas installé localement ; les changements de cette recette
sont documentaires et n’ajoutent aucune ligne source non couverte.

## Répartition de la recette croisée

La matrice suivante permet aux deux membres de relire le parcours développé par
l’autre sans partager un même périmètre d’écriture :

| Personne | Parcours à relire | Preuves à joindre au responsable |
| --- | --- | --- |
| A | Notes : consultation, ajout incertain, suppression immédiate et coexistence avec le groupe d’ouvrages | Captures fiche/alertes, POST et DELETE observés, texte conservé, compteur avant/après |
| B | Fonds : recherche, filtres, tris, pagination, cœurs et statut sous chaos | URLs et GET, profil React DevTools, PATCH, valeurs avant/pendant/après, mesure petit écran |

Cette session a exécuté la recette technique avec un seul agent. La relecture par
les deux personnes de l’équipe et leur visa individuel restent **non vérifiés** et
ne sont pas remplacés par cette matrice.

## Écarts corrigés pendant la consolidation

Aucun défaut applicatif n’a été observé. Deux écarts documentaires ont été corrigés :

- l’ADR 001 décrivait encore la restauration par instantanés du ticket #6, remplacée
  depuis par la coordination commune des bascules du ticket #20 ;
- l’ADR 004 attribuait implicitement une note à « son auteur », alors que les notes
  de lecture sont collectives et sans attribution personnelle.

## Limites et non vérifié

- aucun brouillon durable : recharger ou fermer peut perdre une saisie non envoyée ;
- aucun cache persistant, travail hors ligne, file de mutations ou `POST /sync` ;
- aucune authentification, gestion de rôles ou actualisation de jeton ;
- aucun `If-Match` obligatoire ni résolution de conflits entre libraires ;
- aucune saisie de notation, statistique, internationalisation ou thème sombre ;
- iOS et Android non exécutés sur simulateur ou appareil ;
- ErrorBoundary non déclenchée volontairement dans Chrome, mais testée par composant ;
- courses de réponses anciennes et échec de relecture après PATCH vérifiés par tests
  déterministes, pas reproduits manuellement dans le navigateur ;
- relecture humaine croisée et visa des deux personnes non réalisés pendant cette session.
