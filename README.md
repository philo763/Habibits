# Habibits

Une application de petits défis pour ancrer des habitudes. Chaque jour, on choisit un défi parmi trois, puis on le valide dans un calendrier. L'ambiance visuelle s'inspire du jeu *Blue Prince*.

Les données restent **sur le téléphone** : pas de compte, pas de serveur.

## Fonctionnalités actuelles

- **Calendrier** mensuel : une case par jour, avec le titre du défi choisi.
- **Tirage de trois défis** parmi la liste, pour n'importe quel jour à venir, puis choix d'un défi.
- **Validation** : le défi du jour se valide depuis sa case (bouton « Valider le défi »).
- **Gestion des défis** : liste de départ, ajout et suppression depuis l'appli.
- **Stockage local** : défis, jours et réglages sont conservés sur l'appareil.
- **Rappel quotidien** : notification à l'heure choisie dans l'appli (version APK), avec un bouton de notification test.
- **Menu latéral** dépliable : Calendrier, Mes défis, Rappel.
- **Style « blueprint »** : fond bleu nuit, plan quadrillé, tuiles à bordure colorée, titres en majuscules condensées.
- **Web app installable (PWA)** : manifeste, icônes, service worker pour le fonctionnement hors connexion.

États d'une case du calendrier : bleu = vide, violet pointillé = trois défis tirés, orange = défi choisi, vert avec ✔ = défi validé.

## Stack technique

| Élément | Choix |
|---|---|
| Interface | React + Vite |
| Version Android | Capacitor (APK) |
| Stockage | `@capacitor/preferences` (stockage du téléphone, ou du navigateur sur le web) |
| Notifications | `@capacitor/local-notifications` (APK uniquement) |
| Web app installable | `vite-plugin-pwa` |
| Police | `@fontsource/barlow-condensed` (embarquée, fonctionne hors connexion) |

## Structure du projet

```
src/
  App.jsx               Écran principal, menu latéral, gestion des défis, réglage du rappel
  Calendrier.jsx        Calendrier, tirage, choix et validation
  storage.js            Lecture et écriture des défis, des jours et du rappel
  notifications.js      Rappel quotidien et notification test
  dates.js              Outils de dates et grille du mois
  data/defisDepart.js   Défis chargés au premier lancement
  index.css             Palette, styles et composants
public/                 Icônes de la web app
assets/                 Images sources pour l'icône de l'APK (facultatif)
android/                Projet Android généré par Capacitor
capacitor.config.json   Configuration Capacitor
vite.config.js          Configuration Vite et PWA
```

## Format des données

Clés enregistrées sur l'appareil :

- `defis` : liste de défis `{ id, titre, description, image }`
- `jours` : un objet indexé par date, `"2026-10-16": { propositions: [ids], choisi: id, fait: false }`
- `rappel` : `{ heure, minute }` (20 h 00 par défaut)

Au premier lancement, `defis` est rempli à partir de `src/data/defisDepart.js`.

## Prérequis 

- **Node.js** (version LTS)
- **VS Code** (conseillé)
- Pour l'APK : **Android Studio**, avec dans le SDK Manager une plateforme Android, *Android SDK Build-Tools* et *Android SDK Platform-Tools*

Points d'attention rencontrés :

