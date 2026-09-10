# Architecture de BookList Pro

## Couches

Les dépendances vont de la composition vers le domaine et les services. Le domaine ne dépend ni de React, ni d’Expo, ni du réseau.

| Couche                 | Responsabilité livrée dans les tickets #2, #3, #4, #5, #6, #7, #8 et #16                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                 | Compose Expo Router, TanStack Query, le provider global de suppression, le thème clair et l’ErrorBoundary global. Détient la page consultée dans l’URL et déclenche les navigations. `app/+html.tsx` est l’enveloppe HTML de la version web, rendue à la seule génération du document : elle déclare `lang="fr"` pour les technologies d’assistance.                                                                                                              |
| `features/books/`      | Transforme l’état des hooks en états de présentation, pour le fonds paginé, sa sélection, la fiche et le formulaire partagé d’ajout et de correction. Interprète l’issue d’une écriture et coordonne également le cycle global des suppressions différées.                                         |
| `hooks/`               | Décrit les requêtes et mutations TanStack Query, leurs clés de cache, leur annulation, leur réessai temporisé, la réactualisation au retour, le toast de succès, la durée de ce toast et la temporisation d’un réessai manuel, ainsi que l’accès au contexte de suppression.                      |
| `components/`          | Affiche des props sans connaître le réseau ni le cache. Contient notamment les formulaires, les notes de lecture, cases de sélection, confirmations et bandeaux de suppression. Les états de données sont mutualisés dans `components/etats-donnees.tsx`.                                                     |
| `services/api/`        | Construit les requêtes GET, POST, PATCH et DELETE, applique les en-têtes et le délai d’expiration, traduit les erreurs, valide les réponses et porte la politique de réessai.                                                                                                                     |
| `services/plateforme/` | Expose une interface unique par capacité dépendant de la plateforme, avec une implémentation web et une implémentation par défaut.                                                                                                                                                                |
| `domain/`              | Définit l’ouvrage, la note de lecture, l’enveloppe paginée, le schéma de saisie et les règles pures du groupe de suppressions sans dépendance technique.                                                                                                                                          |
| `theme/`               | Centralise couleurs, espacements, typographie et dimensions accessibles.                                                                                                                                                                                                                          |

## Parcours de consultation livré

1. `app/index.tsx` compose `FondsScreen` sans appel réseau : il lit la recherche et la page demandées dans l’URL et fournit les navigations.
2. `RechercheFonds` conserve seule la saisie immédiate. Son attente repoussable applique la valeur après 300 ms, sans rendre de nouveau la liste pendant les frappes.
3. `FondsScreen` traduit l’état de `useBooksPage` en états de présentation. Une recherche appliquée revient à la page une et vide la sélection, y compris lorsque la première page était déjà affichée.
4. Le hook crée une clé de cache contenant `q`, la page, la limite de vingt et le tri fixe par titre croissant. Seul le serveur recherche, trie et pagine.
5. TanStack Query fournit un `AbortSignal` à `fetchBooksPage`. Un changement de critères annule la requête devenue inutile et chaque combinaison conserve une entrée de cache distincte.
6. `clientHttp` lit `EXPO_PUBLIC_API_URL`, ajoute les en-têtes communs, construit les paramètres et applique un délai d'expiration de dix secondes.
7. `books-api.ts` valide avec Zod l'enveloppe, les ouvrages, les identifiants, les dates, les versions et les autres champs serveur.
8. Une réponse valide rejoint le cache de sa clé. Une réponse invalide ou une erreur HTTP devient une erreur applicative discriminée, jamais une donnée fictive.
9. `FondsView` reçoit un état de chargement, d’erreur ou de succès. Il distingue fonds vide, recherche sans résultat et chargement d’une autre page. Pendant ce dernier, les anciennes lignes restent lisibles, mais leur sélection, la suppression et la pagination sont désactivées jusqu’à la réponse serveur.
10. Si une écriture concurrente fait disparaître la page demandée, `FondsScreen` revient à la dernière page indiquée par le serveur. L’état transitoire conserve une commande « Précédent » au lieu de présenter tout le fonds comme vide.

Une réponse de page ancienne ne remplace pas la page actuellement demandée : les clés sont distinctes et TanStack Query annule l’observation précédente.

## Parcours de la fiche livré

