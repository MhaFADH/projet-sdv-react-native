# Usage de l’IA

## Intervention

- Outil : pi coding agent.
- Fournisseur : OpenAI Codex.
- Modèle : `gpt-5.6-sol`.
- Périmètre : issue GitHub #2, consultation paginée du fonds.

## Demandes reçues

1. `https://github.com/MhaFADH/projet-sdv-react-native/issues/2`
2. `i commited staged docs, now status is clean`
3. `ok just a thing, i would like only arrow functions, no normal functions, and add it to biome too`

## Actions réalisées avec l’IA

- lecture du ticket, de sa spécification parent, du contrat de l’API et de la documentation Expo SDK 54 ;
- proposition et implémentation des seams de test pour le transport, le hook TanStack Query et la présentation pure ;
- rédaction du client HTTP, de la validation Zod, du parcours paginé et de la documentation ;
- exécution du lint, du typage, des tests, de la couverture et des contrôles Expo.

## Défauts constatés et corrections réelles

- React Native Testing Library chargeait du syntaxe Flow non transformé par la configuration Vitest existante. Les tests de composants ont été déplacés vers Testing Library DOM avec `react-native-web`, conformément à la cible navigateur prioritaire.
- `accessibilityRole="listitem"` n’était pas accepté par les types React Native installés. La prop universelle `role="listitem"` disponible dans React Native 0.81 a été utilisée.
- Le délai d’expiration HTTP était initialement arrêté dès la réception des en-têtes. Son périmètre a été étendu à la lecture du corps de réponse.
- La première revue Spec a relevé que l’année externe n’était validée que comme entier. Les bornes 1450 et année courante + 1 du contrat API ont été ajoutées avec leurs tests.
- La première revue Spec a relevé qu’une page devenue vide avec un total non nul était présentée comme un fonds globalement vide. Un état distinct conserve la pagination et le parcours revient automatiquement à la dernière page serveur, avec un test de non-régression.

Aucun prompt, défaut ou résultat non observé n’est ajouté à ce document.

## Intervention — issue #3

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5`.
- Périmètre : issue GitHub #3, consultation d’une fiche et retour à la page consultée.

### Demandes reçues

1. `https://github.com/MhaFADH/projet-sdv-react-native/issues/3 tu as accès à GitHub CLI.`

### Actions réalisées avec l’IA

- lecture du ticket #3, du cadrage du lot 1 et du contrat `GET /books/:id` du README de l’API ;
- ajout du cas d’erreur `introuvable` pour les réponses `404`, de `fetchBook` et de ses tests de service ;
- extraction des clés de cache et de la politique de réessai partagées, ajout du hook `useBook` et de sa couverture (clé dédiée, réponses obsolètes, annulation, absence) ;
- ajout de la route `/ouvrages/[id]`, de `FicheScreen`, de `FicheView` et du passage de la page consultée dans l’URL de la route racine ;
- exécution du lint, du typage, des tests, de la couverture, de `knip`, puis vérification navigateur.

### Défauts constatés et corrections réelles

- Le premier test de réessai manuel de la fiche échouait : le réessai automatique d’une seconde consommait la réponse de succès prévue pour l’action « Réessayer ». Le test a été corrigé pour épuiser d’abord le réessai automatique.
- `knip` a signalé deux exports inutilisés introduits par cette itération (`EDITEUR_NON_RENSEIGNE`, `EtatFiche`). Ils ont été rendus locaux à leur module.
- La fiche présentait à la fois une pastille de statut et une ligne « Statut de lecture », doublon retiré au profit de la seule ligne libellée.
- La revue Standards et la revue Spec ont relevé quatre défauts réels, corrigés avec leurs tests : réactualisation déclenchée à chaque changement de page et non au seul retour, absence de contrôle d’identité sur la fiche reçue, identifiant de route vide traité en erreur réessayable plutôt qu’en absence, et duplication des états de chargement, d’erreur et d’absence entre les deux écrans, désormais extraits dans `components/etats-donnees.tsx`. La politique de réessai a été déplacée de `hooks/` vers `services/api/`, qui porte les règles liées au transport.

