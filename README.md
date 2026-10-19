# Habibits

Une application de petits défis pour ancrer des habitudes. Chaque jour, on choisit un défi parmi trois, puis on le valide dans un calendrier. L'ambiance visuelle s'inspire du jeu *Blue Prince*.

Les données restent **sur le téléphone**, dans le navigateur : pas de compte, pas de serveur.

## Fonctionnalités actuelles

- **Calendrier** mensuel : une case par jour, avec le titre du défi choisi.
- **Tirage quotidien** en un clic, pour aujourd’hui ou demain : une carte facile, une moyenne et une difficile, puis choix d'un défi.
- **Collection** : après avoir validé un défi, on peut ajouter sa carte à sa collection. Les validations passées avant cette fonctionnalité ne sont pas ajoutées rétroactivement ; les doublons sont comptés, les cartes utilisent les informations actuelles du défi tant qu’il existe et conservent leur copie si le défi est supprimé. Chaque carte affiche son ID ; le tri par ID est sélectionné par défaut, avec des tris par date et difficulté et des filtres par difficulté.
- **Notes à moi-même** : après un défi non réussi, une note facultative peut être enregistrée et retrouvée avec la carte du défi.
- **Confirmations** : l'application demande de confirmer le choix d'une carte et la validation d'un défi.
- **Tirage de secours** : si une difficulté manque dans la liste, l'application recommande de créer un défi de ce niveau. On peut continuer ; les cartes manquantes sont alors tirées au hasard parmi les défis existants, en conservant leur difficulté réelle. Il faut au moins trois défis distincts pour tirer trois cartes.
- **Validation** : le défi du jour se valide depuis sa case (bouton « Valider le défi »).
- **Gestion des objectifs et des défis** : objectifs indépendants avec couleur, renommage et suppression sécurisée ; défis modifiables avec difficulté et date de création.
- **Tri et filtres** dans « Mes défis » : par date de création, par objectifs et par difficultés, avec sélection multiple.
- **À propos** : présentation de l'approche de Habibits et de sa raison d'être.
- **Stockage local** : défis, jours et réglage du rappel sont conservés dans le navigateur.
- **Rappel quotidien** : choix de l'heure et téléchargement d'un fichier `.ics` à importer dans l'appli Calendrier du téléphone, qui enverra la notification.
- **Données protégées** : demande de stockage persistant pour limiter le nettoyage automatique du navigateur.
- **Sauvegarde automatique** : copie des données dans un fichier choisi par l'utilisateur, avec l'API d'accès aux fichiers lorsqu'elle est disponible.
- **Export et restauration** : sauvegarde JSON partageable ou téléchargeable, et restauration depuis un fichier.
- **Menu latéral** dépliable : Calendrier, Mes défis, Collection, Notes à moi-même, puis Règles du jeu juste au-dessus des Paramètres.
- **Style « blueprint »** : fond bleu nuit, plan quadrillé, tuiles à bordure colorée, titres en majuscules condensées.
- **Web app installable (PWA)** : manifeste, icônes et service worker pour le fonctionnement hors connexion.

États d'une case du calendrier : bleu = vide, violet pointillé = trois défis tirés, orange = défi choisi, vert avec ✔ = défi validé, rouge avec × = défi non réussi. Un seul tirage est possible par jour ; les propositions sont conservées et ne sont pas retirées à chaque visite.

## Règles du calendrier

- Un tirage par jour, pour aujourd’hui ou demain, propose un défi facile, un moyen et un difficile ; les cartes restent disponibles après le tirage. Les autres dates ne créent aucune donnée de tirage.
- Si un niveau n'est pas représenté, un message conseille de créer un défi de cette difficulté et donne accès à « Mes défis ». Il est aussi possible de continuer : chaque carte manquante est alors tirée au hasard parmi les défis encore disponibles, sans modifier sa difficulté enregistrée.
- Trois défis distincts au minimum sont nécessaires. On choisit une seule carte par jour ; une confirmation est demandée avant chaque choix et validation. Un défi déjà choisi peut être validé ou marqué comme non réussi, y compris pour un jour passé.
- Il est impossible de tirer un défi pour un jour passé. Si un tirage existe déjà, on peut modifier le choix parmi les cartes tirées après avoir confirmé l’avertissement « Attention, c’est de la triche 😉 ». Une fois le défi validé ou marqué comme non réussi, le choix ne peut plus être modifié.
- Après validation, ajouter la carte à la collection est facultatif. Les cartes ajoutées plusieurs fois affichent leur nombre d’occurrences. Elles affichent les données actuelles du défi, sont triées par ID par défaut, et peuvent aussi être triées par date de création (récent/ancien) ou difficulté ; il est possible de filtrer par difficulté.
- En cas de défi non réussi, l’utilisateur peut enregistrer une note facultative. Les cartes de collection et les notes conservent une copie du défi pour rester visibles même si le défi original est supprimé. Les validations enregistrées avant cette fonctionnalité ne sont pas importées dans la collection.
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
  Collection.jsx        Collection des cartes de défis validés
  Notes.jsx             Notes à soi-même associées aux défis non réussis
  CarteDefiCollection.jsx Carte en lecture seule réutilisée par la collection et les notes
  Parametres.jsx        Rappel, stockage et gestion des sauvegardes
  Restauration.jsx      Choix et restauration d'une sauvegarde JSON
  Bandeaux.jsx          Indicateurs et messages de sauvegarde
  objectifs.js          Palette des objectifs et migration des données de défis
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

Les données principales sont enregistrées localement dans le navigateur, sous les clés `habibits.objectifs`, `habibits.defis`, `habibits.jours` et `habibits.rappel` :

- `objectifs` : liste indépendante `{ id, nom, couleur }`, permettant notamment les objectifs sans défi.
- `defis` : liste de défis `{ id, titre, description, image, objectifId, difficulte, dateCreation }`
- `jours` : un objet indexé par date, `"2026-10-16": { propositions: [ids], choisi: id, fait: false }`. Les nouvelles validations enregistrent `collectionProposable`, `collectionne`, `defiCopie` et `objectifCopie` ; les échecs enregistrent `nonReussi`, `note` et une copie du défi et de son objectif. Si le choix validé est modifié après confirmation, une carte déjà ajoutée à la collection est conservée dans `collectionHistorique`. Les anciens jours validés restent hors de la collection.
- `rappel` : `{ heure, minute }` (20 h 00 par défaut)

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

- [x] **Objectifs et défis** : objectifs personnalisables, difficulté (facile, moyen, difficile), date de création, tri et filtres multiples.
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
