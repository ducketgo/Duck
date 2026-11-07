import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
export const metadata: Metadata = { title: 'Journal' };
export default function JournalPage() { return <div className="wrap page-wrap"><span className="section-kicker">ACTUALITÉS DU PROJET</span><h1 className="page-title">Le journal<br/><span>DUCK.</span></h1><p className="page-lede">Les annonces officielles et les nouvelles du projet seront publiées ici dès que le système éditorial sera en place.</p><div className="empty-state"><Newspaper size={30}/><h2>Pas encore d’actualité publiée.</h2><p>Nous afficherons ici les nouvelles vérifiées de l’écosystème, sans inventer de statistiques ni d’annonces.</p></div></div> }