1. Chaque ouvrage de la liste est un bouton accessible. `app/index.tsx` reçoit son identifiant et pousse `/ouvrages/[id]`.
2. `app/ouvrages/[id].tsx` lit l’identifiant de route et compose `FicheScreen`, sans URL ni appel réseau.
3. `useBook` interroge `GET /books/:id` sous la clé `['ouvrages', 'fiche', id]`, distincte des clés de liste et paramétrée par l’identifiant. Les clés vivent dans `hooks/cles-ouvrages.ts`.
4. `fetchBook` valide la réponse avec le même schéma Zod que les éléments de liste et refuse une fiche dont l’identifiant n’est pas celui demandé : identifiant, dates, `version`, `favori`, `note` et `couverture` traversent l’adaptation sans être perdus, et un éditeur vide accepté par le contrat reste valide.
5. Un changement rapide de fiche annule la requête précédente par son `AbortSignal`. Chaque identifiant conservant sa propre entrée de cache, une réponse ancienne ne peut pas remplacer la fiche courante.
6. Un identifiant de route vide n’engage aucune requête et présente directement l’absence. Un `404` devient l’erreur applicative `introuvable`. La fiche présente alors une absence contextualisée, sans chargement infini, sans réessai automatique et sans succès fictif.
7. Les autres échecs restent des erreurs réseau ou de validation : un seul réessai automatique temporisé, puis une action « Réessayer » visible.

## Consultation des notes de lecture

Une fois la fiche bibliographique disponible, `useNotes` interroge `GET /books/:id/notes`. Sa clé `['notes', 'ouvrage', id]` isole les notes de chaque ouvrage des fiches et des listes. Le signal d’annulation fourni par TanStack Query traverse `recupererNotes` et le client HTTP commun.

`notes-api.ts` valide le tableau complet et chacun de ses éléments, vérifie que chaque `livreId` correspond à la fiche demandée et conserve l’ordre de la réponse. La fiche compose ensuite la présentation pure des quatre états des notes : squelette, erreur avec réessai, vide contextualisé et liste en succès. Les dates et heures sont formatées en français dans le domaine. Une erreur propre aux notes reste confinée à cette section et ne remplace jamais les données bibliographiques déjà chargées. L’ajout et la suppression de notes ne sont pas livrés par ce parcours de consultation et restent à venir.

## Retour au fonds

La page consultée et la recherche appliquée sont portées par les paramètres d’URL `page` et `q` de la route racine. Une page inutilisable retombe sur la première page.

Le retour depuis une fiche ne démonte pas l’écran du fonds : `useRafraichirFondsAuFocus` invalide la clé exacte de la recherche et de la page consultées à chaque nouveau focus, jamais au premier affichage. La fiche reçoit aussi ces paramètres de retour afin que son repli sans historique reconstruise le même fonds. Si le fonds a diminué au point de faire disparaître cette page, `FondsScreen` demande la dernière page annoncée par le serveur, comme lors d’une pagination classique.

## Preuve de rendu avec React DevTools

1. Lancer l’API, puis `npm run web`, ouvrir React DevTools et sélectionner l’onglet Profiler.
2. Démarrer un enregistrement, saisir un caractère dans « Rechercher un titre ou un auteur », puis arrêter l’enregistrement avant 300 ms.
3. Ouvrir le commit enregistré : `RechercheFonds` apparaît, tandis que `FondsScreen`, `FondsView` et `OuvragesList` sont absents des composants rendus.
4. Recommencer en laissant passer plus de 300 ms : un second commit contient l’application des critères et le rendu des nouveaux résultats. Le panneau Réseau montre alors un unique `GET /books` avec `q`, `page=1`, `limit=20`, `sort=titre` et `order=asc`.

## Erreurs et reprise

L’union `ErreurApplication` couvre les catégories réseau, validation, introuvable, conflit et authentification. Les tickets #2, #3, #4, #5 et #6 utilisent effectivement les erreurs réseau, de validation et d’absence. Les catégories conflit et authentification ne déclenchent encore aucun parcours fonctionnel.

Une erreur réseau réessayable reçoit un seul nouvel essai automatique après une seconde. Si elle persiste, l’interface expose « Réessayer ». Une erreur de rendu React remonte à l’ErrorBoundary exporté par la racine Expo Router, qui présente également une action de reprise.

## Parcours d’une écriture livré : la création d’un ouvrage

Le ticket #4 livre la création d’un ouvrage par `POST`.

