# Architecture de BookList Pro

## Couches

Les dépendances vont de la composition vers le domaine et les services. Le domaine ne dépend ni de React, ni d’Expo, ni du réseau.

| Couche                 | Responsabilité livrée dans les tickets #2, #3, #4, #5, #6, #7, #8 et #16                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                 | Compose Expo Router, TanStack Query, le provider global de suppression, le thème clair et l’ErrorBoundary global. Détient la page consultée dans l’URL et déclenche les navigations. `app/+html.tsx` est l’enveloppe HTML de la version web, rendue à la seule génération du document : elle déclare `lang="fr"` pour les technologies d’assistance.                                                                                                              |
| `features/books/`      | Transforme l’état des hooks en états de présentation, pour le fonds paginé, sa sélection, la fiche et le formulaire partagé d’ajout et de correction. Interprète l’issue d’une écriture et coordonne également le cycle global des suppressions différées.                                         |
| `features/notes/`      | Coordonne la saisie et la suppression d’une note de lecture : formulaire, verrouillage, issues d’écriture, abandon confirmé, confirmation de suppression, et traduction de la requête des notes en états de présentation.                                                                          |
| `hooks/`               | Décrit les requêtes et mutations TanStack Query, leurs clés de cache, leur annulation, leur réessai temporisé, la réactualisation au retour, le toast de succès, la durée de ce toast et la temporisation d’un réessai manuel, ainsi que l’accès au contexte de suppression.                      |
| `components/`          | Affiche des props sans connaître le réseau ni le cache. Contient notamment les formulaires, les notes de lecture, cases de sélection, confirmations et bandeaux de suppression. Les états de données sont mutualisés dans `components/etats-donnees.tsx`.                                                     |
| `services/api/`        | Construit les requêtes GET, POST, PATCH et DELETE, applique les en-têtes et le délai d’expiration, traduit les erreurs, valide les réponses, porte la politique de réessai et classe ce qu’une écriture échouée permet de conclure (`issue-ecriture.ts`).                                          |
| `services/plateforme/` | Expose une interface unique par capacité dépendant de la plateforme, avec une implémentation web et une implémentation par défaut.                                                                                                                                                                |
| `domain/`              | Définit l’ouvrage, la note de lecture, l’enveloppe paginée, les schémas de saisie d’un ouvrage et d’une note et les règles pures du groupe de suppressions sans dépendance technique.                                                                                                             |
| `theme/`               | Centralise couleurs, espacements, typographie et dimensions accessibles.                                                                                                                                                                                                                          |

## Parcours de consultation livré

1. `app/index.tsx` compose `FondsScreen` sans appel réseau : il lit dans l’URL la page, la recherche, les filtres, le tri et l’ordre, puis fournit les navigations.
2. `RechercheFonds` conserve seule la saisie immédiate. Son attente repoussable applique la valeur après 300 ms, sans rendre de nouveau la liste pendant les frappes.
3. `FondsScreen` traduit l’état de `useBooksPage` en états de présentation. Tout changement de critère revient à la page une et vide la sélection, y compris lorsque la première page était déjà affichée.
4. Le hook crée une clé de cache contenant `q`, `status`, `favori`, `sort`, `order`, la page et la limite de vingt. Seul le serveur recherche, filtre, trie et pagine.
5. TanStack Query fournit un `AbortSignal` à `fetchBooksPage`. Un changement de critères annule la requête devenue inutile et chaque combinaison conserve une entrée de cache distincte.
6. `clientHttp` lit `EXPO_PUBLIC_API_URL`, ajoute les en-têtes communs, construit les paramètres et applique un délai d'expiration de dix secondes.
7. `books-api.ts` valide avec Zod l'enveloppe, les ouvrages, les identifiants, les dates, les versions et les autres champs serveur.
8. Une réponse valide rejoint le cache de sa clé. Une réponse invalide ou une erreur HTTP devient une erreur applicative discriminée, jamais une donnée fictive.
9. `FondsView` reçoit un état de chargement, d’erreur ou de succès. Il distingue fonds vide, critères sans résultat et chargement d’une autre page. Une barre d’outils unique empile les zones « Affiner » puis « Trier » sur écran large ; un panneau replié avec résumé la remplace sur petit écran. Les groupes radio conservent un seul arrêt de tabulation et répondent aux flèches, à Début et à Fin. Pendant le chargement d’une autre page, les anciennes lignes restent lisibles, mais leur sélection, la suppression et la pagination sont désactivées jusqu’à la réponse serveur.
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

