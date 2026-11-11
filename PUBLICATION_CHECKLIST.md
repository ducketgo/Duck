# Préparation de publication DUCK

## État

Le site est publié sur Vercel et les inscriptions publiques sont activées. Vérifier la confirmation d’adresse et les URL de redirection Supabase avant de promouvoir largement le service. Cette publication ne constitue pas une validation juridique.

## Avant publication du site

- [ ] Choisir le domaine et l’hébergeur, puis renseigner leur identité et coordonnées dans les mentions légales.
- [ ] Renseigner `NEXT_PUBLIC_APP_URL` avec l’origine HTTPS publique.
- [ ] Vérifier l’adresse de contact et publier l’adresse requise de l’éditeur.
- [ ] Faire relire les pages légales, notamment le statut de l’éditeur et les obligations françaises applicables.
- [ ] Configurer TLS, domaine, surveillance et procédure de retour arrière chez l’hébergeur.

## Vérification Supabase Auth

- [ ] Confirmer l’activation du fournisseur e-mail et de la confirmation d’adresse dans Supabase Auth.
- [ ] Ajouter `https://duck2026.vercel.app/**` aux URL de redirection autorisées.
- [ ] Appliquer et vérifier la migration `supabase/duckauth/migrations/202611070001_initial_schema.sql`.
- [ ] Tester création de compte, e-mail de confirmation, connexion et réinitialisation de mot de passe.
- [ ] Définir l’âge minimum et les règles applicables aux mineurs.
- [ ] Finaliser les durées de conservation, l’entité contractante, la localisation, les transferts et les journaux du fournisseur.

## Avant activation des messages et transferts

- [ ] Vérifier les politiques RLS de Supabase Auth avec plusieurs comptes de test.
- [ ] Déployer `supabase/functions/guest-transfer` et définir `DUCK_APP_ORIGIN`, `GUEST_TRANSFER_IP_HASH_SECRET` et `GUEST_TRANSFER_CLEANUP_SECRET` comme secrets Edge Function.
- [ ] Programmer l’appel protégé `cleanup` au moins une fois par heure et vérifier suppression des objets expirés et empreintes de limitation.
- [ ] Vérifier limites de taille, accès signés, CORS, quotas, politique d’abus et coût du stockage/bande passante.
- [ ] Renseigner la conservation des logs et les destinataires dans la politique de confidentialité.

## Version initiale

Le transfert sans compte reste fermé jusqu’à la fin des étapes ci-dessus.
