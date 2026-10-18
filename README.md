# Habibits

Une application de petits défis pour ancrer des habitudes. Chaque jour, on choisit un défi parmi trois, puis on le valide dans un calendrier. L'ambiance visuelle s'inspire du jeu *Blue Prince*.

Les données restent **sur le téléphone**, dans le navigateur : pas de compte, pas de serveur.

## Fonctionnalités actuelles

- **Calendrier** mensuel : une case par jour, avec le titre du défi choisi.
- **Tirage de trois défis** parmi la liste, pour n'importe quel jour à venir, puis choix d'un défi.
- **Validation** : le défi du jour se valide depuis sa case (bouton « Valider le défi »).
- **Gestion des objectifs et des défis** : objectifs indépendants avec couleur, renommage et suppression sécurisée ; défis modifiables avec difficulté et date de création.
- **Tri et filtres** dans « Mes défis » : par date de création, par objectifs et par difficultés, avec sélection multiple.
- **À propos** : présentation de l'approche de Habibits et de sa raison d'être.
- **Stockage local** : défis, jours et réglage du rappel sont conservés dans le navigateur.
- **Rappel quotidien** : choix de l'heure et téléchargement d'un fichier `.ics` à importer dans l'appli Calendrier du téléphone, qui enverra la notification.
- **Données protégées** : demande de stockage persistant pour limiter le nettoyage automatique du navigateur.
- **Sauvegarde automatique** : copie des données dans un fichier choisi par l'utilisateur, avec l'API d'accès aux fichiers lorsqu'elle est disponible.
- **Export et restauration** : sauvegarde JSON partageable ou téléchargeable, et restauration depuis un fichier.
- **Menu latéral** dépliable : Calendrier, Mes défis, Paramètres.
- **Style « blueprint »** : fond bleu nuit, plan quadrillé, tuiles à bordure colorée, titres en majuscules condensées.
- **Web app installable (PWA)** : manifeste, icônes et service worker pour le fonctionnement hors connexion.

États d'une case du calendrier : bleu = vide, violet pointillé = trois défis tirés, orange = défi choisi, vert avec ✔ = défi validé.

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
- `jours` : un objet indexé par date, `"2026-10-16": { propositions: [ids], choisi: id, fait: false }`
- `rappel` : `{ heure, minute }` (20 h 00 par défaut)

Au premier lancement, `defis` est rempli à partir de `src/data/defisDepart.js`. Le fichier de sauvegarde JSON contient ces données avec le nom de l'application, la version du format et la date d'export.

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
