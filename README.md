# Drarkane Score

Compteur de scores PWA pour le jeu de société **Drarkane**.

L'application fonctionne entièrement côté client (aucune API) et utilise `localStorage` pour persister la partie en cours et l'historique des parties.

## Stack

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) (Dialog, Switch, ToggleGroup)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — installable sur mobile/desktop

## Scripts

```bash
npm install        # installer les dépendances
npm run dev        # démarrer le serveur de développement (http://localhost:5173)
npm run build      # build de production → dossier dist/
npm run preview    # prévisualiser le build de production
```

## Déploiement

L'application est déployée automatiquement sur [Vercel](https://vercel.com) à chaque push sur la branche `main`.

> URL de production : **[https://drarkane.vercel.app](https://drarkane.vercel.app)**
