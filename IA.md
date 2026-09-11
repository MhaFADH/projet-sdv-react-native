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

## Intervention — issue #19

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5[1m]`.
- Périmètre : issue GitHub #19, suppression d'une note après confirmation.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/17 https://github.com/MhaFADH/projet-sdv-react-native/issues/19 j'ai besoin que tu implémentes ces deux tickets en parallèle. Tu disposes du CLI GitHub pour lire le contenu des tickets. Quand tu finiras, on fera une PR pour la première, une fois merge on fera un rebase sur la deuxième puis on fera une PR.`
2. `C'est bon j'ai merge et rebase #17 fais #19 à présent`

### Actions réalisées avec l'IA

- lecture de l'issue #19 via GitHub CLI, de la section « Suppression des notes : exception
  validée » du cadrage du lot 2, de l'ADR 004, du contrat `DELETE /books/:livreId/notes/:noteId`
  du README de l'API et de la route effective dans `src/routes-livres.js` ;
- vérification que le ticket #16, mergé entre-temps, ne touche ni les notes ni la section
  des notes de la fiche ;
- extraction de la classification commune des écritures échouées dans
  `services/api/issue-ecriture.ts`, puis réécriture des interpréteurs de la création
  d'ouvrage et de l'ajout de note par-dessus, leurs tests existants restant inchangés ;
- ajout de `supprimerNote` traduisant le `204 | 404` documenté en deux issues, de
  `hooks/use-supprimer-note.ts`, de `features/notes/` (textes, interprétation des échecs,
  coordination) et des composants purs `vue-note.tsx`, `avis-suppression-note.tsx` et
  `confirmation-suppression-note.tsx` ;
- ajout des aides de domaine `extraitNote` et `libelleNote` ;
- extension du harnais de test des notes au `DELETE`, puis tests de parcours avec
  TanStack Query réel, transport simulé, réponses différées et horloge contrôlée ;
- exécution du formatage, du lint, de `biome ci`, du typage, des tests, de la couverture
  et de `knip`, puis recette navigateur ;
- mise à jour du README, de `docs/ARCHITECTURE.md` et de l'ADR 004.

### Défauts constatés et corrections réelles

- La recette navigateur a montré que deux notes créées dans la même minute produisaient des
  libellés d'action strictement identiques (« Supprimer la note du 10 septembre 2026 à 20:28 »),
  alors que le critère demande d'identifier clairement la note concernée. `libelleNote` intègre
  désormais un extrait du contenu ; un test vérifie que deux notes de la même minute se
  distinguent.
- Le test de l'envoi immédiat après confirmation échouait : `mutateAsync` diffère l'appel d'une
  microtâche, aucun `fetch` n'est donc parti dans le tour synchrone du clic. L'absence de fenêtre
  d'annulation est maintenant prouvée en ne laissant tourner qu'un tour de microtâches, sans
  avancer aucune horloge.
- `waitFor` de Testing Library ne pilote pas les horloges factices de vitest : le test de
  temporisation `503` restait bloqué jusqu'au délai d'expiration. Ce test s'appuie désormais sur
  l'horloge réelle, l'horloge contrôlée restant utilisée là où elle est nécessaire, sur le
  compteur du bandeau d'ouvrages.
- Le premier test clavier supposait que jsdom convertit Entrée en clic sur un `button` natif :
  ce n'est pas le cas. Il vérifie maintenant que les commandes sont des `button` focalisables aux
  cibles de 44 points, l'activation clavier réelle étant vérifiée en recette navigateur.
- Le hook de coordination contenait un repli `{ id: noteId } as NoteLecture` pour le réessai.
  `envoyer` ne prend plus qu'un identifiant, ce qui supprime cette assertion de type.

- La revue Spec a relevé un défaut réel : la temporisation était unique pour toute la section.
  Supprimer une note pendant qu'une autre attendait après un `503` appelait `arreter()` et
  annulait son compte à rebours, dont le bouton redevenait actif immédiatement ; deux `503`
  simultanés partageaient aussi un seul compteur. Cela contredit « les autres notes restent
  actionnables » et le retour attaché à la note. `hooks/use-temporisations.ts` tient désormais
  une échéance par clé ; un test de non-régression vérifie qu'une suppression réussie ne touche
  pas le compte à rebours d'une autre note, et la recette navigateur l'a confirmé.