1. `app/index.tsx` pousse `/ouvrages/nouveau` depuis l’en-tête du fonds, présent dans tous ses états, y compris le fonds vide. `app/ouvrages/nouveau.tsx` compose l’écran et fournit le retour au fonds et l’ouverture d’une fiche, sans URL ni appel réseau.
2. `FormulaireOuvrageScreen` tient le formulaire avec React Hook Form et le résolveur du schéma `domain/saisie-ouvrage.ts`. Ce même schéma normalise les espaces périphériques, borne les champs à 200 caractères, impose une année entière entre 1450 et l’année civile suivante et un `lu` booléen strict.
3. La soumission valide produit les valeurs normalisées. L’état de la mutation ferme les champs et la soumission jusqu’au résultat : une réponse tardive ne peut donc pas effacer une saisie commencée entre-temps, et un verrou de rendu écarte une seconde soumission accidentelle.
4. `useCreerOuvrage` déclenche la mutation. Elle n’est jamais réessayée automatiquement : `POST /books` n’est pas idempotent et un second envoi créerait un second ouvrage.
5. `createBook` envoie les cinq champs du lot 1 par le client HTTP commun, éditeur vide inclus comme chaîne et jamais comme `null`, puis valide la réponse `201` avec le même schéma Zod que les lectures.
6. En succès, l’ouvrage validé alimente la clé de sa fiche, les clés de liste sont invalidées de manière ciblée par leur préfixe, le formulaire est vidé, le statut revient à « Non lu » et un toast de cinq secondes propose la fiche créée. Aucune redirection automatique n’a lieu ; l’ouvrage reprend sa place dans le tri serveur au prochain chargement de la liste.
7. En échec, `interpreterEchecCreation` distingue trois issues. Un `422` alimente les champs concernés, même sans message général, sans toucher aux valeurs saisies. Une réponse `503` propose un réessai manuel après temporisation. Une requête sans réponse concluante — coupure ou délai d’expiration dépassé, reconnue par l’absence de statut HTTP — est présentée comme un résultat inconnu : l’ouvrage a peut-être été créé, aucun succès n’est annoncé, et le libraire choisit entre vérifier le fonds et réessayer en étant averti du risque de doublon.

## Parcours d’une écriture livré : la correction d’un ouvrage

Le ticket #5 livre la correction d’un ouvrage par `PATCH`, comme la bascule de statut du ticket #6 décrite plus bas. `PUT` n’est déclenché par aucun composant ; `DELETE` reste réservé au parcours de suppression décrit plus bas.

1. La fiche propose « Corriger cet ouvrage ». `app/ouvrages/[id].tsx` pousse `/ouvrages/[id]/modifier`, qui compose `CorrectionOuvrageScreen` sans URL ni appel réseau.
2. L’écran lit l’ouvrage par `useBook`, donc par la même clé de cache que la fiche. Le chargement affiche un squelette, un `404` une absence contextualisée et tout autre échec un réessai explicite : aucun de ces états ne propose une création déguisée.
3. Une fois l’ouvrage lu, `saisieDepuisOuvrage` remplit les cinq champs du lot 1 et le formulaire est monté une seule fois par identifiant. Une réactualisation ultérieure de la fiche met à jour le cache mais ne réécrit jamais les champs : une saisie modifiée n’est donc pas remplacée par une réponse serveur, et aucune réponse obsolète ne peut la recouvrir. Tant qu’un ouvrage est chargé, l’écran garde le formulaire même si une réactualisation échoue : un incident réseau ne peut pas remplacer la saisie par un écran d’erreur.
4. `FormulaireOuvrageScreen` et `CorrectionOuvrageScreen` partagent `useSaisieOuvrage` : même schéma Zod, même verrouillage pendant l’envoi, mêmes protections contre l’abandon et la double soumission, mêmes issues d’erreur. Seuls les textes et le devenir des valeurs après succès diffèrent, via `TEXTES_CREATION` et `TEXTES_CORRECTION`.
5. La sortie du formulaire de correction est libellée « ← Retour » : elle revient à l’écran précédent, la fiche le plus souvent, et non systématiquement au fonds. À la soumission, `correctionOuvrage` compare les valeurs normalisées à la dernière représentation serveur connue et ne retient que les champs réellement modifiés. `patchBook` envoie ce corps partiel en `PATCH /books/:id` par le client HTTP commun : l’identité, `favori`, `note`, `couverture`, `version` et les horodatages ne sont jamais réécrits par des valeurs initiales arbitraires. `PUT` reste réservé à une représentation complète, non utilisée ici.
6. La réponse `200` est validée par le même schéma Zod que les lectures et refusée si elle porte un autre identifiant. Elle alimente la clé de la fiche et invalide les clés de liste par leur préfixe : la pagination et le tri serveur restent inchangés.
7. Une soumission sans aucune différence n’envoie rien et le dit : elle n’écrit pas une représentation vide et n’annonce aucun succès. Après succès, le formulaire reste ouvert avec les valeurs enregistrées et sans changements en attente — il n’est ni vidé ni remis à « Non lu » — et un toast de cinq secondes propose la fiche, sans redirection automatique.
8. En échec, `interpreterEchecEcriture` distingue les mêmes trois issues que la création : `422` par champ, `503` réessayable après temporisation, résultat inconnu conservant la saisie. Le réessai d’une correction rejoue la même modification sur le même ouvrage : il ne peut pas créer de doublon, ce que dit son avertissement.