`notes-api.ts` valide le tableau complet et chacun de ses éléments, vérifie que chaque `livreId` correspond à la fiche demandée et conserve l’ordre de la réponse. `construireEtatNotes` traduit la requête en quatre états de présentation pure : squelette, erreur avec réessai, vide contextualisé et liste en succès. Les dates et heures sont formatées en français dans le domaine. Une erreur propre aux notes reste confinée à cette section et ne remplace jamais les données bibliographiques déjà chargées.

## Retour au fonds

La page et la consultation sont portées par les paramètres d’URL `page`, `q`, `status`, `favori`, `sort` et `order` de la route racine. Les lecteurs purs de `domain/criteres-ouvrages.ts` valident les valeurs discrètes et appliquent titre croissant par défaut.

Le retour depuis une fiche ne démonte pas l’écran du fonds : `useRafraichirFondsAuFocus` invalide la clé complète de la consultation à chaque nouveau focus, jamais au premier affichage. La fiche reçoit aussi ces paramètres de retour afin que son repli sans historique reconstruise le même fonds. Si le résultat filtré a diminué au point de faire disparaître cette page, `FondsScreen` demande la dernière page annoncée par le serveur.

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

## Parcours d’une écriture livré : les bascules cœur et lecture

Le ticket #20 réunit les deux bascules collectives d’un ouvrage — coup de cœur et statut de lecture — derrière une coordination unique. Le chemin est route de composition → `FondsScreen` ou `FicheScreen` → `useBascules` → `BasculesProvider` → `patchBasculeOuvrage` → client HTTP partagé → API. Le coup de cœur est une recommandation collective, sans attribution individuelle et indépendante du statut : un ouvrage non lu peut être un coup de cœur.

`BasculesProvider` est monté à la racine, à côté du fournisseur des suppressions. C’est ce qui permet au verrou d’un ouvrage de valoir dans toutes ses vues, y compris lorsque le libraire navigue de la liste vers la fiche pendant l’envoi : l’état ne vit pas dans l’écran qui a déclenché la bascule.

1. Les composants purs exposent un cœur de rôle `switch` sur chaque ligne du fonds et sur la fiche, avec libellé, état coché, état désactivé et cible de 44 points. Dans la liste, le cœur est un frère du bouton d’ouverture et de la case de sélection, jamais un descendant : un clic sur le cœur ne peut donc ni ouvrir la fiche ni modifier la sélection de suppression. Le statut de lecture reste modifiable sur la fiche et dans le formulaire, sans nouvelle bascule dans la liste.
2. Une intention `{ id, champ, valeur }` est enregistrée dans le fournisseur, puis **superposée au rendu** aux données servies par TanStack Query. L’effet est immédiat, avant toute réponse. Ce choix a deux conséquences voulues : une actualisation concurrente ne peut pas masquer l’intention locale en cours, et le retour arrière n’a aucun instantané de page à restaurer.
3. Une seule bascule peut être en cours par ouvrage : tant qu’un envoi existe pour un identifiant, ses commandes cœur et lecture sont verrouillées dans toutes ses vues et une nouvelle intention est ignorée. Les autres ouvrages restent pleinement interactifs.
4. Le service envoie `PATCH /books/:id` avec le seul champ visé, `{ favori }` ou `{ lu }`, conformément au README de l’API. Le client partagé fournit l’URL, les en-têtes, l’expiration et la traduction des erreurs. `books-api.ts` valide la réponse complète avec Zod, vérifie son identifiant et conserve les données serveur utiles, dont `version`.
5. Une réponse confirmée remplace l’ouvrage dans la clé de fiche et dans les pages déjà en cache, puis invalide ces seules familles de clés. L’intention locale n’est retirée qu’après cette écriture : la ligne ne repasse jamais par l’ancienne valeur.
6. Sous filtre actif, la ligne d’un ouvrage qui cesse de correspondre est conservée pendant l’envoi, en affichant déjà la nouvelle valeur. Après succès, la relecture serveur la retire. Après refus, l’intention est simplement abandonnée et la valeur précédente réapparaît sans que la ligne ait disparu puis réapparu. La règle vaut pour le coup de cœur comme pour lu/non lu.
7. Un refus retire l’intention — ce qui restaure la valeur précédente de ce seul ouvrage, sans toucher à une mutation réussie sur un autre — et produit un message attaché à l’ouvrage concerné, avec réessai. Une indisponibilité réessayable attend une seconde avant un unique nouvel essai automatique.
8. Un échec de la relecture qui suit un `PATCH` confirmé est distinct d’un refus : la valeur confirmée reste affichée, l’interface annonce l’échec d’actualisation et propose de réessayer la lecture. Elle n’annonce jamais l’annulation d’une écriture déjà acquise. Dans le fonds, cet échec est celui de la requête de liste et garde son propre message neutre.
9. Deux ouvrages dont les requêtes se terminent dans un ordre différent, l’un en succès et l’autre en échec, conservent chacun leur propre issue : c’est la course réellement atteignable, et elle est couverte par les tests. À l’intérieur d’un même ouvrage, le verrou empêche déjà une seconde intention concurrente ; la séquence conservée par envoi n’est qu’une garde défensive contre une réponse qui arriverait après l’abandon de son intention.
10. Le `PATCH` d’une bascule ne transmet pas d’`AbortSignal`. Annuler une écriture déjà partie en laisserait le résultat inconnu, ce que l’invariant du projet interdit d’ignorer silencieusement ; l’obsolescence est traitée par la séquence, pas par l’annulation. Les lectures, elles, restent annulables.

