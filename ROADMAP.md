# État et étapes de développement

## Livré dans cette tranche

- Base Next.js / TypeScript existante conservée et complétée.
- Identité visuelle sombre cyan, violet et vert, responsive avec prise en compte de `prefers-reduced-motion`.
- Accueil, présentation du fondateur et de la communauté, liste et pages détaillées des huit branches.
- Pages distinctes Logiciels et Journal avec états vides explicites, sans contenu inventé.
- Interface de transfert sans compte prête pour Supabase Storage : bucket privé, jetons aléatoires, liens 24 h, plafond de 25 Mio, envoi signé, téléchargement signé et limites de fréquence.
- Écrans Supabase Auth pour inscription, vérification d’e-mail, connexion et récupération du mot de passe.
- Configuration manquante signalée proprement ; pages publiques utilisables sans projet Supabase.
- Schéma Supabase Auth pour les profils liés à `auth.users` et protégés par RLS.
- Documentation de prise en main, architecture, configuration, sécurité et déploiement.

## À vérifier pour les comptes

Confirmer les URL de redirection autorisées dans Supabase Auth et tester le parcours complet de confirmation d’adresse et de réinitialisation de mot de passe sur le domaine de production.

## Pas encore opérationnel

Le transfert sans compte n’est pas encore activé : le projet Supabase principal doit être configuré, la fonction Edge déployée et son nettoyage horaire programmé. Le plan gratuit a des quotas de stockage et de bande passante finis.

Administration et rôles personnalisés, publication et contenus, gestion réelle des logiciels, profils publics, bureau personnalisable, communauté, serveurs, messagerie, notifications, concours et attribution de points, boutique, recherche, événements, multimédia, éducation, IA, API, sauvegardes, PWA et statistiques. Les interfaces seront ajoutées seulement avec une source de données et les contrôles serveur correspondants.

## Prochaines phases conseillées

1. Vérifier les migrations et politiques RLS Supabase Auth avec plusieurs comptes de test.
2. Compléter le profil et les préférences de confidentialité avec RLS.
3. Créer la gestion de contenu logiciel protégée par rôle admin côté serveur.
4. Ajouter publications et commentaires avec règles d’accès par visibilité.
5. Étendre ensuite la communauté et la messagerie après validation du modèle de confidentialité.
