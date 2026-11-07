# Déploiement

Le site DUCK est un export statique Next.js publié sur GitHub Pages à l’adresse `https://duck.github.io/`.

## Pré-requis GitHub

1. Le dépôt doit s’appeler exactement `duck.github.io` et appartenir au compte ou à l’organisation `duck`.
2. Dans **Settings → Pages**, la source doit être **GitHub Actions**.
3. Le workflow `.github/workflows/deploy-pages.yml` se déclenche sur chaque push vers `main` ou manuellement via **Actions → Deploy DUCK to GitHub Pages → Run workflow**.

## Variables GitHub Actions

Ajouter dans **Settings → Secrets and variables → Actions → Variables** :

| Variable | Exemple | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefghijklmnopqrst.supabase.co` | API Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | Clé publique Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://duck.github.io` | URL publique et métadonnées |
| `NEXT_PUBLIC_BASE_PATH` | vide | Vide pour un site utilisateur, `/duck` pour un site de projet |
| `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED` | `false` | Ouverture des inscriptions |
| `NEXT_PUBLIC_GUEST_TRANSFER_ENABLED` | `false` | Transfert sans compte |
| `NEXT_PUBLIC_FIREBASE_SUPABASE_BRIDGE_ENABLED` | `false` | Connexion Firebase → Supabase |

Les variables Firebase publiques ont des valeurs par défaut dans le workflow ; les surcharger uniquement si le projet Firebase change. Ne jamais ajouter `SUPABASE_SERVICE_ROLE_KEY` ni de clé privée Firebase dans les variables du build : elles seraient exposées dans le bundle navigateur.

## Configuration des services

1. **Firebase Auth** : ajouter `duck.github.io` dans **Authentication → Settings → Authorized domains**. Vérifier que le domaine d’action e-mail pointe vers une page autorisée.
2. **Supabase** : activer **Authentication → Third-Party Auth → Firebase** avec le Project ID `duckauth2026`, appliquer `supabase/setup.sql`, puis déployer la fonction Edge `guest-transfer` avec `DUCK_APP_ORIGIN=https://duck.github.io`.
3. **RLS** : les jetons Firebase doivent contenir la claim `role: authenticated`; elle est ajoutée par la Cloud Function `ensureSupabaseRole` ou par le script local de claims.
4. **CORS** : la fonction Edge n’accepte que les origines déclarées dans `DUCK_APP_ORIGIN`.

## Vérifications avant publication

1. `npm run type-check`
2. `npm run build` : l’export doit générer `out/index.html`, `out/404.html` et `out/.nojekyll`.
3. Tester les pages publiques, la connexion Firebase, la synchronisation du profil Supabase et le transfert invité depuis `https://duck.github.io/`.
4. Vérifier que les routes profondes (`/services/duckdev/`, `/auth/login/`) fonctionnent grâce à `trailingSlash: true`.

## Limites du site statique

GitHub Pages ne sert que des fichiers statiques. Le projet ne doit pas dépendre de routes API Next.js, de middleware, de cookies serveur ou de `server actions`. Les données sensibles restent protégées par Supabase RLS et les secrets restent dans les fonctions Edge/Cloud Functions, jamais dans le bundle.