### Vérification navigateur

Réalisée avec Chrome sans interface piloté par le protocole DevTools, contre `npx expo start --web` et l’API locale sans authentification, base de 500 livres :

- `/?page=2` affiche « Page 2 sur 25 · 500 ouvrages » et vingt éléments de liste ;
- chaque ouvrage est un `button` focusable au clavier portant son libellé accessible ;
- l’ouverture d’un ouvrage affiche titre, auteur, éditeur, année et statut, à l’URL `/ouvrages/<identifiant>` ;
- `/ouvrages/inconnu-123` affiche « Cette fiche n’est plus disponible » et le message serveur, sans chargement infini ;
- le retour navigateur ramène à `?page=2` depuis une fiche ouverte à cette page ;
- dans un second passage parti de `?page=3`, le bouton « Retour au fonds » ramène à `?page=3` et déclenche une nouvelle requête `GET /books?…` (deux requêtes observées pour un aller-retour) ;
- après correction de la réactualisation, deux clics successifs sur « Suivant » produisent exactement les pages `1,2,3`, sans requête en double.

Ces observations ont été refaites après l’extraction des états partagés.

## Intervention — issue #4

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5` (contexte 1M).
- Périmètre : issue GitHub #4, ajout d’un ouvrage sans perte de saisie.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/4 tu as accès au CLI de GitHub pour consulter l’issue.`

### Actions réalisées avec l’IA

- lecture du ticket #4, de la spécification parent #1, des ADR 001 et 005, du README de l’API et de son validateur `src/livres.js` ;
- ajout des dépendances `react-hook-form` et `@hookform/resolvers` ;
- écriture du schéma de saisie `domain/saisie-ouvrage.ts` et de ses tests avant implémentation ;
- extension du client HTTP à `POST`, ajout de `createBook`, de la distinction d’un résultat incertain dans `services/api/erreurs.ts` et de leurs tests de service ;
- ajout des hooks de mutation, de toast et de temporisation, de l’avertissement de départ derrière `services/plateforme/`, du formulaire et de ses composants purs, de la route `/ouvrages/nouveau` et de l’accès depuis l’en-tête du fonds ;
- exécution du formatage, du lint, du typage, des tests, de la couverture et de `knip`, puis recette navigateur ;
- mise à jour du README, de `docs/ARCHITECTURE.md` et des ADR 001 et 005.

### Défauts constatés et corrections réelles

