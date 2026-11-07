# Architecture actuelle

- `src/app`: App Router Next.js déployé sur Vercel.
- `src/components/site-shell.tsx`: navigation et pied de page responsive; l’inscription publique dépend de `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED`.
- `src/components/auth`: inscription, connexion et récupération du mot de passe avec Supabase Auth.
- `src/lib/supabase`: client navigateur Supabase et configuration publique.
- `src/app/dashboard`: session Supabase Auth et rôle de profil lu dans `public.profiles`.
- `supabase/duckauth/migrations`: profil créé à partir de `auth.users`, avec politiques RLS basées sur `auth.uid()`.
- `supabase/functions/guest-transfer`: traitement du transfert invité.

Supabase Auth gère les identités, sessions, confirmations d’adresse et liens de récupération. PostgreSQL héberge les profils et applique les règles RLS. Les clés `anon`/publishable sont publiques; aucune clé service-role ne doit être incluse au bundle navigateur.

Les dossiers Firebase restants sont des éléments hérités et ne sont pas importés par l’application web.
