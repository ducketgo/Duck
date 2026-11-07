import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mentions légales' };
const host = process.env.NEXT_PUBLIC_HOSTING_PROVIDER;

export default function LegalPage() {
  return <article className="wrap legal-page"><span className="section-kicker">INFORMATIONS LÉGALES</span><h1 className="page-title">Mentions légales</h1><div className="notice legal-notice">Version préparatoire du 7 novembre 2026. Les fonctions de compte et de transfert restent désactivées tant que leur configuration et les informations de publication ne sont pas finalisées.</div>
    <section><h2>Éditeur</h2><p>DUCK est un projet communautaire indépendant porté par Léopold Bonin, sous le nom de projet DuckDev. Il ne s’agit pas, à ce stade, d’une société. Contact : <a href="mailto:duckdev-service@protonmail.com">duckdev-service@protonmail.com</a>.</p><p>Adresse professionnelle de l’éditeur : à renseigner avant publication commerciale ou ouverture des services interactifs.</p></section>
    <section><h2>Hébergement</h2><p>{host ? `Hébergeur déclaré : ${host}.` : 'Le nom, l’adresse et les coordonnées de l’hébergeur sont à renseigner avant publication publique.'} Les régions des services Supabase ne sont pas encore configurées.</p></section>
    <section><h2>Propriété intellectuelle</h2><p>Les éléments du site sont présentés comme faisant partie du projet DUCK. Les droits de tiers sur les marques, bibliothèques et contenus cités restent ceux de leurs titulaires respectifs.</p></section>
    <section><h2>Contact</h2><p>Pour toute question concernant le site : <a href="mailto:duckdev-service@protonmail.com">duckdev-service@protonmail.com</a>.</p></section>
  </article>;
}
