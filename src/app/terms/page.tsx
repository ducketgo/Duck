import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Conditions d’utilisation' };

export default function TermsPage() {
  return <article className="wrap legal-page"><span className="section-kicker">CADRE D’UTILISATION</span><h1 className="page-title">Conditions d’utilisation</h1><div className="notice legal-notice">Version préparatoire du 7 novembre 2026. Les comptes et transferts ne sont pas ouverts au public. Ces conditions doivent être revues et complétées avant leur activation.</div>
    <section><h2>Le projet</h2><p>DUCK est un projet communautaire indépendant porté par Léopold Bonin (DuckDev). Le site présente des ressources et services en cours de préparation. Les fonctions peuvent évoluer avant leur ouverture.</p></section>
    <section><h2>Utilisation des services</h2><p>Lorsque les comptes seront activés, l’utilisateur devra fournir des informations exactes, protéger ses identifiants et ne pas utiliser le service à des fins illicites ou pour porter atteinte aux droits d’autrui. Les règles d’âge et de supervision parentale seront publiées avant l’ouverture des comptes.</p></section>
    <section><h2>Transfert temporaire</h2><p>Le service envisagé permettra de partager un fichier sans compte, dans la limite de 25 Mio par fichier. Le lien est une clé d’accès : toute personne qui le reçoit peut télécharger le fichier tant que le transfert est valide. Le partage expire après 24 heures et n’est pas chiffré de bout en bout. Ne partagez pas de données sensibles ou confidentielles.</p></section>
    <section><h2>Contenus et disponibilité</h2><p>Chaque utilisateur reste responsable des contenus qu’il transmet ou publie et doit disposer des droits nécessaires. Les services sont fournis gratuitement pendant cette phase de lancement, sans garantie de disponibilité continue. Les règles de modération, de signalement et de suspension seront précisées avant l’ouverture des fonctions communautaires.</p></section>
    <section><h2>Contact et évolution</h2><p>Pour toute question : <a href="mailto:duckdev-service@protonmail.com">duckdev-service@protonmail.com</a>. Une version datée des conditions sera affichée lors de leur mise à jour.</p></section>
  </article>;
}
