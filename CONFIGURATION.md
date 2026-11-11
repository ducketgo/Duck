# Configuration DUCK

## Variables web

Configurer ces valeurs dans `.env.local` en développement et dans Vercel pour Production :

- `NEXT_PUBLIC_SUPABASE_URL`: URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clé `anon` ou publishable du projet.
- `NEXT_PUBLIC_APP_URL`: origine HTTPS publique, actuellement `https://duck2026.vercel.app`.
- `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED`: `true` pour ouvrir les inscriptions, `false` pour les fermer.

La clé publique Supabase est destinée au navigateur; elle ne remplace jamais une clé service-role. Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` ou `sb_secret_...` avec le préfixe `NEXT_PUBLIC_`.

## Supabase Auth

Dans le Dashboard Supabase, activer le fournisseur e-mail et la confirmation d’adresse. Dans **Authentication → URL Configuration**, définir l’URL du site sur `https://duck2026.vercel.app` et autoriser `https://duck2026.vercel.app/**` ainsi que `http://localhost:3000/**` pour le développement.

Le schéma de profils Supabase Auth est décrit dans [`supabase/duckauth/migrations/202611070001_initial_schema.sql`](supabase/duckauth/migrations/202611070001_initial_schema.sql). Le script racine [`supabase/setup.sql`](supabase/setup.sql) correspond à l’ancienne architecture Firebase et ne doit pas être exécuté pour cette version.

## Vercel

Le projet utilise le build Next.js natif, configuré dans [`vercel.json`](vercel.json). Après toute modification des variables de production, créer un nouveau déploiement pour les appliquer au build.

## Transfert invité

Le transfert invité reste indépendant de l’authentification. Son activation exige les migrations, la fonction Edge `guest-transfer`, les secrets Edge et une tâche de purge horaire. Ne définir `NEXT_PUBLIC_GUEST_TRANSFER_ENABLED=true` qu’après ces vérifications.
