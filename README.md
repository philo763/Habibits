# Habibits

## Développement Local

1. **Installer Node.js** depuis [nodejs.org](https://nodejs.org) (version LTS).
2. **Installer les dépendances :** `npm install`
3. **Compiler le projet :** `npm run build`
4. **Lancer le serveur de dev :** `npm run dev`

## React + Vite

Ce modèle fournit une configuration minimale pour faire fonctionner React dans Vite avec le rechargement à chaud (HMR) et quelques règles Oxlint.

Actuellement, deux plugins officiels sont disponibles :

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) utilise [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) utilise [SWC](https://swc.rs/)

### Compilateur React

Le compilateur React n'est pas activé sur ce modèle en raison de son impact sur les performances de développement et de build. Pour l'ajouter, consultez [cette documentation](https://react.dev/learn/react-compiler/installation).

### Étendre la configuration Oxlint

Si vous développez une application de production, nous vous recommandons d'utiliser TypeScript avec des règles de linter basées sur les types (type-aware). Consultez le [modèle TS (TypeScript)](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) pour savoir comment intégrer TypeScript et les règles Oxlint associées à TypeScript dans votre projet.
