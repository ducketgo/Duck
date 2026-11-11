# DUCK

Plateforme web DUCK basée sur Next.js 15, React 19, TypeScript, Tailwind CSS 4 et Supabase Auth.

## Démarrer en local

1. Installer Node.js 20 ou une version compatible avec Next.js 15.
2. Exécuter `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Renseigner `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
5. Exécuter `npm run dev` et ouvrir `http://localhost:3000`.

La connexion, l’inscription, la vérification d’adresse et la récupération de mot de passe utilisent Supabase Auth. Les inscriptions sont activées en production via `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED=true`.

## Déploiement Vercel

Le projet utilise le build Next.js natif de Vercel. Le domaine de production actuel est `https://duck2026.vercel.app`.

Configurer ces variables dans Vercel pour Production : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` et `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED`.

Dans Supabase Auth, activer le fournisseur e-mail, définir l’URL du site et autoriser les redirections vers `https://duck2026.vercel.app/**` et `http://localhost:3000/**`. Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` ou une clé `sb_secret_...` dans une variable `NEXT_PUBLIC_*`.

## Documentation

- [Installation](INSTALLATION.md)
- [Configuration](CONFIGURATION.md)
- [Architecture](ARCHITECTURE.md)
- [Sécurité](SECURITY.md)
- [Déploiement](DEPLOYMENT.md)
- [Checklist de publication](PUBLICATION_CHECKLIST.md)
- [État du produit et périmètre](ROADMAP.md)

La page `/transfer` prépare le partage temporaire sans compte. Son activation exige le projet Supabase principal, ses migrations, la fonction Edge et les secrets décrits dans [CONFIGURATION.md](CONFIGURATION.md). Sans configuration, le formulaire explique que le service est désactivé.

Les pages `/legal`, `/privacy` et `/terms` sont des versions préparatoires. Compléter les champs éditeur/hébergeur et confirmer les fournisseurs/régions et règles d’âge avant d’ouvrir les fonctions interactives. Voir la [checklist de publication](PUBLICATION_CHECKLIST.md).

## État

L’application web utilise Supabase Auth et Supabase PostgreSQL. Les anciens fichiers d’infrastructure Firebase présents dans le dépôt ne sont pas utilisés par le site. Voir [ROADMAP.md](ROADMAP.md).