- La revue Spec a relevé que le message « Cette note n'est plus sur le serveur… » affirmait
  « La liste a été actualisée », une promesse qui périme dès que la liste change. La phrase a
  été retirée, et une vérification demandée depuis un avis incertain efface désormais ce message.
- La revue Spec a relevé une surface morte : `enEnvoi` et `libelleEnvoiEnCours` de la
  confirmation étaient inatteignables, `confirmer` fermant le dialogue avant l'envoi. Ces props
  et leurs styles ont été retirés ; l'état d'envoi n'est présenté que là où il existe, sur
  l'action de la note.
- La revue Standards a relevé que le choix entre les deux formulations d'un résultat incertain
  était recopié à l'identique dans les trois interpréteurs. `classerEchecEcriture` reçoit
  maintenant ces deux textes et renvoie directement le message. Le libellé d'un réessai
  temporisé a été extrait de la même façon dans `libelleReessaiTemporise`.
- La revue Standards a relevé que `vue-note.tsx` codait en dur « Supprimer » et « Suppression en
  cours » alors que les textes existaient, et que la vue interrogeait deux fois ses commandes par
  sa propre clé. Les libellés viennent des textes et `VueListeNotes` résout les commandes par
  note : la vue est devenue passive. Le type a été renommé `CommandesSuppressionNote`.
- Deux constats de revue n'ont pas été suivis : la duplication des styles entre la confirmation
  des notes et celle des ouvrages, ainsi que celle du cadre d'alerte entre
  `avis-suppression-note.tsx` et `messages-ecriture.tsx`. Les factoriser demanderait une coque de
  dialogue partagée touchant le composant du lot 1 ; seule la règle de libellé, qui est un
  comportement et non une présentation, a été mise en commun. La revue Spec a par ailleurs
  signalé que l'extraction de `services/api/issue-ecriture.ts` n'était pas demandée par le
  ticket ; elle a vérifié l'équivalence branche par branche et les tests des lots précédents
  passent inchangés. Ce choix est assumé : le ticket allait ajouter une troisième copie de la
  règle qui porte l'invariant principal du produit.
- Le premier essai de test de temporisation sous horloge factice restait bloqué : les timers
  factices installés avant le chargement des notes n'arrivaient pas à piloter les minuteries
  internes de TanStack Query. Ils sont désormais installés après le chargement et juste avant
  l'échec attendu, ce qui rend le test déterministe et ramène sa durée de quatre secondes réelles
  à moins d'une seconde.

### Diagnostic erroné de l'agent

Pendant la recette, la confirmation de suppression a paru ne pas s'ouvrir, ni à la souris ni au
clavier. Trois causes ont été avancées successivement — activation clavier de `Pressable`,
`Modal` de react-native-web montée conditionnellement avec `visible` déjà vrai, bundle servi
depuis le cache HTTP — et une modification a été introduite sur la deuxième : la `Modal` a été
alignée sur le motif du lot 1, montée en permanence et pilotée par `visible`.

La console a ensuite révélé la cause réelle : deux `TransformError` de Metro, horodatées pendant
l'édition en deux passes de `components/notes/confirmation-suppression-note.tsx`, qui laissait le
fichier syntaxiquement invalide. Metro continuait donc de servir le module précédent, et les
observations portaient sur un code qui n'était pas celui du disque.

Aucune des trois hypothèses n'a été établie : ni l'activation clavier ni le montage conditionnel
de la `Modal` n'ont été démontrés fautifs. Le journal d'événements posé ensuite sur le bouton
montre qu'Entrée produit bien un `keydown` puis un `click` natif et ouvre le dialogue.
L'alignement de la `Modal` sur le motif du lot 1 a été conservé — il évite un remontage à chaque
ouverture — mais il est décrit ici comme un alignement, non comme un correctif.

### Vérification navigateur

Réalisée avec Chrome piloté depuis la session, contre `npx expo start --web` et l'API locale sans
authentification. Deux notes de recette ont été créées par l'agent sur « Des Cite oublie »
(`526df2f8-…`), un ouvrage sans note, afin de ne pas toucher aux notes présentes dans la base :

- chaque note affiche son action de suppression, cible de 44 points, et les libellés accessibles
  des cinq notes d'un autre ouvrage sont tous distincts ;