Les bascules déclarent `networkMode: 'always'`. Par défaut, TanStack Query met une mutation en pause lorsqu’il juge l’application hors ligne : la bascule resterait sans résultat ni erreur et le verrou de l’ouvrage ne se libérerait jamais. Ce lot n’offrant aucune file d’attente hors ligne, un échec doit rester visible et réessayable plutôt que mis en attente silencieusement. Ce réglage est aujourd’hui limité aux bascules ; l’étendre aux autres écritures livrées relève d’une décision du responsable.

Ce verrouillage traite la **concurrence locale** des bascules d’un même poste : il empêche deux intentions simultanées sur un même ouvrage et l’écrasement d’une réponse par une autre. Il ne résout pas les écritures concurrentes de plusieurs libraires sur le serveur. Aucun en-tête `If-Match` n’est envoyé et aucune réponse `409` n’est interprétée dans ce parcours : le contrôle de version obligatoire et la résolution des conflits restent hors du lot 2.

L’opération `PUT` n’est déclenchée par aucun composant dans ce périmètre.

## Parcours de la suppression différée

1. `FondsScreen` conserve uniquement les identifiants sélectionnés sur la page affichée et remet cette sélection à zéro au changement de page. `FondsView` expose les cases accessibles sans connaître le groupe ni le réseau ; l’action de suppression compacte n’est montée que lorsque la sélection contient au moins un ouvrage.
2. La liste ou la fiche ouvre le même composant pur de confirmation, qui récapitule les titres concernés. Renoncer ne change ni le cache ni le groupe.
3. Après confirmation, les deux points d’entrée transmettent les identifiants et les titres au même `SuppressionsProvider`. Les règles de `domain/groupe-suppressions.ts` les fusionnent sans doublon et fixent une nouvelle échéance commune à cinq secondes.
4. Le contexte masque les ouvrages du fonds et leur fiche sans modifier les données serveur. Le provider étant au-dessus de la pile Expo Router, groupe, compteur et « Annuler tout » survivent aux navigations internes.
5. « Annuler tout » vide seulement un groupe encore en attente. Aucun DELETE n’a alors été envoyé et les données cachées redeviennent visibles.
6. À l’échéance, le domaine passe le groupe en envoi. Le provider interdit les nouvelles suppressions depuis la liste et la fiche sans bloquer la consultation, puis déclenche la mutation TanStack Query du groupe.
7. La mutation appelle `deleteBook` pour chaque identifiant. `clientHttp` centralise l’URL, les en-têtes, le délai d’expiration et la traduction des erreurs. Seule une réponse vide `204` confirme une suppression.
8. Les fiches réussies sont retirées du cache et toutes les clés de listes sont invalidées. Le rechargement serveur permet au fonds de revenir à la dernière page disponible si la page courante disparaît.
9. Seuls les ouvrages en échec redeviennent visibles dans un message persistant. Leur réessai repasse par la confirmation et un nouveau groupe annulable de cinq secondes ; les réussites ne sont jamais rejouées.

Le groupe n’est ni persistant ni atomique. Fermer ou recharger avant l’échéance abandonne les intentions sans envoyer de requête. Après le départ d’un DELETE, aucune annulation serveur n’est garantie et aucune fiche supprimée n’est recréée.

## Parcours d’une écriture livré : l’ajout d’une note de lecture

