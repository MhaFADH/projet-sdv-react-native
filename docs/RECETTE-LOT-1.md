# Recette du lot 1

Compte rendu de la recette croisée demandée par l'issue #9. Chaque ligne distingue
ce qui est **automatisé** (couvert par `npm test`), **vérifié manuellement** dans le
navigateur pendant cette session, ou **non vérifié**. Aucun comportement non observé
n'est déclaré réussi.

## Environnement de recette

| Élément | Valeur observée |
| --- | --- |
| Client | `npx expo start --web`, Expo SDK 54, Metro, React Compiler activé |
| Navigateur | Chrome piloté par le protocole DevTools |
| API nominale | `api-books-v2` sur `http://localhost:3000`, `authRequise: false`, 500 ouvrages |
| API dégradée | seconde instance sur `http://localhost:3001`, `CHAOS_LATENCE` et `CHAOS_ECHEC` variables |
| Configuration | `EXPO_PUBLIC_API_URL`; `.env.local` (ignoré par Git) prime sur `.env` |

L'API n'a pas été modifiée. L'instance dégradée est une seconde exécution du même
projet voisin, lancée sur un autre port ; elle a été arrêtée en fin de recette.

### Piège de configuration rencontré

Passer `EXPO_PUBLIC_API_URL` uniquement par l'environnement du shell **ne suffit
pas** : Expo charge `.env` et sa valeur l'emporte. Le journal de démarrage
(`env: load .env.local .env`) indique l'ordre réel. Les premières mesures en mode
dégradé ont donc visé l'API nominale et ont été refaites après création d'un
`.env.local`. À retenir pour toute recette ultérieure.

## Prérequis et lancement

| Vérification | Résultat |
| --- | --- |
| `.nvmrc` = `22.23.1`, cohérent avec le README | Vérifié manuellement |
| `.env.example` présent et suffisant (`EXPO_PUBLIC_API_URL=http://localhost:3000`) | Vérifié manuellement |
| API atteignable sans authentification (`/health` → `authRequise: false`) | Vérifié manuellement |
| `npx expo start --web` sert le fonds dans le navigateur | Vérifié manuellement |
| Parcours du guide de lancement en moins de cinq minutes | Vérifié manuellement |

## Scénario nominal

Exécuté de bout en bout contre l'API nominale.

| Étape | Observation | Statut |
| --- | --- | --- |
| Parcourir les pages | `Suivant` porte la page dans l'URL (`/?page=2`), « Page 3 sur 25 · 500 ouvrages » | Vérifié manuellement |
| Restituer la page par l'URL | Ouvrir `/?page=3` affiche bien la page 3 | Vérifié manuellement |
| Consulter une fiche | `GET /books/:id`, tous les champs et le statut collectif affichés | Vérifié manuellement |
| Retour au fonds | Revient sur `/?page=3`, page consultée conservée | Vérifié manuellement |
| Ajouter un ouvrage | Année vide et statut « Non lu » à l'ouverture ; soumission vide → trois erreurs par champ en français | Vérifié manuellement |
| Créer | `POST /books`, toast « … a été ajouté au fonds. », formulaire vidé, statut remis à « Non lu » | Vérifié manuellement |
| Suivre le bouton du toast | « Ouvrir la fiche » navigue vers la fiche créée | Vérifié manuellement |
| Corriger la fiche | `PATCH /books/:id` avec le **seul** champ modifié (`{"titre":"…"}`) | Vérifié manuellement |
| Soumettre sans modification | Aucune écriture réseau, message « Aucune modification à enregistrer : la fiche est déjà à jour. » | Vérifié manuellement |
| Basculer le statut | `role="switch"` + `aria-checked`, bascule immédiate, `PATCH` du seul champ `lu`, valeur serveur incrémentée | Vérifié manuellement |
| Supprimer depuis une fiche | Confirmation nominative, bandeau, `DELETE` après cinq secondes, fiche ensuite « Cette fiche n'est plus disponible » | Vérifié manuellement |
| Supprimer par sélection | Confirmation récapitulant les titres, masquage, `DELETE` à expiration | Vérifié manuellement |

