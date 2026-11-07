# Sécurité

## Pratiques en place

- Supabase Auth gère les comptes, sessions, confirmations d’adresse et réinitialisations.
- Le navigateur utilise uniquement la clé Supabase `anon`/publishable; les secrets de service restent côté serveur ou dans les secrets Edge.
- Les profils sont isolés par RLS avec `auth.uid()`; le client ne peut pas modifier le rôle ni les points.
- Les erreurs d’authentification visibles restent génériques.

## Inscriptions publiques

Les inscriptions sont ouvertes sur Vercel via `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED=true`. Le fournisseur e-mail doit rester activé dans Supabase Auth et les URL de redirection doivent inclure le domaine de production. Ajouter une protection contre les abus et vérifier les limites d’envoi d’e-mails avant une campagne publique.

Les pages légales restent à relire et compléter. Examiner les migrations et politiques RLS avant toute évolution des données personnelles.