- Le message d’année vide était masqué par le contrôle de format : Zod 4 collecte les deux problèmes du même champ. Les contrôles ont été enchaînés par `pipe` pour que le message « obligatoire » reste seul sur un champ vide.
- Le paramètre de message dynamique du `refine` avait été écrit dans la forme de Zod 3 et produisait « Invalid input ». Il a été remplacé par `{ error: () => … }`.
- Le décompte de temporisation n’avançait que d’une seconde par avance d’horloge : les `setTimeout` enchaînés replanifiaient après la fenêtre avancée. Un `setInterval` unique a remplacé la chaîne.
- `knip` a signalé quatre exports inutilisés introduits par cette itération (`CHAMPS_SAISIE_OUVRAGE`, `DELAI_TEMPORISATION_MS`, `DUREE_TOAST_MS`, `ToastCreation`). Ils ont été rendus locaux à leur module.
- La protection contre l’abandon cessait de fonctionner après la première création : `reset` appelé depuis la soumission laissait React Hook Form ignorer les saisies suivantes, dont `isDirty` restait faux. La remise à vide a été déplacée dans un effet déclenché par une création confirmée, avec un test de non-régression. Défaut trouvé par une sonde de diagnostic, puis confirmé par la revue Spec.
- La revue Standards a relevé qu’un refus `422` portant sur `lu` était perdu : la bascule n’affiche pas d’erreur. Le statut de lecture a été retiré des champs porteurs de message ; un tel refus rejoint désormais le message général visible, avec son test.
- La revue Standards a relevé qu’une exception inattendue, convertie par une assertion de type en `ErreurApplication`, produisait un message vide. `interpreterEchecCreation` accepte maintenant `unknown` et vérifie la forme de l’erreur ; tout autre jet est traité comme un sort inconnu.
- La revue Standards a relevé l’absence d’état accessible sur un champ en erreur. Les attributs `aria-invalid` et `aria-describedby`, transmis au DOM par `react-native-web`, ont été ajoutés avec l’identifiant du message.
- La revue Spec a relevé qu’une panne serveur `500` était présentée comme une indisponibilité, donc comme une absence de création. Seul un `503` propose désormais un réessai ; les autres échecs sans réponse exploitable sont présentés comme un sort inconnu, avec leurs tests.
- La revue Spec a relevé que « Vérifier dans le fonds » quittait le formulaire sans confirmation, en perdant la saisie conservée. Ce départ et celui du bouton du toast passent maintenant par la même confirmation d’abandon.
- La revue Spec a relevé que « Retour au fonds » était verrouillé pendant l’envoi, alors que la spécification ne verrouille que les champs et la soumission. Le verrou a été retiré de ce bouton.
- La revue Standards a relevé la duplication de l’union de résultat et une cascade de correspondance lossy entre `resultat-creation.ts` et la vue, ainsi que le fil de la propriété `ajouterOuvrage` à travers cinq composants du fonds. L’union a été réduite à trois cas et `FondsView` compose désormais un cadre et un contenu, comme `FicheView`.

### Vérification navigateur

Réalisée avec Chrome piloté depuis la session, contre `npx expo start --web` et l’API locale sans authentification, base de 500 livres :

- « Ajouter un ouvrage » est présent dans l’en-tête du fonds et ouvre `/ouvrages/nouveau` avec une année vide et le statut « Non lu » ;
- une soumission vide affiche « Le titre est obligatoire. », « L’auteur est obligatoire. » et « L’année de publication est obligatoire. » sans requête réseau ;
- une saisie valide sans éditeur crée l’ouvrage : `GET /books?q=…` sur l’API montre l’enregistrement avec `editeur` à chaîne vide, `annee` numérique et `lu` à `false` ;
- après succès, le formulaire est vidé, le statut revient à « Non lu », aucune redirection n’a lieu et le toast affiche « Ouvrir la fiche » ;
- le toast reste affiché après neuf secondes de survol continu, puis disparaît dans les cinq secondes qui suivent la sortie du curseur ;
- une saisie modifiée puis « Retour au fonds » affiche la confirmation d’abandon en conservant les valeurs ; « Abandonner la saisie » revient au fonds, et le retour depuis `/?page=3` conserve cette page ;
- transport simulé dans la page pour le seul `POST` : une réponse `503` affiche « Service temporairement indisponible. Votre saisie est conservée. » avec un réessai temporisé, et une requête rejetée affiche l’avertissement de création peut-être effectuée avec « Vérifier dans le fonds » et « Réessayer malgré le risque de doublon », valeurs conservées ;
- une navigation demandée pendant une saisie modifiée a été bloquée par la boîte « Leave site? » du navigateur, ce qui confirme l’avertissement de départ ;
- aucune erreur ni exception dans la console.

Après les corrections issues des revues, la vérification a été refaite : une saisie commencée après une création confirmée déclenche de nouveau la confirmation d’abandon.

Trois ouvrages de recette créés pendant ces vérifications restent dans la base locale de l’API : « Recette Navigateur Lot 1 », « Recette Toast Survol » et « Recette Reprise Saisie ».


## Intervention — issue #8

- Outil : pi coding agent.
- Fournisseur : OpenAI Codex.
- Modèle : `gpt-5.6-sol`.
- Périmètre : issue GitHub #8, suppression d’une sélection depuis la liste.

