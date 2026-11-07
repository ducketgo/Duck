# Préparation de publication DUCK

## État

Le site public et son build de production peuvent être préparés avec la configuration actuelle. Les parcours authentifiés et le transfert temporaire sont fermés par défaut. Cette préparation ne constitue ni un déploiement ni une validation juridique.

## Avant publication du site

- [ ] Choisir le domaine et l’hébergeur, puis renseigner leur identité et coordonnées dans les mentions légales.
- [ ] Renseigner `NEXT_PUBLIC_APP_URL` avec l’origine HTTPS publique.
- [ ] Vérifier l’adresse de contact et publier l’adresse requise de l’éditeur.
- [ ] Faire relire les pages légales, notamment le statut de l’éditeur et les obligations françaises applicables.
- [ ] Configurer TLS, domaine, surveillance et procédure de retour arrière chez l’hébergeur.

## Avant activation des comptes Firebase

- [ ] Confirmer le Project ID Firebase, terminer la configuration Web et activer les fournisseurs d’authentification voulus.
- [ ] Activer Firebase comme Third-Party Auth provider dans le projet Supabase.
- [ ] Mettre en place côté serveur les claims `role: authenticated` et `admin: true` pour les utilisateurs concernés.
- [ ] Déployer et tester `firebase/database.rules.json`.
- [ ] Renseigner les paramètres Web Firebase et les clés publiques Supabase en production.
- [ ] Définir l’âge minimum et les règles applicables aux mineurs.
- [ ] Finaliser les durées de conservation, l’entité contractante, la localisation, les transferts et les journaux du fournisseur.
- [ ] Ouvrir les inscriptions uniquement en définissant `NEXT_PUBLIC_DUCK_REGISTRATION_ENABLED=true` après revue.

## Avant activation des messages et transferts

- [ ] Appliquer `supabase/setup.sql` au projet de données Supabase et tester les politiques RLS avec des jetons Firebase.
- [ ] Déployer `supabase/functions/guest-transfer` et définir `DUCK_APP_ORIGIN`, `GUEST_TRANSFER_IP_HASH_SECRET` et `GUEST_TRANSFER_CLEANUP_SECRET` comme secrets Edge Function.
- [ ] Programmer l’appel protégé `cleanup` au moins une fois par heure et vérifier suppression des objets expirés et empreintes de limitation.
- [ ] Vérifier limites de taille, accès signés, CORS, quotas, politique d’abus et coût du stockage/bande passante.
- [ ] Renseigner la conservation des logs et les destinataires dans la politique de confidentialité.

## Version initiale

Les pages de présentation peuvent être publiées une fois les informations d’éditeur/hébergeur complétées. Les fonctions de compte et transfert doivent rester fermées jusqu’à la fin des étapes ci-dessus.