Le toast disparaît bien au bout de cinq secondes : lors d'un premier essai, le clic
sur « Ouvrir la fiche » est arrivé après ce délai et n'a donc rien ouvert. Le
parcours a été refait dans la fenêtre de cinq secondes pour confirmer la navigation.

## Suppression différée et coexistence

| Vérification | Observation | Statut |
| --- | --- | --- |
| Compteur commun | « 1 ouvrage à supprimer dans 5 s », décompte jusqu'à 1 s | Vérifié manuellement |
| Remise à cinq secondes à chaque ajout | 1 ouvrage à 3 s, puis second ajout → « 2 ouvrages à supprimer dans **5 s** » | Vérifié manuellement |
| Compteur de sélection réinitialisé | Après confirmation, la barre repasse à « 0 sélectionnés — Supprimer » | Vérifié manuellement |
| « Annuler tout » | Bandeau retiré, lignes restaurées, **aucun `DELETE`** observé | Vérifié manuellement |
| Aucune fiche recréée | L'annulation précède l'envoi : aucun `POST` de recréation, l'annulation n'invente pas de restauration serveur | Vérifié manuellement |
| Navigation interne | Le bandeau et son décompte survivent au passage liste → `/ouvrages/nouveau` | Vérifié manuellement |
| Toast et bandeau ensemble | Une création réussie affiche son toast **sans** remplacer le bandeau d'annulation, bouton « Ouvrir la fiche » compris | Vérifié manuellement |
| Sélection non traversante | Sélection de deux lignes, changement de page → « 0 sélectionnés » ; le retour ne restaure pas la sélection | Vérifié manuellement |
| Pauses au survol et au focus du toast | `onHoverIn`/`onHoverOut` et `onFocus`/`onBlur`, sous horloge contrôlée | Automatisé — voir la limite ci-dessous |
| Blocage des nouvelles suppressions pendant l'envoi | `suppressionDesactivee` propagé à la barre, aux fiches et à la confirmation | Automatisé |

## Recette sous latence et erreurs 503

Contre l'instance dégradée, avec `.env.local` pointant sur elle.

| Vérification | Observation | Statut |
| --- | --- | --- |
| Squelettes sous latence | `CHAOS_LATENCE=1500` : `role="progressbar"`, libellé « Chargement des ouvrages », aucune ligne pendant l'attente | Vérifié manuellement |
| Erreur de lecture avec réessai | 503 permanent : `role="alert"` « Impossible de charger le fonds » + bouton « Réessayer » | Vérifié manuellement |
| Réessai temporisé unique de la bascule | Exactement **deux** `PATCH` (immédiat puis ~1 s plus tard), aucun autre | Vérifié manuellement |
| Verrouillage pendant l'envoi de la bascule | `aria-disabled="true"` pendant les deux tentatives | Vérifié manuellement |
| Restauration de la bascule optimiste | Après échec : valeur revenue à « Non lu », contrôle déverrouillé, `role="alert"` « Le statut précédent a été restauré. … » + « Réessayer » | Vérifié manuellement |
| Réessai manuel de la bascule | API rétablie : le réessai aboutit, la valeur serveur est enregistrée, l'alerte disparaît | Vérifié manuellement |
| Conservation de la saisie sur 503 | Formulaire : « Le service est temporairement indisponible… Votre saisie est conservée. » + « Réessayer l'enregistrement », les quatre champs intacts | Vérifié manuellement |
| Verrouillage du formulaire pendant l'envoi | Champs en `readOnly`, bouton `aria-disabled="true"` et libellé « Enregistrement en cours… » | Vérifié manuellement |
| Création au résultat incertain | Serveur arrêté : **un seul** `POST`, aucun réessai automatique, « Aucune réponse du serveur : l'ouvrage a peut-être été créé. » + avertissement de doublon + « Vérifier dans le fonds » / « Réessayer malgré le risque de doublon », saisie conservée | Vérifié manuellement |
| Ni faux succès ni réessai automatique | Aucun message de succès et aucune seconde requête sur résultat inconnu | Vérifié manuellement |
| Échecs de suppression | Deux `DELETE` en 503 : les deux lignes réapparaissent, `role="alert"` « Certaines suppressions ont échoué » listant les deux titres + « Réessayer » | Vérifié manuellement |
| Réessai des seuls échecs | Le réessai repasse par la confirmation (deux titres), redonne cinq secondes, envoie **exactement deux** `DELETE` (204), alerte résorbée | Vérifié manuellement |