### Demande reçue

1. `https://github.com/MhaFADH/projet-sdv-react-native/issues/8, tu as accès à github cli, ajoute aussi dans le agents.md il faut coder/nommer en français.`

### Actions réalisées avec l’IA

- lecture du ticket #8, de sa spécification parent, du ticket #7, du contrat de l’API et de l’ADR 004 ;
- ajout test-first des cases à cocher, de la barre de sélection, de la remise à zéro à la pagination et de la confirmation récapitulative ;
- raccordement de la sélection au provider global de suppression existant, sans second délai ni second parcours d’envoi ;
- ajout des tests avec transport simulé pour l’abandon, le délai prolongé, l’annulation globale, le verrouillage pendant l’envoi, l’échec partiel et le réessai ciblé ;
- mise à jour de `AGENTS.md`, du README, de l’architecture et de l’ADR 004.

### Défauts constatés et corrections réelles

- `accessibilityState.checked` ne produisait pas seul `aria-checked` avec React Native Web dans le test de composant. La propriété web explicite a été ajoutée en conservant l’état accessible React Native.
- Le libellé initial utilisait le singulier pour zéro. Il a été corrigé en « 0 sélectionnés — Supprimer » et verrouillé par test.
- Une confirmation locale masquée restait en concurrence avec la confirmation globale de réessai dans le test web. La confirmation de liste est désormais montée uniquement lorsqu’elle est ouverte.
- La recette Chrome a montré qu’une `Pressable` de rôle `checkbox` ne réagissait pas à Espace. Une adaptation sous `services/plateforme/` ajoute cette activation sur le web sans transmettre de prop supplémentaire sur mobile ; le parcours public la couvre désormais.
- Les deux axes de revue ont relevé que masquer toute une page retirait aussi sa pagination. L’état temporaire conserve désormais la barre désactivée et les commandes de pagination, avec un test sur une page possédant une page suivante.

### Vérification navigateur

Réalisée avec Chrome sans interface piloté par le protocole DevTools, contre `npx expo start --web` et l’API locale sans authentification :

- la première page affiche vingt cases de rôle `checkbox`, avec libellé et état ;
- Espace sélectionne la case focalisée et la barre passe à « 2 sélectionnés — Supprimer » après une seconde sélection ;
- Entrée sur l’action ouvre une confirmation contenant les deux titres ;
- confirmer masque les deux lignes et affiche le bandeau global pour deux ouvrages ;
- « Annuler tout » restaure les vingt lignes et aucun DELETE n’est observé après expiration du délai ;
- dans un second passage, confirmer les vingt ouvrages masque toute la page tout en conservant « Suivant » actif ; la navigation affiche vingt ouvrages non sélectionnés en page 2 et l’annulation globale n’envoie aucun DELETE.

## Intervention — issue #9

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5[1m]`.
- Périmètre : issue GitHub #9, recette du lot 1 et transmission.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/9 tu as accès à GitHub CLI pour lire le ticket correspondant`

### Actions réalisées avec l'IA

- lecture du ticket #9 via GitHub CLI, de `AGENTS.md`, du contrat de l'API voisine
  et du code des parcours déjà livrés ;
- exécution du scénario nominal complet dans Chrome piloté par le protocole
  DevTools, contre l'API locale sans authentification ;
- recette en mode dégradé contre une seconde instance de l'API lancée avec
  `CHAOS_LATENCE` et `CHAOS_ECHEC`, puis arrêtée ;
- vérification clavier, petit écran et cibles de 44 points ;
- exécution du lint, du typage, des tests, de la couverture, de `knip` et du
  contrôle des versions Expo ;
- rédaction de `docs/RECETTE-LOT-1.md`.

### Défauts constatés et corrections réelles

- Le document web était servi avec `<html lang="en">` alors que toutes les chaînes
  visibles sont en français. Ajout de `app/+html.tsx` déclarant `lang="fr"`, avec un
  test de non-régression sur l'arbre d'éléments de l'enveloppe.
