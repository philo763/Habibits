# Habibits : consignes pour Claude

Appli React + Vite (PWA) ; les données sont dans le localStorage (préfixe `habibits.`). Le format des sauvegardes `.json` est dans `src/sauvegarde.js`. Le README décrit le projet en détail.

## Façon de travailler

- Toujours partir de la dernière version GitHub : `git pull origin main` sur `main` avant de commencer.
- Une branche par sujet, nommée `philo763-<sujet>`, puis une PR vers `main`. Merger avec un commit de merge, seulement sur demande.
- Échanges, commits et PR en français.
- Les objets du poker sont recalculés à partir de tout l'historique : un changement de règle peut retirer des objets déjà gagnés. Pour éviter ça, `DATE_BASCULE_POKER` (`src/objets.js`) doit être un lundi pas encore passé au moment du merge ; vérifier la date avant de merger un changement de ces règles.

## Sauvegardes de test

À la racine du dépôt (détail dans la section « Sauvegardes de test » du README) :

- `sauvegarde-test-calendrier.json` : 1er août → 23 novembre 2026 très rempli (difficultés, objectifs variés, portes, étoiles, jours ratés avec et sans note, objets gagnés et utilisés, titres longs ; 283 cacas, 16 cœurs, 304 popommes). À utiliser par défaut pour vérifier un changement.
- `sauvegarde-test-tirage.json` : cas de tirage (tirage sans choix, défi choisi non validé).

Pour les charger dans la preview (`npm run dev`), sans passer par le sélecteur de fichier, exécuter dans la page :

```js
localStorage.clear();
const m = await import('/src/sauvegarde.js');
const texte = await (await fetch('/sauvegarde-test-calendrier.json')).text();
const choix = await m.lireFichierChoisi(new File([texte], 'sauvegarde-test-calendrier.json'));
if (!choix.ok) throw new Error(choix.erreur);
await m.confirmerRestauration(choix, { continuerDansCeFichier: false });
m.ecrireAccueil({ termine: true });
location.reload();
```

Ce code passe par la vraie vérification et la vraie restauration de l'appli. Les dates sont fixes (2026) : plus tard, il faut naviguer jusqu'aux mois concernés.

Règles importantes :
- Ne charger une sauvegarde de test que dans la preview locale (localhost), jamais sur le site publié ni dans le navigateur où sont les vraies données.
- Ne jamais déplacer ces fichiers dans `public/` ni les importer dans le code : ils seraient publiés avec l'appli.
- Les données d'une sauvegarde de test doivent rester cohérentes avec les règles de l'appli (pas de valeurs forcées) : cacas, cœurs, popommes et objets sont recalculés à partir des jours.
- Si un changement de format des données rend ces fichiers invalides, les mettre à jour dans la même PR.
