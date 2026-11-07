# Sécurité

## Pratiques en place

- Les secrets de service Supabase sont absents du client et exclus de Git.
- L’identité cible est Firebase Auth; les jetons Firebase doivent être validés par l’intégration Supabase Third-Party Auth.
- Firebase Auth gère connexion, vérification d’e-mail et réinitialisation; l’inscription publique reste désactivée par défaut.
- Les profils Firebase et messages utilisent des politiques RLS basées sur `sub`, `iss`, `aud` et `role`. Les claims privilégiées doivent venir de Firebase Admin SDK.
- Le catalogue public expose uniquement les lignes publiées par RLS et n’a pas de politique d’écriture client.

## Avant une ouverture publique

Configurer les fournisseurs et domaines d’e-mail Firebase. Définir et réviser les politiques de confidentialité, conditions d’utilisation et règles de modération. Mettre en place la protection contre les abus, une vérification administrateur fondée sur des claims définies par Firebase Admin SDK, la gestion des demandes d’export/suppression et un processus d’incident. Examiner chaque politique RLS et chaque migration avant déploiement.

Les erreurs d’authentification doivent rester génériques. Les parcours Firebase de connexion et récupération restent à implémenter.