- **PowerShell bloque `npm`** (« l'exécution de scripts est désactivée ») : lancer une fois
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, ou utiliser l'Invite de commandes.
- **Erreur « Incompatible Gradle JVM version »** : dans Android Studio, *Settings > Build, Execution, Deployment > Build Tools > Gradle*, choisir le JDK intégré (jbr-21). Gradle 8.14.3 ne fonctionne pas avec Java 25.
- **`local.properties`** (chemin du SDK) est propre à chaque ordinateur : Android Studio le recrée, il n'est pas versionné.

## Installation et développement

```
git clone <url-du-depot>
cd <dossier-du-depot>
npm install
npm run dev
```

L'appli s'ouvre sur `http://localhost:5173`. Penser à enregistrer les fichiers (ou activer l'enregistrement automatique de VS Code) pour voir les changements. Les notifications ne fonctionnent pas dans le navigateur.

## Deux sorties, un seul code

### 1. Web app (iPhone, Android, ordinateur)

```
npm run build
npm run preview
```

Le dossier `dist` est destiné à GitHub Pages. L'appli y vit dans un sous-dossier : la compilation doit définir l'adresse de base avec le nom du dépôt.

```
npx cross-env VITE_BASE=/<nom-du-depot>/ npm run build
```

Les utilisateurs ouvrent l'adresse une fois, puis l'ajoutent à l'écran d'accueil (Safari : *Partager > Sur l'écran d'accueil*). Le service worker doit être servi en HTTPS, ce que fait GitHub Pages.

### 2. APK Android

```
npm run build:android
npx cap open android
```

Dans Android Studio : *Build > Generate App Bundles or APKs > Generate APKs*. Le fichier se trouve dans `android/app/build/outputs/apk/debug/app-debug.apk`.

`build:android` compile **sans service worker** (variable `VITE_NATIF=1`) puis synchronise le projet Android. Ne pas utiliser `npm run build` pour l'APK.

#### Icône de l'APK (facultatif)

Placer `icon-only.png`, `icon-foreground.png` et `icon-background.png` dans `assets/`, puis :

```
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

## Mises à jour

- **Web app** : après publication, les utilisateurs récupèrent la nouvelle version automatiquement à leur prochaine ouverture. Le lien ne change pas, leurs données sont conservées.
- **APK** : aucune mise à jour automatique. Publier un nouvel APK (par exemple dans *Releases* sur GitHub) ; chaque utilisateur l'installe par-dessus l'ancien. Il faut pour cela :
  - la **même clé de signature** qu'avant (sinon Android refuse la mise à jour) ;
  - un **`versionCode` plus élevé** dans `android/app/build.gradle`.
- La web app et l'APK ont **chacune leur stockage** : les données ne se partagent pas entre les deux.
- Plusieurs versions de l'appli coexistent chez les utilisateurs : toute modification de la structure des données doit prévoir une migration (par exemple une fonction qui complète les anciens défis avec les nouvelles propriétés).

## Règles de collaboration

- Ne pas versionner : `node_modules`, `dist`, `android/local.properties`, ni **aucune clé de signature (keystore)**.
- La clé de signature est gardée par une seule personne.
- Ne pas lancer `npm audit fix --force` : les avertissements actuels concernent des outils de développement.

## Feuille de route (pas à jour)

- [ ] **Propriétés des défis** : catégorie (Sport rouge, Maison orange, Alimentation vert, Hydratation bleu, Esprit violet) et difficulté (facile, moyen, difficile), avec une couleur par catégorie.
- [ ] **Tirage adaptatif** : choisir deux jours de suite le défi facile augmente les chances de tirer des défis plus difficiles le lendemain.
- [ ] **Défi doré** : une fois complété, il valide le défi du jour J+5.
- [ ] **Arc-en-ciel** : valider chaque catégorie sur autant de jours consécutifs qu'il y a de catégories donne un prochain tirage entièrement doré.
- [ ] **Liens visuels** entre les jours consécutifs validés.
- [ ] **Illustrations** pour chaque défi (génération par IA, style commun, images légères).
- [ ] **Bonus et malus** façon jeu vidéo (règles à définir).
- [ ] **Export / import des données** au format JSON versionné (aussi pour changer de téléphone).
- [ ] **Rappel via le calendrier du téléphone** (fichier `.ics`) pour la web app, où les notifications programmées ne sont pas disponibles.
- [ ] Message « Nouvelle version disponible » dans la web app.

## Choix de conception

- Distribution **gratuite** : pas de compte payant Google Play ni Apple. Android via APK, iPhone via la web app.
- Une entrée dans le catalogue **F-Droid** reste possible : elle demande un dépôt public, une licence libre et des illustrations publiables sous licence libre.

## Licence

À définir.