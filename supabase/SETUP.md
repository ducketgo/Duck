# DUCK backend : Supabase Auth + PostgreSQL

Supabase Auth gère les identités et les sessions; PostgreSQL stocke les profils. Le navigateur utilise uniquement l’URL du projet et sa clé `anon`/publishable. Les clés service-role ou `sb_secret_...` restent hors du client et de Git.

## Authentification et redirections

Dans Supabase Dashboard, activer le fournisseur e-mail et la confirmation d’adresse. Dans **Authentication → URL Configuration**, définir comme Site URL `https://duck-lac-two.vercel.app` et autoriser `https://duck-lac-two.vercel.app/**` ainsi que `http://localhost:3000/**`.

La production Vercel utilise `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED=true`. La variable `NEXT_PUBLIC_SUPABASE_URL` et la clé `NEXT_PUBLIC_SUPABASE_ANON_KEY` doivent être présentes dans l’environnement Production.

## Schéma de profils

Appliquer dans cet ordre au projet DuckAuth via SQL Editor :

1. [`duckauth/migrations/202611070001_initial_schema.sql`](duckauth/migrations/202611070001_initial_schema.sql) crée `public.profiles`, le déclencheur de création de profil à partir de `auth.users` et les politiques RLS basées sur `auth.uid()`.
2. [`duckauth/migrations/202611070002_founder_admin.sql`](duckauth/migrations/202611070002_founder_admin.sql) crée le contrôle admin et promeut le compte confirmé `duckdev-service@protonmail.com`.
3. [`duckauth/migrations/202611070003_admin_profile_management.sql`](duckauth/migrations/202611070003_admin_profile_management.sql) ajoute l’audit des changements et la RPC sécurisée de gestion des profils.
4. [`duckauth/migrations/202611070004_admin_action_log.sql`](duckauth/migrations/202611070004_admin_action_log.sql) ajoute le journal d’actions administrateur.
5. [`duckauth/migrations/202611070005_visual_site_editor.sql`](duckauth/migrations/202611070005_visual_site_editor.sql) active les réglages visuels publics, la sauvegarde admin uniquement et l’historique des publications.
6. [`duckauth/migrations/202611070006_duckadmin_founder_only.sql`](duckauth/migrations/202611070006_duckadmin_founder_only.sql) réserve DuckAdmin au compte fondateur confirmé `duckdev-service@protonmail.com`, y compris pour les sauvegardes SQL.
7. [`duckauth/migrations/202611080001_site_page_builder.sql`](duckauth/migrations/202611080001_site_page_builder.sql) active l’éditeur visuel sur toutes les pages : textes sélectionnés directement, blocs texte/bouton/téléchargement/image/vidéo, téléversement d’images et restrictions fondateur.

Les migrations 001 à 006 sont appliquées au projet Duck actuellement configuré. Appliquer la migration 007 pour activer la modification de contenu sur toutes les pages et le stockage d’images. Le DeskDuck personnel est accessible à chaque compte confirmé; DuckAdmin reste réservé au compte fondateur. Les membres ne peuvent pas modifier les métadonnées Auth gérées côté serveur.

`setup.sql` à la racine de ce dossier est un ancien script de l’architecture Firebase; ne pas l’exécuter pour cette version, car il configure des politiques et fonctions fondées sur Firebase UID.

## Transferts invités

Le transfert invité reste indépendant de Supabase Auth. Le bucket `guest-transfers` et l’Edge Function `supabase/functions/guest-transfer` nécessitent une configuration séparée. Définir `DUCK_APP_ORIGIN`, `GUEST_TRANSFER_IP_HASH_SECRET` et `GUEST_TRANSFER_CLEANUP_SECRET` comme secrets Edge et programmer l’action protégée `cleanup` au moins chaque heure. Garder `NEXT_PUBLIC_GUEST_TRANSFER_ENABLED=false` tant que ces étapes ne sont pas validées.