- Diagnostic erroné de l'agent : une bascule bloquée sur sa valeur optimiste après
  un 503 a d'abord été attribuée au `networkMode` de TanStack Query, et une
  modification a été introduite sur cette base. La cause réelle était l'onglet
  d'automatisation, masqué (`document.hidden`), TanStack Query suspendant ses
  réessais hors focus. La modification a été entièrement annulée et les mesures
  refaites dans un onglet visible, où le comportement documenté est conforme.
- Passer `EXPO_PUBLIC_API_URL` par l'environnement du shell est sans effet : Expo
  charge `.env`, dont la valeur l'emporte. Les premières mesures en mode dégradé
  visaient donc l'API nominale et ont été refaites avec un `.env.local`.

### Vérification navigateur

Détaillée dans [`docs/RECETTE-LOT-1.md`](docs/RECETTE-LOT-1.md), qui distingue
explicitement ce qui est automatisé, vérifié manuellement et non vérifié.

## Intervention — issue #17

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5[1m]`.
- Périmètre : issue GitHub #17, ajout d'une note de lecture sans perte de saisie.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/17 https://github.com/MhaFADH/projet-sdv-react-native/issues/19 j'ai besoin que tu implémentes ces deux tickets en parallèle. Tu disposes du CLI GitHub pour lire le contenu des tickets. Quand tu finiras, on fera une PR pour la première, une fois merge on fera un rebase sur la deuxième puis on fera une PR.`
2. Réponse à une question de l'agent sur le découpage git, l'agent ne pouvant ni
   créer de branche ni commiter : périmètre réduit à l'issue #17 seule, l'issue #19
   étant reportée après le merge et le rebase par le responsable.

### Actions réalisées avec l'IA

- lecture des tickets #17 et #19 via GitHub CLI, de la spécification du lot 2, des
  instructions du projet, du contrat `POST /books/:id/notes` du README de l'API et
  de son validateur `src/routes-livres.js` ;
- écriture du schéma `domain/saisie-note.ts` et de ses tests avant implémentation ;
- extension de `notes-api.ts` à l'ajout avec validation Zod de la réponse `201` et
  contrôle du rattachement à l'ouvrage, et ses tests de service ;
- généralisation du socle de notification et de retour d'écriture du lot 1 plutôt
  que création d'un second socle : `useToastSucces` rendu paramétrable par le
  contenu annoncé, action du toast rendue facultative, et déplacement de
  `toast-succes.tsx`, `confirmation-abandon.tsx` et `messages-creation.tsx`
  (renommé `messages-ecriture.tsx`) à la racine de `components/` ;
- ajout de `hooks/use-ajouter-note.ts`, de `features/notes/` (textes, interprétation
  des échecs, états de présentation des notes, coordination de la saisie) et des
  composants purs `champ-note.tsx`, `formulaire-note-view.tsx` et
  `vue-section-notes.tsx` ;
- déplacement de la détention de la saisie dans `FicheScreen`, la section des notes
  étant passée à `FicheView` par une prop de composition ;
- tests de parcours avec TanStack Query réel, transport simulé, réponses différées
  et horloge contrôlée ;
- exécution du formatage, du lint, de `biome ci`, du typage, des tests, de la
  couverture et de `knip`, puis recette navigateur ;
- mise à jour du README, de `docs/ARCHITECTURE.md` et de l'ADR 005.

### Défauts constatés et corrections réelles

- Le message de blocage de l'ajout portait `accessibilityRole="alert"` et faisait
  apparaître un second élément de rôle `alert` sur une fiche masquée par une
  suppression en attente, ce qui a fait échouer un test existant du lot 1
  (`suppressions-provider`). Le message est devenu un `role="status"`, qui décrit
  correctement un état persistant, et la section des notes n'est plus rendue tant
  que l'ouvrage est masqué : la saisie étant détenue par l'écran de la fiche, elle
  revient intacte après « Annuler tout », ce qu'un test vérifie désormais.
