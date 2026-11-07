# Architecture actuelle

- `src/app`: App Router Next.js ; pages d’accueil, services, présentation, catalogue, journal et DuckAuth.
- `src/components/site-shell.tsx`: navigation et pied de page responsive.
- `src/lib/services.ts`: registre typé des branches et de leurs statuts.
- `src/lib/supabase`: clients Supabase pour la base plateforme. L’architecture cible utilise Firebase Auth avec le jeton Firebase fourni au client Supabase.
- `src/components/auth`: connexion, inscription, récupération et synchronisation de profil Firebase.
- `supabase/setup.sql`: schéma cible Firebase UID + Supabase RLS, conversations, messages et pièces jointes.
- `supabase/platform/migrations`: schéma catalogue de logiciels.

Firebase Auth est le fournisseur d’identité. Supabase héberge les profils applicatifs, conversations, messages et pièces jointes avec RLS vérifiant l’issuer, l’audience et l’UID Firebase. Le transfert temporaire invité reste traité par la fonction Edge dédiée.

Les écrans de connexion, inscription (fermée par défaut) et récupération utilisent Firebase Auth. Le dashboard vérifie la session côté client; les données sensibles doivent rester dans les API Supabase protégées par RLS. La claim admin est vérifiée côté base par `public.is_duck_admin()`; aucune interface d’administration active n’est encore implémentée.
