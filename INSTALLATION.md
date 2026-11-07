# Installation

## Prérequis

- Node.js 20+
- npm 10+
- Accès à deux projets Supabase séparés si l’authentification et les données du site doivent être activées

## Environnement local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Ouvrir `http://localhost:3000`. Sans configuration DuckAuth, les pages publiques fonctionnent ; les formulaires d’authentification expliquent que le service n’est pas configuré.

## Vérification locale

```powershell
npm run type-check
npm run build
```

Le dépôt n’a pas encore de suite de tests applicatifs.