- Entrée sur l'action ouvre la confirmation, qui rappelle la date, l'extrait entre guillemets et
  « Cette note part immédiatement après confirmation, sans délai ni annulation. Aucune
  restauration n'est possible ensuite. » ;
- Entrée sur « Renoncer » referme la confirmation ; l'API montre les deux notes intactes, donc
  aucune requête émise ;
- Entrée sur « Supprimer la note » retire la note de la liste et l'API ne compte plus qu'une
  note ; aucune commande d'annulation n'est proposée à aucun moment ;
- la suppression de la dernière note affiche « Aucune note de lecture pour Des Cite oublie. » ;
- transport simulé dans la page pour le seul `DELETE` : un `503` affiche « Service temporairement
  indisponible. » avec « Réessayer dans 3 s » désactivé, la note restant affichée, puis la
  commande redevient « Réessayer la suppression » active une fois la temporisation écoulée ;
- une requête rejetée affiche « Aucune réponse du serveur : la note a peut-être été supprimée.
  Actualisez les notes pour vérifier avant de réessayer. » avec « Actualiser les notes » et
  « Réessayer la suppression », la note restant affichée ;
- un `404` affiche « Cette note n'est plus sur le serveur : elle avait peut-être déjà été
  supprimée. La liste a été actualisée. » sans bloquer l'action ;
- les retours d'échec de deux notes différentes coexistent, chacun attaché à sa note ;
- aucune erreur ni exception dans la console sur un chargement du code final.

Le `Tab` fait sortir le focus du dialogue de confirmation : la `Modal` de react-native-web
n'enferme pas le focus. Cette limite est partagée avec la confirmation de suppression d'ouvrages
du lot 1 et n'est pas corrigée par ce ticket.

Après les corrections issues des revues, la temporisation par note a été revérifiée en
navigateur, transport simulé sur le seul `DELETE` d'une note : la note A échoue en `503` et
affiche « Réessayer dans 3 s », la note B est réellement supprimée pendant ce temps, et l'avis
de A continue son décompte à « Réessayer dans 2 s » au lieu de repasser à un réessai actif. À
cette occasion, le bundle servi depuis le cache HTTP a de nouveau faussé une première mesure,
qui montrait la temporisation annulée ; la mesure a été refaite après revalidation du cache.

Non vérifiés en navigateur : la coexistence avec un groupe de suppressions d'ouvrages déjà
programmé, ce parcours déclenchant un `DELETE` réel sur la base locale au bout de cinq secondes ;
elle est couverte par un test de parcours sous horloge contrôlée qui vérifie que le compteur,
l'échéance et « Annuler tout » restent limités aux ouvrages. Le rendu sur petit écran n'est pas
vérifié en navigateur.

Les trois notes de recette créées pour les cas d'échec, puis les deux notes du parcours nominal,
ont été supprimées : l'ouvrage utilisé pour la recette n'a plus aucune note, comme avant
l'intervention.

### Demande de correction reçue après les revues

3. `Tu n'as pas respecté les consignes du AGENTS.md, notamment celle de n'écrire aucun commentaire dans le code`

Vérification faite, `AGENTS.md` ne comporte pas cette consigne : sa section « Qualité et
vérification » interdit `console.log`, les `catch` silencieux, les secrets et `@ts-ignore`, et
plafonne les fichiers à 250 lignes, sans mentionner les commentaires. La seule occurrence du mot
dans le dépôt est `CONTEXT.md`, où « commentaire personnel » est un terme à éviter dans le
vocabulaire métier pour désigner une note de lecture. Le responsable produit ayant énoncé cette
attente, elle a néanmoins été appliquée.

Quatre-vingt-douze lignes de commentaire ont été retirées des vingt-un fichiers ajoutés ou
modifiés par les tickets #17 et #19. Les raisons qu'elles portaient et qui n'étaient pas encore
consignées ont été reprises dans `docs/ARCHITECTURE.md` : l'absence volontaire d'`AbortSignal`
sur les écritures de notes, la `Modal` montée en permanence et pilotée par `visible`, le
vocabulaire propre aux avis de suppression, et l'effacement du message de liste lors d'une
vérification. Lint, typage, tests et `knip` restent verts après retrait.

Trois fichiers de lots précédents, déjà mergés, conservent des commentaires : `app/+html.tsx`,
`hooks/use-rafraichir-fonds-au-focus.ts` et `__tests__/app/html.test.tsx`. Ils n'ont pas été
touchés, le nettoyage restant hors du périmètre de #19.

