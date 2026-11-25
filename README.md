# Habibits

Une application de petits défis pour ancrer des habitudes. Chaque jour, on choisit un défi parmi trois, puis on le valide dans un calendrier. L'ambiance visuelle s'inspire du jeu *Blue Prince*.

Les données restent **sur le téléphone**, dans le navigateur : pas de compte, pas de serveur.

## Fonctionnalités actuelles

- **Calendrier** mensuel : une case de taille fixe par jour ; un jour réussi affiche la difficulté de son défi (barres) dans la couleur de son objectif. Des portes relient deux jours réussis voisins, en ligne comme en colonne, à l'intérieur du mois.
- **Coups de poker** : les jours réussis qui se suivent forment des mains (paire, brelan, suite…), en ligne dans la semaine et en colonne d'une semaine à l'autre, et rapportent des objets.
- **Tirage quotidien** en un clic, pour aujourd’hui ou demain : une carte facile, une moyenne et une difficile, puis choix d'un défi.
- **Collection** : une collection de cartes à compléter, 2 cartes par ligne, rangées par numéro de carte. Chaque défi a un numéro fixe (#1, #2…). Une carte pas encore obtenue n'affiche que son numéro ; une carte obtenue est affichée en couleur, avec son nombre d'exemplaires sous la case s'il y en a plusieurs. Un clic sur une carte obtenue la montre en entier avec les dates où elle a été gagnée (de la plus récente à la plus ancienne, ⭐ pour un défi du moment). Une carte n'est obtenue que si on clique sur « Ajouter ma carte à la collection » après la validation, défi du moment compris (y compris pour une validation passée, depuis le calendrier). La carte d'un défi supprimé reste dans la collection, avec une texture de carte bloquée 🔒. Filtres par difficulté.
- **Mon Bibit** : une créature SVG en couches à personnaliser avec une couleur, un style de corps (les yeux pour le catalogue actuel) et un accessoire. Les sections Couleurs, Corps, Accessoires et Habibits sont partagées avec Le Shop ; Habibits affiche « À venir ».
- **Le Shop** : accessible depuis Mon Bibit, avec trois couleurs à 5 pommes chacune, deux styles d’yeux à 10 pommes chacun dans la catégorie Corps et deux accessoires à 15 pommes chacun. Les habits, les yeux spirales et le nœud ne sont plus proposés. Les achats sont définitifs, restent disponibles pour toujours et ne s’équipent pas automatiquement ; les personnalisations précédemment achetées restent conservées. Le solde disponible est nommé « Mes popommes ».
- **Notes à moi-même** : après un défi non réussi, une note facultative peut être enregistrée et retrouvée avec la carte du défi.
- **Confirmations** : l'application demande de confirmer le choix d'une carte et la validation d'un défi.
- **Tirage de secours** : si une difficulté manque dans la liste, l'application recommande de créer un défi de ce niveau. On peut continuer ; les cartes manquantes sont alors tirées au hasard parmi les défis existants, en conservant leur difficulté réelle. Il faut au moins trois défis distincts pour tirer trois cartes.
- **Validation** : le défi du jour se valide depuis sa case (bouton « Valider le défi »).
- **Gestion des objectifs et des défis** : objectifs indépendants avec couleur, renommage et suppression sécurisée ; défis modifiables avec difficulté et date de création.
- **Défi du moment** : depuis « Mes défis », un défi peut être épinglé à chaque tirage ; il remplace la carte aléatoire de sa difficulté et permet de régler un objectif hebdomadaire.
- **Récompenses** : une validation rapporte 💩 1 (facile), 💩 3 (moyen) ou 💩 5 (difficile) ; un défi non réussi rapporte un cœur bandé ❤️‍🩹. Chaque gain doit être confirmé dans une petite fenêtre. Chaque caca ou cœur bandé gagné rapporte aussi une pomme 🍎. Le calendrier et la Collection affichent les cacas et cœurs gagnés ; le solde de pommes après achats apparaît uniquement dans Le Shop sous le nom « Mes popommes ». Le défi du moment a un objectif hebdomadaire de 1 à 7 validations qui, s’il est atteint, double ses gains de la semaine sous forme de bonus.
- **Tri et filtres** dans « Mes défis » : par date de création, par objectifs et par difficultés, avec sélection multiple.
- **À propos** : présentation de l'approche de Habibits et de sa raison d'être.
- **Stockage local** : défis, jours et réglage du rappel sont conservés dans le navigateur.
- **Rappel quotidien** : choix de l'heure et téléchargement d'un fichier `.ics` à importer dans l'appli Calendrier du téléphone, qui enverra la notification.
- **Paramètres séparés en pages** : Rappel et Mes données.
- **Données protégées** : demande de stockage persistant pour limiter le nettoyage automatique du navigateur.
- **Sauvegarde automatique** : copie des données dans un fichier choisi par l'utilisateur, avec l'API d'accès aux fichiers lorsqu'elle est disponible.
- **Export et restauration** : sauvegarde JSON partageable ou téléchargeable, et restauration depuis un fichier.
- **Menu latéral** dépliable : Calendrier, Mes défis, Collection, Notes à moi-même, puis Règles du jeu juste au-dessus des Paramètres.
- **Style « blueprint »** : fond bleu nuit, plan quadrillé, tuiles à bordure colorée, titres en majuscules condensées.
- **Web app installable (PWA)** : manifeste, icônes et service worker pour le fonctionnement hors connexion.

États d'une case du calendrier : bleu = vide, 🤔 = trois défis tirés en attente de choix, bordure de la couleur de l'objectif = défi choisi, barres de difficulté = défi validé (⭐ en haut à droite pour le défi du moment), × ou 📝 = défi non réussi (avec ou sans note), 🪷 = jour de repos. Un seul tirage est possible par jour ; les propositions sont conservées et ne sont pas retirées à chaque visite.

## Règles du calendrier

- Un tirage par jour, pour aujourd’hui ou demain, propose un défi facile, un moyen et un difficile ; les cartes restent disponibles après le tirage. Si le défi du moment est activé, il remplace la carte aléatoire de sa difficulté. Les autres dates ne créent aucune donnée de tirage.
- Chaque validation rapporte 1, 3 ou 5 cacas selon la difficulté. Le bonus du défi du moment est attribué une fois par semaine calendaire (lundi-dimanche), dès que l’objectif défini est atteint ; il équivaut à la somme des gains de ce défi pour la semaine. Le seuil est celui enregistré à la première validation du défi dans la semaine.
- Coups de poker : chaque jour réussi est une carte (valeur = difficulté, couleur = objectif). Les mains se forment en ligne (une semaine du lundi au dimanche) et en colonne (le même jour de la semaine dans le mois) ; une carte compte dans les deux. Une main est limitée au mois. Un défi raté ou un jour sans défi réussi casse la série ; un jour de repos (Lotus) est neutre. Chaque main rapporte son objet dès qu'elle est atteinte, une fois par série (la paire : une Boule disco par paire). Le message de gain précise la main et son sens.
- Bascule des règles du poker (`DATE_BASCULE_POKER` dans `src/objets.js`, lundi 23 novembre 2026) : les semaines plus anciennes gardent l'ancienne règle (toute la semaine forme une main, sans trous ni coupure au mois) pour ne retirer aucun objet déjà gagné. Les colonnes s'appliquent à tout l'historique.
- Les achats dans Le Shop sont débités de Mes popommes, pas des cacas ou cœurs affichés dans le calendrier et la Collection. Chaque article disponible est achetable une seule fois et reste débloqué définitivement. Les anciennes récompenses sont converties à raison d’une pomme par caca et par cœur gagné, en déduisant les achats déjà effectués. Une validation corrigée peut faire passer le solde de popommes sous zéro ; les prochains gains le réduisent et les achats sont bloqués tant que le solde ne couvre pas leur prix.
- Si un niveau n'est pas représenté, un message conseille de créer un défi de cette difficulté et donne accès à « Mes défis ». Il est aussi possible de continuer : chaque carte manquante est alors tirée au hasard parmi les défis encore disponibles, sans modifier sa difficulté enregistrée.
- Trois défis distincts au minimum sont nécessaires. On choisit une seule carte par jour ; une confirmation est demandée avant chaque choix et validation. Un défi déjà choisi peut être validé ou marqué comme non réussi, y compris pour un jour passé.
- Il est impossible de tirer un défi pour un jour passé. Si un tirage existe déjà, on peut modifier le choix parmi les cartes tirées après avoir confirmé l’avertissement « Attention, c’est de la triche 😉 ». Une fois le défi validé ou marqué comme non réussi, le choix ne peut plus être modifié.
- Après validation, ajouter la carte à la collection est facultatif, y compris pour le défi du moment (ça ne change pas le décompte hebdomadaire du défi du moment). Chaque ajout compte comme un exemplaire de la carte. Les cartes affichent les données actuelles du défi et peuvent être filtrées par difficulté. Les défis du moment validés avant cette règle étaient ajoutés automatiquement : ils restent dans la collection.
- Une validation passée peut également être ajoutée à la collection depuis le calendrier tant qu’elle n’y figure pas déjà. En cas de défi non réussi, l’utilisateur peut enregistrer une note facultative. Les cartes de collection et les notes conservent une copie du défi pour rester visibles même si le défi original est supprimé.
- À la première ouverture de cette version, si des tirages ou défis choisis existent après demain, l’application explique leur suppression et attend une confirmation. L’utilisateur peut faire une capture d’écran avant de confirmer.

## Stack technique

| Élément | Choix |
|---|---|
| Interface | React + Vite |
| Stockage des données | `localStorage` |
| Sauvegarde automatique | File System Access API, lien de fichier conservé dans IndexedDB |
| Rappel | Fichier `.ics`, importé dans l'application Calendrier |
| Web app installable | `vite-plugin-pwa` |
| Police | `@fontsource/barlow-condensed` (embarquée, fonctionne hors connexion) |

## Structure du projet

```
src/
  App.jsx               Écran principal et navigation
  Accueil.jsx           Présentation et réglages de première utilisation
  Calendrier.jsx        Calendrier, tirage, choix et validation
  CaseCalendrier.jsx    Case du calendrier, réutilisée par les illustrations des règles
  Regles.jsx            Page des règles du jeu
  objets.js             Coups de poker (mains en ligne et en colonne) et objets
  recompenses.js        Calcul des cacas et des bonus hebdomadaires
  Collection.jsx        Collection de cartes à compléter (grille, détail d'une carte)
  MonBibit.jsx          Personnalisation de la créature
  ShopBibit.jsx         Boutique des personnalisations
  BibitIllustration.jsx Illustration SVG en couches du Bibit
  Notes.jsx             Notes à soi-même associées aux défis non réussis
  CarteDefiCollection.jsx Carte en lecture seule réutilisée par la collection et les notes
  Parametres.jsx        Sous-pages Rappel et Mes données
  Restauration.jsx      Choix et restauration d'une sauvegarde JSON
  Bandeaux.jsx          Indicateurs et messages de sauvegarde
  cartesCollection.js   Numéros de cartes, migration et cartes obtenues de la collection
  objectifs.js          Palette des objectifs et migration des données de défis
  data/bibitBoutique.js Catalogue, catégories et sauvegarde des personnalisations
  storage.js            Lecture et écriture des défis, des jours et du rappel
  sauvegarde.js         Export, restauration et sauvegarde automatique
  rappel.js             Création et téléchargement du fichier .ics
  dates.js              Outils de dates et grille du mois
  data/defisDepart.js   Défis chargés au premier lancement
  index.css             Palette, styles et composants
  sauvegarde.css        Styles des sauvegardes et messages associés
  pwa-assets.config.js  Configuration des icônes PWA
public/                 Icônes et favicon de la web app
.github/workflows/
  deploy.yml            Déploiement automatique sur GitHub Pages
vite.config.js          Configuration Vite et PWA
package.json            Dépendances et commandes npm
```

## Format des données

Les données principales sont enregistrées localement dans le navigateur, sous les clés `habibits.objectifs`, `habibits.defis`, `habibits.jours`, `habibits.rappel` et `habibits.gestion-defis` :

- `objectifs` : liste indépendante `{ id, nom, couleur }`, permettant notamment les objectifs sans défi.
- `defis` : liste de défis `{ id, numero, titre, description, image, objectifId, difficulte, dateCreation }`. `numero` est le numéro de carte de la collection : fixe, attribué à la création et jamais réutilisé, même après suppression (il est aussi gardé dans les copies du défi). Les défis sans numéro (anciennes données ou sauvegardes) sont numérotés au chargement par date de création, défis supprimés compris (`src/cartesCollection.js`).
- `jours` : un objet indexé par date, `"2026-10-16": { propositions: [ids], choisi: id, fait: false }`. Les nouvelles validations enregistrent `collectionProposable`, `collectionne`, `defiCopie` et `objectifCopie` ; les échecs enregistrent `nonReussi`, `note` et une copie du défi et de son objectif. Si le choix validé est modifié après confirmation, une carte déjà ajoutée à la collection est conservée dans `collectionHistorique`. Les anciens jours validés restent hors de la collection.
- `rappel` : `{ heure, minute }` (20 h 00 par défaut)
- `gestion-defis` : `{ defiDuMomentId, defiDuMomentActif, frequencesHebdo }`, configuration du défi garanti dans les tirages et de son objectif hebdomadaire. Cette configuration est incluse dans les sauvegardes et restaurations.
- `bibit` : `{ achats, equipe }`, achats définitifs et apparence équipée du Bibit. Les achats sont inclus dans les sauvegardes et restaurations ; les articles restent débloqués après changement d’appareil.
- Les jours validés après l’ajout des récompenses enregistrent leur gain `recompenseCaca`, ainsi que l’identifiant du défi du moment et l’objectif hebdomadaire utilisés pour calculer le bonus. Les anciens jours validés ne rapportent pas de cacas rétroactivement. Un jour marqué ensuite comme non réussi perd son gain et le bonus de sa semaine est recalculé.

Au premier lancement, `defis` est rempli à partir de `src/data/defisDepart.js`, qui comprend des défis faciles, moyens et difficiles afin de permettre le tirage complet dès le départ. Les trois objectifs initiaux Hydratation, Sport et Maison ont chacun une couleur distincte. Cette initialisation ne remplace pas les défis déjà enregistrés dans le navigateur. Le fichier de sauvegarde JSON contient ces données avec le nom de l'application, la version du format et la date d'export.

## Prérequis

- **Node.js 22** (utilisé par le déploiement GitHub Pages)
- **VS Code** (conseillé)

## Installation et développement

```
git clone <url-du-depot>
cd <dossier-du-depot>
npm install
npm run dev
```

L'appli s'ouvre sur `http://localhost:5173`. Pour vérifier le code avec Oxlint :

```
npm run lint
```

### Sauvegardes de test

Deux sauvegardes fictives, à la racine du dépôt, se restaurent depuis **Paramètres** :

- `sauvegarde-test-calendrier.json` : calendrier rempli du 1er août au 23 novembre 2026, pour tester l'affichage, les récompenses et les objets. 13 défis sur trois objectifs, plus un défi supprimé (#11, carte bloquée dans la collection), 90 jours réussis des trois difficultés (avec portes horizontales et verticales), 16 jours ratés avec et sans note, deux étoiles « défi du moment », 81 des 90 cartes gagnées ajoutées à la collection (dont les 2 défis du moment) et 3 défis récents jamais gagnés (#12 à #14, cartes manquantes), des objets utilisés (Lotus le 14/09, Chameau le 07/10, Fusée le 21/10, Boule disco le 26/08). Les récompenses sont calculées par l'appli : 283 cacas, 16 cœurs, 304 popommes et un sac bien rempli (dont 103 boules disco, 14 chameaux et 16 baguettes magiques avec les mains en colonne).
- `sauvegarde-test-tirage.json` : 8 défis, un jour réussi (10/11), un tirage sans choix (15/11) et un tirage avec défi choisi non validé (18/11), pour tester les tirages.

Les dates sont fixes (2026) : plus tard, navigue jusqu'aux mois concernés dans le calendrier pour les voir.

Ces fichiers servent uniquement aux tests en local. Ils ne sont pas dans `public/` et aucun code ne les importe : ils ne sont donc pas publiés avec l'appli et ne touchent jamais aux données des utilisateurs. Les restaurer remplace les données du navigateur utilisé : ne le fais pas dans l'appli où tu suis tes vrais défis.

## Build et publication

```
npm run build
npm run preview
```

Le build crée le dossier `dist`. Le déploiement GitHub Pages est automatique après un push sur `main` : le workflow définit `VITE_BASE=/Habibits/` pour que l'appli fonctionne dans le sous-dossier du dépôt. Pour un hébergement à la racine d'un domaine, la valeur par défaut `/` convient.

Sur téléphone, ouvre l'adresse publiée puis ajoute Habibits à l'écran d'accueil depuis le menu du navigateur. Le service worker est servi en HTTPS sur GitHub Pages.

## Mises à jour et données

- Après publication, les utilisateurs récupèrent la nouvelle version à l'ouverture de l'appli. Leurs données locales sont conservées.
- Chaque navigateur et chaque appareil a son propre stockage. Pour changer de téléphone ou garder une copie, exporte puis restaure un fichier JSON.
- Le stockage persistant réduit le risque de nettoyage automatique, mais ne protège pas contre l'effacement manuel des données du navigateur. La sauvegarde automatique dans un fichier n'est disponible que dans les navigateurs compatibles avec la File System Access API.
- Plusieurs versions de l'appli coexistent chez les utilisateurs : toute modification de la structure des données doit prévoir une migration.
- À la première ouverture après l'ajout des propriétés des défis, les dates absentes sont fixées à la date et l'heure de migration. Les catégories existantes deviennent des objectifs bleus et les défis leur sont associés ; une difficulté ou un objectif manquant est demandé à l'utilisateur avant qu'il puisse poursuivre. Les sauvegardes antérieures sont converties à leur restauration.

## Règles de collaboration

- Ne pas versionner `node_modules` ni `dist`.
- Garder les sauvegardes personnelles et autres données privées hors du dépôt.

## Feuille de route

- [x] **Mes objectifs** (objectifs et défis) : objectifs personnalisables, difficulté (facile, moyen, difficile), date de création, tri et filtres multiples.
- [ ] **Tirage adaptatif** : choisir deux jours de suite le défi facile augmente les chances de tirer des défis plus difficiles le lendemain.
- [ ] **Défi doré** : une fois complété, il valide le défi du jour J+5.
- [ ] **Arc-en-ciel** : valider chaque objectif sur autant de jours consécutifs qu'il y a d'objectifs donne un prochain tirage entièrement doré.
- [ ] **Liens visuels** entre les jours consécutifs validés.
- [ ] **Illustrations** pour chaque défi (génération par IA, style commun, images légères).
- [ ] **Bonus et malus** façon jeu vidéo (règles à définir).

## Choix de conception

- Application web gratuite et installable depuis le navigateur, sur téléphone ou ordinateur ; pas de compte payant ni de serveur.

## Licence

À définir.