## Accessibilité, clavier et petit écran

| Vérification | Observation | Statut |
| --- | --- | --- |
| Rôles, libellés et états | Cases `role="checkbox"` + `aria-checked` + libellé « Sélectionner <titre> » ; bascule `role="switch"` + `aria-checked` + `aria-disabled` ; squelette `role="progressbar"` ; erreurs `role="alert"` | Vérifié manuellement |
| Ordre de tabulation du formulaire | Titre → auteur → éditeur → année → statut → soumission, avec anneau de focus visible | Vérifié manuellement |
| Tabulation dans la liste | Cases et lignes en `tabIndex=0` ; la barre désactivée sort de l'ordre de tabulation (`tabIndex=-1`) | Vérifié manuellement |
| Activation par Espace | Espace sur une case focalisée la sélectionne, la barre passe à « 1 sélectionné — Supprimer » | Vérifié manuellement |
| Cibles de 44 points | 44 éléments interactifs mesurés à 390×760, **aucun** sous 44×44 | Vérifié manuellement |
| Petit écran sans défilement horizontal | `scrollWidth` = 390 pour une fenêtre de 390 px | Vérifié manuellement |
| Thème clair et couleurs partagées | Toutes les couleurs proviennent de `theme/tokens.ts`; `userInterfaceStyle: "light"` | Vérifié manuellement |
| Langue française du document | **Écart corrigé pendant cette recette** — voir ci-dessous | Vérifié manuellement |
| ErrorBoundary global — refus réseau | Un 503 n'active jamais l'écran global : il produit l'état d'erreur de l'écran concerné | Vérifié manuellement |
| ErrorBoundary global — erreur de rendu | Rôle `alert`, titre, message et « Réessayer » | Automatisé — non déclenché en navigateur |

## Écart découvert et corrigé

**Langue du document HTML.** À 390×760, le document était servi avec
`<html lang="en">` alors que toutes les chaînes visibles sont en français. Les
technologies d'assistance s'appuient sur cet attribut pour la prononciation.

Correction : ajout de `app/+html.tsx`, l'enveloppe HTML de la version web
d'Expo Router, déclarant `lang="fr"` et conservant la réinitialisation de style
`ScrollViewStyleReset`. Vérifié ensuite sur les deux instances : `lang="fr"` est
servi et le fonds s'affiche normalement.

Non-régression : `__tests__/app/html.test.tsx` vérifie la langue déclarée et la
place du contenu dans le corps du document. Ce test inspecte l'arbre d'éléments,
car l'enveloppe n'est rendue qu'à la génération du document et `expo-router/html`
est publié en JSX non transpilé que Vite refuse d'analyser.

Aucun autre écart fonctionnel n'a été constaté. Aucun ajout hors lot 1.

## Fausse piste écartée

Une session de mesure a d'abord conclu à une perte silencieuse d'écriture : sur
503, la bascule restait verrouillée sur sa valeur optimiste, sans réessai, sans
restauration et sans message. La cause s'est révélée être **l'onglet d'automatisation
lui-même** : `document.hidden` valait `true`, et TanStack Query met ses réessais en
pause tant que `focusManager.isFocused()` est faux — comportement voulu de la
bibliothèque, qui évite de réessayer dans un onglet d'arrière-plan.

