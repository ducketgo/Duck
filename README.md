# DUCK

Plateforme web DUCK basée sur Next.js 15, React 19, TypeScript, Tailwind CSS 4, Firebase Authentication et Supabase pour les données, messages et fichiers.

## Démarrer en local

1. Installer Node.js 20 ou une version compatible avec Next.js 15.
2. Exécuter `npm install`.
3. Copier `.env.example` vers `.env.local`.
4. Renseigner les variables Firebase Web et Supabase décrites dans [CONFIGURATION.md](CONFIGURATION.md).
5. Exécuter `npm run dev` et ouvrir `http://localhost:3000`.

Les pages publiques restent accessibles sans configuration backend. Les écrans de connexion et de récupération utilisent Firebase Auth; les inscriptions restent désactivées par défaut. Les appels de données Supabase transmettent le jeton Firebase.

## Déploiement GitHub Pages

Le projet est exporté en site statique (`output: "export"`) et publié par le workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

1. Créer le dépôt `duck.github.io` sous le compte ou l’organisation GitHub `duck` (le nom exact du dépôt est obligatoire pour obtenir `https://duck.github.io/`).
2. Dans **Settings → Pages**, choisir **GitHub Actions** comme source.
3. Dans **Settings → Secrets and variables → Actions → Variables**, ajouter les valeurs publiques :
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, et les variables Firebase si elles diffèrent des valeurs par défaut du workflow.
4. Ajouter `duck.github.io` dans **Firebase Console → Authentication → Settings → Authorized domains**.
5. Pousser sur `main` : le workflow construit `out/` et le publie.

Le site étant statique, il ne faut pas de route serveur Next.js, de middleware ni de secrets `SUPABASE_SERVICE_ROLE_KEY` dans le build. Les appels Supabase utilisent le jeton Firebase côté navigateur et les règles RLS. Pour un dépôt de projet (`https://duck.github.io/duck/`), définir la variable `NEXT_PUBLIC_BASE_PATH=/duck`.

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

L’architecture utilise Firebase Auth et Supabase pour les messages et fichiers. Le déploiement de la fonction Firebase de claims, l’application du SQL Supabase et les interfaces de messagerie/administration restent à terminer. Voir [ROADMAP.md](ROADMAP.md).