Aucun prompt, défaut ou résultat non observé n'est ajouté à ce document.

## Intervention — issue #18

- Outil : pi coding agent.
- Fournisseur : OpenAI Codex.
- Modèle : `gpt-5.6-sol`.
- Périmètre : issue GitHub #18, combinaison des filtres et tris du fonds.

### Demandes reçues

1. `<skill name="implement" location="/Users/fadhl/.pi/agent/skills/implement/SKILL.md">…</skill> https://github.com/MhaFADH/projet-sdv-react-native/issues/18, tu as accès à github cli.`
2. Sortie de `git pull` transmise par le responsable, puis `c'est bon ?`.
3. `well, i really dont like the filters layout, they're all just piled, whichever in web view or mobile view`
4. Accord pour une barre responsive et demande que l’action de suppression disparaisse sans sélection au lieu d’occuper une grande bande blanche.
5. Validation du panneau mobile et demande de revenir à une disposition verticale sur web et tablette.
6. Signalement du libellé « Recommandations » coupé sur deux lignes et d’une séparation insuffisante entre « Affiner » et « Trier ».

### Actions réalisées avec l’IA

- lecture du ticket #18, de sa spécification parent, des tickets bloquants #16 et #6, du contrat de l’API, du glossaire et de l’architecture ;
- arrêt avant modification lorsque la dépendance #16 fusionnée sur GitHub n’était pas encore présente dans le `main` local, puis reprise après la synchronisation effectuée par le responsable ;
- ajout test-first de la consultation typée, des filtres de lecture et de coups de cœur, des quatre tris dans les deux sens, des paramètres serveur et des clés de cache complètes ;
- conservation dans l’URL de la recherche, des filtres, du tri, de l’ordre et de la page lors du parcours fonds–fiche–fonds ;
- ajout des tests des trois résultats d’une bascule de lecture sous filtre : succès avec retrait après relecture, refus avec restauration et succès du `PATCH` suivi d’un échec de relecture sans restauration fictive ;
- réorganisation responsive des critères en zones verticales sur écran large et en panneau repliable avec résumé sur petit écran ; suppression de l’action de suppression lorsque la sélection est vide et retrait de son grand conteneur blanc ;
- mise à jour du README et de `docs/ARCHITECTURE.md` ;
- exécution du formatage, du lint, du typage, des tests, de la couverture, de `knip`, du contrôle Expo et d’une recette Chrome.

### Défauts constatés et corrections réelles

- Le premier test clavier a confirmé qu’une `Pressable` de rôle `radio` ne réagissait pas à Espace sur le web. L’adaptation de plateforme déjà utilisée par les cases de sélection a été réutilisée pour tous les filtres et tris.
- La première suite complète a montré qu’une vue pure sans propriété de critères interprétait `undefined` comme un filtre actif et affichait « Aucun résultat » à la place de « Le fonds est vide ». Le calcul exige désormais une consultation définie avant de comparer ses filtres.
- Le lint a signalé une dépendance de callback recréée à chaque rendu et le dépassement de la limite du test de recherche après adaptation de son contrôle. Les dépendances primitives ont remplacé l’objet instable et l’adaptation du test a été compactée.
- `knip` a signalé cinq constantes devenues inutiles ou exportées sans consommateur après la généralisation des tris. Les quatre tables internes ont été rendues locales et l’ancien tri fixe a été retiré.
- La relecture avant revue a montré qu’un échec de `GET` après un `PATCH` réussi masquait la fiche et son statut confirmé derrière l’erreur générique. La fiche conserve désormais la valeur confirmée, explique séparément l’échec d’actualisation et permet de réessayer la lecture.
- Les deux axes de revue ont relevé qu’un échec de relecture du fonds sans écriture préalable était annoncé à tort comme suivant une écriture confirmée. Le fonds utilise désormais un message neutre ; seule la fiche, qui connaît le succès de la mutation, annonce l’écriture confirmée.
- La revue Standards a demandé des tests directs des règles pures de critères et la revue Spec la preuve de `status=lu`. Les lecteurs d’URL, l’encodage, la comparaison, les valeurs par défaut et les deux statuts envoyés sont maintenant couverts.
- Les remarques de conception de la revue sur les chaînes `JSON.stringify` et la duplication de l’encodage ont été suivies : l’identité de consultation est comparée par une règle typée et un codec pur unique produit les paramètres d’URL.
- La revue finale de la refonte responsive a relevé que les deux zones étaient encore dessinées comme deux cartes et que les radios ne géraient que la touche Espace. La surface, la bordure et le fond ont été regroupés sur une barre unique ; les radios utilisent désormais un arrêt de tabulation mobile et les touches Flèches, Début et Fin déplacent le choix et le focus.
- La même revue a relevé deux types suffixés en anglais et un test large qui ne vérifiait pas la direction de la barre. Les types ont été renommés en français et le test vérifie maintenant le rôle de barre d’outils, sa disposition verticale validée ensuite par le responsable et sa bordure commune.
- Le retour produit a identifié le retour à la ligne de « Recommandations » et le manque de séparation. La largeur du libellé a été augmentée, son rendu limité à une ligne et la zone « Trier » commence désormais après une bordure et un espacement dédiés.