Le ticket #17 livre l’ajout d’une note par `POST /books/:id/notes`, en réutilisant le socle d’écriture du lot 1 : un seul client HTTP, un seul modèle d’erreurs, un seul socle de notification et une seule confirmation d’abandon. Les composants partagés vivent désormais à la racine de `components/` (`toast-succes.tsx`, `messages-ecriture.tsx`, `confirmation-abandon.tsx`) puisqu’ils ne sont plus propres aux ouvrages.

1. `FicheScreen` détient la saisie : il appelle `useSaisieNote` hors du basculement d’état de la fiche et passe la section des notes à `FicheView` par une prop de composition. Une erreur de lecture, un `404` ou le masquage d’un ouvrage en attente de suppression ne peuvent donc pas démonter le formulaire et effacer une saisie non confirmée. La section reste montée dans tous ces états, ce qui garde aussi la confirmation d’abandon atteignable : la démonter rendrait le retour au fonds silencieux pour un libraire ayant une saisie en cours. Seul le chargement initial de la fiche, où aucune saisie ne peut encore exister, ne la monte pas.
2. Le formulaire est tenu par React Hook Form et le résolveur de `domain/saisie-note.ts`. Ce schéma applique les règles réellement vérifiées par l’API : contenu obligatoire après retrait des espaces périphériques, 1 000 caractères au maximum. Le compteur affiche cette longueur normalisée, c’est-à-dire ce qui partira au serveur.
3. Une soumission invalide n’engage aucune requête. Pendant l’envoi, le champ passe en lecture seule et la soumission comme l’effacement sont désactivés ; un verrou de rendu écarte en plus une seconde soumission accidentelle. Le champ étant verrouillé, aucune saisie plus récente ne peut être effacée par une réponse tardive.
4. `useAjouterNote` déclare `retry: false` : `POST /books/:id/notes` n’est pas idempotent et un second envoi créerait une seconde note. Cette écriture ne transmet volontairement aucun `AbortSignal`, contrairement aux lectures : abandonner la requête en vol produirait exactement le résultat incertain que le parcours cherche à éviter. Il en va de même pour la suppression d’une note.
5. `ajouterNote` envoie le seul champ `contenu` par le client HTTP commun, puis valide la réponse `201` avec le même schéma Zod que la lecture et refuse une note rattachée à un autre ouvrage.
6. En succès, la note validée est insérée en tête de la seule clé `['notes', 'ouvrage', id]`. Les clés de fiche et de liste ne sont pas touchées, le champ est vidé, le libraire reste sur la fiche et un toast de cinq secondes confirme l’ajout. Ce toast est rendu dans la fiche, indépendamment du bandeau global de suppression : le succès d’une note ne remplace pas le bandeau, ne réinitialise pas son compteur et n’entre pas dans son groupe.
7. En échec, `interpreterEchecAjoutNote` distingue quatre issues. Un `422` alimente le champ `contenu` avec le message du serveur, comme pour les ouvrages. Un `404` est une réponse concluante : la note n’a pas été enregistrée, le texte reste affiché et l’envoi est ensuite suspendu tant que la fiche répond `404`. Un `503` propose un réessai manuel après temporisation. Une requête sans réponse concluante — coupure ou délai d’expiration dépassé, reconnue par l’absence de statut HTTP — est présentée comme un résultat incertain : aucun succès n’est annoncé, la note a peut-être été enregistrée, et le libraire choisit entre actualiser les notes pour vérifier et renvoyer en étant averti du risque de doublon.
8. L’actualisation de vérification refait uniquement `GET /books/:id/notes` : elle ne renvoie pas la note, n’efface ni la saisie ni l’avertissement, et ne présente pas une note au contenu identique comme la preuve que l’envoi incertain a abouti.
9. Un abandon volontaire — bouton « Effacer la saisie » ou retour au fonds — passe par la confirmation partagée. Le départ du document reste couvert par `services/plateforme/avertissement-depart`, avec les mêmes limites qu’au lot 1 : aucun brouillon persistant, aucune récupération après arrêt brutal, aucune écriture synchronisée hors ligne.

## Issues d’une écriture échouée

`services/api/issue-ecriture.ts` porte une seule règle, partagée par les trois parcours d’écriture livrés — création et correction d’un ouvrage, ajout d’une note, suppression d’une note : que permet réellement de conclure une écriture qui a échoué ? Elle distingue une indisponibilité `503`, un résultat incertain — sans réponse exploitable, ou sans statut HTTP concluant — et un refus concluant portant l’erreur applicative. Les deux formulations d’un résultat incertain lui sont fournies par le parcours appelant, qui n’ajoute ensuite que sa propre traduction : champs de formulaire, textes, actions offertes. Le libellé d’un réessai temporisé suit lui aussi une règle unique, `libelleReessaiTemporise`.