- Le premier test de verrouillage attribuait `disabled` au champ pendant l'envoi.
  React Native Web traduit `editable={false}` en `readonly` sur le `textarea` ; les
  assertions ont été corrigées, `toBeEnabled` étant par ailleurs vrai pour un champ
  en lecture seule et donc sans valeur de preuve ici.
- Le libellé du bouton d'envoi contenait une condition sans effet
  (`enEnvoi ? libelleEnvoyer : libelleEnvoyer`), résidu d'une bascule de libellé
  déjà assurée par le hook. Elle a été retirée.
- Le compteur de caractères utilisait `Intl.NumberFormat('fr-FR')`, dont l'espace
  d'exposant varie selon la version d'ICU et rendait les assertions fragiles. Il
  affiche désormais les nombres bruts.
- `knip` a signalé sept exports inutilisés introduits par cette itération
  (`AvisRefus`, `AvisIndisponible`, `AvisIncertain`, `ControleSaisieNote` et trois
  fixtures de test). Ils ont été rendus locaux à leur module.
- Un module `features/notes/blocage-note.ts` avait été introduit pour calculer les
  causes de blocage de l'envoi. Après le retrait des cas « identifiant inutilisable »
  et « ouvrage masqué », il ne restait qu'une condition sur le `404` : le module a
  été supprimé et la règle intégrée à `useSaisieNote`.
- La revue Spec a relevé un défaut réel introduit par ce même retrait : en état
  masqué, la section des notes n'était plus montée, donc `ConfirmationAbandon` non
  plus. Un clic sur « Retour au fonds » avec une saisie en cours positionnait le
  départ en attente sans rien afficher — bouton sans effet visible — et la
  confirmation resurgissait hors contexte après l'annulation de la suppression. Le
  libraire voyait par ailleurs sa saisie disparaître sans explication. La section
  reste désormais montée dans tous les états où une saisie peut exister, avec la
  raison du blocage énoncée ; deux tests de non-régression couvrent la saisie
  conservée et visible en état masqué et la confirmation d'abandon atteignable.
- La revue Standards a relevé que le message de blocage affiché avant tout envoi
  réutilisait le texte du refus consécutif à un `404` (« la note n'a pas été
  enregistrée »), alors que rien n'avait été envoyé. Deux textes distincts existent
  désormais : `blocageOuvrageIntrouvable` et `blocageOuvrageMasque` pour la
  suspension de l'envoi, `refusIntrouvable` pour le refus après envoi.
- La revue Spec a relevé que le verrouillage pendant l'envoi était incomplet : le
  bouton « Effacer la saisie » restait actif et permettait de vider le champ pendant
  un `POST` en vol. Il est désormais désactivé comme la soumission, avec son
  assertion dans le test de verrouillage.
- La revue Standards a relevé un paramètre `signal?: AbortSignal` mort sur
  `ajouterNote` : `useAjouterNote` ne le fournissait jamais, seul son test
  l'exerçait. Le paramètre et ce test ont été retirés, et le choix est documenté :
  ce `POST` n'est volontairement pas annulable, abandonner la requête en vol
  produirait exactement le résultat incertain que le parcours cherche à éviter.
- La revue Standards a relevé un `nativeID` dérivé de la constante d'erreur et
  jamais référencé sur le libellé du champ, ainsi qu'un libellé de bouton
  conditionnel sans effet. Les deux ont été retirés. La fonction de garde d'abandon,
  nommée `proteger`, a été renommée `partir` pour porter le même nom que son
  équivalent du lot 1.
- La revue Spec a relevé que le dépassement du délai d'expiration n'était couvert
  qu'indirectement. Le cas `cause: 'expiration'` est désormais explicite dans les
  tests d'interprétation.