### Vérification navigateur

Réalisée avec Chrome piloté par le protocole DevTools, contre `npx expo start --web` et l’API locale sans authentification :

- l’URL `/?page=1&q=a&status=nonlu&favori=true&sort=annee&order=desc` affiche « Page 1 sur 3 · 54 ouvrages » ;
- « Non lus », « Coups de cœur », « Année » et « Décroissant » exposent tous `aria-checked="true"` ;
- l’ouverture de « Un Machine des origines » produit une URL de fiche contenant les six paramètres de retour ;
- « Retour au fonds » restaure exactement l’URL filtrée et les quatre états sélectionnés ;
- la construction web ne signale aucune erreur applicative dans le journal Expo.

Après le retour produit sur la densité de l’interface, une seconde recette responsive a été exécutée :

- à 1 200 px, la barre expose `flex-direction: column`, les quatre groupes sont visibles sous « Affiner » puis « Trier » et aucun bouton de panneau n’est présent ;
- à 768 px, la barre reste verticale, « Recommandations » expose `white-space: nowrap`, la séparation avant « Trier » mesure 1 px et aucun panneau mobile n’est présent ;
- à 390 px, le panneau est fermé par défaut, aucun groupe radio n’est monté et son bouton expose `aria-expanded="false"` ; après ouverture, les quatre groupes sont présents et `aria-expanded` vaut `true` ;
- à zéro sélection, aucune action de suppression n’est présente ; sélectionner le premier ouvrage fait apparaître uniquement « 1 sélectionné — Supprimer ».

## Intervention — issue #20

- Outil : Claude Code.
- Fournisseur : Anthropic.
- Modèle : `claude-opus-5[1m]`.
- Périmètre : issue GitHub #20, bascule des coups de cœur sans incohérence.

### Demandes reçues

1. `/mattpocock-skills:implement https://github.com/MhaFADH/projet-sdv-react-native/issues/20 tu as accès à GitHub CLI pour lire le ticket`

### Actions réalisées avec l'IA

- lecture du ticket #20 par `gh issue view`, de la spécification parent, du découpage du lot, du contrat de l'API et de l'architecture livrée ;
- constat que le verrou de `useToggleBookReadStatus` vivait dans l'écran appelant et ne pouvait donc pas survivre à une navigation liste–fiche, et que son retour arrière restaurait des instantanés de pages entières ;
- remplacement de ce hook par une coordination unique montée à la racine, `BasculesProvider`, partagée par le fonds et la fiche pour les deux champs `favori` et `lu` ;
- passage de l'optimisme d'une écriture dans le cache à une superposition de l'intention au moment du rendu, ce qui supprime tout instantané de liste à restaurer et empêche une actualisation concurrente de masquer une intention en cours ;
- ajout test-first du domaine pur des bascules, du `PATCH` partiel générique `{ favori }` ou `{ lu }` et de la validation Zod de sa réponse ;
- ajout du cœur de rôle `switch` sur chaque ligne du fonds et sur la fiche, placé en frère du bouton d'ouverture et de la case de sélection ;
- extraction de la ligne du fonds, du détail de fiche, des types d'état du fonds et de l'avis d'échec partagé, pour respecter la limite de 250 lignes ;
- ajout des parcours de test du fonds, de la fiche et des deux vues montées ensemble, avec TanStack Query réel et transport simulé ;
- mise à jour du `README.md` et de `docs/ARCHITECTURE.md` ;
- exécution du formatage, du lint, du typage, des tests, de la couverture et d'une recette Chrome contre l'API en mode chaos.

