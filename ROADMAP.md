# État et étapes de développement

## Livré dans cette tranche

- Base Next.js / TypeScript existante conservée et complétée.
- Identité visuelle sombre cyan, violet et vert, responsive avec prise en compte de `prefers-reduced-motion`.
- Accueil, présentation du fondateur et de la communauté, liste et pages détaillées des huit branches.
- Pages distinctes Logiciels et Journal avec états vides explicites, sans contenu inventé.
- Interface de transfert sans compte prête pour Supabase Storage : bucket privé, jetons aléatoires, liens 24 h, plafond de 25 Mio, envoi signé, téléchargement signé et limites de fréquence.
- Écrans Firebase Auth pour connexion, inscription avec vérification d’e-mail et récupération du mot de passe.
- Callable Firebase pour claims `authenticated` et `admin`, à déployer avec le plan requis.
- Configuration manquante signalée proprement ; pages publiques utilisables sans projet Supabase.
- Schéma cible Supabase pour les profils liés à Firebase, conversations, messages et pièces jointes protégés par RLS.
- Documentation de prise en main, architecture, configuration, sécurité et déploiement.

## À configurer pour activer Firebase Auth

Confirmer le Project ID Firebase, activer les fournisseurs, connecter Firebase comme fournisseur Third-Party Auth dans Supabase et déployer la fonction serveur qui émet les claims requises.

## Pas encore opérationnel

Le transfert sans compte n’est pas encore activé : le projet Supabase principal doit être configuré, la fonction Edge déployée et son nettoyage horaire programmé. Le plan gratuit a des quotas de stockage et de bande passante finis.

Administration et rôles personnalisés, publication et contenus, gestion réelle des logiciels, profils publics, bureau personnalisable, communauté, serveurs, messagerie, notifications, concours et attribution de points, boutique, recherche, événements, multimédia, éducation, IA, API, sauvegardes, PWA et statistiques. Les interfaces seront ajoutées seulement avec une source de données et les contrôles serveur correspondants.

## Prochaines phases conseillées

1. Déployer la fonction Firebase claims, appliquer `supabase/setup.sql`, puis vérifier les politiques RLS avec Firebase.
2. Compléter le profil et les préférences de confidentialité avec RLS.
3. Créer la gestion de contenu logiciel protégée par rôle admin côté serveur.
4. Ajouter publications et commentaires avec règles d’accès par visibilité.
5. Étendre ensuite la communauté et la messagerie après validation du modèle de confidentialité.
