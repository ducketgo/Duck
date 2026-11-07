# Firebase DUCKAUTH

Le projet Firebase est déduit de l’URL fournie : `duckauth2026`, région RTDB `asia-southeast1`. Confirmer le Project ID dans Firebase Console avant déploiement. La configuration de l’application Web fournie est placée dans le fichier local ignoré `.env.local`.

- `database.rules.json` : règles Realtime Database. Elles limitent les préférences à leur propriétaire et ferment les autres chemins.
- `firebase.json` : associe le fichier des règles au déploiement CLI.
- `.firebaserc` à la racine : sélectionne le projet par défaut `duckauth2026`.
- `functions/index.cjs` : callable function sécurisée qui émet les claims nécessaires à Supabase.

Active les fournisseurs voulus sous **Authentication → Sign-in method**. Pour utiliser Firebase Auth avec Supabase, active ensuite l’intégration Firebase dans les paramètres d’authentification Supabase et attribue la custom claim `role: "authenticated"` côté serveur avec Firebase Admin SDK. Le compte admin doit aussi recevoir `admin: true` côté serveur. Ne crée pas ces claims depuis le navigateur.

La configuration Web (`apiKey`, `authDomain`, `projectId`, `appId`, `messagingSenderId`) est publique et sert à identifier l’application; ne la confonds pas avec une clé de compte de service. Ne partage pas de clé privée de compte de service.

Le déploiement de Cloud Functions nécessite le plan Blaze et un compte de facturation. Le code ne choisit ni n’active ce plan; ajoute des alertes budgétaires avant le déploiement.

Pour uniquement le compte fondateur, le script `functions/set-admin-claims.cjs` peut attribuer les claims via Firebase Admin SDK sur un poste connecté avec Application Default Credentials. Il exige `--accept-terms` et un e-mail déjà vérifié. L’accès Supabase reste bloqué par RLS tant que le compte n’a pas ces claims et que l’intégration Firebase est activée dans Supabase.