### Défauts constatés et corrections réelles

- Les premiers parcours échouaient en lisant le résolveur de réponse différée juste après le clic : `mutateAsync` n'émet la requête qu'au micro-tic suivant. Les tests attendent désormais l'envoi réel du `PATCH` avant de le résoudre.
- La lecture du code de `MutationObserver` a montré que `mutate` retire l'observateur de la mutation précédente et écrase les rappels passés par appel : deux bascules simultanées sur deux ouvrages auraient perdu les rappels de la première. La coordination suit la promesse propre à chaque appel de `mutateAsync` plutôt que les rappels d'observateur.
- Le test de deux ouvrages terminant dans un ordre différent, l'un en succès et l'autre en échec, a confirmé que le retour arrière ne touche qu'un seul ouvrage.
- `components/books/fonds-view.tsx` dépassait 250 lignes après l'ajout des coups de cœur, sans être signalé par le lint. Ses types d'état ont été déplacés dans `components/books/etat-fonds.ts`.
- La duplication du fournisseur ajouté dans dix fichiers de test a fait dépasser la limite de lignes à `recherche-fonds.test.tsx`. L'enveloppe commune des parcours a été extraite dans `__tests__/outils-rendu.tsx`.
- La recette navigateur a montré qu'une bascule refusée pouvait rester en attente sans résultat ni erreur, le cœur figé sur son indicateur d'envoi. Le diagnostic a d'abord attribué ce blocage à la connectivité jugée absente ; la lecture du `retryer` de TanStack Query a montré que sa reprise exige aussi le focus du document, et que l'onglet piloté par l'automatisation était masqué. Le blocage observé venait donc de l'onglet en arrière-plan, pas d'un défaut rencontré par un libraire qui clique dans une fenêtre au premier plan.
- La condition de connectivité reste néanmoins réelle : une écriture refusée alors que la bibliothèque juge l'application hors ligne resterait en pause, verrou compris, sans erreur ni réessai. Les bascules déclarent `networkMode: 'always'`, couvert par un test qui force cet état. Le réglage reste limité à ce parcours : l'étendre aux autres écritures livrées relève du responsable.
- La revue Standards a relevé que trois composants importaient leur type d'avis depuis `features/`, alors que `components/` doit rester indépendant du store. Le type est passé dans `components/books/avis-echec-bascule.tsx` et le contexte l'importe désormais depuis la présentation ; `git grep '@/features' -- components/` ne renvoie plus rien.
- La même revue a relevé que le fournisseur assemblait lui-même les libellés d'erreur. Leur construction a rejoint `features/books/textes-bascule.ts`.
- La revue Spec a relevé qu'un cœur en cours d'envoi remplaçait son glyphe par l'indicateur, alors que le critère demande la ligne conservée « avec le cœur déjà modifié ». Le glyphe reste affiché et l'indicateur se superpose ; un test vérifie les deux et échoue avec l'ancienne version.
- La revue Spec a signalé un risque de faux positif : une erreur de fiche antérieure serait annoncée comme un échec d'actualisation. Le cas s'est révélé non reproductible, l'écriture confirmée étant inscrite dans le cache de la fiche avant l'invalidation, ce qui efface l'erreur précédente. La lecture d'erreur a tout de même été restreinte aux fiches réellement relues et le comportement est fixé par un test.
- La revue Spec a signalé que le réessai d'un refus contournait la garde du verrou. Le cas n'est pas atteignable, l'avis d'échec et l'envoi en cours étant exclusifs, mais le réessai passe désormais par la même garde que la bascule initiale.
- La scission du fichier de tests du fournisseur, imposée par la limite de lignes après ces ajouts, a fait apparaître une aide de test exportée sans consommateur, signalée par `knip` et rendue locale.

### Vérification navigateur

Réalisée avec Chrome piloté par le protocole MCP, contre `npx expo start --web` et l'API voisine lancée en mode chaos sur un port distinct, afin de ne pas interrompre le serveur du responsable :

