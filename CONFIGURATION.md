# Configuration DUCK

## Authentification Firebase

DuckAuth s’appuie sur Firebase Authentication. Le Project ID `duckauth2026` et la configuration Web fournie sont dans `.env.local` (ignoré par Git); vérifie le Project ID dans Firebase Console avant déploiement. La configuration Web inclut `apiKey`, `authDomain`, `projectId`, `appId` et `messagingSenderId`.

Ces variables publiques vont dans `.env.local` et dans l’environnement de production :

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION`

`NEXT_PUBLIC_FIREBASE_SUPABASE_BRIDGE_ENABLED` reste `false` tant que le fournisseur Third-Party Auth Supabase, le schéma SQL et la callable function ne sont pas installés. `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED` reste `false` pour garder les inscriptions publiques fermées.

Ne jamais mettre une clé privée Firebase Admin, un compte de service ou un mot de passe dans une variable `NEXT_PUBLIC_*` ou dans Git.

## Hébergement statique GitHub Pages

L’application est exportée en fichiers statiques pour `https://duck.github.io/`. `NEXT_PUBLIC_APP_URL` doit valoir cette origine et `NEXT_PUBLIC_BASE_PATH` rester vide pour un dépôt nommé `duck.github.io`. Pour un site de projet, utiliser `NEXT_PUBLIC_BASE_PATH=/nom-du-depot`. Les variables sont injectées au build par `.github/workflows/deploy-pages.yml`.

## Firebase comme fournisseur d’identité pour Supabase

Dans le tableau de bord Supabase, activer **Authentication → Third-Party Auth → Firebase** et saisir le Project ID confirmé. Les requêtes Supabase depuis l’application doivent transmettre l’ID token Firebase au client Supabase via `accessToken`. Les jetons doivent porter la custom claim signée `role: "authenticated"`, attribuée côté serveur par Firebase Admin SDK; les règles RLS refusent les jetons qui ne la possèdent pas.

La Callable Function `firebase/functions/index.cjs` ajoute la claim après authentification et vérification de l’adresse; son déploiement requiert Firebase Blaze et un compte de facturation. Elle donne `admin: true` au compte `duckdev-service@protonmail.com` une fois vérifié.

`supabase/config.toml` contient la déclaration locale de l’intégration. Elle ne modifie pas toute seule les réglages du projet hébergé.

## Base Supabase

`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la clé publishable `sb_publishable_...` convient) pointent vers le projet de données DUCK. Le script [`supabase/setup.sql`](supabase/setup.sql) crée les profils DUCK liés aux UID Firebase, conversations, membres, messages, fonctions RLS et bucket privé de pièces jointes.

Les anciennes tables ne sont pas supprimées par le nouveau script. Le stockage invité garde le bucket `guest-transfers` et la fonction Edge `guest-transfer`; ses secrets et sa tâche de purge doivent être configurés séparément. Ne jamais exposer `service_role` / `sb_secret_...` dans le navigateur.

## Realtime Database Firebase

`firebase/database.rules.json` garde l’accès fermé par défaut et ne permet aux utilisateurs connectés de lire/modifier que leurs préférences `theme` et `language`. Les messages restent dans Supabase. Les règles peuvent être publiées avec Firebase CLI après vérification du projet : `firebase deploy --only database`.

Voir aussi [`firebase/README.md`](firebase/README.md) et [`supabase/SETUP.md`](supabase/SETUP.md).