## Protection de la saisie

La saisie vit dans le formulaire, jamais dans le cache serveur. Un abandon volontaire d’une saisie modifiée passe par une confirmation rendue dans l’écran. Le départ du document est signalé par `services/plateforme/avertissement-depart`, dont l’implémentation web écoute `beforeunload` et l’implémentation par défaut ne promet rien. Cet avertissement reste soumis aux limites du navigateur : il ne sauvegarde rien, et aucun brouillon persistant ni acceptation d’écriture hors ligne n’est prévu dans ce lot.

## Parcours d’une écriture livré : la bascule du statut de lecture

La bascule du statut collectif suit le chemin route de composition → `FicheScreen` → `useToggleBookReadStatus` → `patchBookReadStatus` → client HTTP partagé → API.

1. Le composant pur expose un contrôle de rôle `switch`, son état coché et l’action correspondant au statut collectif affiché.
2. Le hook annule les lectures actives de la fiche et des listes, en mémorise les caches puis applique immédiatement le booléen demandé.
3. Le service envoie `PATCH /books/:id` avec uniquement `{ lu }`. Le client partagé fournit l’URL, les en-têtes, l’expiration et la traduction des erreurs.
4. `books-api.ts` valide la réponse complète avec Zod et vérifie son identifiant.
5. Une réponse confirmée remplace l’ouvrage dans la fiche et les pages déjà en cache, puis invalide ces seules familles de clés. Les autres champs proviennent de la réponse serveur et restent préservés.
6. Un refus de la dernière intention restaure les instantanés et produit un message avec réessai. Une indisponibilité réessayable attend une seconde avant un unique nouvel essai automatique.
7. Chaque intention est séquencée localement : une réponse plus ancienne ne peut pas remplacer l’état d’une intention plus récente.

L’opération `PUT` n’est déclenchée par aucun composant dans ce périmètre.

## Parcours de la suppression différée

1. `FondsScreen` conserve uniquement les identifiants sélectionnés sur la page affichée et remet cette sélection à zéro au changement de page. `FondsView` expose les cases accessibles et la barre de suppression sans connaître le groupe ni le réseau.
2. La liste ou la fiche ouvre le même composant pur de confirmation, qui récapitule les titres concernés. Renoncer ne change ni le cache ni le groupe.
3. Après confirmation, les deux points d’entrée transmettent les identifiants et les titres au même `SuppressionsProvider`. Les règles de `domain/groupe-suppressions.ts` les fusionnent sans doublon et fixent une nouvelle échéance commune à cinq secondes.
4. Le contexte masque les ouvrages du fonds et leur fiche sans modifier les données serveur. Le provider étant au-dessus de la pile Expo Router, groupe, compteur et « Annuler tout » survivent aux navigations internes.
5. « Annuler tout » vide seulement un groupe encore en attente. Aucun DELETE n’a alors été envoyé et les données cachées redeviennent visibles.
6. À l’échéance, le domaine passe le groupe en envoi. Le provider interdit les nouvelles suppressions depuis la liste et la fiche sans bloquer la consultation, puis déclenche la mutation TanStack Query du groupe.
7. La mutation appelle `deleteBook` pour chaque identifiant. `clientHttp` centralise l’URL, les en-têtes, le délai d’expiration et la traduction des erreurs. Seule une réponse vide `204` confirme une suppression.
8. Les fiches réussies sont retirées du cache et toutes les clés de listes sont invalidées. Le rechargement serveur permet au fonds de revenir à la dernière page disponible si la page courante disparaît.
9. Seuls les ouvrages en échec redeviennent visibles dans un message persistant. Leur réessai repasse par la confirmation et un nouveau groupe annulable de cinq secondes ; les réussites ne sont jamais rejouées.

Le groupe n’est ni persistant ni atomique. Fermer ou recharger avant l’échéance abandonne les intentions sans envoyer de requête. Après le départ d’un DELETE, aucune annulation serveur n’est garantie et aucune fiche supprimée n’est recréée.

## Adaptation de plateforme

Les parcours livrés utilisent les interfaces communes de React Native, le transport `fetch` et le routage Expo Router. La page consultée voyageant dans l’URL, le retour navigateur et le retour de pile mobile aboutissent au même état.

L’avertissement de départ du document passe par l’interface `services/plateforme/avertissement-depart.ts`, dont Metro sélectionne l’implémentation `.web.ts` sur la cible web.

React Native Web rend une `Pressable` de rôle `checkbox` comme un élément non natif et n’associe pas la touche Espace à `onPress`. `services/plateforme/activation-clavier.ts` fournit cette adaptation sur le web sans transmettre de prop supplémentaire sur mobile.