Les mesures ont été refaites après avoir rétabli la condition d'un onglet visible ;
le comportement documenté (réessai temporisé unique, restauration, message et
réessai manuel) est alors intégralement conforme. Une modification de
`networkMode` avait été introduite sur la base de ce diagnostic erroné : elle a
été **entièrement annulée**, le diagnostic ne la justifiant pas. Aucune trace n'en
subsiste dans l'arbre de travail.

## Résultats des contrôles

Exécutés sur l'arbre de travail final.

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Format et lint | `npm run check` | 95 fichiers vérifiés, aucune erreur |
| Typage | `npm run typecheck` | Aucune erreur, mode strict |
| Tests | `npm test` | 28 fichiers, **131 tests**, tous passants |
| Couverture | `npm run test:coverage` | Lignes **91,87 %**, instructions 90,57 %, branches 86,92 % |
| Code et dépendances inutilisés | `npm run knip` | Aucun signalement |
| Versions Expo | `npx expo install --check` | « Dependencies are up to date » |

Couverture par couche visée par `AGENTS.md` (cible ≥ 40 %) :

| Couche | Instructions | Lignes |
| --- | --- | --- |
| `domain/` | 96,03 % | 100 % |
| `services/api/` | 95,08 % | 95,65 % |
| `services/plateforme/` | 77,27 % | 88,23 % |

Aucun seuil n'a été abaissé. Les deux fichiers ajoutés sont couverts, ce qui
préserve le contrôle CI de 70 % sur les lignes modifiées (`diff-cover`), non
exécutable localement faute d'installation.

Répartition des tests : règles de domaine pures (`domain/`), client HTTP et
adaptateurs (`services/`), composants de présentation (`fonds-view`,
`fiche-view`, `selection-fonds-view`, `global-error-view`) et hooks de données
avec transport simulé (`use-books-page`, `use-book`, `use-toggle-book-read-status`,
`use-rafraichir-fonds-au-focus`).

## Non vérifié

À déclarer comme tel, sans présomption de réussite :

- **Déclenchement réel de l'ErrorBoundary** en navigateur : aucune erreur de rendu
  n'a été provoquée volontairement. Seul le composant est testé.
- **Pause du toast au survol réel de la souris** : les événements de pointeur
  synthétiques ne produisent pas de `mouseenter` sur un élément monté après le
  déplacement du curseur. Le comportement est couvert par les tests sous horloge
  contrôlée, pas par une observation navigateur.
- **iOS et Android** : aucune exécution sur simulateur ou appareil. La cible
  prioritaire du lot est le navigateur ; la compatibilité mobile n'est vérifiée
  que par la compilation TypeScript et l'usage d'API React Native.
- **Redimensionnement réel de la fenêtre** : la fenêtre pilotée refusait le
  redimensionnement. Le petit écran a été mesuré dans un cadre de 390×760, ce qui
  fournit une vraie fenêtre d'affichage mais pas un vrai appareil.
- **Authentification, hors ligne et conflits** : hors périmètre du lot 1, non
  implémentés, non testés et annoncés nulle part comme acquis.

## Effets de bord sur les données

La recette écrit dans le fonds. Les ouvrages créés pour les besoins des essais ont
été supprimés en fin de session ; un ouvrage `Recette Navigateur Lot 1`, antérieur
à cette session, a été laissé en place. Quelques ouvrages du jeu de données initial
ont été réellement supprimés par les essais de suppression, et un ouvrage de test
antérieur (`Recette Toast Survol`) a servi de cible à l'essai de suppression depuis
une fiche. `npm run seed` régénère le jeu de données du projet voisin si besoin.

Les écritures effectuées contre l'instance dégradée du port 3001 partagent le
répertoire de données du projet voisin : après arrêt de cette instance, l'état
retenu est celui de l'instance nominale.
