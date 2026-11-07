# Déploiement

Le site DUCK est déployé sur Vercel avec le build Next.js natif. L’alias public actuel est `https://duck-lac-two.vercel.app`.

## Variables de production

Dans les paramètres Vercel du projet `duck`, configurer `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` et `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED`. Un nouveau build est nécessaire après toute modification de variable `NEXT_PUBLIC_*`.

Ne jamais ajouter une clé service-role ou une clé `sb_secret_...` à une variable `NEXT_PUBLIC_*`.

## Supabase Auth

Dans **Authentication → Providers**, activer le fournisseur e-mail et la confirmation d’adresse. Dans **Authentication → URL Configuration**, définir l’URL du site sur `https://duck-lac-two.vercel.app` et autoriser `https://duck-lac-two.vercel.app/**` ainsi que `http://localhost:3000/**`.

## Vérification

1. `npm run type-check`
2. `npm run build`
3. Vérifier la page d’inscription, la confirmation d’e-mail, la connexion, la réinitialisation du mot de passe et le dashboard.
4. Vérifier les routes profondes, notamment `/services/duckdev/` et `/auth/signup/`.