- sous le filtre « Coups de cœur », chaque ligne porte un cœur actif et des ouvrages « Non lu » y figurent ;
- un clic retire le cœur immédiatement, avant la réponse, la ligne étant conservée pendant l'envoi avec son indicateur d'enregistrement ;
- après confirmation, la page est actualisée depuis le serveur et l'ouvrage quitte la liste filtrée ;
- avec un taux d'échec de 100 %, le cœur est restauré et la ligne affiche « Le coup de cœur précédent a été restauré. Le service est temporairement indisponible. Reessayez. » avec un bouton « Réessayer » ;
- l'échec de relecture du fonds reste affiché séparément, sous « Impossible d'actualiser le fonds », sans annoncer l'annulation d'une écriture confirmée ;
- le journal du serveur montre deux tentatives de `PATCH` pour un refus `503`, conformément à l'unique réessai temporisé.

## Intervention — issue #21

- Outil : pi coding agent.
- Fournisseur : OpenAI Codex.
- Modèle : `gpt-5.6-sol`.
- Périmètre : issue GitHub #21, recette du cahier enrichi et transmission du lot 2.

### Demande reçue

1. `<skill name="implement" location="/Users/fadhl/.pi/agent/skills/implement/SKILL.md">…</skill> https://github.com/MhaFADH/projet-sdv-react-native/issues/21, tu as accès à github cli`

### Actions réalisées avec l’IA

- lecture du ticket #21 et de ses dépendances avec GitHub CLI, du contrat de l’API, du cadrage du lot 2, des ADR, de l’architecture et de la recette du lot 1 ;
- exécution de la baseline de formatage, lint, typage, tests, couverture, code inutilisé et versions Expo ;
- recette nominale dans Chrome piloté par le protocole DevTools, avec deux ouvrages jetables supprimés en fin de parcours ;
- recette d’une réponse perdue sur l’ajout de note, sans rejeu et avec saisie conservée ;
- recette sur une copie temporaire de l’API en mode chaos sans authentification, avec 450 ms de latence et 100 % d’échecs pour rendre les restaurations observables ;
- recette de non-régression de la création, de la correction et de l’annulation des suppressions d’ouvrages du lot 1 ;
- vérification clavier des notes, de leurs reprises et du cœur, puis mesure des rôles, libellés, états, cibles de 44 points et du débordement du fonds et de la fiche à 390 × 760 ;
- lancement temporaire de React DevTools 6.1.5, comparaison des commits avant et après l’application de la recherche à 300 ms et conservation d’une preuve horodatée ;
- rédaction de `docs/RECETTE-LOT-2.md` et mise en cohérence du README, de l’architecture et des ADR 001 et 004.

### Défauts constatés et corrections réelles

- Aucun défaut applicatif n’a été observé pendant les parcours nominaux, dégradés ou de non-régression.
- L’ADR 001 décrivait encore la restauration par instantanés du ticket #6, alors que le ticket #20 l’a remplacée par une intention superposée et un verrou partagé. Son état d’implémentation a été actualisé pour les lots 1 et 2.
- L’ADR 004 parlait de la recréation d’une note « par son auteur », en contradiction avec son caractère collectif et l’absence d’attribution personnelle. La justification emploie désormais le vocabulaire du domaine.
- La première tentative d’automatisation clavier envoyait Entrée sans texte de touche au protocole DevTools ; le navigateur focalisait la commande sans produire de clic. La sonde temporaire a été corrigée avec `text` et `unmodifiedText`, puis les parcours ont été rejoués. Aucun changement applicatif n’en a découlé.
- La revue Spec a relevé que les reprises clavier, la fiche en petit écran et les durées du Profiler n’étaient pas suffisamment prouvées. Les parcours « Actualiser », renvoi averti et réessais de suppression et de cœur ont été rejoués au clavier à 390 × 760 ; une preuve JSON conserve désormais les horodatages et les commits du Profiler.
- Les deux revues relèvent que le visa croisé des deux personnes ne peut pas être remplacé par une exécution avec un seul agent. Cette limite reste déclarée, avec une matrice de répartition à faire valider par l’équipe.

### Vérification navigateur

Le détail, les conditions, les valeurs observées, les contrôles automatisés et les limites non vérifiées sont consignés dans [`docs/RECETTE-LOT-2.md`](docs/RECETTE-LOT-2.md). Les données jetables ont été nettoyées et tous les serveurs et outils temporaires ont été arrêtés.