Cette règle vit en un seul endroit parce qu’elle porte l’invariant principal du produit : une absence de réponse n’est jamais présentée comme un refus, et une saisie n’est jamais perdue silencieusement. Trois copies de cette classification auraient pu dériver indépendamment.

## Parcours d’une écriture livré : la suppression d’une note de lecture

Le ticket #19 livre la suppression d’une note par `DELETE /books/:livreId/notes/:noteId`, selon l’exception validée au lot 2 : confirmation puis envoi immédiat, sans fenêtre d’annulation. Le mécanisme des suppressions d’ouvrages du lot 1 reste inchangé et les notes n’y entrent jamais.

1. Chaque note affichée porte son action de suppression. Son libellé accessible reprend la date de la note et un extrait de son contenu : la date seule ne distinguerait pas deux notes du même ouvrage écrites dans la même minute.
2. L’action ouvre une confirmation propre aux notes, distincte de celle des ouvrages : elle rappelle la date et l’extrait, et annonce que l’envoi est immédiat et sans annulation possible. Renoncer ne change ni le cache ni le serveur et n’émet aucune requête. Comme la confirmation des ouvrages, sa `Modal` reste montée en permanence et se pilote par `visible` plutôt que d’être montée à l’ouverture.
3. Confirmer déclenche le `DELETE` sans attendre : aucune échéance, aucun compte à rebours, aucune action d’annulation n’est offerte. `useSupprimerNote` déclare `retry: false` — une suppression au résultat inconnu est présentée comme telle plutôt que rejouée.
4. `supprimerNote` passe par le client HTTP commun, qui n’accepte comme succès qu’une réponse `204` au corps vide. Le contrat documentant `204 | 404`, un `404` devient l’issue `deja-absente` : l’intention du libraire est satisfaite, la liste est actualisée depuis le serveur et un message le dit sans prétendre que la note vient d’être supprimée.
5. En succès, la note est retirée de la seule clé `['notes', 'ouvrage', id]`. Les clés de fiche et de liste du fonds ne sont jamais invalidées par ce parcours. Si la dernière note disparaît, la section retombe sur son état vide contextualisé.
6. Pendant l’envoi, l’action de la note concernée affiche son état et refuse une seconde soumission, grâce à un verrou de rendu doublé d’un verrou de référence. Les autres notes restent actionnables : un envoi lent ne bloque pas la section.
7. En échec, `interpreterEchecSuppressionNote` réutilise la classification commune. Un `503` temporise avant un réessai manuel, avec un compte à rebours propre à chaque note tenu par `hooks/use-temporisations.ts` : agir sur une note n'interrompt jamais l'attente d'une autre. Un refus concluant affiche le message du serveur avec une reprise immédiate. Une coupure ou un délai d’expiration dépassé reste un résultat incertain : la note a peut-être été supprimée, l’interface ne prétend pas le contraire et propose d’actualiser les notes pour vérifier avant tout nouvel envoi. Chaque retour est attaché à la note concernée et laisse toujours une reprise disponible. Ces avis ont leur propre vocabulaire, distinct de celui des avis d’écriture du lot 1 : pour une suppression il n’y a aucune saisie à conserver, et une reprise doit rester offerte même sur un refus concluant.
8. Une vérification demandée depuis un avis incertain efface le message de liste : celui-ci décrit l’issue d’une action passée et ne doit pas survivre à une actualisation.
9. Le bandeau global des ouvrages est indifférent à tout cela : une suppression de note ne l’alimente pas, ne remet pas son échéance à cinq secondes, ne modifie pas son compteur, et « Annuler tout » ne restaure aucune note.

## Adaptation de plateforme

Les parcours livrés utilisent les interfaces communes de React Native, le transport `fetch` et le routage Expo Router. La page consultée voyageant dans l’URL, le retour navigateur et le retour de pile mobile aboutissent au même état.

L’avertissement de départ du document passe par l’interface `services/plateforme/avertissement-depart.ts`, dont Metro sélectionne l’implémentation `.web.ts` sur la cible web.

React Native Web rend une `Pressable` de rôle `checkbox` comme un élément non natif et n’associe pas la touche Espace à `onPress`. `services/plateforme/activation-clavier.ts` fournit cette adaptation sur le web sans transmettre de prop supplémentaire sur mobile.
