# DUCK backend : Firebase Auth + Supabase

Architecture de cette version : Firebase Authentication fournit l’identité; Supabase fournit PostgreSQL, Realtime et Storage. L’URL RTDB communiquée indique le projet Firebase `duckauth2026` (à vérifier dans Firebase Console). Les messages et fichiers de conversation sont prévus dans Supabase; Realtime Database ne reçoit que des préférences utilisateur facultatives.

## Installation SQL

Dans le projet Supabase `ytzxfldohlycyenmwjuo`, ouvrir **SQL Editor**, coller [`setup.sql`](setup.sql) et exécuter. Ce script réinitialise les objets PostgreSQL DUCK gérés (dont les anciennes tables `profiles` et `software`) et leurs données, puis recrée le schéma Firebase Auth, les règles RLS, Realtime et Storage. Il ne supprime pas `auth.users`, les autres données sans rapport avec DUCK, ni les fichiers déjà stockés dans les buckets. Pour effacer les fichiers, vide les buckets `duck-message-files` et `guest-transfers` via Storage dans le Dashboard avant d’exécuter le SQL. Vérifie les suppressions des tables DUCK avant lancement.

Le script suppose que l’intégration Firebase est activée sur le projet. Dans Supabase Dashboard, aller dans **Authentication → Sign In / Third-party Auth → Firebase**, puis saisir le Project ID `duckauth2026`. Le bloc `[auth.third_party.firebase]` de `config.toml` concerne la configuration CLI locale; il ne modifie pas à lui seul les paramètres du projet hébergé.

## Claims Firebase requis

Les jetons Firebase envoyés à Supabase doivent contenir `role: "authenticated"`. Ne définis jamais ces claims depuis le navigateur. L’application renouvelle le jeton avant d’appeler Supabase.

Pour le compte fondateur seul, après création/vérification de `duckdev-service@protonmail.com` dans Firebase Auth et acceptation des conditions, le script local `firebase/functions/set-admin-claims.cjs` attribue `role`, `admin`, et les claims de consentement avec Firebase Admin SDK. Il utilise Application Default Credentials et ne contient aucune clé privée. Pour les inscriptions publiques automatiques, déployer la callable function `ensureSupabaseRole` ci-dessous; celle-ci exige Firebase Cloud Functions sur Blaze avec compte de facturation. Configure alertes et plafonds avant d’activer ce plan.

Pour exécuter le script local : installer les dépendances dans `firebase/functions`, puis configurer Application Default Credentials avec un compte ayant accès au projet. Ne télécharge pas et ne commite pas de clé de compte de service. Exécuter ensuite :

```text
node firebase/functions/set-admin-claims.cjs --accept-terms
```

Le compte Firebase doit déjà exister et son adresse doit être vérifiée. Déconnecte-toi puis reconnecte-toi pour charger les claims dans un nouvel ID token.

Déployer depuis la racine après avoir installé/authentifié Firebase CLI et confirmé le projet :

```text
firebase deploy --only functions:ensureSupabaseRole
```

## Règles Realtime Database

Le projet fourni ne contient pas la configuration Web Firebase nécessaire au SDK de l’application. Le fichier [`../firebase/database.rules.json`](../firebase/database.rules.json) est prêt à être appliqué dans Firebase Console → Realtime Database → Rules, ou via Firebase CLI après vérification du projet :

```text
firebase deploy --only database
```

Les règles n’autorisent que les préférences `theme` et `language` du compte connecté. Tout autre chemin, y compris les messages, est fermé; les messages sont prévus dans Supabase.

## Transferts invités

Le bucket `guest-transfers` est privé et le transfert invité passe par l’Edge Function `supabase/functions/guest-transfer`. Déployer la fonction avec le CLI, puis définir `DUCK_APP_ORIGIN`, `GUEST_TRANSFER_IP_HASH_SECRET` et `GUEST_TRANSFER_CLEANUP_SECRET` comme secrets Edge. Programmer l’action protégée `cleanup` au moins chaque heure. Tester création, envoi, téléchargement, expiration et purge avant de définir `NEXT_PUBLIC_GUEST_TRANSFER_ENABLED=true`.

## Application web

La configuration Web reçue est placée dans `.env.local` et le SDK Firebase est installé. Les écrans d’authentification utilisent Firebase; le client Supabase transmet l’ID token Firebase via `accessToken`. Connexion et inscription restent fermées dans l’application tant que `NEXT_PUBLIC_FIREBASE_SUPABASE_BRIDGE_ENABLED=false`. Pour le seul compte fondateur, active le fournisseur Firebase, applique le SQL, crée et vérifie le compte Firebase, puis lance le script local de claims décrit ci-dessus; la Cloud Function n’est nécessaire que pour automatiser les nouveaux comptes. Garde `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED=false` jusqu’à l’ouverture voulue.