- Deux constats de revue n'ont pas été suivis, par discipline de périmètre :
  la duplication entre `features/notes/resultat-note.ts` et
  `features/books/resultat-ecriture.ts` (et entre les deux répartitions de refus
  serveur), qui demanderait un module d'interprétation partagé touchant le code des
  tickets #4 et #5 ; et la fusion de `components/notes/champ-note.tsx` avec
  `components/books/champs-saisie.tsx`, qui ajouterait des drapeaux à un composant
  du lot 1. Le message du refus `422` reste celui du serveur, comme pour les
  ouvrages, plutôt que reformulé côté client.

### Vérification navigateur

Réalisée avec Chrome piloté depuis la session, contre `npx expo start --web` et
l'API locale sans authentification, sur la fiche
`/ouvrages/36bc0df6-53d9-4777-ae6a-4ac45efe56dc` (« Des Cite des cendres »,
3 notes existantes) :

- le formulaire s'affiche au-dessus des notes, avec le compteur « 0 / 1000
  caractères » ;
- une soumission vide affiche « Le contenu de la note est obligatoire. » ;
- une note saisie et soumise entièrement au clavier (`Tab` puis `Entrée`) affiche la
  confirmation « La note a été ajoutée à cette fiche. », vide le champ, ajoute la
  note en tête avec sa date française et reste sur la fiche ;
- côté API, `GET /books/:id/notes` passe à 4 notes et ne contient qu'une seule
  occurrence du contenu envoyé : la soumission vide n'a émis aucune requête et la
  soumission clavier exactement une ;
- « Effacer la saisie » n'apparaît qu'une fois la saisie renseignée, et le compteur
  suit la longueur normalisée (44 / 1000 pour la saisie de recette) ;
- transport simulé dans la page pour le seul `POST` : une réponse `503` affiche
  « Service temporairement indisponible. Votre saisie est conservée. » avec un
  réessai temporisé désactivé ; une requête rejetée affiche « Aucune réponse du
  serveur : la note a peut-être été enregistrée. » avec l'avertissement de doublon,
  « Actualiser les notes » et « Renvoyer malgré le risque de doublon » ; un `422`
  affiche « contenu obligatoire, 1000 caracteres maximum » sous le champ ;
- dans les trois cas, le texte saisi reste intact et aucune confirmation de succès
  n'est affichée ;
- « Actualiser les notes » conserve la saisie et l'avertissement de doublon ;
- après ces trois échecs simulés, l'API contient toujours 4 notes : aucun envoi
  fantôme, aucun doublon ;
- une saisie non envoyée déclenche la confirmation « Abandonner cette saisie ? »
  aussi bien depuis « Effacer la saisie » que depuis « Retour au fonds », qui ne
  navigue pas tant que l'abandon n'est pas confirmé ; « Poursuivre la saisie »
  conserve le texte, « Abandonner la saisie » ramène au fonds ;
- aucune erreur ni exception dans la console.

Après les corrections issues des revues, deux écrans dont le texte avait changé ont
été revérifiés. Sur `/ouvrages/ouvrage-inexistant-recette-17`, la fiche affiche
« Cette fiche n'est plus disponible » et le formulaire affiche « Cet ouvrage n'existe
pas ou plus : aucune note ne peut lui être ajoutée. Votre texte reste affiché pour
être recopié. », avec « Ajouter la note » désactivé et le champ resté modifiable.

Non vérifiés en navigateur, couverts par les tests automatisés : la coexistence du
toast de note avec le bandeau de suppression d'un autre ouvrage, ainsi que la saisie
conservée, visible et expliquée pendant une suppression en attente puis retrouvée
après « Annuler tout » — ce parcours déclenchant un `DELETE` réel sur la base locale
au bout de cinq secondes, il n'a pas été exécuté en navigateur. Le rendu sur petit
écran et l'avertissement `beforeunload` ne sont pas non plus vérifiés en navigateur.

Une note de recette créée pendant ces vérifications reste dans la base locale de
l'API : « Recette navigateur ticket 17 : note ajoutée au clavier. »

Aucun prompt, défaut ou résultat non observé n'est ajouté à ce document.
